  const express = require("express");
  const session = require("express-session");
  const path = require("path");
  require("dotenv").config();

  const app = express();

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  }));

  app.use((req, res, next) => {
  res.locals.userSession = req.session?.user || null; // ajusta según tu estructura de sesión
  next();
});


  // Middlewares
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Static
  app.use(express.static(path.join(__dirname, "src", "public")));

  // Views
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "src", "views"));

  const expressLayouts = require("express-ejs-layouts");
  app.use(expressLayouts);
  app.set("layout", "layouts/main"); 

  // Routes
  app.use("/", require("./src/routes/index.routes"));
  app.use("/auth", require("./src/routes/auth.routes"));
  app.use("/taller", require("./src/routes/taller.routes"));
  app.use("/admin", require("./src/routes/admin.routes"));
  app.use("/admin/users", require("./src/routes/admin.users.routes"));
  app.use("/taller/clientes", require("./src/routes/taller.clientes.routes"));
  app.use("/taller/vehiculos", require("./src/routes/taller.vehiculos.routes"));
  app.use("/taller/ordenes", require("./src/routes/taller.ordenes.routes"));
  app.use("/api/chatbot", require("./src/routes/api.chatbot.routes"));
  app.use("/", require("./src/routes/public.routes"));
  app.use("/admin/reportes", require("./src/routes/admin.reportes.routes"));
  app.use("/", require("./src/routes/public.routes"));
  app.use("/api/search", require("./src/routes/api.search.routes"));

  // Server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
