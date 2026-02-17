const Cliente = require("../../models/cliente.model");

exports.list = async (req, res) => {
  const empresa_id = req.session.user.empresa_id;
  const clientes = await Cliente.getAllByEmpresa(empresa_id);

  res.render("taller/clientes/list", {
    title: "Clientes",
    userSession: req.session.user,
    clientes
  });
};

exports.viewCreate = (req, res) => {
  res.render("taller/clientes/create", {
    title: "Nuevo Cliente",
    error: null,
    values: { nombre:"", telefono:"", email:"", direccion:"" }
  });
};

exports.create = async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;

  if (!nombre) {
    return res.render("taller/clientes/create", {
      title: "Nuevo Cliente",
      error: "El nombre es obligatorio",
      values: req.body
    });
  }

  await Cliente.create({ nombre, telefono, email, direccion, empresa_id});
  res.redirect("/taller/clientes");
};

exports.viewEdit = async (req, res) => {
  const cliente = await Cliente.getById(req.params.id);
  res.render("taller/clientes/edit", {
    title: "Editar Cliente",
    cliente,
    error: null
  });
};

exports.update = async (req, res) => {
  await Cliente.update(req.params.id, req.body);
  res.redirect("/taller/clientes");
};

exports.delete = async (req, res) => {
  await Cliente.delete(req.params.id);
  res.redirect("/taller/clientes");
};
