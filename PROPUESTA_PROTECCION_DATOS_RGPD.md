# Propuesta de Cumplimiento RGPD y LOPDGDD para Datos de Salud

## RESUMEN EJECUTIVO

Este documento detalla las medidas necesarias para que el sistema de seguimiento del neurodesarrollo cumpla con:
- **RGPD** (Reglamento General de Protección de Datos UE 2016/679)
- **LOPDGDD** (Ley Orgánica 3/2018 de Protección de Datos española)
- **Normativa específica de datos de salud** (categoría especial - Art. 9 RGPD)

### Datos Sensibles Almacenados
El sistema almacena **datos de salud** (categoría especial RGPD Art. 9):
- Hitos del desarrollo infantil
- Señales de alarma (red flags)
- Fechas de nacimiento y edad gestacional
- Evaluaciones del desarrollo neurológico
- Notas clínicas

---

## 1. MEDIDAS TÉCNICAS Y ORGANIZATIVAS (Art. 32 RGPD)

### 1.1 Seguridad de Almacenamiento de Datos

#### ❌ **PROBLEMA ACTUAL**
- Contraseñas hasheadas con bcrypt (✅ correcto)
- Base de datos SQLite **sin cifrado**
- Sin cifrado de datos sensibles en reposo
- Sin anonimización de datos personales

#### ✅ **PROPUESTAS**

##### A) Cifrado de Base de Datos (CRÍTICO)
```javascript
// Implementar SQLCipher para SQLite
const sqlite3 = require('@journeyapps/sqlcipher').verbose();

const db = new sqlite3.Database(dbPath);
// Establecer clave de cifrado desde variable de entorno
db.run(`PRAGMA key = '${process.env.DB_ENCRYPTION_KEY}'`);
```

**Acciones:**
1. Migrar a `@journeyapps/sqlcipher` o `better-sqlite3-sqlcipher`
2. Generar clave de cifrado fuerte (256-bit AES)
3. Almacenar clave en gestor de secretos (AWS Secrets Manager, Azure Key Vault, o HashiCorp Vault)
4. **NO** almacenar clave en código o .env en producción

##### B) Cifrado de Datos Sensibles en Columnas

```javascript
const crypto = require('crypto');

// Cifrar datos sensibles antes de almacenar
function cifrarDato(texto, clave) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(clave, 'hex'), iv);
  let cifrado = cipher.update(texto, 'utf8', 'hex');
  cifrado += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${cifrado}`;
}

function descifrarDato(datoCifrado, clave) {
  const [iv, authTag, cifrado] = datoCifrado.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm', 
    Buffer.from(clave, 'hex'), 
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let descifrado = decipher.update(cifrado, 'hex', 'utf8');
  descifrado += decipher.final('utf8');
  return descifrado;
}
```

**Campos a cifrar:**
- `ninos.nombre` (nombre del niño)
- `hitos_conseguidos.notas`
- `red_flags_observadas.notas`
- `hitos_no_alcanzados.notas`

##### C) Seudonimización de Identificadores

```javascript
// Añadir campos seudonimizados
ALTER TABLE ninos ADD COLUMN codigo_seudonimo TEXT UNIQUE;
ALTER TABLE ninos ADD COLUMN nombre_cifrado TEXT;

// Generar códigos aleatorios para identificación
function generarSeudonimo() {
  return `NSD-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}
```

---

### 1.2 Seguridad de Comunicaciones

#### ❌ **PROBLEMA ACTUAL**
- Backend acepta HTTP en desarrollo
- Sin forzado de HTTPS

#### ✅ **PROPUESTAS**

##### A) Forzar HTTPS en Producción

```javascript
// server.js - Añadir al inicio
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

##### B) Configurar Headers de Seguridad

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));
```

##### C) Certificados SSL/TLS

**Para producción:**
- Usar Let's Encrypt para certificados gratuitos
- Configurar renovación automática
- Usar TLS 1.3 mínimo

---

### 1.3 Control de Acceso y Autenticación

#### ❌ **PROBLEMA ACTUAL**
- JWT sin expiración configurable
- Sin registro de auditoría de accesos
- Sin autenticación de dos factores (2FA)
- Sin gestión de sesiones

#### ✅ **PROPUESTAS**

##### A) Mejorar Sistema JWT

```javascript
// authMiddleware.js
const jwt = require('jsonwebtoken');

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '8h', // Expiración obligatoria
      issuer: 'neuropedialab.org',
      audience: 'devel-tracking-app'
    }
  );
}

// Implementar refresh tokens
function generarRefreshToken(usuario) {
  return jwt.sign(
    { id: usuario.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
}
```

##### B) Registro de Auditoría (OBLIGATORIO RGPD Art. 30)

```javascript
// Crear tabla de auditoría
db.run(`CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER,
  usuario_email TEXT,
  accion TEXT NOT NULL,
  recurso TEXT NOT NULL,
  recurso_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  resultado TEXT,
  detalles TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)`);

// Middleware de auditoría
function registrarAuditoria(req, accion, recurso, recursoId, resultado) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  db.run(`
    INSERT INTO auditoria (usuario_id, usuario_email, accion, recurso, recurso_id, ip_address, user_agent, resultado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    req.usuario?.id || null,
    req.usuario?.email || 'anónimo',
    accion,
    recurso,
    recursoId,
    ip,
    userAgent,
    resultado
  ]);
}

