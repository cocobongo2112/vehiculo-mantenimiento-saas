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

  // Middlewares
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Static
  app.use(express.static(path.join(__dirname, "src", "public")));

  // Views
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "src", "views"));

  // Routes
  app.use("/", require("./src/routes/index.routes"));
  app.use("/auth", require("./src/routes/auth.routes"));
  app.use("/taller", require("./src/routes/taller.routes"));
  app.use("/admin", require("./src/routes/admin.routes"));
  app.use("/admin/users", require("./src/routes/admin.users.routes"));

  // Server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
