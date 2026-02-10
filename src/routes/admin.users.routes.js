const router = require("express").Router();
const { body } = require("express-validator");
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/admin/users.controller");

router.get("/", isAuth, isAdmin, ctrl.list);
router.get("/new", isAuth, isAdmin, ctrl.viewCreate);

router.post(
  "/new",
  isAuth,
  isAdmin,
  body("nombre").trim().isLength({ min: 3 }).withMessage("Nombre mínimo 3 caracteres."),
  body("email").isEmail().withMessage("Email inválido."),
  body("password").isLength({ min: 6 }).withMessage("Contraseña mínimo 6 caracteres."),
  body("role_id").isInt().withMessage("Selecciona un rol válido."),
  ctrl.create
);

router.post("/:id/toggle", isAuth, isAdmin, ctrl.toggle);

module.exports = router;