// Usar en cada endpoint crítico
app.get('/api/ninos/:id', verificarToken, (req, res) => {
  const ninoId = req.params.id;
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, acceso) => {
    if (!acceso) {
      registrarAuditoria(req, 'LECTURA', 'nino', ninoId, 'DENEGADO');
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    // ... código existente ...
    registrarAuditoria(req, 'LECTURA', 'nino', ninoId, 'PERMITIDO');
  });
});
```

##### C) Autenticación de Dos Factores (2FA) - RECOMENDADO

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Añadir campos a tabla usuarios
ALTER TABLE usuarios ADD COLUMN twofa_secret TEXT;
ALTER TABLE usuarios ADD COLUMN twofa_enabled INTEGER DEFAULT 0;

// Endpoint para activar 2FA
app.post('/api/auth/2fa/activar', verificarToken, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `Neuropedialab (${req.usuario.email})`
  });
  
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  // Guardar secret temporalmente (confirmar con código)
  req.session.temp2FASecret = secret.base32;
  
  res.json({ 
    qrCode: qrCodeUrl,
    secret: secret.base32 // Para entrada manual
  });
});

// Verificar código 2FA en login
function verificar2FA(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
}
```

---

## 2. DERECHOS DE LOS INTERESADOS (Art. 15-22 RGPD)

### 2.1 Derecho de Acceso (Art. 15)

```javascript
// Endpoint para exportar todos los datos de un usuario
app.get('/api/rgpd/mis-datos', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  
  // Recopilar todos los datos
  const datosCompletos = {
    usuario: {},
    ninos: [],
    hitos: [],
    redFlags: [],
    auditoria: []
  };
  
  // Query de todos los datos del usuario
  db.get('SELECT id, email, nombre, rol, creado_en FROM usuarios WHERE id = ?', 
    [usuarioId], (err, usuario) => {
    datosCompletos.usuario = usuario;
    
    // Obtener niños
    db.all('SELECT * FROM ninos WHERE usuario_id = ?', [usuarioId], (err, ninos) => {
      datosCompletos.ninos = ninos;
      
      // Para cada niño, obtener hitos y red flags
      // ... (código para recopilar todo)
      
      registrarAuditoria(req, 'ACCESO_DATOS', 'usuario', usuarioId, 'EXPORTACION_COMPLETA');
      res.json(datosCompletos);
    });
  });
});
```

### 2.2 Derecho de Rectificación (Art. 16)

**YA IMPLEMENTADO** - Los usuarios pueden editar datos de niños

### 2.3 Derecho de Supresión/"Derecho al Olvido" (Art. 17)

```javascript
// Endpoint para eliminar cuenta y todos los datos
app.delete('/api/rgpd/eliminar-cuenta', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { confirmacion, password } = req.body;
  
  if (confirmacion !== 'ELIMINAR PERMANENTEMENTE') {
    return res.status(400).json({ error: 'Confirmación incorrecta' });
  }
  
  // Verificar contraseña
  db.get('SELECT password_hash FROM usuarios WHERE id = ?', [usuarioId], (err, usuario) => {
    if (!bcrypt.compareSync(password, usuario.password_hash)) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // Registrar antes de eliminar
    registrarAuditoria(req, 'SUPRESION', 'usuario', usuarioId, 'ELIMINACION_COMPLETA');
    
    db.serialize(() => {
      // Eliminar en orden (foreign keys)
      db.run('DELETE FROM hitos_conseguidos WHERE nino_id IN (SELECT id FROM ninos WHERE usuario_id = ?)', [usuarioId]);
      db.run('DELETE FROM hitos_no_alcanzados WHERE nino_id IN (SELECT id FROM ninos WHERE usuario_id = ?)', [usuarioId]);
      db.run('DELETE FROM red_flags_observadas WHERE nino_id IN (SELECT id FROM ninos WHERE usuario_id = ?)', [usuarioId]);
      db.run('DELETE FROM ninos WHERE usuario_id = ?', [usuarioId]);
      db.run('DELETE FROM usuarios WHERE id = ?', [usuarioId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al eliminar cuenta' });
        }
        res.json({ mensaje: 'Cuenta eliminada permanentemente' });
      });
    });
  });
});
```

