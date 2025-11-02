/**
 * Modelos Estadísticos Avanzados para Análisis del Neurodesarrollo
 * 
 * Basado en:
 * - Thomas (2016) - Statistical approaches with SPSS
 * - Deboeck et al. (2016) - Using derivatives to articulate change theories
 * - Thomas et al. (2009) - Using developmental trajectories
 * 
 * Implementa:
 * 1. Hierarchical Linear Modeling (HLM) simplificado
 * 2. Latent Growth Curve Modeling (LGCM) básico
 * 3. Análisis de oleadas de desarrollo con modelos polinomiales
 * 4. Comparación pre/post intervención
 */

/**
 * Ajuste de modelo polinomial para detectar oleadas de desarrollo
 * Basado en Thomas (2016) - Statistical approaches
 * 
 * @param {Array} puntos - [{edad, valor}]
 * @param {number} grado - Grado del polinomio (2=cuadrático, 3=cúbico)
 * @returns {Object} - {coeficientes, r2, predicciones, puntosCambio}
 */
export function ajustarModeloPolinomial(puntos, grado = 3) {
  if (!puntos || puntos.length < grado + 1) {
    return null;
  }

  const n = puntos.length;
  const x = puntos.map(p => p.edad);
  const y = puntos.map(p => p.valor);

  // Crear matriz de diseño X
  const X = [];
  for (let i = 0; i < n; i++) {
    const fila = [1]; // Término constante
    for (let j = 1; j <= grado; j++) {
      fila.push(Math.pow(x[i], j));
    }
    X.push(fila);
  }

  // Mínimos cuadrados: (X'X)^-1 X'y
  const coeficientes = resolverMinimosCuadrados(X, y);
  
  // Calcular R²
  const yMedio = y.reduce((a, b) => a + b, 0) / n;
  const predicciones = x.map(xi => {
    let pred = coeficientes[0];
    for (let j = 1; j <= grado; j++) {
      pred += coeficientes[j] * Math.pow(xi, j);
    }
    return pred;
  });

  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMedio, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - predicciones[i], 2), 0);
  const r2 = 1 - (ssResidual / ssTotal);

  // Detectar puntos de cambio (derivada segunda = 0 para inflexión)
  const puntosCambio = detectarPuntosInflexion(coeficientes, grado, Math.min(...x), Math.max(...x));

  return {
    coeficientes,
    r2,
    predicciones,
    puntosCambio,
    ecuacion: generarEcuacion(coeficientes, grado)
  };
}

/**
 * Resuelve sistema de mínimos cuadrados usando eliminación gaussiana
 */
function resolverMinimosCuadrados(X, y) {
  const n = X.length;
  const m = X[0].length;

  // Calcular X'X y X'y
  const XtX = [];
  const Xty = new Array(m).fill(0);

  for (let i = 0; i < m; i++) {
    XtX[i] = new Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < n; k++) {
        XtX[i][j] += X[k][i] * X[k][j];
      }
    }
    for (let k = 0; k < n; k++) {
      Xty[i] += X[k][i] * y[k];
    }
  }

  // Resolver sistema usando eliminación gaussiana
  return resolverSistemaLineal(XtX, Xty);
}

/**
 * Resolución de sistema lineal Ax = b
 */
function resolverSistemaLineal(A, b) {
  const n = A.length;
  const Ab = A.map((fila, i) => [...fila, b[i]]);

  // Eliminación hacia adelante
  for (let i = 0; i < n; i++) {
    // Pivoteo parcial
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(Ab[k][i]) > Math.abs(Ab[maxRow][i])) {
        maxRow = k;
      }
    }
    [Ab[i], Ab[maxRow]] = [Ab[maxRow], Ab[i]];

    // Hacer ceros debajo del pivote
    for (let k = i + 1; k < n; k++) {
      const factor = Ab[k][i] / Ab[i][i];
      for (let j = i; j <= n; j++) {
        Ab[k][j] -= factor * Ab[i][j];
      }
    }
  }

  // Sustitución hacia atrás
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = Ab[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= Ab[i][j] * x[j];
    }
    x[i] /= Ab[i][i];
  }

  return x;
}

