import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { fetchConAuth } from '../utils/authService';
import './EscalasRegistro.css';

// Definición de escalas de desarrollo con sus características
const ESCALAS_DESARROLLO = {
  battelle: {
    nombre: 'Battelle (Inventario de Desarrollo)',
    rango_edad: '0-95 meses',
    puntuacion_tipificada: 'Puntuación típica (Media=100, DE=15)',
    rango_puntuacion: { min: 40, max: 160, media: 100, de: 15 },
    dominios: [
      { id: 'personal_social', nombre: 'Personal/Social' },
      { id: 'adaptativa', nombre: 'Adaptativa' },
      { id: 'motora', nombre: 'Motora' },
      { id: 'comunicacion', nombre: 'Comunicación' },
      { id: 'cognitiva', nombre: 'Cognitiva' },
      { id: 'total', nombre: 'Cociente de Desarrollo Total' }
    ]
  },
  brunet_lezine: {
    nombre: 'Brunet-Lézine Revisado',
    rango_edad: '0-30 meses',
    puntuacion_tipificada: 'Cociente de Desarrollo (Media=100, DE=15)',
    rango_puntuacion: { min: 40, max: 160, media: 100, de: 15 },
    dominios: [
      { id: 'postural', nombre: 'Control Postural' },
      { id: 'coordinacion', nombre: 'Coordinación Óculo-Manual' },
      { id: 'lenguaje', nombre: 'Lenguaje' },
      { id: 'sociabilidad', nombre: 'Relaciones Sociales' },
      { id: 'total', nombre: 'Cociente de Desarrollo Total' }
    ]
  },
  bayley_iii: {
    nombre: 'Bayley-III (Escalas Bayley de Desarrollo Infantil)',
    rango_edad: '1-42 meses',
    puntuacion_tipificada: 'Puntuación compuesta (Media=100, DE=15)',
    rango_puntuacion: { min: 40, max: 160, media: 100, de: 15 },
    dominios: [
      { id: 'cognitiva', nombre: 'Cognitiva' },
      { id: 'lenguaje_receptivo', nombre: 'Lenguaje Receptivo' },
      { id: 'lenguaje_expresivo', nombre: 'Lenguaje Expresivo' },
      { id: 'lenguaje_total', nombre: 'Lenguaje Total' },
      { id: 'motora_fina', nombre: 'Motora Fina' },
      { id: 'motora_gruesa', nombre: 'Motora Gruesa' }
    ]
  },
  mccarthy: {
    nombre: 'McCarthy (MSCA)',
    rango_edad: '30-102 meses',
    puntuacion_tipificada: 'Índice General Cognitivo (Media=100, DE=16)',
    rango_puntuacion: { min: 40, max: 160, media: 100, de: 16 },
    dominios: [
      { id: 'verbal', nombre: 'Escala Verbal' },
      { id: 'perceptivo_manipulativa', nombre: 'Escala Perceptivo-Manipulativa' },
      { id: 'numerica', nombre: 'Escala Numérica' },
      { id: 'memoria', nombre: 'Memoria' },
      { id: 'motora', nombre: 'Motora' },
      { id: 'igc', nombre: 'Índice General Cognitivo (IGC)' }
    ]
  },
  wppsi_iv: {
    nombre: 'WPPSI-IV (Escala Wechsler Preescolar)',
    rango_edad: '30-90 meses',
    puntuacion_tipificada: 'CI Total (Media=100, DE=15)',
    rango_puntuacion: { min: 40, max: 160, media: 100, de: 15 },
    dominios: [
      { id: 'comprension_verbal', nombre: 'Comprensión Verbal' },
      { id: 'visoespacial', nombre: 'Visoespacial' },
      { id: 'razonamiento_fluido', nombre: 'Razonamiento Fluido' },
      { id: 'memoria_trabajo', nombre: 'Memoria de Trabajo' },
      { id: 'velocidad_procesamiento', nombre: 'Velocidad de Procesamiento' },
      { id: 'ci_total', nombre: 'CI Total' }
    ]
  },
  merrill_palmer_r: {
    nombre: 'Merrill-Palmer-R',
    rango_edad: '1-78 meses',
    puntuacion_tipificada: 'Índice de Desarrollo (Media=100, DE=15)',
    rango_puntuacion: { min: 40, max: 160, media: 100, de: 15 },
    dominios: [
      { id: 'cognitiva', nombre: 'Cognitiva' },
      { id: 'lenguaje_comunicacion', nombre: 'Lenguaje y Comunicación' },
      { id: 'motora', nombre: 'Motora' },
      { id: 'socio_emocional', nombre: 'Socio-Emocional' },
      { id: 'conducta_adaptativa', nombre: 'Conducta Adaptativa' },
      { id: 'total', nombre: 'Índice de Desarrollo Total' }
    ]
  }
};

