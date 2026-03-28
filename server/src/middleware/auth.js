const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token requerido' });

    const token = header.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'No autorizado para este módulo' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o vencido' });
    }
  };
}

module.exports = auth;
