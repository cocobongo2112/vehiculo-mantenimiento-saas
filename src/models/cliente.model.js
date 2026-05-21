const db = require("../config/db");

exports.getAllByEmpresa = async (empresa_id) => {
  return await db.query(
    "SELECT * FROM clientes WHERE empresa_id=? AND activo=1 ORDER BY id DESC",
    [empresa_id]
  );
};

exports.disable = async (id, empresa_id) => {
  return await db.query(
    "UPDATE clientes SET activo=0 WHERE id=? AND empresa_id=?",
    [id, empresa_id]
  );
};

exports.getById = async (id, empresa_id) => {
  const rows = await db.query(
    "SELECT * FROM clientes WHERE id=? AND empresa_id=? LIMIT 1",
    [id, empresa_id]
  );
  return rows.length ? rows[0] : null;
};

exports.create = async (data) => {
  const { nombre, telefono, email, direccion, empresa_id } = data;
  return await db.query(
    "INSERT INTO clientes(nombre,telefono,email,direccion,empresa_id) VALUES (?,?,?,?,?)",
    [nombre, telefono, email, direccion, empresa_id]
  );
};

exports.update = async (id, empresa_id, data) => {
  const { nombre, telefono, email, direccion } = data;
  return await db.query(
    "UPDATE clientes SET nombre=?, telefono=?, email=?, direccion=? WHERE id=? AND empresa_id=?",
    [nombre, telefono, email, direccion, id, empresa_id]
  );
};

exports.softDelete = async (id) => {
  return await db.query("UPDATE clientes SET activo=0 WHERE id=?", [id]);
};

exports.searchByEmpresa = async (empresa_id, q) => {
  const like = `%${q}%`;
  return await db.query(
    `SELECT *
     FROM clientes
     WHERE empresa_id = ?
       AND activo = 1
       AND (nombre LIKE ? OR email LIKE ? OR telefono LIKE ?)
     ORDER BY id DESC`,
    [empresa_id, like, like, like]
  );
};
