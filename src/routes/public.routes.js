const router = require("express").Router();

router.get("/chat", (req, res) => {
  res.render("public/chat", { title: "Chatbot - Estado de tu vehículo" });
});

module.exports = router;
