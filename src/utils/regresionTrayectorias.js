/**
 * Utilidades para análisis de regresión de trayectorias
 * Implementación de las 7 tipologías de Thomas et al. (2009)
 * 
 * Referencias:
 * - Thomas MS, et al. (2009). Using developmental trajectories to understand 
 *   developmental disorders. J Speech Lang Hear Res. 52(2):336-58.
 */

/**
 * Ajusta un modelo de regresión lineal
 * y = a + b*x
 */
export function ajustarRegresionLineal(datos) {
  const n = datos.length;
  const x = datos.map(d => d.edad);
  const y = datos.map(d => d.valor);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  // Pendiente
  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Intercepto
  const a = (sumY - b * sumX) / n;
  
  // Calcular R²
  const yMedia = sumY / n;
  const predicciones = x.map(xi => a + b * xi);
  const ssr = predicciones.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0);
  const sst = y.reduce((sum, yi) => sum + Math.pow(yi - yMedia, 2), 0);
  const r2 = 1 - (ssr / sst);
  
  return {
    tipo: 'lineal',
    intercepto: a,
    pendiente: b,
    r2: r2,
    predicciones: predicciones,
    residuos: y.map((yi, i) => yi - predicciones[i])
  };
}

/**
 * Ajusta un modelo cuadrático
 * y = a + b*x + c*x²
 */
export function ajustarRegresionCuadratica(datos) {
  const n = datos.length;
  const x = datos.map(d => d.edad);
  const y = datos.map(d => d.valor);
  
  // Construir matrices para mínimos cuadrados
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumX3 = x.reduce((sum, xi) => sum + Math.pow(xi, 3), 0);
  const sumX4 = x.reduce((sum, xi) => sum + Math.pow(xi, 4), 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2Y = x.reduce((sum, xi, i) => sum + xi * xi * y[i], 0);
  
  // Sistema de ecuaciones: A * coef = b
  // Resolver usando eliminación gaussiana simplificada
  const det = n * (sumX2 * sumX4 - sumX3 * sumX3) - 
              sumX * (sumX * sumX4 - sumX2 * sumX3) + 
              sumX2 * (sumX * sumX3 - sumX2 * sumX2);
  
  if (Math.abs(det) < 1e-10) {
    // Matriz singular, retornar modelo lineal
    return ajustarRegresionLineal(datos);
  }
  
  // Coeficientes (aproximación)
  const a = (sumY * sumX2 * sumX4 - sumY * sumX3 * sumX3 - 
             sumXY * sumX * sumX4 + sumXY * sumX2 * sumX3 +
             sumX2Y * sumX * sumX3 - sumX2Y * sumX2 * sumX2) / det;
  
  const b = (n * sumXY * sumX4 - n * sumX2Y * sumX3 -
             sumX * sumY * sumX4 + sumX * sumX2Y * sumX2 +
             sumX2 * sumY * sumX3 - sumX2 * sumXY * sumX2) / det;
  
  const c = (n * sumX2 * sumX2Y - n * sumX3 * sumXY -
             sumX * sumX * sumX2Y + sumX * sumX2 * sumXY +
             sumX2 * sumX * sumXY - sumX2 * sumX2 * sumY) / det;
  
  // Calcular R²
  const yMedia = sumY / n;
  const predicciones = x.map(xi => a + b * xi + c * xi * xi);
  const ssr = predicciones.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0);
  const sst = y.reduce((sum, yi) => sum + Math.pow(yi - yMedia, 2), 0);
  const r2 = 1 - (ssr / sst);
  
  return {
    tipo: 'cuadratico',
    intercepto: a,
    coefLineal: b,
    coefCuadratico: c,
    r2: r2,
    predicciones: predicciones,
    residuos: y.map((yi, i) => yi - predicciones[i])
  };
}

/**
 * Ajusta un modelo logístico (curva S)
 * y = L / (1 + exp(-k*(x - x0)))
 * Aproximación simplificada
 */
