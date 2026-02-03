const router = require("express").Router();
const { isAuth, isTaller } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/taller/ordenes.controller");

router.get("/", isAuth, isTaller, ctrl.list);
router.get("/new", isAuth, isTaller, ctrl.viewCreate);
router.post("/new", isAuth, isTaller, ctrl.create);

router.get("/:id", isAuth, isTaller, ctrl.viewDetail);
router.post("/:id/estado", isAuth, isTaller, ctrl.changeEstado);

router.post("/:id/delete", isAuth, isTaller, ctrl.delete);

module.exports = router;
