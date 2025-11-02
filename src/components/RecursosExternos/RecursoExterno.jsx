import React from 'react';
import { ExternalLink, FileText, Video, Book, Download } from 'lucide-react';
import './RecursoExterno.css';

/**
 * Componente para mostrar un recurso externo (Pathways.org, etc.)
 * con enlace apropiado y atribución
 */
function RecursoExterno({ 
  fuente = "Pathways.org",
  titulo,
  descripcion,
  url,
  tipo = "articulo",
  duracion,
  formato,
  tags = [],
  logo = "/logos/pathways-logo.png"
}) {
  
  // Iconos según tipo de recurso
  const getIcono = () => {
    switch(tipo) {
      case 'video_externo':
        return <Video size={20} />;
      case 'checklist_pdf':
      case 'pdf':
        return <Download size={20} />;
      case 'articulo':
        return <Book size={20} />;
      case 'herramienta_interactiva':
        return <ExternalLink size={20} />;
      default:
        return <FileText size={20} />;
    }
  };
  
  // Etiqueta de tipo de recurso
  const getTipoLabel = () => {
    switch(tipo) {
      case 'video_externo':
        return 'Video';
      case 'checklist_pdf':
        return 'Checklist PDF';
      case 'pdf':
        return 'PDF';
      case 'articulo':
        return 'Artículo';
      case 'herramienta_interactiva':
        return 'Herramienta';
      default:
        return 'Recurso';
    }
  };
  
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="recurso-externo-card"
      aria-label={`Abrir ${titulo} en ${fuente}`}
    >
      <div className="recurso-header">
        <div className="recurso-fuente-info">
          <span className="recurso-fuente">{fuente}</span>
          {duracion && <span className="recurso-duracion">⏱️ {duracion}</span>}
          {formato && <span className="recurso-formato">{formato}</span>}
        </div>
        <div className="recurso-icono">
          {getIcono()}
        </div>
      </div>
      
      <div className="recurso-content">
        <h4 className="recurso-titulo">{titulo}</h4>
        {descripcion && (
          <p className="recurso-descripcion">{descripcion}</p>
        )}
        
        {tags.length > 0 && (
          <div className="recurso-tags">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="recurso-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="recurso-footer">
        <span className="recurso-tipo">{getTipoLabel()}</span>
        <ExternalLink size={16} className="recurso-external-icon" />
      </div>
    </a>
  );
}

export default RecursoExterno;
