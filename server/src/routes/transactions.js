const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(), async (_, res) => {
  const { rows } = await db.query('SELECT * FROM transactions ORDER BY transaction_date DESC LIMIT 100');
  res.json(rows);
});

router.post('/', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const { transaction_type, animal_code, quantity, unit_price, total_amount, transaction_date, counterpart, notes } = req.body;
  const { rows } = await db.query(`INSERT INTO transactions
    (transaction_type, animal_code, quantity, unit_price, total_amount, transaction_date, counterpart, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [transaction_type, animal_code || null, quantity || 1, unit_price || 0, total_amount || 0, transaction_date, counterpart || null, notes || null]);
  if (transaction_type === 'sale' && animal_code) {
    await db.query(`UPDATE animals SET status='sold' WHERE animal_code=$1`, [animal_code]);
  }
  if (transaction_type === 'purchase' && animal_code) {
    await db.query(`UPDATE animals SET status='active' WHERE animal_code=$1`, [animal_code]);
  }
  await audit(req.user.id, 'create', 'transaction', rows[0].id, rows[0]);
  res.status(201).json(rows[0]);
});

module.exports = router;
