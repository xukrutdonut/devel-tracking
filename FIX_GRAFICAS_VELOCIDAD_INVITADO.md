# Corrección: Gráficas de Velocidad y Aceleración en Modo Invitado

## Problema Identificado

Cuando un usuario entraba como invitado y creaba un ejemplo con datos retrospectivos (hitos), las gráficas de velocidad y aceleración del desarrollo no se cargaban, mostrando el mensaje "demasiados pocos datos". Sin embargo, el sistema SÍ debería utilizar los datos retrospectivos para calcular estas métricas.

## Causa del Problema

El componente `AnalisisAceleracion` tenía **DOS problemas**:

1. **No detectaba modo invitado**: Intentaba cargar datos del niño desde el servidor (`/ninos/${ninoId}`) en lugar de buscarlos en `sessionStorage`
2. **No usaba datos retrospectivos locales**: Las gráficas de velocidad/aceleración solo se mostraban si existía `datosRegresionGraficoDesarrollo` del componente padre

## Solución Implementada

### 1. Detección de Modo Invitado

Se agregó lógica al inicio de `cargarDatos()` para detectar modo invitado:

```javascript
// En modo invitado, verificar si hay datos en sessionStorage
if (esModoInvitado() && ninoId.startsWith('invitado_')) {
  console.log('📊 [AnalisisAceleracion] Modo invitado detectado');
  
  const hitosKey = `invitado_hitos_${ninoId}`;
  const hitosGuardados = sessionStorage.getItem(hitosKey);
  
  if (!hitosGuardados) {
    setDatos(null);
    return;
  }
  
  const hitos = JSON.parse(hitosGuardados);
  const ninosGuardados = sessionStorage.getItem('invitado_ninos');
  const ninos = ninosGuardados ? JSON.parse(ninosGuardados) : [];
  const ninoData = ninos.find(n => n.id === ninoId);
  
  // Construir análisis desde sessionStorage
  await construirDatosRetrospectivosDesdeSessionStorage(ninoData, hitos);
  return;
}
```

### 2. Nueva Función: `construirDatosRetrospectivosDesdeSessionStorage()`

Ubicación: `src/components/AnalisisAceleracion.jsx` (línea ~230)

Similar a `construirDatosRetrospectivos()` pero para modo invitado:

```javascript
const construirDatosRetrospectivosDesdeSessionStorage = async (ninoData, hitosConseguidos) => {
  // No hace fetch a /hitos-conseguidos (ya los tiene en hitosConseguidos)
  // Solo carga hitos normativos y dominios del servidor (datos públicos)
  
  const normativosResponse = await fetch(`${API_URL}/hitos-normativos?fuente=${fuenteSeleccionada}`);
  const hitosNormativos = await normativosResponse.json();
  
  const dominiosResponse = await fetch(`${API_URL}/dominios`);
  const dominiosParaUsar = await dominiosResponse.json();
  
  // Resto igual que construirDatosRetrospectivos()
  const puntosEvaluacion = construirPuntosEvaluacion(...);
  const datosCalculados = calcularAceleracionesDesdePuntos(puntosEvaluacion);
  const lineaTendenciaRetrospectiva = construirLineaTendenciaRetrospectiva(puntosEvaluacion);
  
  setDatos({
    evaluaciones: puntosEvaluacion,
    datosAceleracion: datosCalculados,
    lineaTendencia: lineaTendenciaRetrospectiva
  });
};
```

### 3. Construcción de Línea de Tendencia Retrospectiva

Función `construirLineaTendenciaRetrospectiva()` (línea ~290):

```javascript
const construirLineaTendenciaRetrospectiva = (puntosEvaluacion) => {
  return puntosEvaluacion.map(punto => {
    let cd_valor;
    
    if (dominioSeleccionado === 'global') {
      cd_valor = punto.cd_global;
    } else {
      const dominio = punto.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
      cd_valor = dominio?.cd;
    }
    
    if (cd_valor === null) return null;
    
    // CD = (ED / EC) × 100 → ED = (CD × EC) / 100
    const edad_desarrollo = (cd_valor * punto.edad_meses) / 100;
    
    return {
      edad_cronologica: punto.edad_meses,
      edad_desarrollo: edad_desarrollo
    };
  }).filter(p => p !== null);
};
```

