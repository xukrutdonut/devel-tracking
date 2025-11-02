import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

import { fetchConAuth } from '../utils/authService';
function RedFlagsRegistro({ ninoId }) {
  const [redFlags, setRedFlags] = useState([]);
  const [redFlagsObservadas, setRedFlagsObservadas] = useState([]);
  const [nino, setNino] = useState(null);
  const [edadActualMeses, setEdadActualMeses] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, [ninoId]);

  const cargarDatos = async () => {
    try {
      const [redFlagsRes, redFlagsObsRes, ninoRes] = await Promise.all([
        fetch(`${API_URL}/red-flags`),
        fetch(`${API_URL}/red-flags-observadas/${ninoId}`),
        fetch(`${API_URL}/ninos/${ninoId}`)
      ]);

      const redFlagsData = await redFlagsRes.json();
      const redFlagsObsData = await redFlagsObsRes.json();
      const ninoData = await ninoRes.json();

      setRedFlags(redFlagsData);
      setRedFlagsObservadas(redFlagsObsData);
      setNino(ninoData);

      // Calcular edad actual
      const fechaNac = new Date(ninoData.fecha_nacimiento);
      const hoy = new Date();
      const edadMeses = (hoy - fechaNac) / (1000 * 60 * 60 * 24 * 30.44);
      setEdadActualMeses(edadMeses);
    } catch (error) {
      console.error('Error al cargar red flags:', error);
    }
  };

  const registrarRedFlag = async (redFlagId, edadMeses, severidad, notas) => {
    try {
      await fetchConAuth(`${API_URL}/red-flags-observadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          red_flag_id: redFlagId,
          edad_observada_meses: edadMeses,
          fecha_registro: new Date().toISOString().split('T')[0],
          severidad,
          notas
        })
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar red flag:', error);
    }
  };

  const eliminarRedFlag = async (redFlagObservadaId) => {
    if (window.confirm('¿Está seguro de eliminar esta señal de alarma?')) {
      try {
        await fetchConAuth(`${API_URL}/red-flags-observadas/${redFlagObservadaId}`, {
          method: 'DELETE'
        });
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar red flag:', error);
      }
    }
  };

  const redFlagObservada = (redFlagId) => {
    return redFlagsObservadas.find(rfo => rfo.red_flag_id === redFlagId);
  };

  const handleRegistrarRedFlag = (redFlagId) => {
    const edad = prompt('¿A qué edad (en meses) se observó esta señal?', Math.round(edadActualMeses));
    if (edad === null) return;

    const severidad = prompt('Severidad (1=Leve, 2=Moderada, 3=Severa):', '2');
    if (severidad === null) return;

    const notas = prompt('Notas adicionales (opcional):');

    registrarRedFlag(redFlagId, parseFloat(edad), parseInt(severidad) || 2, notas || '');
  };

  const getSeveridadColor = (severidad) => {
    switch(severidad) {
      case 1: return 'leve';
      case 2: return 'moderada';
      case 3: return 'severa';
      default: return 'moderada';
    }
  };

  const getSeveridadTexto = (severidad) => {
    switch(severidad) {
      case 1: return 'Leve';
      case 2: return 'Moderada';
      case 3: return 'Severa';
      default: return 'Moderada';
    }
  };

  return (
    <div className="red-flags-registro">
      <h2>🚩 Señales de Alarma (Red Flags)</h2>
      <p className="descripcion">
        Las señales de alarma son indicadores de posible desviación del desarrollo normal 
        que requieren evaluación profesional. Registre aquí las señales observadas.
      </p>

      <div className="estadisticas">
        <div className="stat-card">
          <span className="stat-number">{redFlagsObservadas.length}</span>
          <span className="stat-label">Señales observadas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Math.round(edadActualMeses)}</span>
          <span className="stat-label">Meses de edad actual</span>
        </div>
      </div>

      {redFlagsObservadas.length > 0 && (
        <div className="red-flags-observadas">
          <h3>Señales Observadas</h3>
          <div className="red-flags-lista">
            {redFlagsObservadas.map(rfo => (
              <div key={rfo.id} className={`red-flag-card observada ${getSeveridadColor(rfo.severidad)}`}>
                <div className="red-flag-header">
                  <h4>🚩 {rfo.flag_nombre}</h4>
                  <span className={`severidad-badge ${getSeveridadColor(rfo.severidad)}`}>
                    {getSeveridadTexto(rfo.severidad)}
                  </span>
                </div>
                <p className="descripcion">{rfo.flag_descripcion}</p>
                <div className="red-flag-info">
                  <p><strong>Observada a los:</strong> {rfo.edad_observada_meses} meses</p>
                  <p><strong>Fecha de registro:</strong> {new Date(rfo.fecha_registro).toLocaleDateString('es-ES')}</p>
                  {rfo.notas && <p className="notas"><strong>Notas:</strong> {rfo.notas}</p>}
                </div>
                <button 
                  className="btn-eliminar"
                  onClick={() => eliminarRedFlag(rfo.id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="red-flags-disponibles">
        <h3>Catálogo de Señales de Alarma</h3>
        <p className="info">Haga clic en "Registrar" si observa alguna de estas señales:</p>
        
        <div className="red-flags-lista">
          {redFlags.map(rf => {
            const observada = redFlagObservada(rf.id);
            
            return (
              <div 
                key={rf.id} 
                className={`red-flag-card ${observada ? 'ya-observada' : ''}`}
              >
                <div className="red-flag-header">
                  <h4>{rf.nombre}</h4>
                  {rf.edad_relevante_meses > 0 && (
                    <span className="edad-relevante">
                      Edad relevante: {rf.edad_relevante_meses}+ meses
                    </span>
                  )}
                </div>
                <p className="descripcion">{rf.descripcion}</p>
                
                {observada ? (
                  <div className="ya-registrada">
                    ✓ Ya registrada a los {observada.edad_observada_meses} meses
                  </div>
                ) : (
                  <button 
                    className="btn-registrar"
                    onClick={() => handleRegistrarRedFlag(rf.id)}
                  >
                    Registrar como observada
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="informacion-adicional">
        <h3>ℹ️ Información Importante</h3>
        <div className="info-box">
          <p>
            <strong>Las señales de alarma NO son diagnósticos.</strong> Son indicadores que sugieren 
            la necesidad de una evaluación más profunda por parte de profesionales especializados.
          </p>
          <p>
            Si observa múltiples señales de alarma o señales de severidad alta, se recomienda:
          </p>
          <ul>
            <li>Consultar con el pediatra</li>
            <li>Solicitar evaluación por especialistas (neuropediatría, psicología infantil)</li>
            <li>Considerar intervención temprana si está indicada</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RedFlagsRegistro;
