const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.get("/login", auth.viewLogin);
router.post("/login", auth.login);
router.get("/logout", auth.logout);

router.get("/forgot-password", auth.viewForgotPassword);
router.post("/forgot-password", auth.forgotPassword);
router.get("/reset-password", auth.viewResetPassword);
router.post("/reset-password", auth.resetPassword);

module.exports = router;