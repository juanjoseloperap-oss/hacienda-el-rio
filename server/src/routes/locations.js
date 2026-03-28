const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth(), async (_, res) => {
  const { rows } = await db.query('SELECT * FROM locations ORDER BY name');
  res.json(rows);
});

module.exports = router;