### 2.4 Derecho a la Portabilidad (Art. 20)

```javascript
// Endpoint para exportar datos en formato estructurado
app.get('/api/rgpd/exportar-datos', verificarToken, (req, res) => {
  const formato = req.query.formato || 'json'; // json, csv, xml
  
  // Recopilar datos
  // ...
  
  if (formato === 'json') {
    res.json(datosCompletos);
  } else if (formato === 'csv') {
    // Convertir a CSV
    const csv = convertirACSV(datosCompletos);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=mis_datos.csv');
    res.send(csv);
  }
  
  registrarAuditoria(req, 'EXPORTACION', 'usuario', req.usuario.id, `FORMATO_${formato}`);
});
```

---

## 3. CONSENTIMIENTO INFORMADO (Art. 6 y 9 RGPD)

### 3.1 Bases Legales para Tratamiento de Datos de Salud

Para datos de salud (categoría especial), necesitamos:

**Art. 9.2.h RGPD**: Medicina preventiva o laboral, diagnóstico médico, gestión de servicios sanitarios

**Implementación:**

```javascript
// Crear tabla de consentimientos
db.run(`CREATE TABLE IF NOT EXISTS consentimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  tipo_consentimiento TEXT NOT NULL,
  version_documento TEXT NOT NULL,
  aceptado INTEGER DEFAULT 0,
  fecha_aceptacion DATETIME,
  ip_aceptacion TEXT,
  texto_consentimiento TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)`);

// Tipos de consentimiento necesarios:
// - TERMINOS_SERVICIO
// - POLITICA_PRIVACIDAD
// - TRATAMIENTO_DATOS_SALUD
// - COMUNICACIONES_COMERCIALES (opcional)
```

### 3.2 Formulario de Consentimiento en Registro

```javascript
// Componente React para consentimiento
const FormularioConsentimiento = () => {
  const [aceptados, setAceptados] = useState({
    terminos: false,
    privacidad: false,
    datosSalud: false,
    comunicaciones: false // Opcional
  });
  
  return (
    <form>
      {/* Información del responsable del tratamiento */}
      <div className="informacion-responsable">
        <h3>Responsable del Tratamiento</h3>
        <p><strong>Identidad:</strong> NeuropediaLab</p>
        <p><strong>NIF:</strong> [RELLENAR]</p>
        <p><strong>Dirección:</strong> [RELLENAR]</p>
        <p><strong>Email contacto:</strong> dpo@neuropedialab.org</p>
      </div>
      
      {/* Consentimientos obligatorios */}
      <label>
        <input
          type="checkbox"
          checked={aceptados.datosSalud}
          onChange={(e) => setAceptados({...aceptados, datosSalud: e.target.checked})}
          required
        />
        <strong>* He leído y acepto el tratamiento de datos de salud</strong>
        <p style={{fontSize: '0.9em', color: '#666'}}>
          Consiento el tratamiento de datos de salud del desarrollo infantil 
          con fines de seguimiento clínico y evaluación neurológica. 
          Estos datos serán tratados confidencialmente según la normativa sanitaria vigente.
          <a href="/politica-privacidad" target="_blank">Leer más</a>
        </p>
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={aceptados.privacidad}
          onChange={(e) => setAceptados({...aceptados, privacidad: e.target.checked})}
          required
        />
        <strong>* Acepto la Política de Privacidad</strong>
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={aceptados.terminos}
          onChange={(e) => setAceptados({...aceptados, terminos: e.target.checked})}
          required
        />
        <strong>* Acepto los Términos y Condiciones</strong>
      </label>
      
      {/* Consentimiento opcional */}
      <label>
        <input
          type="checkbox"
          checked={aceptados.comunicaciones}
          onChange={(e) => setAceptados({...aceptados, comunicaciones: e.target.checked})}
        />
        Acepto recibir comunicaciones sobre actualizaciones y mejoras del servicio
      </label>
    </form>
  );
};
```

