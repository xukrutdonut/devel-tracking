/**
 * Script para actualizar los videos educativos CDC en los hitos
 * Mapeo completo de videos de CDC del archivo videosdesarrollocdc.txt
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

// Mapeo completo de videos CDC desde el archivo videosdesarrollocdc.txt
// Se han correlacionado los videos con los hitos correspondientes
const videosCDC = {
  // 2 MESES
  'Levanta la cabeza en posición prona': 'https://youtu.be/0HZgmcJznu0',
  'Sonrisa social': 'https://youtu.be/kpDw2IwrY3A',
  'Contacto visual': 'https://youtu.be/wiTsQzG8HvA',
  'Sigue objetos con la mirada': 'https://youtu.be/PU28jG7C2D8',
  
  // 4 MESES
  'Control cefálico completo': 'https://youtu.be/wgbHbpa2CxY',
  'Alcanza objetos': 'https://youtu.be/xXZQUO3sZuA',
  'Ríe': 'https://youtu.be/FDuiy78HOdU',
  'Gira hacia la voz': 'https://youtu.be/UOF1iqfUI2U',
  'Busca objetos con la mirada': 'https://youtu.be/tD3mjf8zxPU',
  
  // 6 MESES
  'Se voltea de boca arriba a boca abajo': 'https://youtu.be/jQxT4zfxg2U',
  'Transfiere objetos de mano a mano': 'https://youtu.be/YESAaHVcP1M',
  'Balbucea': 'https://youtu.be/LCqSikCDgg4',
  'Sostiene biberón': 'https://youtu.be/F8KhcHkNaXc',
  
  // 9 MESES
  'Se sienta sin apoyo': 'https://youtu.be/74Ks1N8UrfI',
  'Pinza inferior': 'https://youtu.be/KJzt9N6kNI8',
  'Responde a su nombre': 'https://youtu.be/Ac9uD-po-II',
  'Gatea': 'https://youtu.be/7g76fIIAUXA',
  'Permanencia del objeto': 'https://youtu.be/sKXbu3VUC-Y',
  'Comprende "no"': 'https://youtu.be/KK4USWUEkPc',
  'Ansiedad ante extraños': 'https://youtu.be/Ap0ZIGeO2Js',
  
  // 12 MESES
  'Se pone de pie con apoyo': 'https://youtu.be/-mCruPPhVRg',
  'Pinza superior (pulgar-índice)': 'https://youtu.be/ywACPvLw1vY',
  'Jerga': 'https://youtu.be/Qx8XIFR6k8Y',
  'Juega "tortas tortitas"': 'https://youtu.be/sBeR5C9UbKs',
  'Juega a "palmas palmitas"': 'https://youtu.be/sBeR5C9UbKs', // mismo video
  'Camina con apoyo': 'https://youtu.be/8ddPY0dkMVw',
  'Primera palabra con significado': 'https://youtu.be/mPa-fEK0Pa0',
  'Sigue instrucciones simples': 'https://youtu.be/yv7ne3sP74s',
  'Bebe de taza con ayuda': 'https://youtu.be/NwA3UdVa-So',
  
  // 15 MESES
  'Camina solo': 'https://youtu.be/NOR2CQ_fDHo',
  'Garabatea espontáneamente': 'https://youtu.be/3C58VuyYQqk',
  'Dice 3-5 palabras': 'https://youtu.be/utFXM8-ZWxQ',
  'Imita actividades domésticas': 'https://youtu.be/B2vOJ35N2w4',
  'Come con los dedos': 'https://youtu.be/dFJri0kuv4g',
  'Bebe de taza solo': 'https://youtu.be/W1JIh3VS7FM',
  
  // 18 MESES
  'Sube escaleras con ayuda': 'https://youtu.be/xiZ2Rx8eos8',
  'Apila 2 cubos': 'https://youtu.be/QTjC3xA5Mjg',
  
  // 2 AÑOS (24 MESES)
  'Corre': 'https://youtu.be/mZ6TJDmGJZs',
  'Apila 4 cubos': 'https://youtu.be/82VFkA1KxXc',
  'Señala partes del cuerpo': 'https://youtu.be/gurzKgwUeV8',
  'Combina dos palabras': 'https://youtu.be/fT7B_a0h3Cs',
  'Juego simbólico simple': 'https://youtu.be/HzwDn9wBYZ8',
  'Juego paralelo': 'https://youtu.be/ChIUsyKRrPw',
  'Completa puzzles de 3-4 piezas': 'https://youtu.be/IvsZJA5vf3s',
  'Usa cuchara solo': 'https://youtu.be/n1X5fjNpF7U',
  'Se quita ropa simple': 'https://youtu.be/g7Nk8VIlaGU',
  'Comprende preposiciones': 'https://youtu.be/HHLzrXanCM8',
  
  // 30 MESES (2.5 AÑOS)
  'Salta con ambos pies': 'https://youtu.be/7VsAwdvGFtc',
  'Sigue instrucciones de dos pasos': 'https://youtu.be/zBg7Rz4eJG4',
  'Usa frases de 3-4 palabras': 'https://youtu.be/Xb0WRY8cweE',
  'Comienza juego compartido': 'https://youtu.be/TVJPv-jAAXQ',
  'Empareja colores': 'https://youtu.be/cCDWvL0jJTQ',
  'Control de esfínteres diurno': 'https://youtu.be/AYyrLJvekiI',
  
  // 3 AÑOS (36 MESES)
  'Se mantiene en un pie 2 segundos': 'https://youtu.be/n6KeOrLBSAk',
  'Copia un círculo': 'https://youtu.be/dhSuaZRC1g4',
  'Entiende conceptos de tamaño': 'https://youtu.be/0kA7z5rOY-4',
  'Vocabulario de 200+ palabras': 'https://youtu.be/1HVFefCTaEg',
  'Comprende turnos': 'https://youtu.be/z-gpMeqcCDo',
  'Cuenta hasta 10': 'https://youtu.be/8aCtZdGCjzU',
  'Se viste con supervisión': 'https://youtu.be/Jhegb5ThB9o',
  
  // 42 MESES (3.5 AÑOS)
  'Usa tenedor': 'https://youtu.be/mb22uw95vrs',
  
  // 4 AÑOS (48 MESES)
  'Salta en un pie': 'https://youtu.be/Ocyny8EH57o',
  'Copia una cruz': 'https://youtu.be/0vBmHsz-XlQ',
  'Comprende conceptos temporales básicos': 'https://youtu.be/Hk-XNxHdvdI',
  'Narra experiencias simples': 'https://youtu.be/H10WUgVOkLA',
  
  // 4.5 AÑOS (54 MESES)
  'Juego cooperativo': 'https://youtu.be/zADh5hbINTI',
  'Entiende concepto de número': 'https://youtu.be/clcgAk9hhjI',
  'Dibuja persona con 3 partes': 'https://youtu.be/6kgpop2Ox9E',
  'Reconoce letras': 'https://youtu.be/PyJLHLHa7xg',
  'Se viste solo': 'https://youtu.be/r1jfpbVh-Bc',
  
  // 5 AÑOS (60 MESES)
  'Mantiene equilibrio en un pie 5 segundos': 'https://youtu.be/CeMQGyj1O2U',
  'Copia un cuadrado': 'https://youtu.be/g0q8ROezogc',
  
  'Usa oraciones complejas': 'https://youtu.be/9ZuYNmSPVTE',
  
  'Tiene amigos preferidos': 'https://youtu.be/CL9kuzYD3Ys',
  
  'Escribe su nombre': 'https://youtu.be/okZsSK7VBgM',
  'Se ata los zapatos': 'https://youtu.be/qApAKfhnSP8',
  
  // Otros hitos adicionales de la lista CDC
  'Gorjea': 'https://youtu.be/Vydmr8dtzdo',
  'Dice 10 palabras': 'https://youtu.be/4ZttyEVE1yM',
  'Baja escaleras con ayuda': 'https://youtu.be/jIXybXhoi50',
  'Patea pelota': 'https://youtu.be/01gxTph8o4E',
  'Apila 6 cubos': 'https://youtu.be/NHmCDC__Aag',
  'Imita línea vertical': 'https://youtu.be/P9k-9_ckJoU',
  'Nombra imágenes': 'https://youtu.be/MAoCd8A6rD0',
  'Nombra un color': 'https://youtu.be/C01Qr1tUspU',
  'Distingue niño/niña': 'https://youtu.be/D7QAS5VsUi8',
  'Imita trazo horizontal': 'https://youtu.be/2hP4TX1gu5U',
  'Lava y seca manos': 'https://youtu.be/24krwvFmv-I',
  'Se pone zapatos': 'https://youtu.be/PXwY0w8q1Dc',
  'Tira pelota por encima': 'https://youtu.be/I7VUal_QyWk',
  'Imita línea horizontal': 'https://youtu.be/UzWsiK-eJWY',
  'Usa plural': 'https://youtu.be/s2Ou6WhxwdY',
  
  'Diferencia texturas': 'https://youtu.be/EB7nCELwQSk',
  'Abrocha botones': 'https://youtu.be/DiMdbAnLilI',
  
  'Camina en línea recta': 'https://youtu.be/dhT-2X2Sb90',
  'Corta con tijeras': 'https://youtu.be/-JWZxDUVUCg',
  'Usa pronombres correctamente': 'https://youtu.be/E9DLI_4Lojs',
  'Entiende opuestos': 'https://youtu.be/BZ9Ei-gzU9w',
  'Nombra 4 colores': 'https://youtu.be/7HrEEzEdcVQ',
  'Comprende "más largo"': 'https://youtu.be/EARTHHvelrw',
  'Se abrocha': 'https://youtu.be/AC00qwH50nQ',
  'Va al baño solo': 'https://youtu.be/1xODfn-eSiU',
  'Explica reglas juego': 'https://youtu.be/nrGKOiTAvcI',
  
  'Salta alternando pies': 'https://youtu.be/BFfQOBq5O4g',
  'Copia triángulo': 'https://youtu.be/BLTDK0_H1VE',
  'Comprende "ayer/mañana"': 'https://youtu.be/_lrXsCrAozM',
  'Cuenta 10 objetos': 'https://youtu.be/55iS2L9cbUk'
};

console.log('🎬 Iniciando actualización de videos CDC...');
console.log(`📺 Videos CDC a procesar: ${Object.keys(videosCDC).length}`);

db.serialize(() => {
  let actualizados = 0;
  let noEncontrados = 0;
  const hitosNoEncontrados = [];
  
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
          hitosNoEncontrados.push(nombreHito);
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
    
    if (hitosNoEncontrados.length > 0) {
      console.log('\n📝 Hitos no encontrados en la base de datos:');
      hitosNoEncontrados.forEach(h => console.log(`   - ${h}`));
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
          
          const porEdad = {};
          rows.forEach(row => {
            const edad = Math.floor(row.edad_media_meses);
            if (!porEdad[edad]) porEdad[edad] = [];
            
            const videos = [];
            if (row.video_url_cdc) videos.push('CDC');
            if (row.video_url_pathways) videos.push('Pathways');
            
            porEdad[edad].push({nombre: row.nombre, videos: videos.join(', ')});
          });
          
          Object.keys(porEdad).sort((a, b) => Number(a) - Number(b)).forEach(edad => {
            console.log(`\n📅 ${edad} meses:`);
            porEdad[edad].forEach(h => {
              console.log(`   - ${h.nombre} [${h.videos}]`);
            });
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
