import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { fetchConAuth, esModoInvitado } from '../utils/authService';
import { construirPuntosEvaluacion, interpretarTrayectoria, determinarTipoDatos } from '../utils/trayectoriasUtils';
import { API_URL } from '../config';

/**
 * Componente para análisis de aceleración del desarrollo (derivada 2ª)
 * 
 * REFERENCIAS CIENTÍFICAS:
 * - Deboeck et al. (2016). Applied Developmental Science, 19(4):217-31.
 *   "Using derivatives to articulate change theories"
 *   Implementa análisis de las 3 derivadas como herramientas conceptuales del cambio
 * 
 * - Thomas et al. (2009). J Speech Lang Hear Res, 52(2):336-58.
 *   "Using developmental trajectories to understand developmental disorders"
 *   Base teórica para interpretación de trayectorias
 * 
 * SOPORTA DOS TIPOS DE DATOS:
 * 1. LONGITUDINAL RETROSPECTIVO: Múltiples hitos con edades de logro
 * 2. PROSPECTIVO: Múltiples evaluaciones puntuales en el tiempo
 * 
 * Implementa análisis de:
 * - Posición (Derivada 0): Cociente de Desarrollo - "¿Dónde está?"
 * - Velocidad (Derivada 1ª): ΔCD/Δt - "¿Cómo cambia?"
 * - Aceleración (Derivada 2ª): Δ²CD/Δt² - "¿Cómo cambia el cambio?"
 */
