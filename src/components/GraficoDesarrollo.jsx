import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ZAxis, ComposedChart, Area } from 'recharts';
import { calcularEdadCorregidaMeses } from '../utils/ageCalculations';
import { API_URL } from '../config';

function GraficoDesarrollo({ ninoId }) {
  const [analisis, setAnalisis] = useState(null);
  const [redFlags, setRedFlags] = useState([]);
  const [dominioSeleccionado, setDominioSeleccionado] = useState('global');
  const [fuentesNormativas, setFuentesNormativas] = useState([]);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [mostrarLinea45, setMostrarLinea45] = useState(true);

  useEffect(() => {
    cargarDatos();
    cargarFuentesNormativas();
  }, [ninoId]);

  useEffect(() => {
    if (fuenteSeleccionada) {
      cargarDatos();
    }
  }, [fuenteSeleccionada]);

  const cargarFuentesNormativas = async () => {
    try {
      const response = await fetch(`${API_URL}/fuentes-normativas`);
      const data = await response.json();
      setFuentesNormativas(data);
      if (data.length > 0 && !fuenteSeleccionada) {
        setFuenteSeleccionada(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar fuentes normativas:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      const fuenteParam = fuenteSeleccionada ? `?fuente=${fuenteSeleccionada}` : '';
      const [analisisRes, redFlagsRes] = await Promise.all([
        fetch(`${API_URL}/analisis/${ninoId}${fuenteParam}`),
        fetch(`${API_URL}/red-flags-observadas/${ninoId}`)
      ]);

      const analisisData = await analisisRes.json();
      const redFlagsData = await redFlagsRes.json();

      setAnalisis(analisisData);
      setRedFlags(redFlagsData);
    } catch (error) {
      console.error('Error al cargar análisis:', error);
    }
  };

  if (!analisis) {
    return <div className="loading">Cargando análisis...</div>;
  }

  // Colores para cada dominio
  const coloresDominios = {
    1: '#FF6B6B', // Motor Grueso - Rojo
    2: '#4ECDC4', // Motor Fino - Turquesa
    3: '#45B7D1', // Lenguaje Receptivo - Azul claro
    4: '#96CEB4', // Lenguaje Expresivo - Verde claro
    5: '#FFEAA7', // Social-Emocional - Amarillo
    6: '#DFE6E9', // Cognitivo - Gris claro
    7: '#A29BFE'  // Adaptativo - Morado
  };

  // Función para calcular regresión polinómica simplificada y robusta
  const calcularRegresionPolinomial = (puntos, keyX, keyY) => {
    try {
      const datos = puntos.filter(p => p[keyX] != null && p[keyY] != null && !isNaN(p[keyX]) && !isNaN(p[keyY]));
      
      // Si hay muy pocos datos, usar regresión lineal simple
      if (datos.length < 2) return null;
      if (datos.length === 2) {
        // Regresión lineal para 2 puntos
        const x1 = datos[0][keyX], y1 = datos[0][keyY];
        const x2 = datos[1][keyX], y2 = datos[1][keyY];
        const m = (y2 - y1) / (x2 - x1);
        const b = y1 - m * x1;
        return { coeficientes: [b, m], grado: 1 };
      }
      
      const n = datos.length;
      const grado = Math.min(n <= 5 ? 2 : 3, n - 1); // No exceder n-1
      
      const X = datos.map(p => p[keyX]);
      const Y = datos.map(p => p[keyY]);
      
      // Normalizar X para estabilidad numérica
      const xMin = Math.min(...X);
      const xMax = Math.max(...X);
      const xRange = xMax - xMin || 1;
      const Xnorm = X.map(x => (x - xMin) / xRange);
      
      // Crear matriz de diseño (Vandermonde)
      const V = [];
      for (let i = 0; i < n; i++) {
        const fila = [];
        for (let j = 0; j <= grado; j++) {
          fila.push(Math.pow(Xnorm[i], j));
        }
        V.push(fila);
      }
      
      // Calcular V'V
      const VtV = [];
      for (let i = 0; i <= grado; i++) {
        VtV[i] = [];
        for (let j = 0; j <= grado; j++) {
          let suma = 0;
          for (let k = 0; k < n; k++) {
            suma += V[k][i] * V[k][j];
          }
          VtV[i][j] = suma;
        }
      }
      
      // Calcular V'Y
      const VtY = [];
      for (let i = 0; i <= grado; i++) {
        let suma = 0;
        for (let k = 0; k < n; k++) {
          suma += V[k][i] * Y[k];
        }
        VtY[i] = suma;
      }
      
      // Resolver sistema con Gauss-Jordan (más estable)
      const Ab = VtV.map((fila, i) => [...fila, VtY[i]]);
      const m = grado + 1;
      
      // Eliminación hacia adelante con pivoteo
      for (let i = 0; i < m; i++) {
        // Pivoteo
        let maxRow = i;
        for (let k = i + 1; k < m; k++) {
          if (Math.abs(Ab[k][i]) > Math.abs(Ab[maxRow][i])) {
            maxRow = k;
          }
        }
        [Ab[i], Ab[maxRow]] = [Ab[maxRow], Ab[i]];
        
        // Verificar pivote
        if (Math.abs(Ab[i][i]) < 1e-10) {
          console.warn('Matriz singular, usando grado menor');
          if (grado > 1) {
            // Intentar con grado menor
            return calcularRegresionPolinomial(puntos.slice(0, Math.min(5, puntos.length)), keyX, keyY);
          }
          return null;
        }
        
        // Normalizar fila pivote
        const pivot = Ab[i][i];
        for (let j = i; j <= m; j++) {
          Ab[i][j] /= pivot;
        }
        
        // Eliminar
        for (let k = 0; k < m; k++) {
          if (k !== i) {
            const factor = Ab[k][i];
            for (let j = i; j <= m; j++) {
              Ab[k][j] -= factor * Ab[i][j];
            }
          }
        }
      }
      
      // Extraer solución
      const coefNorm = Ab.map(fila => fila[m]);
      
      // Desnormalizar coeficientes
      const coef = [];
      for (let i = 0; i <= grado; i++) {
        let c = 0;
        for (let j = i; j <= grado; j++) {
          const binomial = factorial(j) / (factorial(i) * factorial(j - i));
          c += coefNorm[j] * binomial * Math.pow(-xMin / xRange, j - i) * Math.pow(1 / xRange, i);
        }
        coef[i] = c;
      }
      
      return { coeficientes: coef, grado, xMin, xMax, xRange };
      
    } catch (error) {
      console.error('Error en regresión polinómica:', error);
      return null;
    }
  };
  
  // Función auxiliar factorial
  const factorial = (n) => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  // Función para generar puntos de línea de tendencia suave con más puntos
  const generarLineaTendenciaSuave = (puntos, keyX, keyY, regresion) => {
    if (!regresion) return [];
    
    const xMin = Math.min(...puntos.map(p => p[keyX]));
    const xMax = Math.max(...puntos.map(p => p[keyX]));
    
    // Generar muchos puntos para curva suave (cada 0.5 meses)
    const numPuntos = Math.max(50, Math.ceil((xMax - xMin) * 2));
    const paso = (xMax - xMin) / numPuntos;
    
    const lineaTendencia = [];
    for (let i = 0; i <= numPuntos; i++) {
      const x = xMin + i * paso;
      
      // Evaluar polinomio: y = c0 + c1*x + c2*x² + c3*x³ + ...
      let y = 0;
      for (let j = 0; j <= regresion.grado; j++) {
        y += regresion.coeficientes[j] * Math.pow(x, j);
      }
      
      lineaTendencia.push({
        [keyX]: x,
        [keyY]: y
      });
    }
    
    return lineaTendencia;
  };



  const edadActualMeses = analisis.edad_actual_meses;
  
  // Extraer lista única de dominios de los hitos conseguidos - MOVER AL INICIO
  const dominios = [...new Set(analisis.hitos_conseguidos.map(h => ({
    id: h.dominio_id,
    nombre: h.dominio_nombre
  })).map(d => JSON.stringify(d)))].map(d => JSON.parse(d));
  
  // Calcular edad de desarrollo para cada hito
  // La edad de desarrollo es la edad normativa (edad_media_meses) del hito
  const hitosConEdadDesarrollo = analisis.hitos_conseguidos
    .filter(hito => hito.edad_conseguido_meses <= edadActualMeses)
    .map(hito => ({
      ...hito,
      edad_desarrollo: hito.edad_media_meses, // Edad esperada del hito
      edad_cronologica: hito.edad_conseguido_meses // Edad cuando lo logró
    }));

  // Agrupar hitos por edad cronológica para calcular edad de desarrollo promedio en cada momento
  const hitosPorEdadCronologica = {};
  
  hitosConEdadDesarrollo.forEach(hito => {
    const edad = Math.round(hito.edad_cronologica * 10) / 10;
    if (!hitosPorEdadCronologica[edad]) {
      hitosPorEdadCronologica[edad] = {
        edad_cronologica: edad,
        hitos_por_dominio: {}
      };
    }
    
    if (!hitosPorEdadCronologica[edad].hitos_por_dominio[hito.dominio_id]) {
      hitosPorEdadCronologica[edad].hitos_por_dominio[hito.dominio_id] = [];
    }
    
    hitosPorEdadCronologica[edad].hitos_por_dominio[hito.dominio_id].push(hito);
  });

  // Calcular edad de desarrollo global y por dominio para cada punto temporal
  const datosGrafico = Object.values(hitosPorEdadCronologica).map(punto => {
    const resultado = {
      edad_cronologica: punto.edad_cronologica,
      hitos_detalle: []
    };
    
    let sumaEdadesDesarrollo = 0;
    let totalHitos = 0;
    
    // Calcular edad de desarrollo por dominio
    Object.entries(punto.hitos_por_dominio).forEach(([dominioId, hitos]) => {
      const edadesDesarrollo = hitos.map(h => h.edad_desarrollo);
      const promedioEdadDesarrollo = edadesDesarrollo.reduce((a, b) => a + b, 0) / edadesDesarrollo.length;
      
      resultado[`dominio_${dominioId}`] = promedioEdadDesarrollo;
      resultado[`dominio_${dominioId}_hitos`] = hitos;
      
      sumaEdadesDesarrollo += edadesDesarrollo.reduce((a, b) => a + b, 0);
      totalHitos += edadesDesarrollo.length;
      
      resultado.hitos_detalle.push({
        dominio_id: dominioId,
        dominio_nombre: hitos[0].dominio_nombre,
        edad_desarrollo: promedioEdadDesarrollo,
        cantidad: hitos.length
      });
    });
    
    // Edad de desarrollo global (promedio de todos los hitos en este punto)
    resultado.edad_desarrollo_global = totalHitos > 0 ? sumaEdadesDesarrollo / totalHitos : null;
    
    return resultado;
  }).sort((a, b) => a.edad_cronologica - b.edad_cronologica);

  // Calcular edad de desarrollo global actual (última medición)
  const edadDesarrolloGlobalActual = datosGrafico.length > 0 
    ? datosGrafico[datosGrafico.length - 1].edad_desarrollo_global 
    : null;

  // Calcular edad de desarrollo por dominio (promedio de todos los hitos del dominio)
  const edadDesarrolloPorDominio = {};
  Object.entries(analisis.estadisticas_por_dominio).forEach(([id, stats]) => {
    const hitosDelDominio = hitosConEdadDesarrollo.filter(h => h.dominio_id === parseInt(id));
    if (hitosDelDominio.length > 0) {
      const sumaEdades = hitosDelDominio.reduce((sum, h) => sum + h.edad_desarrollo, 0);
      edadDesarrolloPorDominio[id] = {
        ...stats,
        edad_desarrollo_promedio: sumaEdades / hitosDelDominio.length
      };
    }
  });

  // Calcular velocidad de desarrollo desde el origen (0,0)
  // Velocidad = edad_desarrollo / edad_cronologica (pendiente desde origen)
  const datosVelocidad = datosGrafico.map((punto, idx) => {
    // Velocidad desde el origen
    const velocidad = punto.edad_cronologica !== 0 
      ? punto.edad_desarrollo_global / punto.edad_cronologica 
      : null;
    
    const resultado = {
      edad_cronologica: punto.edad_cronologica,
      velocidad: velocidad,
      velocidad_porcentaje: velocidad ? velocidad * 100 : null
    };

    // Calcular velocidad por dominio desde el origen
    dominios.forEach(d => {
      const dominioKey = `dominio_${d.id}`;
      if (punto[dominioKey] != null && punto.edad_cronologica !== 0) {
        resultado[`velocidad_dominio_${d.id}`] = punto[dominioKey] / punto.edad_cronologica;
      } else {
        resultado[`velocidad_dominio_${d.id}`] = null;
      }
    });

    return resultado;
  });

  // Calcular puntuaciones Z
  // Z-score = (edad de desarrollo - edad cronológica) / desviación estándar estimada
  // Usaremos una desviación estándar estimada del 15% de la edad cronológica
  const datosZScore = datosGrafico.map(punto => {
    const sd = Math.max(punto.edad_cronologica * 0.15, 2);
    
    const resultado = {
      edad_cronologica: punto.edad_cronologica,
      zscore: null,
      diferencia_meses: null
    };

    // Z-score global
    if (punto.edad_desarrollo_global) {
      const diferencia = punto.edad_desarrollo_global - punto.edad_cronologica;
      resultado.zscore = diferencia / sd;
      resultado.diferencia_meses = diferencia;
    }

    // Z-score por dominio
    dominios.forEach(d => {
      const dominioKey = `dominio_${d.id}`;
      if (punto[dominioKey] != null) {
        const diferenciaDominio = punto[dominioKey] - punto.edad_cronologica;
        resultado[`zscore_dominio_${d.id}`] = diferenciaDominio / sd;
      } else {
        resultado[`zscore_dominio_${d.id}`] = null;
      }
    });

    return resultado;
  });

  // Datos para la línea de 45 grados (desarrollo típico)
  const maxEdad = Math.max(
    edadActualMeses,
    ...datosGrafico.map(d => d.edad_cronologica),
    ...datosGrafico.map(d => d.edad_desarrollo_global || 0)
  );
  const lineaDesarrolloTipico = [
    { edad_cronologica: 0, edad_desarrollo: 0 },
    { edad_cronologica: maxEdad + 6, edad_desarrollo: maxEdad + 6 }
  ];

  // Calcular regresiones lineales para todas las gráficas
  const regresionDesarrollo = calcularRegresionPolinomial(datosGrafico, 'edad_cronologica', 'edad_desarrollo_global');
  const lineaTendenciaDesarrollo = regresionDesarrollo 
    ? generarLineaTendenciaSuave(datosGrafico, 'edad_cronologica', 'edad_desarrollo_global', regresionDesarrollo)
    : [];

  // Calcular velocidad desde la línea de tendencia de desarrollo (derivada)
  // Velocidad = pendiente = cambio en edad_desarrollo / cambio en edad_cronologica
  const datosVelocidadDesdeTendencia = lineaTendenciaDesarrollo.map((punto, idx) => {
    if (idx === 0) {
      return {
        edad_cronologica: punto.edad_cronologica,
        velocidad: null
      };
    }
    
    const puntoAnterior = lineaTendenciaDesarrollo[idx - 1];
    const deltaDesarrollo = punto.edad_desarrollo_global - puntoAnterior.edad_desarrollo_global;
    const deltaEdadCronologica = punto.edad_cronologica - puntoAnterior.edad_cronologica;
    const velocidad = deltaEdadCronologica !== 0 ? deltaDesarrollo / deltaEdadCronologica : null;
    
    const resultado = {
      edad_cronologica: punto.edad_cronologica,
      velocidad: velocidad,
      velocidad_porcentaje: velocidad ? velocidad * 100 : null
    };

    // Calcular velocidad por dominio desde líneas de tendencia
    dominios.forEach(d => {
      resultado[`velocidad_dominio_${d.id}`] = null;
    });

    return resultado;
  });

  const regresionVelocidad = calcularRegresionPolinomial(datosVelocidadDesdeTendencia.filter(d => d.velocidad !== null), 'edad_cronologica', 'velocidad');
  const lineaTendenciaVelocidad = regresionVelocidad
    ? generarLineaTendenciaSuave(datosVelocidadDesdeTendencia.filter(d => d.velocidad !== null), 'edad_cronologica', 'velocidad', regresionVelocidad)
    : [];

  // Calcular aceleración de desarrollo (derivada de la línea de tendencia de velocidad)
  // Aceleración = cambio en velocidad de tendencia / cambio en edad cronológica
  // SIN REGRESIÓN - muestra las oscilaciones reales
  const datosAceleracion = lineaTendenciaVelocidad.map((punto, idx) => {
    if (idx === 0) {
      return { 
        edad_cronologica: punto.edad_cronologica, 
        aceleracion: null 
      };
    }
    
    const puntoAnterior = lineaTendenciaVelocidad[idx - 1];
    const deltaVelocidad = punto.velocidad - puntoAnterior.velocidad;
    const deltaEdadCronologica = punto.edad_cronologica - puntoAnterior.edad_cronologica;
    const aceleracion = deltaEdadCronologica !== 0 ? deltaVelocidad / deltaEdadCronologica : null;
    
    return {
      edad_cronologica: punto.edad_cronologica,
      aceleracion: aceleracion
    };
  });

  const regresionZScore = calcularRegresionPolinomial(datosZScore.filter(d => d.zscore !== null), 'edad_cronologica', 'zscore');
  const lineaTendenciaZScore = regresionZScore
    ? generarLineaTendenciaSuave(datosZScore.filter(d => d.zscore !== null), 'edad_cronologica', 'zscore', regresionZScore)
    : [];

  // Calcular Z-score actual (última medición)
  const zScoreActual = datosZScore.length > 0 && datosZScore[datosZScore.length - 1].zscore !== null
    ? datosZScore[datosZScore.length - 1].zscore
    : null;

  // Calcular regresiones por dominio
  const regresionesPorDominio = {};
  const lineasTendenciaPorDominio = {};
  const regresionesVelocidadPorDominio = {};
  const lineasTendenciaVelocidadPorDominio = {};
  const regresionesAceleracionPorDominio = {};
  const lineasTendenciaAceleracionPorDominio = {};
  const regresionesZScorePorDominio = {};
  const lineasTendenciaZScorePorDominio = {};
  
  dominios.forEach(dominio => {
    // Regresión de desarrollo
    const datosDominio = datosGrafico.filter(d => d[`dominio_${dominio.id}`] != null);
    if (datosDominio.length >= 2) {
      const regresion = calcularRegresionPolinomial(datosDominio, 'edad_cronologica', `dominio_${dominio.id}`);
      if (regresion) {
        regresionesPorDominio[dominio.id] = regresion;
        lineasTendenciaPorDominio[dominio.id] = generarLineaTendenciaSuave(datosDominio, 'edad_cronologica', `dominio_${dominio.id}`, regresion);
        
        // Calcular velocidad desde la línea de tendencia de desarrollo
        const lineaTendenciaDominio = lineasTendenciaPorDominio[dominio.id];
        const datosVelDominio = lineaTendenciaDominio.map((punto, idx) => {
          if (idx === 0) {
            return {
              edad_cronologica: punto.edad_cronologica,
              [`velocidad_dominio_${dominio.id}`]: null
            };
          }
          
          const puntoAnterior = lineaTendenciaDominio[idx - 1];
          const deltaDesarrollo = punto[`dominio_${dominio.id}`] - puntoAnterior[`dominio_${dominio.id}`];
          const deltaEdadCronologica = punto.edad_cronologica - puntoAnterior.edad_cronologica;
          const velocidad = deltaEdadCronologica !== 0 ? deltaDesarrollo / deltaEdadCronologica : null;
          
          return {
            edad_cronologica: punto.edad_cronologica,
            [`velocidad_dominio_${dominio.id}`]: velocidad
          };
        });
        
        // Hacer regresión de la velocidad
        const datosVelDominioValidos = datosVelDominio.filter(d => d[`velocidad_dominio_${dominio.id}`] != null);
        if (datosVelDominioValidos.length >= 2) {
          const regresionVel = calcularRegresionPolinomial(datosVelDominioValidos, 'edad_cronologica', `velocidad_dominio_${dominio.id}`);
          if (regresionVel) {
            regresionesVelocidadPorDominio[dominio.id] = regresionVel;
            lineasTendenciaVelocidadPorDominio[dominio.id] = generarLineaTendenciaSuave(datosVelDominioValidos, 'edad_cronologica', `velocidad_dominio_${dominio.id}`, regresionVel);
            
            // Calcular aceleración del dominio desde la línea de tendencia de velocidad (sin regresión)
            const lineaVelDominio = lineasTendenciaVelocidadPorDominio[dominio.id];
            const aceleracionDominio = lineaVelDominio.map((punto, idx) => {
              if (idx === 0) return null;
              const puntoAnterior = lineaVelDominio[idx - 1];
              const deltaVel = punto[`velocidad_dominio_${dominio.id}`] - puntoAnterior[`velocidad_dominio_${dominio.id}`];
              const deltaEdad = punto.edad_cronologica - puntoAnterior.edad_cronologica;
              return deltaEdad !== 0 ? deltaVel / deltaEdad : null;
            });
            
            // Agregar aceleración a datosAceleracion
            lineaVelDominio.forEach((punto, idx) => {
              const acel = aceleracionDominio[idx];
              const existingPoint = datosAceleracion.find(d => d.edad_cronologica === punto.edad_cronologica);
              if (existingPoint) {
                existingPoint[`aceleracion_dominio_${dominio.id}`] = acel;
              }
            });
          }
        }
      }
    }

    // Regresión de Z-score
    const datosZDominio = datosZScore.filter(d => d[`zscore_dominio_${dominio.id}`] != null);
    if (datosZDominio.length >= 2) {
      const regresionZ = calcularRegresionPolinomial(datosZDominio, 'edad_cronologica', `zscore_dominio_${dominio.id}`);
      if (regresionZ) {
        regresionesZScorePorDominio[dominio.id] = regresionZ;
        lineasTendenciaZScorePorDominio[dominio.id] = generarLineaTendenciaSuave(datosZDominio, 'edad_cronologica', `zscore_dominio_${dominio.id}`, regresionZ);
      }
    }
  });

  // Contar hitos descartados
  const hitosDescartados = analisis.hitos_conseguidos.filter(
    hito => hito.edad_conseguido_meses > edadActualMeses
  ).length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="custom-tooltip">
          <p className="label"><strong>Edad Cronológica: {data.edad_cronologica?.toFixed(1)} meses</strong></p>
          
          {payload.map((entry, index) => {
            if (entry.dataKey === 'edad_desarrollo_global') {
              return (
                <div key={index} style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
                  <p style={{ color: entry.color, fontWeight: 'bold' }}>
                    Edad de Desarrollo Global: {entry.value?.toFixed(1)} meses
                  </p>
                  <p style={{ fontSize: '0.9em', color: '#666' }}>
                    {interpretarDiferencia(entry.value - data.edad_cronologica)}
                  </p>
                </div>
              );
            } else if (entry.dataKey.startsWith('dominio_')) {
              const dominioId = entry.dataKey.split('_')[1];
              const hitosKey = `${entry.dataKey}_hitos`;
              const hitos = data[hitosKey];
              
              return (
                <div key={index} style={{ marginTop: '5px' }}>
                  <p style={{ color: entry.color, fontWeight: 'bold' }}>
                    {entry.name}: {entry.value?.toFixed(1)} meses
                  </p>
                  {hitos && hitos.length > 0 && (
                    <div style={{ fontSize: '0.85em', marginLeft: '10px' }}>
                      {hitos.map((hito, idx) => (
                        <p key={idx} style={{ margin: '2px 0' }}>
                          • {hito.nombre}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
          
          {data.hitos_detalle && data.hitos_detalle.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd', fontSize: '0.85em' }}>
              <p><strong>Hitos evaluados en este momento:</strong></p>
              {data.hitos_detalle.map((detalle, idx) => (
                <p key={idx} style={{ margin: '2px 0', marginLeft: '10px' }}>
                  • {detalle.dominio_nombre}: {detalle.cantidad} hito{detalle.cantidad > 1 ? 's' : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const interpretarDiferencia = (diferencia) => {
    const diff = Math.abs(diferencia);
    if (diferencia > 3) return `✅ Adelanto significativo (+${diferencia.toFixed(1)} meses)`;
    if (diferencia > 1) return `✅ Ligero adelanto (+${diferencia.toFixed(1)} meses)`;
    if (diferencia > -1) return `✅ Desarrollo típico`;
    if (diferencia > -3) return `⚠️ Ligero retraso (${diferencia.toFixed(1)} meses)`;
    return `⚠️ Retraso significativo (${diferencia.toFixed(1)} meses)`;
  };

  const interpretarVelocidad = (velocidad) => {
    if (velocidad === null) return 'Sin datos';
    if (velocidad > 1.2) return '🚀 Desarrollo acelerado';
    if (velocidad > 1.0) return '✅ Desarrollo típico a rápido';
    if (velocidad > 0.8) return '✅ Desarrollo típico';
    if (velocidad > 0.6) return '⚠️ Desarrollo lento';
    return '⚠️ Desarrollo muy lento';
  };

  const interpretarAceleracion = (aceleracion) => {
    if (aceleracion === null) return 'Sin datos';
    if (aceleracion > 0.1) return '📈 Acelerando (mejorando)';
    if (aceleracion > -0.1) return '➡️ Velocidad constante';
    return '📉 Desacelerando';
  };

  const interpretarZScore = (zscore) => {
    if (zscore === null) return 'Sin datos';
    if (zscore > 2) return '✅ Muy por encima del promedio (+2 SD)';
    if (zscore > 1) return '✅ Por encima del promedio (+1 SD)';
    if (zscore > -1) return '✅ Dentro del rango normal';
    if (zscore > -2) return '⚠️ Por debajo del promedio (-1 SD)';
    return '⚠️ Muy por debajo del promedio (-2 SD)';
  };

  // Custom tooltip para velocidad
  const VelocityTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label"><strong>Edad: {data.edad_cronologica?.toFixed(1)} meses</strong></p>
          <p style={{ color: payload[0].color }}>
            Velocidad: {data.velocidad?.toFixed(2) || 'N/A'}
          </p>
          {data.velocidad_porcentaje && (
            <p style={{ fontSize: '0.9em' }}>
              {data.velocidad_porcentaje.toFixed(0)}% del desarrollo esperado
            </p>
          )}
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            {interpretarVelocidad(data.velocidad)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip para aceleración
  const AccelerationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label"><strong>Edad: {data.edad_cronologica?.toFixed(1)} meses</strong></p>
          <p style={{ color: payload[0].color }}>
            Aceleración: {data.aceleracion?.toFixed(3) || 'N/A'}
          </p>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            {interpretarAceleracion(data.aceleracion)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip para Z-scores
  const ZScoreTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label"><strong>Edad: {data.edad_cronologica?.toFixed(1)} meses</strong></p>
          <p style={{ color: payload[0].color }}>
            Puntuación Z: {data.zscore?.toFixed(2) || 'N/A'}
          </p>
          {data.diferencia_meses !== undefined && (
            <p style={{ fontSize: '0.9em' }}>
              Diferencia: {data.diferencia_meses > 0 ? '+' : ''}{data.diferencia_meses.toFixed(1)} meses
            </p>
          )}
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            {interpretarZScore(data.zscore)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grafico-desarrollo">
      <h2>Gráfico de Edad de Desarrollo</h2>

      <div className="filtros">
        <div className="filtro-grupo">
          <label>Visualización:</label>
          <select 
            value={dominioSeleccionado} 
            onChange={(e) => setDominioSeleccionado(e.target.value)}
          >
            <option value="global">Edad de Desarrollo Global</option>
            <option value="todos">Todos los Dominios</option>
            {Object.entries(edadDesarrolloPorDominio).map(([id, stats]) => (
              <option key={id} value={id}>{stats.dominio_nombre}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Fuente Normativa:</label>
          <select 
            value={fuenteSeleccionada || ''} 
            onChange={(e) => setFuenteSeleccionada(Number(e.target.value))}
          >
            {fuentesNormativas.map(fuente => (
              <option key={fuente.id} value={fuente.id}>{fuente.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>
            <input 
              type="checkbox" 
              checked={mostrarLinea45}
              onChange={(e) => setMostrarLinea45(e.target.checked)}
            />
            {' '}Mostrar desarrollo típico (línea 45°)
          </label>
        </div>
      </div>

      {/* Referencia bibliográfica */}
      {fuenteSeleccionada && fuentesNormativas.length > 0 && (
        <div className="referencia-bibliografica">
          <h4>📚 Referencia Bibliográfica</h4>
          {(() => {
            const fuente = fuentesNormativas.find(f => f.id === fuenteSeleccionada);
            return fuente ? (
              <div>
                <p><strong>{fuente.nombre}</strong></p>
                <p className="referencia-texto">{fuente.referencia_bibliografica}</p>
                {fuente.descripcion && <p className="referencia-descripcion">{fuente.descripcion}</p>}
                {fuente.poblacion && <p className="referencia-poblacion"><em>Población: {fuente.poblacion}</em></p>}
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Advertencia sobre hitos descartados */}
      {hitosDescartados > 0 && (
        <div className="advertencia-hitos-descartados">
          <p>
            ⚠️ <strong>{hitosDescartados} hito{hitosDescartados > 1 ? 's' : ''}</strong> registrado{hitosDescartados > 1 ? 's' : ''} con edad superior a la edad actual del niño 
            ({hitosDescartados > 1 ? 'han' : 'ha'} sido excluido{hitosDescartados > 1 ? 's' : ''} del gráfico).
          </p>
          <p style={{ fontSize: '0.9em', marginTop: '0.5rem' }}>
            Estos hitos aparecerán en el gráfico cuando el niño alcance esa edad.
          </p>
        </div>
      )}

      <div className="resumen-estadistico">
        <div className="stat-card">
          <h3>Edad Cronológica</h3>
          <span className="big-number">{Math.round(edadActualMeses)}</span>
          <p>meses</p>
        </div>

        <div className="stat-card">
          <h3>Edad de Desarrollo Global</h3>
          <span className={`big-number ${!edadDesarrolloGlobalActual ? 'sin-datos' : 
            edadDesarrolloGlobalActual < edadActualMeses - 3 ? 'retraso' : 
            edadDesarrolloGlobalActual > edadActualMeses + 3 ? 'adelanto' : 'normal'}`}>
            {edadDesarrolloGlobalActual ? Math.round(edadDesarrolloGlobalActual * 10) / 10 : 'N/A'}
          </span>
          <p>{edadDesarrolloGlobalActual ? 'meses' : 'Sin datos'}</p>
        </div>

        <div className="stat-card">
          <h3>Diferencia</h3>
          <span className={`big-number ${!edadDesarrolloGlobalActual ? 'sin-datos' :
            edadDesarrolloGlobalActual - edadActualMeses < -3 ? 'retraso' :
            edadDesarrolloGlobalActual - edadActualMeses > 3 ? 'adelanto' : 'normal'}`}>
            {edadDesarrolloGlobalActual ? 
              (edadDesarrolloGlobalActual - edadActualMeses > 0 ? '+' : '') + 
              (edadDesarrolloGlobalActual - edadActualMeses).toFixed(1) : 'N/A'}
          </span>
          <p>{edadDesarrolloGlobalActual ? 'meses' : ''}</p>
        </div>

        <div className="stat-card">
          <h3>Puntuación Z</h3>
          <span className={`big-number ${zScoreActual === null ? 'sin-datos' :
            zScoreActual < -2 ? 'retraso' :
            zScoreActual > 2 ? 'adelanto' : 'normal'}`}>
            {zScoreActual !== null ? zScoreActual.toFixed(2) : 'N/A'}
          </span>
          <p>{zScoreActual !== null ? 'desviaciones estándar' : 'Sin datos'}</p>
        </div>
      </div>

      {/* Gráfico principal: Edad de Desarrollo vs Edad Cronológica */}
      {datosGrafico.length === 0 ? (
        <div className="chart-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>📊 No hay datos suficientes</h3>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '1.1em' }}>
            Para ver las gráficas de desarrollo, necesitas registrar al menos algunos hitos del niño en la pestaña "✅ Hitos del Desarrollo".
          </p>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Una vez que registres hitos conseguidos por el niño, las gráficas se generarán automáticamente mostrando:
          </p>
          <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '1rem', color: '#555' }}>
            <li>Edad de Desarrollo vs Edad Cronológica</li>
            <li>Velocidad de Desarrollo</li>
            <li>Aceleración de Desarrollo</li>
            <li>Puntuaciones Z</li>
          </ul>
        </div>
      ) : (
        <>
      <div className="chart-container">
        <h3>Edad de Desarrollo vs Edad Cronológica</h3>
        <p className="chart-description">
          Compara la edad de desarrollo (basada en hitos alcanzados) con la edad cronológica del niño. 
          La línea diagonal representa desarrollo típico (edad de desarrollo = edad cronológica).
        </p>
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart 
            data={datosGrafico} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="edad_cronologica" 
              label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
              domain={[0, 'dataMax + 6']}
              type="number"
            />
            <YAxis 
              label={{ value: 'Edad de Desarrollo (meses)', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax + 6']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Línea de desarrollo típico (45 grados) */}
            {mostrarLinea45 && (
              <Line 
                data={lineaDesarrolloTipico}
                type="natural" 
                dataKey="edad_desarrollo"
                stroke="#95a5a6"
                strokeWidth={2}
                
                dot={false}
                name="Desarrollo típico"
                connectNulls
              />
            )}
            
            {/* Línea vertical para edad actual del niño */}
            <ReferenceLine 
              x={Math.round(edadActualMeses * 10) / 10} 
              stroke="#e74c3c" 
              strokeWidth={3}
              
              label={{ 
                value: `Edad actual: ${Math.round(edadActualMeses)} m`, 
                position: 'top',
                fill: '#e74c3c',
                fontWeight: 'bold'
              }}
            />
            
            {/* Puntos y líneas de tendencia por dominio (modo "todos") */}
            {dominioSeleccionado === 'todos' && dominios.map(dominio => (
              <React.Fragment key={`dominio_${dominio.id}`}>
                {/* Línea con puntos para datos reales */}
                <Line
                  data={datosGrafico}
                  type="monotone"
                  dataKey={`dominio_${dominio.id}`}
                  stroke="none"
                  dot={{ fill: coloresDominios[dominio.id], r: 5, strokeWidth: 2, stroke: '#fff' }}
                  name={`${dominio.nombre} (datos)`}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                {/* Línea de tendencia sin puntos */}
                {lineasTendenciaPorDominio[dominio.id] && lineasTendenciaPorDominio[dominio.id].length > 0 && (
                  <Line 
                    data={lineasTendenciaPorDominio[dominio.id]}
                    type="natural" 
                    dataKey={`dominio_${dominio.id}`}
                    stroke={coloresDominios[dominio.id]}
                    strokeWidth={2.5}
                    dot={false}
                    name={`${dominio.nombre} (tendencia)`}
                    
                    isAnimationActive={false}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Puntos + línea de tendencia de edad de desarrollo global */}
            {dominioSeleccionado === 'global' && (
              <>
                {/* Línea con puntos para datos reales */}
                <Line
                  data={datosGrafico}
                  type="monotone"
                  dataKey="edad_desarrollo_global"
                  stroke="none"
                  dot={{ fill: '#2c3e50', r: 6, strokeWidth: 2, stroke: '#fff' }}
                  name="Desarrollo Global (datos)"
                  connectNulls={false}
                  isAnimationActive={false}
                />
                {/* Línea de tendencia principal */}
                {lineaTendenciaDesarrollo.length > 0 && (
                  <Line 
                    data={lineaTendenciaDesarrollo}
                    type="natural" 
                    dataKey="edad_desarrollo_global"
                    stroke="#e74c3c"
                    strokeWidth={2.5}
                    dot={false}
                    name="Tendencia Global"
                    isAnimationActive={false}
                  />
                )}
              </>
            )}

            {/* Puntos + tendencia de dominio específico seleccionado */}
            {dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos' && (
              <>
                {/* Línea con puntos para datos reales */}
                <Line
                  data={datosGrafico}
                  type="monotone"
                  dataKey={`dominio_${dominioSeleccionado}`}
                  stroke="none"
                  dot={{ fill: coloresDominios[dominioSeleccionado], r: 6, strokeWidth: 2, stroke: '#fff' }}
                  name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre} (datos)`}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                {/* Línea de tendencia sin puntos */}
                {lineasTendenciaPorDominio[dominioSeleccionado] && lineasTendenciaPorDominio[dominioSeleccionado].length > 0 && (
                  <Line 
                    data={lineasTendenciaPorDominio[dominioSeleccionado]}
                    type="natural" 
                    dataKey={`dominio_${dominioSeleccionado}`}
                    stroke={coloresDominios[dominioSeleccionado]}
                    strokeWidth={3}
                    dot={false}
                    name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre} (tendencia)`}
                    
                    isAnimationActive={false}
                  />
                )}
              </>
            )}

            {/* Mostrar red flags */}
            {redFlags.map((rf, idx) => (
              <ReferenceLine 
                key={idx}
                x={rf.edad_observada_meses} 
                stroke="red" 
                strokeWidth={2}
                label={{ value: '🚩', position: 'top' }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="chart-note" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
            💡 <strong>Interpretación:</strong> Los puntos representan hitos evaluados. La línea de tendencia (punteada roja) muestra la dirección general del desarrollo. 
            Si los puntos/tendencia están <strong>sobre</strong> la línea diagonal (45°), el desarrollo es más avanzado que la edad cronológica. 
            Si están <strong>debajo</strong>, indica un desarrollo más lento.
          </p>
        </div>
      </div>

      {/* Contenedor para Velocidad y Aceleración lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Gráfico de Velocidad de Desarrollo */}
        <div className="chart-container" style={{ marginBottom: 0 }}>
          <h3>Velocidad de Desarrollo</h3>
          <p className="chart-description" style={{ fontSize: '0.85em' }}>
            Tasa de cambio del desarrollo. 1.0 = típico, &gt;1.0 = acelerado, &lt;1.0 = lento.
          </p>
          <ResponsiveContainer width="100%" height={300}>
          <ComposedChart 
            data={datosVelocidad} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="edad_cronologica" 
              label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
              type="number"
            />
            <YAxis 
              label={{ value: 'Velocidad de Desarrollo', angle: -90, position: 'insideLeft' }}
              domain={[0, 'auto']}
            />
            <Tooltip content={<VelocityTooltip />} />
            <Legend />
            
            {/* Línea de referencia en 1.0 (desarrollo típico) */}
            <ReferenceLine 
              y={1.0} 
              stroke="#95a5a6" 
              strokeWidth={2}
              
              label={{ value: 'Desarrollo típico (1.0)', position: 'right' }}
            />
            
            {/* Líneas de referencia adicionales */}
            <ReferenceLine y={0.8} stroke="#f39c12" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={1.2} stroke="#27ae60" strokeDasharray="3 3" opacity={0.5} />
            
            {/* Velocidad global */}
            {dominioSeleccionado === 'global' && (
              <>
                {lineaTendenciaVelocidad.length > 0 && (
                  <Line 
                    data={lineaTendenciaVelocidad}
                    type="natural" 
                    dataKey="velocidad"
                    stroke="#c0392b"
                    strokeWidth={2.5}
                    dot={false}
                    name="Tendencia Velocidad Global"
                    isAnimationActive={false}
                  />
                )}
              </>
            )}

            {/* Velocidad por todos los dominios */}
            {dominioSeleccionado === 'todos' && dominios.map(dominio => (
              <React.Fragment key={`vel_dominio_${dominio.id}`}>
                {lineasTendenciaVelocidadPorDominio[dominio.id] && (
                  <Line 
                    data={lineasTendenciaVelocidadPorDominio[dominio.id]}
                    type="natural" 
                    dataKey={`velocidad_dominio_${dominio.id}`}
                    stroke={coloresDominios[dominio.id]}
                    strokeWidth={2}
                    dot={false}
                    name={`${dominio.nombre} (tendencia)`}
                    
                    isAnimationActive={false}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Velocidad de dominio específico */}
            {dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos' && (
              <>
                {lineasTendenciaVelocidadPorDominio[dominioSeleccionado] && (
                  <Line 
                    data={lineasTendenciaVelocidadPorDominio[dominioSeleccionado]}
                    type="natural" 
                    dataKey={`velocidad_dominio_${dominioSeleccionado}`}
                    stroke={coloresDominios[dominioSeleccionado]}
                    strokeWidth={3}
                    dot={false}
                    name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre} (tendencia)`}
                    
                  />
                )}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        </div>

        {/* Gráfico de Aceleración de Desarrollo */}
        <div className="chart-container" style={{ marginBottom: 0 }}>
          <h3>Aceleración de Desarrollo</h3>
          <p className="chart-description" style={{ fontSize: '0.85em' }}>
            Cambios en la velocidad. Valores positivos = acelerando, negativos = desacelerando.
          </p>
          <ResponsiveContainer width="100%" height={300}>
          <ComposedChart 
            data={datosAceleracion} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="edad_cronologica" 
              label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
              type="number"
            />
            <YAxis 
              label={{ value: 'Aceleración de Desarrollo', angle: -90, position: 'insideLeft' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<AccelerationTooltip />} />
            <Legend />
            
            {/* Línea de referencia en 0 (velocidad constante) */}
            <ReferenceLine 
              y={0} 
              stroke="#95a5a6" 
              strokeWidth={2}
              label={{ value: 'Sin cambio en velocidad', position: 'right' }}
            />
            
            {/* Aceleración global */}
            {dominioSeleccionado === 'global' && (
              <>
                {datosAceleracion.length > 0 && (
                  <Line 
                    data={datosAceleracion}
                    type="monotone" 
                    dataKey="aceleracion"
                    stroke="#8e44ad"
                    strokeWidth={2.5}
                    dot={false}
                    name="Aceleración Global"
                    isAnimationActive={false}
                    connectNulls={false}
                  />
                )}
              </>
            )}

            {/* Aceleración por todos los dominios */}
            {dominioSeleccionado === 'todos' && dominios.map(dominio => (
              <React.Fragment key={`acel_dominio_${dominio.id}`}>
                <Line 
                  data={datosAceleracion}
                  type="monotone" 
                  dataKey={`aceleracion_dominio_${dominio.id}`}
                  stroke={coloresDominios[dominio.id]}
                  strokeWidth={2}
                  dot={false}
                  name={`${dominio.nombre}`}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              </React.Fragment>
            ))}

            {/* Aceleración de dominio específico */}
            {dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos' && (
              <Line 
                data={datosAceleracion}
                type="monotone" 
                dataKey={`aceleracion_dominio_${dominioSeleccionado}`}
                stroke={coloresDominios[dominioSeleccionado]}
                strokeWidth={3}
                dot={false}
                name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre}`}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Notas interpretativas para Velocidad y Aceleración */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="chart-note" style={{ padding: '1rem', background: '#fff3e0', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.85em', color: '#666' }}>
            💡 <strong>Velocidad:</strong> Mide qué tan rápido progresa el desarrollo. 
            1.0 = típico, &gt;1.0 = acelerado, &lt;1.0 = lento.
          </p>
        </div>
        <div className="chart-note" style={{ padding: '1rem', background: '#f3e5f5', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.85em', color: '#666' }}>
            💡 <strong>Aceleración:</strong> Indica si el ritmo cambia. 
            Positivo = progresando más rápido, negativo = ralentizando.
          </p>
        </div>
      </div>

      {/* Gráfico de Puntuaciones Z */}
      <div className="chart-container">
        <h3>Puntuaciones Z (Desviaciones Estándar)</h3>
        <p className="chart-description">
          Puntuación Z normalizada que indica cuántas desviaciones estándar se encuentra 
          el desarrollo del niño respecto al desarrollo esperado para su edad.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart 
            data={datosZScore} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="edad_cronologica" 
              label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
              type="number"
            />
            <YAxis 
              label={{ value: 'Puntuación Z', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<ZScoreTooltip />} />
            <Legend />
            
            {/* Bandas de referencia */}
            <ReferenceLine y={0} stroke="#27ae60" strokeWidth={2} label={{ value: 'Media (0)', position: 'right' }} />
            <ReferenceLine y={1} stroke="#f39c12"  label={{ value: '+1 SD', position: 'right' }} />
            <ReferenceLine y={-1} stroke="#f39c12"  label={{ value: '-1 SD', position: 'right' }} />
            <ReferenceLine y={2} stroke="#e74c3c" strokeDasharray="3 3" label={{ value: '+2 SD', position: 'right' }} />
            <ReferenceLine y={-2} stroke="#e74c3c" strokeDasharray="3 3" label={{ value: '-2 SD', position: 'right' }} />
            
            {/* Z-Score global */}
            {dominioSeleccionado === 'global' && (
              <>
                <Line
                  data={datosZScore}
                  type="monotone"
                  dataKey="zscore"
                  stroke="none"
                  dot={{ fill: '#3498db', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  name="Z-Score Global (datos)"
                  connectNulls={false}
                  isAnimationActive={false}
                />
                {lineaTendenciaZScore.length > 0 && (
                  <Line 
                    data={lineaTendenciaZScore}
                    type="natural" 
                    dataKey="zscore"
                    stroke="#2980b9"
                    strokeWidth={3}
                    dot={false}
                    name="Tendencia Z-Score Global"
                    isAnimationActive={false}
                  />
                )}
              </>
            )}

            {/* Z-Score por todos los dominios */}
            {dominioSeleccionado === 'todos' && dominios.map(dominio => (
              <React.Fragment key={`z_dominio_${dominio.id}`}>
                <Line
                  data={datosZScore}
                  type="monotone"
                  dataKey={`zscore_dominio_${dominio.id}`}
                  stroke="none"
                  dot={{ fill: coloresDominios[dominio.id], r: 4, strokeWidth: 2, stroke: '#fff' }}
                  name={`${dominio.nombre} (datos)`}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                {lineasTendenciaZScorePorDominio[dominio.id] && (
                  <Line 
                    data={lineasTendenciaZScorePorDominio[dominio.id]}
                    type="natural" 
                    dataKey={`zscore_dominio_${dominio.id}`}
                    stroke={coloresDominios[dominio.id]}
                    strokeWidth={2}
                    dot={false}
                    name={`${dominio.nombre} (tendencia)`}
                    isAnimationActive={false}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Z-Score de dominio específico */}
            {dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos' && (
              <>
                <Line
                  data={datosZScore}
                  type="monotone"
                  dataKey={`zscore_dominio_${dominioSeleccionado}`}
                  stroke="none"
                  dot={{ fill: coloresDominios[dominioSeleccionado], r: 5, strokeWidth: 2, stroke: '#fff' }}
                  name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre} (datos)`}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                {lineasTendenciaZScorePorDominio[dominioSeleccionado] && (
                  <Line 
                    data={lineasTendenciaZScorePorDominio[dominioSeleccionado]}
                    type="natural" 
                    dataKey={`zscore_dominio_${dominioSeleccionado}`}
                    stroke={coloresDominios[dominioSeleccionado]}
                    strokeWidth={3}
                    dot={false}
                    name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre} (tendencia)`}
                    isAnimationActive={false}
                  />
                )}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="chart-note" style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
            💡 <strong>Interpretación:</strong> La puntuación Z muestra la posición relativa del desarrollo. 
            Z = 0 es el promedio, Z entre -1 y +1 es normal (68% de la población), 
            Z entre -2 y +2 incluye el 95% de la población. Valores fuera de este rango requieren atención.
          </p>
        </div>
      </div>

      {/* Estadísticas por dominio con Edad de Desarrollo */}
      <div className="dominios-stats">
        <h3>Edad de Desarrollo por Dominio</h3>
        <div className="dominios-grid">
          {Object.entries(edadDesarrolloPorDominio).map(([id, stats]) => {
            const diferencia = stats.edad_desarrollo_promedio - edadActualMeses;
            return (
              <div key={id} className="dominio-stat-card">
                <h4>{stats.dominio_nombre}</h4>
                <div className="dominio-metrics">
                  <div className="metric">
                    <span className="metric-label">Edad de Desarrollo:</span>
                    <span className={`metric-value ${diferencia < -3 ? 'retraso' : diferencia > 3 ? 'adelanto' : 'normal'}`}>
                      {stats.edad_desarrollo_promedio.toFixed(1)} meses
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Diferencia:</span>
                    <span className={`metric-value ${diferencia < -3 ? 'retraso' : diferencia > 3 ? 'adelanto' : 'normal'}`}>
                      {diferencia > 0 ? '+' : ''}{diferencia.toFixed(1)} meses
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Hitos evaluados:</span>
                    <span className="metric-value">{stats.total_hitos}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Estado:</span>
                    <span className="metric-value">
                      {interpretarDiferencia(diferencia)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="red-flags-summary">
          <h3>🚩 Señales de Alarma Detectadas</h3>
          <div className="red-flags-list">
            {redFlags.map(rf => (
              <div key={rf.id} className="red-flag-item">
                <h4>{rf.flag_nombre}</h4>
                <p>{rf.flag_descripcion}</p>
                <p>Observada a los {rf.edad_observada_meses} meses</p>
                {rf.notas && <p className="notas">Notas: {rf.notas}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default GraficoDesarrollo;
