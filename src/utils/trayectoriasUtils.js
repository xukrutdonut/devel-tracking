/**
 * Utilidades para análisis de trayectorias del desarrollo
 * Soporta dos tipos de datos:
 * 1. LONGITUDINAL RETROSPECTIVO: Múltiples hitos registrados con sus edades de logro
 * 2. PROSPECTIVO: Múltiples evaluaciones puntuales en el tiempo
 * 
 * Basado en:
 * - Thomas et al. (2009) - Tipología de trayectorias
 * - Deboeck et al. (2016) - Uso de derivadas
 * - Alcantud (2024) - Matemáticas del neurodesarrollo
 */

/**
 * Construye puntos de evaluación para análisis de trayectorias
 * Maneja ambos tipos de datos: longitudinal y prospectivo
 * 
 * @param {Array} hitosConseguidos - Hitos con edad_conseguido_meses
 * @param {Array} hitosNormativos - Base de datos normativa con media y DE
 * @param {Array} dominios - Lista de dominios del desarrollo
 * @param {number} edadActualMeses - Edad actual del niño
 * @returns {Array} Puntos de evaluación con CD, Z-scores por dominio
 */
export function construirPuntosEvaluacion(hitosConseguidos, hitosNormativos, dominios, edadActualMeses) {
  if (!hitosConseguidos || hitosConseguidos.length === 0) {
    return [];
  }

  // Agrupar hitos por edad de logro (para crear puntos temporales)
  const hitosMap = new Map();
  
  hitosConseguidos.forEach(hito => {
    const edadLogro = hito.edad_conseguido_meses;
    if (!edadLogro) return;
    
    if (!hitosMap.has(edadLogro)) {
      hitosMap.set(edadLogro, []);
    }
    hitosMap.get(edadLogro).push(hito);
  });

  // Crear puntos de evaluación en cada edad donde se logró al menos un hito
  const puntosEvaluacion = [];
  
  // Ordenar edades
  const edadesLogro = Array.from(hitosMap.keys()).sort((a, b) => a - b);
  
  edadesLogro.forEach(edadLogro => {
    const hitosEnEdad = hitosMap.get(edadLogro);
    
    // Obtener TODOS los hitos conseguidos hasta esta edad (acumulativo)
    const hitosHastaEdad = hitosConseguidos.filter(h => h.edad_conseguido_meses <= edadLogro);
    
    // Calcular métricas por dominio
    const metricasPorDominio = {};
    
    dominios.forEach(dominio => {
      const hitosDelDominio = hitosHastaEdad.filter(h => {
        const hitoNormativo = hitosNormativos.find(hn => hn.id === h.hito_id);
        return hitoNormativo && hitoNormativo.dominio_id === dominio.id;
      });
      
      if (hitosDelDominio.length === 0) return;
      
      // Calcular ED (Edad de Desarrollo) - promedio de edades normativas
      let sumaEdadesNormativas = 0;
      let sumaZScores = 0;
      let count = 0;
      
      hitosDelDominio.forEach(hito => {
        const hitoNormativo = hitosNormativos.find(hn => hn.id === hito.hito_id);
        if (hitoNormativo && hitoNormativo.edad_media_meses && hitoNormativo.desviacion_estandar) {
          sumaEdadesNormativas += hitoNormativo.edad_media_meses;
          
          // Calcular Z-score individual
          const zScore = (hito.edad_conseguido_meses - hitoNormativo.edad_media_meses) / hitoNormativo.desviacion_estandar;
          sumaZScores += zScore;
          count++;
        }
      });
      
      if (count > 0) {
        const ed = sumaEdadesNormativas / count;
        const cd = (ed / edadLogro) * 100;
        const zPromedio = sumaZScores / count;
        
        metricasPorDominio[dominio.id] = {
          dominio_id: dominio.id,
          dominio_nombre: dominio.nombre,
          ed: ed,
          cd: cd,
          z_promedio: zPromedio,
          n_hitos: count
        };
      }
    });
    
    // Calcular CD global
    let edGlobal = 0;
    let countGlobal = 0;
    
    hitosHastaEdad.forEach(hito => {
      const hitoNormativo = hitosNormativos.find(hn => hn.id === hito.hito_id);
      if (hitoNormativo && hitoNormativo.edad_media_meses) {
        edGlobal += hitoNormativo.edad_media_meses;
        countGlobal++;
      }
    });
    
    const cdGlobal = countGlobal > 0 ? (edGlobal / countGlobal / edadLogro) * 100 : null;
    
    puntosEvaluacion.push({
      edad_meses: Math.round(edadLogro * 100) / 100, // Redondear a 2 decimales
      dominios: Object.values(metricasPorDominio),
      cd_global: cdGlobal,
      n_hitos_total: hitosHastaEdad.length,
      tipo_dato: 'longitudinal' // Indicar que es dato retrospectivo
    });
  });
  
  return puntosEvaluacion;
}