function EscalasRegistro({ ninoId }) {
  const [nino, setNino] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [escalaSeleccionada, setEscalaSeleccionada] = useState('');
  const [fechaEvaluacion, setFechaEvaluacion] = useState(new Date().toISOString().split('T')[0]);
  const [edadEvaluacionMeses, setEdadEvaluacionMeses] = useState('');
  const [puntuaciones, setPuntuaciones] = useState({});
  const [notas, setNotas] = useState('');
  const [profesionalEvaluador, setProfesionalEvaluador] = useState('');
  const [centroEvaluacion, setCentroEvaluacion] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [ninoId]);

  useEffect(() => {
    if (nino && fechaEvaluacion) {
      calcularEdadEvaluacion();
    }
  }, [fechaEvaluacion, nino]);

  useEffect(() => {
    // Reiniciar puntuaciones cuando cambia la escala
    if (escalaSeleccionada) {
      const escala = ESCALAS_DESARROLLO[escalaSeleccionada];
      const nuevasPuntuaciones = {};
      escala.dominios.forEach(dom => {
        nuevasPuntuaciones[dom.id] = '';
      });
      setPuntuaciones(nuevasPuntuaciones);
    }
  }, [escalaSeleccionada]);

  const cargarDatos = async () => {
    try {
      const [ninoRes, evaluacionesRes] = await Promise.all([
        fetchConAuth(`${API_URL}/ninos/${ninoId}`),
        fetchConAuth(`${API_URL}/escalas-evaluaciones/${ninoId}`)
      ]);

      const ninoData = await ninoRes.json();
      const evaluacionesData = await evaluacionesRes.json();

      setNino(ninoData);
      setEvaluaciones(Array.isArray(evaluacionesData) ? evaluacionesData : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const calcularEdadEvaluacion = () => {
    if (!nino || !fechaEvaluacion) return;
    
    const fechaNac = new Date(nino.fecha_nacimiento);
    const fechaEval = new Date(fechaEvaluacion);
    
    const diffTime = fechaEval - fechaNac;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const edadMeses = Math.round(diffDays / 30.44);
    
    setEdadEvaluacionMeses(edadMeses);
  };

  const handlePuntuacionChange = (dominioId, valor) => {
    setPuntuaciones(prev => ({
      ...prev,
      [dominioId]: valor
    }));
  };

  const validarPuntuacion = (valor, escala) => {
    const num = parseFloat(valor);
    if (isNaN(num)) return false;
    return num >= escala.rango_puntuacion.min && num <= escala.rango_puntuacion.max;
  };

  const calcularZScore = (puntuacion, media, de) => {
    return ((puntuacion - media) / de).toFixed(2);
  };

  const interpretarZScore = (zScore) => {
    const z = parseFloat(zScore);
    if (z < -3) return { nivel: 'Muy por debajo', color: '#d32f2f', emoji: '⚠️⚠️⚠️' };
    if (z < -2) return { nivel: 'Significativamente por debajo', color: '#f44336', emoji: '⚠️⚠️' };
    if (z < -1) return { nivel: 'Por debajo del promedio', color: '#ff9800', emoji: '⚠️' };
    if (z < 1) return { nivel: 'Dentro del promedio', color: '#4caf50', emoji: '✅' };
    if (z < 2) return { nivel: 'Por encima del promedio', color: '#2196f3', emoji: '🌟' };
    if (z < 3) return { nivel: 'Significativamente por encima', color: '#9c27b0', emoji: '🌟🌟' };
    return { nivel: 'Muy por encima', color: '#673ab7', emoji: '🌟🌟🌟' };
  };

  const guardarEvaluacion = async () => {
    if (!escalaSeleccionada) {
      alert('Por favor seleccione una escala');
      return;
    }

    const escala = ESCALAS_DESARROLLO[escalaSeleccionada];
    
    // Validar que al menos haya una puntuación
    const hayPuntuaciones = Object.values(puntuaciones).some(p => p !== '');
    if (!hayPuntuaciones) {
      alert('Por favor ingrese al menos una puntuación');
      return;
    }

    // Validar todas las puntuaciones ingresadas
    for (const [dominioId, valor] of Object.entries(puntuaciones)) {
      if (valor !== '' && !validarPuntuacion(valor, escala)) {
        alert(`La puntuación para ${dominioId} está fuera del rango válido (${escala.rango_puntuacion.min}-${escala.rango_puntuacion.max})`);
        return;
      }
    }

    try {
      // Preparar datos con z-scores calculados
      const puntuacionesConZScores = {};
      Object.entries(puntuaciones).forEach(([dominioId, valor]) => {
        if (valor !== '') {
          const puntuacion = parseFloat(valor);
          const zScore = calcularZScore(
            puntuacion, 
            escala.rango_puntuacion.media, 
            escala.rango_puntuacion.de
          );
          puntuacionesConZScores[dominioId] = {
            puntuacion: puntuacion,
            z_score: parseFloat(zScore)
          };
        }
      });

      const datos = {
        nino_id: ninoId,
        escala: escalaSeleccionada,
        fecha_evaluacion: fechaEvaluacion,
        edad_evaluacion_meses: edadEvaluacionMeses,
        puntuaciones: JSON.stringify(puntuacionesConZScores),
        profesional_evaluador: profesionalEvaluador,
        centro_evaluacion: centroEvaluacion,
        notas: notas
      };

      await fetchConAuth(`${API_URL}/escalas-evaluaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      alert('Evaluación guardada correctamente');
      setMostrarFormulario(false);
      setEscalaSeleccionada('');
      setPuntuaciones({});
      setNotas('');
      setProfesionalEvaluador('');
      setCentroEvaluacion('');
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar evaluación:', error);
      alert('Error al guardar la evaluación');
    }
  };

  const eliminarEvaluacion = async (evaluacionId) => {
    if (!window.confirm('¿Está seguro de eliminar esta evaluación?')) return;

    try {
      await fetchConAuth(`${API_URL}/escalas-evaluaciones/${evaluacionId}`, {
        method: 'DELETE'
      });
      alert('Evaluación eliminada correctamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      alert('Error al eliminar la evaluación');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!nino) {
    return <div>Cargando...</div>;
  }

  const escalaActual = escalaSeleccionada ? ESCALAS_DESARROLLO[escalaSeleccionada] : null;

  return (
    <div className="escalas-registro-container">
      <div className="escalas-header">
        <h2>📋 Registro de Evaluaciones con Escalas Estandarizadas</h2>
        <p className="escalas-descripcion">
          Registre los resultados de evaluaciones realizadas con escalas estandarizadas de desarrollo.
          Las puntuaciones se convertirán automáticamente a Z-scores para su análisis.
        </p>
      </div>

      {!mostrarFormulario ? (
        <div className="nueva-evaluacion-section">
          <button 
            className="btn-nueva-evaluacion"
            onClick={() => setMostrarFormulario(true)}
          >
            ➕ Nueva Evaluación
          </button>
        </div>
      ) : (
        <div className="formulario-evaluacion">
          <h3>Nueva Evaluación</h3>
          
          <div className="form-group">
            <label>Seleccione la escala de desarrollo:</label>
            <select 
              value={escalaSeleccionada}
              onChange={(e) => setEscalaSeleccionada(e.target.value)}
              className="form-control"
            >
              <option value="">-- Seleccione una escala --</option>
              {Object.entries(ESCALAS_DESARROLLO).map(([key, escala]) => (
                <option key={key} value={key}>
                  {escala.nombre} ({escala.rango_edad})
                </option>
              ))}
            </select>
          </div>

          {escalaActual && (
            <>
              <div className="info-escala">
                <h4>{escalaActual.nombre}</h4>
                <p><strong>Rango de edad:</strong> {escalaActual.rango_edad}</p>
                <p><strong>Puntuación tipificada:</strong> {escalaActual.puntuacion_tipificada}</p>
                <p><strong>Rango válido:</strong> {escalaActual.rango_puntuacion.min} - {escalaActual.rango_puntuacion.max}</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de evaluación:</label>
                  <input 
                    type="date"
                    value={fechaEvaluacion}
                    onChange={(e) => setFechaEvaluacion(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Edad en evaluación:</label>
                  <input 
                    type="text"
                    value={edadEvaluacionMeses ? `${edadEvaluacionMeses} meses` : ''}
                    disabled
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Profesional evaluador (opcional):</label>
                  <input 
                    type="text"
                    value={profesionalEvaluador}
                    onChange={(e) => setProfesionalEvaluador(e.target.value)}
                    placeholder="Ej: Dra. María García"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Centro de evaluación (opcional):</label>
                  <input 
                    type="text"
                    value={centroEvaluacion}
                    onChange={(e) => setCentroEvaluacion(e.target.value)}
                    placeholder="Ej: Centro de Atención Temprana"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="puntuaciones-section">
                <h4>Puntuaciones por dominio:</h4>
                <p className="puntuaciones-ayuda">
                  Ingrese las puntuaciones obtenidas. Puede dejar en blanco los dominios no evaluados.
                </p>
                
                {escalaActual.dominios.map(dominio => (
                  <div key={dominio.id} className="puntuacion-item">
                    <label>{dominio.nombre}:</label>
                    <div className="puntuacion-input-group">
                      <input 
                        type="number"
                        value={puntuaciones[dominio.id] || ''}
                        onChange={(e) => handlePuntuacionChange(dominio.id, e.target.value)}
                        placeholder={`${escalaActual.rango_puntuacion.min}-${escalaActual.rango_puntuacion.max}`}
                        min={escalaActual.rango_puntuacion.min}
                        max={escalaActual.rango_puntuacion.max}
                        className="form-control puntuacion-input"
                      />
                      {puntuaciones[dominio.id] && validarPuntuacion(puntuaciones[dominio.id], escalaActual) && (
                        <div className="puntuacion-interpretacion">
                          {(() => {
                            const zScore = calcularZScore(
                              parseFloat(puntuaciones[dominio.id]),
                              escalaActual.rango_puntuacion.media,
                              escalaActual.rango_puntuacion.de
                            );
                            const interpretacion = interpretarZScore(zScore);
                            return (
                              <span style={{ color: interpretacion.color }}>
                                {interpretacion.emoji} Z = {zScore} ({interpretacion.nivel})
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Notas adicionales (opcional):</label>
                <textarea 
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Observaciones, comportamiento durante la evaluación, condiciones especiales..."
                  rows="4"
                  className="form-control"
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn-guardar"
                  onClick={guardarEvaluacion}
                >
                  💾 Guardar Evaluación
                </button>
                <button 
                  className="btn-cancelar"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEscalaSeleccionada('');
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="evaluaciones-registradas">
        <h3>Evaluaciones Registradas ({evaluaciones.length})</h3>
        
        {evaluaciones.length === 0 ? (
          <div className="sin-evaluaciones">
            <p>No hay evaluaciones registradas aún.</p>
            <p>Haga clic en "Nueva Evaluación" para comenzar.</p>
          </div>
        ) : (
          <div className="evaluaciones-lista">
            {evaluaciones.map(evaluacion => {
              const escala = ESCALAS_DESARROLLO[evaluacion.escala];
              const puntuacionesData = JSON.parse(evaluacion.puntuaciones);
              
              return (
                <div key={evaluacion.id} className="evaluacion-card">
                  <div className="evaluacion-header">
                    <h4>{escala.nombre}</h4>
                    <button 
                      className="btn-eliminar-small"
                      onClick={() => eliminarEvaluacion(evaluacion.id)}
                      title="Eliminar evaluación"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="evaluacion-info">
                    <p><strong>Fecha:</strong> {formatearFecha(evaluacion.fecha_evaluacion)}</p>
                    <p><strong>Edad:</strong> {evaluacion.edad_evaluacion_meses} meses</p>
                    {evaluacion.profesional_evaluador && (
                      <p><strong>Evaluador:</strong> {evaluacion.profesional_evaluador}</p>
                    )}
                    {evaluacion.centro_evaluacion && (
                      <p><strong>Centro:</strong> {evaluacion.centro_evaluacion}</p>
                    )}
                  </div>

                  <div className="evaluacion-puntuaciones">
                    <h5>Puntuaciones:</h5>
                    <div className="puntuaciones-grid">
                      {Object.entries(puntuacionesData).map(([dominioId, datos]) => {
                        const dominio = escala.dominios.find(d => d.id === dominioId);
                        const interpretacion = interpretarZScore(datos.z_score);
                        
                        return (
                          <div key={dominioId} className="puntuacion-resultado">
                            <span className="dominio-nombre">{dominio?.nombre}:</span>
                            <span className="puntuacion-valor">{datos.puntuacion}</span>
                            <span 
                              className="puntuacion-z"
                              style={{ color: interpretacion.color }}
                            >
                              (Z = {datos.z_score.toFixed(2)}) {interpretacion.emoji}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {evaluacion.notas && (
                    <div className="evaluacion-notas">
                      <h5>Notas:</h5>
                      <p>{evaluacion.notas}</p>
                    </div>
                  )}

                  <div className="evaluacion-footer">
                    <small>Registrado el {formatearFecha(evaluacion.fecha_registro)}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="escalas-info-adicional">
        <h3>ℹ️ Información sobre las escalas</h3>
        <div className="info-cards">
          {Object.entries(ESCALAS_DESARROLLO).map(([key, escala]) => (
            <div key={key} className="info-card">
              <h4>{escala.nombre}</h4>
              <p><strong>Edad:</strong> {escala.rango_edad}</p>
              <p><strong>Puntuación:</strong> {escala.puntuacion_tipificada}</p>
              <p><strong>Dominios evaluados:</strong> {escala.dominios.length}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EscalasRegistro;
