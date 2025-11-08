# Debug: Gráficas de Velocidad y Aceleración

## Estado Actual

He añadido el endpoint `/api/itinerario/:ninoId` que faltaba y logs de depuración extensivos para diagnosticar por qué las gráficas no aparecen.

## Cómo Debuguear

### 1. Abrir la Consola del Navegador

1. Accede a la aplicación en `http://localhost:5173`
2. Abre las Herramientas de Desarrollador:
   - **Chrome/Edge**: F12 o Ctrl+Shift+I (Cmd+Option+I en Mac)
   - **Firefox**: F12 o Ctrl+Shift+K (Cmd+Option+K en Mac)
3. Ve a la pestaña **Console**

### 2. Navegar a la Sección de Análisis

1. Selecciona un niño en la aplicación
2. Ve a la pestaña de **Análisis de Aceleración** o **Clasificación de Trayectorias**
3. Observa los logs que aparecen en la consola con emojis:
   - 📊 = Información de datos
   - ✅ = Operación exitosa
   - ⚠️ = Advertencia
   - ❌ = Error
   - 🔄 = Procesando

### 3. Interpretar los Logs

#### Escenario A: Datos Prospectivos (Evaluaciones Múltiples)

Si ves esto, el endpoint funciona pero NO hay suficientes evaluaciones guardadas:

```
📊 [AnalisisAceleracion] Itinerario: {nino: {...}, evaluaciones: [], ...}
📊 [AnalisisAceleracion] Evaluaciones: 0
🔄 [AnalisisAceleracion] No hay datos prospectivos suficientes, usando retrospectivos
```

**Solución**: La aplicación intentará usar datos retrospectivos automáticamente.

#### Escenario B: Datos Retrospectivos (Hitos Conseguidos)

Si ves esto:

```
🔄 [AnalisisAceleracion] Construyendo datos retrospectivos para niño: 65
📊 [AnalisisAceleracion] Hitos conseguidos: 15
📊 [AnalisisAceleracion] Hitos normativos filtrados: 344
📊 [AnalisisAceleracion] Edad actual: 24 meses
📊 [AnalisisAceleracion] Puntos de evaluación construidos: 8
📊 [AnalisisAceleracion] Datos calculados: 8
✅ [AnalisisAceleracion] Datos retrospectivos cargados correctamente
```

**Esto significa que funcionó correctamente** y las gráficas deberían aparecer.

#### Escenario C: Insuficientes Datos

Si ves esto:

```
⚠️ [AnalisisAceleracion] Insuficientes hitos conseguidos: 1
```

O:

```
⚠️ [AnalisisAceleracion] Insuficientes puntos de evaluación: 1
```

**Problema**: No hay suficientes datos registrados.

**Solución**: El niño necesita tener al menos:
- **Para Análisis de Aceleración**: 2 hitos conseguidos
- **Para Clasificación de Trayectorias**: 3 hitos conseguidos

#### Escenario D: Error de Red

Si ves:

```
❌ [AnalisisAceleracion] Error cargando datos: Failed to fetch
```

**Problema**: El backend no está respondiendo o hay un problema de CORS.

**Solución**: Verifica que el backend esté corriendo:
```bash
docker ps | grep backend
```

### 4. Requisitos para que Aparezcan las Gráficas

#### Opción 1: Datos Prospectivos (Evaluaciones Múltiples)
- Requiere crear múltiples evaluaciones con escalas estandarizadas
- Actualmente NO implementado en la interfaz (tabla `escalas_evaluaciones` existe pero no hay UI)

#### Opción 2: Datos Retrospectivos (Hitos Conseguidos) ⭐ RECOMENDADO
- Requiere registrar **al menos 2 hitos con edades de logro** para el niño
- La aplicación automáticamente construye puntos de evaluación a partir de los hitos
- Calcula el Cociente de Desarrollo (CD) en cada punto

### 5. Cómo Registrar Hitos para Ver las Gráficas

1. Ve a la sección del niño
2. En la pestaña "Introducción de Datos" o "Hitos Conseguidos"
3. Registra al menos 2 hitos con sus edades de logro
4. Vuelve a la pestaña "Análisis de Aceleración"
5. Las gráficas deberían aparecer automáticamente

## Verificar que el Endpoint Funciona

Desde la terminal:

```bash
# Test con usuario invitado (sin autenticación)
curl http://localhost:8001/api/itinerario/invitado_ejemplo_123?fuente=1

# Debería devolver:
{
  "nino": {...},
  "evaluaciones": [],
  "fuente_normativa_id": 1
}
```

## Logs del Backend

Para ver si el backend está recibiendo las peticiones:

```bash
docker logs -f neurodesarrollo-backend | grep itinerario
```

Deberías ver algo como:
```
→ Proxy: GET /api/itinerario/65?fuente=1
```

## Posibles Causas del Problema

1. ✅ **Endpoint faltante** - YA SOLUCIONADO
2. ⚠️ **Insuficientes datos** - El niño no tiene suficientes hitos registrados
3. ⚠️ **Error en construcción de puntos** - Los hitos no se están convirtiendo correctamente a puntos de evaluación
4. ⚠️ **Problema de renderizado** - Los datos llegan pero el componente no los muestra

## Siguiente Paso

**Por favor, navega a la aplicación, abre la consola del navegador y compárteme los logs que veas.** Eso me dirá exactamente en qué punto está fallando el proceso.

Si ves el mensaje "Se necesitan al menos 2 evaluaciones", eso confirma que:
- El endpoint funciona ✅
- Los datos están llegando ✅
- Pero NO hay suficientes datos registrados ⚠️

En ese caso, necesitas registrar más hitos para el niño.
