const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Necesario para detectar HTTPS correctamente detrás de Nginx.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-change-me',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.locals.userSession = req.session?.user || null;
  next();
});

app.use(express.urlencoded({ extended: true, limit: '250kb' }));
app.use(express.json({ limit: '250kb' }));
app.use(express.static(path.join(__dirname, 'src', 'public'), { maxAge: isProduction ? '1d' : 0 }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'smart-garage', version: process.env.APP_VERSION || '1.0.0', uptime: Math.round(process.uptime()) });
});

app.use('/', require('./src/routes/index.routes'));
app.use('/auth', require('./src/routes/auth.routes'));
app.use('/taller', require('./src/routes/taller.routes'));
app.use('/admin', require('./src/routes/admin.routes'));
app.use('/admin/users', require('./src/routes/admin.users.routes'));
app.use('/taller/clientes', require('./src/routes/taller.clientes.routes'));
app.use('/taller/vehiculos', require('./src/routes/taller.vehiculos.routes'));
app.use('/taller/ordenes', require('./src/routes/taller.ordenes.routes'));
app.use('/api/chatbot', require('./src/routes/api.chatbot.routes'));
app.use('/', require('./src/routes/public.routes'));
app.use('/admin/reportes', require('./src/routes/admin.reportes.routes'));
app.use('/api/search', require('./src/routes/api.search.routes'));
app.use('/legal', require('./src/routes/legal.routes'));

app.use((req, res) => {
  res.status(404).render('home', { title: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on http://0.0.0.0:${PORT}`));
}

module.exports = app;