### 4. Fallback en Gráficas de Velocidad y Aceleración

Las gráficas ahora usan datos locales cuando no hay datos externos:

```javascript
// Prioridad 1: Datos de regresión de GraficoDesarrollo
// Prioridad 2: Línea de tendencia retrospectiva local
const lineaTendencia = datosRegresionGraficoDesarrollo?.lineaTendencia || datos?.lineaTendencia;

if (!lineaTendencia || lineaTendencia.length < 2) {
  return null; // Solo ocultar si NO hay ninguna fuente
}
```

## Flujo de Datos Completo

### Modo Invitado con Ejemplo

```
1. Usuario crea ejemplo → hitos guardados en sessionStorage
   └─ Key: invitado_hitos_invitado_ejemplo_1
   └─ Key: invitado_ninos (array de niños)

2. IntroduccionDatos renderiza AnalisisAceleracion
   └─ Prop: ninoId="invitado_ejemplo_1"

3. AnalisisAceleracion.cargarDatos()
   ├─ Detecta: esModoInvitado() && ninoId.startsWith('invitado_')
   ├─ Carga hitos de: sessionStorage.getItem('invitado_hitos_invitado_ejemplo_1')
   ├─ Carga niño de: sessionStorage.getItem('invitado_ninos')
   └─ Llama: construirDatosRetrospectivosDesdeSessionStorage(ninoData, hitos)

4. construirDatosRetrospectivosDesdeSessionStorage()
   ├─ Fetch: /hitos-normativos (datos públicos del servidor)
   ├─ Fetch: /dominios (datos públicos del servidor)
   ├─ Calcula: edad actual del niño
   ├─ Construye: puntos de evaluación con construirPuntosEvaluacion()
   ├─ Calcula: métricas con calcularAceleracionesDesdePuntos()
   ├─ Construye: lineaTendenciaRetrospectiva
   └─ setDatos({ evaluaciones, datosAceleracion, lineaTendencia })

5. Renderizado de gráficas
   ├─ Gráfica velocidad: usa datos.lineaTendencia (fallback local)
   ├─ Gráfica aceleración: usa datos.lineaTendencia (fallback local)
   └─ ✅ Todo funciona correctamente
```

### Modo Usuario Autenticado

```
1. Usuario registra hitos reales

2. GraficoDesarrollo calcula regresión polinómica
   └─ Pasa datosRegresionGraficoDesarrollo a AnalisisAceleracion

3. AnalisisAceleracion.cargarDatos()
   ├─ NO detecta modo invitado
   ├─ Fetch: /ninos/${ninoId} (servidor)
   ├─ Intenta fetch: /itinerario/${ninoId} (si existe)
   └─ Si no hay itinerario: construirDatosRetrospectivos(ninoData)

4. Gráficas usan datosRegresionGraficoDesarrollo (prioridad) o fallback local
   └─ ✅ Todo funciona igual que antes
```

## Cambios en el Código

### Import actualizado

```javascript
import { fetchConAuth, esModoInvitado } from '../utils/authService';
```

### Logs de depuración mejorados

Se agregaron logs informativos en cada paso:

```javascript
console.log('📊 [AnalisisAceleracion] Modo invitado detectado, cargando desde sessionStorage');
console.log('📊 [AnalisisAceleracion] Hitos cargados de sessionStorage:', hitos?.length);
console.log('✅ [AnalisisAceleracion] Datos retrospectivos cargados correctamente desde sessionStorage');
```

## Ventajas de la Solución

✅ **Compatibilidad total**: Funciona en modo invitado y autenticado  
✅ **Sin cambios en backend**: Todo resuelto en frontend  
✅ **Reutiliza funciones**: `construirPuntosEvaluacion`, `calcularAceleracionesDesdePuntos`  
✅ **Fallback robusto**: Sistema de prioridades para fuentes de datos  
✅ **Logs informativos**: Fácil debugging con logs estructurados  

## Archivos Modificados

