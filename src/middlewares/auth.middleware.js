const db = require("../config/db");

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutos
const ABSOLUTE_LIMIT_MS = 8 * 60 * 60 * 1000; // 8 horas

async function clearActiveSession(userId, sessionToken) {
  if (!userId || !sessionToken) return;

  await db.query(
    `UPDATE users
     SET session_token = NULL,
         session_started_at = NULL,
         last_activity_at = NULL
     WHERE id = ? AND session_token = ?`,
    [userId, sessionToken]
  );
}

function destroyAndRedirect(req, res, reason = "expired") {
  req.session.destroy(() => {
    res.redirect(`/auth/login?reason=${reason}`);
  });
}

async function validateSession(req, res, next) {
  try {
    const sessionUser = req.session?.user;

    if (!sessionUser) {
      return res.redirect("/auth/login");
    }

    const rows = await db.query(
      `SELECT u.id, u.activo, u.session_token, u.session_started_at, u.last_activity_at, r.nombre AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?
       LIMIT 1`,
      [sessionUser.id]
    );

    if (!rows.length || Number(rows[0].activo) !== 1) {
      await clearActiveSession(sessionUser.id, sessionUser.session_token);
      return destroyAndRedirect(req, res, "expired");
    }

    const dbUser = rows[0];

    if (!dbUser.session_token || dbUser.session_token !== sessionUser.session_token) {
      return destroyAndRedirect(req, res, "replaced");
    }

    const now = Date.now();
    const lastActivity = req.session.lastActivityAt || new Date(dbUser.last_activity_at).getTime();
    const sessionStarted = req.session.user.session_started_at || new Date(dbUser.session_started_at).getTime();

    if (now - lastActivity > INACTIVITY_LIMIT_MS || now - sessionStarted > ABSOLUTE_LIMIT_MS) {
      await clearActiveSession(sessionUser.id, sessionUser.session_token);
      return destroyAndRedirect(req, res, "expired");
    }

    req.session.lastActivityAt = now;
    req.session.user.role = dbUser.role;

    await db.query(
      `UPDATE users SET last_activity_at = NOW() WHERE id = ? AND session_token = ?`,
      [sessionUser.id, sessionUser.session_token]
    );

    next();
  } catch (error) {
    console.error("Error validando sesión:", error);
    return destroyAndRedirect(req, res, "expired");
  }
}

exports.isAuth = validateSession;

exports.isAdmin = (req, res, next) => {
  if (!req.session?.user) return res.redirect("/auth/login");
  if (req.session.user.role !== "ADMIN") return res.status(403).send("Acceso denegado");
  next();
};

exports.isTaller = (req, res, next) => {
  if (!req.session?.user) return res.redirect("/auth/login");
  if (req.session.user.role !== "TALLER") return res.status(403).send("Acceso denegado");
  next();
};

exports.isStaff = (req, res, next) => {
  if (!req.session?.user) return res.redirect("/auth/login");
  if (!["ADMIN", "TALLER"].includes(req.session.user.role)) {
    return res.status(403).send("Acceso denegado");
  }
  next();
};
