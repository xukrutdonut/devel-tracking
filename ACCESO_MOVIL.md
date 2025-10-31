# Acceso desde Móvil

## ✅ Problema Resuelto

La aplicación ahora está configurada para funcionar automáticamente desde cualquier dispositivo en la red local (móvil, tablet, etc).

## Configuración actual

### IP del servidor
- **IP local**: 192.168.0.12

### Puertos
- **Frontend (Vite)**: 3000
- **Backend (API)**: 8001

## Cómo acceder desde móvil

1. **Asegúrate de estar en la misma red WiFi** que el servidor

2. **Abre el navegador de tu móvil** y ve a:
   ```
   http://192.168.0.12:3000
   ```

3. **¡Listo!** La aplicación se conectará automáticamente al backend usando la IP correcta

## ¿Cómo funciona?

La aplicación ahora detecta automáticamente desde qué IP se accede y usa esa misma IP para las llamadas a la API:

- Si accedes desde `http://192.168.0.12:3000`, la app usa `http://192.168.0.12:8001/api`
- Si accedes desde `http://localhost:3000`, la app usa `http://localhost:8001/api`

Este comportamiento está configurado en `src/config.js`:
```javascript
export const API_URL = `http://${window.location.hostname}:8001/api`;
```

## Solución de problemas

### Si aparece "Error al crear niño" o no carga:

1. **Verifica la conexión WiFi**: Ambos dispositivos deben estar en la **misma red**

2. **Verifica el firewall**: Asegúrate de que los puertos estén abiertos:
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw allow 8001/tcp
   ```

3. **Verifica que los servicios estén corriendo**:
   ```bash
   ps aux | grep node
   # Deberías ver dos procesos: uno en puerto 3000 y otro en 8001
   ```

4. **Verifica la IP del servidor** (puede cambiar si reinicias el router):
   ```bash
   hostname -I | awk '{print $1}'
   ```

5. **Prueba la API directamente** desde tu móvil:
   ```
   http://192.168.0.12:8001/api/dominios
   ```
   Deberías ver una respuesta JSON con los dominios

6. **Limpia la caché del navegador** en tu móvil y recarga la página

## Cambios realizados

Los siguientes archivos fueron actualizados para soportar acceso desde red local:

1. ✅ `src/config.js` - Configuración centralizada de la URL de la API
2. ✅ `src/App.jsx` - Importa la configuración
3. ✅ `src/components/NinoForm.jsx` - Importa la configuración
4. ✅ `src/components/NinosList.jsx` - Importa la configuración
5. ✅ `src/components/HitosRegistro.jsx` - Importa la configuración
6. ✅ `src/components/GraficoDesarrollo.jsx` - Importa la configuración
7. ✅ `src/components/RedFlagsRegistro.jsx` - Importa la configuración
8. ✅ `server/server.js` - CORS configurado para aceptar cualquier origen
9. ✅ `vite.config.mjs` - Servidor escuchando en 0.0.0.0 (todas las interfaces de red)

## Nota para desarrollo

Si necesitas especificar una URL de API diferente, puedes usar una variable de entorno:

```bash
VITE_API_URL=http://otra-ip:8001/api npm run dev
```
