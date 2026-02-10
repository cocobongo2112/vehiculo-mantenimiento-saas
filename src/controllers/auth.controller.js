const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.viewLogin = (req, res) => {
  res.render("auth/login", { title: "Iniciar sesión", error: null });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const rows = await db.query(`
    SELECT u.id, u.nombre, u.email, u.password_hash, r.nombre AS role
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.email = ? AND u.activo = 1
    LIMIT 1
  `, [email]);

  if (!rows.length) {
    return res.render("auth/login", { title: "Iniciar sesión", error: "Credenciales inválidas" });
  }

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.render("auth/login", { title: "Iniciar sesión", error: "Credenciales inválidas" });
  }

  req.session.user = {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    role: user.role
  };

  // Redirección por rol
  if (user.role === "ADMIN") return res.redirect("/admin/dashboard");
  return res.redirect("/taller/dashboard");
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/auth/login"));
};
