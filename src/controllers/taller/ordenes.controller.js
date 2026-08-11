// src/controllers/taller/ordenes.controller.js
const Orden = require("../../models/orden.model");
const Cliente = require("../../models/cliente.model");
const Vehiculo = require("../../models/vehiculo.model");
const db = require("../../config/db");
const { notifyN8N } = require("../../utils/n8n");

function generarFolio() {
  const ts = Date.now().toString().slice(-6);
  return `OS-${ts}`;
}

exports.list = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;

  const filtros = {
    q: req.query.q || "",
    estado: req.query.estado || "",
    desde: req.query.desde || "",
    hasta: req.query.hasta || ""
  };

  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(30, Math.max(5, parseInt(req.query.limit || "10", 10)));

  const total = await Orden.countByEmpresa(empresa_id, filtros);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ✅ evita que se vaya a páginas que no existen
  const safePage = Math.min(page, totalPages);

  const ordenes = await Orden.getAllByEmpresa(empresa_id, filtros, safePage, limit);

  res.render("taller/ordenes/list", {
    title: "Órdenes de Servicio",
    userSession: req.session.user,
    ordenes,
    filtros,
    pag: {
      page: safePage,
      limit,
      total,
      totalPages
    }
  });
};

exports.viewCreate = async (req, res) => {
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
      fecha_entrega: ""
    }
  });
};

exports.create = async (req, res) => {
  const { cliente_id, vehiculo_id, descripcion, fecha_entrega } = req.body;
  const empresa_id = req.session.user.empresa_id || 1;

  const clientes = await Cliente.getAllByEmpresa(empresa_id);
  const vehiculos = await Vehiculo.getAllByEmpresa(empresa_id);

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
        fecha_entrega: fecha_entrega || ""
      }
    });
  }

  const folio = generarFolio();

  await Orden.create({
    folio,
    cliente_id,
    vehiculo_id,
    descripcion,
    fecha_entrega,
    empresa_id
  });

  const rows = await db.query("SELECT id FROM ordenes_servicio WHERE folio=? LIMIT 1", [folio]);
  if (rows.length) {
    await Orden.addEvento({ orden_id: rows[0].id, evento: "CREADA", nota: "Orden creada" });
  }

  res.redirect("/taller/ordenes");
};

exports.viewDetail = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;

  const orden = await Orden.getByIdEmpresa(req.params.id, empresa_id);
  if (!orden) return res.redirect("/taller/ordenes");

  const eventos = await Orden.getEventos(req.params.id);

  res.render("taller/ordenes/detail", {
    title: `Detalle ${orden.folio}`,
    userSession: req.session.user,
    orden,
    eventos
  });
};

exports.changeEstado = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  const { estado } = req.body;
  const id = req.params.id;

  await Orden.updateEstado(id, estado, empresa_id);
  await Orden.addEvento({ orden_id: id, evento: "ESTADO", nota: `Cambio a ${estado}` });

  const orden = await Orden.getByIdEmpresa(id, empresa_id);
  if (!orden) return res.redirect("/taller/ordenes");

  try {
    await notifyN8N({
      evento: "ORDEN_ESTADO_CAMBIO",
      fecha: new Date().toISOString(),
      orden: {
        id: orden.id,
        folio: orden.folio,
        estado: orden.estado,
        fecha_entrega: orden.fecha_entrega,
        descripcion: orden.descripcion
      },
      cliente: { nombre: orden.cliente },
      vehiculo: { marca: orden.marca, modelo: orden.modelo, placa: orden.placa }
    });
  } catch (e) {
    console.error("⚠️ No se pudo notificar a n8n:", e.message);
  }

  res.redirect(`/taller/ordenes/${id}`);
};

exports.delete = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  await Orden.delete(req.params.id, empresa_id);
  res.redirect("/taller/ordenes");
};