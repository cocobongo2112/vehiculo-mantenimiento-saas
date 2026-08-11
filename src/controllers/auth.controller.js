const db = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

exports.viewLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Iniciar sesión',
    error: null,
    registroOk: req.query.registro === 'ok'
  });
};

exports.viewRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Registro de usuario',
    error: null,
    values: { nombre: '', email: '' }
  });
};

exports.register = async (req, res) => {
  const values = {
    nombre: (req.body.nombre || '').trim(),
    email: (req.body.email || '').trim().toLowerCase()
  };

  try {
    if (!values.nombre || values.nombre.length < 3) {
      return res.status(400).render('auth/register', { title: 'Registro de usuario', error: 'El nombre debe tener mínimo 3 caracteres.', values });
    }
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return res.status(400).render('auth/register', { title: 'Registro de usuario', error: 'Ingresa un correo electrónico válido.', values });
    }
    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).render('auth/register', { title: 'Registro de usuario', error: 'La contraseña debe tener mínimo 8 caracteres.', values });
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).render('auth/register', { title: 'Registro de usuario', error: 'La confirmación de contraseña no coincide.', values });
    }
    if (req.body.aceptaPrivacidad !== '1') {
      return res.status(400).render('auth/register', { title: 'Registro de usuario', error: 'Debes aceptar el Aviso de Privacidad y la Política de Privacidad para registrarte.', values });
    }

    const exists = await User.getByEmail(values.email);
    if (exists) {
      return res.status(400).render('auth/register', { title: 'Registro de usuario', error: 'Ese correo ya está registrado.', values });
    }

    const roles = await User.getRoles();
    const tallerRole = roles.find((r) => String(r.nombre).toUpperCase() === 'TALLER') || roles[0];
    if (!tallerRole) {
      return res.status(500).render('auth/register', { title: 'Registro de usuario', error: 'No hay roles configurados para crear el usuario.', values });
    }

    const password_hash = await bcrypt.hash(req.body.password, 12);
    await User.createUser({ nombre: values.nombre, email: values.email, password_hash, role_id: tallerRole.id });
    return res.redirect('/auth/login?registro=ok');
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).render('auth/register', { title: 'Registro de usuario', error: 'Ocurrió un error al registrar el usuario.', values });
  }
};

exports.login = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    if (!email || !password) {
      return res.status(400).render('auth/login', { title: 'Iniciar sesión', error: 'Correo y contraseña son obligatorios.', registroOk: false });
    }

    const rows = await db.query(`
      SELECT u.id, u.nombre, u.email, u.password_hash, u.empresa_id, r.nombre AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.email = ? AND u.activo = 1
      LIMIT 1
    `, [email]);

    if (!rows.length) {
      return res.status(401).render('auth/login', { title: 'Iniciar sesión', error: 'Credenciales inválidas', registroOk: false });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).render('auth/login', { title: 'Iniciar sesión', error: 'Credenciales inválidas', registroOk: false });
    }

    req.session.user = { id: user.id, nombre: user.nombre, email: user.email, role: user.role, empresa_id: user.empresa_id };
    if (user.role === 'ADMIN') return res.redirect('/admin/dashboard');
    return res.redirect('/taller/dashboard');
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).render('auth/login', { title: 'Iniciar sesión', error: 'No fue posible iniciar sesión. Intenta nuevamente.', registroOk: false });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
