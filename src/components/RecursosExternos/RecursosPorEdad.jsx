import React, { useState } from 'react';
import { pathwaysResources, pathwaysMetadata } from '../../data/pathwaysResources';
import RecursoExterno from './RecursoExterno';
import { ExternalLink } from 'lucide-react';
import './RecursosPorEdad.css';

/**
 * Componente para mostrar recursos educativos de Pathways.org por edad
 */
function RecursosPorEdad({ edad }) {
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const recursos = pathwaysResources[edad];
  
  if (!recursos || !recursos.categorias) {
    return (
      <div className="recursos-por-edad no-recursos">
        <p>No hay recursos disponibles para esta edad.</p>
        <a 
          href={pathwaysMetadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-visitar-pathways"
        >
          Visitar Pathways.org
        </a>
      </div>
    );
  }
  
  // Obtener todas las categorías disponibles
  const categorias = Object.keys(recursos.categorias).filter(
    cat => cat !== 'recursos_generales' && recursos.categorias[cat].recursos?.length > 0
  );
  
  // Filtrar recursos según categoría activa
  const getRecursosFiltrados = () => {
    if (categoriaActiva === 'todas') {
      const todosRecursos = [];
      
      // Agregar recursos de todas las categorías
      categorias.forEach(cat => {
        const catData = recursos.categorias[cat];
        if (catData.recursos) {
          todosRecursos.push(...catData.recursos.map(r => ({
            ...r,
            categoria: catData.titulo
          })));
        }
      });
      
      // Agregar recursos generales
      if (recursos.categorias.recursos_generales) {
        todosRecursos.push(...recursos.categorias.recursos_generales.map(r => ({
          ...r,
          categoria: 'General'
        })));
      }
      
      return todosRecursos;
    } else if (categoriaActiva === 'recursos_generales') {
      return recursos.categorias.recursos_generales || [];
    } else {
      const catData = recursos.categorias[categoriaActiva];
      return catData?.recursos || [];
    }
  };
  
  const recursosFiltrados = getRecursosFiltrados();
  
  return (
    <div className="recursos-por-edad">
      <div className="recursos-header">
        <h2>📚 Recursos Educativos - {recursos.nombre}</h2>
        <a 
          href={recursos.url_pathways}
          target="_blank"
          rel="noopener noreferrer"
          className="link-pathways"
        >
          Ver más en Pathways.org <ExternalLink size={14} />
        </a>
      </div>
      
      {/* Filtros por categoría */}
      <div className="filtros-categoria">
        <button 
          onClick={() => setCategoriaActiva('todas')}
          className={`filtro-btn ${categoriaActiva === 'todas' ? 'active' : ''}`}
        >
          Todas
        </button>
        
        {categorias.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={`filtro-btn ${categoriaActiva === cat ? 'active' : ''}`}
          >
            {recursos.categorias[cat].titulo}
          </button>
        ))}
        
        {recursos.categorias.recursos_generales?.length > 0 && (
          <button 
            onClick={() => setCategoriaActiva('recursos_generales')}
            className={`filtro-btn ${categoriaActiva === 'recursos_generales' ? 'active' : ''}`}
          >
            General
          </button>
        )}
      </div>
      
      {/* Grid de recursos */}
      {recursosFiltrados.length > 0 ? (
        <div className="recursos-grid">
          {recursosFiltrados.map((recurso, idx) => (
            <RecursoExterno
              key={idx}
              fuente="Pathways.org"
              titulo={recurso.titulo}
              descripcion={recurso.descripcion}
              url={recurso.url}
              tipo={recurso.tipo}
              duracion={recurso.duracion_estimada}
              formato={recurso.formato}
              tags={recurso.tags}
            />
          ))}
        </div>
      ) : (
        <p className="no-recursos-mensaje">
          No hay recursos disponibles para esta categoría.
        </p>
      )}
      
      {/* Attribution */}
      <div className="recursos-attribution">
        <p>
          Recursos proporcionados por{' '}
          <a href={pathwaysMetadata.url} target="_blank" rel="noopener noreferrer">
            Pathways.org
          </a>
          {' '}• {pathwaysMetadata.copyright}
        </p>
      </div>
    </div>
  );
}

export default RecursosPorEdad;
