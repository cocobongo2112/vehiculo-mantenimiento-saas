const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.get("/login", auth.viewLogin);
router.get("/register", auth.viewRegister);
router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/logout", auth.logout);

module.exports = router;
