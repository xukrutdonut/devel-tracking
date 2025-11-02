# 🔐 Sistema de Autenticación y Gestión de Usuarios

## ✅ Estado de Implementación

Se ha implementado un sistema completo de autenticación con JWT (JSON Web Tokens) que incluye:

- ✅ Registro de nuevos usuarios
- ✅ Login con email y contraseña
- ✅ Roles de usuario (usuario/admin)
- ✅ Gestión de sesiones con tokens JWT
- ✅ Protección de rutas del API
- ✅ Panel de administración
- ✅ Cada usuario puede gestionar solo sus niños
- ✅ Admin puede ver y gestionar todos los niños

## 📦 Componentes Implementados

### Backend (Node.js + Express)

#### 1. Base de Datos (`database.js`)
- **Tabla `usuarios`**: email, password_hash, nombre, rol, activo
- **Migración automática**: Añade campo `usuario_id` a tabla `ninos`
- **Usuario admin por defecto**: Se crea automáticamente al iniciar

#### 2. Middleware de Autenticación (`authMiddleware.js`)
- `verificarToken()`: Middleware para proteger rutas
- `verificarAdmin()`: Middleware para rutas solo de admin
- `generarToken()`: Función para crear JWT

#### 3. Rutas de Autenticación (en `server.js`)

**Públicas:**
- `POST /api/auth/registro` - Registro de nuevo usuario
- `POST /api/auth/login` - Inicio de sesión

**Protegidas:**
- `GET /api/auth/verificar` - Verificar token actual
- `GET /api/auth/perfil` - Obtener perfil del usuario
- `POST /api/auth/cambiar-password` - Cambiar contraseña

**Solo Admin:**
- `GET /api/admin/usuarios` - Listar todos los usuarios
- `PUT /api/admin/usuarios/:id/toggle-activo` - Activar/Desactivar usuario
- `PUT /api/admin/usuarios/:id/cambiar-rol` - Cambiar rol (usuario/admin)
- `GET /api/admin/ninos` - Ver todos los niños de todos los usuarios

#### 4. Rutas Protegidas de Niños
- `GET /api/ninos` - Lista niños del usuario (admin ve todos)
- `POST /api/ninos` - Crear niño (se asigna al usuario actual)
- `GET /api/ninos/:id` - Ver niño (verifica pertenencia)
- `DELETE /api/ninos/:id` - Eliminar niño (verifica pertenencia)

### Frontend (React)

#### 1. Componente Login (`Login.jsx`)
- **Modos**: Login y Registro
- **Validación**: Email, contraseña mínima 6 caracteres
- **Diseño**: Profesional con gradientes
- **Credenciales de prueba mostradas**

#### 2. Servicio de Autenticación (`authService.js`)
Funciones utilitarias:
- `getToken()` - Obtener token del localStorage
- `getUsuario()` - Obtener datos del usuario
- `estaAutenticado()` - Verificar si hay sesión activa
- `esAdmin()` - Verificar si es administrador
- `cerrarSesion()` - Cerrar sesión
- `getAuthHeaders()` - Headers con autenticación
- `fetchConAuth()` - Fetch con token automático

#### 3. App.jsx Actualizado
- **Control de autenticación**: Muestra Login si no hay sesión
- **Header mejorado**: Muestra nombre de usuario y botón de cerrar sesión
- **Badge de ADMIN**: Visible para administradores
- **Fetch con autenticación**: Usa `fetchConAuth()`

## 🔑 Credenciales por Defecto

### Usuario Administrador
```
Email: admin@neuropedialab.org
Contraseña: admin123
```

**IMPORTANTE**: Cambiar esta contraseña en producción

## 📋 Cómo Usar el Sistema

### Para Usuarios Normales

1. **Registro**:
   - Ir a la aplicación
   - Hacer clic en "Registrarse"
   - Completar nombre, email y contraseña (mín. 6 caracteres)
   - Hacer clic en "Crear Cuenta"

2. **Login**:
   - Ingresar email y contraseña
   - Hacer clic en "Iniciar Sesión"

3. **Gestionar Niños**:
   - Crear niños propios
   - Ver solo los niños creados por el usuario
   - Editar y eliminar solo propios niños

4. **Cerrar Sesión**:
   - Hacer clic en "Cerrar Sesión" en el header

### Para Administradores

1. **Acceso Total**:
   - Ver todos los niños de todos los usuarios
   - Los niños muestran email del usuario propietario

2. **Panel de Administración** (⚠️ Pendiente de UI):
   - Listar todos los usuarios
   - Activar/Desactivar usuarios
   - Cambiar roles (promover a admin o degradar a usuario)

## 🔒 Seguridad Implementada

