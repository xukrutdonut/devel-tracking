import React, { useState, useEffect } from 'react';
import FuentesNormativasInfo from './FuentesNormativasInfo';

const API_URL = 'http://localhost:8001/api';

function Diagnosticos({ ninoId }) {
  const [diagnostico, setDiagnostico] = useState(null);
  const [umbral, setUmbral] = useState(2.0);
  const [umbralTemporal, setUmbralTemporal] = useState(2.0);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(1);
  const [fuentesNormativas, setFuentesNormativas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarInfoFuentes, setMostrarInfoFuentes] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
    cargarFuentesNormativas();
  }, []);

  useEffect(() => {
    if (umbral && fuenteSeleccionada) {
      cargarDiagnostico();
    }
  }, [ninoId, umbral, fuenteSeleccionada]);

  const cargarConfiguracion = async () => {
    try {
      const response = await fetch(`${API_URL}/configuracion`);
      const data = await response.json();
      setUmbral(data.umbral_diagnostico);
      setUmbralTemporal(data.umbral_diagnostico);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

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

  const cargarDiagnostico = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/diagnostico/${ninoId}?fuente=${fuenteSeleccionada}`);
      const data = await response.json();
      setDiagnostico(data);
    } catch (error) {
      console.error('Error al cargar diagnóstico:', error);
    } finally {
      setCargando(false);
    }
  };

  const actualizarUmbral = async () => {
    try {
      await fetch(`${API_URL}/configuracion/umbral`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ umbral: parseFloat(umbralTemporal) })
      });
      setUmbral(parseFloat(umbralTemporal));
    } catch (error) {
      console.error('Error al actualizar umbral:', error);
      alert('Error al actualizar el umbral');
    }
  };

  const getSeveridadColor = (severidad) => {
    switch (severidad) {
      case 'alta': return '#e74c3c';
      case 'moderada': return '#f39c12';
      case 'leve': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getSeveridadTexto = (severidad) => {
    switch (severidad) {
      case 'alta': return '⚠️ ALTA';
      case 'moderada': return '⚡ MODERADA';
      case 'leve': return 'ℹ️ LEVE';
      default: return 'INFO';
    }
  };

  if (cargando) {
    return <div className="loading">Generando diagnósticos...</div>;
  }

  if (!diagnostico) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="diagnosticos-container">
      <h2>🩺 Diagnósticos Automáticos</h2>

      {/* Configuración */}
      <div className="configuracion-diagnosticos">
        <div className="config-row">
          <div className="config-item">
            <label>Umbral Diagnóstico (Desviaciones Estándar):</label>
            <div className="umbral-control">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="5.0"
                value={umbralTemporal}
                onChange={(e) => setUmbralTemporal(e.target.value)}
              />
              <button 
                onClick={actualizarUmbral}
                className="btn-actualizar"
                disabled={umbralTemporal === umbral.toString()}
              >
                Aplicar
              </button>
            </div>
            <small>Rango: 0.5 - 5.0 DE. Por defecto: 2.0 DE</small>
          </div>

          <div className="config-item">
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
        </div>

        {mostrarInfoFuentes && (
          <FuentesNormativasInfo 
            onClose={() => setMostrarInfoFuentes(false)}
            fuenteIdInicial={fuenteSeleccionada}
          />
        )}

        <div className="info-umbral">
          <p>
            <strong>Criterio actual:</strong> Z-score &lt; -{umbral} DE para considerar retraso en un área.
          </p>
        </div>
      </div>

      {/* Interpretación General */}
      <div className={`interpretacion-general ${diagnostico.diagnosticos.length > 0 ? 'alerta' : 'normal'}`}>
        <h3>{diagnostico.diagnosticos.length > 0 ? '⚠️ Hallazgos Clínicos' : '✅ Evaluación Normal'}</h3>
        <p>{diagnostico.interpretacion_general}</p>
      </div>

      {/* Resumen de dominios */}
      <div className="resumen-dominios">
        <h3>📊 Estado por Dominio del Desarrollo</h3>
        <div className="dominios-cards">
          {Object.values(diagnostico.estadisticas_por_dominio).map(dominio => {
            const enRetraso = dominio.z_score_promedio < -umbral;
            return (
              <div 
                key={dominio.dominio_id} 
                className={`dominio-card-diag ${enRetraso ? 'retraso' : 'normal'}`}
              >
                <h4>{dominio.dominio_nombre}</h4>
                <div className="dominio-zscore">
                  <span className="zscore-valor">
                    Z: {dominio.z_score_promedio.toFixed(2)}
                  </span>
                  <span className={`zscore-estado ${enRetraso ? 'negativo' : 'positivo'}`}>
                    {enRetraso ? '⚠️ Retraso' : '✅ Normal'}
                  </span>
                </div>
                <small>{dominio.total_hitos} hito(s) evaluado(s)</small>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnósticos */}
      {diagnostico.diagnosticos.length > 0 && (
        <div className="diagnosticos-lista">
          <h3>🔍 Diagnósticos Identificados</h3>
          {diagnostico.diagnosticos.map((diag, index) => (
            <div 
              key={index} 
              className="diagnostico-card"
              style={{ borderLeftColor: getSeveridadColor(diag.severidad) }}
            >
              <div className="diagnostico-header">
                <h4>{diag.tipo}</h4>
                <span 
                  className="severidad-badge"
                  style={{ backgroundColor: getSeveridadColor(diag.severidad) }}
                >
                  {getSeveridadTexto(diag.severidad)}
                </span>
              </div>

              <div className="diagnostico-body">
                <div className="diagnostico-section">
                  <strong>Criterio cumplido:</strong>
                  <p>{diag.criterio}</p>
                </div>

                <div className="diagnostico-section">
                  <strong>Áreas afectadas:</strong>
                  <ul>
                    {diag.areas_afectadas.map((area, idx) => (
                      <li key={idx}>{area}</li>
                    ))}
                  </ul>
                </div>

                <div className="diagnostico-section recomendacion">
                  <strong>📋 Recomendación clínica:</strong>
                  <p>{diag.recomendacion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="info-adicional">
        <h3>ℹ️ Información sobre los Criterios Diagnósticos</h3>
        <div className="criterios-info">
          <div className="criterio-info-item">
            <h4>Retraso Global del Desarrollo</h4>
            <p>Se diagnostica cuando <strong>2 o más áreas</strong> muestran un Z-score por debajo del umbral establecido.</p>
          </div>

          <div className="criterio-info-item">
            <h4>Sospecha de PCI o Enfermedad Neuromuscular</h4>
            <p>Se identifica cuando hay <strong>retraso en el área motora</strong> (gruesa o fina).</p>
          </div>

          <div className="criterio-info-item">
            <h4>Retraso Simple del Lenguaje</h4>
            <p>Cuando <strong>solo el área de comunicación</strong> está afectada y las demás áreas son normales.</p>
          </div>

          <div className="criterio-info-item">
            <h4>Sospecha de TEA</h4>
            <p>Cuando el área <strong>social-emocional está 2 DE por debajo</strong> del promedio de las otras áreas (desproporcionado).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Diagnosticos;
