const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(), async (req, res) => {
  const { rows } = await db.query(`SELECT id, animal_code, animal_name, sex, birth_date, identification_type,
    lot_id, current_location_id, current_category, status
    FROM animals ORDER BY created_at DESC`);
  res.json(rows);
});

router.post('/', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const {
    animal_code, animal_name, sex, birth_date, identification_type, lot_id,
    current_location_id, current_category, breed, mother_code, father_code
  } = req.body;
  const { rows } = await db.query(
    `INSERT INTO animals
    (animal_code, animal_name, sex, birth_date, identification_type, lot_id, current_location_id, current_category, breed, mother_code, father_code)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [animal_code, animal_name, sex, birth_date, identification_type, lot_id || null, current_location_id || null, current_category, breed || null, mother_code || null, father_code || null]
  );
  await audit(req.user.id, 'create', 'animal', rows[0].id, rows[0]);
  res.status(201).json(rows[0]);
});

module.exports = router;
