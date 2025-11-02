/**
 * Recursos Educativos de Pathways.org
 * 
 * Este archivo contiene referencias a contenido educativo de Pathways.org
 * para complementar la evaluación del desarrollo infantil.
 * 
 * IMPORTANTE: Todo el contenido es © Pathways.org
 * Uso: Solo enlaces y referencias, no redistribución
 */

export const pathwaysMetadata = {
  fuente: "Pathways.org",
  organizacion: "Pathways Awareness Foundation",
  url: "https://pathways.org",
  copyright: "© Pathways.org - Todos los derechos reservados",
  licencia: "Contenido protegido - Uso mediante enlaces con atribución",
  contacto: {
    email: "info@pathways.org",
    telefono: "(847) 229-4653",
    direccion: "150 N. Michigan Avenue, Suite 2100, Chicago, IL 60601"
  },
  youtube: "https://youtube.com/@PathwaysBaby",
  descripcion: "Organización sin fines de lucro dedicada a la educación sobre desarrollo infantil temprano"
};

/**
 * Catálogo de recursos por edad
 * NOTA: Las URLs son enlaces directos al contenido de Pathways.org
 */
export const pathwaysResources = {
  "2_meses": {
    nombre: "2 Meses",
    url_pathways: "https://pathways.org/milestones/2-months",
    
    categorias: {
      motor_grueso: {
        titulo: "Motor Grueso",
        recursos: [
          {
            tipo: "video_externo",
            titulo: "Tummy Time - Conceptos Básicos",
            descripcion: "Cómo practicar tiempo boca abajo de forma segura",
            url: "https://pathways.org/tummy-timer",
            duracion_estimada: "2-3 min",
            tags: ["tummy-time", "motor-grueso", "fundamental"]
          },
          {
            tipo: "articulo",
            titulo: "Desarrollo Motor a los 2 Meses",
            descripcion: "Qué esperar en el desarrollo motor",
            url: "https://pathways.org/articles/motor-development-2-months",
            tags: ["motor-grueso", "educacion-padres"]
          }
        ]
      },
      
      social_emocional: {
        titulo: "Social y Emocional",
        recursos: [
          {
            tipo: "video_externo",
            titulo: "Desarrollo Social a los 2 Meses",
            descripcion: "Interacción social temprana",
            url: "https://pathways.org/videos?category=social&age=2mo",
            duracion_estimada: "2 min",
            tags: ["social", "emocional", "interaccion"]
          }
        ]
      },
      
      recursos_generales: [
        {
          tipo: "checklist_pdf",
          titulo: "Lista de Verificación - 2 Meses",
          descripcion: "Checklist imprimible de hitos",
          url: "https://pathways.org/print/2-months-checklist",
          formato: "PDF",
          idioma: "en",
          tags: ["checklist", "evaluacion"]
        }
      ]
    }
  },
  
  "4_meses": {
    nombre: "4 Meses",
    url_pathways: "https://pathways.org/milestones/4-months",
    
    categorias: {
      motor_grueso: {
        titulo: "Motor Grueso",
        recursos: [
          {
            tipo: "video_externo",
            titulo: "Tummy Time Avanzado - 4 Meses",
            descripcion: "Progresión del tiempo boca abajo",
            url: "https://pathways.org/tummy-time-4-months",
            duracion_estimada: "2-3 min",
            tags: ["tummy-time", "motor-grueso"]
          }
        ]
      },
      
      recursos_generales: [
        {
          tipo: "checklist_pdf",
          titulo: "Lista de Verificación - 4 Meses",
          descripcion: "Checklist imprimible de hitos",
          url: "https://pathways.org/print/4-months-checklist",
          formato: "PDF",
          idioma: "en",
          tags: ["checklist", "evaluacion"]
        }
      ]
    }
  },
  
  "6_meses": {
    nombre: "6 Meses",
    url_pathways: "https://pathways.org/milestones/6-months",
    
    categorias: {
      motor_grueso: {
        titulo: "Motor Grueso",
        recursos: [
          {
            tipo: "articulo",
            titulo: "Sentarse Solo - Hito de 6 Meses",
            descripcion: "Cómo ayudar al bebé a sentarse",
            url: "https://pathways.org/articles/sitting-6-months",
            tags: ["motor-grueso", "sentarse"]
          }
        ]
      },
      
      recursos_generales: [
        {
          tipo: "checklist_pdf",
          titulo: "Lista de Verificación - 6 Meses",
          descripcion: "Checklist imprimible de hitos",
          url: "https://pathways.org/print/6-months-checklist",
          formato: "PDF",
          idioma: "en",
          tags: ["checklist", "evaluacion"]
        }
      ]
    }
  },
  
  // Template para agregar más edades
  "_template": {
    nombre: "X Meses/Años",
    url_pathways: "https://pathways.org/milestones/...",
    categorias: {
      motor_grueso: { titulo: "Motor Grueso", recursos: [] },
      motor_fino: { titulo: "Motor Fino", recursos: [] },
      comunicacion: { titulo: "Comunicación y Lenguaje", recursos: [] },
      cognitivo: { titulo: "Cognitivo", recursos: [] },
      social_emocional: { titulo: "Social y Emocional", recursos: [] },
      recursos_generales: []
    }
  }
};

