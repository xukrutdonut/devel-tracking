import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import FuentesNormativasInfo from './FuentesNormativasInfo';

const API_URL = 'http://localhost:8001/api';

function ItinerarioDesarrollo({ ninoId }) {
  const [itinerario, setItinerario] = useState(null);
  const [analisis, setAnalisis] = useState(null);
  const [fuentesNormativas, setFuentesNormativas] = useState([]);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(1);
  const [vistaActual, setVistaActual] = useState('cociente'); // 'cociente' o 'velocidad'
  const [dominioSeleccionado, setDominioSeleccionado] = useState('global');
  const [mostrarInfoFuentes, setMostrarInfoFuentes] = useState(false);

  useEffect(() => {
    cargarFuentesNormativas();
  }, []);

  useEffect(() => {
    if (fuenteSeleccionada) {
      cargarDatos();
    }
  }, [ninoId, fuenteSeleccionada]);

  const cargarFuentesNormativas = async () => {
    try {
      const response = await fetch(`${API_URL}/fuentes-normativas`);
      const data = await response.json();
      setFuentesNormativas(data);
      if (data.length > 0) {
        setFuenteSeleccionada(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar fuentes normativas:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      const fuenteParam = `?fuente=${fuenteSeleccionada}`;
      const [itinerarioRes, analisisRes] = await Promise.all([
        fetch(`${API_URL}/itinerario/${ninoId}${fuenteParam}`),
        fetch(`${API_URL}/analisis/${ninoId}${fuenteParam}`)
      ]);

      const itinerarioData = await itinerarioRes.json();
      const analisisData = await analisisRes.json();

      setItinerario(itinerarioData);
      setAnalisis(analisisData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  if (!itinerario || !analisis) {
    return <div className="loading">Cargando itinerario de desarrollo...</div>;
  }

  // Preparar datos para el gráfico de cociente de desarrollo
  const datosGraficoCociente = itinerario.itinerario.map(punto => {
    const datos = {
      edad: punto.edad_cronologica.toFixed(1),
      global: punto.cociente_desarrollo_global
    };
    
    // Añadir cocientes por dominio
    Object.keys(punto.cocientes_por_dominio).forEach(domId => {
      const dom = punto.cocientes_por_dominio[domId];
      datos[`dominio_${domId}`] = dom.cociente_desarrollo;
      datos[`nombre_${domId}`] = dom.dominio_nombre;
    });
    
    return datos;
  });

  // Preparar datos para el gráfico de velocidad
  const datosGraficoVelocidad = itinerario.itinerario.map(punto => ({
    edad: punto.edad_cronologica.toFixed(1),
    velocidad: punto.velocidad_desarrollo
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label"><strong>Edad: {payload[0].payload.edad} meses</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
              {vistaActual === 'cociente' && '%'}
            </p>
          ))}
          {vistaActual === 'cociente' && (
            <p className="interpretacion">
              <small>
                {payload[0].value > 100 ? '⬆️ Adelantado' : 
                 payload[0].value < 100 ? '⬇️ Retraso' : 
                 '✅ Normal'}
              </small>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Obtener lista de dominios únicos
  const dominiosDisponibles = itinerario.itinerario.length > 0 
    ? Object.keys(itinerario.itinerario[0].cocientes_por_dominio || {})
    : [];

  return (
    <div className="grafico-desarrollo">
      <h2>📈 Itinerario de Desarrollo</h2>

      <div className="filtros" style={{marginBottom: '2rem'}}>
        <div className="filtro-grupo">
          <label>Fuente Normativa:</label>
          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'stretch'}}>
            <select 
              value={fuenteSeleccionada} 
              onChange={(e) => setFuenteSeleccionada(Number(e.target.value))}
              style={{flex: 1}}
            >
              {fuentesNormativas.map(fuente => (
                <option key={fuente.id} value={fuente.id}>{fuente.nombre}</option>
              ))}
            </select>
            <button 
              className="btn-info-fuentes"
              onClick={() => setMostrarInfoFuentes(true)}
              title="Ver información sobre fuentes normativas"
            >
              ℹ️ Info
            </button>
          </div>
        </div>

        <div className="filtro-grupo">
          <label>Vista:</label>
          <select 
            value={vistaActual} 
            onChange={(e) => setVistaActual(e.target.value)}
          >
            <option value="cociente">Cociente de Desarrollo</option>
            <option value="velocidad">Velocidad de Desarrollo</option>
          </select>
        </div>

        {vistaActual === 'cociente' && (
          <div className="filtro-grupo">
            <label>Dominio:</label>
            <select 
              value={dominioSeleccionado} 
              onChange={(e) => setDominioSeleccionado(e.target.value)}
            >
              <option value="global">Global (todos los dominios)</option>
              {dominiosDisponibles.map(domId => {
                const nombreDom = datosGraficoCociente[0]?.[`nombre_${domId}`] || `Dominio ${domId}`;
                return <option key={domId} value={domId}>{nombreDom}</option>;
              })}
            </select>
          </div>
        )}
      </div>

      {mostrarInfoFuentes && (
        <FuentesNormativasInfo 
          onClose={() => setMostrarInfoFuentes(false)}
          fuenteIdInicial={fuenteSeleccionada}
        />
      )}

      {/* Resumen actual */}
      <div className="resumen-estadistico">
        <div className="stat-card">
          <h3>Edad Cronológica</h3>
          <span className="big-number">{analisis.edad_cronologica.toFixed(1)}</span>
          <span className="stat-label">meses</span>
        </div>
        <div className="stat-card">
          <h3>Edad de Desarrollo</h3>
          <span className={`big-number ${analisis.edad_desarrollo_global > analisis.edad_cronologica ? 'adelanto' : analisis.edad_desarrollo_global < analisis.edad_cronologica ? 'retraso' : 'normal'}`}>
            {analisis.edad_desarrollo_global.toFixed(1)}
          </span>
          <span className="stat-label">meses</span>
        </div>
        <div className="stat-card">
          <h3>Cociente de Desarrollo</h3>
          <span className={`big-number ${analisis.cociente_desarrollo_global > 100 ? 'adelanto' : analisis.cociente_desarrollo_global < 100 ? 'retraso' : 'normal'}`}>
            {analisis.cociente_desarrollo_global.toFixed(1)}
          </span>
          <span className="stat-label">%</span>
        </div>
      </div>

      {/* Información conceptual */}
      <div className="chart-note" style={{marginBottom: '2rem'}}>
        <h4>📊 Conceptos Clave</h4>
        <p>
          <strong>Edad de Desarrollo (ED):</strong> Promedio de las edades normativas de los hitos conseguidos. 
          Representa el nivel funcional del desarrollo.
        </p>
        <p>
          <strong>Cociente de Desarrollo (CD):</strong> (ED / Edad Cronológica) × 100. 
          <ul>
            <li>CD = 100%: Desarrollo típico (ED = EC)</li>
            <li>CD &gt; 100%: Desarrollo adelantado (ED &gt; EC)</li>
            <li>CD &lt; 100%: Desarrollo retrasado (ED &lt; EC)</li>
          </ul>
        </p>
        <p>
          <strong>Velocidad de Desarrollo:</strong> Derivada del cociente de desarrollo (ΔCD/Δt). 
          Indica si el niño está acelerando o desacelerando su desarrollo.
        </p>
      </div>

      {/* Gráfico de Cociente de Desarrollo */}
      {vistaActual === 'cociente' && (
        <div className="chart-container">
          <h3>Cociente de Desarrollo a lo largo del tiempo</h3>
          <p className="chart-description">
            {dominioSeleccionado === 'global' 
              ? 'Evolución del cociente de desarrollo global (todos los dominios)'
              : `Evolución del cociente de desarrollo en ${datosGraficoCociente[0]?.[`nombre_${dominioSeleccionado}`] || 'el dominio seleccionado'}`
            }
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={datosGraficoCociente} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="edad" 
                label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'Cociente de Desarrollo (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 150]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Línea de referencia en 100% (desarrollo típico) */}
              <ReferenceLine y={100} stroke="#4caf50" strokeDasharray="5 5" label="CD = 100% (típico)" />
              <ReferenceLine y={85} stroke="#ff9800" strokeDasharray="3 3" label="Límite retraso leve" />
              <ReferenceLine y={70} stroke="#f44336" strokeDasharray="3 3" label="Retraso moderado" />
              
              {dominioSeleccionado === 'global' ? (
                <Line 
                  type="monotone" 
                  dataKey="global" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  name="Global"
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              ) : (
                <Line 
                  type="monotone" 
                  dataKey={`dominio_${dominioSeleccionado}`} 
                  stroke="#667eea" 
                  strokeWidth={3}
                  name={datosGraficoCociente[0]?.[`nombre_${dominioSeleccionado}`] || 'Dominio'}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Velocidad de Desarrollo */}
      {vistaActual === 'velocidad' && (
        <div className="chart-container">
          <h3>Velocidad de Desarrollo (Derivada del Cociente)</h3>
          <p className="chart-description">
            La velocidad indica cómo cambia el cociente de desarrollo con el tiempo. 
            Valores positivos = aceleración, valores negativos = desaceleración.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={datosGraficoVelocidad} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="edad" 
                label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'Velocidad (ΔCD/Δt)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Línea de referencia en 0 (velocidad constante) */}
              <ReferenceLine y={0} stroke="#4caf50" strokeDasharray="5 5" label="Velocidad = 0 (constante)" />
              
              <Line 
                type="monotone" 
                dataKey="velocidad" 
                stroke="#f39c12" 
                strokeWidth={3}
                name="Velocidad de Desarrollo"
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="chart-note" style={{marginTop: '1rem'}}>
            <p>
              <strong>Interpretación:</strong>
              <ul>
                <li><strong>Velocidad &gt; 0:</strong> El niño está acelerando su desarrollo (CD aumenta)</li>
                <li><strong>Velocidad = 0:</strong> Velocidad constante (CD se mantiene)</li>
                <li><strong>Velocidad &lt; 0:</strong> El niño está desacelerando (CD disminuye, puede indicar estancamiento)</li>
              </ul>
            </p>
          </div>
        </div>
      )}

      {/* Estadísticas por dominio */}
      <div className="dominios-stats">
        <h3>Cocientes de Desarrollo por Dominio (Situación Actual)</h3>
        <div className="dominios-grid">
          {Object.values(analisis.estadisticas_por_dominio).map(dominio => {
            const cociente = dominio.cociente_desarrollo;
            return (
              <div key={dominio.dominio_id} className="dominio-stat-card">
                <h4>{dominio.dominio_nombre}</h4>
                <div className="dominio-metrics">
                  <div className="metric">
                    <span className="metric-label">Edad Desarrollo:</span>
                    <span className="metric-value">{dominio.edad_desarrollo.toFixed(1)} m</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Cociente:</span>
                    <span className={`metric-value ${cociente > 100 ? 'adelanto' : cociente < 85 ? 'retraso' : 'normal'}`}>
                      {cociente.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Hitos evaluados:</span>
                    <span className="metric-value">{dominio.total_hitos}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota metodológica */}
      <div className="informacion-adicional" style={{marginTop: '2rem'}}>
        <h3>ℹ️ Metodología de Cálculo</h3>
        <div className="info-box">
          <p>
            <strong>Edad de Desarrollo (ED):</strong> Se calcula como el promedio de las edades medias normativas 
            de todos los hitos conseguidos en cada dominio. Es una medida del nivel funcional alcanzado.
          </p>
          <p>
            <strong>Cociente de Desarrollo (CD):</strong> CD = (ED / Edad Cronológica) × 100. 
            Este índice permite comparar el nivel de desarrollo con la edad real del niño de forma normalizada.
          </p>
          <p>
            <strong>Edad de Desarrollo Global:</strong> Promedio de las edades de desarrollo de todos los dominios evaluados.
          </p>
          <p>
            <strong>Velocidad de Desarrollo:</strong> Se calcula como la derivada del cociente de desarrollo respecto al tiempo: 
            V = ΔCD / Δt. Representa la tasa de cambio del desarrollo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ItinerarioDesarrollo;
