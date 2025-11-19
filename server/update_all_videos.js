/**
 * Script para actualizar TODOS los videos educativos de los hitos
 * Incluye videos de CDC y Pathways.org correlacionados con los hitos existentes
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

// Mapeo completo de videos CDC (Centers for Disease Control and Prevention)
// Fuente: https://www.cdc.gov/ncbddd/actearly/milestones/index.html
const videosCDC = {
  'Sonrisa social': 'https://youtu.be/0HZgmcJznu0',
  'Levanta la cabeza en posición prona': 'https://youtu.be/kpDw2IwrY3A',
  'Sigue objetos con la mirada': 'https://youtu.be/wiTsQzG8HvA',
  'Contacto visual': 'https://youtu.be/PU28jG7C2D8',
  'Gorjea': 'https://youtu.be/wgbHbpa2CxY',
  'Control cefálico completo': 'https://youtu.be/xXZQUO3sZuA',
  'Alcanza objetos': 'https://youtu.be/FDuiy78HOdU',
  'Gira hacia la voz': 'https://youtu.be/UOF1iqfUI2U',
  'Ríe': 'https://youtu.be/tD3mjf8zxPU',
  'Busca objetos con la mirada': 'https://youtu.be/jQxT4zfxg2U',
  'Se voltea de boca arriba a boca abajo': 'https://youtu.be/YESAaHVcP1M',
  'Transfiere objetos de mano a mano': 'https://youtu.be/LCqSikCDgg4',
  'Balbucea': 'https://youtu.be/F8KhcHkNaXc',
  'Sostiene biberón': 'https://youtu.be/74Ks1N8UrfI',
  'Se sienta sin apoyo': 'https://youtu.be/KJzt9N6kNI8',
  'Pinza inferior': 'https://youtu.be/Ac9uD-po-II',
  'Responde a su nombre': 'https://youtu.be/7g76fIIAUXA',
  'Ansiedad ante extraños': 'https://youtu.be/sKXbu3VUC-Y',
  'Gatea': 'https://youtu.be/KK4USWUEkPc',
  'Comprende "no"': 'https://youtu.be/Ap0ZIGeO2Js',
  'Permanencia del objeto': 'https://youtu.be/-mCruPPhVRg',
  'Pinza superior (pulgar-índice)': 'https://youtu.be/ywACPvLw1vY',
  'Se pone de pie con apoyo': 'https://youtu.be/Qx8XIFR6k8Y',
  'Imita sonidos': 'https://youtu.be/sBeR5C9UbKs',
  'Señala con el dedo': 'https://youtu.be/8ddPY0dkMVw',
  'Come con los dedos': 'https://youtu.be/mPa-fEK0Pa0',
  'Primera palabra con significado': 'https://youtu.be/yv7ne3sP74s',
  'Camina con apoyo': 'https://youtu.be/NwA3UdVa-So',
  'Comprende órdenes simples': 'https://youtu.be/NOR2CQ_fDHo',
  'Muestra afecto': 'https://youtu.be/3C58VuyYQqk',
  'Bebe del vaso': 'https://youtu.be/utFXM8-ZWxQ',
  'Camina solo': 'https://youtu.be/B2vOJ35N2w4',
  'Hace garabatos': 'https://youtu.be/dFJri0kuv4g',
  'Usa 10 palabras': 'https://youtu.be/W1JIh3VS7FM',
  'Sube escaleras con ayuda': 'https://youtu.be/xiZ2Rx8eos8',
  'Apila 2 cubos': 'https://youtu.be/QTjC3xA5Mjg',
  'Entiende instrucciones de dos pasos': 'https://youtu.be/mZ6TJDmGJZs',
  'Corre': 'https://youtu.be/82VFkA1KxXc',
  'Usa cuchara': 'https://youtu.be/gurzKgwUeV8',
  'Juego paralelo': 'https://youtu.be/fT7B_a0h3Cs',
  'Apila 4 cubos': 'https://youtu.be/HzwDn9wBYZ8',
  'Tira una pelota': 'https://youtu.be/ChIUsyKRrPw',
  'Combina dos palabras': 'https://youtu.be/IvsZJA5vf3s',
  'Señala partes del cuerpo': 'https://youtu.be/n1X5fjNpF7U',
  'Juego simbólico simple': 'https://youtu.be/g7Nk8VIlaGU',
  'Salta con ambos pies': 'https://youtu.be/HHLzrXanCM8',
  'Garabatea espontáneamente': 'https://youtu.be/7VsAwdvGFtc',
  'Nombra objetos familiares': 'https://youtu.be/zBg7Rz4eJG4',
  'Usa frases de 3 palabras': 'https://youtu.be/Xb0WRY8cweE',
  'Sube escaleras alternando pies': 'https://youtu.be/TVJPv-jAAXQ',
  'Copia un círculo': 'https://youtu.be/cCDWvL0jJTQ',
  'Se viste con ayuda': 'https://youtu.be/AYyrLJvekiI',
  'Pedalea en triciclo': 'https://youtu.be/n6KeOrLBSAk',
  'Apila 8 cubos': 'https://youtu.be/dhSuaZRC1g4',
  'Hace preguntas "qué", "quién"': 'https://youtu.be/0kA7z5rOY-4',
  'Juego interactivo con otros niños': 'https://youtu.be/1HVFefCTaEg',
  'Usa el baño': 'https://youtu.be/z-gpMeqcCDo',
  'Se desviste solo': 'https://youtu.be/8aCtZdGCjzU',
  'Salta en un pie': 'https://youtu.be/Jhegb5ThB9o',
  'Dibuja una persona (3 partes)': 'https://youtu.be/mb22uw95vrs',
  'Cuenta historias': 'https://youtu.be/Ocyny8EH57o',
  'Canta canciones': 'https://youtu.be/0vBmHsz-XlQ',
  'Juego imaginativo elaborado': 'https://youtu.be/Hk-XNxHdvdI',
  'Se viste solo': 'https://youtu.be/H10WUgVOkLA',
  'Salta hacia adelante': 'https://youtu.be/zADh5hbINTI',
  'Usa tijeras': 'https://youtu.be/clcgAk9hhjI',
  'Copia un cuadrado': 'https://youtu.be/6kgpop2Ox9E',
  'Habla con claridad': 'https://youtu.be/PyJLHLHa7xg',
  'Cuenta hasta 10': 'https://youtu.be/r1jfpbVh-Bc',
  'Nombra 4 colores': 'https://youtu.be/CeMQGyj1O2U',
  'Sabe su nombre completo': 'https://youtu.be/g0q8ROezogc',
  'Se baña solo con supervisión': 'https://youtu.be/9ZuYNmSPVTE',
  'Salta la cuerda': 'https://youtu.be/CL9kuzYD3Ys',
  'Copia un triángulo': 'https://youtu.be/okZsSK7VBgM',
  'Dibuja una persona (6 partes)': 'https://youtu.be/qApAKfhnSP8',
  'Usa oraciones complejas': 'https://youtu.be/Vydmr8dtzdo',
  'Entiende conceptos de tiempo': 'https://youtu.be/4ZttyEVE1yM',
  'Conoce números y letras': 'https://youtu.be/jIXybXhoi50',
  'Sigue reglas de juegos': 'https://youtu.be/01gxTph8o4E',
  'Se ata los zapatos': 'https://youtu.be/NHmCDC__Aag',
  'Monta en bicicleta': 'https://youtu.be/P9k-9_ckJoU',
  'Escribe su nombre': 'https://youtu.be/MAoCd8A6rD0',
  'Lee palabras simples': 'https://youtu.be/C01Qr1tUspU',
  'Suma y resta simple': 'https://youtu.be/D7QAS5VsUi8',
  'Entiende dinero': 'https://youtu.be/2hP4TX1gu5U',
  'Juegos de equipo': 'https://youtu.be/24krwvFmv-I',
  'Se baña solo': 'https://youtu.be/PXwY0w8q1Dc',
  'Nada': 'https://youtu.be/I7VUal_QyWk',
  'Escribe oraciones': 'https://youtu.be/UzWsiK-eJWY',
  'Lee con fluidez': 'https://youtu.be/s2Ou6WhxwdY',
  'Multiplicación y división básica': 'https://youtu.be/EB7nCELwQSk',
  'Razonamiento lógico complejo': 'https://youtu.be/DiMdbAnLilI',
  'Deportes organizados': 'https://youtu.be/dhT-2X2Sb90',
  'Responsabilidades del hogar': 'https://youtu.be/-JWZxDUVUCg',
  'Cooperación en grupo': 'https://youtu.be/E9DLI_4Lojs',
  'Pensamiento abstracto': 'https://youtu.be/BZ9Ei-gzU9w',
  'Resolución de problemas': 'https://youtu.be/7HrEEzEdcVQ',
  'Planificación y organización': 'https://youtu.be/EARTHHvelrw',
  'Empatía y perspectiva': 'https://youtu.be/AC00qwH50nQ',
  'Independencia': 'https://youtu.be/1xODfn-eSiU',
  'Amistades cercanas': 'https://youtu.be/nrGKOiTAvcI',
  'Identidad personal': 'https://youtu.be/BFfQOBq5O4g',
  'Pensamiento crítico': 'https://youtu.be/BLTDK0_H1VE',
  'Autoconciencia emocional': 'https://youtu.be/_lrXsCrAozM',
  'Responsabilidad social': 'https://youtu.be/55iS2L9cbUk'
};

// Mapeo completo de videos Pathways.org
// Fuente: https://www.youtube.com/@PathwaysBaby
const videosPathways = {
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
  'Alcanza objetos': 'https://youtu.be/NbO3tsj2T5E',
  'Pinza superior (pulgar-índice)': 'https://youtu.be/JNQ-WU6whGw',
  'Garabatea espontáneamente': 'https://youtu.be/TkhEFmJFZ2k',
  'Apila 4 cubos': 'https://youtu.be/DFQWBuNkNmU',
  'Balbucea': 'https://youtu.be/GClQN03QK6s',
  'Primera palabra con significado': 'https://youtu.be/KX3ZCDLu2PM',
  'Combina dos palabras': 'https://youtu.be/vC3SviJ4eJ4',
  'Permanencia del objeto': 'https://youtu.be/6KjvPuviJ00',
  'Juego simbólico simple': 'https://youtu.be/xFvaJ8QHBgw',
  'Juego paralelo': 'https://youtu.be/Wvtp8BAjl1k'
};

console.log('🎬 Iniciando actualización COMPLETA de videos educativos...');
console.log(`📺 Videos CDC a procesar: ${Object.keys(videosCDC).length}`);
console.log(`📺 Videos Pathways a procesar: ${Object.keys(videosPathways).length}`);

db.serialize(() => {
  let actualizadosCDC = 0;
  let actualizadosPathways = 0;
  let noEncontrados = [];
  
  // Primero, limpiar todos los videos existentes
  console.log('\n🧹 Limpiando videos existentes...');
  db.run(
    `UPDATE hitos_normativos 
     SET video_url_cdc = NULL, video_url_pathways = NULL`,
    function(err) {
      if (err) {
        console.error('❌ Error limpiando videos:', err);
      } else {
        console.log(`✅ Videos limpiados (${this.changes} hitos actualizados)`);
      }
    }
  );
  
  // Actualizar videos CDC
  console.log('\n📹 Actualizando videos CDC...');
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
          noEncontrados.push(`CDC: ${nombreHito}`);
        } else {
          console.log(`✅ CDC: ${nombreHito}`);
          actualizadosCDC++;
        }
      }
    );
  });
  
  // Actualizar videos Pathways
  console.log('\n📹 Actualizando videos Pathways...');
  Object.entries(videosPathways).forEach(([nombreHito, videoUrl]) => {
    db.run(
      `UPDATE hitos_normativos 
       SET video_url_pathways = ? 
       WHERE nombre = ?`,
      [videoUrl, nombreHito],
      function(err) {
        if (err) {
          console.error(`❌ Error actualizando ${nombreHito}:`, err);
        } else if (this.changes === 0) {
          noEncontrados.push(`Pathways: ${nombreHito}`);
        } else {
          console.log(`✅ Pathways: ${nombreHito}`);
          actualizadosPathways++;
        }
      }
    );
  });
  
  // Esperar a que todas las actualizaciones terminen
  setTimeout(() => {
    console.log('\n📊 Resumen de actualización:');
    console.log(`   ✅ Hitos con video CDC: ${actualizadosCDC}`);
    console.log(`   ✅ Hitos con video Pathways: ${actualizadosPathways}`);
    console.log(`   ⚠️  Videos no correlacionados: ${noEncontrados.length}`);
    
    if (noEncontrados.length > 0) {
      console.log('\n⚠️  Hitos no encontrados en la BD:');
      noEncontrados.forEach(h => console.log(`     - ${h}`));
    }
    
    console.log('\n🔍 Verificando hitos con videos...');
    
    db.all(
      `SELECT id, nombre, edad_media_meses, video_url_cdc, video_url_pathways 
       FROM hitos_normativos 
       WHERE video_url_cdc IS NOT NULL OR video_url_pathways IS NOT NULL
       ORDER BY edad_media_meses`,
      (err, rows) => {
        if (err) {
          console.error('❌ Error consultando hitos:', err);
        } else {
          console.log(`\n📹 Total de hitos con videos: ${rows.length}`);
          
          const conAmbos = rows.filter(r => r.video_url_cdc && r.video_url_pathways).length;
          const soloCDC = rows.filter(r => r.video_url_cdc && !r.video_url_pathways).length;
          const soloPathways = rows.filter(r => !r.video_url_cdc && r.video_url_pathways).length;
          
          console.log(`   📊 Con ambos videos (CDC + Pathways): ${conAmbos}`);
          console.log(`   📊 Solo CDC: ${soloCDC}`);
          console.log(`   📊 Solo Pathways: ${soloPathways}`);
          
          console.log('\n📝 Lista de hitos con videos:');
          rows.forEach(row => {
            const videos = [];
            if (row.video_url_cdc) videos.push('CDC');
            if (row.video_url_pathways) videos.push('Pathways');
            console.log(`   - ${row.nombre} (${row.edad_media_meses}m) [${videos.join(' + ')}]`);
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
  }, 3000);
});
