# BUG CRÍTICO ENCONTRADO Y CORREGIDO

## Problema
Las gráficas de velocidad y aceleración no aparecían incluso con datos retrospectivos (múltiples hitos registrados).

## Causa Raíz: Error en nombre de campo de base de datos

### Ubicación del Bug
**Archivo**: `src/utils/trayectoriasUtils.js`  
**Líneas**: 71 y 75  
**Función**: `construirPuntosEvaluacion()`

### El Error
El código estaba buscando un campo llamado `desviacion_std`:
```javascript
if (hitoNormativo && hitoNormativo.edad_media_meses && hitoNormativo.desviacion_std) {
  // ...
  const zScore = (hito.edad_conseguido_meses - hitoNormativo.edad_media_meses) / hitoNormativo.desviacion_std;
}
```

Pero el campo real en la base de datos es `desviacion_estandar`:
```sql
CREATE TABLE hitos_normativos (
  ...
  desviacion_estandar REAL NOT NULL,
  ...
)
```

### Consecuencia
- La condición `hitoNormativo.desviacion_std` siempre era `undefined` (falsy)
- Nunca entraba al bloque if
- `count` permanecía en 0
- No se construían puntos de evaluación válidos
- Las gráficas no tenían datos para mostrar

### Solución Aplicada
Corregido el nombre del campo a `desviacion_estandar`:
```javascript
if (hitoNormativo && hitoNormativo.edad_media_meses && hitoNormativo.desviacion_estandar) {
  // ...
  const zScore = (hito.edad_conseguido_meses - hitoNormativo.edad_media_meses) / hitoNormativo.desviacion_estandar;
}
```

## Estado Actual

✅ **Bug corregido**  
✅ **Cambios aplicados vía HMR** (Hot Module Replacement)  
✅ **Endpoint `/api/itinerario` funcionando**  
✅ **Frontend ejecutándose en puerto 5173**

## Verificación

Las gráficas ahora deberían aparecer automáticamente para cualquier niño con:
- **2 o más hitos registrados** → Gráfica de velocidad
- **3 o más hitos registrados** → Gráfica de velocidad + aceleración

## Cómo Probar

1. Abre `http://localhost:5173`
2. Haz un **hard refresh** (Ctrl+Shift+R o Cmd+Shift+R)
3. Selecciona un niño con múltiples hitos registrados
4. Ve a la pestaña "Análisis de Aceleración"
5. Las gráficas deberían aparecer mostrando:
   - **Posición (Derivada 0)**: Cociente de Desarrollo (CD%)
   - **Velocidad (Derivada 1)**: Cambio de CD por mes
   - **Aceleración (Derivada 2)**: Cambio de velocidad por mes²

## Logs de Consola

Con los logs de debug añadidos, deberías ver en la consola del navegador:
```
📊 [AnalisisAceleracion] Hitos conseguidos: X
📊 [AnalisisAceleracion] Puntos de evaluación construidos: Y
✅ [AnalisisAceleracion] Datos retrospectivos cargados correctamente
```

Si `Y > 0`, las gráficas aparecerán.

## Archivos Modificados

1. ✅ `server/server.js` - Endpoint `/api/itinerario` añadido
2. ✅ `docker-compose.yml` - Puerto frontend cambiado a 5173
3. ✅ `src/utils/trayectoriasUtils.js` - **BUG CRÍTICO CORREGIDO**
4. ✅ `src/components/AnalisisAceleracion.jsx` - Logs de debug añadidos
5. ✅ `src/components/ClasificacionTrayectorias.jsx` - Logs de debug añadidos

## Resumen Técnico

Este bug es un ejemplo clásico de **inconsistencia en nombres de campos** entre:
- El esquema de base de datos (snake_case completo: `desviacion_estandar`)
- El código JavaScript (snake_case abreviado incorrecto: `desviacion_std`)

La corrección permite que la función `construirPuntosEvaluacion()` calcule correctamente:
1. Z-scores individuales de cada hito
2. Edad de Desarrollo (ED) por dominio
3. Cociente de Desarrollo (CD) por punto temporal
4. Puntos de evaluación válidos para las gráficas

Sin esta corrección, ningún hito normativo pasaba la validación y por tanto no se generaban puntos de evaluación, resultando en gráficas vacías.
