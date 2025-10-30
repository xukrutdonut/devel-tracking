import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8001/api';

function FuentesNormativasInfo({ onClose, fuenteIdInicial = null }) {
  const [fuentes, setFuentes] = useState([]);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarFuentes();
  }, []);

  useEffect(() => {
    if (fuentes.length > 0 && fuenteIdInicial) {
      const fuente = fuentes.find(f => f.id === fuenteIdInicial);
      if (fuente) setFuenteSeleccionada(fuente);
    }
  }, [fuentes, fuenteIdInicial]);

  const cargarFuentes = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/fuentes-normativas-detalle`);
      const data = await response.json();
      setFuentes(data);
      if (data.length > 0 && !fuenteSeleccionada) {
        setFuenteSeleccionada(data[0]);
      }
    } catch (error) {
      console.error('Error al cargar fuentes normativas:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content fuentes-info-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Cargando información...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fuentes-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ℹ️ Información sobre Fuentes Normativas</h2>
          <button className="btn-close" onClick={onClose} title="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          {/* Tabs de fuentes */}
          <div className="fuentes-tabs">
            {fuentes.map(fuente => (
              <button
                key={fuente.id}
                className={`fuente-tab ${fuenteSeleccionada?.id === fuente.id ? 'active' : ''}`}
                onClick={() => setFuenteSeleccionada(fuente)}
              >
                <strong>{fuente.nombre_corto || fuente.nombre}</strong>
                <small>{fuente.año}</small>
              </button>
            ))}
          </div>

          {/* Contenido de la fuente seleccionada */}
          {fuenteSeleccionada && (
            <div className="fuente-detalle">
              {/* Información básica */}
              <div className="info-section">
                <h3>{fuenteSeleccionada.nombre}</h3>
                <div className="info-badges">
                  <span className="badge badge-tipo">{fuenteSeleccionada.tipo}</span>
                  <span className="badge badge-año">{fuenteSeleccionada.año}</span>
                  <span className="badge badge-hitos">{fuenteSeleccionada.total_hitos} hitos</span>
                  <span className="badge badge-dominios">{fuenteSeleccionada.total_dominios} dominios</span>
                </div>
                <p className="descripcion">{fuenteSeleccionada.descripcion}</p>
              </div>

              {/* Dominios cubiertos */}
              <div className="info-section">
                <h4>📋 Dominios del Desarrollo Cubiertos</h4>
                <div className="dominios-grid-info">
                  {fuenteSeleccionada.dominios_cubiertos.map(dominio => (
                    <div key={dominio.id} className="dominio-info-card">
                      <div className="dominio-nombre">{dominio.nombre}</div>
                      <div className="dominio-hitos">{dominio.num_hitos} hitos</div>
                    </div>
                  ))}
                </div>
                <div className="cobertura-nota">
                  <strong>Cobertura:</strong> {fuenteSeleccionada.cobertura_dominios}
                </div>
              </div>

              {/* Características psicométricas */}
              <div className="info-section">
                <h4>🔬 Características Psicométricas y Metodológicas</h4>
                
                <div className="caracteristica">
                  <strong>Metodología:</strong>
                  <p>{fuenteSeleccionada.metodologia}</p>
                </div>

                <div className="caracteristica">
                  <strong>Población de referencia:</strong>
                  <p>{fuenteSeleccionada.poblacion}</p>
                </div>

                <div className="caracteristica">
                  <strong>Validación:</strong>
                  <p>{fuenteSeleccionada.validacion}</p>
                </div>

                <div className="caracteristica">
                  <strong>Rango de edad:</strong>
                  <p>{fuenteSeleccionada.edad_rango}</p>
                </div>
              </div>

              {/* Fortalezas */}
              <div className="info-section">
                <h4>✅ Fortalezas</h4>
                <ul className="lista-items">
                  {fuenteSeleccionada.fortalezas?.map((fortaleza, idx) => (
                    <li key={idx}>{fortaleza}</li>
                  ))}
                </ul>
              </div>

              {/* Limitaciones */}
              <div className="info-section">
                <h4>⚠️ Limitaciones</h4>
                <ul className="lista-items">
                  {fuenteSeleccionada.limitaciones?.map((limitacion, idx) => (
                    <li key={idx}>{limitacion}</li>
                  ))}
                </ul>
              </div>

              {/* Mejor uso */}
              <div className="info-section mejor-uso">
                <h4>🎯 Mejor uso clínico</h4>
                <p><strong>{fuenteSeleccionada.mejor_para}</strong></p>
              </div>

              {/* Referencia bibliográfica y enlace */}
              <div className="info-section referencia-section">
                <h4>📚 Referencia Bibliográfica</h4>
                <div className="referencia-texto-modal">
                  {fuenteSeleccionada.referencia_bibliografica}
                </div>
                {fuenteSeleccionada.url_original && (
                  <a 
                    href={fuenteSeleccionada.url_original} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-link-externo"
                  >
                    🔗 Ir a la fuente original
                  </a>
                )}
              </div>

              {/* Comparación rápida */}
              <div className="info-section comparacion-rapida">
                <h4>📊 Comparación Rápida</h4>
                <table className="tabla-comparacion">
                  <tbody>
                    <tr>
                      <td>Rigor estadístico</td>
                      <td>{getBarraCalidad(fuenteSeleccionada.id, 'rigor')}</td>
                    </tr>
                    <tr>
                      <td>Cobertura de dominios</td>
                      <td>{getBarraCalidad(fuenteSeleccionada.id, 'cobertura')}</td>
                    </tr>
                    <tr>
                      <td>Actualización</td>
                      <td>{getBarraCalidad(fuenteSeleccionada.id, 'actualizacion')}</td>
                    </tr>
                    <tr>
                      <td>Facilidad de uso</td>
                      <td>{getBarraCalidad(fuenteSeleccionada.id, 'facilidad')}</td>
                    </tr>
                    <tr>
                      <td>Aplicabilidad internacional</td>
                      <td>{getBarraCalidad(fuenteSeleccionada.id, 'internacional')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// Helper para barras de calidad
function getBarraCalidad(fuenteId, aspecto) {
  const valores = {
    1: { // CDC
      rigor: 3,
      cobertura: 4,
      actualizacion: 5,
      facilidad: 5,
      internacional: 3
    },
    2: { // OMS
      rigor: 5,
      cobertura: 3,
      actualizacion: 3,
      facilidad: 4,
      internacional: 5
    },
    3: { // Bayley
      rigor: 5,
      cobertura: 5,
      actualizacion: 4,
      facilidad: 2,
      internacional: 3
    },
    4: { // Battelle
      rigor: 4,
      cobertura: 5,
      actualizacion: 3,
      facilidad: 2,
      internacional: 3
    }
  };

  const valor = valores[fuenteId]?.[aspecto] || 0;
  const estrellas = '★'.repeat(valor) + '☆'.repeat(5 - valor);
  
  return <span className="barra-calidad">{estrellas}</span>;
}

export default FuentesNormativasInfo;
