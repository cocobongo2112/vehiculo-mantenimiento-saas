const router = require("express").Router();
const ctrl = require("../controllers/api/search.controller");
router.get("/", ctrl.search);
module.exports = router;
