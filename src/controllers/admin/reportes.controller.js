const db = require("../../config/db");
const PDFDocument = require("pdfkit");

function toDateParam(d) {
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function buildFilters(req) {
  const desde = toDateParam(req.query.desde) || null;
  const hasta = toDateParam(req.query.hasta) || null;
  const estado = (req.query.estado || "").trim();

  const where = [];
  const params = [];

  if (desde) { where.push("DATE(o.created_at) >= ?"); params.push(desde); }
  if (hasta) { where.push("DATE(o.created_at) <= ?"); params.push(hasta); }
  if (estado) { where.push("o.estado = ?"); params.push(estado); }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { desde, hasta, estado, whereSQL, params };
}

// ✅ VIEW: pantalla de reportes
exports.view = async (req, res) => {
  const { desde, hasta, estado, whereSQL, params } = buildFilters(req);

  const ordenes = await db.query(`
    SELECT o.id, o.folio, o.estado, o.created_at, o.fecha_entrega,
           c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    ${whereSQL}
    ORDER BY o.id DESC
    LIMIT 200
  `, params);

  const porEstado = await db.query(`
    SELECT estado, COUNT(*) AS cantidad
    FROM ordenes_servicio
    GROUP BY estado
  `);

  res.render("admin/reportes/index", {
    title: "Reportes",
    userSession: req.session.user,
    filtros: { desde, hasta, estado },
    ordenes,
    porEstado
  });
};

// ✅ CSV: exportación
exports.exportCSV = async (req, res) => {
  const { whereSQL, params } = buildFilters(req);

  const rows = await db.query(`
    SELECT o.folio, o.estado, o.created_at, o.fecha_entrega,
           c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    ${whereSQL}
    ORDER BY o.id DESC
  `, params);

  const header = ["folio","estado","created_at","fecha_entrega","cliente","marca","modelo","placa"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const line = [
      r.folio,
      r.estado,
      r.created_at,
      r.fecha_entrega || "",
      `"${(r.cliente || "").replaceAll('"','""')}"`,
      r.marca,
      r.modelo,
      r.placa
    ].join(",");
    lines.push(line);
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=reportes_ordenes.csv");
  res.send(lines.join("\n"));
};

// ✅ PDF: exportación (tu código)
exports.exportPDF = async (req, res) => {
  const { desde, hasta, estado, whereSQL, params } = buildFilters(req);

  const ordenes = await db.query(`
    SELECT o.folio, o.estado, o.created_at, o.fecha_entrega,
           c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    ${whereSQL}
    ORDER BY o.id DESC
    LIMIT 300
  `, params);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=reporte_ordenes.pdf");

  const doc = new PDFDocument({ size: "LETTER", margin: 40 });
  doc.pipe(res);

  doc.fontSize(16).text("Reporte de Órdenes de Servicio", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Generado: ${new Date().toLocaleString("es-MX")}`);
  doc.text(`Filtros -> Desde: ${desde || "N/A"} | Hasta: ${hasta || "N/A"} | Estado: ${estado || "TODOS"}`);
  doc.moveDown();

  const startX = 40;
  let y = doc.y;

  const cols = {
    folio: startX,
    estado: startX + 90,
    cliente: startX + 160,
    vehiculo: startX + 320,
    entrega: startX + 500
  };

  doc.fontSize(9).font("Helvetica-Bold");
  doc.text("Folio", cols.folio, y, { width: 80 });
  doc.text("Estado", cols.estado, y, { width: 60 });
  doc.text("Cliente", cols.cliente, y, { width: 150 });
  doc.text("Vehículo", cols.vehiculo, y, { width: 170 });
  doc.text("Entrega", cols.entrega, y, { width: 70 });
  doc.moveDown(0.3);

  y = doc.y;
  doc.font("Helvetica");
  doc.moveTo(startX, y).lineTo(570, y).stroke();
  doc.moveDown(0.5);

  for (const o of ordenes) {
    if (doc.y > 720) doc.addPage();

    const vehiculoTxt = `${o.marca} ${o.modelo} (${o.placa})`;
    const entregaTxt = o.fecha_entrega ? new Date(o.fecha_entrega).toLocaleDateString("es-MX") : "-";

    doc.fontSize(9);
    doc.text(o.folio, cols.folio, doc.y, { width: 80 });
    doc.text(o.estado, cols.estado, doc.y, { width: 60 });
    doc.text(o.cliente, cols.cliente, doc.y, { width: 150 });
    doc.text(vehiculoTxt, cols.vehiculo, doc.y, { width: 170 });
    doc.text(entregaTxt, cols.entrega, doc.y, { width: 70 });

    doc.moveDown(0.6);
  }

  doc.moveDown();
  doc.fontSize(9).text(`Total de registros: ${ordenes.length}`, { align: "right" });

  doc.end();
};
