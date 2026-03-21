const db = require("../config/db");

exports.getAllByEmpresa = async (empresa_id) => {
  return await db.query(
    `SELECT v.*, c.nombre AS cliente_nombre
     FROM vehiculos v
     INNER JOIN clientes c ON c.id = v.cliente_id
     WHERE v.empresa_id=? AND v.activo=1 AND c.activo=1
     ORDER BY v.id DESC`,
    [empresa_id]
  );
};

exports.getById = async (id, empresa_id) => {
  const rows = await db.query(
    `SELECT v.*, c.nombre AS cliente_nombre, c.activo AS cliente_activo
     FROM vehiculos v
     INNER JOIN clientes c ON c.id = v.cliente_id
     WHERE v.id=? AND v.empresa_id=? 
     LIMIT 1`,
    [id, empresa_id]
  );
  return rows.length ? rows[0] : null;
};

exports.create = async (data) => {
  const { empresa_id, cliente_id, marca, modelo, anio, placa, vin, color } = data;

  return await db.query(
    `INSERT INTO vehiculos(empresa_id, cliente_id, marca, modelo, anio, placa, vin, color, activo)
     VALUES (?,?,?,?,?,?,?,?,1)`,
    [empresa_id, cliente_id, marca, modelo, anio || null, placa, vin || null, color || null]
  );
};

exports.update = async (id, empresa_id, data) => {
  const { cliente_id, marca, modelo, anio, placa, vin, color } = data;

  return await db.query(
    `UPDATE vehiculos
     SET cliente_id=?, marca=?, modelo=?, anio=?, placa=?, vin=?, color=?
     WHERE id=? AND empresa_id=?`,
    [cliente_id, marca, modelo, anio || null, placa, vin || null, color || null, id, empresa_id]
  );
};

// ✅ Soft delete
exports.disable = async (id, empresa_id) => {
  return await db.query(
    "UPDATE vehiculos SET activo=0 WHERE id=? AND empresa_id=?",
    [id, empresa_id]
  );
};