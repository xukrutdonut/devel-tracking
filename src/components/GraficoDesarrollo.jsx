import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ZAxis, ComposedChart, Area } from 'recharts';
import { calcularEdadCorregidaMeses } from '../utils/ageCalculations';
import { API_URL } from '../config';
import { fetchConAuth, esModoInvitado } from '../utils/authService';
import GeneradorInforme from './GeneradorInforme';
import AnalisisAceleracion from './AnalisisAceleracion';

/**
 * Componente de Gráfico del Desarrollo
 * 
 * REFERENCIAS CIENTÍFICAS:
 * - Thomas et al. (2009). J Speech Lang Hear Res, 52(2):336-58.
 *   Visualización de trayectorias longitudinales del desarrollo
 * 
 * - Tervo (2006). Clinical Pediatrics, 45(6):509-17.
 *   Patrones diagnósticos basados en asincronías entre dominios
 * 
 * - Sices (2007). J Dev Behav Pediatr, 28(1):47-52.
 *   Uso de Z-scores y bandas de confianza en lugar de medias simples
 * 
 * - Lajiness-O'Neill et al. (2018). Infant Behav Dev, 50:224-37.
 *   Sistema de vigilancia continua tipo PediaTrac con múltiples fuentes normativas
 */
function GraficoDesarrollo({ ninoId, onDatosRegresionCalculados }) {
  const [analisis, setAnalisis] = useState(null);
  const [redFlags, setRedFlags] = useState([]);
  const [dominioSeleccionado, setDominioSeleccionado] = useState('global');
  const [fuentesNormativas, setFuentesNormativas] = useState([]);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [mostrarLinea45, setMostrarLinea45] = useState(true);
  const [mostrarGeneradorInforme, setMostrarGeneradorInforme] = useState(false);
  const [ninoData, setNinoData] = useState(null);
  const [tooltipActivo, setTooltipActivo] = useState(null); // Tooltip activado por click
  
  // Ref para guardar datos de regresión calculados
  const datosRegresionRef = useRef(null);

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
      const response = await fetchConAuth(`${API_URL}/fuentes-normativas`);
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
      // En modo invitado, verificar si hay datos en sessionStorage
      if (esModoInvitado() && ninoId.startsWith('invitado_')) {
        const hitosKey = `invitado_hitos_${ninoId}`;
        const hitosGuardados = sessionStorage.getItem(hitosKey);
        
        if (hitosGuardados) {
          const hitos = JSON.parse(hitosGuardados);
          
          // Obtener datos del niño
          const ninosGuardados = sessionStorage.getItem('invitado_ninos');
          const ninos = ninosGuardados ? JSON.parse(ninosGuardados) : [];
          const ninoData = ninos.find(n => n.id === ninoId);
          
          if (ninoData) {
            // Cargar hitos normativos para calcular análisis
            const hitosNormativosRes = await fetch(`${API_URL}/hitos-normativos?fuente=${fuenteSeleccionada || 1}`);
            const hitosNormativos = await hitosNormativosRes.json();
            
            // Construir objeto de análisis similar al del servidor
            const analisisData = construirAnalisisLocal(ninoData, hitos, hitosNormativos);
            
            setAnalisis(analisisData);
            setRedFlags([]);
            setNinoData(ninoData);
            return;
          }
        }
      }
      
      // Usuario autenticado o invitado sin datos: cargar desde API
      const fuenteParam = fuenteSeleccionada ? `?fuente=${fuenteSeleccionada}` : '';
      const [analisisRes, redFlagsRes, ninoRes] = await Promise.all([
        fetchConAuth(`${API_URL}/analisis/${ninoId}${fuenteParam}`),
        fetchConAuth(`${API_URL}/red-flags-observadas/${ninoId}`),
        fetchConAuth(`${API_URL}/ninos/${ninoId}`)
      ]);

      const analisisData = await analisisRes.json();
      const redFlagsData = await redFlagsRes.json();
      const ninoData = await ninoRes.json();

      setAnalisis(analisisData);
      setRedFlags(redFlagsData);
      setNinoData(ninoData);
    } catch (error) {
      console.error('Error al cargar análisis:', error);
    }
  };
  
  // Función auxiliar para construir análisis desde datos locales
  const construirAnalisisLocal = (nino, hitos, hitosNormativos) => {
    const edadActualMeses = calcularEdadCorregidaMeses(
      nino.fecha_nacimiento,
      nino.semanas_gestacion || 40
    );
    
    // Agrupar hitos por dominio
    const hitosPorDominio = {};
    hitos.forEach(hito => {
      if (!hitosPorDominio[hito.dominio_id]) {
        hitosPorDominio[hito.dominio_id] = [];
      }
      hitosPorDominio[hito.dominio_id].push(hito);
    });
    
    return {
      nino,
      edad_actual_meses: edadActualMeses,
      hitos_conseguidos: hitos,
      estadisticas_por_dominio: hitosPorDominio,
      total_hitos: hitos.length
    };
  };

  if (!analisis || !analisis.hitos_conseguidos) {
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

  // Función para manejar click en puntos
  const handlePuntoClick = (payload) => {
    if (!payload || !payload.hito_nombre) return;
    
    // Si ya está activo este punto, desactivar
    if (tooltipActivo && tooltipActivo.hito_id === payload.hito_id) {
      setTooltipActivo(null);
    } else {
      // Activar este punto
      setTooltipActivo(payload);
    }
  };

  // Función para renderizar puntos personalizados (marca pérdidas)
  const renderizarPuntoPersonalizado = (props) => {
    const { cx, cy, payload, fill } = props;
    // Solo renderizar si tiene datos de hito real
    if (!payload || !payload.hito_nombre) return null;
    
    const isActivo = tooltipActivo && tooltipActivo.hito_id === payload.hito_id;
    
    // Si el punto tiene pérdida, usar un símbolo diferente (cruz o X)
    if (payload.tiene_perdida) {
      return (
        <g 
          className="scatter-point" 
          onClick={() => handlePuntoClick(payload)}
          style={{ cursor: 'pointer' }}
        >
          {/* Círculo de resaltado cuando está activo */}
          <circle 
            cx={cx} 
            cy={cy} 
            r={10} 
            fill="none" 
            stroke="#000" 
            strokeWidth={isActivo ? 2 : 0} 
            style={{ pointerEvents: 'none' }} 
          />
          {/* Círculo rojo para pérdida */}
          <circle cx={cx} cy={cy} r={8} fill="#e74c3c" stroke="#fff" strokeWidth={2} />
          {/* X blanca dentro */}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" 
                fill="#fff" fontSize="12" fontWeight="bold" style={{ pointerEvents: 'none' }}>
            ×
          </text>
        </g>
      );
    }
    
    // Punto normal de adquisición - usar color con mejor contraste
    const colorPunto = fill === '#fff' || !fill ? '#2c3e50' : fill;
    return (
      <g 
        className="scatter-point" 
        onClick={() => handlePuntoClick(payload)}
        style={{ cursor: 'pointer' }}
      >
        {/* Círculo de resaltado cuando está activo */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={8} 
          fill="none" 
          stroke="#000" 
          strokeWidth={isActivo ? 2 : 0} 
          style={{ pointerEvents: 'none' }} 
        />
        {/* Punto visible */}
        <circle cx={cx} cy={cy} r={6} fill={colorPunto} stroke="#fff" strokeWidth={2} />
      </g>
    );
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
      edad_cronologica: hito.edad_conseguido_meses, // Edad cuando lo logró
      edad_perdido: hito.edad_perdido_meses // Edad cuando se perdió (si aplica)
    }));
  
  // Crear puntos para la gráfica: adquisiciones Y pérdidas
  const puntosParaGrafica = [];
  
  hitosConEdadDesarrollo.forEach(hito => {
    // Punto de adquisición: (edad_conseguido, edad_media_normativa)
    puntosParaGrafica.push({
      edad_cronologica: hito.edad_cronologica,
      edad_desarrollo: hito.edad_desarrollo,
      tipo: 'adquisicion',
      hito_id: hito.id,
      dominio_id: hito.dominio_id,
      dominio_nombre: hito.dominio_nombre,
      hito_nombre: hito.hito_nombre,
      tiene_perdida: false
    });
    
    // Si el hito se perdió, agregar punto de pérdida: (edad_perdido, edad_media_normativa)
    // Esto crea visualmente la "caída" en la gráfica
    if (hito.edad_perdido && hito.edad_perdido <= edadActualMeses) {
      puntosParaGrafica.push({
        edad_cronologica: hito.edad_perdido,
        edad_desarrollo: hito.edad_desarrollo, // MISMO valor Y que la adquisición
        tipo: 'perdida',
        hito_id: hito.id,
        dominio_id: hito.dominio_id,
        dominio_nombre: hito.dominio_nombre,
        hito_nombre: hito.hito_nombre,
        tiene_perdida: true
      });
    }
  });
  
  // Ordenar por edad cronológica
  puntosParaGrafica.sort((a, b) => a.edad_cronologica - b.edad_cronologica);

  // Filtrar puntos biológicamente plausibles:
  // Una vez que ocurre la primera pérdida, no se incluyen adquisiciones posteriores
  // (no es biológicamente plausible adquirir nuevos hitos durante regresión)
  const primeraEdadPerdida = puntosParaGrafica.find(p => p.tipo === 'perdida')?.edad_cronologica;
  const puntosPlausibles = primeraEdadPerdida
    ? puntosParaGrafica.filter(p => {
        // Incluir todas las adquisiciones antes de la primera pérdida
        if (p.tipo === 'adquisicion' && p.edad_cronologica < primeraEdadPerdida) return true;
        // Incluir todas las pérdidas
        if (p.tipo === 'perdida') return true;
        // Excluir adquisiciones posteriores a la primera pérdida
        return false;
      })
    : puntosParaGrafica; // Si no hay pérdidas, usar todos los puntos

  // Para la gráfica global y cálculos, usar solo puntos biológicamente plausibles
  const datosGraficoGlobal = puntosPlausibles;
  const datosParaTendencia = puntosPlausibles;
  
  // Agrupar puntos por edad cronológica para calcular promedios por dominio
  // (necesario para la vista por dominios)
  // USAR SOLO PUNTOS BIOLÓGICAMENTE PLAUSIBLES
  const hitosPorEdadCronologica = {};
  
  puntosPlausibles.forEach(punto => {
    const edad = punto.edad_cronologica;
    if (!hitosPorEdadCronologica[edad]) {
      hitosPorEdadCronologica[edad] = {
        edad_cronologica: edad,
        puntos_por_dominio: {},
        tiene_perdida: false
      };
    }
    
    if (!hitosPorEdadCronologica[edad].puntos_por_dominio[punto.dominio_id]) {
      hitosPorEdadCronologica[edad].puntos_por_dominio[punto.dominio_id] = [];
    }
    
    hitosPorEdadCronologica[edad].puntos_por_dominio[punto.dominio_id].push(punto);
    
    if (punto.tiene_perdida) {
      hitosPorEdadCronologica[edad].tiene_perdida = true;
    }
  });
  
  // Agregar punto inicial en (0, 0) si no existe
  if (!hitosPorEdadCronologica[0] && Object.keys(hitosPorEdadCronologica).length > 0) {
    hitosPorEdadCronologica[0] = {
      edad_cronologica: 0,
      puntos_por_dominio: {},
      tiene_perdida: false,
      edad_desarrollo_global: 0
    };
    dominios.forEach(d => {
      hitosPorEdadCronologica[0].puntos_por_dominio[d.id] = [];
      hitosPorEdadCronologica[0][`dominio_${d.id}`] = 0;
    });
  }

  // Calcular edad de desarrollo promedio para cada edad cronológica (para vistas por dominio)
  const datosGrafico = Object.values(hitosPorEdadCronologica).map(grupo => {
    const resultado = {
      edad_cronologica: grupo.edad_cronologica,
      tiene_perdida: grupo.tiene_perdida,
      hitos_detalle: []
    };
    
    let sumaEdadesDesarrollo = 0;
    let totalPuntos = 0;
    
    // Calcular edad de desarrollo por dominio
    Object.entries(grupo.puntos_por_dominio).forEach(([dominioId, puntos]) => {
      if (puntos.length > 0) {
        const edadesDesarrollo = puntos.map(p => p.edad_desarrollo);
        const promedioEdadDesarrollo = edadesDesarrollo.reduce((a, b) => a + b, 0) / edadesDesarrollo.length;
        
        resultado[`dominio_${dominioId}`] = promedioEdadDesarrollo;
        resultado[`dominio_${dominioId}_puntos`] = puntos;
        
        sumaEdadesDesarrollo += edadesDesarrollo.reduce((a, b) => a + b, 0);
        totalPuntos += edadesDesarrollo.length;
        
        resultado.hitos_detalle.push({
          dominio_id: dominioId,
          dominio_nombre: puntos[0].dominio_nombre,
          edad_desarrollo: promedioEdadDesarrollo,
          cantidad: puntos.length
        });
      }
    });
    
    // Edad de desarrollo global (promedio de todos los puntos en este momento)
    resultado.edad_desarrollo_global = totalPuntos > 0 ? sumaEdadesDesarrollo / totalPuntos : null;
    
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
  // IMPORTANTE: Solo usar puntos de ADQUISICIÓN, no de pérdida (no hay datos normativos para pérdidas)
  // Usaremos una desviación estándar estimada del 15% de la edad cronológica
  const datosZScore = datosGrafico
    .filter(punto => !punto.tiene_perdida) // Excluir puntos de pérdida
    .map(punto => {
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

  // Crear datos de Z-Score para hitos individuales (para tooltips en scatter plot)
  const datosZScoreIndividuales = datosGraficoGlobal
    .filter(punto => !punto.tiene_perdida)
    .map(punto => {
      const sd = Math.max(punto.edad_cronologica * 0.15, 2);
      const diferencia = punto.edad_desarrollo - punto.edad_cronologica;
      const zscore = diferencia / sd;
      
      return {
        ...punto,
        zscore: zscore,
        diferencia_meses: diferencia
      };
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
  // Para la tendencia global, usar datosParaTendencia que:
  // - Incluye todas las adquisiciones ANTES de la primera pérdida
  // - Incluye todas las pérdidas
  // - EXCLUYE adquisiciones después de pérdidas (no biológicamente plausible)
  const regresionDesarrollo = calcularRegresionPolinomial(datosParaTendencia, 'edad_cronologica', 'edad_desarrollo');
  const lineaTendenciaDesarrollo = regresionDesarrollo 
    ? generarLineaTendenciaSuave(datosParaTendencia, 'edad_cronologica', 'edad_desarrollo', regresionDesarrollo)
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
    const deltaDesarrollo = punto.edad_desarrollo - puntoAnterior.edad_desarrollo;
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

  // Enviar datos de regresión al padre (sin usar hooks adicionales)
  if (onDatosRegresionCalculados && regresionDesarrollo && lineaTendenciaDesarrollo) {
    const nuevosDatos = {
      regresion: regresionDesarrollo,
      lineaTendencia: lineaTendenciaDesarrollo,
      datosOriginales: datosParaTendencia,
      dominioSeleccionado: dominioSeleccionado,
      fuenteSeleccionada: fuenteSeleccionada
    };
    
    // Solo enviar si cambió (comparar con ref para evitar llamadas repetidas)
    const datosActualesStr = JSON.stringify(nuevosDatos);
    if (datosRegresionRef.current !== datosActualesStr) {
      datosRegresionRef.current = datosActualesStr;
      // Usar setTimeout para evitar actualizar estado durante render
      setTimeout(() => onDatosRegresionCalculados(nuevosDatos), 0);
    }
  }

  // Contar hitos descartados
  const hitosDescartados = analisis.hitos_conseguidos.filter(
    hito => hito.edad_conseguido_meses > edadActualMeses
  ).length;

  // Custom tooltip para los puntos del scatter plot
  const ScatterTooltip = ({ active, payload, coordinate }) => {
    if (!active || !payload || !payload.length || !coordinate) {
      return null;
    }

    // Filtrar solo los payloads que tienen hito_nombre (puntos reales, no líneas de tendencia)
    const puntosReales = payload.filter(p => p.payload && p.payload.hito_nombre);
    
    if (puntosReales.length === 0) {
      return null;
    }

    // Si hay múltiples puntos, buscar todos los puntos cercanos en la misma posición
    // Obtener la posición del hover
    const edadCronologica = puntosReales[0].payload.edad_cronologica;
    const edadDesarrollo = puntosReales[0].payload.edad_desarrollo;
    
    // Buscar todos los hitos en la misma posición (tolerancia de 0.5 meses)
    const tolerancia = 0.5;
    let hitosEnPosicion = datosGraficoGlobal.filter(punto => 
      punto.hito_nombre &&
      Math.abs(punto.edad_cronologica - edadCronologica) < tolerancia &&
      Math.abs(punto.edad_desarrollo - edadDesarrollo) < tolerancia
    );

    // Si estamos en vista de dominio específico, filtrar solo hitos de ese dominio
    if (dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos') {
      hitosEnPosicion = hitosEnPosicion.filter(punto => punto.dominio_id === parseInt(dominioSeleccionado));
    }

    // Organizar en grid (2 columnas)
    const columnas = 2;

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(hitosEnPosicion.length, columnas)}, 1fr)`,
        gap: '10px',
        maxWidth: '800px'
      }}>
        {hitosEnPosicion.map((punto, index) => {
          // Calcular Cociente de Desarrollo (CD)
          // CD = (Edad de Desarrollo / Edad Cronológica) × 100
          const cocienteDesarrollo = punto.edad_cronologica > 0 
            ? (punto.edad_desarrollo / punto.edad_cronologica) * 100 
            : null;
          
          // Calcular Z-score
          // Z = (Edad de Desarrollo - Edad Cronológica) / SD
          const sd = Math.max(punto.edad_cronologica * 0.15, 2);
          const zscore = (punto.edad_desarrollo - punto.edad_cronologica) / sd;
          
          return (
            <div key={index} className="custom-tooltip" style={{
              backgroundColor: 'white',
              padding: '10px 15px',
              border: '2px solid #333',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '280px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '1em', color: '#2c3e50' }}>
                {punto.hito_nombre}
              </p>
              <div style={{ fontSize: '0.9em', color: '#555' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Dominio:</strong> <span style={{ color: coloresDominios[punto.dominio_id], fontWeight: 'bold' }}>{punto.dominio_nombre}</span>
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Edad cronológica:</strong> {punto.edad_cronologica?.toFixed(1)} meses
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Edad de desarrollo:</strong> {punto.edad_desarrollo?.toFixed(1)} meses
                </p>
                {cocienteDesarrollo !== null && (
                  <p style={{ margin: '4px 0' }}>
                    <strong>Cociente de Desarrollo:</strong> {cocienteDesarrollo.toFixed(1)}
                  </p>
                )}
                <p style={{ margin: '4px 0' }}>
                  <strong>Puntuación Z:</strong> {zscore.toFixed(2)}
                </p>
                {punto.tiene_perdida && (
                  <p style={{ margin: '6px 0 0 0', color: '#e74c3c', fontWeight: 'bold' }}>
                    ⚠️ Hito perdido en regresión
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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

  // Custom tooltip para Z-scores con información de hitos individuales
  const ZScoreTooltip = ({ active, payload, coordinate }) => {
    if (!active || !payload || !payload.length || !coordinate) {
      return null;
    }

    // Filtrar solo los payloads que tienen hito_nombre (puntos reales, no líneas de tendencia)
    const puntosReales = payload.filter(p => p.payload && p.payload.hito_nombre);
    
    if (puntosReales.length === 0) {
      return null;
    }

    // Obtener la posición del hover
    const edadCronologica = puntosReales[0].payload.edad_cronologica;
    const zscore = puntosReales[0].payload.zscore;
    
    // Buscar todos los hitos en la misma posición (tolerancia)
    const tolerancia = 0.5;
    const toleranciaZ = 0.2;
    let hitosEnPosicion = datosZScoreIndividuales.filter(punto => 
      punto.hito_nombre &&
      Math.abs(punto.edad_cronologica - edadCronologica) < tolerancia &&
      Math.abs(punto.zscore - zscore) < toleranciaZ
    );

    // Si estamos en vista de dominio específico, filtrar solo hitos de ese dominio
    if (dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos') {
      hitosEnPosicion = hitosEnPosicion.filter(punto => punto.dominio_id === parseInt(dominioSeleccionado));
    }

    // Organizar en grid (2 columnas)
    const columnas = 2;

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(hitosEnPosicion.length, columnas)}, 1fr)`,
        gap: '10px',
        maxWidth: '800px'
      }}>
        {hitosEnPosicion.map((punto, index) => {
          // Calcular Cociente de Desarrollo (CD)
          const cocienteDesarrollo = punto.edad_cronologica > 0 
            ? (punto.edad_desarrollo / punto.edad_cronologica) * 100 
            : null;
          
          return (
            <div key={index} className="custom-tooltip" style={{
              backgroundColor: 'white',
              padding: '10px 15px',
              border: '2px solid #333',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '280px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '1em', color: '#2c3e50' }}>
                {punto.hito_nombre}
              </p>
              <div style={{ fontSize: '0.9em', color: '#555' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Dominio:</strong> <span style={{ color: coloresDominios[punto.dominio_id], fontWeight: 'bold' }}>{punto.dominio_nombre}</span>
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Edad cronológica:</strong> {punto.edad_cronologica?.toFixed(1)} meses
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Edad de desarrollo:</strong> {punto.edad_desarrollo?.toFixed(1)} meses
                </p>
                {cocienteDesarrollo !== null && (
                  <p style={{ margin: '4px 0' }}>
                    <strong>Cociente de Desarrollo:</strong> {cocienteDesarrollo.toFixed(1)}
                  </p>
                )}
                <p style={{ margin: '4px 0' }}>
                  <strong>Puntuación Z:</strong> {punto.zscore?.toFixed(2)}
                </p>
                <p style={{ 
                  margin: '6px 0 0 0', 
                  color: punto.zscore < -1 ? '#e74c3c' : punto.zscore > 1 ? '#27ae60' : '#666',
                  fontWeight: 'bold',
                  fontSize: '0.85em'
                }}>
                  {interpretarZScore(punto.zscore)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grafico-desarrollo">
      <div className="header-con-boton">
        <h2>Gráficas del Desarrollo</h2>
        <button 
          className="btn-generar-informe"
          onClick={() => setMostrarGeneradorInforme(true)}
          title="Generar informe para imprimir o copiar a historia clínica"
        >
          📄 Generar Informe
        </button>
      </div>

      {/* Selector de vista: Trayectoria o Matemático */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#E3F2FD', 
        borderRadius: '8px',
        borderLeft: '4px solid #2196F3'
      }}>
        <h2 style={{ margin: 0, color: '#1976D2', fontSize: '24px' }}>
          📈 Trayectorias del Desarrollo
        </h2>
        <p style={{ margin: '5px 0 0 0', color: '#555', fontSize: '14px' }}>
          Visualización longitudinal del progreso en cada dominio del desarrollo
        </p>
      </div>

      {/* Vista de Trayectorias */}
      <>

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
          <h3>Cociente de Desarrollo</h3>
          <span className={`big-number ${!edadDesarrolloGlobalActual ? 'sin-datos' :
            (edadDesarrolloGlobalActual / edadActualMeses) < 0.85 ? 'retraso' :
            (edadDesarrolloGlobalActual / edadActualMeses) > 1.15 ? 'adelanto' : 'normal'}`}>
            {edadDesarrolloGlobalActual ? 
              ((edadDesarrolloGlobalActual / edadActualMeses) * 100).toFixed(1) : 'N/A'}
          </span>
          <p>{edadDesarrolloGlobalActual ? '% (CD)' : ''}</p>
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
      {/* Modal de tooltip al hacer click */}
      {tooltipActivo && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={() => setTooltipActivo(null)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              maxWidth: '500px',
              width: '90%',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setTooltipActivo(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                lineHeight: 1,
                padding: '5px 10px'
              }}
            >
              ×
            </button>

            {/* Contenido del tooltip */}
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
              {tooltipActivo.hito_nombre}
            </h3>
            
            <div style={{ fontSize: '1em', color: '#555', lineHeight: '1.8' }}>
              <p style={{ margin: '8px 0' }}>
                <strong>Dominio:</strong>{' '}
                <span style={{ 
                  color: coloresDominios[tooltipActivo.dominio_id], 
                  fontWeight: 'bold' 
                }}>
                  {tooltipActivo.dominio_nombre}
                </span>
              </p>
              
              <p style={{ margin: '8px 0' }}>
                <strong>Edad cronológica:</strong> {tooltipActivo.edad_cronologica?.toFixed(1)} meses
              </p>
              
              <p style={{ margin: '8px 0' }}>
                <strong>Edad de desarrollo:</strong> {tooltipActivo.edad_desarrollo?.toFixed(1)} meses
              </p>
              
              <p style={{ margin: '8px 0' }}>
                <strong>Cociente de Desarrollo (CD):</strong>{' '}
                {tooltipActivo.edad_cronologica > 0 
                  ? ((tooltipActivo.edad_desarrollo / tooltipActivo.edad_cronologica) * 100).toFixed(1) + '%'
                  : 'N/A'}
              </p>
              
              <p style={{ margin: '8px 0' }}>
                <strong>Puntuación Z:</strong>{' '}
                {(() => {
                  const sd = Math.max(tooltipActivo.edad_cronologica * 0.15, 2);
                  const zscore = (tooltipActivo.edad_desarrollo - tooltipActivo.edad_cronologica) / sd;
                  return zscore.toFixed(2);
                })()}
              </p>
              
              {tooltipActivo.tiene_perdida && (
                <p style={{ 
                  margin: '15px 0 0 0', 
                  padding: '10px', 
                  backgroundColor: '#fee', 
                  border: '1px solid #fcc',
                  borderRadius: '4px',
                  color: '#c00', 
                  fontWeight: 'bold' 
                }}>
                  ⚠️ Hito perdido en regresión
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
            {/* Tooltip deshabilitado - usamos modal con click */}
            <Tooltip content={() => null} cursor={false} />
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
                activeDot={false}
                name="Desarrollo típico"
                connectNulls
                isAnimationActive={false}
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
            {dominioSeleccionado === 'todos' && (
              <>
                {/* Líneas de tendencia por dominio - PRIMERO (debajo de los puntos) */}
                {dominios.map(dominio => (
                  lineasTendenciaPorDominio[dominio.id] && lineasTendenciaPorDominio[dominio.id].length > 0 && (
                    <Line 
                      key={`tendencia_${dominio.id}`}
                      data={lineasTendenciaPorDominio[dominio.id]}
                      type="natural" 
                      dataKey={`dominio_${dominio.id}`}
                      stroke={coloresDominios[dominio.id]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={false}
                      name={`${dominio.nombre} (tendencia)`}
                      isAnimationActive={false}
                    />
                  )
                ))}
                {/* UN SOLO Scatter con todos los puntos de todos los dominios - DESPUÉS (encima de las líneas) */}
                <Scatter
                  data={datosGraficoGlobal}
                  dataKey="edad_desarrollo"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload || !payload.hito_nombre) return null;
                    const color = coloresDominios[payload.dominio_id] || '#2c3e50';
                    const isActivo = tooltipActivo && tooltipActivo.hito_id === payload.hito_id;
                    
                    if (payload.tiene_perdida) {
                      return (
                        <g 
                          className="scatter-point"
                          onClick={() => handlePuntoClick(payload)}
                          style={{ cursor: 'pointer' }}
                        >
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={10} 
                            fill="none" 
                            stroke="#000" 
                            strokeWidth={isActivo ? 2 : 0} 
                            style={{ pointerEvents: 'none' }} 
                          />
                          <circle cx={cx} cy={cy} r={8} fill="#e74c3c" stroke="#fff" strokeWidth={2} />
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" 
                                fill="#fff" fontSize="12" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                            ×
                          </text>
                        </g>
                      );
                    }
                    return (
                      <g 
                        className="scatter-point"
                        onClick={() => handlePuntoClick(payload)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={7} 
                          fill="none" 
                          stroke="#000" 
                          strokeWidth={isActivo ? 2 : 0} 
                          style={{ pointerEvents: 'none' }} 
                        />
                        <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
                      </g>
                    );
                  }}
                  name="Hitos por dominio"
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Puntos + línea de tendencia de edad de desarrollo global */}
            {dominioSeleccionado === 'global' && (
              <>
                {/* Línea de tendencia principal - PRIMERO (debajo) */}
                {lineaTendenciaDesarrollo.length > 0 && (
                  <Line 
                    data={lineaTendenciaDesarrollo}
                    type="natural" 
                    dataKey="edad_desarrollo"
                    stroke="#e74c3c"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={false}
                    name="Tendencia Global"
                    isAnimationActive={false}
                  />
                )}
                {/* Scatter para capturar tooltips de cada hito individual - DESPUÉS (encima) */}
                <Scatter
                  data={datosGraficoGlobal}
                  dataKey="edad_desarrollo"
                  fill="#e74c3c"
                  shape={renderizarPuntoPersonalizado}
                  name="Hitos individuales"
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Puntos + tendencia de dominio específico seleccionado */}
            {dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos' && (() => {
              const puntosDominioSeleccionado = datosGraficoGlobal.filter(p => p.dominio_id === parseInt(dominioSeleccionado));
              return (
                <>
                  {/* Línea de tendencia sin puntos - PRIMERO (debajo) */}
                  {lineasTendenciaPorDominio[dominioSeleccionado] && lineasTendenciaPorDominio[dominioSeleccionado].length > 0 && (
                    <Line 
                      data={lineasTendenciaPorDominio[dominioSeleccionado]}
                      type="natural" 
                      dataKey={`dominio_${dominioSeleccionado}`}
                      stroke={coloresDominios[dominioSeleccionado]}
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                      name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre} (tendencia)`}
                      isAnimationActive={false}
                    />
                  )}
                  {/* Scatter para hitos individuales del dominio - DESPUÉS (encima) */}
                  {puntosDominioSeleccionado.length > 0 && (
                    <Scatter
                      data={puntosDominioSeleccionado}
                      dataKey="edad_desarrollo"
                      fill={coloresDominios[dominioSeleccionado]}
                      shape={(props) => {
                        const { cx, cy, payload } = props;
                        if (!payload || !payload.hito_nombre) return null;
                        const isActivo = tooltipActivo && tooltipActivo.hito_id === payload.hito_id;
                        
                        if (payload.tiene_perdida) {
                          return (
                            <g 
                              className="scatter-point"
                              onClick={() => handlePuntoClick(payload)}
                              style={{ cursor: 'pointer' }}
                            >
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={10} 
                                fill="none" 
                                stroke="#000" 
                                strokeWidth={isActivo ? 2 : 0} 
                                style={{ pointerEvents: 'none' }} 
                              />
                              <circle cx={cx} cy={cy} r={8} fill="#e74c3c" stroke="#fff" strokeWidth={2} />
                              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" 
                                    fill="#fff" fontSize="12" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                                ×
                              </text>
                            </g>
                          );
                        }
                        return (
                          <g 
                            className="scatter-point"
                            onClick={() => handlePuntoClick(payload)}
                            style={{ cursor: 'pointer' }}
                          >
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={8} 
                              fill="none" 
                              stroke="#000" 
                              strokeWidth={isActivo ? 2 : 0} 
                              style={{ pointerEvents: 'none' }} 
                            />
                            <circle cx={cx} cy={cy} r={6} fill={coloresDominios[dominioSeleccionado]} stroke="#fff" strokeWidth={2} />
                          </g>
                        );
                      }}
                      name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre}`}
                      isAnimationActive={false}
                    />
                  )}
                </>
              );
            })()}

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
            💡 <strong>Interpretación:</strong> Los puntos representan hitos evaluados. La línea de tendencia (roja) muestra la dirección general del desarrollo. 
            Si los puntos/tendencia están <strong>sobre</strong> la línea diagonal (45°), el desarrollo es más avanzado que la edad cronológica. 
            Si están <strong>debajo</strong>, indica un desarrollo más lento.
          </p>
          {datosGraficoGlobal.some(d => d.tiene_perdida) && (
            <>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9em', color: '#e74c3c', fontWeight: 'bold' }}>
                ⚠️ <strong>Regresión detectada:</strong> Los puntos rojos con × indican momentos donde se perdieron hitos previamente adquiridos. 
                La línea de tendencia refleja la trayectoria descendente del desarrollo.
              </p>
              {primeraEdadPerdida && puntosParaGrafica.some(p => p.tipo === 'adquisicion' && p.edad_cronologica >= primeraEdadPerdida) && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85em', color: '#f39c12', fontStyle: 'italic' }}>
                  ℹ️ <strong>Nota clínica:</strong> Se detectaron {puntosParaGrafica.filter(p => p.tipo === 'adquisicion' && p.edad_cronologica >= primeraEdadPerdida).length} hito(s) 
                  registrado(s) después de la primera pérdida (edad {primeraEdadPerdida.toFixed(1)} meses). 
                  Estos puntos NO se muestran en la gráfica ni en los cálculos, ya que no es biológicamente plausible 
                  adquirir nuevos hitos durante una regresión activa del desarrollo. Si representan recuperación posterior, considere 
                  registrarlos en un período de seguimiento separado.
                </p>
              )}
            </>
          )}
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
            {/* Tooltip deshabilitado - usamos modal con click */}
            <Tooltip content={() => null} cursor={false} />
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
                {/* Línea de tendencia - PRIMERO (debajo) */}
                {lineaTendenciaZScore.length > 0 && (
                  <Line 
                    data={lineaTendenciaZScore}
                    type="natural" 
                    dataKey="zscore"
                    stroke="#2980b9"
                    strokeWidth={3}
                    dot={false}
                    activeDot={false}
                    name="Tendencia Z-Score Global"
                    isAnimationActive={false}
                  />
                )}
                {/* Scatter para hitos individuales con Z-Score - DESPUÉS (encima) */}
                <Scatter
                  data={datosZScoreIndividuales}
                  dataKey="zscore"
                  fill="#3498db"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload || !payload.hito_nombre) return null;
                    const isActivo = tooltipActivo && tooltipActivo.hito_id === payload.hito_id;
                    
                    return (
                      <g 
                        className="scatter-point"
                        onClick={() => handlePuntoClick(payload)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={7} 
                          fill="none" 
                          stroke="#000" 
                          strokeWidth={isActivo ? 2 : 0} 
                          style={{ pointerEvents: 'none' }} 
                        />
                        <circle cx={cx} cy={cy} r={5} fill="#3498db" stroke="#fff" strokeWidth={2} />
                      </g>
                    );
                  }}
                  name="Z-Score de hitos"
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Z-Score por todos los dominios */}
            {dominioSeleccionado === 'todos' && (
              <>
                {/* Líneas de tendencia por dominio - PRIMERO (debajo) */}
                {dominios.map(dominio => (
                  lineasTendenciaZScorePorDominio[dominio.id] && (
                    <Line 
                      key={`z_tendencia_${dominio.id}`}
                      data={lineasTendenciaZScorePorDominio[dominio.id]}
                      type="natural" 
                      dataKey={`zscore_dominio_${dominio.id}`}
                      stroke={coloresDominios[dominio.id]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                      name={`${dominio.nombre} (tendencia)`}
                      isAnimationActive={false}
                    />
                  )
                ))}
                {/* UN SOLO Scatter con todos los puntos de todos los dominios - DESPUÉS (encima) */}
                <Scatter
                  data={datosZScoreIndividuales}
                  dataKey="zscore"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload || !payload.hito_nombre) return null;
                    const color = coloresDominios[payload.dominio_id] || '#3498db';
                    const isActivo = tooltipActivo && tooltipActivo.hito_id === payload.hito_id;
                    
                    return (
                      <g 
                        className="scatter-point"
                        onClick={() => handlePuntoClick(payload)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={6} 
                          fill="none" 
                          stroke="#000" 
                          strokeWidth={isActivo ? 2 : 0} 
                          style={{ pointerEvents: 'none' }} 
                        />
                        <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
                      </g>
                    );
                  }}
                  name="Z-Score por dominio"
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Z-Score de dominio específico */}
            {dominioSeleccionado !== 'global' && dominioSeleccionado !== 'todos' && (() => {
              const puntosZScoreDominioSeleccionado = datosZScoreIndividuales.filter(p => p.dominio_id === parseInt(dominioSeleccionado));
              return (
                <>
                  {/* Línea de tendencia - PRIMERO (debajo) */}
                  {lineasTendenciaZScorePorDominio[dominioSeleccionado] && (
                    <Line 
                      data={lineasTendenciaZScorePorDominio[dominioSeleccionado]}
                      type="natural" 
                      dataKey={`zscore_dominio_${dominioSeleccionado}`}
                      stroke={coloresDominios[dominioSeleccionado]}
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                      name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre} (tendencia)`}
                      isAnimationActive={false}
                    />
                  )}
                  {/* Scatter para hitos individuales del dominio - DESPUÉS (encima) */}
                  {puntosZScoreDominioSeleccionado.length > 0 && (
                    <Scatter
                      data={puntosZScoreDominioSeleccionado}
                      dataKey="zscore"
                      fill={coloresDominios[dominioSeleccionado]}
                      shape={(props) => {
                        const { cx, cy, payload } = props;
                        if (!payload || !payload.hito_nombre) return null;
                        const isActivo = tooltipActivo && tooltipActivo.hito_id === payload.hito_id;
                        
                        return (
                          <g 
                            className="scatter-point"
                            onClick={() => handlePuntoClick(payload)}
                            style={{ cursor: 'pointer' }}
                          >
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={7} 
                              fill="none" 
                              stroke="#000" 
                              strokeWidth={isActivo ? 2 : 0} 
                              style={{ pointerEvents: 'none' }} 
                            />
                            <circle cx={cx} cy={cy} r={5} fill={coloresDominios[dominioSeleccionado]} stroke="#fff" strokeWidth={2} />
                          </g>
                        );
                      }}
                      name={`${edadDesarrolloPorDominio[dominioSeleccionado]?.dominio_nombre}`}
                      isAnimationActive={false}
                    />
                  )}
                </>
              );
            })()}
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

      {/* Modal de Generador de Informe */}
      {mostrarGeneradorInforme && ninoData && (
        <GeneradorInforme
          ninoId={ninoId}
          ninoData={ninoData}
          analisisData={analisis}
          redFlags={redFlags}
          onClose={() => setMostrarGeneradorInforme(false)}
        />
      )}
      </>

      {/* Sección de Análisis Matemático */}
      <div style={{ 
        marginTop: '40px',
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#FFF3E0', 
        borderRadius: '8px',
        borderLeft: '4px solid #FF9800'
      }}>
        <h2 style={{ margin: 0, color: '#F57C00', fontSize: '24px' }}>
          📐 Análisis Matemático: Velocidad y Aceleración
        </h2>
        <p style={{ margin: '5px 0 0 0', color: '#555', fontSize: '14px' }}>
          Análisis de derivadas para evaluar ritmo de cambio y dinámica del desarrollo
        </p>
      </div>

      <AnalisisAceleracion 
        ninoId={ninoId} 
        datosRegresionGraficoDesarrollo={datosRegresionRef.current}
      />
    </div>
  );
}

export default GraficoDesarrollo;