### 3.3 Endpoint para Registrar Consentimientos

```javascript
app.post('/api/auth/registro-con-consentimiento', async (req, res) => {
  const { email, password, nombre, consentimientos } = req.body;
  
  // Validar que consentimientos obligatorios estén aceptados
  if (!consentimientos.datosSalud || !consentimientos.privacidad || !consentimientos.terminos) {
    return res.status(400).json({ 
      error: 'Debes aceptar los consentimientos obligatorios' 
    });
  }
  
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const passwordHash = bcrypt.hashSync(password, 10);
  
  db.run(
    'INSERT INTO usuarios (email, password_hash, nombre, rol) VALUES (?, ?, ?, ?)',
    [email, passwordHash, nombre, 'usuario'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear usuario' });
      }
      
      const usuarioId = this.lastID;
      const fechaAhora = new Date().toISOString();
      
      // Registrar consentimientos
      const tiposConsentimiento = [
        { tipo: 'TRATAMIENTO_DATOS_SALUD', aceptado: consentimientos.datosSalud },
        { tipo: 'POLITICA_PRIVACIDAD', aceptado: consentimientos.privacidad },
        { tipo: 'TERMINOS_SERVICIO', aceptado: consentimientos.terminos },
        { tipo: 'COMUNICACIONES_COMERCIALES', aceptado: consentimientos.comunicaciones }
      ];
      
      const stmt = db.prepare(`
        INSERT INTO consentimientos 
        (usuario_id, tipo_consentimiento, version_documento, aceptado, fecha_aceptacion, ip_aceptacion)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      tiposConsentimiento.forEach(c => {
        if (c.aceptado) {
          stmt.run(
            usuarioId,
            c.tipo,
            '1.0', // Versión del documento
            1,
            fechaAhora,
            ip
          );
        }
      });
      
      stmt.finalize();
      
      registrarAuditoria(req, 'REGISTRO', 'usuario', usuarioId, 'CUENTA_CREADA_CON_CONSENTIMIENTOS');
      
      res.status(201).json({ 
        mensaje: 'Usuario registrado correctamente',
        usuarioId: usuarioId
      });
    }
  );
});
```

---

## 4. DOCUMENTOS LEGALES OBLIGATORIOS

### 4.1 Política de Privacidad

**Contenido mínimo obligatorio:**

1. **Identidad y datos de contacto del responsable**
   - Nombre: NeuropediaLab
   - NIF: [RELLENAR]
   - Dirección: [RELLENAR]
   - Email: dpo@neuropedialab.org
   - Delegado de Protección de Datos (DPO): [RELLENAR]

2. **Finalidades del tratamiento**
   - Seguimiento del desarrollo neurológico infantil
   - Evaluación de hitos del desarrollo
   - Identificación de señales de alarma
   - Generación de informes clínicos

3. **Base jurídica**
   - Consentimiento explícito (Art. 6.1.a RGPD)
   - Interés legítimo en salud (Art. 9.2.h RGPD)

4. **Categorías de datos**
   - Datos identificativos: email, nombre
   - Datos de salud: fechas nacimiento, hitos desarrollo, evaluaciones
   - Datos de navegación: logs de acceso

5. **Destinatarios**
   - No se ceden datos a terceros
   - Hosting: [PROVEEDOR] (con DPA firmado)

6. **Transferencias internacionales**
   - NO SE REALIZAN (datos almacenados en UE)

7. **Plazos de conservación**
   - Datos clínicos: Hasta solicitud de supresión + 5 años (prescripción legal)
   - Logs de auditoría: 3 años
   - Backups: 90 días

8. **Derechos del interesado**
   - Acceso, rectificación, supresión, portabilidad
   - Limitación del tratamiento, oposición
   - Contacto: dpo@neuropedialab.org

9. **Seguridad**
   - Cifrado de datos en reposo y en tránsito
   - Control de accesos basado en roles
   - Auditoría de accesos

10. **Cookies y tecnologías de seguimiento**
    - Cookies técnicas esenciales
    - NO se usan cookies de marketing/analíticas sin consentimiento

### 4.2 Información en la Primera Capa (Transparencia)

```jsx
// Banner informativo en primera página
<div className="banner-rgpd">
  <p>
    Tratamos datos de salud con finalidades clínicas de seguimiento del neurodesarrollo.
    Responsable: NeuropediaLab | DPO: dpo@neuropedialab.org
  </p>
  <p>
    <a href="/politica-privacidad">Política de Privacidad</a> |
    <a href="/aviso-legal">Aviso Legal</a> |
    <a href="/cookies">Política de Cookies</a>
  </p>
