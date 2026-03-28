const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

const router = express.Router();

router.get('/', auth(['admin']), async (_, res) => {
  const { rows } = await db.query(`SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC`);
  res.json(rows);
});

router.post('/', auth(['admin']), async (req, res) => {
  const { full_name, email, password, role } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(`INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, full_name, email, role, is_active`, [full_name, email, password_hash, role]);
  await audit(req.user.id, 'create', 'user', rows[0].id, rows[0]);
  res.status(201).json(rows[0]);
});

module.exports = router;
