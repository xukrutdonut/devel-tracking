const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const db = require('./database');
const { verificarToken, verificarAdmin, generarToken } = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 8001;

// Función helper para verificar acceso a un niño
function verificarAccesoNino(ninoId, usuarioId, rol, callback) {
  if (rol === 'admin') {
    // Admin tiene acceso a todos
    callback(null, true);
  } else if (rol === 'invitado') {
    // Invitados solo pueden acceder a sus propios datos temporales
    // El ninoId para invitados es el mismo que el usuarioId
    callback(null, ninoId === usuarioId);
  } else {
    // Usuario normal solo puede acceder a sus propios niños
    db.get('SELECT id FROM ninos WHERE id = ? AND usuario_id = ?', [ninoId, usuarioId], (err, row) => {
      if (err) return callback(err, false);
      callback(null, !!row);
    });
  }
}

// Configuración de CORS con servidores autorizados
const allowedOrigins = [
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
  'http://neurodesarrollo-backend:8001', // Contenedor Docker interno
  'http://172.18.0.2:3000', // Red Docker
  'https://dev.neuropedialab.org',
  'https://devel-tracking.neuropedialab.org'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    // Log para debug
    console.log('🔍 Intento de conexión desde origen:', origin);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS de este sitio no permite el acceso desde el origen especificado.';
      console.error('❌ Origen rechazado:', origin);
      console.error('✅ Orígenes permitidos:', allowedOrigins);
      return callback(new Error(msg), false);
    }
    console.log('✅ Origen aceptado:', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registro de nuevo usuario
app.post('/api/auth/registro', async (req, res) => {
  const { email, password, nombre } = req.body;

  // Validación
  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Verificar si el email ya existe
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'El email ya está registrado' });

    // Hash de la contraseña
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insertar nuevo usuario
    db.run(
      'INSERT INTO usuarios (email, password_hash, nombre, rol) VALUES (?, ?, ?, ?)',
      [email, passwordHash, nombre, 'usuario'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        const nuevoUsuario = {
          id: this.lastID,
          email,
          nombre,
          rol: 'usuario'
        };

        const token = generarToken(nuevoUsuario);
        
        res.status(201).json({
          mensaje: 'Usuario registrado exitosamente',
          token,
          usuario: nuevoUsuario
        });
      }
    );
  });
});

// Login de usuario
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validación
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Buscar usuario
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Verificar contraseña
    const passwordValida = bcrypt.compareSync(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    // Actualizar último acceso
    db.run('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?', [usuario.id]);

    // Generar token
    const token = generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
  });
});

// Verificar token (para mantener sesión)
app.get('/api/auth/verificar', verificarToken, (req, res) => {
  res.json({
    valido: true,
    usuario: req.usuario
  });
});

// Obtener perfil del usuario actual
app.get('/api/auth/perfil', verificarToken, (req, res) => {
  db.get(
    'SELECT id, email, nombre, rol, creado_en, ultimo_acceso FROM usuarios WHERE id = ?',
    [req.usuario.id],
    (err, usuario) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    }
  );
});

// Cambiar contraseña
app.post('/api/auth/cambiar-password', verificarToken, (req, res) => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
  }

  if (passwordNueva.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  // Obtener usuario actual
  db.get('SELECT password_hash FROM usuarios WHERE id = ?', [req.usuario.id], (err, usuario) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Verificar contraseña actual
    const passwordValida = bcrypt.compareSync(passwordActual, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash de nueva contraseña
    const nuevoHash = bcrypt.hashSync(passwordNueva, 10);

    // Actualizar contraseña
    db.run('UPDATE usuarios SET password_hash = ? WHERE id = ?', [nuevoHash, req.usuario.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Contraseña actualizada exitosamente' });
    });
  });
});

// ==================== RUTAS DE ADMINISTRACIÓN (solo admin) ====================

// Listar todos los usuarios (solo admin)
app.get('/api/admin/usuarios', verificarToken, verificarAdmin, (req, res) => {
  db.all(
    'SELECT id, email, nombre, rol, activo, creado_en, ultimo_acceso FROM usuarios ORDER BY creado_en DESC',
    (err, usuarios) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(usuarios);
    }
  );
});

