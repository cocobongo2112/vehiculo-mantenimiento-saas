const router = require("express").Router();
const { isAuth, isTaller } = require("../middlewares/auth.middleware");

router.get("/dashboard", isAuth, isTaller, (req, res) => {
  res.send(`Dashboard Taller ✅ Bienvenido ${req.session.user.nombre}`);
});

module.exports = router;
