const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(), async (_, res) => {
  const { rows } = await db.query('SELECT * FROM reproduction_records ORDER BY event_date DESC LIMIT 100');
  res.json(rows);
});

router.post('/', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const { event_type, female_code, male_code, calf_code, event_date, expected_birth_date, result, notes } = req.body;
  const { rows } = await db.query(`INSERT INTO reproduction_records
    (event_type, female_code, male_code, calf_code, event_date, expected_birth_date, result, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [event_type, female_code, male_code || null, calf_code || null, event_date, expected_birth_date || null, result || null, notes || null]);
  await audit(req.user.id, 'create', 'reproduction_record', rows[0].id, rows[0]);
  res.status(201).json(rows[0]);
});

module.exports = router;
