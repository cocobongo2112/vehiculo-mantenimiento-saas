const Vehiculo = require("../../models/vehiculo.model");
const Cliente = require("../../models/cliente.model");

exports.list = async (req, res) => {
  const vehiculos = await Vehiculo.getAll();
  res.render("taller/vehiculos/list", {
    title: "Vehículos",
    userSession: req.session.user,
    vehiculos
  });
};

exports.viewCreate = async (req, res) => {
  const clientes = await Cliente.getAll();
  res.render("taller/vehiculos/create", {
    title: "Nuevo Vehículo",
    clientes,
    error: null,
    values: { cliente_id:"", marca:"", modelo:"", anio:"", placa:"" }
  });
};

exports.create = async (req, res) => {
  const { cliente_id, marca, modelo, anio, placa } = req.body;

  if (!cliente_id || !marca || !modelo) {
    const clientes = await Cliente.getAll();
    return res.render("taller/vehiculos/create", {
      title: "Nuevo Vehículo",
      clientes,
      error: "Cliente, marca y modelo son obligatorios",
      values: req.body
    });
  }

  await Vehiculo.create({ cliente_id, marca, modelo, anio, placa });
  res.redirect("/taller/vehiculos");
};

exports.viewEdit = async (req, res) => {
  const vehiculo = await Vehiculo.getById(req.params.id);
  const clientes = await Cliente.getAll();
  res.render("taller/vehiculos/edit", {
    title: "Editar Vehículo",
    vehiculo,
    clientes
  });
};

exports.update = async (req, res) => {
  await Vehiculo.update(req.params.id, req.body);
  res.redirect("/taller/vehiculos");
};

exports.delete = async (req, res) => {
  await Vehiculo.delete(req.params.id);
  res.redirect("/taller/vehiculos");
};
