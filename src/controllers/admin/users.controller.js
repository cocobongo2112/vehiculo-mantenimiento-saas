const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../../models/user.model");

exports.list = async (req, res) => {
  const users = await User.getAllUsers();
  res.render("admin/users/list", {
    title: "Usuarios",
    userSession: req.session.user,
    users
  });
};

exports.viewCreate = async (req, res) => {
  const roles = await User.getRoles();
  res.render("admin/users/create", {
    title: "Crear usuario",
    userSession: req.session.user,
    roles,
    error: null,
    values: { nombre: "", email: "", role_id: "" }
  });
};

exports.create = async (req, res) => {
  const roles = await User.getRoles();
  const errors = validationResult(req);

  const values = {
    nombre: req.body.nombre || "",
    email: req.body.email || "",
    role_id: req.body.role_id || ""
  };

  if (!errors.isEmpty()) {
    return res.render("admin/users/create", {
      title: "Crear usuario",
      userSession: req.session.user,
      roles,
      error: errors.array()[0].msg,
      values
    });
  }

  const exists = await User.getByEmail(values.email);
  if (exists) {
    return res.render("admin/users/create", {
      title: "Crear usuario",
      userSession: req.session.user,
      roles,
      error: "Ese correo ya está registrado.",
      values
    });
  }

  const password_hash = await bcrypt.hash(req.body.password, 10);
  await User.createUser({ ...values, password_hash });

  res.redirect("/admin/users");
};

exports.toggle = async (req, res) => {
  await User.toggleActive(req.params.id);
  res.redirect("/admin/users");
};
