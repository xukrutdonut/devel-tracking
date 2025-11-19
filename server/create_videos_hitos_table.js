const db = require('./database');

console.log('Creando tabla videos_hitos...');

db.serialize(() => {
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
      console.log('✅ Tabla videos_hitos creada correctamente');
    }
    process.exit(err ? 1 : 0);
  });
});
