const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'neurodesarrollo_secret_key_change_in_production';

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

  // Permitir acceso sin token para usuarios invitados
  if (!token) {
    // Verificar si es una operación de invitado basándose en los parámetros
    // Buscar en params, body, query cualquier ID que comience con 'invitado_'
    const checkInvitado = (obj) => {
      if (!obj) return null;
      for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'string' && value.startsWith('invitado_')) {
          return value;
        }
      }
      return null;
    };
    
    const usuarioId = checkInvitado(req.params) || 
                     checkInvitado(req.body) || 
                     checkInvitado(req.query);
    
    if (usuarioId) {
      req.usuario = {
        id: usuarioId,
        email: 'invitado@guest.local',
        rol: 'invitado',
        nombre: 'Invitado'
      };
      return next();
    }
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    req.usuario = decoded; // {id, email, rol}
    next();
  });
}

// Middleware para verificar si el usuario es admin
function verificarAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
}

// Función para generar token
function generarToken(usuario) {
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol,
      nombre: usuario.nombre
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token válido por 7 días
  );
}

module.exports = {
  verificarToken,
  verificarAdmin,
  generarToken,
  JWT_SECRET
};
