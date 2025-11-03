# Configuración de Servidores Autorizados (CORS)

## Cambios realizados

Se ha modificado la configuración de CORS en el servidor para restringir el acceso solo a los servidores autorizados.

### Servidores autorizados:

#### Desarrollo local:
- `http://localhost:3002`
- `http://localhost:5173`
- `http://127.0.0.1:3002`
- `http://127.0.0.1:5173`

#### Servidor de desarrollo:
- `https://dev.neuropedialab.org`

#### Servidor de producción:
- `https://devel-tracking.neuropedialab.org`

## Implementación

### Archivo modificado: `/server/server.js`

```javascript
const allowedOrigins = [
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
  'https://dev.neuropedialab.org',
  'https://devel-tracking.neuropedialab.org'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS de este sitio no permite el acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

## Características de seguridad

1. **Lista blanca de orígenes**: Solo los dominios especificados pueden acceder a la API
2. **Requests sin origin permitidos**: Para compatibilidad con aplicaciones móviles y herramientas CLI
3. **Credenciales habilitadas**: `credentials: true` permite enviar cookies y headers de autenticación
4. **Métodos HTTP restringidos**: Solo GET, POST, PUT, DELETE, OPTIONS
5. **Headers permitidos**: Content-Type y Authorization

## Beneficios

- ✅ Previene acceso no autorizado desde otros dominios
- ✅ Protege contra ataques CSRF desde dominios maliciosos
- ✅ Mantiene la funcionalidad de desarrollo local
- ✅ Soporta entornos de desarrollo y producción
- ✅ Compatible con herramientas de prueba sin navegador

## Notas importantes

- **Desarrollo local**: Funciona tanto con localhost como con 127.0.0.1
- **HTTPS requerido**: Los servidores de desarrollo y producción deben usar HTTPS
- **Sin origin**: Requests sin header Origin (como curl, Postman, apps móviles) son permitidos
- **Reinicio necesario**: Después de modificar esta configuración, el servidor debe reiniciarse

## Testing

Para verificar que la configuración funciona correctamente:

```bash
# Desde un origen permitido (debería funcionar)
curl -H "Origin: https://dev.neuropedialab.org" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8001/api/hitos-normativos

# Desde un origen no permitido (debería fallar)
curl -H "Origin: https://sitio-malicioso.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8001/api/hitos-normativos
```

## Para añadir nuevos servidores

Si necesitas añadir un nuevo servidor autorizado, edita el array `allowedOrigins` en `/server/server.js`:

```javascript
const allowedOrigins = [
  // ... servidores existentes
  'https://nuevo-servidor.com'
];
```

Luego reinicia el servidor.
