import React, { useState, useEffect, useMemo } from 'react';
import { calcularEdadCronologicaMeses, calcularEdadCorregidaMeses, formatearEdades } from '../utils/ageCalculations';
import { API_URL } from '../config';
import { fetchConAuth } from '../utils/authService';
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
  const [modoEvaluacion, setModoEvaluacion] = useState('puntual'); // 'puntual' o 'longitudinal'
  const [fechaEvaluacion, setFechaEvaluacion] = useState(new Date().toISOString().split('T')[0]);
  const [edadEvaluacionMeses, setEdadEvaluacionMeses] = useState(0);
  const [rangoEdadInferior, setRangoEdadInferior] = useState(0); // Para expandir rango en modo puntual

  useEffect(() => {
    cargarFuentesNormativas();
  }, []);

  useEffect(() => {
    if (fuenteSeleccionada) {
      cargarDatos();
    }
  }, [ninoId, fuenteSeleccionada]);

  useEffect(() => {
    if (ninoData && fechaEvaluacion) {
      calcularEdadEvaluacion();
      setRangoEdadInferior(0); // Resetear rango al cambiar fecha
    }
  }, [fechaEvaluacion, ninoData]);

  useEffect(() => {
    // Resetear rango al cambiar modo
    setRangoEdadInferior(0);
  }, [modoEvaluacion]);

  const cargarFuentesNormativas = async () => {
    try {
      const response = await fetchConAuth(`${API_URL}/fuentes-normativas`);
      const data = await response.json();
      setFuentesNormativas(data);
      if (data.length > 0) {
        setFuenteSeleccionada(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar fuentes normativas:', error);
    }
  };

  const calcularEdadEvaluacion = () => {
    if (!ninoData || !fechaEvaluacion) return;
    
    const fechaNac = new Date(ninoData.fecha_nacimiento);
    const fechaEval = new Date(fechaEvaluacion);
    
    const diffTime = fechaEval - fechaNac;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const edadMeses = diffDays / 30.44; // promedio de días por mes
    
    setEdadEvaluacionMeses(edadMeses);
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
    // En modo longitudinal, no validar que la edad sea menor que la actual
    if (modoEvaluacion === 'puntual') {
      // En modo puntual, validar que la edad no sea mayor que la edad de evaluación
      const edadMaxima = edadEvaluacionMeses || edadActualMeses;
      if (edadMeses > edadMaxima) {
        const confirmar = confirm(
          `⚠️ ADVERTENCIA: La edad introducida (${edadMeses} meses) es mayor que la edad de evaluación (${Math.round(edadMaxima)} meses).\n\n` +
          `Este hito no aparecerá en las gráficas hasta que el niño alcance esa edad.\n\n` +
          `¿Deseas continuar de todas formas?`
        );
        if (!confirmar) {
          return;
        }
      }
    } else {
      // En modo longitudinal, solo advertir si es mayor que la edad actual del niño
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
    }
    
    try {
      await fetchConAuth(`${API_URL}/hitos-conseguidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          hito_id: hitoId,
          edad_conseguido_meses: edadMeses,
          fecha_registro: modoEvaluacion === 'puntual' ? fechaEvaluacion : new Date().toISOString().split('T')[0]
        })
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar hito:', error);
    }
  };

  const eliminarHito = async (hitoConseguidoId) => {
    try {
      await fetchConAuth(`${API_URL}/hitos-conseguidos/${hitoConseguidoId}`, {
        method: 'DELETE'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar hito:', error);
    }
  };

  const registrarHitoConPerdida = async (hitoId, edadConseguido, edadPerdido) => {
    try {
      await fetchConAuth(`${API_URL}/hitos-conseguidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          hito_id: hitoId,
          edad_conseguido_meses: edadConseguido,
          fecha_registro: modoEvaluacion === 'puntual' ? fechaEvaluacion : new Date().toISOString().split('T')[0],
          edad_perdido_meses: edadPerdido,
          fecha_perdido: new Date().toISOString().split('T')[0]
        })
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar hito con pérdida:', error);
      alert('Error al registrar el hito con pérdida');
    }
  };

  const marcarHitoPerdido = async (hitoConseguidoId, hitoNombre) => {
    const edadPerdido = prompt(
      `¿A qué edad (en meses) se perdió el hito "${hitoNombre}"?`,
      Math.round(edadActualMeses)
    );
    
    if (edadPerdido === null) return; // Usuario canceló
    
    const edadPerdidoFloat = parseFloat(edadPerdido);
    if (isNaN(edadPerdidoFloat) || edadPerdidoFloat <= 0) {
      alert('Por favor ingresa una edad válida en meses.');
      return;
    }
    
    try {
      await fetchConAuth(`${API_URL}/hitos-conseguidos/${hitoConseguidoId}/registrar-perdida`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edad_perdido_meses: edadPerdidoFloat,
          fecha_perdido: new Date().toISOString().split('T')[0]
        })
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar pérdida del hito:', error);
      alert('Error al registrar la pérdida del hito');
    }
  };

  const registrarHitoNoAlcanzado = async (hitoId, notas = '') => {
    try {
      const edadEval = modoEvaluacion === 'puntual' ? edadEvaluacionMeses : edadActualMeses;
      await fetchConAuth(`${API_URL}/hitos-no-alcanzados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          hito_id: hitoId,
          edad_evaluacion_meses: edadEval,
          fecha_registro: modoEvaluacion === 'puntual' ? fechaEvaluacion : new Date().toISOString(),
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
      await fetchConAuth(`${API_URL}/hitos-no-alcanzados/${hitoNoAlcanzadoId}`, {
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

  // Filtrar hitos relevantes según el modo de evaluación
  const edadParaEvaluacion = (() => {
    if (modoEvaluacion === 'puntual') {
      // En modo puntual, usar la edad de evaluación
      const edadBase = edadEvaluacionMeses > 0 ? edadEvaluacionMeses : edadActualMeses;
      return ninoData && ninoData.semanas_gestacion < 37 ? 
        calcularEdadCorregidaMeses(ninoData.fecha_nacimiento, ninoData.semanas_gestacion, fechaEvaluacion) : 
        edadBase;
    } else {
      // En modo longitudinal, usar edad actual o corregida
      return ninoData && ninoData.semanas_gestacion < 37 ? edadCorregidaMeses : edadActualMeses;
    }
  })();
  
  const esHitoRelevante = (hito) => {
    // Si el hito está conseguido o no alcanzado, siempre es relevante
    if (hitoConseguido(hito.id) || hitoNoAlcanzado(hito.id)) {
      return true;
    }
    
    if (modoEvaluacion === 'puntual') {
      // En modo puntual: mostrar hitos en el rango dinámico
      const margen = 2;
      const edadMinima = Math.max(0, edadParaEvaluacion - margen - rangoEdadInferior);
      const edadMaxima = edadParaEvaluacion + margen;
      return hito.edad_media_meses >= edadMinima && 
             hito.edad_media_meses <= edadMaxima;
    } else {
      // En modo longitudinal: mostrar todos los hitos hasta la edad actual +2 meses
      return hito.edad_media_meses <= (edadParaEvaluacion + 2);
    }
  };

  // Función para expandir el rango de edad en modo puntual
  const expandirRangoEdad = () => {
    setRangoEdadInferior(prev => prev + 2);
  };

  // Calcular hitos filtrados con useMemo - incluir toda la lógica dentro
  const hitosFiltrados = useMemo(() => {
    // Función helper para verificar si hito está conseguido
    const estaConseguido = (hitoId) => {
      return hitosConseguidos.some(hc => hc.hito_id === hitoId);
    };
    
    // Función helper para verificar si hito no fue alcanzado
    const noAlcanzado = (hitoId) => {
      return hitosNoAlcanzados.some(hna => hna.hito_id === hitoId);
    };
    
    // Calcular edad para evaluación
    let edadEval;
    if (modoEvaluacion === 'puntual') {
      const edadBase = edadEvaluacionMeses > 0 ? edadEvaluacionMeses : edadActualMeses;
      edadEval = ninoData && ninoData.semanas_gestacion < 37 ? 
        calcularEdadCorregidaMeses(ninoData.fecha_nacimiento, ninoData.semanas_gestacion, fechaEvaluacion) : 
        edadBase;
    } else {
      edadEval = ninoData && ninoData.semanas_gestacion < 37 ? edadCorregidaMeses : edadActualMeses;
    }
    
    // Función para verificar si hito es relevante
    const esRelevante = (hito) => {
      if (estaConseguido(hito.id) || noAlcanzado(hito.id)) {
        return true;
      }
      
      if (modoEvaluacion === 'puntual') {
        const margen = 2;
        const edadMinima = Math.max(0, edadEval - margen - rangoEdadInferior);
        const edadMaxima = edadEval + margen;
        return hito.edad_media_meses >= edadMinima && hito.edad_media_meses <= edadMaxima;
      } else {
        return hito.edad_media_meses <= (edadEval + 2);
      }
    };
    
    return hitosNormativos.filter(hito => {
      if (dominioSeleccionado && hito.dominio_id !== dominioSeleccionado) {
        return false;
      }
      
      if (estaConseguido(hito.id)) {
        return false;
      }
      
      if (noAlcanzado(hito.id)) {
        return false;
      }
      
      return esRelevante(hito);
    }).sort((a, b) => a.edad_media_meses - b.edad_media_meses);
  }, [
    hitosNormativos, 
    dominioSeleccionado, 
    hitosConseguidos, 
    hitosNoAlcanzados, 
    modoEvaluacion, 
    edadEvaluacionMeses,
    edadActualMeses,
    edadCorregidaMeses,
    rangoEdadInferior,
    ninoData,
    fechaEvaluacion
  ]);

  // Verificar si todos los hitos visibles están evaluados
  const todosHitosEvaluados = () => {
    return hitosFiltrados.length === 0;
  };

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

  // Efecto para expandir automáticamente el rango en modo puntual
  // Debe estar DESPUÉS de la definición de hitosFiltrados
  useEffect(() => {
    if (modoEvaluacion !== 'puntual') return;
    if (!ninoData) return;
    if (rangoEdadInferior >= 24) return; // Límite máximo de expansión

    // Verificar si todos los hitos del rango actual están evaluados
    const todosPendientesEvaluados = hitosFiltrados.length === 0;
    
    // Verificar si hay hitos no alcanzados (indica que hay dominios con retraso)
    const hayHitosNoAlcanzados = hitosNoAlcanzados.length > 0;
    
    if (todosPendientesEvaluados && hayHitosNoAlcanzados) {
      // Expandir automáticamente después de un breve delay
      const timer = setTimeout(() => {
        setRangoEdadInferior(prev => prev + 2);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [modoEvaluacion, hitosFiltrados.length, hitosNoAlcanzados.length, rangoEdadInferior, ninoData]);

  return (
    <div className="hitos-registro">
      <h2>Registro de Hitos del Desarrollo</h2>
      
      <div className="filtros">
        <div className="filtro-grupo">
          <label>Modo de evaluación:</label>
          <select 
            value={modoEvaluacion} 
            onChange={(e) => setModoEvaluacion(e.target.value)}
            style={{ fontWeight: 'bold' }}
          >
            <option value="puntual">Evaluación Puntual (momento específico)</option>
            <option value="longitudinal">Evaluación Longitudinal (retrospectiva)</option>
          </select>
        </div>

        {modoEvaluacion === 'puntual' && (
          <div className="filtro-grupo">
            <label>Fecha de evaluación:</label>
            <input 
              type="date" 
              value={fechaEvaluacion}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFechaEvaluacion(e.target.value)}
            />
            <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
              Edad: {Math.round(edadEvaluacionMeses * 10) / 10} meses
            </span>
          </div>
        )}
        
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

      <div className="chart-note" style={{marginBottom: '1rem', marginTop: '1rem'}}>
        {modoEvaluacion === 'puntual' ? (
          <p><strong>ℹ️ Modo Puntual:</strong> Se presentan hitos esperables en un rango de ±2 meses alrededor de la edad de evaluación ({Math.round(edadParaEvaluacion)} meses{ninoData && ninoData.semanas_gestacion < 37 ? ' - edad corregida' : ''}). Indica si el niño ha conseguido cada hito en ese momento específico.</p>
        ) : (
          <p><strong>ℹ️ Modo Longitudinal:</strong> Se presentan todos los hitos alcanzables hasta la edad actual del niño +2 meses ({Math.round(edadParaEvaluacion + 2)} meses). Registra la edad específica en que se consiguió cada hito.</p>
        )}
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
        {modoEvaluacion === 'puntual' ? (
          <>
            <p><strong>📋 Hitos mostrados:</strong> Se presentan hitos esperables en el rango de {rangoEdadInferior > 0 ? `${Math.round(edadParaEvaluacion - 2 - rangoEdadInferior)} a ` : ''}{Math.round(edadParaEvaluacion - 2)} a {Math.round(edadParaEvaluacion + 2)} meses. Si el niño no ha conseguido todos los hitos esperables, puedes ver hitos de edades anteriores.</p>
            {rangoEdadInferior > 0 && (
              <p style={{ color: '#856404', backgroundColor: '#fff3cd', padding: '8px', borderRadius: '4px', marginTop: '8px' }}>
                ⚠️ Se están mostrando hitos de {rangoEdadInferior} meses adicionales hacia atrás debido a hitos no alcanzados.
              </p>
            )}
          </>
        ) : (
          <p><strong>📋 Hitos pendientes de evaluación:</strong> Se muestran todos los hitos cuya edad esperada es menor o igual a la edad actual del niño +2 meses ({Math.round(edadParaEvaluacion + 2)} meses{ninoData && ninoData.semanas_gestacion < 37 ? ' - edad corregida' : ''}). Registra la edad específica en meses en que el niño consiguió cada hito.</p>
        )}
      </div>

      <h3>Hitos Pendientes de Evaluación</h3>
      
      {modoEvaluacion === 'puntual' && todosHitosEvaluados() && hitosNoAlcanzados.length === 0 && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          borderLeft: '4px solid #28a745',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            ✅ Evaluación completada. Todos los hitos del rango han sido conseguidos.
          </p>
        </div>
      )}

      {modoEvaluacion === 'puntual' && todosHitosEvaluados() && hitosNoAlcanzados.length > 0 && rangoEdadInferior < 24 && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          borderLeft: '4px solid #ffc107',
          marginBottom: '20px',
          borderRadius: '4px',
          animation: 'pulse 1s ease-in-out'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
            🔄 Expandiendo automáticamente el rango de evaluación...
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#856404' }}>
            Se detectaron {hitosNoAlcanzados.length} hito(s) no alcanzado(s). Mostrando hitos de edades anteriores para identificar el nivel basal de desarrollo.
          </p>
        </div>
      )}

      {modoEvaluacion === 'puntual' && todosHitosEvaluados() && rangoEdadInferior >= 24 && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          borderLeft: '4px solid #28a745',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            ✅ Evaluación completada. Se ha evaluado un rango de 24 meses hacia atrás.
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>
            {hitosNoAlcanzados.length > 0 
              ? `Hay ${hitosNoAlcanzados.length} hito(s) pendiente(s) que pueden requerir evaluación especializada.`
              : 'Todos los hitos evaluados han sido conseguidos.'}
          </p>
        </div>
      )}
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
                    {conseguido.edad_perdido_meses && (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        ✗ Perdido a los {conseguido.edad_perdido_meses} meses
                      </span>
                    )}
                    <span className={`z-score ${zScore < -2 ? 'retraso' : zScore > 2 ? 'adelanto' : 'normal'}`}>
                      Z-score: {zScore.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!conseguido.edad_perdido_meses && (
                      <button 
                        className="btn-perdida"
                        onClick={() => marcarHitoPerdido(conseguido.id, hito.nombre)}
                        title="Marcar como perdido (regresión)"
                        style={{
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9em'
                        }}
                      >
                        ✗ Pérdida
                      </button>
                    )}
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarHito(conseguido.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hito-acciones" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn-registrar"
                    onClick={() => {
                      if (modoEvaluacion === 'puntual') {
                        // En modo puntual, registrar con la edad de evaluación
                        if (confirm(`¿Ha conseguido "${hito.nombre}" el niño a los ${Math.round(edadEvaluacionMeses)} meses?`)) {
                          registrarHito(hito.id, edadEvaluacionMeses);
                        }
                      } else {
                        // En modo longitudinal, preguntar la edad específica
                        const edad = prompt('¿A qué edad (en meses) se consiguió este hito?', Math.round(hito.edad_media_meses));
                        if (edad) {
                          registrarHito(hito.id, parseFloat(edad));
                        }
                      }
                    }}
                  >
                    ✓ Conseguido
                  </button>
                  
                  <button 
                    className="btn-perdida"
                    onClick={() => {
                      const edadConseguido = prompt(
                        `¿A qué edad (en meses) se consiguió "${hito.nombre}"?`,
                        Math.round(hito.edad_media_meses)
                      );
                      
                      if (edadConseguido === null) return; // Usuario canceló
                      
                      const edadConseguidoFloat = parseFloat(edadConseguido);
                      if (isNaN(edadConseguidoFloat)) {
                        alert('Por favor ingresa una edad válida.');
                        return;
                      }
                      
                      const edadPerdido = prompt(
                        `¿A qué edad (en meses) se perdió "${hito.nombre}"?`,
                        Math.round(edadActualMeses)
                      );
                      
                      if (edadPerdido === null) return; // Usuario canceló
                      
                      const edadPerdidoFloat = parseFloat(edadPerdido);
                      if (isNaN(edadPerdidoFloat)) {
                        alert('Por favor ingresa una edad válida.');
                        return;
                      }
                      
                      if (edadPerdidoFloat <= edadConseguidoFloat) {
                        alert('La edad de pérdida debe ser posterior a la edad de consecución.');
                        return;
                      }
                      
                      // Registrar hito con pérdida inmediata
                      registrarHitoConPerdida(hito.id, edadConseguidoFloat, edadPerdidoFloat);
                    }}
                    title="Marcar como perdido (regresión)"
                    style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }}
                  >
                    ✗ Pérdida
                  </button>
                  
                  <button 
                    className="btn-no-alcanzado"
                    onClick={() => {
                      const edadMostrar = modoEvaluacion === 'puntual' ? 
                        Math.round(edadEvaluacionMeses) : 
                        Math.round(edadActualMeses);
                      if (confirm(`¿Marcar "${hito.nombre}" como no alcanzado aún? (Edad ${modoEvaluacion === 'puntual' ? 'de evaluación' : 'actual'}: ${edadMostrar} meses)`)) {
                        registrarHitoNoAlcanzado(hito.id);
                      }
                    }}
                  >
                    ✗ No alcanzado
                  </button>
                  
                  <button 
                    className="btn-no-se"
                    onClick={() => {
                      // Simplemente no hace nada, omite el hito del análisis
                      // Podrías agregar feedback visual si lo deseas
                      console.log(`Hito "${hito.nombre}" omitido - No lo sé`);
                    }}
                    title="Omitir este hito del análisis"
                    style={{
                      backgroundColor: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }}
                  >
                    ? No lo sé
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
