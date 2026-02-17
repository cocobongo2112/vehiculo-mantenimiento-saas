const router = require("express").Router();

router.get("/chat", (req, res) => {
  res.render("public/chat", { title: "Chatbot - Estado de tu vehículo" });
});

router.get("/", (req, res) => {
  res.render("public/home", { title: "TallerOS | Gestión para talleres", userSession: req.session.user || null });
});

router.get("/servicios", (req, res) => {
  res.render("public/servicios", { title: "Servicios | TallerOS", userSession: req.session.user || null });
});

router.get("/nosotros", (req, res) => {
  res.render("public/nosotros", { title: "Nosotros | TallerOS", userSession: req.session.user || null });
});

router.get("/contacto", (req, res) => {
  res.render("public/contacto", { title: "Contacto | TallerOS", userSession: req.session.user || null });
});

router.get("/busqueda", (req, res) => {
  res.render("public/busqueda", { title: "Búsqueda | TallerOS", userSession: req.session.user || null });
});

module.exports = router;
