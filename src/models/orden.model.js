const db = require("../config/db");

exports.getAll = async () => {
  return await db.query(`
    SELECT o.*, c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    ORDER BY o.id DESC
  `);
};

exports.getById = async (id) => {
  const rows = await db.query(`
    SELECT o.*, c.nombre AS cliente, v.marca, v.modelo, v.placa
    FROM ordenes_servicio o
    INNER JOIN clientes c ON c.id = o.cliente_id
    INNER JOIN vehiculos v ON v.id = o.vehiculo_id
    WHERE o.id = ? LIMIT 1
  `, [id]);
  return rows.length ? rows[0] : null;
};

exports.getEventos = async (orden_id) => {
  return await db.query(
    "SELECT * FROM ordenes_eventos WHERE orden_id=? ORDER BY id DESC",
    [orden_id]
  );
};

exports.create = async ({ folio, cliente_id, vehiculo_id, descripcion, fecha_entrega }) => {
  return await db.query(
    `INSERT INTO ordenes_servicio(folio,cliente_id,vehiculo_id,descripcion,fecha_entrega)
     VALUES (?,?,?,?,?)`,
    [folio, cliente_id, vehiculo_id, descripcion || null, fecha_entrega || null]
  );
};

exports.addEvento = async ({ orden_id, evento, nota }) => {
  return await db.query(
    "INSERT INTO ordenes_eventos(orden_id,evento,nota) VALUES (?,?,?)",
    [orden_id, evento, nota || null]
  );
};

exports.updateEstado = async (id, estado) => {
  return await db.query(
    "UPDATE ordenes_servicio SET estado=? WHERE id=?",
    [estado, id]
  );
};

exports.delete = async (id) => {
  return await db.query("DELETE FROM ordenes_servicio WHERE id=?", [id]);
};
