const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.get("/login", auth.viewLogin);
router.post("/login", auth.login);
router.get("/logout", auth.logout);

module.exports = router;
