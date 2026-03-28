const db = require('../config/db');

async function audit(userId, action, entityType, entityId, details = null) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, action, entityType, entityId || null, details]
    );
  } catch (error) {
    console.error('Audit error', error.message);
  }
}

module.exports = audit;
