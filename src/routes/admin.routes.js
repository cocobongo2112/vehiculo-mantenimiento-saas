const router = require("express").Router();
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/admin/dashboard.controller");

router.get("/dashboard", isAuth, isAdmin, ctrl.view);

module.exports = router;