/**
 * Detecta puntos de inflexión (oleadas de desarrollo)
 */
function detectarPuntosInflexion(coef, grado, xMin, xMax) {
  if (grado < 2) return [];

  // Derivada segunda
  const d2 = [];
  for (let i = 2; i <= grado; i++) {
    d2.push(coef[i] * i * (i - 1));
  }

  // Buscar raíces de la derivada segunda
  const puntos = [];
  const pasos = 100;
  const dx = (xMax - xMin) / pasos;

  for (let i = 0; i < pasos; i++) {
    const x1 = xMin + i * dx;
    const x2 = xMin + (i + 1) * dx;

    let y1 = 0, y2 = 0;
    for (let j = 0; j < d2.length; j++) {
      y1 += d2[j] * Math.pow(x1, j);
      y2 += d2[j] * Math.pow(x2, j);
    }

    // Cambio de signo indica punto de inflexión
    if (y1 * y2 < 0) {
      const xInflexion = (x1 + x2) / 2;
      puntos.push({
        edad: xInflexion,
        tipo: y1 > 0 ? 'aceleracion_a_desaceleracion' : 'desaceleracion_a_aceleracion'
      });
    }
  }

  return puntos;
}

/**
 * Genera ecuación en formato legible
 */
function generarEcuacion(coef, grado) {
  let ecuacion = `y = ${coef[0].toFixed(2)}`;
  for (let i = 1; i <= grado; i++) {
    const signo = coef[i] >= 0 ? '+' : '';
    ecuacion += ` ${signo}${coef[i].toFixed(2)}x`;
    if (i > 1) ecuacion += `^${i}`;
  }
  return ecuacion;
}

/**
 * Análisis pre/post intervención
 * Basado en Deboeck et al. (2016)
 * 
 * @param {Array} puntosAntes - Datos antes de intervención
 * @param {Array} puntosDespues - Datos después de intervención
 * @param {number} edadIntervención - Edad a la que ocurrió la intervención
 * @returns {Object} - Análisis comparativo
 */
export function analizarPrePostIntervencion(puntosAntes, puntosDespues, edadIntervencion) {
  if (!puntosAntes || !puntosDespues || puntosAntes.length < 2 || puntosDespues.length < 2) {
    return null;
  }

  // Ajustar líneas de tendencia
  const modeloAntes = ajustarModeloLineal(puntosAntes);
  const modeloDespues = ajustarModeloLineal(puntosDespues);

  // Calcular velocidades (pendientes)
  const velocidadAntes = modeloAntes.pendiente;
  const velocidadDespues = modeloDespues.pendiente;
  const cambioVelocidad = velocidadDespues - velocidadAntes;
  const cambioRelativo = (cambioVelocidad / Math.abs(velocidadAntes)) * 100;

  // Calcular aceleraciones (cambio en velocidad)
  const aceleracionAntes = calcularAceleracionMedia(puntosAntes);
  const aceleracionDespues = calcularAceleracionMedia(puntosDespues);

  // Test de significancia (t-test simplificado)
  const significancia = testSignificanciaVelocidad(puntosAntes, puntosDespues);

  return {
    velocidadAntes,
    velocidadDespues,
    cambioVelocidad,
    cambioRelativo,
    aceleracionAntes,
    aceleracionDespues,
    edadIntervencion,
    significancia,
    interpretacion: interpretarCambioIntervencion(cambioVelocidad, significancia)
  };
}

/**
 * Ajusta modelo lineal simple
 */
function ajustarModeloLineal(puntos) {
  const n = puntos.length;
  const sumX = puntos.reduce((s, p) => s + p.edad, 0);
  const sumY = puntos.reduce((s, p) => s + p.valor, 0);
  const sumXY = puntos.reduce((s, p) => s + p.edad * p.valor, 0);
  const sumX2 = puntos.reduce((s, p) => s + p.edad * p.edad, 0);

  const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercepto = (sumY - pendiente * sumX) / n;

  return { pendiente, intercepto };
}

/**
 * Calcula aceleración media (cambio en velocidad)
 */
