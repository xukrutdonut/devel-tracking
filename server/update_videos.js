/**
 * Script para actualizar los videos educativos de los hitos
 * Videos de CDC (Centers for Disease Control and Prevention)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Try multiple possible paths for the database
const possiblePaths = [
  path.join(__dirname, 'neurodesarrollo_dev.db'),
  path.join(__dirname, 'server', 'neurodesarrollo_dev.db'),
  'server/neurodesarrollo_dev.db',
  '/app/server/neurodesarrollo_dev.db'
];

let dbPath;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    dbPath = p;
    console.log(`📂 Base de datos encontrada en: ${dbPath}`);
    break;
  }
}

if (!dbPath) {
  console.error('❌ No se encontró la base de datos en ninguna ubicación');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

// Mapeo de videos CDC por hito
// Estos son videos validados de CDC que muestran ejemplos reales de los hitos
const videosCDC = {
  // Motor Grueso
  'Sonrisa social': 'https://youtu.be/gOT0L5cCHLQ',
  'Levanta la cabeza en posición prona': 'https://youtu.be/-5RWunTSxfo',
  'Control cefálico completo': 'https://youtu.be/wfzVtBQ3fS0',
  'Se voltea de boca arriba a boca abajo': 'https://youtu.be/n6QOmGlZrK4',
  'Se sienta sin apoyo': 'https://youtu.be/8xxHMyrDVmA',
  'Gatea': 'https://youtu.be/R3uloVkvCRA',
  'Se pone de pie con apoyo': 'https://youtu.be/tM5QBuqWhwQ',
  'Camina con apoyo': 'https://youtu.be/xxE7Aq_aux8',
  'Camina solo': 'https://youtu.be/c_PKJS8-Y5U',
  'Sube escaleras con ayuda': 'https://youtu.be/snfNFTyHfo0',
  'Corre': 'https://youtu.be/xPfTGbZk8Fs',
  'Salta con ambos pies': 'https://youtu.be/WXnxRrK5I98',
  
  // Motor Fino
  'Alcanza objetos': 'https://youtu.be/NbO3tsj2T5E',
  'Pinza superior (pulgar-índice)': 'https://youtu.be/JNQ-WU6whGw',
  'Garabatea espontáneamente': 'https://youtu.be/TkhEFmJFZ2k',
  'Apila 4 cubos': 'https://youtu.be/DFQWBuNkNmU',
  
  // Lenguaje y Comunicación
  'Balbucea': 'https://youtu.be/GClQN03QK6s',
  'Primera palabra con significado': 'https://youtu.be/KX3ZCDLu2PM',
  'Combina dos palabras': 'https://youtu.be/vC3SviJ4eJ4',
  
  // Cognitivo
  'Permanencia del objeto': 'https://youtu.be/6KjvPuviJ00',
  'Juego simbólico simple': 'https://youtu.be/xFvaJ8QHBgw',
  
  // Social-Emocional ya incluida arriba (Sonrisa social)
  'Juego paralelo': 'https://youtu.be/Wvtp8BAjl1k'
};

// Videos de Pathways (estos ya estaban en el sistema)
const videosPathways = {
  // Añadir los videos de Pathways que ya estaban funcionando
  // Por ahora dejamos solo los de CDC, luego se pueden agregar más
};

console.log('🎬 Iniciando actualización de videos educativos...');
console.log(`📺 Videos CDC a procesar: ${Object.keys(videosCDC).length}`);

db.serialize(() => {
  let actualizados = 0;
  let noEncontrados = 0;
  
  // Actualizar videos CDC
  Object.entries(videosCDC).forEach(([nombreHito, videoUrl]) => {
    db.run(
      `UPDATE hitos_normativos 
       SET video_url_cdc = ? 
       WHERE nombre = ?`,
      [videoUrl, nombreHito],
      function(err) {
        if (err) {
          console.error(`❌ Error actualizando ${nombreHito}:`, err);
        } else if (this.changes === 0) {
          console.log(`⚠️  Hito no encontrado: ${nombreHito}`);
          noEncontrados++;
        } else {
          console.log(`✅ Actualizado: ${nombreHito}`);
          actualizados++;
        }
      }
    );
  });
  
  // Esperar a que todas las actualizaciones terminen
  setTimeout(() => {
    console.log('\n📊 Resumen de actualización:');
    console.log(`   ✅ Hitos actualizados: ${actualizados}`);
    console.log(`   ⚠️  Hitos no encontrados: ${noEncontrados}`);
    console.log('\n🔍 Verificando hitos con videos...');
    
    db.all(
      `SELECT id, nombre, video_url_cdc, video_url_pathways 
       FROM hitos_normativos 
       WHERE video_url_cdc IS NOT NULL OR video_url_pathways IS NOT NULL
       ORDER BY edad_media_meses`,
      (err, rows) => {
        if (err) {
          console.error('❌ Error consultando hitos:', err);
        } else {
          console.log(`\n📹 Total de hitos con videos: ${rows.length}`);
          rows.forEach(row => {
            const videos = [];
            if (row.video_url_cdc) videos.push('CDC');
            if (row.video_url_pathways) videos.push('Pathways');
            console.log(`   - ${row.nombre} [${videos.join(', ')}]`);
          });
        }
        
        db.close((err) => {
          if (err) {
            console.error('❌ Error cerrando base de datos:', err);
          } else {
            console.log('\n✅ Base de datos actualizada y cerrada correctamente');
          }
        });
      }
    );
  }, 2000);
});