// Activar/Desactivar usuario (solo admin)
app.put('/api/admin/usuarios/:id/toggle-activo', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT activo FROM usuarios WHERE id = ?', [id], (err, usuario) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nuevoEstado = usuario.activo ? 0 : 1;

    db.run('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        mensaje: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        activo: nuevoEstado
      });
    });
  });
});

// Cambiar rol de usuario (solo admin)
app.put('/api/admin/usuarios/:id/cambiar-rol', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['usuario', 'admin'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "usuario" o "admin"' });
  }

  db.run('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Rol actualizado exitosamente', rol });
  });
});

// Ver todos los niños de todos los usuarios (solo admin)
app.get('/api/admin/ninos', verificarToken, verificarAdmin, (req, res) => {
  db.all(
    `SELECT n.*, u.nombre as nombre_usuario, u.email as email_usuario 
     FROM ninos n 
     LEFT JOIN usuarios u ON n.usuario_id = u.id 
     ORDER BY n.creado_en DESC`,
    (err, ninos) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(ninos);
    }
  );
});

// ==================== RUTAS DE NIÑOS ====================

// Obtener todos los niños del usuario actual
app.get('/api/ninos', verificarToken, (req, res) => {
  // Para usuarios invitados, devolver array vacío
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  // Si es admin, puede ver todos; si no, solo los suyos
  const query = req.usuario.rol === 'admin' 
    ? 'SELECT n.*, u.nombre as nombre_usuario, u.email as email_usuario FROM ninos n LEFT JOIN usuarios u ON n.usuario_id = u.id ORDER BY n.nombre'
    : 'SELECT * FROM ninos WHERE usuario_id = ? ORDER BY nombre';
  
  const params = req.usuario.rol === 'admin' ? [] : [req.usuario.id];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear nuevo niño
app.post('/api/ninos', verificarToken, (req, res) => {
  const { nombre, fecha_nacimiento, semanas_gestacion } = req.body;
  
  // Validación
  if (!nombre || !fecha_nacimiento) {
    console.error('Error: Faltan campos requeridos');
    return res.status(400).json({ error: 'Nombre y fecha de nacimiento son requeridos' });
  }
  
  const semanasGest = semanas_gestacion || 40; // Default 40 si no se proporciona
  
  db.run('INSERT INTO ninos (nombre, fecha_nacimiento, semanas_gestacion, usuario_id) VALUES (?, ?, ?, ?)', 
    [nombre, fecha_nacimiento, semanasGest, req.usuario.id], 
    function(err) {
      if (err) {
        console.error('Error en base de datos:', err.message);
        return res.status(500).json({ error: err.message });
      }
      const resultado = { 
        id: this.lastID, 
        nombre, 
        fecha_nacimiento, 
        semanas_gestacion: semanasGest,
        usuario_id: req.usuario.id
      };
      res.json(resultado);
    }
  );
});

// Obtener un niño específico
app.get('/api/ninos/:id', verificarToken, (req, res) => {
  // Para usuarios invitados, devolver datos mock
  if (req.usuario.rol === 'invitado') {
    return res.json({
      id: req.params.id,
      nombre: 'Niño de Ejemplo',
      fecha_nacimiento: new Date().toISOString().split('T')[0],
      semanas_gestacion: 40,
      usuario_id: req.usuario.id
    });
  }
  
  // Verificar que el niño pertenece al usuario (o que el usuario es admin)
  const query = req.usuario.rol === 'admin'
    ? 'SELECT n.*, u.nombre as nombre_usuario, u.email as email_usuario FROM ninos n LEFT JOIN usuarios u ON n.usuario_id = u.id WHERE n.id = ?'
    : 'SELECT * FROM ninos WHERE id = ? AND usuario_id = ?';
  
  const params = req.usuario.rol === 'admin' ? [req.params.id] : [req.params.id, req.usuario.id];

  db.get(query, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Niño no encontrado o no tienes acceso' });
    res.json(row);
  });
});

// Eliminar un niño (y todos sus datos relacionados)
app.delete('/api/ninos/:id', verificarToken, (req, res) => {
  const ninoId = req.params.id;
  
  // Verificar que el niño pertenece al usuario (o que el usuario es admin)
  const verificarQuery = req.usuario.rol === 'admin'
    ? 'SELECT id FROM ninos WHERE id = ?'
    : 'SELECT id FROM ninos WHERE id = ? AND usuario_id = ?';
  
  const verificarParams = req.usuario.rol === 'admin' ? [ninoId] : [ninoId, req.usuario.id];

  db.get(verificarQuery, verificarParams, (err, nino) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!nino) return res.status(404).json({ error: 'Niño no encontrado o no tienes acceso' });

    db.serialize(() => {
      db.run('DELETE FROM hitos_conseguidos WHERE nino_id = ?', [ninoId]);
      db.run('DELETE FROM hitos_no_alcanzados WHERE nino_id = ?', [ninoId]);
      db.run('DELETE FROM red_flags_observadas WHERE nino_id = ?', [ninoId]);
      
      db.run('DELETE FROM ninos WHERE id = ?', [ninoId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Niño eliminado correctamente' });
      });
    });
  });
});

