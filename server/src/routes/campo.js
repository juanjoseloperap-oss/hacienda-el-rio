const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/bascula', auth(['admin', 'operario', 'tecnico']), async (req, res) => {
  const { animal_code, weight_kg, from_location_id, to_location_id, weighed_at, notes } = req.body;

  if (!animal_code || !weight_kg || !to_location_id || !weighed_at) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para báscula' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const animalResult = await client.query(
      'SELECT animal_code, current_location_id FROM animals WHERE animal_code = $1 LIMIT 1',
      [animal_code]
    );

    if (!animalResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No existe un animal con esa chapeta/código' });
    }

    const animal = animalResult.rows[0];
    const origenFinal = from_location_id || animal.current_location_id || null;

    const prev = await client.query(
      `SELECT weight_kg, weighed_at
       FROM weights
       WHERE animal_code = $1
       ORDER BY weighed_at DESC
       LIMIT 1`,
      [animal_code]
    );

    let adg = null;

    if (prev.rows[0]) {
      const prevWeight = Number(prev.rows[0].weight_kg);
      const prevDate = new Date(prev.rows[0].weighed_at);
      const currentDate = new Date(weighed_at);
      const days = Math.max(1, Math.round((currentDate - prevDate) / 86400000));
      adg = Number(((Number(weight_kg) - prevWeight) / days).toFixed(3));
    }

    const weightInsert = await client.query(
      `INSERT INTO weights (animal_code, weight_kg, average_daily_gain, weighed_at, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [animal_code, Number(weight_kg), adg, weighed_at, notes || null]
    );

    const movementInsert = await client.query(
      `INSERT INTO animal_movements (animal_code, from_location_id, to_location_id, moved_at, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [animal_code, origenFinal, Number(to_location_id), weighed_at, 'Registro desde Báscula Campo']
    );

    await client.query(
      'UPDATE animals SET current_location_id = $1 WHERE animal_code = $2',
      [Number(to_location_id), animal_code]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      ok: true,
      message: 'Registro de báscula guardado',
      weight: weightInsert.rows[0],
      movement: movementInsert.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: error.message || 'Error guardando registro de báscula' });
  } finally {
    client.release();
  }
});

module.exports = router;