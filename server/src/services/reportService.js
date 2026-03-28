const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const db = require('../config/db');

async function getWeeklyMetrics() {
  const [{ rows: summary }, { rows: weekly }] = await Promise.all([
    db.query(`SELECT
      (SELECT COUNT(*) FROM animals WHERE status = 'active') AS active_animals,
      (SELECT COUNT(*) FROM animals WHERE current_category = 'cow') AS cows,
      (SELECT COUNT(*) FROM animals WHERE current_category = 'bull') AS bulls,
      (SELECT COUNT(*) FROM animals WHERE current_category = 'calf') AS calves,
      (SELECT COUNT(*) FROM supplies WHERE current_stock <= reorder_level) AS low_stock_items,
      (SELECT COALESCE(SUM(amount),0) FROM operational_costs WHERE expense_date >= CURRENT_DATE - INTERVAL '7 days') AS weekly_costs
    `),
    db.query(`SELECT animal_code, weight_kg, weighed_at
              FROM weights
              WHERE weighed_at >= CURRENT_DATE - INTERVAL '7 days'
              ORDER BY weighed_at DESC LIMIT 20`),
  ]);
  return { summary: summary[0], weekly };
}

async function buildExcel() {
  const data = await getWeeklyMetrics();
  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet('Resumen');
  summarySheet.columns = [
    { header: 'Indicador', key: 'key', width: 28 },
    { header: 'Valor', key: 'value', width: 18 },
  ];
  Object.entries(data.summary).forEach(([key, value]) => summarySheet.addRow({ key, value }));

  const weightSheet = workbook.addWorksheet('Pesajes semana');
  weightSheet.columns = [
    { header: 'Animal', key: 'animal_code', width: 18 },
    { header: 'Peso (kg)', key: 'weight_kg', width: 12 },
    { header: 'Fecha', key: 'weighed_at', width: 18 },
  ];
  data.weekly.forEach((row) => weightSheet.addRow(row));
  return workbook.xlsx.writeBuffer();
}

async function buildPdf() {
  const data = await getWeeklyMetrics();
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];
  return await new Promise((resolve) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text('Hacienda El Río - Reporte Ejecutivo Semanal');
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`);
    doc.moveDown();
    doc.fontSize(14).text('Resumen');
    Object.entries(data.summary).forEach(([k, v]) => doc.fontSize(11).text(`${k}: ${v}`));
    doc.moveDown();
    doc.fontSize(14).text('Últimos pesajes');
    data.weekly.forEach((row) => {
      doc.fontSize(11).text(`${row.animal_code} | ${row.weight_kg} kg | ${new Date(row.weighed_at).toLocaleDateString('es-CO')}`);
    });
    doc.end();
  });
}

module.exports = { getWeeklyMetrics, buildExcel, buildPdf };