</div>
```

---

## 5. EVALUACIÓN DE IMPACTO (EIPD) - Art. 35 RGPD

### 5.1 ¿Es necesaria una EIPD?

**SÍ**, porque:
- ✅ Tratamiento de categorías especiales (datos de salud)
- ✅ Datos de menores (más sensibles)
- ✅ Tratamiento sistemático y extenso

### 5.2 Contenido de la EIPD

```markdown
# EVALUACIÓN DE IMPACTO EN PROTECCIÓN DE DATOS (EIPD)

## 1. Descripción sistemática de las operaciones de tratamiento

- **Sistema**: Aplicación web de seguimiento del neurodesarrollo infantil
- **Datos tratados**: Datos de salud, identificación, evaluaciones
- **Finalidad**: Evaluación clínica del desarrollo neurológico
- **Responsable**: NeuropediaLab
- **Encargados**: [Proveedor de hosting]
- **Destinatarios**: Solo profesionales autorizados
- **Transferencias**: NO
- **Plazo conservación**: Hasta solicitud eliminación + 5 años

## 2. Necesidad y proporcionalidad

- **Necesidad**: Datos mínimos necesarios para evaluación clínica
- **Proporcionalidad**: Solo se recogen datos relevantes
- **Alternativas**: No existen alternativas menos invasivas

## 3. Riesgos para derechos y libertades

| Riesgo | Probabilidad | Impacto | Medidas |
|--------|--------------|---------|---------|
| Acceso no autorizado | Media | Alto | Cifrado, autenticación 2FA |
| Fuga de datos | Baja | Muy Alto | Cifrado DB, backups cifrados |
| Suplantación identidad | Media | Alto | Autenticación robusta |
| Pérdida de datos | Baja | Alto | Backups automáticos |

## 4. Medidas previstas

- Cifrado AES-256 de base de datos
- Autenticación multifactor
- Auditoría completa de accesos
- Formación del personal
- Política de seguridad documentada
- Plan de respuesta a brechas

## 5. Conclusión

Los riesgos son aceptables con las medidas implementadas.
Revisión anual de la EIPD.
```

---

## 6. REGISTRO DE ACTIVIDADES DE TRATAMIENTO (Art. 30 RGPD)

```javascript
// Crear tabla para registro de actividades
db.run(`CREATE TABLE IF NOT EXISTS registro_actividades_tratamiento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_tratamiento TEXT NOT NULL,
  finalidad TEXT NOT NULL,
  descripcion TEXT,
  base_legal TEXT NOT NULL,
  categorias_interesados TEXT,
  categorias_datos TEXT,
  destinatarios TEXT,
  transferencias_internacionales TEXT,
  plazos_supresion TEXT,
  medidas_seguridad TEXT,
  ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Insertar actividades de tratamiento
const actividades = [
  {
    nombre: 'Gestión de usuarios y autenticación',
    finalidad: 'Permitir acceso seguro al sistema',
    base_legal: 'Ejecución de contrato (Art. 6.1.b RGPD)',
    categorias_interesados: 'Profesionales sanitarios, padres/tutores',
    categorias_datos: 'Identificativos (email, nombre), credenciales',
    destinatarios: 'Ninguno',
    transferencias: 'NO',
    plazos: 'Hasta baja del servicio',
    medidas: 'Hash bcrypt contraseñas, JWT tokens, HTTPS'
  },
  {
    nombre: 'Seguimiento del neurodesarrollo infantil',
    finalidad: 'Evaluación clínica del desarrollo neurológico',
    base_legal: 'Consentimiento explícito datos salud (Art. 9.2.a RGPD) + Medicina preventiva (Art. 9.2.h)',
    categorias_interesados: 'Menores (pacientes)',
    categorias_datos: 'Salud (hitos desarrollo, señales alarma), fecha nacimiento',
    destinatarios: 'Profesionales sanitarios autorizados',
    transferencias: 'NO',
    plazos: 'Solicitud supresión + 5 años (historia clínica)',
    medidas: 'Cifrado AES-256, control acceso basado en roles, auditoría'
  }
];
```

---

## 7. NOTIFICACIÓN DE BRECHAS DE SEGURIDAD (Art. 33-34 RGPD)

### 7.1 Procedimiento de Respuesta a Brechas

```javascript
// Crear tabla de incidentes
db.run(`CREATE TABLE IF NOT EXISTS incidentes_seguridad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_deteccion DATETIME NOT NULL,
  fecha_ocurrencia DATETIME,
  tipo_incidente TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  datos_afectados TEXT,
  usuarios_afectados INTEGER,
  gravedad TEXT NOT NULL,
  medidas_adoptadas TEXT,
  notificado_aepd INTEGER DEFAULT 0,
  fecha_notificacion_aepd DATETIME,
  afectados_notificados INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'ABIERTO',
  responsable_gestion TEXT,
  notas TEXT
)`);

// Función para evaluar si requiere notificación a AEPD (72h)
function evaluarGravedadBrecha(incidente) {
  // Alto riesgo → notificar AEPD Y afectados
  // Riesgo → notificar solo AEPD
  // Bajo riesgo → registro interno
  
  const criteriosAltoRiesgo = [
    incidente.datosAfectados.includes('salud'),
    incidente.usuariosAfectados > 100,
    incidente.tipo === 'ACCESO_NO_AUTORIZADO',
    incidente.tipo === 'FUGA_DATOS',
    !incidente.datosCifrados
  ];
  
  const puntaje = criteriosAltoRiesgo.filter(Boolean).length;
  
  if (puntaje >= 3) {
    return 'ALTO_RIESGO'; // Notificar AEPD + afectados
  } else if (puntaje >= 1) {
    return 'RIESGO'; // Notificar AEPD
  } else {
    return 'BAJO_RIESGO'; // Solo registro interno
  }
}
```

