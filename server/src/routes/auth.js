const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const audit = require('../utils/audit');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user.id, name: user.full_name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
  await audit(user.id, 'login', 'user', user.id, { email });
  res.json({ token, user: { id: user.id, name: user.full_name, role: user.role } });
});

module.exports = router;