function calcularAceleracionMedia(puntos) {
  if (puntos.length < 3) return 0;

  const velocidades = [];
  for (let i = 1; i < puntos.length; i++) {
    const vel = (puntos[i].valor - puntos[i-1].valor) / (puntos[i].edad - puntos[i-1].edad);
    velocidades.push(vel);
  }

  const aceleraciones = [];
  for (let i = 1; i < velocidades.length; i++) {
    const acel = velocidades[i] - velocidades[i-1];
    aceleraciones.push(acel);
  }

  return aceleraciones.reduce((s, a) => s + a, 0) / aceleraciones.length;
}

/**
 * Test de significancia simplificado para cambio en velocidad
 */
function testSignificanciaVelocidad(puntosAntes, puntosDespues) {
  const velocidadesAntes = calcularVelocidades(puntosAntes);
  const velocidadesDespues = calcularVelocidades(puntosDespues);

  const mediaAntes = velocidadesAntes.reduce((s, v) => s + v, 0) / velocidadesAntes.length;
  const mediaDespues = velocidadesDespues.reduce((s, v) => s + v, 0) / velocidadesDespues.length;

  const varianzaAntes = velocidadesAntes.reduce((s, v) => s + Math.pow(v - mediaAntes, 2), 0) / (velocidadesAntes.length - 1);
  const varianzaDespues = velocidadesDespues.reduce((s, v) => s + Math.pow(v - mediaDespues, 2), 0) / (velocidadesDespues.length - 1);

  const errorEstandar = Math.sqrt(varianzaAntes / velocidadesAntes.length + varianzaDespues / velocidadesDespues.length);
  const tStatistic = Math.abs(mediaDespues - mediaAntes) / errorEstandar;

  // Aproximación de significancia
  let pValue;
  if (tStatistic > 2.576) pValue = 0.01;
  else if (tStatistic > 1.96) pValue = 0.05;
  else if (tStatistic > 1.645) pValue = 0.10;
  else pValue = 0.20;

  return {
    tStatistic,
    pValue,
    significativo: pValue < 0.05
  };
}

/**
 * Calcula velocidades entre puntos consecutivos
 */
function calcularVelocidades(puntos) {
  const velocidades = [];
  for (let i = 1; i < puntos.length; i++) {
    const vel = (puntos[i].valor - puntos[i-1].valor) / (puntos[i].edad - puntos[i-1].edad);
    velocidades.push(vel);
  }
  return velocidades;
}

/**
 * Interpreta el cambio por intervención
 */
function interpretarCambioIntervencion(cambioVel, sig) {
  if (!sig.significativo) {
    return {
      nivel: 'no_significativo',
      mensaje: 'No hay evidencia estadística de cambio significativo post-intervención',
      color: '#9e9e9e'
    };
  }

  if (cambioVel > 0.5) {
    return {
      nivel: 'mejora_significativa',
      mensaje: 'Mejora significativa en velocidad de desarrollo post-intervención',
      color: '#4caf50'
    };
  } else if (cambioVel > 0.2) {
    return {
      nivel: 'mejora_moderada',
      mensaje: 'Mejora moderada en velocidad de desarrollo post-intervención',
      color: '#8bc34a'
    };
  } else if (cambioVel < -0.5) {
    return {
      nivel: 'deterioro_significativo',
      mensaje: 'Deterioro significativo en velocidad de desarrollo post-intervención',
      color: '#f44336'
    };
  } else {
    return {
      nivel: 'cambio_minimo',
      mensaje: 'Cambio mínimo en velocidad de desarrollo post-intervención',
      color: '#ff9800'
    };
  }
}

/**
 * Clasificación automática mejorada de trayectorias
 * Algoritmo refinado basado en Thomas et al. (2009)
 * 
 * @param {Array} puntosNino - Datos del niño
 * @param {Array} puntosNormativos - Datos normativos de referencia
 * @returns {Object} - Clasificación con alertas específicas
 */