### 7.2 Plantilla de Notificación a AEPD

```markdown
# NOTIFICACIÓN DE BRECHA DE SEGURIDAD A LA AEPD

**Fecha de notificación**: [FECHA]
**Responsable del tratamiento**: NeuropediaLab

## 1. Descripción de la brecha
- **Naturaleza**: [Acceso no autorizado / Pérdida / Destrucción / Fuga]
- **Fecha de ocurrencia**: [FECHA]
- **Fecha de detección**: [FECHA]

## 2. Categorías y número aproximado de interesados afectados
- **Número de afectados**: [NÚMERO]
- **Categorías**: [Profesionales / Padres / Menores]

## 3. Categorías y número aproximado de registros de datos afectados
- **Tipo de datos**: [Identificativos / Salud / Contacto]
- **Número de registros**: [NÚMERO]

## 4. Consecuencias probables
- [Descripción de impacto potencial]

## 5. Medidas adoptadas o propuestas
- [Medidas inmediatas]
- [Medidas a medio plazo]
- [Medidas preventivas futuras]

## 6. Datos de contacto del DPO
- **Nombre**: [NOMBRE]
- **Email**: dpo@neuropedialab.org
- **Teléfono**: [TELÉFONO]
```

---

## 8. MEDIDAS ORGANIZATIVAS

### 8.1 Nombrar Delegado de Protección de Datos (DPO)

**¿Es obligatorio?**
- Si se tratan datos de salud a gran escala: **SÍ**
- Si es administración pública: **SÍ**
- Si el tratamiento implica observación sistemática a gran escala: **SÍ**

**Funciones del DPO:**
- Informar y asesorar sobre obligaciones RGPD
- Supervisar cumplimiento
- Asesorar sobre EIPD
- Cooperar con autoridad de control
- Ser punto de contacto para AEPD

### 8.2 Formación del Personal

```markdown
# PROGRAMA DE FORMACIÓN EN PROTECCIÓN DE DATOS

## Contenidos mínimos:
1. Principios básicos RGPD
2. Categorías especiales de datos (salud)
3. Medidas de seguridad aplicables
4. Procedimiento ante brecha de seguridad
5. Derechos de los interesados
6. Confidencialidad y secreto profesional

## Periodicidad:
- Formación inicial: Al incorporarse
- Reciclaje: Anual
- Actualización: Cuando cambie normativa

## Registro:
- Mantener registro de asistencia
- Evaluación de conocimientos
- Certificado de formación
```

### 8.3 Política de Escritorio Limpio y Pantalla Limpia

```markdown
# POLÍTICA DE ESCRITORIO Y PANTALLA LIMPIA

## Escritorio limpio:
- No dejar documentos con datos personales en escritorio
- Destruir papeles con datos de forma segura (trituradora)
- Guardar documentos en armarios cerrados

## Pantalla limpia:
- Bloqueo automático de sesión tras 5 min inactividad
- No compartir sesiones de usuario
- Cerrar sesión al abandonar puesto
- Pantallas orientadas para evitar visión no autorizada
```

