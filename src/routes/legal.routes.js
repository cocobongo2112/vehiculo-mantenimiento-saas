const express = require("express");
const router = express.Router();

router.get("/aviso-privacidad", (req, res) => {
  res.render("legal/aviso-privacidad", {
    title: "Aviso de Privacidad"
  });
});

router.get("/politica-privacidad", (req, res) => {
  res.render("legal/politica-privacidad", {
    title: "Política de Privacidad"
  });
});

module.exports = router;
