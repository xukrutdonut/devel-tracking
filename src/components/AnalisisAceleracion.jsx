import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { fetchConAuth } from '../utils/authService';
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
export default function AnalisisAceleracion({ ninoId }) {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(1);
  const [fuentes, setFuentes] = useState([]);
  const [dominioSeleccionado, setDominioSeleccionado] = useState('global');
  const [dominios, setDominios] = useState([]);
  const [tipoDatos, setTipoDatos] = useState('desconocido');
  const [nino, setNino] = useState(null);

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
      // Cargar datos del niño PRIMERO
      const ninoResponse = await fetchConAuth(`${API_URL}/ninos/${ninoId}`);
      const ninoData = await ninoResponse.json();
      setNino(ninoData);
      
      // Intentar cargar itinerario (datos prospectivos)
      let itinerario = null;
      try {
        const itinerarioResponse = await fetchConAuth(
          `${API_URL}/itinerario/${ninoId}?fuente=${fuenteSeleccionada}`
        );
        
        // Solo parsear como JSON si la respuesta es exitosa
        if (itinerarioResponse.ok) {
          itinerario = await itinerarioResponse.json();
        }
      } catch (itinerarioError) {
        // Endpoint no existe o error, continuar con datos retrospectivos
        console.log('ℹ️ No hay datos prospectivos, usando datos retrospectivos');
      }

      // Si hay datos prospectivos (múltiples evaluaciones), usarlos
      if (itinerario && itinerario.evaluaciones && itinerario.evaluaciones.length >= 2) {
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

      // Si no hay datos prospectivos, construir desde datos longitudinales (retrospectivos)
      // Pasar ninoData como parámetro en lugar de usar el estado
      await construirDatosRetrospectivos(ninoData);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setDatos(null);
    } finally {
      setLoading(false);
    }
  };

  const construirDatosRetrospectivos = async (ninoData) => {
    try {
      console.log('🔍 Construyendo datos retrospectivos para análisis de aceleración...');
      
      // Cargar hitos conseguidos
      const hitosResponse = await fetchConAuth(`${API_URL}/hitos-conseguidos/${ninoId}`);
      const hitosConseguidos = await hitosResponse.json();
      console.log(`📊 Hitos conseguidos: ${hitosConseguidos?.length || 0}`);
      
      if (!hitosConseguidos || hitosConseguidos.length < 2) {
        console.log('⚠️ No hay suficientes hitos (mínimo 2)');
        setDatos(null);
        return;
      }

      // Cargar hitos normativos
      const normativosResponse = await fetchConAuth(`${API_URL}/hitos-normativos`);
      const hitosNormativos = await normativosResponse.json();
      
      // Filtrar por fuente
      const hitosNormativosFuente = hitosNormativos.filter(h => h.fuente_normativa_id === fuenteSeleccionada);
      console.log(`📚 Hitos normativos fuente ${fuenteSeleccionada}: ${hitosNormativosFuente.length}`);
      
      // Cargar dominios si no están cargados aún
      let dominiosParaUsar = dominios;
      if (!dominiosParaUsar || dominiosParaUsar.length === 0) {
        console.log('⚠️ Dominios no cargados, cargando ahora...');
        const dominiosResponse = await fetchConAuth(`${API_URL}/dominios`);
        dominiosParaUsar = await dominiosResponse.json();
        setDominios(dominiosParaUsar);
      }
      console.log(`🎯 Dominios disponibles: ${dominiosParaUsar.length}`);
      
      // Calcular edad actual del niño usando ninoData pasado como parámetro
      const fechaNac = new Date(ninoData.fecha_nacimiento);
      const hoy = new Date();
      const diffTime = Math.abs(hoy - fechaNac);
      const edadActualMeses = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      console.log(`👶 Edad actual: ${edadActualMeses} meses`);
      
      // Construir puntos de evaluación desde datos longitudinales
      const puntosEvaluacion = construirPuntosEvaluacion(
        hitosConseguidos,
        hitosNormativosFuente,
        dominiosParaUsar,
        edadActualMeses
      );
      console.log(`📈 Puntos de evaluación construidos: ${puntosEvaluacion.length}`);
      
      if (puntosEvaluacion.length < 2) {
        console.log('⚠️ No hay suficientes puntos de evaluación (mínimo 2)');
        setDatos(null);
        return;
      }

      // Calcular métricas de trayectoria
      const datosCalculados = calcularAceleracionesDesdePuntos(puntosEvaluacion);
      console.log(`✅ Datos calculados: ${datosCalculados.length} puntos`);
      
      setDatos({
        evaluaciones: puntosEvaluacion,
        datosAceleracion: datosCalculados
      });
      setTipoDatos('retrospectivo');
      
    } catch (error) {
      console.error('❌ Error construyendo datos retrospectivos:', error);
      setDatos(null);
    }
  };

  /**
   * Calcula aceleraciones desde puntos de evaluación ya construidos
   * (usada para datos retrospectivos)
   */
  const calcularAceleracionesDesdePuntos = (puntosEvaluacion) => {
    const datos = [];
    
    console.log(`🔧 Calculando para dominio: ${dominioSeleccionado}`);
    console.log(`🔧 Puntos disponibles: ${puntosEvaluacion.length}`);
    
    // Log de ejemplo del primer punto para ver estructura
    if (puntosEvaluacion.length > 0) {
      console.log(`🔧 Estructura del primer punto:`, JSON.stringify({
        edad: puntosEvaluacion[0].edad_meses,
        dominios: puntosEvaluacion[0].dominios,
        cd_global: puntosEvaluacion[0].cd_global
      }, null, 2));
    }
    
    for (let i = 0; i < puntosEvaluacion.length; i++) {
      const punto_actual = puntosEvaluacion[i];
      let cd_actual;
      
      if (dominioSeleccionado === 'global') {
        cd_actual = punto_actual.cd_global;
      } else {
        const dominio = punto_actual.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
        cd_actual = dominio?.cd;
        if (!dominio && i === 0) {
          console.log(`⚠️ No se encontró dominio ${dominioSeleccionado} en punto edad ${punto_actual.edad_meses}`);
          console.log(`⚠️ Dominios disponibles en este punto:`, punto_actual.dominios?.map(d => d.dominio_id));
        }
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
            📊 Edad: {data.edad_meses} meses
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
          {tipoDatos === 'retrospectivo' ? '📚' : '📊'}
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

      {/* 1. Gráfico de Trayectoria del Desarrollo (Posición - Derivada 0ª) */}
      <div style={{ marginBottom: '30px' }}>
        <h3>📊 Trayectoria del Desarrollo (Posición - Derivada 0ª)</h3>
        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
          Cociente de Desarrollo (CD) a lo largo del tiempo. Muestra "dónde está" el niño en su desarrollo.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={datos.datosAceleracion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="edad_meses" 
              label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Cociente de Desarrollo (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Líneas de referencia */}
            <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" label="Desarrollo Típico (100%)" />
            <ReferenceLine y={85} stroke="#FF9800" strokeDasharray="2 2" label="Zona de Alerta (85%)" />
            <ReferenceLine y={70} stroke="#F44336" strokeDasharray="2 2" label="Retraso Significativo (70%)" />
            
            {/* Posición (CD) */}
            <Line 
              type="monotone" 
              dataKey="cd" 
              stroke="#2196F3" 
              strokeWidth={3}
              name="Cociente de Desarrollo" 
              dot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Gráfico de Velocidad del Desarrollo (Derivada 1ª) */}
      {datos.datosAceleracion.some(d => d.velocidad !== null) && (
        <div style={{ marginBottom: '30px' }}>
          <h3>🚀 Velocidad del Desarrollo (Derivada 1ª)</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
            Tasa de cambio del desarrollo. Indica "cómo cambia" el ritmo: valores positivos = progreso, negativos = regresión.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={datos.datosAceleracion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="edad_meses" 
                label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Velocidad (puntos CD/mes)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Línea de referencia en 0 */}
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" label="Sin cambio (0)" />
              
              {/* Velocidad */}
              <Line 
                type="monotone" 
                dataKey="velocidad" 
                stroke="#4CAF50" 
                strokeWidth={3}
                name="Velocidad de Desarrollo" 
                dot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 3. Gráfico de Aceleración del Desarrollo (Derivada 2ª) */}
      {datos.datosAceleracion.some(d => d.aceleracion !== null) && (
        <div style={{ marginBottom: '30px' }}>
          <h3>⚡ Aceleración del Desarrollo (Derivada 2ª)</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
            Cambio en la velocidad. Indica "cómo cambia el cambio": valores positivos = acelerando, negativos = desacelerando.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={datos.datosAceleracion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="edad_meses" 
                label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Aceleración (puntos/mes²)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" label="Aceleración = 0" />
              
              {/* Área positiva (aceleración) en verde */}
              <Area 
                type="monotone" 
                dataKey={(data) => data.aceleracion > 0 ? data.aceleracion : 0}
                fill="#4CAF50" 
                fillOpacity={0.3}
                stroke="none"
              />
              
              {/* Área negativa (desaceleración) en rojo */}
              <Area 
                type="monotone" 
                dataKey={(data) => data.aceleracion < 0 ? data.aceleracion : 0}
                fill="#F44336" 
                fillOpacity={0.3}
                stroke="none"
              />
              
              <Line 
                type="monotone" 
                dataKey="aceleracion" 
                stroke="#FF9800" 
                strokeWidth={2}
                name="Aceleración (2ª)" 
                dot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de interpretaciones */}
      <div style={{ marginTop: '30px' }}>
        <h3>📋 Interpretación Detallada</h3>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          marginTop: '15px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Edad</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>CD (0ª)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Velocidad (1ª)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Aceleración (2ª)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Interpretación</th>
            </tr>
          </thead>
          <tbody>
            {datos.datosAceleracion.map((punto, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {punto.edad_meses}m
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <strong>{punto.cd?.toFixed(1)}%</strong>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {punto.velocidad !== null ? (
                    <span style={{ color: punto.velocidad > 0 ? '#4CAF50' : '#F44336' }}>
                      {punto.velocidad > 0 ? '↗' : punto.velocidad < 0 ? '↘' : '→'} 
                      {punto.velocidad?.toFixed(2)}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {punto.aceleracion !== null ? (
                    <span style={{ color: punto.aceleracion > 0 ? '#4CAF50' : '#F44336' }}>
                      {punto.aceleracion > 0 ? '⬆' : punto.aceleracion < 0 ? '⬇' : '—'} 
                      {punto.aceleracion?.toFixed(3)}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '13px' }}>
                  {punto.interpretacion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
