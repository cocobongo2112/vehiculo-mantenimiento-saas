const db = require("../../config/db");

exports.view = async (req, res) => {
  const [
    usuarios,
    usuariosActivos,
    clientes,
    vehiculos,
    ordenes,
    ordenesPorEstado,
    ultimosUsuarios,
    ultimasOrdenes,
    pendientes,
    entregadas,
    ordenesMes,
  ] = await Promise.all([
    db.query(`SELECT COUNT(*) AS total FROM users`),
    db.query(`SELECT COUNT(*) AS total FROM users WHERE activo=1`),
    db.query(`SELECT COUNT(*) AS total FROM clientes`),
    db.query(`SELECT COUNT(*) AS total FROM vehiculos`),
    db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio`),
    db.query(`SELECT estado, COUNT(*) AS cantidad FROM ordenes_servicio GROUP BY estado`),
    db.query(`SELECT id, nombre, email, activo, created_at FROM users ORDER BY id DESC LIMIT 5`),
    db.query(`
      SELECT o.folio, o.estado, o.created_at, o.fecha_entrega, c.nombre AS cliente,
             v.marca, v.modelo, v.placa, COALESCE(o.prioridad, 'MEDIA') AS prioridad
      FROM ordenes_servicio o
      INNER JOIN clientes c ON c.id = o.cliente_id
      INNER JOIN vehiculos v ON v.id = o.vehiculo_id
      WHERE o.activo = 1
      ORDER BY o.id DESC
      LIMIT 8
    `),
    db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio WHERE estado IN ('RECIBIDO','EN_PROCESO','LISTO')`),
    db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio WHERE estado = 'ENTREGADO'`),
    db.query(`SELECT COUNT(*) AS total FROM ordenes_servicio WHERE DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')`),
  ]);

  const totalOrdenes = Number(ordenes[0]?.total || 0);
  const entregadasCount = Number(entregadas[0]?.total || 0);
  const cumplimiento = totalOrdenes ? Math.round((entregadasCount / totalOrdenes) * 100) : 0;

  res.render("admin/dashboard", {
    title: "Dashboard Admin",
    userSession: req.session.user,
    kpis: {
      usuarios: usuarios[0].total,
      usuariosActivos: usuariosActivos[0].total,
      clientes: clientes[0].total,
      vehiculos: vehiculos[0].total,
      ordenes: totalOrdenes,
      pendientes: pendientes[0].total,
      entregadas: entregadasCount,
      ordenesMes: ordenesMes[0].total,
      cumplimiento,
    },
    ordenesPorEstado,
    ultimosUsuarios,
    ultimasOrdenes,
  });
};