export function ajustarRegresionLogistica(datos) {
  const n = datos.length;
  const x = datos.map(d => d.edad);
  const y = datos.map(d => d.valor);
  
  // Estimaciones iniciales
  const L = Math.max(...y) * 1.1; // Asíntota superior
  const x0 = (Math.max(...x) + Math.min(...x)) / 2; // Punto medio
  const k = 0.5; // Tasa de crecimiento (simplificado)
  
  // Calcular predicciones con parámetros estimados
  const predicciones = x.map(xi => L / (1 + Math.exp(-k * (xi - x0))));
  
  // Calcular R²
  const yMedia = y.reduce((a, b) => a + b, 0) / n;
  const ssr = predicciones.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0);
  const sst = y.reduce((sum, yi) => sum + Math.pow(yi - yMedia, 2), 0);
  const r2 = 1 - (ssr / sst);
  
  return {
    tipo: 'logistico',
    L: L, // Asíntota
    k: k, // Tasa de crecimiento
    x0: x0, // Punto de inflexión
    r2: r2,
    predicciones: predicciones,
    residuos: y.map((yi, i) => yi - predicciones[i])
  };
}

/**
 * Test F para comparar modelos anidados
 * Compara si un modelo más complejo es significativamente mejor
 */
export function testFModelos(modeloSimple, modeloComplejo, alpha = 0.05) {
  const n = modeloSimple.residuos.length;
  
  // Grados de libertad
  const dfSimple = modeloSimple.tipo === 'lineal' ? 2 : 3;
  const dfComplejo = modeloComplejo.tipo === 'lineal' ? 2 : 
                     modeloComplejo.tipo === 'cuadratico' ? 3 : 3;
  
  // Suma de cuadrados residuales
  const ssrSimple = modeloSimple.residuos.reduce((sum, r) => sum + r * r, 0);
  const ssrComplejo = modeloComplejo.residuos.reduce((sum, r) => sum + r * r, 0);
  
  // Diferencia en grados de libertad
  const dfDiff = dfComplejo - dfSimple;
  
  if (dfDiff <= 0) {
    return { F: 0, significativo: false, mejorModelo: modeloSimple };
  }
  
  // Estadístico F
  const F = ((ssrSimple - ssrComplejo) / dfDiff) / (ssrComplejo / (n - dfComplejo));
  
  // Valores críticos aproximados para alpha = 0.05
  const valoresCriticos = {
    1: 4.0, // df1=1, df2>30
    2: 3.15 // df1=2, df2>30
  };
  
  const valCritico = valoresCriticos[dfDiff] || 3.0;
  const significativo = F > valCritico;
  
  return {
    F: F,
    dfDiff: dfDiff,
    dfResidual: n - dfComplejo,
    significativo: significativo,
    mejorModelo: significativo ? modeloComplejo : modeloSimple
  };
}

/**
 * Detecta si hay una asíntota prematura en los datos
 * (desarrollo se estanca antes del nivel esperado)
 * 
 * CRITERIO CLAVE: Una asíntota prematura implica que el desarrollo
 * progresó inicialmente con velocidad normal y LUEGO se detuvo.
 * Si la velocidad ha sido consistentemente baja desde el inicio,
 * NO es una asíntota, es SLOWED_RATE.
 */
export function detectarAsintotaPrematura(datos, nivelEsperado = 100) {
  if (datos.length < 4) return { detectada: false };
  
  // Analizar últimos 3 puntos
  const ultimos = datos.slice(-3);
  const valores = ultimos.map(d => d.valor);
  
  // Calcular cambio entre puntos consecutivos (últimos 3 puntos)
  const cambiosFinales = [];
  for (let i = 1; i < valores.length; i++) {
    cambiosFinales.push(Math.abs(valores[i] - valores[i-1]));
  }
  const cambioPromedioFinal = cambiosFinales.reduce((a, b) => a + b, 0) / cambiosFinales.length;
  
  // Calcular cambios en los primeros puntos para comparar
  const primeros = datos.slice(0, Math.min(3, datos.length));
  const valoresPrimeros = primeros.map(d => d.valor);
  const cambiosIniciales = [];
  for (let i = 1; i < valoresPrimeros.length; i++) {
    cambiosIniciales.push(Math.abs(valoresPrimeros[i] - valoresPrimeros[i-1]));
  }
  const cambioPromedioInicial = cambiosIniciales.length > 0 
    ? cambiosIniciales.reduce((a, b) => a + b, 0) / cambiosIniciales.length 
    : cambioPromedioFinal;
  
  const nivelActual = valores[valores.length - 1];
  
  // CRITERIOS para asíntota prematura (MUY ESTRICTOS):
  // 1. Estancamiento reciente MUY pronunciado (cambio < 1 punto en últimos períodos)
  const hayEstancamiento = cambioPromedioFinal < 1;  // CAMBIADO de 2 a 1 (más estricto)
  
  // 2. El nivel actual está por debajo del esperado
  const esPrematura = nivelActual < nivelEsperado - 10;
  
  // 3. Hubo progreso inicial significativo que luego se detuvo
  //    Requiere que el cambio inicial fuera al menos 3x el cambio final (MUY ESTRICTO)
  const huboCambioVelocidad = cambioPromedioInicial > cambioPromedioFinal * 3;  // CAMBIADO de 2 a 3
  
  console.log('🔬 Detector Asíntota Prematura:', {
    hayEstancamiento,
    esPrematura,
    huboCambioVelocidad,
    cambioPromedioInicial: cambioPromedioInicial.toFixed(2),
    cambioPromedioFinal: cambioPromedioFinal.toFixed(2),
    ratio: (cambioPromedioInicial / cambioPromedioFinal).toFixed(2)
  });
  
  // Solo es asíntota prematura si hubo desaceleración marcada
  if (hayEstancamiento && esPrematura && huboCambioVelocidad) {
    console.log('⚠️ ASÍNTOTA DETECTADA');
    return {
      detectada: true,
      nivelAsintota: nivelActual,
      nivelEsperado: nivelEsperado,
      diferencia: nivelEsperado - nivelActual,
      cambioPromedio: cambioPromedioFinal,
      cambioInicial: cambioPromedioInicial
    };
  }
  
  console.log('✓ No es asíntota (progreso lineal)');
  return { detectada: false };
}

