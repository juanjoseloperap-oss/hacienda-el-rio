const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

router.get('/summary', auth(), async (req, res) => {
  const [animals, locations, lowStock, sales, costs] = await Promise.all([
    db.query(`SELECT current_category, COUNT(*) total FROM animals WHERE status='active' GROUP BY current_category ORDER BY current_category`),
    db.query(`SELECT l.name, COUNT(a.id) total FROM locations l LEFT JOIN animals a ON a.current_location_id=l.id AND a.status='active' GROUP BY l.id ORDER BY l.name`),
    db.query(`SELECT item_name, current_stock, reorder_level, unit FROM supplies WHERE current_stock <= reorder_level ORDER BY item_name`),
    db.query(`SELECT COALESCE(SUM(total_amount),0) total FROM transactions WHERE transaction_type='sale' AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'`),
    db.query(`SELECT COALESCE(SUM(amount),0) total FROM operational_costs WHERE expense_date >= CURRENT_DATE - INTERVAL '7 days'`),
  ]);
  res.json({
    animalsByCategory: animals.rows,
    animalsByLocation: locations.rows,
    lowStock: lowStock.rows,
    weeklySales: Number(sales.rows[0].total),
    weeklyCosts: Number(costs.rows[0].total)
  });
});

module.exports = router;
