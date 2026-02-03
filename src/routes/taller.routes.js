const router = require("express").Router();
const { isAuth, isTaller } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/taller/dashboard.controller");

router.get("/dashboard", isAuth, isTaller, ctrl.view);

module.exports = router;