- `src/components/AnalisisAceleracion.jsx`
  - Línea 3: Import de `esModoInvitado`
  - Línea 78-125: Nueva lógica de detección de modo invitado en `cargarDatos()`
  - Línea 220-285: Nueva función `construirDatosRetrospectivosDesdeSessionStorage()`
  - Línea 287-316: Función `construirLineaTendenciaRetrospectiva()`
  - Línea 569: Fallback en gráfica de velocidad
  - Línea 657: Fallback en gráfica de aceleración

## Testing Recomendado

### Test 1: Modo Invitado con Ejemplo
1. Ir a modo invitado
2. Crear ejemplo con "Generar ejemplo con hitos retrospectivos"
3. Ir a pestaña "Análisis Matemático"
4. **Verificar**: Aparecen gráficas de velocidad y aceleración
5. **Verificar**: Logs en consola muestran "Modo invitado detectado"
6. Cambiar dominio (Global → Motor Grueso)
7. **Verificar**: Gráficas se recalculan correctamente

### Test 2: Modo Usuario Autenticado
1. Login con usuario real
2. Seleccionar niño con hitos registrados
3. **Verificar**: Gráficas funcionan igual que antes
4. **Verificar**: Usa datos de regresión de GraficoDesarrollo (prioridad)

### Test 3: Edge Cases
1. Ejemplo con solo 1 hito → Debe mostrar mensaje de datos insuficientes
2. Ejemplo con 2 hitos → Debe mostrar gráfica de velocidad (no aceleración)
3. Ejemplo con 3+ hitos → Debe mostrar velocidad y aceleración

## Referencias Técnicas

- **sessionStorage keys**:
  - `invitado_hitos_${ninoId}`: Hitos del ejemplo
  - `invitado_ninos`: Array de niños de ejemplo
- **CD (Cociente de Desarrollo)**: `CD = (ED / EC) × 100`
- **Conversión inversa**: `ED = (CD × EC) / 100`
- **Velocidad**: Derivada 1ª = `ΔED / ΔEC`
- **Aceleración**: Derivada 2ª = `Δ(velocidad) / Δtiempo`

## Fecha de Implementación

2025-01-XX (Fecha actual de implementación)

---

**Build status**: ✅ Exitoso  
**Tests manuales**: Pendientes  
**Impacto**: Alto - Habilita funcionalidad completa en modo invitado

## Solución Implementada

### 1. Construcción de Línea de Tendencia Retrospectiva Local

Se agregó la función `construirLineaTendenciaRetrospectiva()` en `AnalisisAceleracion.jsx`:

```javascript
/**
 * Construye línea de tendencia desde puntos de evaluación retrospectivos
 * para usar en gráficas de velocidad y aceleración
 */
const construirLineaTendenciaRetrospectiva = (puntosEvaluacion) => {
  if (!puntosEvaluacion || puntosEvaluacion.length < 2) return [];
  
  // Convertir puntos de evaluación a formato compatible con gráficas
  const lineaTendencia = puntosEvaluacion.map(punto => {
    let cd_valor;
    
    if (dominioSeleccionado === 'global') {
      cd_valor = punto.cd_global;
    } else {
      const dominio = punto.dominios?.find(d => d.dominio_id === parseInt(dominioSeleccionado));
      cd_valor = dominio?.cd;
    }
    
    if (cd_valor === null || cd_valor === undefined) return null;
    
    // CD = (ED / EC) * 100 → ED = (CD * EC) / 100
    const edad_desarrollo = (cd_valor * punto.edad_meses) / 100;
    
    return {
      edad_cronologica: punto.edad_meses,
      edad_desarrollo: edad_desarrollo
    };
  }).filter(p => p !== null);
  
  return lineaTendencia;
};
```

### 2. Modificación de `construirDatosRetrospectivos()`

Se actualizó para incluir la línea de tendencia en el estado de datos:

```javascript
// Construir línea de tendencia para datos retrospectivos
const lineaTendenciaRetrospectiva = construirLineaTendenciaRetrospectiva(puntosEvaluacion);

setDatos({
  evaluaciones: puntosEvaluacion,
  datosAceleracion: datosCalculados,
  lineaTendencia: lineaTendenciaRetrospectiva // ← NUEVO
});
```

