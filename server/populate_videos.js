const db = require('./database');

const videosCDC = [
  'https://youtu.be/0HZgmcJznu0',
  'https://youtu.be/kpDw2IwrY3A',
  'https://youtu.be/wiTsQzG8HvA',
  'https://youtu.be/PU28jG7C2D8',
  'https://youtu.be/wgbHbpa2CxY',
  'https://youtu.be/xXZQUO3sZuA',
  'https://youtu.be/FDuiy78HOdU',
  'https://youtu.be/UOF1iqfUI2U',
  'https://youtu.be/tD3mjf8zxPU',
  'https://youtu.be/jQxT4zfxg2U',
  'https://youtu.be/YESAaHVcP1M',
  'https://youtu.be/LCqSikCDgg4',
  'https://youtu.be/F8KhcHkNaXc',
  'https://youtu.be/74Ks1N8UrfI',
  'https://youtu.be/KJzt9N6kNI8',
  'https://youtu.be/Ac9uD-po-II',
  'https://youtu.be/7g76fIIAUXA',
  'https://youtu.be/sKXbu3VUC-Y',
  'https://youtu.be/KK4USWUEkPc',
  'https://youtu.be/Ap0ZIGeO2Js',
  'https://youtu.be/-mCruPPhVRg',
  'https://youtu.be/ywACPvLw1vY',
  'https://youtu.be/Qx8XIFR6k8Y',
  'https://youtu.be/sBeR5C9UbKs',
  'https://youtu.be/8ddPY0dkMVw',
  'https://youtu.be/mPa-fEK0Pa0',
  'https://youtu.be/yv7ne3sP74s',
  'https://youtu.be/NwA3UdVa-So',
  'https://youtu.be/NOR2CQ_fDHo',
  'https://youtu.be/3C58VuyYQqk',
  'https://youtu.be/utFXM8-ZWxQ',
  'https://youtu.be/B2vOJ35N2w4',
  'https://youtu.be/dFJri0kuv4g',
  'https://youtu.be/W1JIh3VS7FM',
  'https://youtu.be/xiZ2Rx8eos8',
  'https://youtu.be/QTjC3xA5Mjg',
  'https://youtu.be/mZ6TJDmGJZs',
  'https://youtu.be/82VFkA1KxXc',
  'https://youtu.be/gurzKgwUeV8',
  'https://youtu.be/fT7B_a0h3Cs',
  'https://youtu.be/HzwDn9wBYZ8',
  'https://youtu.be/ChIUsyKRrPw',
  'https://youtu.be/IvsZJA5vf3s',
  'https://youtu.be/n1X5fjNpF7U',
  'https://youtu.be/g7Nk8VIlaGU',
  'https://youtu.be/HHLzrXanCM8',
  'https://youtu.be/7VsAwdvGFtc',
  'https://youtu.be/zBg7Rz4eJG4'
];

const videosPathways = [
  'https://youtu.be/gOT0L5cCHLQ',
  'https://youtu.be/-5RWunTSxfo',
  'https://youtu.be/wfzVtBQ3fS0',
  'https://youtu.be/n6QOmGlZrK4',
  'https://youtu.be/8xxHMyrDVmA',
  'https://youtu.be/R3uloVkvCRA',
  'https://youtu.be/tM5QBuqWhwQ',
  'https://youtu.be/xxE7Aq_aux8',
  'https://youtu.be/c_PKJS8-Y5U',
  'https://youtu.be/snfNFTyHfo0',
  'https://youtu.be/xPfTGbZk8Fs',
  'https://youtu.be/WXnxRrK5I98',
  'https://youtu.be/NbO3tsj2T5E',
  'https://youtu.be/JNQ-WU6whGw',
  'https://youtu.be/TkhEFmJFZ2k',
  'https://youtu.be/DFQWBuNkNmU',
  'https://youtu.be/GClQN03QK6s',
  'https://youtu.be/KX3ZCDLu2PM',
  'https://youtu.be/vC3SviJ4eJ4',
  'https://youtu.be/6KjvPuviJ00',
  'https://youtu.be/xFvaJ8QHBgw',
  'https://youtu.be/Wvtp8BAjl1k'
];

console.log('Poblando tabla videos...');

db.serialize(() => {
  let insertados = 0;
  let total = videosCDC.length + videosPathways.length;

  // Insertar videos CDC
  videosCDC.forEach((url, index) => {
    const videoId = url.split('/').pop();
    db.run(
      `INSERT INTO videos (titulo, descripcion, url, fuente) VALUES (?, ?, ?, ?)`,
      [`Video CDC ${index + 1}`, `Video educativo de CDC`, url, 'CDC'],
      (err) => {
        if (err && err.message.includes('UNIQUE')) {
          // Ya existe, continuar
        } else if (err) {
          console.error(`Error insertando video CDC ${videoId}:`, err.message);
        } else {
          insertados++;
          console.log(`✅ Video CDC ${videoId} insertado`);
        }
        
        if (insertados >= total || insertados + videosCDC.length >= total) {
          console.log(`\n✅ Proceso completado: ${insertados} videos insertados de ${total} intentos`);
        }
      }
    );
  });

  // Insertar videos Pathways
  videosPathways.forEach((url, index) => {
    const videoId = url.split('/').pop();
    db.run(
      `INSERT INTO videos (titulo, descripcion, url, fuente) VALUES (?, ?, ?, ?)`,
      [`Video Pathways ${index + 1}`, `Video educativo de Pathways.org`, url, 'Pathways'],
      (err) => {
        if (err && err.message.includes('UNIQUE')) {
          // Ya existe, continuar
        } else if (err) {
          console.error(`Error insertando video Pathways ${videoId}:`, err.message);
        } else {
          insertados++;
          console.log(`✅ Video Pathways ${videoId} insertado`);
        }
      }
    );
  });

  // Esperar a que terminen todas las inserciones
  setTimeout(() => {
    console.log(`\n📊 Total de videos: ${insertados} de ${total}`);
    process.exit(0);
  }, 3000);
});
