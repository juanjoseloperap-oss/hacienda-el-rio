const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(), async (_, res) => {
  const { rows } = await db.query('SELECT * FROM supplies ORDER BY item_name');
  res.json(rows);
});

router.post('/', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const { item_name, unit, current_stock, reorder_level, unit_cost, item_type } = req.body;
  const { rows } = await db.query(`INSERT INTO supplies
    (item_name, unit, current_stock, reorder_level, unit_cost, item_type)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [item_name, unit, current_stock, reorder_level, unit_cost || 0, item_type]);
  await audit(req.user.id, 'create', 'supply', rows[0].id, rows[0]);
  res.status(201).json(rows[0]);
});

module.exports = router;
