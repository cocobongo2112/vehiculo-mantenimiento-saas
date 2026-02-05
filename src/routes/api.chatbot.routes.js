const router = require("express").Router();
const ctrl = require("../controllers/api/chatbot.controller");

router.get("/estado", ctrl.estadoPorFolio);

module.exports = router;
