// Configuración de la API
// En producción o acceso desde red, usar la IP del servidor o dominio
// En desarrollo local, usar localhost
const getApiUrl = () => {
  // Si hay una variable de entorno definida, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Obtener el hostname actual
  const hostname = window.location.hostname;
  
  // Si es localhost o 127.0.0.1, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8001/api';
  }
  
  // Para cualquier otra IP o dominio, usar el mismo hostname
  return `http://${hostname}:8001/api`;
};

export const API_URL = getApiUrl();