/**
 * Recursos generales de Pathways.org (no específicos de edad)
 */
export const pathwaysRecursosGenerales = {
  tummy_time: {
    titulo: "Tummy Time",
    descripcion: "Guía completa sobre tiempo boca abajo",
    url: "https://pathways.org/tummy-timer",
    tipo: "herramienta_interactiva"
  },
  
  app_movil: {
    titulo: "Pathways.org Mobile App",
    descripcion: "App para rastrear hitos del desarrollo",
    ios: "https://apps.apple.com/us/app/pathways-org/...",
    android: "https://play.google.com/store/apps/details?id=org.pathways...",
    tipo: "aplicacion"
  },
  
  red_flags: {
    titulo: "Señales de Alerta",
    descripcion: "Cuándo preocuparse por el desarrollo",
    url: "https://pathways.org/suspect-a-delay",
    tipo: "articulo_critico"
  },
  
  early_intervention: {
    titulo: "Intervención Temprana",
    descripcion: "Qué hacer si sospecha un retraso",
    url: "https://pathways.org/early-detection-early-intervention",
    tipo: "guia"
  }
};

/**
 * Helper function para obtener recursos por edad
 */
export function getRecursosPorEdad(edad) {
  return pathwaysResources[edad] || null;
}

/**
 * Helper function para obtener todos los recursos de una categoría
 */
export function getRecursosPorCategoria(edad, categoria) {
  const recursos = pathwaysResources[edad];
  if (!recursos || !recursos.categorias) return [];
  
  return recursos.categorias[categoria]?.recursos || [];
}

/**
 * Helper function para buscar recursos por tag
 */
export function buscarRecursosPorTag(tag) {
  const resultados = [];
  
  Object.entries(pathwaysResources).forEach(([edad, data]) => {
    if (edad.startsWith('_')) return; // Skip templates
    
    if (data.categorias) {
      Object.values(data.categorias).forEach(categoria => {
        if (Array.isArray(categoria.recursos)) {
          categoria.recursos.forEach(recurso => {
            if (recurso.tags && recurso.tags.includes(tag)) {
              resultados.push({ ...recurso, edad: data.nombre });
            }
          });
        }
      });
      
      // Check recursos_generales
      if (Array.isArray(data.categorias.recursos_generales)) {
        data.categorias.recursos_generales.forEach(recurso => {
          if (recurso.tags && recurso.tags.includes(tag)) {
            resultados.push({ ...recurso, edad: data.nombre });
          }
        });
      }
    }
  });
  
  return resultados;
}

/**
 * Helper function para obtener URL del canal de YouTube
 */
export function getYouTubeChannel() {
  return pathwaysMetadata.youtube;
}

export default pathwaysResources;
