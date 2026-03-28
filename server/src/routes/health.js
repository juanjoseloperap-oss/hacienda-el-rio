const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(), async (req, res) => {
  const { rows } = await db.query(`SELECT id, animal_code, event_type, diagnosis, treatment, medicine_name, dose, event_date, next_due_date
    FROM health_records ORDER BY event_date DESC LIMIT 100`);
  res.json(rows);
});

router.post('/', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const { animal_code, event_type, diagnosis, treatment, medicine_name, dose, event_date, next_due_date, notes } = req.body;
  const { rows } = await db.query(`INSERT INTO health_records
    (animal_code, event_type, diagnosis, treatment, medicine_name, dose, event_date, next_due_date, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`, [animal_code, event_type, diagnosis, treatment, medicine_name, dose, event_date, next_due_date || null, notes || null]);
  await audit(req.user.id, 'create', 'health_record', rows[0].id, rows[0]);
  res.status(201).json(rows[0]);
});

module.exports = router;
