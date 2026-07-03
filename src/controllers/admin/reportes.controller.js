const db = require("../../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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

function buildQueryString({ desde, hasta, estado }) {
  const qs = new URLSearchParams();
  if (desde) qs.set("desde", desde);
  if (hasta) qs.set("hasta", hasta);
  if (estado) qs.set("estado", estado);
  return qs.toString();
}

exports.view = async (req, res) => {
  const { desde, hasta, estado, whereSQL, params } = buildFilters(req);

  const [ordenes, porEstado] = await Promise.all([
    db.query(`
      SELECT o.id, o.folio, o.estado, o.created_at, o.fecha_entrega,
             c.nombre AS cliente, v.marca, v.modelo, v.placa
      FROM ordenes_servicio o
      INNER JOIN clientes c ON c.id = o.cliente_id
      INNER JOIN vehiculos v ON v.id = o.vehiculo_id
      ${whereSQL}
      ORDER BY o.id DESC
      LIMIT 200
    `, params),
    db.query(`SELECT estado, COUNT(*) AS cantidad FROM ordenes_servicio GROUP BY estado`),
  ]);

  res.render("admin/reportes/index", {
    title: "Reportes",
    userSession: req.session.user,
    filtros: { desde, hasta, estado },
    queryString: buildQueryString({ desde, hasta, estado }),
    ordenes,
    porEstado,
  });
};

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
      r.placa,
    ].join(",");
    lines.push(line);
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=reportes_ordenes.csv");
  res.send(lines.join("\n"));
};

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

  const logoPath = path.join(__dirname, "../../public/img/logo.jpeg");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=reporte_ordenes.pdf");

  const doc = new PDFDocument({ size: "LETTER", margin: 42, bufferPages: true });
  doc.pipe(res);

  const drawHeader = () => {
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 42, 32, { fit: [54, 54] });
      } catch (e) {}
    }

    doc.fillColor("#0f172a").fontSize(20).font("Helvetica-Bold").text("Smart Garage", 108, 34);
    doc.fillColor("#475569").fontSize(9).font("Helvetica").text("Sistema de gestión de mantenimiento vehicular", 108, 57);
    doc.fillColor("#0f172a").fontSize(16).font("Helvetica-Bold").text("Reporte de órdenes de servicio", 42, 105);
    doc.fillColor("#475569").fontSize(9).font("Helvetica").text(`Generado: ${new Date().toLocaleString("es-MX")}`, 42, 128);
    doc.text(`Filtros: Desde ${desde || "N/A"} · Hasta ${hasta || "N/A"} · Estado ${estado || "TODOS"}`, 42, 142);
    doc.roundedRect(42, 165, 528, 30, 10).fillAndStroke("#e0f2fe", "#bae6fd");
    doc.fillColor("#0f172a").fontSize(10).font("Helvetica-Bold").text(`Registros incluidos: ${ordenes.length}`, 54, 175);
    doc.fillColor("#0f172a").text("Resumen exportable para seguimiento administrativo y operativo.", 220, 175);
  };

  const drawTableHeader = (y) => {
    doc.roundedRect(42, y, 528, 24, 8).fill("#0f172a");
    doc.fillColor("#f8fafc").fontSize(8.5).font("Helvetica-Bold");
    doc.text("Folio", 50, y + 8, { width: 60 });
    doc.text("Estado", 112, y + 8, { width: 70 });
    doc.text("Cliente", 184, y + 8, { width: 140 });
    doc.text("Vehículo", 326, y + 8, { width: 160 });
    doc.text("Entrega", 490, y + 8, { width: 68 });
  };

  drawHeader();
  let y = 206;
  drawTableHeader(y);
  y += 30;

  ordenes.forEach((o, idx) => {
    const vehiculoTxt = `${o.marca} ${o.modelo} (${o.placa})`;
    const entregaTxt = o.fecha_entrega ? new Date(o.fecha_entrega).toLocaleDateString("es-MX") : "-";
    const rowHeight = 34;

    if (y + rowHeight > 735) {
      doc.addPage();
      y = 42;
      drawTableHeader(y);
      y += 30;
    }

    if (idx % 2 === 0) {
      doc.roundedRect(42, y - 4, 528, rowHeight, 6).fill("#f8fafc");
    } else {
      doc.roundedRect(42, y - 4, 528, rowHeight, 6).fill("#eef2ff");
    }

    doc.fillColor("#0f172a").fontSize(8.5).font("Helvetica");
    doc.text(o.folio, 50, y + 6, { width: 60 });
    doc.text(o.estado, 112, y + 6, { width: 70 });
    doc.text(o.cliente, 184, y + 6, { width: 140 });
    doc.text(vehiculoTxt, 326, y + 6, { width: 160 });
    doc.text(entregaTxt, 490, y + 6, { width: 68 });
    y += rowHeight + 4;
  });

  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#64748b").text(`Smart Garage · Página ${i + 1} de ${range.count}`, 42, 760, { align: "center", width: 528 });
  }

  doc.end();
};
