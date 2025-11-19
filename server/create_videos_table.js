const db = require('./database');

console.log('Creando tabla videos...');

db.serialize(() => {
  // Crear tabla videos
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      url TEXT NOT NULL,
      fuente TEXT NOT NULL,
      duracion TEXT,
      edad_meses INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla videos:', err);
      process.exit(1);
    } else {
      console.log('✅ Tabla videos creada correctamente');
    }
  });

  // Crear tabla de relación videos-hitos si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS videos_hitos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      hito_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      FOREIGN KEY (hito_id) REFERENCES hitos_desarrollo(id) ON DELETE CASCADE,
      UNIQUE(video_id, hito_id)
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla videos_hitos:', err);
    } else {
      console.log('✅ Tabla videos_hitos verificada correctamente');
    }
    process.exit(err ? 1 : 0);
  });
});
