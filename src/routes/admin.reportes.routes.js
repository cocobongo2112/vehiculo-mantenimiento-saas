const router = require("express").Router();
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/admin/reportes.controller");

router.get("/", isAuth, isAdmin, ctrl.view);
router.get("/csv", isAuth, isAdmin, ctrl.exportCSV);

module.exports = router;