/**
 * Calcula velocidad de desarrollo entre dos puntos
 * @param {number} cd1 - Cociente de Desarrollo en tiempo 1
 * @param {number} cd2 - Cociente de Desarrollo en tiempo 2
 * @param {number} edad1 - Edad en meses en tiempo 1
 * @param {number} edad2 - Edad en meses en tiempo 2
 * @returns {number|null} Velocidad en puntos CD por mes
 */
export function calcularVelocidad(cd1, cd2, edad1, edad2) {
  const deltaT = edad2 - edad1;
  if (deltaT <= 0) return null;
  
  const deltaCD = cd2 - cd1;
  return deltaCD / deltaT;
}

/**
 * Calcula aceleración de desarrollo entre tres puntos
 * @param {number} v1 - Velocidad entre puntos 1-2
 * @param {number} v2 - Velocidad entre puntos 2-3
 * @param {number} deltaT - Intervalo de tiempo promedio
 * @returns {number|null} Aceleración en puntos CD por mes²
 */
export function calcularAceleracion(v1, v2, deltaT) {
  if (deltaT <= 0 || v1 === null || v2 === null) return null;
  return (v2 - v1) / deltaT;
}

/**
 * Calcula todas las métricas de trayectoria para un conjunto de puntos
 * @param {Array} puntos - Array de objetos con {edad_meses, cd}
 * @returns {Array} Puntos enriquecidos con velocidad, aceleración e interpretación
 */
export function calcularMetricasTrayectoria(puntos) {
  if (!puntos || puntos.length < 2) return puntos;
  
  const puntosEnriquecidos = puntos.map((punto, i) => ({
    ...punto,
    velocidad: null,
    aceleracion: null,
    interpretacion: ''
  }));
  
  // Calcular velocidades
  for (let i = 1; i < puntosEnriquecidos.length; i++) {
    const p1 = puntosEnriquecidos[i - 1];
    const p2 = puntosEnriquecidos[i];
    
    if (p1.cd !== null && p2.cd !== null) {
      puntosEnriquecidos[i].velocidad = calcularVelocidad(
        p1.cd,
        p2.cd,
        p1.edad_meses,
        p2.edad_meses
      );
    }
  }
  
  // Calcular aceleraciones
  for (let i = 2; i < puntosEnriquecidos.length; i++) {
    const v1 = puntosEnriquecidos[i - 1].velocidad;
    const v2 = puntosEnriquecidos[i].velocidad;
    
    if (v1 !== null && v2 !== null) {
      const p1 = puntosEnriquecidos[i - 2];
      const p2 = puntosEnriquecidos[i - 1];
      const p3 = puntosEnriquecidos[i];
      
      const deltaT1 = p2.edad_meses - p1.edad_meses;
      const deltaT2 = p3.edad_meses - p2.edad_meses;
      const deltaTPromedio = (deltaT1 + deltaT2) / 2;
      
      puntosEnriquecidos[i].aceleracion = calcularAceleracion(v1, v2, deltaTPromedio);
    }
  }
  
  // Agregar interpretaciones
  puntosEnriquecidos.forEach((punto, i) => {
    punto.interpretacion = interpretarTrayectoria(
      punto.cd,
      punto.velocidad,
      punto.aceleracion
    );
  });
  
  return puntosEnriquecidos;
}

/**
 * Interpreta la trayectoria según las tres derivadas
 * @param {number} cd - Cociente de Desarrollo (posición)
 * @param {number} velocidad - Velocidad de cambio
 * @param {number} aceleracion - Aceleración
 * @returns {string} Interpretación textual
 */