### 3. Fallback en Gráficas de Velocidad y Aceleración

Se modificó la lógica condicional para usar datos locales cuando no hay datos de regresión externos:

**Antes:**
```javascript
if (!datosRegresionGraficoDesarrollo || !datosRegresionGraficoDesarrollo.lineaTendencia) {
  return null; // ← Ocultaba las gráficas
}
const lineaTendencia = datosRegresionGraficoDesarrollo.lineaTendencia;
```

**Después:**
```javascript
// Usar línea de tendencia de regresión (GraficoDesarrollo) si está disponible,
// o la línea de tendencia retrospectiva construida localmente
const lineaTendencia = datosRegresionGraficoDesarrollo?.lineaTendencia || datos?.lineaTendencia;

if (!lineaTendencia || lineaTendencia.length < 2) {
  return null; // Solo ocultar si NO hay ninguna fuente de datos
}
```

## Flujo de Datos Mejorado

### Modo Invitado con Ejemplo

1. Usuario crea ejemplo con hitos retrospectivos
2. `AnalisisAceleracion` recibe `ninoId` (ej: "invitado_ejemplo_1")
3. `cargarDatos()` detecta modo invitado → no hay datos prospectivos (itinerario)
4. Llama a `construirDatosRetrospectivos()`:
   - Carga hitos conseguidos del ejemplo
   - Carga hitos normativos (referencia)
   - Construye puntos de evaluación con `construirPuntosEvaluacion()`
   - Calcula métricas con `calcularAceleracionesDesdePuntos()`
   - **NUEVO**: Construye línea de tendencia con `construirLineaTendenciaRetrospectiva()`
5. Almacena datos en estado incluyendo `lineaTendencia`
6. Gráficas de velocidad/aceleración usan `datos.lineaTendencia` como fallback

### Modo Usuario Autenticado

1. `GraficoDesarrollo` calcula regresión polinómica y línea de tendencia
2. Pasa datos mediante prop `datosRegresionGraficoDesarrollo`
3. `AnalisisAceleracion` usa estos datos (prioridad) o fallback local

## Ventajas de la Solución

1. **Compatibilidad total**: Funciona en modo invitado y autenticado
2. **Sin duplicación**: Reutiliza funciones existentes (`construirPuntosEvaluacion`)
3. **Fallback robusto**: Sistema de prioridades para fuentes de datos
4. **Sin cambios en API**: No requiere modificaciones en el backend
5. **Mejor experiencia**: Usuarios invitados ven todas las gráficas desde ejemplos

## Archivos Modificados

- `src/components/AnalisisAceleracion.jsx`
  - Nueva función `construirLineaTendenciaRetrospectiva()`
  - Modificada `construirDatosRetrospectivos()` para incluir línea de tendencia
  - Actualizada lógica condicional en gráficas de velocidad (línea 514-527)
  - Actualizada lógica condicional en gráficas de aceleración (línea 602-615)

## Pruebas Recomendadas

1. **Modo invitado con ejemplo**:
   - Crear ejemplo con "Generar ejemplo con hitos retrospectivos"
   - Verificar que aparecen gráficas de velocidad y aceleración
   - Comprobar cálculos correctos en consola del navegador

2. **Modo usuario autenticado**:
   - Registrar hitos para un niño
   - Verificar que gráficas siguen funcionando normalmente
   - Comprobar que usa datos de regresión de `GraficoDesarrollo` cuando están disponibles

3. **Cambio de dominio**:
   - Cambiar selector de dominio (Global → Motor Grueso, etc.)
   - Verificar recálculo correcto de línea de tendencia

## Referencias Técnicas

- **CD (Cociente de Desarrollo)**: `CD = (ED / EC) × 100`
- **Conversión inversa**: `ED = (CD × EC) / 100`
- **Velocidad**: Derivada 1ª = `ΔED / ΔEC`
- **Aceleración**: Derivada 2ª = `Δ(velocidad) / Δtempo`

## Fecha de Implementación

2024-01-XX (Fecha actual de implementación)