---

## 9. ACUERDOS DE TRATAMIENTO DE DATOS CON TERCEROS

### 9.1 Contrato con Proveedor de Hosting

**Cláusulas obligatorias (Art. 28 RGPD):**

```markdown
# CONTRATO DE ENCARGADO DE TRATAMIENTO

## Entre:
- **Responsable**: NeuropediaLab
- **Encargado**: [PROVEEDOR HOSTING]

## Objeto:
Prestación de servicios de alojamiento web y gestión de infraestructura

## Obligaciones del Encargado:

1. **Tratamiento conforme a instrucciones**
   - Solo tratar datos según instrucciones documentadas del Responsable
   
2. **Confidencialidad**
   - Personal con compromiso de confidencialidad
   - Acceso limitado al personal necesario

3. **Seguridad**
   - Medidas técnicas y organizativas apropiadas (Art. 32)
   - Cifrado, control de acceso, copias de seguridad
   
4. **Subcontratación**
   - Autorización previa y por escrito del Responsable
   - Mismas obligaciones de protección de datos
   
5. **Asistencia al Responsable**
   - Colaborar en respuesta a ejercicio de derechos
   - Notificar brechas de seguridad en 24h
   - Colaborar en EIPD y auditorías
   
6. **Supresión o devolución de datos**
   - Al finalizar prestación de servicios
   - Destrucción certificada de todos los datos
   
7. **Auditorías**
   - Permitir auditorías del Responsable o auditor autorizado
   - Proporcionar información necesaria

## Duración:
- Mientras dure la prestación del servicio

## Ubicación de los datos:
- Servidores en UE (España)
- NO transferencias internacionales

## Medidas de seguridad específicas:
- Cifrado en reposo (AES-256)
- Cifrado en tránsito (TLS 1.3)
- Backups cifrados diarios
- Control de acceso basado en roles
- Firewall y sistemas de detección de intrusiones
- Logs de auditoría conservados 3 años
```

---

## 10. BACKUPS Y RECUPERACIÓN ANTE DESASTRES

### 10.1 Política de Copias de Seguridad

```javascript
// Script de backup automatizado
const schedule = require('node-schedule');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Backup diario a las 2 AM
schedule.scheduleJob('0 2 * * *', function() {
  realizarBackup();
});

function realizarBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = `/backups/db_backup_${timestamp}.db`;
  
  // Copiar base de datos
  fs.copyFileSync('./neurodesarrollo_dev.db', backupPath);
  
  // Cifrar backup
  const clave = process.env.BACKUP_ENCRYPTION_KEY;
  const backupCifrado = cifrarArchivo(backupPath, clave);
  
  // Eliminar backup sin cifrar
  fs.unlinkSync(backupPath);
  
  // Subir a almacenamiento seguro (S3, Azure Blob, etc.)
  subirBackupANube(backupCifrado);
  
  // Eliminar backups antiguos (retención 90 días)
  eliminarBackupsAntiguos(90);
  
  console.log(`Backup realizado: ${backupCifrado}`);
}

function cifrarArchivo(rutaArchivo, clave) {
  const contenido = fs.readFileSync(rutaArchivo);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(clave, 'hex'), iv);
  
  const cifrado = Buffer.concat([cipher.update(contenido), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  const resultado = Buffer.concat([iv, authTag, cifrado]);
  const rutaCifrada = rutaArchivo + '.enc';
  fs.writeFileSync(rutaCifrada, resultado);
  
  return rutaCifrada;
}
```

### 10.2 Plan de Recuperación ante Desastres

```markdown
# PLAN DE RECUPERACIÓN ANTE DESASTRES (DRP)

## RPO (Recovery Point Objective)
- **Objetivo**: Pérdida máxima de datos tolerable
- **Valor**: 24 horas (backup diario)

## RTO (Recovery Time Objective)
- **Objetivo**: Tiempo máximo de recuperación tolerable
- **Valor**: 4 horas

## Procedimiento de Recuperación:

### 1. Evaluación del Incidente
- Determinar tipo de incidente
- Evaluar alcance de daños
- Activar equipo de respuesta

### 2. Recuperación de Datos
```bash
# Descargar último backup
aws s3 cp s3://backups-neuropedialab/db_backup_latest.db.enc .

# Descifrar backup
openssl enc -aes-256-gcm -d -in db_backup_latest.db.enc -out db_restored.db -K $BACKUP_KEY -iv $IV

# Restaurar base de datos
cp db_restored.db /app/server/neurodesarrollo_dev.db

