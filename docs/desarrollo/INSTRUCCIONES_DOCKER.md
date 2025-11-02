# 🐳 Sistema de Seguimiento del Neurodesarrollo en Docker

## ✅ ¡La aplicación está lista y funcionando!

### 🚀 Servicios Activos

- **Backend API**: http://localhost:8001
- **Frontend Web**: http://localhost:8000

### 📊 Estado Actual

```bash
# Ver contenedores corriendo
docker-compose ps
```

Deberías ver:
- `neurodesarrollo-backend` corriendo en puerto 8001
- `neurodesarrollo-frontend` corriendo en puerto 8000

---

## 🎯 Acceder a la Aplicación

### Abrir en el navegador:
```
http://localhost:8000
```

### Probar la API:
```bash
curl http://localhost:8001/api/dominios
```

---

## 🔧 Comandos Útiles

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Reiniciar servicios
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo backend
docker-compose restart backend

# Reiniciar solo frontend
docker-compose restart frontend
```

### Detener servicios
```bash
docker-compose stop
```

### Iniciar servicios (si están detenidos)
```bash
docker-compose start
```

### Detener y eliminar contenedores
```bash
docker-compose down
```

### Detener y eliminar TODO (incluye volúmenes/base de datos)
```bash
docker-compose down -v
```

### Reconstruir imágenes
```bash
docker-compose up --build -d
```

---

## 📁 Persistencia de Datos

La base de datos SQLite se guarda en:
- **Volumen Docker**: `devel-tracking_db-data`
- **Ruta en contenedor**: `/app/data`

### Hacer backup de la base de datos
```bash
# Copiar BD del contenedor al host
docker cp neurodesarrollo-backend:/app/server/neurodesarrollo.db ./backup_$(date +%Y%m%d).db
```

### Restaurar backup
```bash
# Copiar BD del host al contenedor
docker cp backup_20241030.db neurodesarrollo-backend:/app/server/neurodesarrollo.db

# Reiniciar el backend
docker-compose restart backend
```

---

## 🐛 Solución de Problemas

### El frontend no conecta con el backend
```bash
# Verificar que ambos contenedores estén en la misma red
docker network inspect devel-tracking_neurodesarrollo-network

# Verificar logs del backend
docker-compose logs backend

# Reiniciar servicios
docker-compose restart
```

### Error "address already in use"
```bash
# Cambiar puertos en docker-compose.yml
ports:
  - "9000:3000"  # Cambia 9000 por el puerto que prefieras
  - "9001:3001"
```

### Los cambios en el código no se reflejan
```bash
# Frontend: Los cambios en src/ se reflejan automáticamente (hot reload)
# Backend: Reiniciar el contenedor
docker-compose restart backend

# Si los cambios aún no se ven, reconstruir
docker-compose up --build -d
```

### Ver qué puertos están en uso
```bash
# En el host
netstat -tlnp | grep -E "8000|8001"
lsof -i :8000
lsof -i :8001
```

### Entrar a un contenedor para debugging
```bash
# Backend
docker exec -it neurodesarrollo-backend sh

# Frontend
docker exec -it neurodesarrollo-frontend sh
```

### Ver uso de recursos
```bash
docker stats
```

---

## 📊 Arquitectura

```
┌─────────────────────────────────────────┐
│      Host (tu computadora)              │
│                                         │
│  Puerto 8000 ──┐      ┌── Puerto 8001  │
│                │      │                 │
│  ┌─────────────▼──────▼──────────────┐ │
│  │  Docker Network                   │ │
│  │  (neurodesarrollo-network)        │ │
│  │                                   │ │
│  │  ┌──────────┐    ┌──────────┐    │ │
│  │  │ Frontend │◄───►│ Backend  │    │ │
│  │  │  Vite    │    │  Express │    │ │
│  │  │  :3000   │    │  :3001   │    │ │
│  │  └──────────┘    └─────┬────┘    │ │
│  │                        │         │ │
│  │                   ┌────▼─────┐   │ │
│  │                   │  SQLite  │   │ │
│  │                   │ (Volume) │   │ │
│  │                   └──────────┘   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📝 Flujo de Trabajo de Desarrollo

### 1. Modificar código frontend (src/)
- Los cambios se reflejan automáticamente (hot reload)
- No es necesario reiniciar el contenedor

### 2. Modificar código backend (server/)
```bash
# Reiniciar el backend para aplicar cambios
docker-compose restart backend
```

### 3. Cambiar dependencias (package.json)
```bash
# Reconstruir las imágenes
docker-compose down
docker-compose up --build -d
```

### 4. Ver cambios en la base de datos
```bash
# Entrar al contenedor backend
docker exec -it neurodesarrollo-backend sh

# Acceder a SQLite
cd server
sqlite3 neurodesarrollo.db

# Comandos SQLite útiles:
.tables              # Ver tablas
.schema ninos        # Ver estructura de tabla
SELECT * FROM ninos; # Ver datos
.exit                # Salir
```

---

## 🚀 Despliegue en Producción

### Opción 1: Docker Compose en servidor
```bash
# En el servidor
git clone <tu-repositorio>
cd devel-tracking

# Iniciar servicios
docker-compose up -d

# Configurar un reverse proxy (Nginx/Caddy)
```

### Opción 2: Cambiar a PostgreSQL
Para producción con múltiples usuarios, considera cambiar de SQLite a PostgreSQL:

```yaml
# Agregar servicio PostgreSQL en docker-compose.yml
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: neurodesarrollo
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

---

## 🔐 Seguridad

### Para producción:
1. **Cambiar puertos por defecto**
2. **Usar HTTPS** (certificados SSL)
3. **Implementar autenticación**
4. **Limitar acceso a la API**
5. **Configurar CORS apropiadamente**
6. **Usar secrets para credenciales**

---

## 📖 Documentación Adicional

- **README.md** - Documentación completa del proyecto
- **GUIA_CLINICA.md** - Guía de interpretación clínica
- **INICIO_RAPIDO.md** - Guía de inicio rápido
- **DOCKER_README.md** - Documentación detallada de Docker

---

## ✅ Verificación

Para verificar que todo funciona correctamente:

```bash
# 1. Verificar contenedores
docker-compose ps

# 2. Verificar logs (no debe haber errores)
docker-compose logs

# 3. Probar backend
curl http://localhost:8001/api/dominios

# 4. Abrir frontend en navegador
# http://localhost:8000

# 5. Crear un niño de prueba
# Usar la interfaz web
```

---

## 🎉 ¡Todo Listo!

Tu Sistema de Seguimiento del Neurodesarrollo está funcionando en Docker.

**URLs de acceso:**
- 🌐 Aplicación Web: **http://localhost:8000**
- 🔧 API Backend: **http://localhost:8001**

Para cualquier problema, consulta los logs:
```bash
docker-compose logs -f
```

---

**Desarrollado con ❤️ para profesionales de la salud infantil**
