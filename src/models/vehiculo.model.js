const db = require("../config/db");

exports.getAll = async () => {
  return await db.query(`
    SELECT v.*, c.nombre AS cliente
    FROM vehiculos v
    INNER JOIN clientes c ON c.id = v.cliente_id
    ORDER BY v.id DESC
  `);
};

exports.getById = async (id) => {
  const rows = await db.query("SELECT * FROM vehiculos WHERE id = ?", [id]);
  return rows.length ? rows[0] : null;
};

exports.getByCliente = async (cliente_id) => {
  return await db.query("SELECT * FROM vehiculos WHERE cliente_id=?", [cliente_id]);
};

exports.create = async (data) => {
  const { cliente_id, marca, modelo, anio, placa } = data;
  return await db.query(
    "INSERT INTO vehiculos(cliente_id,marca,modelo,anio,placa) VALUES (?,?,?,?,?)",
    [cliente_id, marca, modelo, anio, placa]
  );
};

exports.update = async (id, data) => {
  const { cliente_id, marca, modelo, anio, placa } = data;
  return await db.query(
    "UPDATE vehiculos SET cliente_id=?, marca=?, modelo=?, anio=?, placa=? WHERE id=?",
    [cliente_id, marca, modelo, anio, placa, id]
  );
};

exports.delete = async (id) => {
  return await db.query("DELETE FROM vehiculos WHERE id=?", [id]);
};
