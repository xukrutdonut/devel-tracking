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
    // En HTTPS, siempre usar ruta relativa
    return '/api';
  }
  
  // En desarrollo con HTTP
  if (import.meta.env.DEV) {
    // Si es localhost, podemos usar el puerto directo
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8001/api';
    }
    // Para otros casos, usar proxy
    return '/api';
  }
  
  // En producción, usar ruta relativa (asume proxy/nginx configurado)
  return '/api';
};

export const API_URL = getApiUrl();

// Log para debugging
console.log('🔧 API_URL configurado:', getApiUrl());
console.log('🔧 Protocol:', window.location.protocol);
console.log('🔧 Hostname:', window.location.hostname);
console.log('🔧 Modo:', import.meta.env.DEV ? 'Desarrollo' : 'Producción');


