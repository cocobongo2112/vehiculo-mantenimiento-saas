const Orden = require("../../models/orden.model");

function formatFechaHora(valor) {
  if (!valor) return null;

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return String(valor);
  }

  return fecha.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getMensajeEstado(estado) {
  switch (estado) {
    case "RECIBIDO":
      return "Tu vehículo ya fue recibido y la orden está registrada en el sistema.";
    case "EN_PROCESO":
      return "Tu vehículo se encuentra actualmente en proceso de servicio.";
    case "LISTO":
      return "Tu vehículo ya está listo para entrega.";
    case "ENTREGADO":
      return "La orden ya fue marcada como entregada.";
    default:
      return `Tu orden se encuentra en estado: ${estado}.`;
  }
}

exports.estadoPorFolio = async (req, res) => {
  try {
    const folio = (req.query.folio || "").trim().toUpperCase();

    if (!folio) {
      return res.status(400).json({
        ok: false,
        msg: "Debes escribir un folio para realizar la consulta."
      });
    }

    const orden = await Orden.getByFolioPublic(folio);

    if (!orden) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró una orden con ese folio. Verifica que esté escrito correctamente."
      });
    }

    const fechaEntrega = formatFechaHora(orden.fecha_entrega);
    const mensajeEstado = getMensajeEstado(orden.estado);

    const partes = [
      `🔧 Smart Garage`,
      ``,
      `Folio: ${orden.folio}`,
      `Estado: ${orden.estado}`,
      ``,
      mensajeEstado,
      ``,
      `Vehículo: ${orden.marca} ${orden.modelo}${orden.placa ? ` (${orden.placa})` : ""}`
    ];

    if (fechaEntrega) {
      partes.push(`Entrega estimada: ${fechaEntrega}`);
    }

    if (orden.descripcion) {
      partes.push(``);
      partes.push(`Descripción: ${orden.descripcion}`);
    }

    const msg = partes.join("\n");

    return res.json({
      ok: true,
      orden: {
        folio: orden.folio,
        estado: orden.estado,
        descripcion: orden.descripcion || null,
        fecha_entrega: orden.fecha_entrega || null,
        fecha_entrega_formateada: fechaEntrega,
        cliente: orden.cliente || null,
        marca: orden.marca || null,
        modelo: orden.modelo || null,
        placa: orden.placa || null
      },
      msg
    });
  } catch (error) {
    console.error("Error en chatbot estadoPorFolio:", error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al consultar la orden. Intenta nuevamente."
    });
  }
};