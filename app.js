const express = require("express");
const path = require("path");
require("dotenv").config();

const session = require("express-session");

const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

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
app.use("/taller/clientes", require("./src/routes/taller.clientes.routes"));
app.use("/taller/vehiculos", require("./src/routes/taller.vehiculos.routes"));
app.use("/taller/ordenes", require("./src/routes/taller.ordenes.routes"));
app.use("/api/chatbot", require("./src/routes/api.chatbot.routes"));
app.use("/", require("./src/routes/public.routes"));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
