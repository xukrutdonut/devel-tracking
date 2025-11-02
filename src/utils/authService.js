import { API_URL } from '../config';

// Obtener el token guardado
export function getToken() {
  return localStorage.getItem('token');
}

// Obtener usuario guardado
export function getUsuario() {
  // Primero verificar si es modo invitado
  if (esModoInvitado()) {
    return {
      id: 'invitado',
      email: 'invitado@local',
      nombre: 'Invitado',
      rol: 'invitado'
    };
  }
  
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

// Verificar si hay sesión activa
export function estaAutenticado() {
  return !!getToken() || esModoInvitado();
}

// Verificar si el usuario es admin
export function esAdmin() {
  const usuario = getUsuario();
  return usuario && usuario.rol === 'admin';
}

// Verificar si está en modo invitado
export function esModoInvitado() {
  return sessionStorage.getItem('modoInvitado') === 'true';
}

// Activar modo invitado
export function activarModoInvitado() {
  sessionStorage.setItem('modoInvitado', 'true');
  // Crear un ID único para esta sesión
  sessionStorage.setItem('invitadoSessionId', Date.now().toString());
}

// Cerrar sesión
export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('modoInvitado');
  sessionStorage.removeItem('invitadoSessionId');
  // Limpiar datos de invitado
  sessionStorage.removeItem('invitado_ninos');
}

// Crear headers con autenticación
export function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Hacer fetch con autenticación
export async function fetchConAuth(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  // Si el token es inválido, redirigir a login
  if (response.status === 401 && !esModoInvitado()) {
    cerrarSesion();
    window.location.reload();
    throw new Error('Sesión expirada');
  }

  return response;
}

// Verificar token actual
export async function verificarToken() {
  if (esModoInvitado()) {
    return true; // Modo invitado siempre válido
  }
  
  try {
    const response = await fetchConAuth(`${API_URL}/auth/verificar`);
    if (response.ok) {
      const data = await response.json();
      return data.valido;
    }
    return false;
  } catch (error) {
    return false;
  }
}

