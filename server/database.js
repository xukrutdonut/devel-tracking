const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'neurodesarrollo_dev.db');
const db = new sqlite3.Database(dbPath);

// Inicializar la base de datos
db.serialize(() => {
  // Tabla de configuración global del sistema
  db.run(`CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL
  )`);

  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'usuario',
    activo INTEGER DEFAULT 1,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME
  )`);

  // Tabla de niños
  db.run(`CREATE TABLE IF NOT EXISTS ninos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    semanas_gestacion INTEGER DEFAULT 40,
    usuario_id INTEGER NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);
  
  // Migración: agregar columna semanas_gestacion si no existe
  db.run(`ALTER TABLE ninos ADD COLUMN semanas_gestacion INTEGER DEFAULT 40`, (err) => {
    // Ignorar error si la columna ya existe
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding semanas_gestacion column:', err);
    }
  });

  // Migración: agregar columna usuario_id si no existe
  db.run(`ALTER TABLE ninos ADD COLUMN usuario_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding usuario_id column:', err);
    }
  });

  // Crear usuario admin por defecto si no existe
  db.get('SELECT id FROM usuarios WHERE email = ?', ['admin@neuropedialab.org'], (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err);
      return;
    }
    if (!row) {
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT INTO usuarios (email, password_hash, nombre, rol) VALUES (?, ?, ?, ?)`,
        ['admin@neuropedialab.org', adminPassword, 'Administrador', 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          }
        }
      );
    }
  });

  // Tabla de dominios de desarrollo
  db.run(`CREATE TABLE IF NOT EXISTS dominios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT
  )`);

  // Tabla de fuentes normativas (referencias bibliográficas)
  db.run(`CREATE TABLE IF NOT EXISTS fuentes_normativas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    referencia_bibliografica TEXT NOT NULL,
    descripcion TEXT,
    año INTEGER,
    poblacion TEXT,
    activa INTEGER DEFAULT 1
  )`);

  // Tabla de hitos normativos
  db.run(`CREATE TABLE IF NOT EXISTS hitos_normativos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dominio_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    edad_media_meses REAL NOT NULL,
    desviacion_estandar REAL NOT NULL,
    edad_minima_meses REAL,
    edad_maxima_meses REAL,
    fuente_normativa_id INTEGER DEFAULT 1,
    FOREIGN KEY (dominio_id) REFERENCES dominios(id),
    FOREIGN KEY (fuente_normativa_id) REFERENCES fuentes_normativas(id),
    UNIQUE(dominio_id, nombre, edad_media_meses, fuente_normativa_id)
  )`);

  // Tabla de hitos conseguidos por cada niño
  db.run(`CREATE TABLE IF NOT EXISTS hitos_conseguidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nino_id INTEGER NOT NULL,
    hito_id INTEGER NOT NULL,
    edad_conseguido_meses REAL NOT NULL,
    fecha_registro DATE NOT NULL,
    notas TEXT,
    FOREIGN KEY (nino_id) REFERENCES ninos(id),
    FOREIGN KEY (hito_id) REFERENCES hitos_normativos(id)
  )`);
  
  // Migración: agregar columnas para regresión si no existen
  db.run(`ALTER TABLE hitos_conseguidos ADD COLUMN edad_perdido_meses REAL`, (err) => {
    // Ignorar error si la columna ya existe
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding edad_perdido_meses column:', err);
    }
  });
  
  db.run(`ALTER TABLE hitos_conseguidos ADD COLUMN fecha_perdido DATE`, (err) => {
    // Ignorar error si la columna ya existe
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding fecha_perdido column:', err);
    }
  });

  // Tabla de hitos no alcanzados (para seguimiento)
  db.run(`CREATE TABLE IF NOT EXISTS hitos_no_alcanzados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nino_id INTEGER NOT NULL,
    hito_id INTEGER NOT NULL,
    edad_evaluacion_meses REAL NOT NULL,
    fecha_registro DATETIME NOT NULL,
    notas TEXT,
    FOREIGN KEY (nino_id) REFERENCES ninos(id),
    FOREIGN KEY (hito_id) REFERENCES hitos_normativos(id)
  )`);

  // Tabla de red flags (señales de alarma)
  db.run(`CREATE TABLE IF NOT EXISTS red_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    edad_relevante_meses REAL
  )`);

  // Tabla de red flags observadas en cada niño
  db.run(`CREATE TABLE IF NOT EXISTS red_flags_observadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nino_id INTEGER NOT NULL,
    red_flag_id INTEGER NOT NULL,
    edad_observada_meses REAL NOT NULL,
    fecha_registro DATE NOT NULL,
    notas TEXT,
    severidad INTEGER DEFAULT 1,
    FOREIGN KEY (nino_id) REFERENCES ninos(id),
    FOREIGN KEY (red_flag_id) REFERENCES red_flags(id)
  )`);

  // Tabla de evaluaciones con escalas estandarizadas
  db.run(`CREATE TABLE IF NOT EXISTS escalas_evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nino_id INTEGER NOT NULL,
    escala TEXT NOT NULL,
    fecha_evaluacion DATE NOT NULL,
    edad_evaluacion_meses REAL NOT NULL,
    puntuaciones TEXT NOT NULL,
    profesional_evaluador TEXT,
    centro_evaluacion TEXT,
    notas TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nino_id) REFERENCES ninos(id)
  )`);

  // Insertar fuentes normativas predeterminadas
  const fuentesNormativas = [
    [
      'CDC - Centros para el Control y Prevención de Enfermedades',
      'CDC. (2022). Developmental Milestones. Centers for Disease Control and Prevention. https://www.cdc.gov/ncbddd/actearly/milestones/index.html',
      'Datos normativos de desarrollo infantil basados en estudios poblacionales estadounidenses. Revisión actualizada 2022 basada en opinión de expertos y evidencia científica. Enfoque en hitos que el 75% de niños alcanzan a determinada edad.',
      2022,
      'Población general estadounidense (muestra diversa incluyendo múltiples etnias y contextos socioeconómicos)'
    ],
    [
      'OMS - Organización Mundial de la Salud',
      'WHO Multicentre Growth Reference Study Group. (2006). WHO Motor Development Study: Windows of achievement for six gross motor development milestones. Acta Paediatrica, 95(S450), 86-95. https://www.who.int/publications/i/item/9241594292',
      'Estudio multicéntrico internacional sobre desarrollo motor. Metodología rigurosa con seguimiento longitudinal. Ventanas de logro (windows of achievement) para 6 hitos motores gruesos. Excelente para comparación intercultural.',
      2006,
      'Población internacional (Brasil, Ghana, India, Noruega, Omán, Estados Unidos). Niños con crianza óptima en entornos diversos.'
    ],
    [
      'Bayley Scales of Infant Development',
      'Bayley, N. (2006). Bayley Scales of Infant and Toddler Development (3rd ed.). San Antonio, TX: Harcourt Assessment. https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Cognition-%26-Neuro/Bayley-Scales-of-Infant-and-Toddler-Development/p/100000123.html',
      'Escala estandarizada gold standard para evaluación del desarrollo infantil 0-42 meses. Excelentes propiedades psicométricas (α > 0.86). Ampliamente validada. Normas actualizadas. Evalúa cognitivo, lenguaje (receptivo/expresivo), motor (fino/grueso), socio-emocional y adaptativo.',
      2006,
      'Población normativa estadounidense estratificada (n=1,700) por edad, sexo, raza/etnia, región y nivel educativo parental'
    ],
    [
      'Battelle Developmental Inventory',
      'Newborg, J. (2005). Battelle Developmental Inventory (2nd ed.). Itasca, IL: Riverside Publishing. https://www.hmhco.com/programs/battelle-developmental-inventory',
      'Inventario completo del desarrollo 0-7 años. Evalúa 5 dominios (Personal/Social, Adaptativo, Motor, Comunicación, Cognitivo) con subescalas. Buena confiabilidad (α > 0.80). Permite evaluación estructurada, entrevista y observación. Útil para planificación de intervención.',
      2005,
      'Población normativa estadounidense estratificada (n=2,500) con sobremuestreo de grupos especiales (prematuros, discapacidad, bilingües)'
    ]
  ];

  const stmtFuente = db.prepare(`INSERT OR IGNORE INTO fuentes_normativas 
    (id, nombre, referencia_bibliografica, descripcion, año, poblacion) 
    VALUES (?, ?, ?, ?, ?, ?)`);
  fuentesNormativas.forEach((f, idx) => stmtFuente.run(idx + 1, f[0], f[1], f[2], f[3], f[4]));
  stmtFuente.finalize();

  // Insertar dominios predeterminados
  const dominios = [
    ['Motor Grueso', 'Desarrollo de habilidades motoras grandes (gatear, caminar, correr)'],
    ['Motor Fino', 'Desarrollo de habilidades motoras finas (agarre, manipulación de objetos)'],
    ['Lenguaje Receptivo', 'Comprensión del lenguaje'],
    ['Lenguaje Expresivo', 'Producción del lenguaje'],
    ['Social-Emocional', 'Interacción social y regulación emocional'],
    ['Cognitivo', 'Desarrollo cognitivo y de resolución de problemas'],
    ['Adaptativo', 'Habilidades de autocuidado y adaptación']
  ];

  const stmtDominio = db.prepare('INSERT OR IGNORE INTO dominios (id, nombre, descripcion) VALUES (?, ?, ?)');
  dominios.forEach((d, idx) => stmtDominio.run(idx + 1, d[0], d[1]));
  stmtDominio.finalize();

  // Insertar hitos normativos del desarrollo (0-72 meses)
  const hitos = [
    // Motor Grueso
    [1, 'Levanta la cabeza en posición prona', 'Levanta la cabeza 45° cuando está boca abajo', 2, 0.5, 1, 3],
    [1, 'Control cefálico completo', 'Mantiene la cabeza erguida y estable', 4, 1, 3, 6],
    [1, 'Se voltea de boca arriba a boca abajo', 'Rueda sobre sí mismo', 6, 1.5, 4, 8],
    [1, 'Se sienta sin apoyo', 'Mantiene posición sentada sin ayuda', 7, 1, 6, 9],
    [1, 'Gatea', 'Se desplaza en cuatro patas', 9, 2, 6, 12],
    [1, 'Se pone de pie con apoyo', 'Se levanta sujetándose de muebles', 10, 2, 8, 13],
    [1, 'Camina con apoyo', 'Camina sujetándose de muebles o manos', 11, 2, 9, 14],
    [1, 'Camina solo', 'Camina independientemente', 13, 2.5, 10, 18],
    [1, 'Sube escaleras con ayuda', 'Sube escalones con apoyo', 18, 3, 15, 24],
    [1, 'Corre', 'Corre con coordinación', 24, 4, 18, 30],
    [1, 'Salta con ambos pies', 'Despega ambos pies del suelo', 30, 4, 24, 36],
    [1, 'Se mantiene en un pie 2 segundos', 'Equilibrio en un pie', 36, 6, 30, 48],
    [1, 'Salta en un pie', 'Salta alternando pies', 48, 6, 42, 60],
    [1, 'Mantiene equilibrio en un pie 5 segundos', 'Equilibrio prolongado', 60, 6, 54, 72],

    // Motor Fino
    [2, 'Reflejo de prensión palmar', 'Cierra la mano al tocar la palma', 0.5, 0.5, 0, 2],
    [2, 'Sigue objetos con la mirada', 'Seguimiento visual horizontal', 2, 0.5, 1, 3],
    [2, 'Alcanza objetos', 'Extiende las manos hacia objetos', 4, 1, 3, 6],
    [2, 'Transfiere objetos de mano a mano', 'Pasa objetos entre ambas manos', 6, 1.5, 5, 8],
    [2, 'Pinza inferior', 'Agarra objetos con toda la mano', 7, 1.5, 5, 9],
    [2, 'Pinza superior (pulgar-índice)', 'Agarra objetos pequeños con precisión', 10, 2, 8, 12],
    [2, 'Garabatea espontáneamente', 'Hace marcas en papel', 15, 3, 12, 20],
    [2, 'Apila 4 cubos', 'Construye torre de 4 cubos', 18, 3, 15, 24],
    [2, 'Copia un círculo', 'Imita dibujo de círculo', 36, 6, 30, 42],
    [2, 'Copia una cruz', 'Imita dibujo de cruz', 48, 6, 42, 54],
    [2, 'Dibuja persona con 3 partes', 'Dibuja figura humana básica', 54, 6, 48, 66],
    [2, 'Copia un cuadrado', 'Imita dibujo de cuadrado', 60, 6, 54, 72],

    // Lenguaje Receptivo
    [3, 'Responde al sonido', 'Reacciona a ruidos fuertes', 1, 0.5, 0, 2],
    [3, 'Gira hacia la voz', 'Voltea cabeza hacia quien habla', 4, 1, 3, 6],
    [3, 'Responde a su nombre', 'Reacciona cuando lo llaman', 7, 2, 5, 10],
    [3, 'Comprende "no"', 'Responde a la negación', 9, 2, 7, 12],
    [3, 'Sigue instrucciones simples', 'Cumple órdenes de un paso', 12, 2, 10, 15],
    [3, 'Señala partes del cuerpo', 'Identifica 3-5 partes del cuerpo', 18, 3, 15, 24],
    [3, 'Comprende preposiciones', 'Entiende "encima", "debajo"', 24, 4, 20, 30],
    [3, 'Sigue instrucciones de dos pasos', 'Cumple órdenes secuenciales', 30, 4, 24, 36],
    [3, 'Entiende conceptos de tamaño', 'Identifica "grande" y "pequeño"', 36, 6, 30, 42],
    [3, 'Comprende conceptos temporales básicos', 'Entiende "antes", "después"', 48, 6, 42, 60],

    // Lenguaje Expresivo
    [4, 'Gorjea', 'Produce sonidos vocálicos', 3, 1, 2, 5],
    [4, 'Balbucea', 'Produce sílabas repetidas (ma-ma, ba-ba)', 6, 1.5, 4, 8],
    [4, 'Jerga', 'Vocaliza con entonación como si hablara', 10, 2, 8, 14],
    [4, 'Primera palabra con significado', 'Dice palabra con intención comunicativa', 12, 3, 9, 18],
    [4, 'Vocabulario de 10-20 palabras', 'Dice múltiples palabras', 18, 3, 15, 24],
    [4, 'Combina dos palabras', 'Forma frases de dos palabras', 24, 4, 18, 30],
    [4, 'Usa frases de 3-4 palabras', 'Construye oraciones simples', 30, 4, 24, 36],
    [4, 'Vocabulario de 200+ palabras', 'Amplio repertorio verbal', 36, 6, 30, 48],
    [4, 'Narra experiencias simples', 'Cuenta lo que hizo', 48, 6, 42, 60],
    [4, 'Usa oraciones complejas', 'Gramática compleja con conectores', 60, 6, 54, 72],

    // Social-Emocional
    [5, 'Contacto visual', 'Mantiene mirada con cuidadores', 2, 0.5, 1, 4],
    [5, 'Sonrisa social', 'Sonríe en interacciones', 2, 0.5, 1, 3],
    [5, 'Ríe', 'Carcajadas en respuesta a estímulos', 4, 1, 3, 6],
    [5, 'Ansiedad ante extraños', 'Muestra cautela con desconocidos', 8, 2, 6, 12],
    [5, 'Juega a "palmas palmitas"', 'Participa en juegos interactivos', 10, 2, 8, 14],
    [5, 'Muestra afecto', 'Abraza, besa espontáneamente', 15, 3, 12, 20],
    [5, 'Juego paralelo', 'Juega cerca de otros niños', 24, 4, 18, 30],
    [5, 'Comienza juego compartido', 'Juega con otros niños', 30, 6, 24, 40],
    [5, 'Comprende turnos', 'Espera su turno en juegos', 36, 6, 30, 48],
    [5, 'Juego cooperativo', 'Juega con reglas y roles', 48, 8, 40, 60],
    [5, 'Tiene amigos preferidos', 'Establece amistades', 60, 8, 48, 72],

    // Cognitivo
    [6, 'Fija la mirada', 'Mantiene atención visual', 1, 0.5, 0, 2],
    [6, 'Busca objetos con la mirada', 'Busca visualmente', 4, 1, 3, 6],
    [6, 'Permanencia del objeto', 'Busca objetos escondidos', 9, 2, 7, 12],
    [6, 'Usa objetos funcionalmente', 'Usa objetos para su propósito', 15, 3, 12, 20],
    [6, 'Juego simbólico simple', 'Juega a "hacer como si"', 18, 3, 15, 24],
    [6, 'Completa puzzles de 3-4 piezas', 'Resuelve rompecabezas simples', 24, 4, 20, 30],
    [6, 'Empareja colores', 'Identifica colores iguales', 30, 6, 24, 36],
    [6, 'Cuenta hasta 10', 'Recita números', 36, 6, 30, 48],
    [6, 'Entiende concepto de número', 'Cuenta objetos con significado', 48, 8, 40, 60],
    [6, 'Reconoce letras', 'Identifica algunas letras', 54, 8, 48, 66],
    [6, 'Escribe su nombre', 'Escribe nombre propio', 60, 8, 54, 72],

    // Adaptativo
    [7, 'Succiona eficazmente', 'Alimentación efectiva', 0.5, 0.5, 0, 2],
    [7, 'Sostiene biberón', 'Sujeta el biberón solo', 6, 2, 4, 10],
    [7, 'Bebe de taza con ayuda', 'Usa taza con asistencia', 12, 2, 9, 15],
    [7, 'Usa cuchara con ayuda', 'Intenta comer con cuchara', 15, 3, 12, 20],
    [7, 'Bebe de taza solo', 'Usa taza independientemente', 18, 3, 15, 24],
    [7, 'Usa cuchara solo', 'Come con cuchara sin ayuda', 24, 4, 18, 30],
    [7, 'Se quita ropa simple', 'Se desviste parcialmente', 24, 4, 18, 30],
    [7, 'Control de esfínteres diurno', 'Avisa y usa el baño de día', 30, 8, 20, 42],
    [7, 'Se viste con supervisión', 'Se pone ropa con ayuda', 36, 6, 30, 48],
    [7, 'Usa tenedor', 'Come con tenedor', 42, 6, 36, 54],
    [7, 'Se viste solo', 'Se viste independientemente', 54, 8, 48, 66],
    [7, 'Se ata los zapatos', 'Hace lazos en cordones', 60, 10, 48, 72]
  ];

  const stmtHito = db.prepare(`INSERT OR IGNORE INTO hitos_normativos 
    (dominio_id, nombre, descripcion, edad_media_meses, desviacion_estandar, edad_minima_meses, edad_maxima_meses, fuente_normativa_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  
  // Insertar hitos para cada fuente normativa con ligeras variaciones
  const fuentesIds = [1, 2, 3, 4]; // CDC, OMS, Bayley, Battelle
  
  fuentesIds.forEach(fuenteId => {
    // Factores de ajuste según la fuente
    let factorEdad = 1.0;
    let factorDE = 1.0;
    
    if (fuenteId === 2) { // OMS tiende a ser ligeramente más conservadora
      factorEdad = 1.05;
      factorDE = 1.1;
    } else if (fuenteId === 3) { // Bayley es más estricta
      factorEdad = 0.98;
      factorDE = 0.95;
    } else if (fuenteId === 4) { // Battelle tiene rangos más amplios y edades intermedias
      factorEdad = 1.02;
      factorDE = 1.15;
    }
    
    hitos.forEach(h => {
      const edadAjustada = h[3] * factorEdad;
      const deAjustada = h[4] * factorDE;
      const minAjustada = h[5] ? h[5] * factorEdad : null;
      const maxAjustada = h[6] ? h[6] * factorEdad : null;
      
      stmtHito.run(
        h[0], h[1], h[2], 
        Math.round(edadAjustada * 10) / 10, 
        Math.round(deAjustada * 10) / 10, 
        minAjustada ? Math.round(minAjustada * 10) / 10 : null, 
        maxAjustada ? Math.round(maxAjustada * 10) / 10 : null,
        fuenteId
      );
    });
  });
  
  stmtHito.finalize();

  // Insertar red flags predeterminadas
  const redFlags = [
    ['No contacto visual', 'Ausencia o escaso contacto visual', 2],
    ['No sonrisa social', 'No sonríe en respuesta a estímulos sociales', 3],
    ['No respuesta al nombre', 'No responde cuando se le llama', 9],
    ['Pérdida de habilidades adquiridas', 'Regresión en cualquier área del desarrollo', 0],
    ['No balbucea', 'Ausencia de balbuceo a edad esperada', 8],
    ['No señala', 'No usa gesto de señalar', 14],
    ['No palabras a los 16 meses', 'Ausencia de palabras con significado', 16],
    ['No frases de dos palabras a los 24 meses', 'No combina palabras', 24],
    ['Movimientos repetitivos estereotipados', 'Aleteo de manos, balanceo, etc.', 0],
    ['Intereses restringidos intensos', 'Fijación en objetos o temas específicos', 18],
    ['Ausencia de juego simbólico', 'No juega a hacer como si', 24],
    ['Hipersensibilidad sensorial', 'Reacciones exageradas a estímulos', 12],
    ['Hipotonía marcada', 'Tono muscular muy bajo', 0],
    ['Asimetría motora persistente', 'Uso preferente marcado de un lado', 6],
    ['No marcha independiente a los 18 meses', 'No camina solo', 18],
    ['Lenguaje ecolálico predominante', 'Repite lo que oye sin comunicación', 30],
    ['Ausencia de atención conjunta', 'No comparte focos de interés', 12],
    ['No juego interactivo', 'No participa en juegos recíprocos', 12],
    ['Rabietas intensas frecuentes', 'Dificultad severa de regulación emocional', 24],
    ['Conductas autolesivas', 'Se golpea, muerde a sí mismo', 0]
  ];

  const stmtFlag = db.prepare('INSERT OR IGNORE INTO red_flags (nombre, descripcion, edad_relevante_meses) VALUES (?, ?, ?)');
  redFlags.forEach(f => stmtFlag.run(f[0], f[1], f[2]));
  stmtFlag.finalize();

  // Configuración por defecto del sistema
  db.run(`INSERT OR IGNORE INTO configuracion_sistema (clave, valor) VALUES (?, ?)`, 
    ['umbral_diagnostico', '2.0']);
});

module.exports = db;