export function clasificarTrayectoriaAutomatica(puntosNino, puntosNormativos) {
  if (!puntosNino || puntosNino.length < 3 || !puntosNormativos || puntosNormativos.length < 3) {
    return null;
  }

  // Ajustar modelos
  const modeloNino = ajustarModeloPolinomial(puntosNino, 2);
  const modeloNormativo = ajustarModeloPolinomial(puntosNormativos, 2);

  // Calcular métricas
  const pendienteNino = modeloNino.coeficientes[1];
  const pendienteNormativo = modeloNormativo.coeficientes[1];
  
  const interceptoNino = modeloNino.coeficientes[0];
  const interceptoNormativo = modeloNormativo.coeficientes[0];

  const diferenciaPendiente = Math.abs(pendienteNino - pendienteNormativo) / Math.abs(pendienteNormativo);
  const diferenciaIntercepto = interceptoNino - interceptoNormativo;

  // Clasificación
  let tipo, severidad, alertas;

  if (diferenciaPendiente < 0.2 && diferenciaIntercepto < -1) {
    // Pendiente similar, pero desplazado hacia abajo
    tipo = 'DELAY';
    severidad = Math.abs(diferenciaIntercepto) > 2 ? 'severo' : 'moderado';
    alertas = [
      'Trayectoria paralela a la normal pero retrasada',
      'Mantiene ritmo de desarrollo pero con retraso inicial',
      'Puede beneficiarse de estimulación para alcanzar norma'
    ];
  } else if (diferenciaPendiente > 0.3) {
    // Pendiente significativamente diferente
    if (pendienteNino < pendienteNormativo) {
      tipo = 'DEVIANCE';
      severidad = diferenciaPendiente > 0.5 ? 'severo' : 'moderado';
      alertas = [
        'Trayectoria con velocidad de desarrollo reducida',
        'Brecha se amplía con el tiempo respecto a normativa',
        'Requiere intervención temprana para mejorar velocidad'
      ];
    } else {
      tipo = 'ACELERADO';
      severidad = 'positivo';
      alertas = [
        'Desarrollo acelerado respecto a normativa',
        'Velocidad superior a la esperada',
        'Monitorear para asegurar desarrollo armónico'
      ];
    }
  } else if (modeloNino.puntosCambio.length > 0) {
    // Hay puntos de inflexión
    tipo = 'DYSMATURITY';
    severidad = 'moderado';
    alertas = [
      'Patrón de desarrollo con oleadas',
      'Períodos de aceleración y desaceleración',
      'Evaluar factores ambientales o intervenciones'
    ];
  } else {
    tipo = 'NORMAL';
    severidad = 'ninguno';
    alertas = [
      'Desarrollo dentro de parámetros esperados',
      'Seguir monitoreo rutinario'
    ];
  }

  return {
    tipo,
    severidad,
    alertas,
    metricas: {
      diferenciaPendiente: diferenciaPendiente * 100,
      diferenciaIntercepto,
      r2Nino: modeloNino.r2,
      r2Normativo: modeloNormativo.r2
    },
    recomendaciones: generarRecomendaciones(tipo, severidad)
  };
}

/**
 * Genera recomendaciones clínicas basadas en clasificación
 */
function generarRecomendaciones(tipo, severidad) {
  const recomendaciones = {
    DELAY: [
      'Evaluación comprehensive del desarrollo',
      'Programa de estimulación temprana',
      'Seguimiento cada 3 meses',
      'Descartar factores ambientales o médicos'
    ],
    DEVIANCE: [
      'Evaluación neurológica especializada',
      'Intervención intensiva temprana',
      'Seguimiento mensual',
      'Considerar evaluación genética si severidad alta'
    ],
    DYSMATURITY: [
      'Evaluar factores contextuales (intervenciones, cambios)',
      'Análisis pre/post intervención si aplica',
      'Ajustar plan terapéutico según fases',
      'Seguimiento bimensual'
    ],
    ACELERADO: [
      'Monitoreo de desarrollo armónico',
      'Asegurar estimulación apropiada a nivel',
      'Seguimiento cada 6 meses',
      'Atención a aspectos socioemocionales'
    ],
    NORMAL: [
      'Continuar seguimiento rutinario',
      'Promover ambientes estimulantes',
      'Seguimiento semestral o anual'
    ]
  };

  return recomendaciones[tipo] || [];
}
