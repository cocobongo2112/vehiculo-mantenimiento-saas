const Vehiculo = require("../../models/vehiculo.model");
const Cliente = require("../../models/cliente.model");

exports.list = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  const vehiculos = await Vehiculo.getAllByEmpresa(empresa_id);

  res.render("taller/vehiculos/list", {
    title: "Vehículos",
    userSession: req.session.user,
    vehiculos
  });
};

exports.viewCreate = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  const clientes = await Cliente.getAllByEmpresa(empresa_id);

  res.render("taller/vehiculos/create", {
    title: "Nuevo Vehículo",
    userSession: req.session.user,
    clientes,
    error: null,
    values: { cliente_id:"", marca:"", modelo:"", anio:"", placa:"", vin:"", color:"" }
  });
};

exports.create = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  const { cliente_id, marca, modelo, anio, placa, vin, color } = req.body;

  const clientes = await Cliente.getAllByEmpresa(empresa_id);

  if (!cliente_id || !marca || !modelo || !placa) {
    return res.render("taller/vehiculos/create", {
      title: "Nuevo Vehículo",
      userSession: req.session.user,
      clientes,
      error: "Cliente, marca, modelo y placa son obligatorios.",
      values: req.body
    });
  }

  await Vehiculo.create({ empresa_id, cliente_id, marca, modelo, anio, placa, vin, color });
  res.redirect("/taller/vehiculos");
};

exports.viewEdit = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;

  const vehiculo = await Vehiculo.getById(req.params.id, empresa_id);
  if (!vehiculo || Number(vehiculo.activo) !== 1) {
    return res.redirect("/taller/vehiculos");
  }

  const clientes = await Cliente.getAllByEmpresa(empresa_id);

  res.render("taller/vehiculos/edit", {
    title: "Editar Vehículo",
    userSession: req.session.user,
    vehiculo,
    clientes,
    error: null
  });
};

exports.update = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  const { cliente_id, marca, modelo, anio, placa, vin, color } = req.body;

  if (!cliente_id || !marca || !modelo || !placa) {
    return res.redirect(`/taller/vehiculos/${req.params.id}/edit`);
  }

  // ✅ Solo permitir asignar a clientes activos de esa empresa
  const clientes = await Cliente.getAllByEmpresa(empresa_id);
  const okCliente = clientes.some(c => String(c.id) === String(cliente_id));
  if (!okCliente) {
    return res.redirect(`/taller/vehiculos/${req.params.id}/edit`);
  }

  await Vehiculo.update(req.params.id, empresa_id, { cliente_id, marca, modelo, anio, placa, vin, color });
  res.redirect("/taller/vehiculos");
};

exports.delete = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  await Vehiculo.disable(req.params.id, empresa_id);
  res.redirect("/taller/vehiculos");
};