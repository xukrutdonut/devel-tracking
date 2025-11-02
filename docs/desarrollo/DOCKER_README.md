# 🐳 Ejecutar con Docker

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

Ejecuta toda la aplicación (backend + frontend) con un solo comando:

```bash
docker-compose up --build
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Opción 2: Docker Compose en segundo plano

```bash
docker-compose up -d --build
```

Ver logs:
```bash
docker-compose logs -f
```

Detener:
```bash
docker-compose down
```

### Opción 3: Solo Backend

```bash
docker-compose up backend
```

### Opción 4: Solo Frontend

```bash
docker-compose up frontend
```

---

## 📦 Comandos Útiles de Docker

### Construir la imagen
```bash
docker build -t neurodesarrollo:latest .
```

### Ejecutar solo el backend
```bash
docker run -d -p 3001:3001 --name neurodesarrollo-backend neurodesarrollo:latest server
```

### Ejecutar solo el frontend
```bash
docker run -d -p 3000:3000 --name neurodesarrollo-frontend neurodesarrollo:latest dev
```

### Ver contenedores corriendo
```bash
docker ps
```

### Ver logs de un contenedor
```bash
docker logs neurodesarrollo-backend
docker logs neurodesarrollo-frontend
```

### Entrar a un contenedor
```bash
docker exec -it neurodesarrollo-backend sh
```

### Detener contenedores
```bash
docker stop neurodesarrollo-backend neurodesarrollo-frontend
```

### Eliminar contenedores
```bash
docker rm neurodesarrollo-backend neurodesarrollo-frontend
```

### Limpiar todo (contenedores, imágenes, volúmenes)
```bash
docker-compose down -v
docker system prune -a
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

Puedes crear un archivo `.env` en la raíz del proyecto:

```env
# Puerto del backend
BACKEND_PORT=3001

# Puerto del frontend
FRONTEND_PORT=3000

# Modo de Node
NODE_ENV=production
```

### Persistencia de Datos

La base de datos se guarda en un volumen de Docker:

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar el volumen de datos
docker volume inspect devel-tracking_db-data

# Backup de la base de datos
docker cp neurodesarrollo-backend:/app/server/neurodesarrollo.db ./backup.db
```

### Desarrollo con Hot Reload

El docker-compose está configurado para desarrollo con hot reload:
- Los cambios en `src/` se reflejan automáticamente en el frontend
- Los cambios en `server/` requieren reiniciar el contenedor backend

```bash
# Reiniciar solo el backend
docker-compose restart backend

# Reiniciar solo el frontend
docker-compose restart frontend
```

---

## 🐛 Solución de Problemas

### Puerto ocupado
```bash
# Encontrar qué proceso usa el puerto
lsof -i :3000
lsof -i :3001

# Cambiar puertos en docker-compose.yml
ports:
  - "8000:3000"  # Cambia 8000 por el puerto que prefieras
```

### Error de permisos en volúmenes
```bash
# Dar permisos
chmod -R 755 server/

# O ejecutar con privilegios
docker-compose up --build --force-recreate
```

### La base de datos no se crea
```bash
# Eliminar volumen y recrear
docker-compose down -v
docker-compose up --build
```

### Logs no se muestran
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver solo logs del backend
docker-compose logs -f backend

# Ver solo logs del frontend
docker-compose logs -f frontend
```

---

## 📊 Arquitectura Docker

```
┌─────────────────────────────────────┐
│         Docker Network              │
│    (neurodesarrollo-network)        │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Backend    │  │  Frontend   │ │
│  │  (Node.js)   │  │  (Vite)     │ │
│  │  Puerto 3001 │  │  Puerto 3000│ │
│  └──────────────┘  └─────────────┘ │
│         │                           │
│  ┌──────▼──────┐                   │
│  │   SQLite    │                   │
│  │  (Volume)   │                   │
│  └─────────────┘                   │
└─────────────────────────────────────┘
```

---

## 🚀 Despliegue en Producción

### Usando Docker Compose

1. **Preparar el servidor**
```bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

2. **Clonar y ejecutar**
```bash
git clone <tu-repositorio>
cd devel-tracking
docker-compose up -d --build
```

3. **Configurar proxy inverso (opcional)**
```nginx
# Nginx config
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

### Usando Docker Swarm o Kubernetes

Para escalabilidad, puedes usar orquestadores como Docker Swarm o Kubernetes. Consulta la documentación específica de cada herramienta.

---

## 📝 Notas

- La base de datos SQLite es adecuada para uso en desarrollo y pequeña escala
- Para producción con múltiples usuarios, considera migrar a PostgreSQL o MySQL
- Los volúmenes de Docker persisten los datos entre reinicios
- El modo desarrollo incluye hot-reload automático

---

## ✅ Checklist de Verificación

- [ ] Docker instalado (`docker --version`)
- [ ] Docker Compose instalado (`docker-compose --version`)
- [ ] Puertos 3000 y 3001 disponibles
- [ ] Contenedores iniciados correctamente (`docker ps`)
- [ ] Backend responde en http://localhost:3001/api/dominios
- [ ] Frontend accesible en http://localhost:3000

---

¡Tu aplicación está lista para usar en Docker! 🎉
