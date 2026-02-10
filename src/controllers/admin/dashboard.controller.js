const db = require("../../config/db");

exports.view = async (req, res) => {
  const usuarios = await db.query(`SELECT COUNT(*) AS total FROM users`);
  const usuariosActivos = await db.query(`SELECT COUNT(*) AS total FROM users WHERE activo=1`);
  const clientes = await db.query(`SELECT COUNT(*) AS total FROM clientes`);
  const vehiculos = await db.query(`SELECT COUNT(*) AS total FROM vehiculos`);
  const ordenes = await db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio`);

  const ordenesPorEstado = await db.query(`
    SELECT estado, COUNT(*) AS cantidad
    FROM ordenes_servicio
    GROUP BY estado
  `);

  const ultimosUsuarios = await db.query(`
    SELECT id, nombre, email, activo, created_at
    FROM users
    ORDER BY id DESC
    LIMIT 5
  `);

  res.render("admin/dashboard", {
    title: "Dashboard Admin",
    userSession: req.session.user,
    kpis: {
      usuarios: usuarios[0].total,
      usuariosActivos: usuariosActivos[0].total,
      clientes: clientes[0].total,
      vehiculos: vehiculos[0].total,
      ordenes: ordenes[0].total
    },
    ordenesPorEstado,
    ultimosUsuarios
  });
};
