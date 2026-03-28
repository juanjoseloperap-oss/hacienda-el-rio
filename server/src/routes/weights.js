const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(), async (_, res) => {
  const { rows } = await db.query(`SELECT id, animal_code, weight_kg, average_daily_gain, weighed_at, notes
    FROM weights ORDER BY weighed_at DESC LIMIT 100`);
  res.json(rows);
});

router.post('/', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const { animal_code, weight_kg, weighed_at, notes } = req.body;
  const prev = await db.query(`SELECT weight_kg, weighed_at FROM weights WHERE animal_code=$1 ORDER BY weighed_at DESC LIMIT 1`, [animal_code]);
  let adg = null;
  if (prev.rows[0]) {
    const days = Math.max(1, Math.round((new Date(weighed_at) - new Date(prev.rows[0].weighed_at)) / 86400000));
    adg = Number(((weight_kg - prev.rows[0].weight_kg) / days).toFixed(3));
  }
  const { rows } = await db.query(`INSERT INTO weights (animal_code, weight_kg, average_daily_gain, weighed_at, notes)
    VALUES ($1,$2,$3,$4,$5) RETURNING *`, [animal_code, weight_kg, adg, weighed_at, notes || null]);
  await audit(req.user.id, 'create', 'weight', rows[0].id, rows[0]);
  res.status(201).json(rows[0]);
});

module.exports = router;
