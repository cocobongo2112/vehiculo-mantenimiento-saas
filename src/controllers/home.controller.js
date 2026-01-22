const db = require("../config/db");

exports.home = (req, res) => {
  res.render("home", { title: "SaaS Mantenimiento Vehicular" });
};

exports.health = async (req, res) => {
  const now = await db.query("SELECT NOW() AS serverTime");
  res.json({ ok: true, db: now[0].serverTime });
};
