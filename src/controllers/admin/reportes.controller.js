const db = require("../../config/db");

function toDateParam(d) {
  // asegura formato YYYY-MM-DD
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

exports.view = async (req, res) => {
  const desde = toDateParam(req.query.desde) || null;
  const hasta = toDateParam(req.query.hasta) || null;
  const estado = req.query.estado || "";

  // filtros dinámicos
  const where = [];
  const params = [];

  if (desde) { where.push("DATE(o.created_at) >= ?"); params.push(desde); }
  if (hasta) { where.push("DATE(o.created_at) <= ?"); params.push(hasta); }
  if (estado) { where.push("o.estado = ?"); params.push(estado); }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

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

exports.exportCSV = async (req, res) => {
  const desde = toDateParam(req.query.desde) || null;
  const hasta = toDateParam(req.query.hasta) || null;
  const estado = req.query.estado || "";

  const where = [];
  const params = [];

  if (desde) { where.push("DATE(o.created_at) >= ?"); params.push(desde); }
  if (hasta) { where.push("DATE(o.created_at) <= ?"); params.push(hasta); }
  if (estado) { where.push("o.estado = ?"); params.push(estado); }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const rows = await db.query(`
    SELECT o.folio, o.estado, o.created_at, o.fecha_entrega,
           c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    ${whereSQL}
    ORDER BY o.id DESC
  `, params);

  // CSV simple
  const header = ["folio","estado","created_at","fecha_entrega","cliente","marca","modelo","placa"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const line = [
      r.folio, r.estado, r.created_at, r.fecha_entrega || "",
      `"${(r.cliente || "").replaceAll('"','""')}"`,
      r.marca, r.modelo, r.placa
    ].join(",");
    lines.push(line);
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=reportes_ordenes.csv");
  res.send(lines.join("\n"));
};
