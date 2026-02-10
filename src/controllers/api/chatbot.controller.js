const Orden = require("../../models/orden.model");

exports.estadoPorFolio = async (req, res) => {
  const folio = (req.query.folio || "").trim().toUpperCase();

  if (!folio) return res.status(400).json({ ok: false, msg: "Folio requerido" });

  const orden = await Orden.getByFolioPublic(folio);
  if (!orden) return res.status(404).json({ ok: false, msg: "No se encontró una orden con ese folio" });

  // Mensaje amigable para el chatbot
  const msg = `Tu orden ${orden.folio} está en estado: ${orden.estado}. Vehículo: ${orden.marca} ${orden.modelo} (${orden.placa}).` +
              (orden.fecha_entrega ? ` Fecha estimada de entrega: ${orden.fecha_entrega}.` : "");

  res.json({ ok: true, orden, msg });
};
