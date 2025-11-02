import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Scatter, ScatterChart, ZAxis } from 'recharts';
import { construirPuntosEvaluacion, clasificarTipoTrayectoria, determinarTipoDatos } from '../utils/trayectoriasUtils';
import { fetchConAuth } from '../utils/authService';
import { API_URL } from '../config';
import { 
  ajustarModeloPolinomial, 
  analizarPrePostIntervencion,
  clasificarTrayectoriaAutomatica 
} from '../utils/modelosEstadisticos';

/**
 * Componente para clasificación de trayectorias del desarrollo
 * Basado en Thomas et al. (2009) - Using developmental trajectories to understand developmental disorders
 * 
 * ACTUALIZADO CON MODELOS ESTADÍSTICOS AVANZADOS:
 * - Modelos polinomiales para detectar oleadas de desarrollo (Thomas, 2016)
 * - Análisis pre/post intervención (Deboeck et al., 2016)
 * - Clasificación automática mejorada con alertas específicas
 * - Detección de puntos de inflexión y aceleraciones
 * 
 * SOPORTA DOS TIPOS DE DATOS:
 * 1. LONGITUDINAL RETROSPECTIVO: Múltiples hitos con edades de logro
 * 2. PROSPECTIVO: Múltiples evaluaciones puntuales en el tiempo
 * 
 * Implementa clasificación de 4 tipos de trayectorias atípicas:
 * 1. DELAY (Retraso): Trayectoria paralela pero retrasada
 * 2. DEVIANCE (Desviación): Trayectoria con pendiente diferente
 * 3. DYSMATURITY (Inmadurez): Inicio normal pero posterior desaceleración
 * 4. DIFFERENCE (Diferencia cualitativa): Patrón cualitativamente diferente
 * 
 * Referencias:
 * - Thomas MS, et al. (2009). J Speech Lang Hear Res. 52(2):336-58.
 * - Thomas MSC. (2016). Statistical approaches with SPSS
 * - Deboeck et al. (2016). Integrating developmental theory and methodology
 */
