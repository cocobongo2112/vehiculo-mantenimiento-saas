const db = require("../../config/db");

exports.view = async (req, res) => {
  const total = await db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio`);
  const porEstado = await db.query(`
    SELECT estado, COUNT(*) AS cantidad
    FROM ordenes_servicio
    GROUP BY estado
  `);

  const proximas = await db.query(`
    SELECT id, folio, estado, fecha_entrega
    FROM ordenes_servicio
    WHERE fecha_entrega IS NOT NULL AND estado != 'ENTREGADO'
    ORDER BY fecha_entrega ASC
    LIMIT 5
  `);

  res.render("taller/dashboard", {
    title: "Dashboard Taller",
    userSession: req.session.user,
    total: total[0].total,
    porEstado,
    proximas
  });
};