/**
 * Analiza si hay una trayectoria cero (sin cambio con edad)
 */
export function detectarTrayectoriaCero(datos) {
  if (datos.length < 3) return null;
  
  const valores = datos.map(d => d.valor);
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const varianza = valores.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / valores.length;
  const desviacion = Math.sqrt(varianza);
  
  // Si la desviación estándar es muy pequeña, no hay cambio
  const umbralSinCambio = 3; // Menos de 3 puntos de variación
  
  if (desviacion < umbralSinCambio) {
    return {
      detectada: true,
      nivelEstable: media,
      desviacion: desviacion,
      interpretacion: 'Sin cambio significativo con la edad'
    };
  }
  
  return { detectada: false };
}

/**
 * Compara interceptos de dos regresiones lineales
 */
export function compararInterceptos(modelo1, modelo2, umbral = 5) {
  const diff = Math.abs(modelo1.intercepto - modelo2.intercepto);
  return {
    diferencia: diff,
    significativa: diff > umbral,
    interpretacion: diff > umbral ? 'Inicio retrasado significativo' : 'Inicio similar'
  };
}

/**
 * Compara pendientes de dos regresiones lineales
 */
export function compararPendientes(modelo1, modelo2, umbral = 0.3) {
  const diff = Math.abs(modelo1.pendiente - modelo2.pendiente);
  const ratio = modelo1.pendiente / modelo2.pendiente;
  
  return {
    diferencia: diff,
    ratio: ratio,
    significativa: diff > umbral,
    interpretacion: diff > umbral ? 
      (modelo1.pendiente < modelo2.pendiente ? 'Velocidad reducida' : 'Velocidad aumentada') :
      'Velocidad similar'
  };
}

/**
 * Clasificación completa según Thomas et al. (2009) - 7 tipologías
 */
