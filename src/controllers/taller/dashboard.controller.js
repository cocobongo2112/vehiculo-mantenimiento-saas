const db = require("../../config/db");

exports.view = async (req, res) => {
  const [total, porEstado, proximas, recientes, vencidas] = await Promise.all([
    db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio WHERE activo = 1`),
    db.query(`SELECT estado, COUNT(*) AS cantidad FROM ordenes_servicio WHERE activo = 1 GROUP BY estado`),
    db.query(`
      SELECT id, folio, estado, fecha_entrega
      FROM ordenes_servicio
      WHERE fecha_entrega IS NOT NULL AND estado != 'ENTREGADO' AND activo = 1
      ORDER BY fecha_entrega ASC
      LIMIT 5
    `),
    db.query(`
      SELECT o.folio, o.estado, o.created_at, o.fecha_entrega,
             c.nombre AS cliente, v.marca, v.modelo, v.placa, COALESCE(o.prioridad,'MEDIA') AS prioridad
      FROM ordenes_servicio o
      INNER JOIN clientes c ON c.id = o.cliente_id
      INNER JOIN vehiculos v ON v.id = o.vehiculo_id
      WHERE o.activo = 1
      ORDER BY o.id DESC
      LIMIT 6
    `),
    db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio WHERE activo = 1 AND estado != 'ENTREGADO' AND fecha_entrega IS NOT NULL AND fecha_entrega < NOW()`),
  ]);

  res.render("taller/dashboard", {
    title: "Dashboard Taller",
    userSession: req.session.user,
    total: total[0].total,
    porEstado,
    proximas,
    recientes,
    vencidas: vencidas[0].total,
  });
};
