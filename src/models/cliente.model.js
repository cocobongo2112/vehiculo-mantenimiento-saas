const db = require("../config/db");

exports.getAllByEmpresa = async (empresa_id) => {
  return await db.query(
    "SELECT * FROM clientes WHERE empresa_id=? ORDER BY id DESC",
    [empresa_id]
  );
};

exports.getById = async (id) => {
  const rows = await db.query("SELECT * FROM clientes WHERE id = ?", [id]);
  return rows.length ? rows[0] : null;
};

exports.create = async (data) => {
  const { nombre, telefono, email, direccion } = data;
  return await db.query(
    "INSERT INTO clientes(nombre,telefono,email,direccion) VALUES (?,?,?,?)",
    [nombre, telefono, email, direccion]
  );
};

exports.update = async (id, data) => {
  const { nombre, telefono, email, direccion } = data;
  return await db.query(
    "UPDATE clientes SET nombre=?, telefono=?, email=?, direccion=? WHERE id=?",
    [nombre, telefono, email, direccion, id]
  );
};

exports.delete = async (id) => {
  return await db.query("DELETE FROM clientes WHERE id=?", [id]);
};
