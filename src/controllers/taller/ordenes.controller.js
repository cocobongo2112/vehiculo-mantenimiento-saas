const Orden = require("../../models/orden.model");
const Cliente = require("../../models/cliente.model");
const Vehiculo = require("../../models/vehiculo.model");
const { notifyN8N } = require("../../utils/n8n");

const ESTADOS_VALIDOS = ["RECIBIDO", "EN_PROCESO", "LISTO", "ENTREGADO"];
const PRIORIDADES_VALIDAS = ["BAJA", "MEDIA", "ALTA", "URGENTE"];

function generarFolio() {
  const now = Date.now();
  const rand = Math.floor(100 + Math.random() * 900);
  return `OS-${now}-${rand}`;
}

function normalizeDateTime(value) {
  if (!value || typeof value !== "string") return null;

  const v = value.trim();
  if (!v) return null;

  // Formato esperado de datetime-local: YYYY-MM-DDTHH:mm
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) {
    return null;
  }

  return `${v.replace("T", " ")}:00`;
}

exports.list = async (req, res) => {
  try {
    const empresa_id = req.session.user.empresa_id || 1;

    const filtros = {
      q: req.query.q || "",
      estado: req.query.estado || "",
      desde: req.query.desde || "",
      hasta: req.query.hasta || "",
    };

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      30,
      Math.max(5, parseInt(req.query.limit || "10", 10)),
    );

    const total = await Orden.countByEmpresa(empresa_id, filtros);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const ordenes = await Orden.getAllByEmpresa(
      empresa_id,
      filtros,
      safePage,
      limit,
    );

    res.render("taller/ordenes/list", {
      title: "Órdenes de Servicio",
      userSession: req.session.user,
      ordenes,
      filtros,
      pag: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error al listar órdenes:", error);
    res.status(500).send("Error al cargar las órdenes");
  }
};

exports.viewCreate = async (req, res) => {
  try {
    const empresa_id = req.session.user.empresa_id || 1;

    const clientes = await Cliente.getAllByEmpresa(empresa_id);
    const vehiculos = await Vehiculo.getAllByEmpresa(empresa_id);

    const preCliente = req.query.cliente_id || "";
    const preVehiculo = req.query.vehiculo_id || "";

    res.render("taller/ordenes/create", {
      title: "Nueva Orden",
      userSession: req.session.user,
      clientes,
      vehiculos,
      error: null,
      values: {
        cliente_id: preCliente,
        vehiculo_id: preVehiculo,
        descripcion: "",
        fecha_entrega: "",
        prioridad: "MEDIA",
        kilometraje: "",
        servicios: [],
      },
    });
  } catch (error) {
    console.error("Error al cargar formulario de orden:", error);
    res.status(500).send("Error al cargar el formulario de orden");
  }
};

exports.create = async (req, res) => {
  try {
    const {
      cliente_id,
      vehiculo_id,
      descripcion,
      fecha_entrega,
      prioridad,
      kilometraje,
      servicios,
    } = req.body;

    const empresa_id = req.session.user.empresa_id || 1;

    const clientes = await Cliente.getAllByEmpresa(empresa_id);
    const vehiculos = await Vehiculo.getAllByEmpresa(empresa_id);

    const serviciosSeleccionados = Array.isArray(servicios)
      ? servicios
      : servicios
        ? [servicios]
        : [];

    const prioridadFinal = PRIORIDADES_VALIDAS.includes(prioridad)
      ? prioridad
      : "MEDIA";

    const kilometrajeFinal =
      kilometraje !== undefined &&
      kilometraje !== null &&
      String(kilometraje).trim() !== ""
        ? Number(kilometraje)
        : null;

    if (
      kilometrajeFinal !== null &&
      (Number.isNaN(kilometrajeFinal) || kilometrajeFinal < 0)
    ) {
      return res.render("taller/ordenes/create", {
        title: "Nueva Orden",
        userSession: req.session.user,
        clientes,
        vehiculos,
        error: "El kilometraje debe ser un número válido",
        values: {
          cliente_id: cliente_id || "",
          vehiculo_id: vehiculo_id || "",
          descripcion: descripcion || "",
          fecha_entrega: fecha_entrega || "",
          prioridad: prioridadFinal,
          kilometraje: kilometraje || "",
          servicios: serviciosSeleccionados,
        },
      });
    }

    const fechaEntregaFinal = normalizeDateTime(fecha_entrega);

    if (fecha_entrega && !fechaEntregaFinal) {
      return res.render("taller/ordenes/create", {
        title: "Nueva Orden",
        userSession: req.session.user,
        clientes,
        vehiculos,
        error: "La fecha y hora de entrega no son válidas",
        values: {
          cliente_id: cliente_id || "",
          vehiculo_id: vehiculo_id || "",
          descripcion: descripcion || "",
          fecha_entrega: fecha_entrega || "",
          prioridad: prioridadFinal,
          kilometraje: kilometraje || "",
          servicios: serviciosSeleccionados,
        },
      });
    }

    if (!cliente_id || !vehiculo_id) {
      return res.render("taller/ordenes/create", {
        title: "Nueva Orden",
        userSession: req.session.user,
        clientes,
        vehiculos,
        error: "Cliente y vehículo son obligatorios",
        values: {
          cliente_id: cliente_id || "",
          vehiculo_id: vehiculo_id || "",
          descripcion: descripcion || "",
          fecha_entrega: fecha_entrega || "",
          prioridad: prioridadFinal,
          kilometraje: kilometraje || "",
          servicios: serviciosSeleccionados,
        },
      });
    }

    const cliente = await Cliente.getById(cliente_id, empresa_id);
    if (!cliente) {
      return res.render("taller/ordenes/create", {
        title: "Nueva Orden",
        userSession: req.session.user,
        clientes,
        vehiculos,
        error: "El cliente no existe o no pertenece a tu empresa",
        values: {
          cliente_id: cliente_id || "",
          vehiculo_id: vehiculo_id || "",
          descripcion: descripcion || "",
          fecha_entrega: fecha_entrega || "",
          prioridad: prioridadFinal,
          kilometraje: kilometraje || "",
          servicios: serviciosSeleccionados,
        },
      });
    }

    const vehiculo = await Vehiculo.getById(vehiculo_id, empresa_id);
    if (!vehiculo) {
      return res.render("taller/ordenes/create", {
        title: "Nueva Orden",
        userSession: req.session.user,
        clientes,
        vehiculos,
        error: "El vehículo no existe o no pertenece a tu empresa",
        values: {
          cliente_id: cliente_id || "",
          vehiculo_id: vehiculo_id || "",
          descripcion: descripcion || "",
          fecha_entrega: fecha_entrega || "",
          prioridad: prioridadFinal,
          kilometraje: kilometraje || "",
          servicios: serviciosSeleccionados,
        },
      });
    }

    if (Number(vehiculo.cliente_id) !== Number(cliente_id)) {
      return res.render("taller/ordenes/create", {
        title: "Nueva Orden",
        userSession: req.session.user,
        clientes,
        vehiculos,
        error: "El vehículo no pertenece al cliente seleccionado",
        values: {
          cliente_id: cliente_id || "",
          vehiculo_id: vehiculo_id || "",
          descripcion: descripcion || "",
          fecha_entrega: fecha_entrega || "",
          prioridad: prioridadFinal,
          kilometraje: kilometraje || "",
          servicios: serviciosSeleccionados,
        },
      });
    }

    const descripcionFinal = (descripcion || "").trim();
    const serviciosJSON = JSON.stringify(serviciosSeleccionados);
    const folio = generarFolio();

    const result = await Orden.create({
      folio,
      cliente_id,
      vehiculo_id,
      descripcion: descripcionFinal,
      fecha_entrega: fechaEntregaFinal,
      empresa_id,
      prioridad: prioridadFinal,
      kilometraje: kilometrajeFinal,
      servicios: serviciosJSON,
    });

    await Orden.addEvento({
      orden_id: result.insertId,
      evento: "CREADA",
      nota: "Orden creada",
    });

    res.redirect("/taller/ordenes");
  } catch (error) {
    console.error("Error al crear orden:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .send("Se generó un folio duplicado. Intenta nuevamente.");
    }

    res.status(500).send("Error al crear la orden");
  }
};

exports.viewDetail = async (req, res) => {
  try {
    const empresa_id = req.session.user.empresa_id || 1;
    const id = req.params.id;

    const orden = await Orden.getByIdEmpresa(id, empresa_id);
    if (!orden) {
      return res.redirect("/taller/ordenes");
    }

    const eventos = await Orden.getEventosByEmpresa(id, empresa_id);

    res.render("taller/ordenes/detail", {
      title: `Detalle ${orden.folio}`,
      userSession: req.session.user,
      orden,
      eventos,
    });
  } catch (error) {
    console.error("Error al ver detalle de orden:", error);
    res.status(500).send("Error al cargar el detalle de la orden");
  }
};

exports.changeEstado = async (req, res) => {
  try {
    const empresa_id = req.session.user.empresa_id || 1;
    const { estado } = req.body;
    const id = req.params.id;

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).send("Estado inválido");
    }

    const ordenActual = await Orden.getByIdEmpresa(id, empresa_id);
    if (!ordenActual) {
      return res.redirect("/taller/ordenes");
    }

    const result = await Orden.updateEstado(id, estado, empresa_id);

    if (!result.affectedRows) {
      return res.redirect("/taller/ordenes");
    }

    await Orden.addEvento({
      orden_id: id,
      evento: "ESTADO",
      nota: `Cambio a ${estado}`,
    });

    const orden = await Orden.getByIdEmpresa(id, empresa_id);
    if (!orden) {
      return res.redirect("/taller/ordenes");
    }

    if (orden.estado === "LISTO") {
      try {
        await notifyN8N({
          evento: "ORDEN_ESTADO_CAMBIO",
          fecha: new Date().toISOString(),
          orden: {
            id: orden.id,
            folio: orden.folio,
            estado: orden.estado,
            fecha_entrega: orden.fecha_entrega,
            descripcion: orden.descripcion,
          },
          cliente: { nombre: orden.cliente },
          vehiculo: {
            marca: orden.marca,
            modelo: orden.modelo,
            placa: orden.placa,
          },
        });
      } catch (e) {
        console.error("⚠️ No se pudo notificar a n8n:", e.message);
      }
    }

    res.redirect(`/taller/ordenes/${id}`);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).send("Error al actualizar el estado");
  }
};

exports.delete = async (req, res) => {
  try {
    const empresa_id = req.session.user.empresa_id || 1;
    const id = req.params.id;

    const result = await Orden.disable(id, empresa_id);

    if (!result.affectedRows) {
      return res.redirect("/taller/ordenes");
    }

    await Orden.addEvento({
      orden_id: id,
      evento: "ELIMINADA",
      nota: "Orden eliminada lógicamente",
    });

    res.redirect("/taller/ordenes");
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    res.status(500).send("Error al eliminar la orden");
  }
};
