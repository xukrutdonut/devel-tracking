/**
 * Script para actualizar videos de hitos del desarrollo
 * Elimina todos los videos existentes y añade los nuevos links proporcionados
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../server/neurodesarrollo_dev.db');
const db = new Database(dbPath);

// Nuevos videos proporcionados por el usuario - mapeados con nombres de la BD
const nuevosVideos = [
  { hito: "Sonríe en interacciones", url: "https://youtu.be/gOT0L5cCHLQ", fuente: "CDC" },
  { hito: "Mueve", url: "https://youtu.be/-5RWunTSxfo", fuente: "CDC" },  // Mueve brazos/piernas
  { hito: "Agarra objetos", url: "https://youtu.be/wfzVtBQ3fS0", fuente: "CDC" },  // Coge juguetes
  { hito: "Levanta la cabeza", url: "https://youtu.be/n6QOmGlZrK4", fuente: "CDC" },  // Se apoya en antebrazos
  { hito: "Sentado con soporte", url: "https://youtu.be/8xxHMyrDVmA", fuente: "CDC" },  // Se sienta con apoyo
  { hito: "Pasa", url: "https://youtu.be/R3uloVkvCRA", fuente: "CDC" },  // Pasa objetos
  { hito: "Sentarse sin apoyo", url: "https://youtu.be/tM5QBuqWhwQ", fuente: "CDC" },
  { hito: "Gateo", url: "https://youtu.be/xxE7Aq_aux8", fuente: "CDC" },
  { hito: "Se sostiene de pie", url: "https://youtu.be/c_PKJS8-Y5U", fuente: "CDC" },  // Se pone de pie con apoyo
  { hito: "Agarra objetos pequeños", url: "https://youtu.be/snfNFTyHfo0", fuente: "CDC" },  // Pinza digital
  { hito: "Camina sujetándose", url: "https://youtu.be/xPfTGbZk8Fs", fuente: "CDC" },  // Camina con apoyo
  { hito: "Se pone de pie", url: "https://youtu.be/WXnxRrK5I98", fuente: "CDC" },  // Se pone de pie solo
  { hito: "Camina independientemente", url: "https://youtu.be/NbO3tsj2T5E", fuente: "CDC" },  // Camina solo
  { hito: "Sube escaleras", url: "https://youtu.be/JNQ-WU6whGw", fuente: "CDC" },  // Sube escaleras con apoyo
  { hito: "Corre con coordinación", url: "https://youtu.be/TkhEFmJFZ2k", fuente: "CDC" },
  { hito: "Despega ambos pies", url: "https://youtu.be/DFQWBuNkNmU", fuente: "CDC" },  // Salta con los dos pies
  { hito: "Equilibrio en un pie", url: "https://youtu.be/GClQN03QK6s", fuente: "CDC" },  // Se sostiene en un pie
  { hito: "Sube y baja", url: "https://youtu.be/KX3ZCDLu2PM", fuente: "CDC" },  // Sube y baja escaleras alternando
  { hito: "Salta en un pie", url: "https://youtu.be/vC3SviJ4eJ4", fuente: "CDC" },
  { hito: "Atrapa pelota", url: "https://youtu.be/6KjvPuviJ00", fuente: "CDC" },
  { hito: "Construye torre", url: "https://youtu.be/xFvaJ8QHBgw", fuente: "CDC" },  // Torre de cubos
  { hito: "Usa tijeras", url: "https://youtu.be/Wvtp8BAjl1k", fuente: "CDC" }
];

try {
  console.log('🔄 Iniciando actualización de videos...\n');
  
  // 1. Verificar si la tabla hitos_normativos tiene columna para videos
  const tableInfo = db.prepare("PRAGMA table_info(hitos_normativos)").all();
  console.log('📋 Estructura de tabla hitos_normativos:');
  tableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });
  
  const hasVideoUrl = tableInfo.some(col => col.name === 'video_url');
  const hasVideoFuente = tableInfo.some(col => col.name === 'video_fuente');
  
  // 2. Añadir columnas si no existen
  if (!hasVideoUrl) {
    console.log('\n➕ Añadiendo columna video_url...');
    db.prepare('ALTER TABLE hitos_normativos ADD COLUMN video_url TEXT').run();
  }
  
  if (!hasVideoFuente) {
    console.log('➕ Añadiendo columna video_fuente...');
    db.prepare('ALTER TABLE hitos_normativos ADD COLUMN video_fuente TEXT').run();
  }
  
  // 3. Limpiar todos los videos existentes
  console.log('\n🧹 Eliminando videos existentes...');
  const result = db.prepare('UPDATE hitos_normativos SET video_url = NULL, video_fuente = NULL').run();
  console.log(`   ✅ ${result.changes} registros limpiados`);
  
  // 4. Insertar nuevos videos
  console.log('\n📹 Insertando nuevos videos:');
  const updateStmt = db.prepare(`
    UPDATE hitos_normativos 
    SET video_url = ?, video_fuente = ?
    WHERE descripcion LIKE ?
  `);
  
  let actualizados = 0;
  let noEncontrados = [];
  
  for (const video of nuevosVideos) {
    const result = updateStmt.run(video.url, video.fuente, `%${video.hito}%`);
    if (result.changes > 0) {
      console.log(`   ✅ ${video.hito}: ${video.url}`);
      actualizados += result.changes;
    } else {
      console.log(`   ⚠️  ${video.hito}: No se encontró el hito en la BD`);
      noEncontrados.push(video.hito);
    }
  }
  
  // 5. Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Hitos actualizados: ${actualizados}`);
  console.log(`   ⚠️  Hitos no encontrados: ${noEncontrados.length}`);
  
  if (noEncontrados.length > 0) {
    console.log('\n❌ Hitos no encontrados en la base de datos:');
    noEncontrados.forEach(h => console.log(`   - ${h}`));
    
    // Mostrar nombres reales de hitos para ayudar a matchear
    console.log('\n📝 Hitos disponibles en la BD (primeros 50):');
    const hitosDisponibles = db.prepare(`
      SELECT DISTINCT descripcion 
      FROM hitos_normativos 
      ORDER BY descripcion 
      LIMIT 50
    `).all();
    hitosDisponibles.forEach(h => console.log(`   - ${h.descripcion}`));
  }
  
  // 6. Verificar resultados
  console.log('\n🔍 Verificando hitos con video:');
  const hitosConVideo = db.prepare(`
    SELECT descripcion, video_url, video_fuente
    FROM hitos_normativos
    WHERE video_url IS NOT NULL
    ORDER BY descripcion
  `).all();
  
  console.log(`   Total con video: ${hitosConVideo.length}`);
  hitosConVideo.forEach(h => {
    console.log(`   📹 ${h.descripcion}: ${h.video_url.substring(0, 40)}...`);
  });
  
  console.log('\n✅ Actualización completada!\n');
  
} catch (error) {
  console.error('\n❌ Error durante la actualización:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
