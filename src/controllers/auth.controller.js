const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function getRedirectByRole(role) {
  return role === "ADMIN" ? "/admin/dashboard" : "/taller/dashboard";
}

exports.viewLogin = (req, res) => {
  if (req.session?.user?.role) {
    return res.redirect(getRedirectByRole(req.session.user.role));
  }

  const reason = req.query.reason || null;
  let error = null;

  if (reason === "expired") error = "Tu sesión expiró por inactividad. Inicia sesión nuevamente.";
  if (reason === "replaced") error = "Tu sesión se cerró porque se inició sesión en otro dispositivo o navegador.";

  res.render("auth/login", { title: "Iniciar sesión", error });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const rows = await db.query(`
      SELECT u.id, u.nombre, u.email, u.password_hash, u.empresa_id, u.activo, r.nombre AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.email = ? AND u.activo = 1
      LIMIT 1
    `, [email]);

    if (!rows.length) {
      return res.status(401).render("auth/login", {
        title: "Iniciar sesión",
        error: "Credenciales inválidas"
      });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).render("auth/login", {
        title: "Iniciar sesión",
        error: "Credenciales inválidas"
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      `UPDATE users
       SET session_token = ?,
           session_started_at = NOW(),
           last_activity_at = NOW()
       WHERE id = ?`,
      [sessionToken, user.id]
    );

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).render("auth/login", {
          title: "Iniciar sesión",
          error: "No fue posible iniciar la sesión"
        });
      }

      req.session.user = {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        empresa_id: user.empresa_id,
        session_token: sessionToken,
        session_started_at: Date.now()
      };

      req.session.lastActivityAt = Date.now();

      return res.redirect(getRedirectByRole(user.role));
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).render("auth/login", {
      title: "Iniciar sesión",
      error: "Ocurrió un error al iniciar sesión"
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const currentUser = req.session?.user;

    if (currentUser?.id && currentUser?.session_token) {
      await db.query(
        `UPDATE users
         SET session_token = NULL,
             session_started_at = NULL,
             last_activity_at = NULL
         WHERE id = ? AND session_token = ?`,
        [currentUser.id, currentUser.session_token]
      );
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }

  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
};

// Vista para solicitar recuperación
exports.viewForgotPassword = (req, res) => {
  res.render("auth/forgot-password", {
    title: "Recuperar contraseña",
    error: null,
    success: null,
    resetLink: null
  });
};

// Procesar solicitud de recuperación
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const rows = await db.query(
      `SELECT id, email, activo
       FROM users
       WHERE email = ? AND activo = 1
       LIMIT 1`,
      [email]
    );

    // Por seguridad puedes mostrar el mismo mensaje aunque no exista
    if (!rows.length) {
      return res.render("auth/forgot-password", {
        title: "Recuperar contraseña",
        error: null,
        success: "Si el correo existe en el sistema, se generó un enlace de recuperación.",
        resetLink: null
      });
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      `UPDATE users
       SET reset_token = ?,
           reset_token_expires = DATE_ADD(NOW(), INTERVAL 30 MINUTE)
       WHERE id = ?`,
      [resetToken, user.id]
    );

    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

    return res.render("auth/forgot-password", {
      title: "Recuperar contraseña",
      error: null,
      success: "Se generó un enlace de recuperación simulado correctamente.",
      resetLink
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.render("auth/forgot-password", {
      title: "Recuperar contraseña",
      error: "Ocurrió un error al generar la recuperación.",
      success: null,
      resetLink: null
    });
  }
};

// Vista para restablecer contraseña
exports.viewResetPassword = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.render("auth/reset-password", {
        title: "Restablecer contraseña",
        error: "Token no proporcionado.",
        success: null,
        token: null
      });
    }

    const rows = await db.query(
      `SELECT id
       FROM users
       WHERE reset_token = ?
         AND reset_token_expires IS NOT NULL
         AND reset_token_expires >= NOW()
       LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      return res.render("auth/reset-password", {
        title: "Restablecer contraseña",
        error: "El enlace de recuperación no es válido o ya expiró.",
        success: null,
        token: null
      });
    }

    return res.render("auth/reset-password", {
      title: "Restablecer contraseña",
      error: null,
      success: null,
      token
    });
  } catch (error) {
    console.error("Error en viewResetPassword:", error);
    return res.render("auth/reset-password", {
      title: "Restablecer contraseña",
      error: "Ocurrió un error al abrir el enlace de recuperación.",
      success: null,
      token: null
    });
  }
};

// Procesar nueva contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return res.render("auth/reset-password", {
        title: "Restablecer contraseña",
        error: "Token inválido.",
        success: null,
        token: null
      });
    }

    if (!password || !confirmPassword) {
      return res.render("auth/reset-password", {
        title: "Restablecer contraseña",
        error: "Debes completar todos los campos.",
        success: null,
        token
      });
    }

    if (password !== confirmPassword) {
      return res.render("auth/reset-password", {
        title: "Restablecer contraseña",
        error: "Las contraseñas no coinciden.",
        success: null,
        token
      });
    }

    const rows = await db.query(
      `SELECT id
       FROM users
       WHERE reset_token = ?
         AND reset_token_expires IS NOT NULL
         AND reset_token_expires >= NOW()
       LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      return res.render("auth/reset-password", {
        title: "Restablecer contraseña",
        error: "El token no es válido o ya expiró.",
        success: null,
        token: null
      });
    }

    const user = rows[0];
    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password_hash = ?,
           reset_token = NULL,
           reset_token_expires = NULL
       WHERE id = ?`,
      [passwordHash, user.id]
    );

    return res.render("auth/reset-password", {
      title: "Restablecer contraseña",
      error: null,
      success: "La contraseña se actualizó correctamente. Ahora puedes iniciar sesión.",
      token: null
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.render("auth/reset-password", {
      title: "Restablecer contraseña",
      error: "Ocurrió un error al restablecer la contraseña.",
      success: null,
      token: null
    });
  }
};