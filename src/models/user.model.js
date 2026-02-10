const db = require("../config/db");

exports.getAllUsers = async () => {
  return await db.query(`
    SELECT u.id, u.nombre, u.email, u.activo, r.nombre AS role, u.created_at
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    ORDER BY u.id DESC
  `);
};

exports.getRoles = async () => {
  return await db.query(`SELECT id, nombre FROM roles ORDER BY id ASC`);
};

exports.getByEmail = async (email) => {
  const rows = await db.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows.length ? rows[0] : null;
};

exports.createUser = async ({ nombre, email, password_hash, role_id }) => {
  return await db.query(
    `INSERT INTO users(nombre,email,password_hash,role_id,activo) VALUES (?,?,?,?,1)`,
    [nombre, email, password_hash, role_id]
  );
};

exports.toggleActive = async (id) => {
  return await db.query(`UPDATE users SET activo = IF(activo=1,0,1) WHERE id = ?`, [id]);
};