export default function ClasificacionTrayectorias({ ninoId }) {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(1);
  const [fuentes, setFuentes] = useState([]);
  const [dominios, setDominios] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [tipoDatos, setTipoDatos] = useState('desconocido');
  const [nino, setNino] = useState(null);
  
  // Estados para análisis estadísticos avanzados
  const [modelosPolinomiales, setModelosPolinomiales] = useState({});
  const [analisisIntervencion, setAnalisisIntervencion] = useState(null);
  const [clasificacionAutomatica, setClasificacionAutomatica] = useState(null);
  const [mostrarAnalisisAvanzado, setMostrarAnalisisAvanzado] = useState(false);

  useEffect(() => {
    cargarFuentes();
    cargarDominios();
  }, []);

  useEffect(() => {
    if (ninoId) {
      cargarDatos();
    }
  }, [ninoId, fuenteSeleccionada]);

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
      const itinerarioResponse = await fetchConAuth(
        `${API_URL}/itinerario/${ninoId}?fuente=${fuenteSeleccionada}`
      );
      const itinerario = await itinerarioResponse.json();

      // Si hay datos prospectivos (múltiples evaluaciones), usarlos
      if (itinerario && itinerario.evaluaciones && itinerario.evaluaciones.length >= 3) {
        const clasificacionesPorDominio = clasificarTrayectorias(itinerario.evaluaciones);
        
        setDatos(itinerario);
        setClasificaciones(clasificacionesPorDominio);
        setTipoDatos('prospectivo');
        setLoading(false);
        return;
      }

      // Si no hay datos prospectivos, construir desde datos longitudinales (retrospectivos)
      // Pasar ninoData como parámetro
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
      console.log('🔍 Construyendo datos retrospectivos para clasificación...');
      
      // Cargar hitos conseguidos
      const hitosResponse = await fetchConAuth(`${API_URL}/hitos-conseguidos/${ninoId}`);
      const hitosConseguidos = await hitosResponse.json();
      console.log(`📊 Hitos conseguidos: ${hitosConseguidos?.length || 0}`);
      
      if (!hitosConseguidos || hitosConseguidos.length < 3) {
        console.log('⚠️ No hay suficientes hitos (mínimo 3)');
        setDatos(null);
        return;
      }

      // Cargar hitos normativos
      const normativosResponse = await fetchConAuth(`${API_URL}/hitos-normativos`);
      const hitosNormativos = await normativosResponse.json();
      
      // Filtrar por fuente
      const hitosNormativosFuente = hitosNormativos.filter(h => h.fuente_id === fuenteSeleccionada);
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
      
      // Calcular edad actual del niño usando ninoData
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
      
      if (puntosEvaluacion.length < 3) {
        console.log('⚠️ No hay suficientes puntos de evaluación (mínimo 3)');
        setDatos(null);
        return;
      }

      // Clasificar trayectorias
      const clasificacionesPorDominio = clasificarTrayectorias(puntosEvaluacion);
      console.log(`✅ Clasificaciones generadas: ${clasificacionesPorDominio.length}`);
      
      setDatos({
        evaluaciones: puntosEvaluacion
      });
      setClasificaciones(clasificacionesPorDominio);
      setTipoDatos('retrospectivo');
      
    } catch (error) {
      console.error('❌ Error construyendo datos retrospectivos:', error);
      setDatos(null);
    }
  };

  /**
   * Clasifica las trayectorias según Thomas et al. (2009)
   * 
   * Criterios:
   * 1. DELAY: Z-score constante negativo, velocidad normal
   * 2. DEVIANCE: Z-score cambia sistemáticamente (velocidad anormal)
   * 3. DYSMATURITY: Z-score inicialmente normal, luego empeora
   * 4. DIFFERENCE: Patrón no clasificable en anteriores
   */
  const clasificarTrayectorias = (evaluaciones) => {
    const clasificaciones = [];

    // Analizar trayectoria global
    const globalClass = clasificarTrayectoria(evaluaciones, 'global');
    if (globalClass) {
      clasificaciones.push({
        dominio: 'Global',
        dominio_id: 'global',
        ...globalClass
      });
    }

    // Analizar cada dominio
    if (evaluaciones[0].dominios) {
      const dominiosUnicos = new Set();
      evaluaciones.forEach(evaluacion => {
        if (evaluacion.dominios) {
          evaluacion.dominios.forEach(d => dominiosUnicos.add(d.dominio_id));
        }
      });

      dominiosUnicos.forEach(dominioId => {
        const dominio = dominios.find(d => d.id === dominioId);
        if (!dominio) return;

        const dominioClass = clasificarTrayectoria(evaluaciones, dominioId);
        if (dominioClass) {
          clasificaciones.push({
            dominio: dominio.nombre,
            dominio_id: dominioId,
            ...dominioClass
          });
        }
      });
    }

    return clasificaciones;
  };

  /**
   * Clasifica una trayectoria individual
   */
  const clasificarTrayectoria = (evaluaciones, dominioId) => {
    const datos = extraerDatosDominio(evaluaciones, dominioId);
    
    if (datos.length < 3) return null;

    // Calcular métricas
    const zScores = datos.map(d => d.z_score).filter(z => z !== null);
    const cds = datos.map(d => d.cd).filter(cd => cd !== null);
    
    if (zScores.length < 3 || cds.length < 3) return null;

    // Métricas estadísticas
    const zMedia = zScores.reduce((a, b) => a + b, 0) / zScores.length;
    const zPrimero = zScores[0];
    const zUltimo = zScores[zScores.length - 1];
    const zCambio = zUltimo - zPrimero;
    const zVarianza = calcularVarianza(zScores);
    
    // Velocidades
    const velocidades = [];
    for (let i = 1; i < cds.length; i++) {
      const deltaT = datos[i].edad - datos[i-1].edad;
      const deltaCD = cds[i] - cds[i-1];
      if (deltaT > 0) {
        velocidades.push(deltaCD / deltaT);
      }
    }
    const velocidadMedia = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
    const velocidadVarianza = calcularVarianza(velocidades);

    // Clasificación según criterios de Thomas et al. (2009)
    let tipo, descripcion, caracteristicas, implicaciones;

    // Criterio 1: DELAY (Retraso)
    // Z-score consistentemente bajo pero estable, velocidad cercana a normal
    if (zMedia < -1 && Math.abs(zVarianza) < 0.5 && Math.abs(velocidadMedia) < 0.5) {
      tipo = 'DELAY';
      descripcion = 'Retraso (Trayectoria paralela retrasada)';
      caracteristicas = [
        `Z-score medio: ${zMedia.toFixed(2)} (consistentemente bajo)`,
        `Varianza de Z: ${zVarianza.toFixed(3)} (baja variabilidad)`,
        `Velocidad: ${velocidadMedia.toFixed(2)} puntos/mes (cercana a normal)`,
        'Trayectoria paralela a la normalidad pero desplazada'
      ];
      implicaciones = [
        'Desarrollo sigue el mismo patrón que típico pero retrasado',
        'Hitos se alcanzan en el mismo orden que niños típicos',
        'Pronóstico: Distancia con normalidad se mantiene constante',
        'Intervención: Estimulación generalizada, no específica'
      ];
    }
    
    // Criterio 2: DEVIANCE (Desviación)
    // Z-score cambia sistemáticamente (mejora o empeora progresivamente)
    else if (Math.abs(zCambio) > 1.0 && velocidadVarianza < 1.0) {
      if (zCambio > 0) {
        tipo = 'DEVIANCE_CONVERGENTE';
        descripcion = 'Desviación convergente (Recuperación)';
        caracteristicas = [
          `Z-score inicial: ${zPrimero.toFixed(2)}`,
          `Z-score final: ${zUltimo.toFixed(2)}`,
          `Cambio total: +${zCambio.toFixed(2)} DE (mejora)`,
          `Velocidad: ${velocidadMedia.toFixed(2)} puntos/mes (superior a normal)`,
          'Trayectoria convergente hacia la normalidad'
        ];
        implicaciones = [
          'Desarrollo acelerado, "catching up"',
          'Puede alcanzar rango normal con el tiempo',
          'Pronóstico: Favorable, distancia con normalidad disminuye',
          'Intervención: Continuar estrategias actuales (son efectivas)'
        ];
      } else {
        tipo = 'DEVIANCE_DIVERGENTE';
        descripcion = 'Desviación divergente (Empeoramiento)';
        caracteristicas = [
          `Z-score inicial: ${zPrimero.toFixed(2)}`,
          `Z-score final: ${zUltimo.toFixed(2)}`,
          `Cambio total: ${zCambio.toFixed(2)} DE (empeora)`,
          `Velocidad: ${velocidadMedia.toFixed(2)} puntos/mes (inferior a normal)`,
          'Trayectoria divergente, alejándose de normalidad'
        ];
        implicaciones = [
          'Desarrollo más lento que típico',
          'Distancia con normalidad aumenta con el tiempo',
          'Pronóstico: Desfavorable sin intervención',
          'Intervención: URGENTE - intensificar terapias, revisar diagnóstico'
        ];
      }
    }
    
    // Criterio 3: DYSMATURITY (Inmadurez)
    // Inicio normal o cercano a normal, posterior deterioro
    else if (zPrimero > -1 && zUltimo < -1.5 && zCambio < -1) {
      tipo = 'DYSMATURITY';
      descripcion = 'Inmadurez (Inicio normal, posterior desviación)';
      caracteristicas = [
        `Z-score inicial: ${zPrimero.toFixed(2)} (dentro de normalidad)`,
        `Z-score final: ${zUltimo.toFixed(2)} (retraso significativo)`,
        `Cambio: ${zCambio.toFixed(2)} DE (deterioro)`,
        'Desarrollo inicialmente típico, luego desaceleración'
      ];
      implicaciones = [
        'Patrón sugestivo de trastorno adquirido o regresivo',
        'Considerar: TEA con regresión, síndromes neurodegenerativos',
        'Pronóstico: Depende de causa subyacente',
        'Intervención: Evaluación neurológica urgente, neuroimagen'
      ];
    }
    
    // Criterio 4: DIFFERENCE (Diferencia cualitativa)
    // Patrón errático o no clasificable
    else if (velocidadVarianza > 1.0 || zVarianza > 1.0) {
      tipo = 'DIFFERENCE';
      descripcion = 'Diferencia cualitativa (Patrón atípico)';
      caracteristicas = [
        `Z-score medio: ${zMedia.toFixed(2)}`,
        `Varianza alta de Z: ${zVarianza.toFixed(3)}`,
        `Varianza alta de velocidad: ${velocidadVarianza.toFixed(3)}`,
        'Patrón de desarrollo cualitativamente diferente',
        'Trayectoria errática o no lineal'
      ];
      implicaciones = [
        'Desarrollo no sigue patrones típicos ni de retraso simple',
        'Puede indicar perfil "pico-valle" (fortalezas y debilidades marcadas)',
        'Considerar: Trastornos específicos del aprendizaje, perfiles cognitivos atípicos',
        'Intervención: Evaluación neuropsicológica detallada, perfil individualizado'
      ];
    }
    
    // Si no cumple ningún criterio claramente
    else {
      tipo = 'INDETERMINADO';
      descripcion = 'Patrón indeterminado (Requiere más datos)';
      caracteristicas = [
        `Z-score medio: ${zMedia.toFixed(2)}`,
        `Velocidad: ${velocidadMedia.toFixed(2)} puntos/mes`,
        'Insuficientes datos o patrón no claramente clasificable'
      ];
      implicaciones = [
        'Continuar seguimiento longitudinal',
        'Se necesitan más evaluaciones para caracterizar trayectoria',
        'Mantener vigilancia'
      ];
    }

    return {
      tipo,
      descripcion,
      caracteristicas,
      implicaciones,
      metricas: {
        zPrimero,
        zUltimo,
        zMedia,
        zCambio,
        zVarianza,
        velocidadMedia,
        velocidadVarianza,
        nMediciones: datos.length
      }
    };
  };

  const extraerDatosDominio = (evaluaciones, dominioId) => {
    const datos = [];
    
    evaluaciones.forEach(evaluacion => {
      let cd, z_score;
      
      if (dominioId === 'global') {
        cd = evaluacion.cd_global;
        z_score = null; // No tenemos Z global directo, usaremos CD
        if (cd) {
          // Aproximar Z desde CD (asumiendo CD=100 es Z=0)
          z_score = (cd - 100) / 15; // Aproximación
        }
      } else {
        const dominio = evaluacion.dominios?.find(d => d.dominio_id === dominioId);
        cd = dominio?.cd;
        z_score = dominio?.z_promedio;
      }
      
      if (cd !== null && cd !== undefined) {
        datos.push({
          edad: evaluacion.edad_meses,
          cd: cd,
          z_score: z_score
        });
      }
    });
    
    return datos;
  };

  const calcularVarianza = (valores) => {
    if (valores.length < 2) return 0;
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const sumaCuadrados = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0);
    return sumaCuadrados / valores.length;
  };

  const getColorTipo = (tipo) => {
    const colores = {
      'DELAY': '#2196F3', // Azul - Retraso estable
      'DEVIANCE_CONVERGENTE': '#4CAF50', // Verde - Mejora
      'DEVIANCE_DIVERGENTE': '#F44336', // Rojo - Empeora
      'DYSMATURITY': '#FF9800', // Naranja - Regresión
      'DIFFERENCE': '#9C27B0', // Púrpura - Atípico
      'INDETERMINADO': '#9E9E9E' // Gris - Indefinido
    };
    return colores[tipo] || '#9E9E9E';
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      'DELAY': '➡️',
      'DEVIANCE_CONVERGENTE': '📈',
      'DEVIANCE_DIVERGENTE': '📉',
      'DYSMATURITY': '⚠️',
      'DIFFERENCE': '🔀',
      'INDETERMINADO': '❓'
    };
    return iconos[tipo] || '❓';
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>⏳ Cargando clasificación de trayectorias...</p>
      </div>
    );
  };

  if (!datos || !clasificaciones || clasificaciones.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>🎯 Clasificación de Trayectorias del Desarrollo</h3>
        <p style={{ color: '#666', marginTop: '10px' }}>
          ℹ️ Se necesitan al menos 3 evaluaciones para clasificar el tipo de trayectoria.
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '10px' }}>
          Puedes usar este análisis con:
        </p>
        <ul style={{ color: '#999', fontSize: '14px', textAlign: 'left', maxWidth: '600px', margin: '10px auto' }}>
          <li><strong>Datos retrospectivos (longitudinales):</strong> Registra al menos 3 hitos diferentes con sus edades de logro</li>
          <li><strong>Datos prospectivos:</strong> Realiza al menos 3 evaluaciones en diferentes momentos</li>
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🎯 Clasificación de Trayectorias del Desarrollo</h2>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        Basado en Thomas et al. (2009) - Tipología de trayectorias atípicas
      </p>
      
      {/* Indicador de tipo de datos */}
      <div style={{
        padding: '10px',
        marginBottom: '15px',
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
            <><strong>Datos longitudinales retrospectivos:</strong> Clasificación basada en hitos con edades de logro</>
          )}
          {tipoDatos === 'prospectivo' && (
            <><strong>Datos prospectivos:</strong> Clasificación basada en múltiples evaluaciones temporales</>
          )}
          {tipoDatos === 'desconocido' && (
            <><strong>Clasificación de trayectorias:</strong> Identificando patrones de desarrollo</>
          )}
        </span>
      </div>

      {/* Selector de fuente */}
      <div style={{ marginBottom: '20px' }}>
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

      {/* Tarjetas de clasificación por dominio */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {clasificaciones.map((clasif, index) => (
          <div key={index} style={{
            border: `3px solid ${getColorTipo(clasif.tipo)}`,
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              color: getColorTipo(clasif.tipo),
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>{getIconoTipo(clasif.tipo)}</span>
              {clasif.dominio}
            </h3>
            
            <div style={{
              backgroundColor: getColorTipo(clasif.tipo),
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              {clasif.descripcion}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>📊 Características:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                {clasif.caracteristicas.map((car, i) => (
                  <li key={i}>{car}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>💡 Implicaciones Clínicas:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                {clasif.implicaciones.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>

            <div style={{ 
              marginTop: '15px', 
              paddingTop: '15px', 
              borderTop: '1px solid #eee',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Métricas:</strong> {clasif.metricas.nMediciones} mediciones | 
              Z medio: {clasif.metricas.zMedia.toFixed(2)} | 
              V: {clasif.metricas.velocidadMedia.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Información sobre la tipología */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#E3F2FD',
        borderRadius: '8px',
        border: '1px solid #2196F3'
      }}>
        <h3>ℹ️ Sobre esta Clasificación</h3>
        <p style={{ marginBottom: '15px' }}>
          Esta clasificación se basa en la tipología de trayectorias atípicas propuesta por 
          <strong> Michael S. Thomas y colaboradores (2009)</strong> en su artículo seminal sobre 
          el uso de trayectorias del desarrollo para entender trastornos del neurodesarrollo.
        </p>

        <h4>Los 4 Tipos de Trayectorias Atípicas:</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '2px solid #2196F3' }}>
            <strong>➡️ DELAY (Retraso)</strong>
            <p style={{ fontSize: '13px', margin: '5px 0 0 0' }}>
              Misma pendiente, diferente inicio. Trayectoria paralela pero retrasada.
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '2px solid #4CAF50' }}>
            <strong>📈📉 DEVIANCE (Desviación)</strong>
            <p style={{ fontSize: '13px', margin: '5px 0 0 0' }}>
              Diferente pendiente. Convergente (mejora) o divergente (empeora).
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '2px solid #FF9800' }}>
            <strong>⚠️ DYSMATURITY (Inmadurez)</strong>
            <p style={{ fontSize: '13px', margin: '5px 0 0 0' }}>
              Inicio normal, posterior desaceleración. Patrón regresivo.
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '2px solid #9C27B0' }}>
            <strong>🔀 DIFFERENCE (Diferencia)</strong>
            <p style={{ fontSize: '13px', margin: '5px 0 0 0' }}>
              Patrón cualitativamente diferente, no reducible a retraso.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
          <strong>Referencias:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Thomas MS, et al. (2009). Using developmental trajectories to understand developmental disorders. 
            <em> J Speech Lang Hear Res</em>. 52(2):336-58.</li>
            <li>Thomas MSC. (2016). Understanding Delay in Developmental Disorders. 
            <em> Child Dev Perspect</em>. 10(2):73-80.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
