const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(), async (_, res) => {
  const { rows } = await db.query('SELECT * FROM animal_movements ORDER BY moved_at DESC LIMIT 100');
  res.json(rows);
});

router.post('/', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const { animal_code, from_location_id, to_location_id, moved_at, reason } = req.body;
  try {
    const { rows } = await db.query(`INSERT INTO animal_movements (animal_code, from_location_id, to_location_id, moved_at, reason)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`, [animal_code, from_location_id || null, to_location_id, moved_at, reason || null]);
    await db.query('UPDATE animals SET current_location_id = $1 WHERE animal_code = $2', [to_location_id, animal_code]);
    await audit(req.user.id, 'move', 'animal', animal_code, rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
