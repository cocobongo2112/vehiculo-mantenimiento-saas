exports.isAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.session.user) return res.redirect("/auth/login");
  if (req.session.user.role !== "ADMIN") return res.status(403).send("Acceso denegado");
  next();
};

exports.isTaller = (req, res, next) => {
  if (!req.session.user) return res.redirect("/auth/login");
  if (req.session.user.role !== "TALLER") return res.status(403).send("Acceso denegado");
  next();
};
