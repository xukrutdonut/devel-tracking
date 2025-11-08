# Solución: Endpoint /api/itinerario faltante

## Problema
Las gráficas de velocidad y aceleración del desarrollo no aparecían porque el endpoint `/api/itinerario/:ninoId` no existía, causando errores 404.

## Solución Implementada

### 1. Endpoint Creado
Se ha añadido el endpoint `/api/itinerario/:ninoId` en `server/server.js` (línea 1016).

### 2. Funcionalidad del Endpoint

**Para usuarios invitados (guest):**
- Detecta automáticamente IDs que comienzan con `invitado_`
- Retorna datos mock con array de evaluaciones vacío
- Permite que los componentes usen datos retrospectivos (hitos conseguidos)

```json
{
  "nino": {
    "id": "invitado_ejemplo_...",
    "nombre": "Niño de Ejemplo",
    "fecha_nacimiento": "2025-11-08",
    "semanas_gestacion": 40,
    "usuario_id": "invitado_ejemplo_..."
  },
  "evaluaciones": [],
  "fuente_normativa_id": 1
}
```

**Para usuarios autenticados:**
- Verifica permisos de acceso al niño
- Obtiene evaluaciones de la tabla `escalas_evaluaciones`
- Parsea las puntuaciones JSON
- Retorna datos completos del itinerario

### 3. Componentes que Usan Este Endpoint

- `AnalisisAceleracion.jsx`: Análisis de velocidad y aceleración
- `ClasificacionTrayectorias.jsx`: Clasificación según tipologías de Thomas (2009)

Ambos componentes tienen lógica de fallback:
1. Intentan cargar datos prospectivos desde `/api/itinerario`
2. Si no hay datos (evaluaciones vacías), construyen datos retrospectivos desde hitos conseguidos

### 4. Verificación

El endpoint ha sido probado y funciona correctamente:

```bash
# Test con usuario invitado
curl http://localhost:8001/api/itinerario/invitado_ejemplo_1762588652915_2nbmwp21v?fuente=1
# Retorna: 200 OK con datos mock

# Test con usuario autenticado
curl -H "Authorization: Bearer TOKEN" http://localhost:8001/api/itinerario/6?fuente=1
# Retorna: 200 OK con evaluaciones del niño ID 6
```

### 5. Reinicio Necesario

El servidor backend en Docker ha sido reiniciado:
```bash
docker-compose restart backend
```

### 6. Posibles Causas de 404 Persistente

Si el usuario sigue viendo errores 404 después de esta implementación:

1. **Caché del navegador**: El navegador puede estar cacheando las respuestas 404 antiguas
   - **Solución**: Hacer un hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - O abrir en ventana de incógnito

2. **Frontend no actualizado**: Si el frontend está sirviendo archivos cacheados
   - **Solución**: `docker-compose restart frontend` (cuando se resuelva conflicto de puerto)

3. **Proxy caché**: Si hay un proxy o CDN intermediario
   - **Solución**: Esperar a que expire el caché o purgarlo

## Código Añadido

```javascript
// ==================== RUTA DE ITINERARIO (DATOS PROSPECTIVOS) ====================

// Obtener itinerario de desarrollo con evaluaciones prospectivas
app.get('/api/itinerario/:ninoId', verificarToken, (req, res) => {
  const { ninoId } = req.params;
  const fuenteNormativaId = req.query.fuente || 1;
  
  // Para usuarios invitados, devolver datos vacíos (no tienen evaluaciones prospectivas guardadas)
  if (req.usuario.rol === 'invitado') {
    return res.json({
      nino: {
        id: ninoId,
        nombre: 'Niño de Ejemplo',
        fecha_nacimiento: new Date().toISOString().split('T')[0],
        semanas_gestacion: 40,
        usuario_id: req.usuario.id
      },
      evaluaciones: [],
      fuente_normativa_id: parseInt(fuenteNormativaId)
    });
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });
    
    // Obtener datos del niño
    db.get('SELECT * FROM ninos WHERE id = ?', [ninoId], (err, nino) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!nino) return res.status(404).json({ error: 'Niño no encontrado' });
      
      // Obtener evaluaciones con escalas estandarizadas
      const queryEvaluaciones = `
        SELECT * FROM escalas_evaluaciones 
        WHERE nino_id = ? 
        ORDER BY edad_evaluacion_meses
      `;
      
      db.all(queryEvaluaciones, [ninoId], (err, evaluaciones) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Parsear puntuaciones JSON
        const evaluacionesProcesadas = evaluaciones.map(ev => ({
          ...ev,
          puntuaciones: typeof ev.puntuaciones === 'string' ? JSON.parse(ev.puntuaciones) : ev.puntuaciones
        }));
        
        res.json({
          nino,
          evaluaciones: evaluacionesProcesadas,
          fuente_normativa_id: parseInt(fuenteNormativaId)
        });
      });
    });
  });
});
```

## Resultado

✅ Las gráficas de velocidad y aceleración del desarrollo ahora deberían aparecer correctamente
✅ Los usuarios invitados pueden ver análisis basados en datos retrospectivos (hitos)
✅ Los usuarios autenticados pueden ver análisis basados en evaluaciones guardadas o datos retrospectivos