export default function AnalisisAceleracion({ ninoId, datosRegresionGraficoDesarrollo }) {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(1);
  const [fuentes, setFuentes] = useState([]);
  const [dominioSeleccionado, setDominioSeleccionado] = useState('global');
  const [dominios, setDominios] = useState([]);
  const [tipoDatos, setTipoDatos] = useState('desconocido');
  const [nino, setNino] = useState(null);

  // Debug: Log cuando cambia el prop de regresión
  useEffect(() => {
    console.log('📊 [AnalisisAceleracion] Props recibidos:', {
      ninoId,
      datosRegresionExiste: !!datosRegresionGraficoDesarrollo,
      datosRegresion: datosRegresionGraficoDesarrollo
    });
  }, [ninoId, datosRegresionGraficoDesarrollo]);

  useEffect(() => {
    cargarFuentes();
    cargarDominios();
  }, []);

  useEffect(() => {
    if (ninoId) {
      cargarDatos();
    }
  }, [ninoId, fuenteSeleccionada, dominioSeleccionado]);

  const cargarFuentes = async () => {
    try {
      const response = await fetchConAuth(`${API_URL}/fuentes-normativas`);
      const data = await response.json();
      setFuentes(data);
    } catch (error) {
      console.error('Error cargando fuentes:', error);
    }
  };

  const cargarDominios = async () => {
    try {
      const response = await fetchConAuth(`${API_URL}/dominios`);
      const data = await response.json();
      setDominios(data);
    } catch (error) {
      console.error('Error cargando dominios:', error);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // En modo invitado, verificar si hay datos en sessionStorage
      if (esModoInvitado() && ninoId.startsWith('invitado_')) {
        console.log('📊 [AnalisisAceleracion] Modo invitado detectado, cargando desde sessionStorage');
        
        const hitosKey = `invitado_hitos_${ninoId}`;
        const hitosGuardados = sessionStorage.getItem(hitosKey);
        
        if (!hitosGuardados) {
          console.log('⚠️ [AnalisisAceleracion] No hay hitos guardados para este ejemplo');
          setDatos(null);
          setLoading(false);
          return;
        }
        
        const hitos = JSON.parse(hitosGuardados);
        console.log('📊 [AnalisisAceleracion] Hitos cargados de sessionStorage:', hitos?.length);
        
        // Obtener datos del niño
        const ninosGuardados = sessionStorage.getItem('invitado_ninos');
        const ninos = ninosGuardados ? JSON.parse(ninosGuardados) : [];
        const ninoData = ninos.find(n => n.id === ninoId);
        
        if (!ninoData) {
          console.log('⚠️ [AnalisisAceleracion] No se encontró el niño en sessionStorage');
          setDatos(null);
          setLoading(false);
          return;
        }
        
        console.log('📊 [AnalisisAceleracion] Datos del niño (sessionStorage):', ninoData);
        setNino(ninoData);
        
        // Construir análisis desde datos del sessionStorage
        await construirDatosRetrospectivosDesdeSessionStorage(ninoData, hitos);
        setLoading(false);
        return;
      }
      
      // Usuario autenticado: cargar desde servidor
      // Cargar datos del niño PRIMERO
      const ninoResponse = await fetchConAuth(`${API_URL}/ninos/${ninoId}`);
      const ninoData = await ninoResponse.json();
      console.log('📊 [AnalisisAceleracion] Datos del niño:', ninoData);
      setNino(ninoData);
      
      // Intentar cargar itinerario (datos prospectivos)
      let itinerario = null;
      try {
        const itinerarioResponse = await fetchConAuth(
          `${API_URL}/itinerario/${ninoId}?fuente=${fuenteSeleccionada}`
        );
        
        console.log('📊 [AnalisisAceleracion] Status itinerario:', itinerarioResponse.status);
        
        // Solo parsear como JSON si la respuesta es exitosa
        if (itinerarioResponse.ok) {
          itinerario = await itinerarioResponse.json();
          console.log('📊 [AnalisisAceleracion] Itinerario:', itinerario);
          console.log('📊 [AnalisisAceleracion] Evaluaciones:', itinerario?.evaluaciones?.length);
        }
      } catch (itinerarioError) {
        console.log('⚠️ [AnalisisAceleracion] Error cargando itinerario:', itinerarioError);
        // Endpoint no existe o error, continuar con datos retrospectivos
      }

      // Si hay datos prospectivos (múltiples evaluaciones), usarlos
      if (itinerario && itinerario.evaluaciones && itinerario.evaluaciones.length >= 2) {
        console.log('✅ [AnalisisAceleracion] Usando datos prospectivos');
        const datosCalculados = calcularAceleraciones(itinerario.evaluaciones);
        const tipo = determinarTipoDatos(itinerario.evaluaciones);
        
        setDatos({
          ...itinerario,
          datosAceleracion: datosCalculados
        });
        setTipoDatos('prospectivo');
        setLoading(false);
        return;
      }

      console.log('🔄 [AnalisisAceleracion] No hay datos prospectivos suficientes, usando retrospectivos');
      // Si no hay datos prospectivos, construir desde datos longitudinales (retrospectivos)
      // Pasar ninoData como parámetro en lugar de usar el estado
      await construirDatosRetrospectivos(ninoData);
      
    } catch (error) {
      console.error('❌ [AnalisisAceleracion] Error cargando datos:', error);
      setDatos(null);
    } finally {
      setLoading(false);
    }
  };

  const construirDatosRetrospectivos = async (ninoData) => {
    try {
      console.log('🔄 [AnalisisAceleracion] Construyendo datos retrospectivos para niño:', ninoData.id);
      
      // Cargar hitos conseguidos
      const hitosResponse = await fetchConAuth(`${API_URL}/hitos-conseguidos/${ninoId}`);
      const hitosConseguidos = await hitosResponse.json();
      console.log('📊 [AnalisisAceleracion] Hitos conseguidos:', hitosConseguidos?.length);
      
      if (!hitosConseguidos || hitosConseguidos.length < 2) {
        console.log('⚠️ [AnalisisAceleracion] Insuficientes hitos conseguidos:', hitosConseguidos?.length);
        setDatos(null);
        return;
      }

      // Cargar hitos normativos
      const normativosResponse = await fetchConAuth(`${API_URL}/hitos-normativos`);
      const hitosNormativos = await normativosResponse.json();
      
      // Filtrar por fuente
      const hitosNormativosFuente = hitosNormativos.filter(h => h.fuente_normativa_id === fuenteSeleccionada);
      console.log('📊 [AnalisisAceleracion] Hitos normativos filtrados:', hitosNormativosFuente?.length);
      
      // Cargar dominios si no están cargados aún
      let dominiosParaUsar = dominios;
      if (!dominiosParaUsar || dominiosParaUsar.length === 0) {
        const dominiosResponse = await fetchConAuth(`${API_URL}/dominios`);
        dominiosParaUsar = await dominiosResponse.json();
        setDominios(dominiosParaUsar);
      }
      
      // Calcular edad actual del niño usando ninoData pasado como parámetro
      const fechaNac = new Date(ninoData.fecha_nacimiento);
      const hoy = new Date();
      const diffTime = Math.abs(hoy - fechaNac);
      const edadActualMeses = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      console.log('📊 [AnalisisAceleracion] Edad actual:', edadActualMeses, 'meses');
      
      // Construir puntos de evaluación desde datos longitudinales
      const puntosEvaluacion = construirPuntosEvaluacion(
        hitosConseguidos,
        hitosNormativosFuente,
        dominiosParaUsar,
        edadActualMeses
      );
      
      console.log('📊 [AnalisisAceleracion] Puntos de evaluación construidos:', puntosEvaluacion?.length);
      
      if (puntosEvaluacion.length < 2) {
        console.log('⚠️ [AnalisisAceleracion] Insuficientes puntos de evaluación:', puntosEvaluacion.length);
        setDatos(null);
        return;
      }

      // Calcular métricas de trayectoria
      const datosCalculados = calcularAceleracionesDesdePuntos(puntosEvaluacion);
      console.log('📊 [AnalisisAceleracion] Datos calculados:', datosCalculados?.length);
      
      // Construir línea de tendencia para datos retrospectivos
      // (necesaria para gráficas de velocidad y aceleración)
      const lineaTendenciaRetrospectiva = construirLineaTendenciaRetrospectiva(puntosEvaluacion);
      console.log('📊 [AnalisisAceleracion] Línea de tendencia retrospectiva:', lineaTendenciaRetrospectiva?.length);
      
      setDatos({
        evaluaciones: puntosEvaluacion,
        datosAceleracion: datosCalculados,
        lineaTendencia: lineaTendenciaRetrospectiva // Agregar línea de tendencia
      });
      setTipoDatos('retrospectivo');
      console.log('✅ [AnalisisAceleracion] Datos retrospectivos cargados correctamente');
      
    } catch (error) {
      console.error('❌ [AnalisisAceleracion] Error construyendo datos retrospectivos:', error);
      setDatos(null);
    }
  };

  /**
   * Construye datos retrospectivos desde sessionStorage (modo invitado)
   */
  const construirDatosRetrospectivosDesdeSessionStorage = async (ninoData, hitosConseguidos) => {
    try {
      console.log('🔄 [AnalisisAceleracion] Construyendo datos retrospectivos desde sessionStorage');
      console.log('   - Hitos recibidos:', hitosConseguidos?.length);
      
      if (!hitosConseguidos || hitosConseguidos.length < 2) {
        console.log('⚠️ [AnalisisAceleracion] Insuficientes hitos conseguidos:', hitosConseguidos?.length);
        setDatos(null);
        return;
      }

      // Cargar hitos normativos (estos sí están en el servidor)
      const normativosResponse = await fetch(`${API_URL}/hitos-normativos?fuente=${fuenteSeleccionada || 1}`);
      const hitosNormativos = await normativosResponse.json();
      console.log('📊 [AnalisisAceleracion] Hitos normativos cargados:', hitosNormativos?.length);
      
      // Filtrar por fuente
      const hitosNormativosFuente = hitosNormativos.filter(h => h.fuente_normativa_id === (fuenteSeleccionada || 1));
      console.log('📊 [AnalisisAceleracion] Hitos normativos filtrados:', hitosNormativosFuente?.length);
      
      // Cargar dominios si no están cargados aún
      let dominiosParaUsar = dominios;
      if (!dominiosParaUsar || dominiosParaUsar.length === 0) {
        const dominiosResponse = await fetch(`${API_URL}/dominios`);
        dominiosParaUsar = await dominiosResponse.json();
        setDominios(dominiosParaUsar);
      }
      console.log('📊 [AnalisisAceleracion] Dominios cargados:', dominiosParaUsar?.length);
      
      // Calcular edad actual del niño
      const fechaNac = new Date(ninoData.fecha_nacimiento);
      const hoy = new Date();
      const diffTime = Math.abs(hoy - fechaNac);
      const edadActualMeses = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      console.log('📊 [AnalisisAceleracion] Edad actual:', edadActualMeses, 'meses');
      
      // Construir puntos de evaluación desde datos longitudinales
      const puntosEvaluacion = construirPuntosEvaluacion(
        hitosConseguidos,
        hitosNormativosFuente,
        dominiosParaUsar,
        edadActualMeses
      );
      
      console.log('📊 [AnalisisAceleracion] Puntos de evaluación construidos:', puntosEvaluacion?.length);
      
      if (puntosEvaluacion.length < 2) {
        console.log('⚠️ [AnalisisAceleracion] Insuficientes puntos de evaluación:', puntosEvaluacion.length);
        setDatos(null);
        return;
      }

      // Calcular métricas de trayectoria
      const datosCalculados = calcularAceleracionesDesdePuntos(puntosEvaluacion);
      console.log('📊 [AnalisisAceleracion] Datos calculados:', datosCalculados?.length);
      
      // Construir línea de tendencia para datos retrospectivos
      const lineaTendenciaRetrospectiva = construirLineaTendenciaRetrospectiva(puntosEvaluacion);
      console.log('📊 [AnalisisAceleracion] Línea de tendencia retrospectiva:', lineaTendenciaRetrospectiva?.length);
      
      setDatos({
        evaluaciones: puntosEvaluacion,
        datosAceleracion: datosCalculados,
        lineaTendencia: lineaTendenciaRetrospectiva
      });
      setTipoDatos('retrospectivo');
      console.log('✅ [AnalisisAceleracion] Datos retrospectivos cargados correctamente desde sessionStorage');
      
    } catch (error) {
      console.error('❌ [AnalisisAceleracion] Error construyendo datos retrospectivos desde sessionStorage:', error);
      setDatos(null);
    }
  };

  /**
   * Construye línea de tendencia desde puntos de evaluación retrospectivos
   * para usar en gráficas de velocidad y aceleración
   */
  const construirLineaTendenciaRetrospectiva = (puntosEvaluacion) => {
    if (!puntosEvaluacion || puntosEvaluacion.length < 2) return [];
    
    // Convertir puntos de evaluación a formato compatible con gráficas
    // Mapear edad_desarrollo desde CD global
    const lineaTendencia = puntosEvaluacion.map(punto => {
      let cd_valor;
      
      if (dominioSeleccionado === 'global') {
        cd_valor = punto.cd_global;
      } else {
        const dominio = punto.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
        cd_valor = dominio?.cd;
      }
      
      if (cd_valor === null || cd_valor === undefined) return null;
      
      // CD = (ED / EC) * 100
      // Por lo tanto: ED = (CD * EC) / 100
      const edad_desarrollo = (cd_valor * punto.edad_meses) / 100;
      
      return {
        edad_cronologica: punto.edad_meses,
        edad_desarrollo: edad_desarrollo
      };
    }).filter(p => p !== null);
    
    return lineaTendencia;
  };

  /**
   * Calcula aceleraciones desde puntos de evaluación ya construidos
   * (usada para datos retrospectivos)
   */
  const calcularAceleracionesDesdePuntos = (puntosEvaluacion) => {
    const datos = [];
    
    for (let i = 0; i < puntosEvaluacion.length; i++) {
      const punto_actual = puntosEvaluacion[i];
      let cd_actual;
      
      if (dominioSeleccionado === 'global') {
        cd_actual = punto_actual.cd_global;
      } else {
        const dominio = punto_actual.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
        cd_actual = dominio?.cd;
      }
      
      if (cd_actual === null || cd_actual === undefined) {
        continue;
      }

      const punto = {
        edad_meses: punto_actual.edad_meses,
        cd: cd_actual,
        velocidad: null,
        aceleracion: null,
        interpretacion: ''
      };

      // Calcular velocidad (derivada 1ª) si hay punto anterior
      if (i > 0) {
        const punto_anterior = puntosEvaluacion[i - 1];
        let cd_anterior;
        
        if (dominioSeleccionado === 'global') {
          cd_anterior = punto_anterior.cd_global;
        } else {
          const dominio = punto_anterior.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
          cd_anterior = dominio?.cd;
        }
        
        if (cd_anterior !== null && cd_anterior !== undefined) {
          const delta_tiempo = punto_actual.edad_meses - punto_anterior.edad_meses;
          const delta_cd = cd_actual - cd_anterior;
          
          if (delta_tiempo > 0) {
            punto.velocidad = delta_cd / delta_tiempo;
          }
        }
      }

      // Calcular aceleración (derivada 2ª) si hay dos puntos anteriores
      if (i > 1) {
        const punto_anterior1 = puntosEvaluacion[i - 1];
        const punto_anterior2 = puntosEvaluacion[i - 2];
        
        let cd_anterior1, cd_anterior2;
        
        if (dominioSeleccionado === 'global') {
          cd_anterior1 = punto_anterior1.cd_global;
          cd_anterior2 = punto_anterior2.cd_global;
        } else {
          const dominio1 = punto_anterior1.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
          const dominio2 = punto_anterior2.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
          cd_anterior1 = dominio1?.cd;
          cd_anterior2 = dominio2?.cd;
        }

        if (cd_anterior1 !== null && cd_anterior1 !== undefined && 
            cd_anterior2 !== null && cd_anterior2 !== undefined) {
          const delta_tiempo1 = punto_actual.edad_meses - punto_anterior1.edad_meses;
          const delta_tiempo2 = punto_anterior1.edad_meses - punto_anterior2.edad_meses;
          const delta_cd1 = cd_actual - cd_anterior1;
          const delta_cd2 = cd_anterior1 - cd_anterior2;

          if (delta_tiempo1 > 0 && delta_tiempo2 > 0) {
            const velocidad1 = delta_cd1 / delta_tiempo1;
            const velocidad2 = delta_cd2 / delta_tiempo2;
            const delta_tiempo_promedio = (delta_tiempo1 + delta_tiempo2) / 2;
            
            punto.aceleracion = (velocidad1 - velocidad2) / delta_tiempo_promedio;
          }
        }
      }

      // Interpretar según las tres derivadas
      punto.interpretacion = interpretarTrayectoria(punto.cd, punto.velocidad, punto.aceleracion);
      
      datos.push(punto);
    }

    return datos;
  };

  /**
   * Calcula las tres derivadas del desarrollo desde evaluaciones prospectivas
   * (múltiples evaluaciones puntuales en el tiempo)
   */
  const calcularAceleraciones = (evaluaciones) => {
    const datos = [];
    
    // Filtrar datos por dominio si no es global
    const getDominioCd = (evaluacion) => {
      if (dominioSeleccionado === 'global') {
        return evaluacion.cd_global || null;
      }
      const dominio = evaluacion.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
      return dominio?.cd || null;
    };

    for (let i = 0; i < evaluaciones.length; i++) {
      const eval_actual = evaluaciones[i];
      const cd_actual = getDominioCd(eval_actual);
      
      if (cd_actual === null) continue;

      const punto = {
        edad_meses: eval_actual.edad_meses,
        cd: cd_actual,
        velocidad: null,
        aceleracion: null,
        interpretacion: ''
      };

      // Calcular velocidad (derivada 1ª) si hay punto anterior
      if (i > 0) {
        const eval_anterior = evaluaciones[i - 1];
        const cd_anterior = getDominioCd(eval_anterior);
        
        if (cd_anterior !== null) {
          const delta_tiempo = eval_actual.edad_meses - eval_anterior.edad_meses;
          const delta_cd = cd_actual - cd_anterior;
          
          if (delta_tiempo > 0) {
            punto.velocidad = delta_cd / delta_tiempo;
          }
        }
      }

      // Calcular aceleración (derivada 2ª) si hay dos puntos anteriores
      if (i > 1) {
        const eval_anterior1 = evaluaciones[i - 1];
        const eval_anterior2 = evaluaciones[i - 2];
        const cd_anterior1 = getDominioCd(eval_anterior1);
        const cd_anterior2 = getDominioCd(eval_anterior2);

        if (cd_anterior1 !== null && cd_anterior2 !== null) {
          const delta_tiempo1 = eval_actual.edad_meses - eval_anterior1.edad_meses;
          const delta_tiempo2 = eval_anterior1.edad_meses - eval_anterior2.edad_meses;
          const delta_cd1 = cd_actual - cd_anterior1;
          const delta_cd2 = cd_anterior1 - cd_anterior2;

          if (delta_tiempo1 > 0 && delta_tiempo2 > 0) {
            const velocidad1 = delta_cd1 / delta_tiempo1;
            const velocidad2 = delta_cd2 / delta_tiempo2;
            const delta_tiempo_promedio = (delta_tiempo1 + delta_tiempo2) / 2;
            
            punto.aceleracion = (velocidad1 - velocidad2) / delta_tiempo_promedio;
          }
        }
      }

      // Interpretar según las tres derivadas
      punto.interpretacion = interpretarTrayectoria(punto.cd, punto.velocidad, punto.aceleracion);
      
      datos.push(punto);
    }

    return datos;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          border: '2px solid #2196F3',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            <i className="fas fa-calendar-alt"></i> Edad: {data.edad_meses} meses
          </p>
          <p style={{ color: '#2196F3', marginBottom: '4px' }}>
            <strong>Posición (0ª):</strong> CD = {data.cd?.toFixed(1)}%
          </p>
          {data.velocidad !== null && (
            <p style={{ color: '#4CAF50', marginBottom: '4px' }}>
              <strong>Velocidad (1ª):</strong> {data.velocidad?.toFixed(2)} puntos/mes
            </p>
          )}
          {data.aceleracion !== null && (
            <p style={{ color: '#FF9800', marginBottom: '8px' }}>
              <strong>Aceleración (2ª):</strong> {data.aceleracion?.toFixed(3)} puntos/mes²
            </p>
          )}
          <p style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid #ddd',
            fontSize: '13px',
            color: '#333'
          }}>
            {data.interpretacion}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>⏳ Cargando análisis de aceleración...</p>
      </div>
    );
  }

  if (!datos || !datos.datosAceleracion || datos.datosAceleracion.length < 2) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>📐 Análisis de Aceleración del Desarrollo</h3>
        <p style={{ color: '#666', marginTop: '10px' }}>
          ℹ️ Se necesitan al menos 2 evaluaciones para calcular velocidad y 3 para calcular aceleración.
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '10px' }}>
          Puedes usar este análisis con:
        </p>
        <ul style={{ color: '#999', fontSize: '14px', textAlign: 'left', maxWidth: '600px', margin: '10px auto' }}>
          <li><strong>Datos retrospectivos (longitudinales):</strong> Registra múltiples hitos con sus edades de logro</li>
          <li><strong>Datos prospectivos:</strong> Realiza múltiples evaluaciones en diferentes momentos</li>
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>📐 Análisis de Aceleración del Desarrollo</h2>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        Análisis basado en derivadas: Posición (0ª), Velocidad (1ª) y Aceleración (2ª)
      </p>
      
      {/* Indicador de tipo de datos */}
      <div style={{
        padding: '10px',
        marginBottom: '20px',
        backgroundColor: tipoDatos === 'retrospectivo' ? '#E8F5E9' : '#E3F2FD',
        border: `1px solid ${tipoDatos === 'retrospectivo' ? '#4CAF50' : '#2196F3'}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '20px' }}>
          <i className={`fas ${tipoDatos === 'retrospectivo' ? 'fa-book' : 'fa-chart-bar'}`}></i>
        </span>
        <span style={{ fontSize: '14px' }}>
          {tipoDatos === 'retrospectivo' && (
            <><strong>Datos longitudinales retrospectivos:</strong> Análisis basado en hitos con edades de logro registradas</>
          )}
          {tipoDatos === 'prospectivo' && (
            <><strong>Datos prospectivos:</strong> Análisis basado en múltiples evaluaciones en el tiempo</>
          )}
          {tipoDatos === 'desconocido' && (
            <><strong>Análisis de trayectoria:</strong> Evaluando patrones de desarrollo</>
          )}
        </span>
      </div>

      {/* Selectores */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Fuente Normativa:
          </label>
          <select
            value={fuenteSeleccionada}
            onChange={(e) => setFuenteSeleccionada(parseInt(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {fuentes.map(f => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Dominio:
          </label>
          <select
            value={dominioSeleccionado}
            onChange={(e) => setDominioSeleccionado(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="global">🌍 Global</option>
            {dominios.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Gráfico de Velocidad del Desarrollo (Derivada 1ª de la línea de tendencia) */}
      {(() => {
        // Calcular velocidad desde la línea de tendencia (derivada primera)
        console.log('🔍 [AnalisisAceleracion] Verificando datos de regresión:', {
          existeRegresion: !!datosRegresionGraficoDesarrollo,
          tieneLineaTendenciaRegresion: !!datosRegresionGraficoDesarrollo?.lineaTendencia,
          longitudLineaTendenciaRegresion: datosRegresionGraficoDesarrollo?.lineaTendencia?.length,
          tieneLineaTendenciaRetrospectiva: !!datos?.lineaTendencia,
          longitudLineaTendenciaRetrospectiva: datos?.lineaTendencia?.length,
          tipoDatos
        });
        
        // Usar línea de tendencia de regresión (GraficoDesarrollo) si está disponible,
        // o la línea de tendencia retrospectiva construida localmente
        const lineaTendencia = datosRegresionGraficoDesarrollo?.lineaTendencia || datos?.lineaTendencia;
        
        if (!lineaTendencia || lineaTendencia.length < 2) {
          console.log('⚠️ [AnalisisAceleracion] No hay datos de tendencia disponibles');
          return null;
        }

        console.log('✅ [AnalisisAceleracion] Usando línea de tendencia:', {
          fuente: datosRegresionGraficoDesarrollo?.lineaTendencia ? 'regresión GraficoDesarrollo' : 'retrospectiva local',
          longitud: lineaTendencia.length
        });
        const datosVelocidad = lineaTendencia.map((punto, idx) => {
          if (idx === 0) {
            return {
              edad_meses: punto.edad_cronologica,
              velocidad: null
            };
          }
          
          const puntoAnterior = lineaTendencia[idx - 1];
          const deltaDesarrollo = punto.edad_desarrollo - puntoAnterior.edad_desarrollo;
          const deltaEdadCronologica = punto.edad_cronologica - puntoAnterior.edad_cronologica;
          const velocidad = deltaEdadCronologica !== 0 ? deltaDesarrollo / deltaEdadCronologica : null;
          
          return {
            edad_meses: punto.edad_cronologica,
            velocidad: velocidad
          };
        }).filter(d => d.velocidad !== null);

        if (datosVelocidad.length === 0) return null;
        
        // Información de depuración
        const velocidadMin = Math.min(...datosVelocidad.map(d => d.velocidad));
        const velocidadMax = Math.max(...datosVelocidad.map(d => d.velocidad));
        const velocidadPromedio = datosVelocidad.reduce((sum, d) => sum + d.velocidad, 0) / datosVelocidad.length;
        const variacionVelocidad = velocidadMax - velocidadMin;
        
        console.log('Velocidad - Min:', velocidadMin.toFixed(4), 'Max:', velocidadMax.toFixed(4), 'Promedio:', velocidadPromedio.toFixed(4), 'Variación:', variacionVelocidad.toFixed(4));

        return (
          <div style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '10px' }}>
            <h3>🚀 Velocidad del Desarrollo (Derivada 1ª de la Trayectoria)</h3>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
              Pendiente de la línea de tendencia de "Gráficos de Trayectoria". Indica la tasa de cambio: valor 1.0 = desarrollo típico, {'>'} 1.0 = desarrollo acelerado, {'<'} 1.0 = desarrollo enlentecido.
              <br />
              <span style={{ fontSize: '0.85em', color: '#999' }}>
                Rango: {velocidadMin.toFixed(3)} - {velocidadMax.toFixed(3)} | Promedio: {velocidadPromedio.toFixed(3)} | Variación: {variacionVelocidad.toFixed(4)}
              </span>
            </p>
            <div id="grafica-velocidad-desarrollo">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={datosVelocidad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="edad_meses"
                    type="number"
                    label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Velocidad (ED/EC)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 2]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {/* Línea de referencia en 1.0 (desarrollo típico) */}
                  <ReferenceLine y={1.0} stroke="#999" strokeDasharray="5 5" label="Desarrollo Típico (1.0)" />
                  
                  {/* Velocidad */}
                  <Line 
                    type="monotone" 
                    dataKey="velocidad" 
                    stroke="#4CAF50" 
                    strokeWidth={3}
                    name="Velocidad de Desarrollo" 
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      {/* 2. Gráfico de Aceleración del Desarrollo (Derivada 2ª - derivada de velocidad) */}
      {(() => {
        // Calcular aceleración desde la velocidad (derivada segunda)
        console.log('🔍 [AnalisisAceleracion] Verificando datos para aceleración:', {
          existeRegresion: !!datosRegresionGraficoDesarrollo,
          tieneLineaTendenciaRegresion: !!datosRegresionGraficoDesarrollo?.lineaTendencia,
          longitudLineaTendenciaRegresion: datosRegresionGraficoDesarrollo?.lineaTendencia?.length,
          tieneLineaTendenciaRetrospectiva: !!datos?.lineaTendencia,
          longitudLineaTendenciaRetrospectiva: datos?.lineaTendencia?.length
        });
        
        // Usar línea de tendencia de regresión (GraficoDesarrollo) si está disponible,
        // o la línea de tendencia retrospectiva construida localmente
        const lineaTendencia = datosRegresionGraficoDesarrollo?.lineaTendencia || datos?.lineaTendencia;
        
        if (!lineaTendencia || lineaTendencia.length < 3) {
          console.log('⚠️ [AnalisisAceleracion] No hay suficientes datos de tendencia para aceleración (se necesitan al menos 3 puntos)');
          return null;
        }
        
        // Primero calcular velocidad
        const datosVelocidad = lineaTendencia.map((punto, idx) => {
          if (idx === 0) return null;
          
          const puntoAnterior = lineaTendencia[idx - 1];
          const deltaDesarrollo = punto.edad_desarrollo - puntoAnterior.edad_desarrollo;
          const deltaEdadCronologica = punto.edad_cronologica - puntoAnterior.edad_cronologica;
          const velocidad = deltaEdadCronologica !== 0 ? deltaDesarrollo / deltaEdadCronologica : null;
          
          return {
            edad_meses: punto.edad_cronologica,
            velocidad: velocidad
          };
        }).filter(d => d !== null && d.velocidad !== null);

        // Ahora calcular aceleración (derivada de velocidad)
        const datosAceleracion = datosVelocidad.map((punto, idx) => {
          if (idx === 0) {
            return {
              edad_meses: punto.edad_meses,
              aceleracion: null
            };
          }
          
          const puntoAnterior = datosVelocidad[idx - 1];
          const deltaVelocidad = punto.velocidad - puntoAnterior.velocidad;
          const deltaEdadCronologica = punto.edad_meses - puntoAnterior.edad_meses;
          const aceleracion = deltaEdadCronologica !== 0 ? deltaVelocidad / deltaEdadCronologica : null;
          
          return {
            edad_meses: punto.edad_meses,
            aceleracion: aceleracion
          };
        }).filter(d => d.aceleracion !== null);

        if (datosAceleracion.length === 0) return null;
        
        // Información de depuración
        const aceleracionMin = Math.min(...datosAceleracion.map(d => d.aceleracion));
        const aceleracionMax = Math.max(...datosAceleracion.map(d => d.aceleracion));
        const aceleracionPromedio = datosAceleracion.reduce((sum, d) => sum + d.aceleracion, 0) / datosAceleracion.length;
        
        console.log('Aceleración - Min:', aceleracionMin.toFixed(6), 'Max:', aceleracionMax.toFixed(6), 'Promedio:', aceleracionPromedio.toFixed(6));

        return (
          <div style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '10px' }}>
            <h3>⚡ Aceleración del Desarrollo (Derivada 2ª de la Trayectoria)</h3>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
              Cambio en la velocidad. Indica "cómo cambia el cambio": valores positivos = acelerando, negativos = desacelerando.
              <br />
              <span style={{ fontSize: '0.85em', color: '#999' }}>
                Rango: {aceleracionMin.toFixed(6)} - {aceleracionMax.toFixed(6)} | Promedio: {aceleracionPromedio.toFixed(6)}
              </span>
            </p>
            <div id="grafica-aceleracion-desarrollo">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={datosAceleracion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="edad_meses"
                    type="number"
                    label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Aceleración ((ED/EC)/mes)', angle: -90, position: 'insideLeft' }}
                    domain={[-0.05, 0.05]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" label="Aceleración = 0" />
                  
                  {/* Aceleración */}
                  <Line 
                    type="monotone" 
                    dataKey="aceleracion" 
                    stroke="#FF5722" 
                    strokeWidth={3}
                    name="Aceleración de Desarrollo" 
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      {/* Leyenda informativa */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#E3F2FD',
        borderRadius: '8px',
        border: '1px solid #2196F3'
      }}>
        <h4>ℹ️ Sobre este Análisis</h4>
        <p style={{ marginBottom: '10px' }}>
          Este análisis implementa los conceptos matemáticos del artículo 
          "Las matemáticas aplicadas a la evaluación del neurodesarrollo" de neuropediatoolkit.org:
        </p>
        <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Derivada 0ª (Posición):</strong> Cociente de Desarrollo - indica dónde está el niño</li>
          <li><strong>Derivada 1ª (Velocidad):</strong> Ritmo de cambio - indica qué tan rápido progresa</li>
          <li><strong>Derivada 2ª (Aceleración):</strong> Cambio en la velocidad - indica si acelera o desacelera</li>
        </ul>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Se requieren al menos 2 mediciones para calcular velocidad y 3 para aceleración. 
          Más mediciones mejoran la fiabilidad del análisis.
        </p>
      </div>
    </div>
  );
}