// ==================== RUTAS DE DOMINIOS ====================

app.get('/api/dominios', (req, res) => {
  db.all('SELECT * FROM dominios ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==================== RUTAS DE FUENTES NORMATIVAS ====================

app.get('/api/fuentes-normativas', (req, res) => {
  db.all('SELECT * FROM fuentes_normativas WHERE activa = 1 ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/fuentes-normativas/:id', (req, res) => {
  db.get('SELECT * FROM fuentes_normativas WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Fuente normativa no encontrada' });
    res.json(row);
  });
});

// Informacion detallada de fuentes normativas con dominios cubiertos
app.get('/api/fuentes-normativas-detalle', (req, res) => {
  db.all('SELECT * FROM fuentes_normativas WHERE activa = 1 ORDER BY id', (err, fuentes) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const promesas = fuentes.map(fuente => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT DISTINCT d.id, d.nombre, COUNT(hn.id) as num_hitos
          FROM dominios d
          LEFT JOIN hitos_normativos hn ON d.id = hn.dominio_id AND hn.fuente_normativa_id = ?
          WHERE hn.id IS NOT NULL
          GROUP BY d.id, d.nombre
          ORDER BY d.id
        `;
        db.all(query, [fuente.id], (err, dominios) => {
          if (err) reject(err);
          else {
            const urlMatch = fuente.referencia_bibliografica.match(/(https?:\/\/[^\s]+)/);
            const url = urlMatch ? urlMatch[1] : null;
            
            const infoAdicional = getInfoAdicionalFuente(fuente.id);
            
            resolve({
              ...fuente,
              url_original: url,
              dominios_cubiertos: dominios,
              total_dominios: dominios.length,
              total_hitos: dominios.reduce((sum, d) => sum + d.num_hitos, 0),
              ...infoAdicional
            });
          }
        });
      });
    });
    
    Promise.all(promesas)
      .then(resultados => res.json(resultados))
      .catch(error => res.status(500).json({ error: error.message }));
  });
});

function getInfoAdicionalFuente(fuenteId) {
  const info = {
    1: {
      nombre_corto: 'CDC',
      tipo: 'Guia clinica',
      metodologia: 'Revision sistematica y consenso de expertos',
      fortalezas: [
        'Actualizada recientemente (2022)',
        'Enfoque practico para pediatria',
        'Criterio del 75% de niños (no 50%)',
        'Gratuita y de acceso publico'
      ],
      limitaciones: [
        'Menos rigurosa estadisticamente que escalas estandarizadas',
        'Poblacion principalmente estadounidense',
        'No es instrumento diagnostico formal'
      ],
      mejor_para: 'Screening inicial en atencion primaria',
      cobertura_dominios: 'Amplia (todos los dominios principales)',
      validacion: 'Consenso de expertos, no estandarizacion formal',
      edad_rango: '2 meses - 5 años'
    },
    2: {
      nombre_corto: 'OMS',
      tipo: 'Estudio normativo internacional',
      metodologia: 'Estudio multicentrico longitudinal',
      fortalezas: [
        'Estandar internacional',
        'Muestra multicultural',
        'Seguimiento longitudinal riguroso',
        'Ventanas de logro (no solo promedios)'
      ],
      limitaciones: [
        'Enfoque principal en motor grueso',
        'Menos hitos en otros dominios',
        'Datos de 2006',
        'Muestra con crianza optima (menos variabilidad)'
      ],
      mejor_para: 'Comparacion intercultural y seguimiento motor',
      cobertura_dominios: 'Excelente en motor grueso, limitada en otros',
      validacion: 'Estudio prospectivo multicentrico (n=816)',
      edad_rango: 'Nacimiento - 24 meses (principalmente motor)'
    },
    3: {
      nombre_corto: 'Bayley-III',
      tipo: 'Escala estandarizada diagnostica',
      metodologia: 'Estandarizacion formal con muestra estratificada',
      fortalezas: [
        'Gold standard en evaluacion del desarrollo',
        'Excelente fiabilidad (α > 0.86)',
        'Validez bien establecida',
        'Normas actualizadas y detalladas',
        'Cobertura completa de dominios'
      ],
      limitaciones: [
        'Requiere formacion especializada',
        'Administracion larga (30-90 min)',
        'Costosa (requiere licencia)',
        'Poblacion principalmente USA'
      ],
      mejor_para: 'Evaluacion diagnostica completa y seguimiento de alto riesgo',
      cobertura_dominios: 'Completa (5 escalas: Cognitivo, Lenguaje, Motor, Socio-emocional, Adaptativo)',
      validacion: 'Muestra normativa n=1,700 estratificada',
      edad_rango: '1 - 42 meses'
    },
    4: {
      nombre_corto: 'BDI-2',
      tipo: 'Inventario completo del desarrollo',
      metodologia: 'Estandarizacion con sobremuestreo de grupos especiales',
      fortalezas: [
        'Rango de edad amplio (0-7 años)',
        'Multiples metodos de evaluacion',
        'Buena para planificacion de intervencion',
        'Incluye grupos especiales en normas',
        'Subescalas detalladas'
      ],
      limitaciones: [
        'Administracion muy larga (1-2 horas completa)',
        'Requiere formacion',
        'Datos de 2005',
        'Menos sensible que Bayley en edad temprana'
      ],
      mejor_para: 'Evaluacion integral para planificacion educativa e intervencion',
      cobertura_dominios: 'Muy completa (5 dominios con 13 subescalas)',
      validacion: 'Muestra normativa n=2,500 con grupos especiales',
      edad_rango: 'Nacimiento - 7 años 11 meses'
    }
  };
  
  return info[fuenteId] || {};
}

// ==================== RUTAS DE HITOS NORMATIVOS ====================

app.get('/api/hitos-normativos', (req, res) => {
  const fuenteNormativaId = req.query.fuente || 1;
  
  const query = `
    SELECT hn.*, d.nombre as dominio_nombre
    FROM hitos_normativos hn
    JOIN dominios d ON hn.dominio_id = d.id
    WHERE hn.fuente_normativa_id = ?
    ORDER BY hn.edad_media_meses, d.id
  `;
  db.all(query, [fuenteNormativaId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/hitos-normativos/dominio/:dominioId', (req, res) => {
  const query = `
    SELECT * FROM hitos_normativos 
    WHERE dominio_id = ?
    ORDER BY edad_media_meses
  `;
  db.all(query, [req.params.dominioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==================== RUTAS DE HITOS CONSEGUIDOS ====================

app.get('/api/hitos-conseguidos/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  
  // Para usuarios invitados, devolver array vacío (datos en memoria del cliente)
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    const query = `
      SELECT hc.*, hn.nombre as hito_nombre, hn.dominio_id, 
             hn.edad_media_meses, hn.desviacion_estandar,
             d.nombre as dominio_nombre
      FROM hitos_conseguidos hc
      JOIN hitos_normativos hn ON hc.hito_id = hn.id
      JOIN dominios d ON hn.dominio_id = d.id
      WHERE hc.nino_id = ?
      ORDER BY hc.edad_conseguido_meses
    `;
    db.all(query, [ninoId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.post('/api/hitos-conseguidos', verificarToken, (req, res) => {
  const { nino_id, hito_id, edad_conseguido_meses, fecha_registro, notas, edad_perdido_meses, fecha_perdido } = req.body;
  
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.run(`INSERT INTO hitos_conseguidos 
      (nino_id, hito_id, edad_conseguido_meses, fecha_registro, notas, edad_perdido_meses, fecha_perdido) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nino_id, hito_id, edad_conseguido_meses, fecha_registro, notas, edad_perdido_meses || null, fecha_perdido || null],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

// Nuevo endpoint para registrar pérdida de hito (regresión)
app.put('/api/hitos-conseguidos/:id/registrar-perdida', verificarToken, (req, res) => {
  const { edad_perdido_meses, fecha_perdido } = req.body;
  
  // Primero verificar que el hito conseguido pertenece a un niño del usuario
  db.get('SELECT nino_id FROM hitos_conseguidos WHERE id = ?', [req.params.id], (err, hito) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });

    verificarAccesoNino(hito.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run(`UPDATE hitos_conseguidos 
        SET edad_perdido_meses = ?, fecha_perdido = ?
        WHERE id = ?`,
        [edad_perdido_meses, fecha_perdido, req.params.id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, changes: this.changes });
        }
      );
    });
  });
});

