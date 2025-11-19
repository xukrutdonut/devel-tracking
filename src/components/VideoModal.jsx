import React, { useEffect, useRef, useState } from 'react';
import './VideoModal.css';

/**
 * Modal para reproducir videos educativos de hitos del desarrollo
 * Soporta videos de YouTube, Vimeo y URLs directas
 * Maneja errores de embed y proporciona enlace directo como respaldo
 */
function VideoModal({ isOpen, onClose, videoData, hitoNombre }) {
  const modalRef = useRef(null);
  const [embedError, setEmbedError] = useState(false);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen || !videoData) return null;
  
  // Función para extraer ID de video de YouTube
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Función para extraer ID de video de Vimeo
  const getVimeoId = (url) => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };
  
  const renderVideoPlayer = () => {
    // Video de YouTube
    if (videoData.youtube) {
      const videoId = getYouTubeId(videoData.youtube);
      if (videoId) {
        return (
          <div>
            {/* Mostrar mensaje informativo y botón directo a YouTube */}
            <div style={{ 
              padding: '30px 20px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '20px',
              border: '2px solid #2196f3'
            }}>
              <i className="fab fa-youtube" style={{ 
                fontSize: '4em', 
                color: '#FF0000',
                marginBottom: '15px',
                display: 'block'
              }}></i>
              <h3 style={{ color: '#1976d2', marginBottom: '10px', fontSize: '1.3em' }}>
                Video Educativo Disponible
              </h3>
              <p style={{ color: '#555', marginBottom: '20px', fontSize: '1em' }}>
                {videoData.descripcion || 'Video educativo sobre este hito del desarrollo.'}
              </p>
              <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '20px' }}>
                Por restricciones de YouTube, este video se abrirá en una nueva pestaña.
              </p>
              <a 
                href={videoData.youtube}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '15px 30px',
                  backgroundColor: '#FF0000',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1.1em',
                  boxShadow: '0 4px 12px rgba(255,0,0,0.4)',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#CC0000';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,0,0,0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF0000';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,0,0,0.4)';
                }}
              >
                <i className="fab fa-youtube" style={{ fontSize: '1.5em' }}></i>
                <span>Ver Video en YouTube</span>
                <i className="fas fa-external-link-alt"></i>
              </a>
              {videoData.fuente && (
                <p style={{ 
                  marginTop: '15px', 
                  fontSize: '0.85em', 
                  color: '#999',
                  fontStyle: 'italic'
                }}>
                  Fuente: {videoData.fuente}
                </p>
              )}
            </div>
          </div>
        );
      }
    }
    
    // Video de Vimeo
    if (videoData.vimeo) {
      const videoId = getVimeoId(videoData.vimeo);
      if (videoId) {
        return (
          <div className="video-container">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
              title={hitoNombre}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }
    
    // Video directo (MP4, etc.)
    if (videoData.directUrl) {
      return (
        <div className="video-container">
          <video controls autoPlay>
            <source src={videoData.directUrl} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      );
    }
    
    // Si solo hay enlaces CDC/Pathways sin video embebido, mostrar botones para abrir
    return (
      <div className="video-links">
        <p className="video-info">
          Haz click para ver el video educativo en el sitio oficial:
        </p>
        {videoData.cdc && (
          <a 
            href={videoData.cdc} 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-link-button cdc"
          >
            <i className="fas fa-external-link-alt"></i>
            Ver video en CDC (página oficial)
          </a>
        )}
        {videoData.pathways && (
          <a 
            href={videoData.pathways} 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-link-button pathways"
          >
            <i className="fas fa-external-link-alt"></i>
            Ver video en Pathways.org
          </a>
        )}
        {(videoData.cdc || videoData.pathways) && (
          <p style={{ 
            marginTop: '15px', 
            fontSize: '0.9em', 
            color: '#666',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Los videos se reproducirán en una nueva pestaña del navegador
          </p>
        )}
      </div>
    );
  };
  
  return (
    <div className="video-modal-overlay" onClick={handleBackdropClick}>
      <div className="video-modal-content" ref={modalRef}>
        <div className="video-modal-header">
          <h3>{hitoNombre}</h3>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="video-modal-body">
          {renderVideoPlayer()}
          {videoData.descripcion && (
            <div className="video-descripcion">
              <p>{videoData.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoModal;
