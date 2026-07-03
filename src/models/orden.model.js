// src/models/orden.model.js
const db = require("../config/db");

function toDateParam(d) {
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function cleanStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

exports.getAllByEmpresa = async (empresa_id, filtros = {}, page = 1, limit = 10) => {
  const where = ["o.empresa_id = ?", "o.activo = 1"];
  const params = [empresa_id];

  const q = cleanStr(filtros.q).toLowerCase();
  const estado = cleanStr(filtros.estado);
  const desde = toDateParam(filtros.desde);
  const hasta = toDateParam(filtros.hasta);

  if (q) {
    where.push(`(
      LOWER(o.folio) LIKE ?
      OR LOWER(c.nombre) LIKE ?
      OR LOWER(v.placa) LIKE ?
    )`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (estado) {
    where.push("o.estado = ?");
    params.push(estado);
  }

  if (desde) {
    where.push("DATE(o.created_at) >= ?");
    params.push(desde);
  }

  if (hasta) {
    where.push("DATE(o.created_at) <= ?");
    params.push(hasta);
  }

  const whereSQL = `WHERE ${where.join(" AND ")}`;

  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const sql = `
    SELECT o.*, c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    ${whereSQL} AND c.activo = 1 AND v.activo = 1
    ORDER BY o.id DESC
    LIMIT ${safeLimit} OFFSET ${offset}
  `;

  return await db.query(sql, params);
};

exports.countByEmpresa = async (empresa_id, filtros = {}) => {
  const where = ["o.empresa_id = ?", "o.activo = 1"];
  const params = [empresa_id];

  const q = cleanStr(filtros.q).toLowerCase();
  const estado = cleanStr(filtros.estado);
  const desde = toDateParam(filtros.desde);
  const hasta = toDateParam(filtros.hasta);

  if (q) {
    where.push(`(
      LOWER(o.folio) LIKE ?
      OR LOWER(c.nombre) LIKE ?
      OR LOWER(v.placa) LIKE ?
    )`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (estado) {
    where.push("o.estado = ?");
    params.push(estado);
  }

  if (desde) {
    where.push("DATE(o.created_at) >= ?");
    params.push(desde);
  }

  if (hasta) {
    where.push("DATE(o.created_at) <= ?");
    params.push(hasta);
  }

  const sql = `
    SELECT COUNT(*) AS total
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    WHERE ${where.join(" AND ")} AND c.activo = 1 AND v.activo = 1
  `;

  const rows = await db.query(sql, params);
  return rows[0]?.total || 0;
};

exports.getByIdEmpresa = async (id, empresa_id) => {
  const rows = await db.query(
    `
    SELECT o.*, c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    WHERE o.id = ?
      AND o.empresa_id = ?
      AND o.activo = 1
      AND c.activo = 1
      AND v.activo = 1
    LIMIT 1
    `,
    [id, empresa_id]
  );

  return rows.length ? rows[0] : null;
};

exports.getEventosByEmpresa = async (orden_id, empresa_id) => {
  return await db.query(
    `
    SELECT e.*
    FROM ordenes_eventos e
    INNER JOIN ordenes_servicio o ON o.id = e.orden_id
    WHERE e.orden_id = ?
      AND o.empresa_id = ?
    ORDER BY e.id DESC
    `,
    [orden_id, empresa_id]
  );
};

exports.create = async ({
  folio,
  cliente_id,
  vehiculo_id,
  descripcion,
  fecha_entrega,
  empresa_id,
  prioridad,
  kilometraje,
  servicios
}) => {
  return await db.query(
    `
    INSERT INTO ordenes_servicio (
      folio,
      cliente_id,
      vehiculo_id,
      descripcion,
      fecha_entrega,
      empresa_id,
      prioridad,
      kilometraje,
      servicios
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      folio,
      cliente_id,
      vehiculo_id,
      descripcion || null,
      fecha_entrega || null,
      empresa_id,
      prioridad || "MEDIA",
      kilometraje || null,
      servicios || null
    ]
  );
};

exports.addEvento = async ({ orden_id, evento, nota }) => {
  return await db.query(
    "INSERT INTO ordenes_eventos (orden_id, evento, nota) VALUES (?, ?, ?)",
    [orden_id, evento, nota || null]
  );
};

exports.updateEstado = async (id, estado, empresa_id) => {
  return await db.query(
    "UPDATE ordenes_servicio SET estado = ? WHERE id = ? AND empresa_id = ?",
    [estado, id, empresa_id]
  );
};

exports.disable = async (id, empresa_id) => {
  return await db.query(
    "UPDATE ordenes_servicio SET activo = 0 WHERE id = ? AND empresa_id = ?",
    [id, empresa_id]
  );
};

exports.getByFolioPublic = async (folio) => {
  const rows = await db.query(
    `
    SELECT o.folio, o.estado, o.descripcion, o.fecha_entrega, o.created_at,
           c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    WHERE o.folio = ?
      AND o.activo = 1
      AND c.activo = 1
      AND v.activo = 1
    LIMIT 1
    `,
    [folio]
  );

  return rows.length ? rows[0] : null;
};