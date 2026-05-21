const router = require("express").Router();
const { isAuth, isStaff } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/taller/ordenes.controller");

router.get("/", isAuth, isStaff, ctrl.list);
router.get("/new", isAuth, isStaff, ctrl.viewCreate);
router.post("/new", isAuth, isStaff, ctrl.create);

router.get("/:id", isAuth, isStaff, ctrl.viewDetail);
router.post("/:id/estado", isAuth, isStaff, ctrl.changeEstado);

router.post("/:id/delete", isAuth, isStaff, ctrl.delete);

module.exports = router;
