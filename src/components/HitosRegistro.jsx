import React, { useState, useEffect } from 'react';
import { calcularEdadCronologicaMeses, calcularEdadCorregidaMeses, formatearEdades } from '../utils/ageCalculations';
import { API_URL } from '../config';
import { obtenerVideoHito } from '../utils/videosHitos';

function HitosRegistro({ ninoId }) {
  const [dominios, setDominios] = useState([]);
  const [hitosNormativos, setHitosNormativos] = useState([]);
  const [hitosConseguidos, setHitosConseguidos] = useState([]);
  const [hitosNoAlcanzados, setHitosNoAlcanzados] = useState([]);
  const [dominioSeleccionado, setDominioSeleccionado] = useState(null);
  const [edadActualMeses, setEdadActualMeses] = useState(0);
  const [edadCorregidaMeses, setEdadCorregidaMeses] = useState(0);
  const [ninoData, setNinoData] = useState(null);
  const [fuentesNormativas, setFuentesNormativas] = useState([]);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(1);

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
      const [domRes, hitosNormRes, hitosConsRes, hitosNoAlcRes, ninoRes] = await Promise.all([
        fetch(`${API_URL}/dominios`),
        fetch(`${API_URL}/hitos-normativos${fuenteParam}`),
        fetch(`${API_URL}/hitos-conseguidos/${ninoId}`),
        fetch(`${API_URL}/hitos-no-alcanzados/${ninoId}`),
        fetch(`${API_URL}/ninos/${ninoId}`)
      ]);

      const domData = await domRes.json();
      const hitosNormData = await hitosNormRes.json();
      const hitosConsData = await hitosConsRes.json();
      const hitosNoAlcData = await hitosNoAlcRes.json();
      const ninoData = await ninoRes.json();

      setDominios(domData);
      setHitosNormativos(hitosNormData);
      setHitosConseguidos(hitosConsData);
      setHitosNoAlcanzados(hitosNoAlcData);
      setNinoData(ninoData);

      // Calcular edad cronológica y corregida
      const edadCronologica = calcularEdadCronologicaMeses(ninoData.fecha_nacimiento);
      const edadCorregida = calcularEdadCorregidaMeses(ninoData.fecha_nacimiento, ninoData.semanas_gestacion);
      
      setEdadActualMeses(edadCronologica);
      setEdadCorregidaMeses(edadCorregida);

      // Por defecto mostrar todos los dominios (null significa todos)
      if (dominioSeleccionado === null) {
        setDominioSeleccionado(null);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const registrarHito = async (hitoId, edadMeses) => {
    // Validar que la edad no sea mayor que la edad actual
    if (edadMeses > edadActualMeses) {
      const confirmar = confirm(
        `⚠️ ADVERTENCIA: La edad introducida (${edadMeses} meses) es mayor que la edad actual del niño (${Math.round(edadActualMeses)} meses).\n\n` +
        `Este hito no aparecerá en las gráficas hasta que el niño alcance esa edad.\n\n` +
        `¿Deseas continuar de todas formas?`
      );
      if (!confirmar) {
        return;
      }
    }
    
    try {
      await fetch(`${API_URL}/hitos-conseguidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          hito_id: hitoId,
          edad_conseguido_meses: edadMeses,
          fecha_registro: new Date().toISOString().split('T')[0]
        })
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar hito:', error);
    }
  };

  const eliminarHito = async (hitoConseguidoId) => {
    try {
      await fetch(`${API_URL}/hitos-conseguidos/${hitoConseguidoId}`, {
        method: 'DELETE'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar hito:', error);
    }
  };

  const registrarHitoNoAlcanzado = async (hitoId, notas = '') => {
    try {
      await fetch(`${API_URL}/hitos-no-alcanzados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          hito_id: hitoId,
          edad_evaluacion_meses: edadActualMeses,
          fecha_registro: new Date().toISOString(),
          notas
        })
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar hito no alcanzado:', error);
    }
  };

  const eliminarHitoNoAlcanzado = async (hitoNoAlcanzadoId) => {
    try {
      await fetch(`${API_URL}/hitos-no-alcanzados/${hitoNoAlcanzadoId}`, {
        method: 'DELETE'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar hito no alcanzado:', error);
    }
  };

  const hitoConseguido = (hitoId) => {
    return hitosConseguidos.find(hc => hc.hito_id === hitoId);
  };

  const hitoNoAlcanzado = (hitoId) => {
    return hitosNoAlcanzados.find(hna => hna.hito_id === hitoId);
  };

  // Filtrar hitos relevantes: usar edad corregida para niños pretérmino
  const edadParaEvaluacion = ninoData && ninoData.semanas_gestacion < 37 ? edadCorregidaMeses : edadActualMeses;
  
  const esHitoRelevante = (hito) => {
    // Si el hito está conseguido o no alcanzado, siempre es relevante
    if (hitoConseguido(hito.id) || hitoNoAlcanzado(hito.id)) {
      return true;
    }
    
    // Mostrar todos los hitos cuya edad media sea menor o igual a la edad actual del niño
    // Estos son los hitos que ya deberían haber sido alcanzados o estar en proceso
    return hito.edad_media_meses <= edadParaEvaluacion;
  };

  const hitosFiltrados = hitosNormativos.filter(hito => {
    if (dominioSeleccionado && hito.dominio_id !== dominioSeleccionado) {
      return false;
    }
    
    // Si está conseguido, no mostrarlo en la lista de pendientes
    if (hitoConseguido(hito.id)) {
      return false;
    }
    
    // No mostrar hitos ya marcados como no alcanzados en la lista principal
    if (hitoNoAlcanzado(hito.id)) {
      return false;
    }
    
    // Aplicar filtro de relevancia por edad
    return esHitoRelevante(hito);
  }).sort((a, b) => a.edad_media_meses - b.edad_media_meses); // Ordenar por edad media ascendente

  // Hitos marcados como no alcanzados (para mostrar al final)
  const hitosNoAlcanzadosFiltrados = hitosNormativos.filter(hito => {
    if (dominioSeleccionado && hito.dominio_id !== dominioSeleccionado) {
      return false;
    }
    return hitoNoAlcanzado(hito.id) !== undefined;
  }).sort((a, b) => {
    const regA = hitoNoAlcanzado(a.id);
    const regB = hitoNoAlcanzado(b.id);
    return new Date(regB.fecha_registro) - new Date(regA.fecha_registro);
  });

  return (
    <div className="hitos-registro">
      <h2>Registro de Hitos del Desarrollo</h2>
      
      <div className="filtros">
        <div className="filtro-grupo">
          <label>Dominio:</label>
          <select 
            value={dominioSeleccionado || ''} 
            onChange={(e) => setDominioSeleccionado(Number(e.target.value))}
          >
            <option value="">Todos los dominios</option>
            {dominios.map(dom => (
              <option key={dom.id} value={dom.id}>{dom.nombre}</option>
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
      </div>

      <div className="estadisticas">
        <div className="stat-card">
          <span className="stat-number">{hitosConseguidos.length}</span>
          <span className="stat-label">Hitos conseguidos</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{hitosNoAlcanzados.length}</span>
          <span className="stat-label">No alcanzados (en revisión)</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Math.round(edadActualMeses)}</span>
          <span className="stat-label">Edad cronológica (meses)</span>
        </div>
        {ninoData && ninoData.semanas_gestacion < 37 && (
          <div className="stat-card stat-card-destacado">
            <span className="stat-number">{Math.round(edadCorregidaMeses * 10) / 10}</span>
            <span className="stat-label">Edad corregida (meses)</span>
          </div>
        )}
        <div className="stat-card">
          <span className="stat-number">{hitosFiltrados.length}</span>
          <span className="stat-label">Pendientes de evaluación</span>
        </div>
      </div>

      <div className="chart-note" style={{marginBottom: '1.5rem'}}>
        <p><strong>ℹ️ Hitos pendientes de evaluación:</strong> Se muestran todos los hitos cuya edad esperada es menor o igual a la edad actual del niño ({Math.round(edadParaEvaluacion)} meses{ninoData && ninoData.semanas_gestacion < 37 ? ' - edad corregida' : ''}). Estos son los hitos que ya deberían haber sido alcanzados o estar en proceso de desarrollo.</p>
      </div>

      <h3>Hitos Pendientes de Evaluación</h3>
      <div className="hitos-lista">
        {hitosFiltrados.map(hito => {
          const conseguido = hitoConseguido(hito.id);
          const zScore = conseguido ? 
            (hito.edad_media_meses - conseguido.edad_conseguido_meses) / hito.desviacion_estandar : 
            null;

          return (
            <div 
              key={hito.id} 
              className={`hito-card ${conseguido ? 'conseguido' : ''}`}
            >
              <div className="hito-header">
                <h4>{hito.nombre}</h4>
                <span className="dominio-badge">{hito.dominio_nombre}</span>
              </div>
              
              <p className="hito-descripcion">{hito.descripcion}</p>
              
              {/* Enlaces a videos educativos */}
              {(() => {
                const video = obtenerVideoHito(hito.nombre);
                if (video) {
                  return (
                    <div className="hito-videos" style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      marginTop: '8px',
                      marginBottom: '8px'
                    }}>
                      {video.cdc && (
                        <a 
                          href={video.cdc} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 8px',
                            backgroundColor: '#f0f8ff',
                            border: '1px solid #4A90E2',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            color: '#4A90E2',
                            fontSize: '0.85em',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#4A90E2';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                            e.currentTarget.style.color = '#4A90E2';
                          }}
                        >
                          <span>🎥</span>
                          <span>Video CDC</span>
                        </a>
                      )}
                      {video.pathways && (
                        <a 
                          href={video.pathways} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 8px',
                            backgroundColor: '#f0fff4',
                            border: '1px solid #50C878',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            color: '#50C878',
                            fontSize: '0.85em',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#50C878';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0fff4';
                            e.currentTarget.style.color = '#50C878';
                          }}
                        >
                          <span>🎥</span>
                          <span>Video Pathways</span>
                        </a>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="hito-info">
                <span>Edad esperada: {hito.edad_media_meses} meses (± {hito.desviacion_estandar})</span>
                <span>Rango: {hito.edad_minima_meses}-{hito.edad_maxima_meses} meses</span>
              </div>

              {conseguido ? (
                <div className="hito-conseguido-info">
                  <div className="conseguido-detalles">
                    <span>✓ Conseguido a los {conseguido.edad_conseguido_meses} meses</span>
                    <span className={`z-score ${zScore < -2 ? 'retraso' : zScore > 2 ? 'adelanto' : 'normal'}`}>
                      Z-score: {zScore.toFixed(2)}
                    </span>
                  </div>
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarHito(conseguido.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div className="hito-acciones">
                  <button 
                    className="btn-registrar"
                    onClick={() => {
                      const edad = prompt('¿A qué edad (en meses) se consiguió este hito?', Math.round(edadActualMeses));
                      if (edad) {
                        registrarHito(hito.id, parseFloat(edad));
                      }
                    }}
                  >
                    ✓ Conseguido
                  </button>
                  <button 
                    className="btn-no-alcanzado"
                    onClick={() => {
                      if (confirm(`¿Marcar "${hito.nombre}" como no alcanzado aún? (Edad actual: ${Math.round(edadActualMeses)} meses)`)) {
                        registrarHitoNoAlcanzado(hito.id);
                      }
                    }}
                  >
                    ✗ No alcanzado
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sección de hitos no alcanzados */}
      {hitosNoAlcanzadosFiltrados.length > 0 && (
        <>
          <h3 style={{ marginTop: '40px' }}>Hitos No Alcanzados (Para Revisión Posterior)</h3>
          <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '20px' }}>
            Estos hitos fueron evaluados y no se habían alcanzado en ese momento. 
            Puedes revisarlos más adelante conforme el niño crece.
          </p>
          <div className="hitos-lista hitos-no-alcanzados">
            {hitosNoAlcanzadosFiltrados.map(hito => {
              const registro = hitoNoAlcanzado(hito.id);
              const fechaRegistro = new Date(registro.fecha_registro);
              const edadEvaluacion = registro.edad_evaluacion_meses;

              return (
                <div 
                  key={hito.id} 
                  className="hito-card no-alcanzado"
                >
                  <div className="hito-header">
                    <h4>{hito.nombre}</h4>
                    <span className="dominio-badge">{hito.dominio_nombre}</span>
                  </div>
                  
                  <p className="hito-descripcion">{hito.descripcion}</p>
                  
                  {/* Enlaces a videos educativos */}
                  {(() => {
                    const video = obtenerVideoHito(hito.nombre);
                    if (video) {
                      return (
                        <div className="hito-videos" style={{ 
                          display: 'flex', 
                          gap: '10px', 
                          marginTop: '8px',
                          marginBottom: '8px'
                        }}>
                          {video.cdc && (
                            <a 
                              href={video.cdc} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 8px',
                                backgroundColor: '#f0f8ff',
                                border: '1px solid #4A90E2',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                color: '#4A90E2',
                                fontSize: '0.85em',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#4A90E2';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f8ff';
                                e.currentTarget.style.color = '#4A90E2';
                              }}
                            >
                              <span>🎥</span>
                              <span>Video CDC</span>
                            </a>
                          )}
                          {video.pathways && (
                            <a 
                              href={video.pathways} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 8px',
                                backgroundColor: '#f0fff4',
                                border: '1px solid #50C878',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                color: '#50C878',
                                fontSize: '0.85em',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#50C878';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0fff4';
                                e.currentTarget.style.color = '#50C878';
                              }}
                            >
                              <span>🎥</span>
                              <span>Video Pathways</span>
                            </a>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div className="hito-info">
                    <span>Edad esperada: {hito.edad_media_meses} meses (± {hito.desviacion_estandar})</span>
                    <span>Evaluado a los: {Math.round(edadEvaluacion)} meses</span>
                    <span>Fecha evaluación: {fechaRegistro.toLocaleDateString()}</span>
                  </div>

                  <div className="hito-acciones">
                    <button 
                      className="btn-registrar"
                      onClick={() => {
                        const edad = prompt('¿A qué edad (en meses) se consiguió este hito?', Math.round(edadActualMeses));
                        if (edad) {
                          registrarHito(hito.id, parseFloat(edad));
                          eliminarHitoNoAlcanzado(registro.id);
                        }
                      }}
                    >
                      ✓ Ahora conseguido
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => {
                        if (confirm('¿Volver a evaluar este hito? (Se eliminará del registro de no alcanzados)')) {
                          eliminarHitoNoAlcanzado(registro.id);
                        }
                      }}
                    >
                      Volver a evaluar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default HitosRegistro;
