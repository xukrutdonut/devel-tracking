const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8001;

// Configuración de CORS más permisiva
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ==================== RUTAS DE NIÑOS ====================

// Obtener todos los niños
app.get('/api/ninos', (req, res) => {
  db.all('SELECT * FROM ninos ORDER BY nombre', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear nuevo niño
app.post('/api/ninos', (req, res) => {
  console.log('Recibida petición de crear niño:', req.body);
  const { nombre, fecha_nacimiento, semanas_gestacion } = req.body;
  
  // Validación
  if (!nombre || !fecha_nacimiento) {
    console.error('Error: Faltan campos requeridos');
    return res.status(400).json({ error: 'Nombre y fecha de nacimiento son requeridos' });
  }
  
  const semanasGest = semanas_gestacion || 40; // Default 40 si no se proporciona
  console.log('Insertando niño:', { nombre, fecha_nacimiento, semanas_gestacion: semanasGest });
  
  db.run('INSERT INTO ninos (nombre, fecha_nacimiento, semanas_gestacion) VALUES (?, ?, ?)', 
    [nombre, fecha_nacimiento, semanasGest], 
    function(err) {
      if (err) {
        console.error('Error en base de datos:', err.message);
        return res.status(500).json({ error: err.message });
      }
      const resultado = { id: this.lastID, nombre, fecha_nacimiento, semanas_gestacion: semanasGest };
      console.log('Niño creado exitosamente:', resultado);
      res.json(resultado);
    }
  );
});

// Obtener un niño específico
app.get('/api/ninos/:id', (req, res) => {
  db.get('SELECT * FROM ninos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Niño no encontrado' });
    res.json(row);
  });
});

// Eliminar un niño (y todos sus datos relacionados)
app.delete('/api/ninos/:id', (req, res) => {
  const ninoId = req.params.id;
  
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

app.get('/api/hitos-conseguidos/:ninoId', (req, res) => {
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
  db.all(query, [req.params.ninoId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/hitos-conseguidos', (req, res) => {
  const { nino_id, hito_id, edad_conseguido_meses, fecha_registro, notas, edad_perdido_meses, fecha_perdido } = req.body;
  
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

// Nuevo endpoint para registrar pérdida de hito (regresión)
app.put('/api/hitos-conseguidos/:id/registrar-perdida', (req, res) => {
  const { edad_perdido_meses, fecha_perdido } = req.body;
  
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

app.delete('/api/hitos-conseguidos/:id', (req, res) => {
  db.run('DELETE FROM hitos_conseguidos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ==================== RUTAS DE HITOS NO ALCANZADOS ====================

app.get('/api/hitos-no-alcanzados/:ninoId', (req, res) => {
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
  db.all(query, [req.params.ninoId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/hitos-no-alcanzados', (req, res) => {
  const { nino_id, hito_id, edad_evaluacion_meses, fecha_registro, notas } = req.body;
  
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

app.delete('/api/hitos-no-alcanzados/:id', (req, res) => {
  db.run('DELETE FROM hitos_no_alcanzados WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ==================== RUTAS DE RED FLAGS ====================

app.get('/api/red-flags', (req, res) => {
  db.all('SELECT * FROM red_flags ORDER BY edad_relevante_meses', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/red-flags-observadas/:ninoId', (req, res) => {
  const query = `
    SELECT rfo.*, rf.nombre as flag_nombre, rf.descripcion as flag_descripcion
    FROM red_flags_observadas rfo
    JOIN red_flags rf ON rfo.red_flag_id = rf.id
    WHERE rfo.nino_id = ?
    ORDER BY rfo.edad_observada_meses
  `;
  db.all(query, [req.params.ninoId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/red-flags-observadas', (req, res) => {
  const { nino_id, red_flag_id, edad_observada_meses, fecha_registro, notas, severidad } = req.body;
  
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

app.delete('/api/red-flags-observadas/:id', (req, res) => {
  db.run('DELETE FROM red_flags_observadas WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ==================== ESTADISTICAS Y ANALISIS ====================

app.get('/api/analisis/:ninoId', (req, res) => {
  const ninoId = req.params.ninoId;
  const fuenteNormativaId = req.query.fuente || 1;
  
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
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  console.log(`Accesible también en http://localhost:${PORT}`);
});