export function clasificarTrayectoriaThomas2009(datos, datosReferencia = null) {
  if (!datos || datos.length < 3) {
    return {
      tipo: 'INSUFICIENTES_DATOS',
      descripcion: 'Se necesitan al menos 3 puntos de evaluación',
      confianza: 0
    };
  }
  
  // Ajustar modelos
  const modeloLineal = ajustarRegresionLineal(datos);
  const modeloCuadratico = ajustarRegresionCuadratica(datos);
  const modeloLogistico = ajustarRegresionLogistica(datos);
  
  // Debug
  console.log('🔍 Clasificando trayectoria:', {
    nPuntos: datos.length,
    modeloLineal: {
      intercepto: modeloLineal.intercepto.toFixed(2),
      pendiente: modeloLineal.pendiente.toFixed(3),
      r2: modeloLineal.r2.toFixed(3)
    }
  });
  
  // Detectores especiales
  const trayectoriaCero = detectarTrayectoriaCero(datos);
  const asintotaPrematura = detectarAsintotaPrematura(datos);
  
  console.log('📊 Detectores:', {
    trayectoriaCero: trayectoriaCero.detectada,
    asintotaPrematura: asintotaPrematura.detectada
  });
  
  // 6. ZERO TRAJECTORY
  if (trayectoriaCero.detectada) {
    return {
      tipo: 'ZERO_TRAJECTORY',
      descripcion: 'Trayectoria cero (sin cambio con edad)',
      caracteristicas: [
        `Nivel estable: ${trayectoriaCero.nivelEstable.toFixed(1)}`,
        `Desviación: ${trayectoriaCero.desviacion.toFixed(2)}`,
        'No hay progreso con la edad',
        'Sistema ha alcanzado su límite'
      ],
      implicaciones: [
        'Sin cambio ontogenético significativo',
        'Posible límite del sistema alcanzado',
        'Considerar intervenciones alternativas',
        'Evaluación de factores limitantes'
      ],
      modelo: modeloLineal,
      confianza: 0.9
    };
  }
  
  // 7. NO SYSTEMATIC RELATIONSHIP
  if (modeloLineal.r2 < 0.3 && modeloCuadratico.r2 < 0.3) {
    return {
      tipo: 'NO_SYSTEMATIC_RELATIONSHIP',
      descripcion: 'Sin relación sistemática con edad',
      caracteristicas: [
        `R² lineal: ${modeloLineal.r2.toFixed(3)} (muy bajo)`,
        `R² cuadrático: ${modeloCuadratico.r2.toFixed(3)}`,
        'No hay patrón predecible',
        'Alta variabilidad sin tendencia'
      ],
      implicaciones: [
        'Desarrollo altamente variable',
        'No sigue patrón típico ni atípico definido',
        'Requiere análisis caso por caso',
        'Considerar factores contextuales'
      ],
      modelo: modeloLineal,
      confianza: 0.8
    };
  }
  
  // 4. NONLINEAR
  const testCuadratico = testFModelos(modeloLineal, modeloCuadratico);
  if (testCuadratico.significativo && modeloCuadratico.r2 > modeloLineal.r2 + 0.1) {
    return {
      tipo: 'NONLINEAR',
      descripcion: 'Trayectoria no lineal (mejor ajuste con función curva)',
      caracteristicas: [
        `R² lineal: ${modeloLineal.r2.toFixed(3)}`,
        `R² cuadrático: ${modeloCuadratico.r2.toFixed(3)} (mejor)`,
        `F = ${testCuadratico.F.toFixed(2)} (significativo)`,
        'Patrón de desarrollo no lineal',
        'Posibles oleadas o aceleraciones/desaceleraciones'
      ],
      implicaciones: [
        'Desarrollo sigue patrón curvilíneo',
        'Posibles ventanas críticas de desarrollo',
        'Velocidad varía con la edad',
        'Análisis de derivadas recomendado'
      ],
      modelo: modeloCuadratico,
      testF: testCuadratico,
      confianza: 0.85
    };
  }
  
  // Para los tipos 1-3, necesitamos datos de referencia típicos
  if (!datosReferencia || datosReferencia.length < 3) {
    // Sin referencia, clasificar basándose solo en el patrón observado
    const velocidadPromedio = modeloLineal.pendiente;
    const nivelInicial = modeloLineal.intercepto;
    const r2 = modeloLineal.r2;
    
    // Verificar si hay una trayectoria lineal confiable
    const esLinealConfiable = r2 > 0.7;
    
    if (!esLinealConfiable) {
      // 5. PREMATURE ASYMPTOTE (solo si no es lineal confiable)
      // Verificar después de descartar patrón lineal
      if (asintotaPrematura.detectada) {
        return {
          tipo: 'PREMATURE_ASYMPTOTE',
          descripcion: 'Asíntota prematura (desarrollo se detiene antes del nivel esperado)',
          caracteristicas: [
            `Nivel alcanzado: ${asintotaPrematura.nivelAsintota.toFixed(1)}`,
            `Nivel esperado: ${asintotaPrematura.nivelEsperado.toFixed(1)}`,
            `Diferencia: -${asintotaPrematura.diferencia.toFixed(1)} puntos`,
            `Cambio reciente: ${asintotaPrematura.cambioPromedio.toFixed(2)} puntos/período`,
            `Cambio inicial: ${asintotaPrematura.cambioInicial.toFixed(2)} puntos/período`,
            'Desarrollo se ha estancado prematuramente'
          ],
          implicaciones: [
            'Desarrollo inicial seguido de meseta',
            'Límite prematuro alcanzado',
            'Evaluar causas del estancamiento',
            'Considerar estrategias para superar meseta'
          ],
          modelo: modeloCuadratico,
          confianza: 0.85
        };
      }
      
      // Si no es lineal confiable ni asíntota, es indeterminado
      return {
        tipo: 'INDETERMINADO',
        descripcion: 'Patrón no clasificable claramente',
        caracteristicas: [
          `R² lineal: ${r2.toFixed(3)} (bajo)`,
          'Patrón no claramente definido'
        ],
        implicaciones: [
          'Continuar seguimiento longitudinal',
          'Se necesitan más evaluaciones'
        ],
        modelo: modeloLineal,
        confianza: 0.4
      };
    }
    
    // SLOWED_RATE: Velocidad significativamente diferente de 0
    // Una pendiente positiva indica mejora, negativa indica deterioro
    // Velocidad "normal" sería aproximadamente 0 (CD se mantiene)
    // Velocidad positiva > 0.2 = catching up (convergente)
    // Velocidad negativa < -0.2 = alejándose (divergente)
    if (Math.abs(velocidadPromedio) > 0.2) {
      const esConvergente = velocidadPromedio > 0;
      return {
        tipo: esConvergente ? 'SLOWED_RATE_CONVERGENTE' : 'SLOWED_RATE_DIVERGENTE',
        descripcion: `Velocidad ${esConvergente ? 'aumentada (convergente)' : 'reducida (divergente)'} - desarrollo ${esConvergente ? 'acelerándose' : 'desacelerándose'}`,
        caracteristicas: [
          `Pendiente: ${velocidadPromedio.toFixed(3)} puntos/mes`,
          `R²: ${r2.toFixed(3)}`,
          `Intercepto: ${nivelInicial.toFixed(1)}`,
          esConvergente ? 'Mejora progresiva (catching up)' : 'Deterioro progresivo'
        ],
        implicaciones: esConvergente ? [
          'Desarrollo acelerado, acercándose a normalidad',
          'Pronóstico favorable',
          'Continuar intervención actual (está siendo efectiva)',
          'Puede alcanzar rango normal con el tiempo'
        ] : [
          'Desarrollo más lento que esperado',
          'Distancia con normalidad aumenta',
          'Intervención intensiva necesaria',
          'Evaluación diagnóstica urgente'
        ],
        modelo: modeloLineal,
        confianza: 0.8
      };
    }
    
    // DELAYED_ONSET: Nivel inicial bajo pero velocidad cercana a 0 (estable)
    if (nivelInicial < 85 && Math.abs(velocidadPromedio) <= 0.2) {
      return {
        tipo: 'DELAYED_ONSET',
        descripcion: 'Inicio retrasado (nivel bajo, velocidad estable)',
        caracteristicas: [
          `Intercepto: ${nivelInicial.toFixed(1)} (por debajo de 85)`,
          `Pendiente: ${velocidadPromedio.toFixed(3)} (cercana a 0)`,
          `R²: ${r2.toFixed(3)}`,
          'Trayectoria paralela a normalidad pero desplazada'
        ],
        implicaciones: [
          'Desarrollo sigue mismo patrón que típico pero retrasado',
          'Distancia con normalidad se mantiene constante',
          'Hitos se alcanzan en mismo orden que niños típicos',
          'Estimulación generalizada indicada'
        ],
        modelo: modeloLineal,
        confianza: 0.75
      };
    }
    
    // Si no cumple criterios claros, retornar como desarrollo normal o indeterminado
    if (nivelInicial >= 85) {
      return {
        tipo: 'DESARROLLO_NORMAL',
        descripcion: 'Desarrollo dentro del rango esperado',
        caracteristicas: [
          `Nivel inicial: ${nivelInicial.toFixed(1)} (normal)`,
          `Pendiente: ${velocidadPromedio.toFixed(3)}`,
          `R²: ${r2.toFixed(3)}`,
          'Trayectoria dentro de límites normales'
        ],
        implicaciones: [
          'Desarrollo progresa adecuadamente',
          'Continuar seguimiento periódico',
          'Mantener estimulación apropiada para edad'
        ],
        modelo: modeloLineal,
        confianza: 0.8
      };
    }
  } else {
    // Con datos de referencia, comparar interceptos y pendientes
    const modeloRef = ajustarRegresionLineal(datosReferencia);
    const compIntercepto = compararInterceptos(modeloLineal, modeloRef);
    const compPendiente = compararPendientes(modeloLineal, modeloRef);
    
    // 3. DELAYED ONSET + SLOWED RATE
    if (compIntercepto.significativa && compPendiente.significativa) {
      return {
        tipo: 'DELAYED_ONSET_PLUS_SLOWED_RATE',
        descripcion: 'Inicio retrasado + velocidad reducida (ambos parámetros diferentes)',
        caracteristicas: [
          `Intercepto: ${modeloLineal.intercepto.toFixed(1)} vs ${modeloRef.intercepto.toFixed(1)} (ref)`,
          `Diferencia intercepto: ${compIntercepto.diferencia.toFixed(1)}`,
          `Pendiente: ${modeloLineal.pendiente.toFixed(3)} vs ${modeloRef.pendiente.toFixed(3)} (ref)`,
          `Ratio velocidad: ${compPendiente.ratio.toFixed(2)}`,
          'Tanto inicio como velocidad afectados'
        ],
        implicaciones: [
          'Retraso compuesto: inicio tardío Y progreso lento',
          'Pronóstico más reservado que retraso simple',
          'Intervención intensiva multidimensional',
          'Seguimiento estrecho recomendado'
        ],
        modelo: modeloLineal,
        comparaciones: { intercepto: compIntercepto, pendiente: compPendiente },
        confianza: 0.9
      };
    }
    
    // 1. DELAYED ONSET
    if (compIntercepto.significativa && !compPendiente.significativa) {
      return {
        tipo: 'DELAYED_ONSET',
        descripcion: 'Inicio retrasado (diferencia en intercepto, pendiente similar)',
        caracteristicas: [
          `Intercepto: ${modeloLineal.intercepto.toFixed(1)} vs ${modeloRef.intercepto.toFixed(1)} (ref)`,
          `Diferencia: ${compIntercepto.diferencia.toFixed(1)}`,
          `Pendiente similar: ${modeloLineal.pendiente.toFixed(3)}`,
          'Trayectoria paralela desplazada'
        ],
        implicaciones: [
          'Desarrollo sigue mismo patrón pero iniciado más tarde',
          'Pronóstico: distancia constante con normalidad',
          'Intervención: estimulación generalizada',
          'Secuencia de hitos preservada'
        ],
        modelo: modeloLineal,
        comparaciones: { intercepto: compIntercepto, pendiente: compPendiente },
        confianza: 0.9
      };
    }
    
    // 2. SLOWED RATE
    if (!compIntercepto.significativa && compPendiente.significativa) {
      const esConvergente = modeloLineal.pendiente > modeloRef.pendiente;
      return {
        tipo: esConvergente ? 'SLOWED_RATE_CONVERGENTE' : 'SLOWED_RATE_DIVERGENTE',
        descripcion: `Velocidad ${esConvergente ? 'aumentada (convergente)' : 'reducida (divergente)'} - diferencia en pendiente`,
        caracteristicas: [
          `Inicio similar: ${modeloLineal.intercepto.toFixed(1)}`,
          `Pendiente: ${modeloLineal.pendiente.toFixed(3)} vs ${modeloRef.pendiente.toFixed(3)} (ref)`,
          `Ratio: ${compPendiente.ratio.toFixed(2)}`,
          esConvergente ? 'Acercándose a normalidad' : 'Alejándose de normalidad'
        ],
        implicaciones: esConvergente ? [
          'Desarrollo acelerado, catching up',
          'Pronóstico favorable',
          'Intervención efectiva - continuar',
          'Posible normalización futura'
        ] : [
          'Velocidad inferior a esperada',
          'Distancia con normalidad aumenta',
          'Intensificar intervención',
          'Reevaluación diagnóstica'
        ],
        modelo: modeloLineal,
        comparaciones: { intercepto: compIntercepto, pendiente: compPendiente },
        confianza: 0.9
      };
    }
  }
  
  // Clasificación por defecto
  return {
    tipo: 'INDETERMINADO',
    descripcion: 'Patrón no clasificable claramente',
    caracteristicas: [
      `R² lineal: ${modeloLineal.r2.toFixed(3)}`,
      'Se necesitan más datos o análisis más detallado'
    ],
    implicaciones: [
      'Continuar seguimiento longitudinal',
      'Considerar evaluación especializada'
    ],
    modelo: modeloLineal,
    confianza: 0.5
  };
}
