import React from 'react';
import { formatearEdades } from '../utils/ageCalculations';
import { API_URL } from '../config';

function NinosList({ ninos, onNinoSeleccionado, onNinoEliminado }) {
  const eliminarNino = async (e, nino) => {
    e.stopPropagation(); // Evitar que se active onNinoSeleccionado
    
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${nino.nombre}? Esta acción eliminará todos sus datos y no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ninos/${nino.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Niño eliminado correctamente');
        onNinoEliminado();
      } else {
        alert('Error al eliminar el niño');
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
            return (
              <div 
                key={nino.id} 
                className="nino-card"
                onClick={() => onNinoSeleccionado(nino)}
              >
                <div className="nino-card-header">
                  <h3>{nino.nombre}</h3>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NinosList;
