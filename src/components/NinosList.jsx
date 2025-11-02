import React from 'react';
import { formatearEdades } from '../utils/ageCalculations';
import { API_URL } from '../config';
import { fetchConAuth, esAdmin, getUsuario } from '../utils/authService';

function NinosList({ ninos, onNinoSeleccionado, onNinoEliminado }) {
  const usuario = getUsuario();
  const isAdmin = esAdmin();

  const eliminarNino = async (e, nino) => {
    e.stopPropagation(); // Evitar que se active onNinoSeleccionado
    
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${nino.nombre}? Esta acción eliminará todos sus datos y no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetchConAuth(`${API_URL}/ninos/${nino.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Niño eliminado correctamente');
        onNinoEliminado();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar el niño');
      }
    } catch (error) {
      console.error('Error al eliminar niño:', error);
      alert('Error al eliminar el niño');
    }
  };

  return (
    <div className="ninos-list">
      <h2>Lista de Niños</h2>
      {ninos.length === 0 ? (
        <p className="empty-message">No hay niños registrados. Crea uno nuevo arriba.</p>
      ) : (
        <div className="ninos-grid">
          {ninos.map(nino => {
            const edades = formatearEdades(nino.fecha_nacimiento, nino.semanas_gestacion);
            const esEjemplo = nino.nombre.includes('Ejemplo');
            return (
              <div 
                key={nino.id} 
                className="nino-card"
                onClick={() => onNinoSeleccionado(nino)}
                style={esEjemplo ? { 
                  borderLeft: '4px solid #2196F3',
                  backgroundColor: '#f0f7ff'
                } : {}}
              >
                <div className="nino-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    {esEjemplo && (
                      <span style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75em',
                        fontWeight: 'bold'
                      }}>
                        EJEMPLO
                      </span>
                    )}
                    <h3 style={{ margin: 0 }}>{nino.nombre}</h3>
                  </div>
                  <button 
                    className="btn-eliminar-nino"
                    onClick={(e) => eliminarNino(e, nino)}
                    title="Eliminar niño"
                  >
                    ✕
                  </button>
                </div>
                <p>Fecha de nacimiento: {new Date(nino.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
                {nino.semanas_gestacion && nino.semanas_gestacion < 37 && (
                  <p className="gestacion-info">Semanas de gestación: {nino.semanas_gestacion}</p>
                )}
                <p className="edad">{edades.textoEdad}</p>
                {isAdmin && nino.email_usuario && (
                  <p className="usuario-info" style={{ fontSize: '0.85em', color: '#666', marginTop: '8px' }}>
                    👤 Usuario: {nino.email_usuario}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NinosList;
