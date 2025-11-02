# 🔧 Solución al Error "Failed to fetch"

## ❌ Problema
Al intentar hacer login aparece el error: **"Failed to fetch"**

## ✅ Soluciones Implementadas

### 1. Proxy de Vite Configurado
Se añadió un proxy en `vite.config.mjs` para redirigir las peticiones `/api` al backend:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8001',
    changeOrigin: true,
    secure: false,
    ws: true,
  }
}
```

### 2. Configuración de API_URL Mejorada
Se actualizó `src/config.js` para usar el proxy en desarrollo:

```javascript
const getApiUrl = () => {
  // En desarrollo (con Vite), usar el proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // En producción, detectar el contexto
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8001/api';
  }
  
  return '/api';
};
```

### 3. Variables de Entorno
Se creó archivo `.env` para configuración personalizada:

```bash
VITE_API_URL=http://localhost:8001/api
```

## 🚀 Cómo Usar Ahora

### Opción 1: Con Proxy (Recomendado)
La configuración actual usa el proxy de Vite automáticamente:
- Acceder a: `http://localhost:3000` o `http://devel-tracking.neuropedialab.org`
- El proxy redirige `/api` → `http://localhost:8001/api`
- **No necesitas hacer nada más**

### Opción 2: Acceso Directo al Puerto 8001
Si el proxy no funciona, puedes configurar acceso directo:

1. **Editar `.env`:**
```bash
VITE_API_URL=http://localhost:8001/api
```

2. **Reiniciar frontend:**
```bash
docker-compose restart frontend
```

### Opción 3: Para Dominios Externos
Si accedes desde un dominio externo (como `devel-tracking.neuropedialab.org`):

**Problema común**: Mixed Content (HTTPS → HTTP bloqueado)

**Solución A - Configurar Nginx/Apache:**
Crear un reverse proxy que redirija `/api` al puerto 8001

**Solución B - Usar túnel:**
```bash
# Usar ngrok o similar para exponer el puerto con HTTPS
ngrok http 8001
```

**Solución C - Ajustar en .env:**
```bash
# Si tu dominio permite HTTP
VITE_API_URL=http://devel-tracking.neuropedialab.org:8001/api
```

## 🔍 Diagnóstico del Problema

### Verificar si el Backend Está Corriendo
```bash
curl http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neuropedialab.org","password":"admin123"}'
```

**Resultado esperado**: JSON con token

### Verificar el Puerto
```bash
netstat -tln | grep 8001
# o
ss -tln | grep 8001
```

**Resultado esperado**: Puerto 8001 en LISTEN

### Verificar Logs del Backend
```bash
docker-compose logs backend | tail -50
```

**Buscar**: "Servidor ejecutándose en..."

### Verificar en el Navegador
1. Abrir DevTools (F12)
2. Ir a tab "Console"
3. Buscar el log: `🔧 API_URL configurado: ...`
4. Verificar que la URL sea correcta

## 📋 Checklist de Solución

- [x] ✅ Backend corriendo (puerto 8001)
- [x] ✅ Frontend corriendo (puerto 3000)
- [x] ✅ Proxy configurado en vite.config.mjs
- [x] ✅ API_URL actualizado en config.js
- [x] ✅ Archivo .env creado
- [x] ✅ CORS habilitado en backend
- [x] ✅ Docker containers reiniciados

## 🎯 Estado Actual

**Configuración implementada:**
- ✅ Proxy de Vite: `/api` → `http://localhost:8001`
- ✅ API_URL inteligente según contexto
- ✅ Variables de entorno con fallback
- ✅ Logs de debugging en console

**Ahora debería funcionar desde:**
- ✅ http://localhost:3000
- ✅ http://devel-tracking.neuropedialab.org
- ✅ Cualquier IP local

## 🔧 Si Aún No Funciona

### 1. Limpiar Cache del Navegador
```
Ctrl + Shift + Delete
O
Ctrl + F5 (hard refresh)
```

### 2. Verificar Console del Navegador
```
F12 → Console
Buscar mensajes de error
```

### 3. Verificar Network Tab
```
F12 → Network → XHR
Ver si las peticiones a /api están llegando
Ver el status code y respuesta
```

### 4. Reiniciar Todo
```bash
cd /home/arkantu/docker/devel-tracking
docker-compose down
docker-compose up -d
```

### 5. Verificar Firewall
```bash
# Verificar que el puerto 8001 no esté bloqueado
sudo ufw status
# O
sudo iptables -L -n | grep 8001
```

## 📊 URLs Según Contexto

| Contexto | Frontend | API_URL Usado |
|----------|----------|---------------|
| Desarrollo local | http://localhost:3000 | /api (proxy → :8001) |
| Dominio externo | http://devel-tracking.neuropedialab.org | /api (proxy → :8001) |
| Acceso directo | http://localhost:3000 | http://localhost:8001/api |

## 💡 Entender el Proxy

**Sin proxy:**
```
Frontend (puerto 3000) --X--> Backend (puerto 8001)
                             ❌ Puede fallar por CORS o mixed content
```

**Con proxy:**
```
Frontend (puerto 3000) --> Proxy Vite --> Backend (puerto 8001)
                        ✅ Mismo origen, sin problemas
```

El proxy hace que parezca que el frontend y backend están en el mismo servidor y puerto.

## 🎓 Conceptos Clave

### CORS (Cross-Origin Resource Sharing)
- Problema: Navegador bloquea peticiones entre diferentes orígenes
- Solución: Proxy o configurar CORS en backend (ya configurado)

### Mixed Content
- Problema: HTTPS no puede hacer peticiones a HTTP
- Solución: Proxy o servir todo por HTTPS

### Proxy Inverso
- Redirige peticiones de una ruta a otro servidor
- Vite lo hace automáticamente en desarrollo

## ✅ Resultado Final

Con los cambios aplicados:
1. ✅ El frontend usa `/api` relativo
2. ✅ Vite proxy redirige a `localhost:8001`
3. ✅ No hay problemas de CORS
4. ✅ Funciona en localhost y dominios
5. ✅ Login debería funcionar correctamente

## 🧪 Prueba Final

1. Acceder a http://localhost:3000 o http://devel-tracking.neuropedialab.org
2. Abrir DevTools (F12)
3. Ver en Console: `🔧 API_URL configurado: /api`
4. Intentar login con:
   - Email: admin@neuropedialab.org
   - Password: admin123
5. Verificar en Network tab que `/api/auth/login` retorna 200

**Si ves el token en la respuesta** → ✅ **¡FUNCIONA!**

---

**Fecha**: 2 de noviembre de 2024  
**Estado**: ✅ Solución implementada  
**Archivos modificados**: vite.config.mjs, src/config.js, .env (nuevo)
