const Cliente = require("../../models/cliente.model");
const Vehiculo = require("../../models/vehiculo.model");
const db = require("../../config/db");

exports.list = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;
  const clientes = await Cliente.getAllByEmpresa(empresa_id);

  res.render("taller/clientes/list", {
    title: "Clientes",
    userSession: req.session.user,
    clientes,
    filtros: {} // por si luego usas búsqueda
  });
};

exports.viewCreate = (req, res) => {
  res.render("taller/clientes/create", {
    title: "Nuevo Cliente",
    userSession: req.session.user,
    error: null,
    values: { nombre: "", telefono: "", email: "", direccion: "" }
  });
};

exports.create = async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;
  const empresa_id = req.session.user.empresa_id || 1; // ✅ FIX

  if (!nombre) {
    return res.render("taller/clientes/create", {
      title: "Nuevo Cliente",
      userSession: req.session.user,
      error: "El nombre es obligatorio",
      values: req.body
    });
  }

  // ✅ Asegura que se guarde empresa_id (si tu tabla ya lo tiene)
  await Cliente.create({ nombre, telefono, email, direccion, empresa_id });

  res.redirect("/taller/clientes");
};

exports.viewDetail = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;

  const cliente = await Cliente.getById(req.params.id);
  if (!cliente) return res.redirect("/taller/clientes");

  if (!cliente || Number(cliente.empresa_id) !== Number(empresa_id) || Number(cliente.activo) !== 1) {
  return res.redirect("/taller/clientes");
}

  // ✅ Seguridad multiempresa (opcional pero recomendado)
  if (cliente.empresa_id && Number(cliente.empresa_id) !== Number(empresa_id)) {
    return res.redirect("/taller/clientes");
  }

  // Traer vehículos del cliente
  let vehiculos = [];
  if (typeof Vehiculo.getAllByCliente === "function") {
    vehiculos = await Vehiculo.getAllByCliente(cliente.id, empresa_id);
  } else {
    vehiculos = await db.query(
      "SELECT * FROM vehiculos WHERE cliente_id=? AND empresa_id=? ORDER BY id DESC",
      [cliente.id, empresa_id]
    );
  }

  res.render("taller/clientes/detail", {
    title: "Detalle Cliente",
    userSession: req.session.user,
    cliente,
    vehiculos
  });
};

exports.viewEdit = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;

  const cliente = await Cliente.getById(req.params.id);
  if (!cliente) return res.redirect("/taller/clientes");

  if (!cliente || Number(cliente.empresa_id) !== Number(empresa_id) || Number(cliente.activo) !== 1) {
  return res.redirect("/taller/clientes");
}

  if (cliente.empresa_id && Number(cliente.empresa_id) !== Number(empresa_id)) {
    return res.redirect("/taller/clientes");
  }

  res.render("taller/clientes/edit", {
    title: "Editar Cliente",
    userSession: req.session.user,
    cliente,
    error: null
  });
};

exports.update = async (req, res) => {
  await Cliente.update(req.params.id, req.body);
  res.redirect("/taller/clientes");
};

exports.delete = async (req, res) => {
  const empresa_id = req.session.user.empresa_id || 1;

  // soft delete (no rompe FKs)
  await Cliente.disable(req.params.id, empresa_id);

  res.redirect("/taller/clientes");
};