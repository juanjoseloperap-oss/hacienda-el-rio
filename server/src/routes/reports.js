const express = require('express');
const auth = require('../middleware/auth');
const { buildExcel, buildPdf, getWeeklyMetrics } = require('../services/reportService');

const router = express.Router();

router.get('/weekly', auth(), async (_, res) => {
  res.json(await getWeeklyMetrics());
});

router.get('/weekly.xlsx', auth(), async (_, res) => {
  const buffer = await buildExcel();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte-semanal-el-rio.xlsx');
  res.send(buffer);
});

router.get('/weekly.pdf', auth(), async (_, res) => {
  const buffer = await buildPdf();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte-semanal-el-rio.pdf');
  res.send(buffer);
});

module.exports = router;
