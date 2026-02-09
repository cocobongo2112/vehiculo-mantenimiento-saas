const router = require("express").Router();
const homeController = require("../controllers/home.controller");

router.get("/", homeController.home);
router.get("/health", homeController.health);

module.exports = router;
