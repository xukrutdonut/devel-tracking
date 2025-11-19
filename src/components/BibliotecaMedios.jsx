import React, { useState, useEffect } from 'react';
import './BibliotecaMedios.css';

const BibliotecaMedios = () => {
  const [videos, setVideos] = useState([]);
  const [hitos, setHitos] = useState([]);
  const [filtroFuente, setFiltroFuente] = useState('todos');
  const [filtroEdad, setFiltroEdad] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const [hitoSeleccionado, setHitoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      
      // Cargar videos
      const resVideos = await fetch('/api/videos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataVideos = await resVideos.json();
      setVideos(Array.isArray(dataVideos) ? dataVideos : []);
      
      // Cargar todos los hitos del sistema
      const resHitos = await fetch('/api/hitos-completos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataHitos = await resHitos.json();
      setHitos(Array.isArray(dataHitos) ? dataHitos : []);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setVideos([]);
      setHitos([]);
      mostrarMensaje('Error al cargar los datos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(''), 3000);
  };

  const asociarVideo = async () => {
    if (!videoSeleccionado || !hitoSeleccionado) {
      mostrarMensaje('Selecciona un video y un hito', 'error');
      return;
    }

    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      await fetch('/api/videos/asociar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId: videoSeleccionado._id,
          hitoId: hitoSeleccionado
        })
      });
      
      mostrarMensaje('Video asociado correctamente', 'success');
      setVideoSeleccionado(null);
      setHitoSeleccionado('');
      cargarDatos();
    } catch (error) {
      console.error('Error al asociar video:', error);
      mostrarMensaje('Error al asociar el video', 'error');
    } finally {
      setCargando(false);
    }
  };

  const desasociarVideo = async (videoId, hitoId) => {
    if (!confirm('¿Deseas desasociar este video del hito?')) return;

    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      await fetch('/api/videos/desasociar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId,
          hitoId
        })
      });
      
      mostrarMensaje('Video desasociado correctamente', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error al desasociar video:', error);
      mostrarMensaje('Error al desasociar el video', 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminarVideo = async (videoId) => {
    if (!confirm('¿Estás seguro de eliminar este video? Se desasociará de todos los hitos.')) return;

    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      mostrarMensaje('Video eliminado correctamente', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar video:', error);
      mostrarMensaje('Error al eliminar el video', 'error');
    } finally {
      setCargando(false);
    }
  };

  const videosFiltrados = Array.isArray(videos) ? videos.filter(video => {
    const matchFuente = filtroFuente === 'todos' || video.fuente === filtroFuente;
    const matchEdad = filtroEdad === 'todos' || (video.hitoAsociado && video.hitoAsociado.edad === parseInt(filtroEdad));
    const matchBusqueda = busqueda === '' || 
      video.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      video.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      video.url?.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchFuente && matchEdad && matchBusqueda;
  }) : [];

  const obtenerNombreHito = (hitoId) => {
    const hito = hitos.find(h => h._id === hitoId);
    return hito ? `${hito.descripcion} (${hito.edad} meses)` : 'Hito no encontrado';
  };

  return (
    <div className="biblioteca-medios">
      <h2>📚 Biblioteca de Medios</h2>
      
      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Fuente:</label>
          <select value={filtroFuente} onChange={(e) => setFiltroFuente(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="CDC">CDC</option>
            <option value="Pathways">Pathways.org</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Edad (meses):</label>
          <select value={filtroEdad} onChange={(e) => setFiltroEdad(e.target.value)}>
            <option value="todos">Todos</option>
            {[2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60].map(edad => (
              <option key={edad} value={edad}>{edad}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo busqueda">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Título, descripción o URL..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Panel de asociación */}
      {videoSeleccionado && (
        <div className="panel-asociacion">
          <h3>Asociar Video a Hito</h3>
          <div className="video-preview">
            <p><strong>Video seleccionado:</strong> {videoSeleccionado.titulo || videoSeleccionado.url}</p>
            <p><strong>Fuente:</strong> {videoSeleccionado.fuente}</p>
          </div>
          
          <div className="hito-selector">
            <label>Seleccionar hito:</label>
            <select 
              value={hitoSeleccionado} 
              onChange={(e) => setHitoSeleccionado(e.target.value)}
              className="select-hito"
            >
              <option value="">-- Selecciona un hito --</option>
              {hitos.map(hito => (
                <option key={hito._id} value={hito._id}>
                  {hito.edad} meses - {hito.area} - {hito.descripcion}
                </option>
              ))}
            </select>
          </div>

          <div className="botones-asociacion">
            <button onClick={asociarVideo} disabled={cargando} className="btn-asociar">
              {cargando ? 'Guardando...' : 'Asociar'}
            </button>
            <button onClick={() => setVideoSeleccionado(null)} className="btn-cancelar">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de videos */}
      <div className="videos-lista">
        <h3>Videos ({videosFiltrados.length})</h3>
        
        {cargando ? (
          <p>Cargando...</p>
        ) : videosFiltrados.length === 0 ? (
          <p>No se encontraron videos con los filtros aplicados</p>
        ) : (
          <div className="videos-grid">
            {videosFiltrados.map(video => (
              <div key={video._id} className="video-card">
                <div className="video-header">
                  <span className={`fuente-badge ${video.fuente.toLowerCase()}`}>
                    {video.fuente}
                  </span>
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarVideo(video._id)}
                    title="Eliminar video"
                  >
                    🗑️
                  </button>
                </div>

                <div className="video-thumbnail">
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={`https://img.youtube.com/vi/${video.url.split('/').pop().replace('watch?v=', '')}/mqdefault.jpg`}
                      alt={video.titulo || 'Video'}
                      onError={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%23ddd" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3ENo disponible%3C/text%3E%3C/svg%3E'}
                    />
                  </a>
                </div>

                <div className="video-info">
                  <h4>{video.titulo || 'Sin título'}</h4>
                  {video.descripcion && <p className="video-descripcion">{video.descripcion}</p>}
                  
                  <div className="video-url">
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      Ver en YouTube →
                    </a>
                  </div>

                  {video.hitosAsociados && video.hitosAsociados.length > 0 ? (
                    <div className="hitos-asociados">
                      <strong>Asociado a:</strong>
                      <ul>
                        {video.hitosAsociados.map(hitoId => (
                          <li key={hitoId}>
                            {obtenerNombreHito(hitoId)}
                            <button 
                              className="btn-desasociar"
                              onClick={() => desasociarVideo(video._id, hitoId)}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="sin-asociar">Sin hitos asociados</p>
                  )}
                </div>

                <button 
                  className="btn-asociar-video"
                  onClick={() => setVideoSeleccionado(video)}
                >
                  + Asociar a Hito
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibliotecaMedios;
