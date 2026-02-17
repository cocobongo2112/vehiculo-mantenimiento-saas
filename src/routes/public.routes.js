const router = require("express").Router();

router.get("/", (req, res) => res.render("public/home", { title: "Smart Garage | Inicio" }));
router.get("/servicios", (req, res) => res.render("public/servicios", { title: "Servicios | Smart Garage" }));
router.get("/nosotros", (req, res) => res.render("public/nosotros", { title: "Nosotros | Smart Garage" }));
router.get("/contacto", (req, res) => res.render("public/contacto", { title: "Contacto | Smart Garage" }));
router.get("/busqueda", (req, res) => res.render("public/busqueda", { title: "Búsqueda | Smart Garage" }));
router.get("/chat", (req, res) => res.render("public/chat", { title: "Chatbot | Smart Garage" }));

module.exports = router;