export function interpretarTrayectoria(cd, velocidad, aceleracion) {
  const retraso = cd < 85;
  const normal = cd >= 85 && cd <= 115;
  const adelanto = cd > 115;
  
  const velocidadPositiva = velocidad !== null && velocidad > 0.5;
  const velocidadNormal = velocidad !== null && Math.abs(velocidad) <= 0.5;
  const velocidadNegativa = velocidad !== null && velocidad < -0.5;
  const estancamiento = velocidad !== null && Math.abs(velocidad) < 0.1;
  
  const aceleracionPositiva = aceleracion !== null && aceleracion > 0.05;
  const aceleracionNula = aceleracion !== null && Math.abs(aceleracion) <= 0.05;
  const aceleracionNegativa = aceleracion !== null && aceleracion < -0.05;
  
  if (velocidadNegativa) {
    return '⚠️ REGRESIÓN: Pérdida de habilidades';
  }
  
  if (estancamiento) {
    return '⚠️ ESTANCAMIENTO: Sin progreso';
  }
  
  if (retraso) {
    if (velocidadPositiva && aceleracionPositiva) {
      return '✅ Retraso con RECUPERACIÓN (convergente)';
    } else if (velocidadPositiva && aceleracionNula) {
      return '⚡ Retraso ESTABLE (paralelo)';
    } else if (aceleracionNegativa) {
      return '⚠️ Retraso PROGRESIVO (divergente)';
    } else if (velocidadPositiva) {
      return '→ Retraso con PROGRESO';
    } else {
      return '⚠️ Retraso sin datos de velocidad';
    }
  }
  
  if (normal) {
    if (aceleracionPositiva) {
      return '🌟 Desarrollo NORMAL con aceleración';
    } else if (aceleracionNegativa) {
      return '⚡ Desarrollo NORMAL con desaceleración';
    } else {
      return '✅ Desarrollo NORMAL estable';
    }
  }
  
  if (adelanto) {
    return '🌟 Desarrollo ADELANTADO';
  }
  
  return '— Datos insuficientes';
}

/**
 * Clasifica el tipo de trayectoria según Thomas et al. (2009)
 * @param {Array} puntos - Puntos con cd, velocidad, aceleracion
 * @returns {Object} Clasificación con tipo, descripción, características
 */