# Verificar integridad
sqlite3 neurodesarrollo_dev.db "PRAGMA integrity_check;"

# Reiniciar servicio
docker-compose restart
```

### 3. Verificación
- Comprobar funcionamiento del sistema
- Verificar integridad de datos restaurados
- Validar con usuarios de prueba

### 4. Notificación
- Informar a usuarios afectados si procede
- Notificar a AEPD si hay brecha de seguridad
- Documentar incidente y recuperación

## Contactos de Emergencia:
- DPO: dpo@neuropedialab.org
- Responsable técnico: [NOMBRE] - [TELÉFONO]
- Proveedor de hosting: [CONTACTO 24/7]
```

---

## 11. RESUMEN DE IMPLEMENTACIÓN PRIORITARIA

### 🔴 **CRÍTICO (Implementar INMEDIATAMENTE)**

1. **Cifrado de base de datos** (SQLCipher)
2. **Registro de auditoría** completo
3. **Política de Privacidad** y documentos legales
4. **Sistema de consentimientos** en registro
5. **Backups cifrados** automáticos
6. **HTTPS obligatorio** en producción

### 🟡 **IMPORTANTE (Implementar en 1-3 meses)**

7. **Autenticación 2FA**
8. **Endpoints de derechos RGPD** (acceso, supresión, portabilidad)
9. **EIPD documentada**
10. **Contrato de encargado** con hosting
11. **Plan de respuesta a brechas**
12. **Registro de actividades de tratamiento**

### 🟢 **RECOMENDADO (Implementar en 3-6 meses)**

13. **Nombrar DPO** (si procede)
14. **Formación del personal**
15. **Auditoría externa de seguridad**
16. **Penetration testing**
17. **Política de escritorio limpio**
18. **Certificación ISO 27001** (opcional pero muy recomendable)

---

## 12. COSTES ESTIMADOS

| Medida | Coste Aproximado | Comentarios |
|--------|------------------|-------------|
| SQLCipher implementación | €0 (software libre) | Tiempo de desarrollo: 2-3 días |
| Certificado SSL (Let's Encrypt) | €0 | Gratuito, renovación automática |
| Gestor de secretos (AWS/Azure) | €50-100/mes | Según volumen |
| Auditoría externa | €2,000-5,000 | Anual |
| Servicios DPO externo | €500-1,500/mes | Si no hay DPO interno |
| Seguro de ciberseguridad | €1,000-3,000/año | Recomendable |
| Formación del personal | €200-500/persona | Una vez al año |
| **TOTAL ESTIMADO ANUAL** | **€10,000-20,000** | Excluyendo desarrollo interno |

---

## 13. RECURSOS Y PLANTILLAS

### Documentos a crear:

1. ✅ **Política de Privacidad**
2. ✅ **Aviso Legal**
3. ✅ **Política de Cookies**
4. ✅ **Formulario de consentimiento**
5. ✅ **EIPD (Evaluación de Impacto)**
6. ✅ **Registro de Actividades de Tratamiento**
7. ✅ **Procedimiento de respuesta a brechas**
8. ✅ **Contrato de encargado de tratamiento**
9. ✅ **Plan de formación**
10. ✅ **Plan de recuperación ante desastres**

### Enlaces útiles:

- **AEPD (Agencia Española de Protección de Datos)**: https://www.aepd.es
- **Guías AEPD para profesionales sanitarios**: https://www.aepd.es/es/areas-de-actuacion/sanidad
- **Formulario notificación brechas**: https://www.aepd.es/es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/brechas-de-datos-personales
- **Delegados de Protección de Datos**: https://www.aepd.es/es/areas-de-actuacion/delegado-de-proteccion-de-datos
- **Registro de Actividades de Tratamiento (modelo)**: https://www.aepd.es/es/documento/registro-actividades-tratamiento.pdf

---

## 14. CONTACTO Y SIGUIENTE PASOS

**¿Necesitas ayuda con la implementación?**

1. Consulta con abogado especialista en protección de datos
2. Contrata auditoría de cumplimiento RGPD
3. Contacta con la AEPD para consultas: https://www.aepd.es/es/contacto

**Mantenimiento continuo:**
- Revisión anual de EIPD
- Actualización de documentos legales
- Auditorías de seguridad periódicas
- Formación continua del personal
- Monitorización de accesos y auditoría

---

**Documento elaborado**: Noviembre 2024  
**Próxima revisión**: Noviembre 2025  
**Responsable**: [A DESIGNAR - DPO]
