const router = require("express").Router();
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");

router.get("/dashboard", isAuth, isAdmin, (req, res) => {
  res.send(`Dashboard Admin ✅ Bienvenido ${req.session.user.nombre}`);
});

module.exports = router;
