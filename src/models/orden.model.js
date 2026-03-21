// src/models/orden.model.js
const db = require("../config/db");

// Helpers
function toDateParam(d) {
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function cleanStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * ✅ LISTADO con filtros + paginación + multiempresa
 */
exports.getAllByEmpresa = async (empresa_id, filtros = {}, page = 1, limit = 10) => {
  const where = ["o.empresa_id = ?"];
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

  // ✅ fuerza numéricos (evita stmt_execute error)
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  // ✅ IMPORTANTE: LIMIT/OFFSET directo al SQL (no placeholders)
  const sql = `
    SELECT o.*, c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    ${whereSQL}
    ORDER BY o.id DESC
    LIMIT ${safeLimit} OFFSET ${offset}
  `;

  return await db.query(sql, params);
};

function cleanStr(v){ return (typeof v === "string") ? v.trim() : ""; }
function toDateParam(d){ return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }

exports.countByEmpresa = async (empresa_id, filtros = {}) => {
  const where = ["o.empresa_id = ?"];
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

  if (estado) { where.push("o.estado = ?"); params.push(estado); }
  if (desde) { where.push("DATE(o.created_at) >= ?"); params.push(desde); }
  if (hasta) { where.push("DATE(o.created_at) <= ?"); params.push(hasta); }

  const sql = `
    SELECT COUNT(*) AS total
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    WHERE ${where.join(" AND ")}
  `;
  const rows = await db.query(sql, params);
  return rows[0]?.total || 0;
};

/**
 * ✅ DETALLE seguro por empresa
 */
exports.getByIdEmpresa = async (id, empresa_id) => {
  const rows = await db.query(
    `
    SELECT o.*, c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    WHERE o.id = ? AND o.empresa_id = ?
    LIMIT 1
    `,
    [id, empresa_id]
  );
  return rows.length ? rows[0] : null;
};

exports.getEventos = async (orden_id) => {
  return await db.query(
    "SELECT * FROM ordenes_eventos WHERE orden_id=? ORDER BY id DESC",
    [orden_id]
  );
};

/**
 * ✅ CREATE incluyendo empresa_id (tu tabla lo tiene)
 */
exports.create = async ({ folio, cliente_id, vehiculo_id, descripcion, fecha_entrega, empresa_id }) => {
  return await db.query(
    `INSERT INTO ordenes_servicio(folio,cliente_id,vehiculo_id,descripcion,fecha_entrega,empresa_id)
     VALUES (?,?,?,?,?,?)`,
    [folio, cliente_id, vehiculo_id, descripcion || null, fecha_entrega || null, empresa_id]
  );
};

exports.addEvento = async ({ orden_id, evento, nota }) => {
  return await db.query(
    "INSERT INTO ordenes_eventos(orden_id,evento,nota) VALUES (?,?,?)",
    [orden_id, evento, nota || null]
  );
};

exports.updateEstado = async (id, estado, empresa_id) => {
  return await db.query(
    "UPDATE ordenes_servicio SET estado=? WHERE id=? AND empresa_id=?",
    [estado, id, empresa_id]
  );
};

exports.delete = async (id, empresa_id) => {
  // (si luego hacemos soft delete, aquí lo cambiamos)
  return await db.query("DELETE FROM ordenes_servicio WHERE id=? AND empresa_id=?", [id, empresa_id]);
};

exports.getByFolioPublic = async (folio) => {
  const rows = await db.query(`
    SELECT o.folio, o.estado, o.descripcion, o.fecha_entrega, o.created_at,
           c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    WHERE o.folio = ?
    LIMIT 1
  `, [folio]);

  return rows.length ? rows[0] : null;
};