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

exports.getById = async (id) => {
  const rows = await db.query("SELECT * FROM clientes WHERE id = ?", [id]);
  return rows.length ? rows[0] : null;
};

exports.create = async (data) => {
  const { nombre, telefono, email, direccion, empresa_id } = data;
  return await db.query(
    "INSERT INTO clientes(nombre,telefono,email,direccion,empresa_id) VALUES (?,?,?,?,?)",
    [nombre, telefono, email, direccion, empresa_id]
  );
};

exports.update = async (id, data) => {
  const { nombre, telefono, email, direccion } = data;
  return await db.query(
    "UPDATE clientes SET nombre=?, telefono=?, email=?, direccion=? WHERE id=?",
    [nombre, telefono, email, direccion, id]
  );
};

exports.softDelete = async (id) => {
  return await db.query("UPDATE clientes SET activo=0 WHERE id=?", [id]);
};