app.delete('/api/hitos-conseguidos/:id', verificarToken, (req, res) => {
  // Primero verificar que el hito conseguido pertenece a un niño del usuario
  db.get('SELECT nino_id FROM hitos_conseguidos WHERE id = ?', [req.params.id], (err, hito) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });

    verificarAccesoNino(hito.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run('DELETE FROM hitos_conseguidos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// ==================== RUTAS DE HITOS NO ALCANZADOS ====================

app.get('/api/hitos-no-alcanzados/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  
  // Para usuarios invitados, devolver array vacío (datos en memoria del cliente)
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    const query = `
      SELECT hna.*, hn.nombre as hito_nombre, hn.dominio_id, 
             hn.edad_media_meses, hn.desviacion_estandar,
             d.nombre as dominio_nombre
      FROM hitos_no_alcanzados hna
      JOIN hitos_normativos hn ON hna.hito_id = hn.id
      JOIN dominios d ON hn.dominio_id = d.id
      WHERE hna.nino_id = ?
      ORDER BY hna.fecha_registro DESC
    `;
    db.all(query, [ninoId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.post('/api/hitos-no-alcanzados', verificarToken, (req, res) => {
  const { nino_id, hito_id, edad_evaluacion_meses, fecha_registro, notas } = req.body;
  
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.run(`INSERT INTO hitos_no_alcanzados 
      (nino_id, hito_id, edad_evaluacion_meses, fecha_registro, notas) 
      VALUES (?, ?, ?, ?, ?)`,
      [nino_id, hito_id, edad_evaluacion_meses, fecha_registro, notas],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

app.delete('/api/hitos-no-alcanzados/:id', verificarToken, (req, res) => {
  db.get('SELECT nino_id FROM hitos_no_alcanzados WHERE id = ?', [req.params.id], (err, hito) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });

    verificarAccesoNino(hito.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run('DELETE FROM hitos_no_alcanzados WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// ==================== RUTAS DE RED FLAGS ====================

app.get('/api/red-flags', (req, res) => {
  db.all('SELECT * FROM red_flags ORDER BY edad_relevante_meses', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/red-flags-observadas/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  
  // Para usuarios invitados, devolver array vacío
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    const query = `
      SELECT rfo.*, rf.nombre as flag_nombre, rf.descripcion as flag_descripcion
      FROM red_flags_observadas rfo
      JOIN red_flags rf ON rfo.red_flag_id = rf.id
      WHERE rfo.nino_id = ?
      ORDER BY rfo.edad_observada_meses
    `;
    db.all(query, [ninoId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.post('/api/red-flags-observadas', verificarToken, (req, res) => {
  const { nino_id, red_flag_id, edad_observada_meses, fecha_registro, notas, severidad } = req.body;
  
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.run(`INSERT INTO red_flags_observadas 
      (nino_id, red_flag_id, edad_observada_meses, fecha_registro, notas, severidad) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nino_id, red_flag_id, edad_observada_meses, fecha_registro, notas, severidad || 1],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

app.delete('/api/red-flags-observadas/:id', verificarToken, (req, res) => {
  db.get('SELECT nino_id FROM red_flags_observadas WHERE id = ?', [req.params.id], (err, flag) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!flag) return res.status(404).json({ error: 'Red flag no encontrada' });

    verificarAccesoNino(flag.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run('DELETE FROM red_flags_observadas WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// ==================== ESTADISTICAS Y ANALISIS ====================

app.get('/api/analisis/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  const fuenteNormativaId = req.query.fuente || 1;
  
  // Para usuarios invitados, devolver datos mock vacíos
  if (req.usuario.rol === 'invitado') {
    return res.json({
      nino: {
        id: ninoId,
        nombre: 'Niño de Ejemplo',
        fecha_nacimiento: new Date().toISOString().split('T')[0],
        semanas_gestacion: 40,
        usuario_id: req.usuario.id
      },
      edad_actual_meses: 12,
      hitos_conseguidos: [],
      estadisticas_por_dominio: {},
      total_hitos: 0
    });
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.get('SELECT * FROM ninos WHERE id = ?', [ninoId], (err, nino) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!nino) return res.status(404).json({ error: 'Niño no encontrado' });
      
      const fechaNac = new Date(nino.fecha_nacimiento);
      const hoy = new Date();
      const edadMeses = (hoy - fechaNac) / (1000 * 60 * 60 * 24 * 30.44);
      
      const queryHitos = `
        SELECT hc.*, 
               hn.nombre as hito_nombre, 
               hn.dominio_id,
             hn.edad_media_meses, 
             hn.desviacion_estandar,
             d.nombre as dominio_nombre,
             hn.fuente_normativa_id,
             (hn.edad_media_meses - hc.edad_conseguido_meses) / hn.desviacion_estandar as z_score
      FROM hitos_conseguidos hc
      JOIN hitos_normativos hn_original ON hc.hito_id = hn_original.id
      JOIN hitos_normativos hn ON (
        hn.nombre = hn_original.nombre AND 
        hn.dominio_id = hn_original.dominio_id AND
        hn.fuente_normativa_id = ?
      )
      JOIN dominios d ON hn.dominio_id = d.id
      WHERE hc.nino_id = ?
      ORDER BY hc.edad_conseguido_meses
    `;
    
    db.all(queryHitos, [fuenteNormativaId, ninoId], (err, hitos) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const estadisticasPorDominio = {};
      hitos.forEach(hito => {
        if (!estadisticasPorDominio[hito.dominio_id]) {
          estadisticasPorDominio[hito.dominio_id] = {
            dominio_nombre: hito.dominio_nombre,
            z_scores: [],
            total_hitos: 0
          };
        }
        estadisticasPorDominio[hito.dominio_id].z_scores.push(hito.z_score);
        estadisticasPorDominio[hito.dominio_id].total_hitos++;
      });
      
      Object.keys(estadisticasPorDominio).forEach(dominioId => {
        const stats = estadisticasPorDominio[dominioId];
        const zScores = stats.z_scores;
        stats.z_score_promedio = zScores.reduce((a, b) => a + b, 0) / zScores.length;
        stats.z_score_min = Math.min(...zScores);
        stats.z_score_max = Math.max(...zScores);
      });
      
      res.json({
        nino,
        edad_actual_meses: edadMeses,
        hitos_conseguidos: hitos,
        estadisticas_por_dominio: estadisticasPorDominio,
        total_hitos: hitos.length
      });
    });
  }); // Cierre de db.get nino
  }); // Cierre de verificarAccesoNino
});

// ==================== RUTAS DE ESCALAS ESTANDARIZADAS ====================

// Obtener todas las evaluaciones de un niño
app.get('/api/escalas-evaluaciones/:ninoId', verificarToken, (req, res) => {
  const { ninoId } = req.params;
  
  verificarAccesoNino(req.usuario, ninoId, (tieneAcceso) => {
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tiene acceso a este niño' });
    }
    
    const query = `
      SELECT * FROM escalas_evaluaciones 
      WHERE nino_id = ? 
      ORDER BY fecha_evaluacion DESC
    `;
    
    db.all(query, [ninoId], (err, rows) => {
      if (err) {
        console.error('Error al obtener evaluaciones:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
});

// Crear nueva evaluación con escala
app.post('/api/escalas-evaluaciones', verificarToken, (req, res) => {
  const { 
    nino_id, 
    escala, 
    fecha_evaluacion, 
    edad_evaluacion_meses,
    puntuaciones,
    profesional_evaluador,
    centro_evaluacion,
    notas 
  } = req.body;
  
  // Validar datos requeridos
  if (!nino_id || !escala || !fecha_evaluacion || !edad_evaluacion_meses || !puntuaciones) {
    return res.status(400).json({ 
      error: 'Faltan datos requeridos: nino_id, escala, fecha_evaluacion, edad_evaluacion_meses, puntuaciones' 
    });
  }
  
  verificarAccesoNino(req.usuario, nino_id, (tieneAcceso) => {
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tiene acceso a este niño' });
    }
    
    const query = `
      INSERT INTO escalas_evaluaciones (
        nino_id, escala, fecha_evaluacion, edad_evaluacion_meses, 
        puntuaciones, profesional_evaluador, centro_evaluacion, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      query,
      [
        nino_id, 
        escala, 
        fecha_evaluacion, 
        edad_evaluacion_meses,
        puntuaciones, // Ya es JSON string
        profesional_evaluador || null,
        centro_evaluacion || null,
        notas || null
      ],
      function(err) {
        if (err) {
          console.error('Error al crear evaluación:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          id: this.lastID,
          mensaje: 'Evaluación creada correctamente' 
        });
      }
    );
  });
});

// Eliminar evaluación
app.delete('/api/escalas-evaluaciones/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  
  // Primero verificar que la evaluación existe y el usuario tiene acceso al niño
  db.get(
    'SELECT nino_id FROM escalas_evaluaciones WHERE id = ?',
    [id],
    (err, evaluacion) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!evaluacion) {
        return res.status(404).json({ error: 'Evaluación no encontrada' });
      }
      
      verificarAccesoNino(req.usuario, evaluacion.nino_id, (tieneAcceso) => {
        if (!tieneAcceso) {
          return res.status(403).json({ error: 'No tiene acceso a esta evaluación' });
        }
        
        db.run(
          'DELETE FROM escalas_evaluaciones WHERE id = ?',
          [id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
              return res.status(404).json({ error: 'Evaluación no encontrada' });
            }
            res.json({ mensaje: 'Evaluación eliminada correctamente' });
          }
        );
      });
    }
  );
});

// ==================== RUTA DE ITINERARIO (DATOS PROSPECTIVOS) ====================

// Obtener itinerario de desarrollo con evaluaciones prospectivas
app.get('/api/itinerario/:ninoId', verificarToken, (req, res) => {
  const { ninoId } = req.params;
  const fuenteNormativaId = req.query.fuente || 1;
  
  // Para usuarios invitados, devolver datos vacíos (no tienen evaluaciones prospectivas guardadas)
  if (req.usuario.rol === 'invitado') {
    return res.json({
      nino: {
        id: ninoId,
        nombre: 'Niño de Ejemplo',
        fecha_nacimiento: new Date().toISOString().split('T')[0],
        semanas_gestacion: 40,
        usuario_id: req.usuario.id
      },
      evaluaciones: [],
      fuente_normativa_id: parseInt(fuenteNormativaId)
    });
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });
    
    // Obtener datos del niño
    db.get('SELECT * FROM ninos WHERE id = ?', [ninoId], (err, nino) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!nino) return res.status(404).json({ error: 'Niño no encontrado' });
      
      // Obtener evaluaciones con escalas estandarizadas
      const queryEvaluaciones = `
        SELECT * FROM escalas_evaluaciones 
        WHERE nino_id = ? 
        ORDER BY edad_evaluacion_meses
      `;
      
      db.all(queryEvaluaciones, [ninoId], (err, evaluaciones) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Parsear puntuaciones JSON
        const evaluacionesProcesadas = evaluaciones.map(ev => ({
          ...ev,
          puntuaciones: typeof ev.puntuaciones === 'string' ? JSON.parse(ev.puntuaciones) : ev.puntuaciones
        }));
        
        res.json({
          nino,
          evaluaciones: evaluacionesProcesadas,
          fuente_normativa_id: parseInt(fuenteNormativaId)
        });
      });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://0.0.0.0:${PORT}`);
});