### Backend
- ✅ **Hash de contraseñas**: bcryptjs con salt de 10 rondas
- ✅ **JWT**: Tokens firmados con clave secreta
- ✅ **Expiración de tokens**: 7 días
- ✅ **Validación de pertenencia**: Usuarios solo ven/editan sus datos
- ✅ **Verificación de roles**: Rutas admin protegidas
- ✅ **Prevención de SQL injection**: Uso de parámetros preparados

### Frontend
- ✅ **Token en localStorage**: Persistencia de sesión
- ✅ **Headers automáticos**: Token incluido en todas las peticiones
- ✅ **Renovación de sesión**: Redirige a login si token expira
- ✅ **Validación de formularios**: Contraseña mínima, email válido

## ⚙️ Configuración

### Variables de Entorno (Recomendadas para Producción)

```bash
# Backend
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
PORT=8001

# Frontend
VITE_API_URL=https://tu-dominio.com/api
```

### Cambiar Clave JWT

En `server/authMiddleware.js`:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_personalizada';
```

O establecer variable de entorno:
```bash
export JWT_SECRET="clave_muy_segura_123"
```

## 📝 Tareas Pendientes

### Críticas
- [ ] Actualizar todos los componentes para usar `fetchConAuth()`
  - [ ] HitosRegistro.jsx
  - [ ] GraficoDesarrollo.jsx
  - [ ] RedFlagsRegistro.jsx
  - [ ] EjemplosClinicos.jsx
  - [ ] AnalisisAceleracion.jsx
  - [ ] ClasificacionTrayectorias.jsx

### Rutas del API a Proteger
- [ ] GET `/api/hitos-no-alcanzados/:ninoId`
- [ ] POST `/api/hitos-no-alcanzados`
- [ ] DELETE `/api/hitos-no-alcanzados/:id`
- [ ] GET `/api/red-flags-observadas/:ninoId`
- [ ] POST `/api/red-flags-observadas`
- [ ] DELETE `/api/red-flags-observadas/:id`
- [ ] GET `/api/analisis/:ninoId`

### Funcionalidades Admin
- [ ] Crear componente `AdminPanel.jsx`
- [ ] Lista de usuarios con acciones (activar/desactivar, cambiar rol)
- [ ] Lista de todos los niños con filtros por usuario
- [ ] Estadísticas globales
- [ ] Logs de acceso

### Mejoras de UX
- [ ] Recordar sesión (checkbox "Mantener sesión iniciada")
- [ ] Recuperación de contraseña por email
- [ ] Confirmación de email en registro
- [ ] Cambiar contraseña desde perfil de usuario
- [ ] Avatar de usuario
- [ ] Última fecha de acceso

### Seguridad Adicional
- [ ] Rate limiting en login (prevenir ataques de fuerza bruta)
- [ ] Captcha en registro
- [ ] Logs de actividad del usuario
- [ ] Notificaciones de login desde nuevo dispositivo
- [ ] Doble factor de autenticación (2FA)

## 🛠️ Migración de Componentes a fetchConAuth

### Ejemplo de Migración

**ANTES:**
```javascript
const response = await fetch(`${API_URL}/ninos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**DESPUÉS:**
```javascript
import { fetchConAuth } from '../utils/authService';

const response = await fetchConAuth(`${API_URL}/ninos`, {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**NOTA**: `fetchConAuth` añade automáticamente:
- Header `Content-Type: application/json`
- Header `Authorization: Bearer TOKEN`
- Manejo de sesión expirada (redirect a login)

## 🧪 Pruebas

### Probar Registro
```bash
curl -X POST http://localhost:8001/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "nombre": "Usuario de Prueba"
  }'
```

### Probar Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@neuropedialab.org",
    "password": "admin123"
  }'
```

### Probar Ruta Protegida
```bash
# Obtener token del login anterior
TOKEN="tu_token_aqui"

curl -X GET http://localhost:8001/api/ninos \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Estructura de Datos

### Token JWT Payload
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "rol": "usuario",
  "nombre": "Nombre Usuario",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Usuario en localStorage
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "nombre": "Nombre Usuario",
  "rol": "usuario"
}
```

## 🚀 Próximos Pasos

1. **Migrar todos los componentes** para usar `fetchConAuth()`
2. **Proteger todas las rutas del API** que acceden a datos de niños
3. **Crear panel de administración** con UI completa
4. **Añadir recuperación de contraseña**
5. **Implementar rate limiting**
6. **Añadir tests unitarios** para autenticación

## 📞 Soporte

Para problemas o preguntas:
1. Verificar logs del backend: `docker-compose logs backend`
2. Verificar console del navegador (F12)
3. Verificar token en localStorage del navegador
4. Probar con usuario admin por defecto

---

**Estado**: ✅ Sistema base implementado y funcional  
**Fecha**: 1 de noviembre de 2024  
**Versión**: 1.0.0  
**Siguiente actualización**: Panel de administración completo
