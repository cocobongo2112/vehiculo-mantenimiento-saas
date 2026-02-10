const router = require("express").Router();
const { isAuth, isTaller } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/taller/vehiculos.controller");

router.get("/", isAuth, isTaller, ctrl.list);
router.get("/new", isAuth, isTaller, ctrl.viewCreate);
router.post("/new", isAuth, isTaller, ctrl.create);

router.get("/:id/edit", isAuth, isTaller, ctrl.viewEdit);
router.post("/:id/edit", isAuth, isTaller, ctrl.update);

router.post("/:id/delete", isAuth, isTaller, ctrl.delete);

module.exports = router;