export function clasificarTipoTrayectoria(puntos) {
  if (!puntos || puntos.length < 3) {
    return {
      tipo: 'INDETERMINADO',
      descripcion: 'Datos insuficientes',
      caracteristicas: ['Se necesitan al menos 3 puntos de evaluación'],
      implicaciones: ['Continuar seguimiento longitudinal']
    };
  }
  
  // Extraer métricas
  const cds = puntos.map(p => p.cd).filter(cd => cd !== null);
  const velocidades = puntos.map(p => p.velocidad).filter(v => v !== null);
  
  if (cds.length < 3) {
    return {
      tipo: 'INDETERMINADO',
      descripcion: 'Datos insuficientes',
      caracteristicas: ['Datos incompletos para clasificación'],
      implicaciones: ['Continuar seguimiento']
    };
  }
  
  // Calcular estadísticos
  const cdPrimero = cds[0];
  const cdUltimo = cds[cds.length - 1];
  const cdMedia = cds.reduce((a, b) => a + b, 0) / cds.length;
  const cdCambio = cdUltimo - cdPrimero;
  
  const velocidadMedia = velocidades.length > 0
    ? velocidades.reduce((a, b) => a + b, 0) / velocidades.length
    : 0;
  
  // Calcular varianzas
  const cdVarianza = calcularVarianza(cds);
  const velocidadVarianza = velocidades.length > 1 ? calcularVarianza(velocidades) : 0;
  
  // Clasificación según Thomas et al. (2009)
  let tipo, descripcion, caracteristicas, implicaciones;
  
  // DELAY, IMMATURITY: Z-score bajo pero estable, velocidad cercana a normal (inicio retrasado)
  if (cdMedia < 85 && cdVarianza < 50 && Math.abs(velocidadMedia) < 0.5) {
    tipo = 'DELAY';
    descripcion = 'Retraso - inicio retrasado (Trayectoria paralela con inicio retrasado)';
    caracteristicas = [
      `CD medio: ${cdMedia.toFixed(1)}% (bajo pero estable)`,
      `Varianza CD: ${cdVarianza.toFixed(1)} (baja)`,
      `Velocidad: ${velocidadMedia.toFixed(2)} puntos/mes (cercana a 0)`,
      'Trayectoria paralela a la normalidad'
    ];
    implicaciones = [
      'Desarrollo sigue mismo patrón que típico pero retrasado',
      'Hitos en mismo orden que niños típicos',
      'Pronóstico: Distancia constante con normalidad',
      'Intervención: Estimulación generalizada'
    ];
  }
  // DEVIANCE (Desviación de la trayectoria desde un mismo origen): Cambio sistemático en CD
  else if (Math.abs(cdCambio) > 10 && velocidadVarianza < 1.0) {
    if (cdCambio > 0) {
      tipo = 'DEVIANCE_CONVERGENTE';
      descripcion = 'Desviación de la trayectoria desde un mismo origen convergente (Recuperación)';
      caracteristicas = [
        `CD inicial: ${cdPrimero.toFixed(1)}%`,
        `CD final: ${cdUltimo.toFixed(1)}%`,
        `Mejora: +${cdCambio.toFixed(1)} puntos`,
        `Velocidad: +${velocidadMedia.toFixed(2)} puntos/mes`,
        'Trayectoria convergente'
      ];
      implicaciones = [
        'Desarrollo acelerado, "catching up"',
        'Puede alcanzar rango normal',
        'Pronóstico favorable',
        'Continuar estrategia actual'
      ];
    } else {
      tipo = 'DEVIANCE_DIVERGENTE';
      descripcion = 'Desviación de la trayectoria desde un mismo origen divergente (Empeoramiento)';
      caracteristicas = [
        `CD inicial: ${cdPrimero.toFixed(1)}%`,
        `CD final: ${cdUltimo.toFixed(1)}%`,
        `Deterioro: ${cdCambio.toFixed(1)} puntos`,
        `Velocidad: ${velocidadMedia.toFixed(2)} puntos/mes`,
        'Trayectoria divergente'
      ];
      implicaciones = [
        'Desarrollo más lento que típico',
        'Distancia aumenta con tiempo',
        'Pronóstico desfavorable sin intervención',
        'URGENTE: Intensificar terapias'
      ];
    }
  }
  // DYSMATURITY: Inicio normal, posterior deterioro
  else if (cdPrimero > 85 && cdUltimo < 70 && cdCambio < -15) {
    tipo = 'DYSMATURITY';
    descripcion = 'Dismadurez (Regresión - desarrollo trastornado)';
    caracteristicas = [
      `CD inicial: ${cdPrimero.toFixed(1)}% (normal)`,
      `CD final: ${cdUltimo.toFixed(1)}% (retraso)`,
      `Deterioro: ${cdCambio.toFixed(1)} puntos`,
      'Desarrollo inicial típico, posterior desaceleración'
    ];
    implicaciones = [
      'Patrón regresivo',
      'Considerar: TEA, neurodegenerativo',
      'Evaluación neurológica urgente',
      'Neuroimagen recomendada'
    ];
  }
  // DIFFERENCE: Patrón errático
  else if (velocidadVarianza > 1.0 || cdVarianza > 100) {
    tipo = 'DIFFERENCE';
    descripcion = 'Diferencia cualitativa';
    caracteristicas = [
      `CD medio: ${cdMedia.toFixed(1)}%`,
      `Alta variabilidad (σ²=${cdVarianza.toFixed(1)})`,
      'Patrón no lineal o errático',
      'Desarrollo cualitativamente diferente'
    ];
    implicaciones = [
      'No sigue patrones típicos',
      'Posible perfil "pico-valle"',
      'Evaluación neuropsicológica detallada',
      'Perfil individualizado necesario'
    ];
  }
  // INDETERMINADO
  else {
    tipo = 'INDETERMINADO';
    descripcion = 'Patrón indeterminado';
    caracteristicas = [
      `CD medio: ${cdMedia.toFixed(1)}%`,
      `Velocidad: ${velocidadMedia.toFixed(2)} puntos/mes`,
      'Patrón no claramente clasificable'
    ];
    implicaciones = [
      'Continuar seguimiento',
      'Más evaluaciones necesarias',
      'Mantener vigilancia'
    ];
  }
  
  return {
    tipo,
    descripcion,
    caracteristicas,
    implicaciones,
    metricas: {
      cdPrimero,
      cdUltimo,
      cdMedia,
      cdCambio,
      cdVarianza,
      velocidadMedia,
      velocidadVarianza,
      nPuntos: puntos.length
    }
  };
}

/**
 * Calcula varianza de un array de valores
 */
function calcularVarianza(valores) {
  if (valores.length < 2) return 0;
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const sumaCuadrados = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0);
  return sumaCuadrados / valores.length;
}

/**
 * Determina si los datos son retrospectivos o prospectivos
 * @param {Array} puntos - Puntos de evaluación
 * @returns {string} 'retrospectivo' o 'prospectivo'
 */
export function determinarTipoDatos(puntos) {
  if (!puntos || puntos.length === 0) return 'desconocido';
  
  // Si todos los puntos tienen tipo_dato definido
  if (puntos.every(p => p.tipo_dato)) {
    return puntos[0].tipo_dato === 'longitudinal' ? 'retrospectivo' : 'prospectivo';
  }
  
  // Heurística: Si hay muchos puntos muy cercanos en el tiempo (< 1 mes entre ellos),
  // probablemente sea retrospectivo
  if (puntos.length > 5) {
    let puntosConsecutivosCercanos = 0;
    for (let i = 1; i < puntos.length; i++) {
      const diff = puntos[i].edad_meses - puntos[i-1].edad_meses;
      if (diff < 1) puntosConsecutivosCercanos++;
    }
    if (puntosConsecutivosCercanos > puntos.length * 0.5) {
      return 'retrospectivo';
    }
  }
  
  return 'prospectivo';
}
