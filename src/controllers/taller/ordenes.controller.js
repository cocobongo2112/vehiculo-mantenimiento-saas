const Orden = require("../../models/orden.model");
const Cliente = require("../../models/cliente.model");
const Vehiculo = require("../../models/vehiculo.model");

function generarFolio() {
  const ts = Date.now().toString().slice(-6);
  return `OS-${ts}`;
}

exports.list = async (req, res) => {
  const ordenes = await Orden.getAll();
  res.render("taller/ordenes/list", {
    title: "Órdenes de Servicio",
    userSession: req.session.user,
    ordenes
  });
};

exports.viewCreate = async (req, res) => {
  const clientes = await Cliente.getAll();
  const vehiculos = await Vehiculo.getAll();
  res.render("taller/ordenes/create", {
    title: "Nueva Orden",
    clientes,
    vehiculos,
    error: null,
    values: { cliente_id:"", vehiculo_id:"", descripcion:"", fecha_entrega:"" }
  });
};

exports.create = async (req, res) => {
  const { cliente_id, vehiculo_id, descripcion, fecha_entrega } = req.body;
  const clientes = await Cliente.getAll();
  const vehiculos = await Vehiculo.getAll();

  if (!cliente_id || !vehiculo_id) {
    return res.render("taller/ordenes/create", {
      title: "Nueva Orden",
      clientes,
      vehiculos,
      error: "Cliente y vehículo son obligatorios",
      values: req.body
    });
  }

  const folio = generarFolio();
  await Orden.create({ folio, cliente_id, vehiculo_id, descripcion, fecha_entrega });
  // registrar evento
  const rows = await require("../../config/db").query("SELECT id FROM ordenes_servicio WHERE folio=? LIMIT 1", [folio]);
  await Orden.addEvento({ orden_id: rows[0].id, evento: "CREADA", nota: "Orden creada" });

  res.redirect("/taller/ordenes");
};

exports.viewDetail = async (req, res) => {
  const orden = await Orden.getById(req.params.id);
  const eventos = await Orden.getEventos(req.params.id);
  res.render("taller/ordenes/detail", {
    title: `Detalle ${orden.folio}`,
    orden,
    eventos
  });
};

exports.changeEstado = async (req, res) => {
  const { estado } = req.body;
  const id = req.params.id;

  await Orden.updateEstado(id, estado);
  await Orden.addEvento({ orden_id: id, evento: "ESTADO", nota: `Cambio a ${estado}` });

  res.redirect(`/taller/ordenes/${id}`);
};

exports.delete = async (req, res) => {
  await Orden.delete(req.params.id);
  res.redirect("/taller/ordenes");
};
