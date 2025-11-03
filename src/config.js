// Configuración de la API
const getApiUrl = () => {
  // Si hay una variable de entorno definida, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Obtener el hostname y protocol actual
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // 'http:' o 'https:'
  
  // IMPORTANTE: Si estamos en HTTPS desde un dominio externo,
  // necesitamos usar una ruta relativa para el proxy
  if (protocol === 'https:') {
    // En HTTPS, siempre usar ruta relativa (proxy configurado en vite.config.mjs)
    return '/api';
  }
  
  // Si NO es localhost, siempre usar proxy (independientemente de HTTP/HTTPS)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return '/api';
  }
  
  // Solo en localhost con HTTP usar puerto directo
  return 'http://localhost:8001/api';
};

export const API_URL = getApiUrl();


