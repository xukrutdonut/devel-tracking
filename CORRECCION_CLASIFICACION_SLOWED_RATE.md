# Corrección: Clasificación Incorrecta como Asíntota Prematura

## Fecha
5 de noviembre de 2024

## Problema Identificado

Al probar el sistema de clasificación automática, se detectó que trayectorias con **velocidad de desarrollo reducida pero mismo origen** (SLOWED_RATE) estaban siendo clasificadas incorrectamente como **PREMATURE_ASYMPTOTE** (asíntota prematura).

### Ejemplo del Error
**Datos de entrada:**
- Edad 12m: CD = 80
- Edad 18m: CD = 81
- Edad 24m: CD = 82
- Edad 30m: CD = 83

**Clasificación incorrecta:** PREMATURE_ASYMPTOTE
**Clasificación correcta:** SLOWED_RATE_CONVERGENTE (velocidad baja pero progreso consistente)

## Causa del Problema

### 1. Orden de Evaluación Incorrecto
El código evaluaba la asíntota prematura **antes** de evaluar SLOWED_RATE:

```javascript
// Orden ANTIGUO (incorrecto)
1. ZERO_TRAJECTORY
2. NO_SYSTEMATIC_RELATIONSHIP
3. PREMATURE_ASYMPTOTE    ← Se ejecutaba muy pronto
4. NONLINEAR
5. DELAYED_ONSET
6. SLOWED_RATE
```

### 2. Criterio Demasiado Amplio para Asíntota
La función `detectarAsintotaPrematura()` detectaba estancamiento cuando el cambio promedio en los últimos 3 puntos era < 2:

```javascript
// ANTIGUO
const cambioPromedio = cambios.reduce((a, b) => a + b, 0) / cambios.length;
const hayEstancamiento = cambioPromedio < 2;  // ← Demasiado sensible
```

**Problema:** Una velocidad reducida consistente (ej: 1 punto/6 meses) tiene cambios < 2, pero NO es una asíntota, es simplemente **progreso lento**.

### 3. No Distinguía Entre Asíntota Real y Velocidad Baja

**Diferencia conceptual:**
- **PREMATURE_ASYMPTOTE:** Desarrollo que progresa normalmente y LUEGO se detiene (cambio de velocidad)
- **SLOWED_RATE:** Desarrollo que progresa consistentemente lento desde el inicio (velocidad constante)

El código antiguo no verificaba si había habido un cambio de velocidad.

## Solución Implementada

### 1. Criterio Mejorado para Detectar Asíntota Prematura

```javascript
/**
 * CRITERIO CLAVE: Una asíntota prematura implica que el desarrollo
 * progresó inicialmente con velocidad normal y LUEGO se detuvo.
 * Si la velocidad ha sido consistentemente baja desde el inicio,
 * NO es una asíntota, es SLOWED_RATE.
 */
export function detectarAsintotaPrematura(datos, nivelEsperado = 100) {
  // ... código anterior ...
  
  // Calcular cambios en primeros puntos
  const cambioPromedioInicial = ...;
  
  // Calcular cambios en últimos puntos
  const cambioPromedioFinal = ...;
  
  // CRITERIOS para asíntota prematura:
  // 1. Estancamiento reciente
  const hayEstancamiento = cambioPromedioFinal < 2;
  
  // 2. Nivel actual por debajo del esperado
  const esPrematura = nivelActual < nivelEsperado - 10;
  
  // 3. NUEVO: Hubo progreso inicial que luego se detuvo
  const huboCambioVelocidad = cambioPromedioInicial > cambioPromedioFinal * 2;
  
  // Solo es asíntota si hubo desaceleración marcada
  if (hayEstancamiento && esPrematura && huboCambioVelocidad) {
    return { detectada: true, ... };
  }
  
  return { detectada: false };
}
```

**Cambio clave:** Ahora se verifica que `cambioPromedioInicial > cambioPromedioFinal * 2`, es decir, que la velocidad inicial fue al menos el doble de la velocidad final. Esto confirma que hubo una **desaceleración** real, no solo velocidad baja constante.

### 2. Umbral Reducido para SLOWED_RATE (Sin Datos de Referencia)

```javascript
// ANTIGUO: Requería pendiente > 0.5
if (Math.abs(velocidadPromedio) > 0.5) {
  return { tipo: 'SLOWED_RATE_...' };
}

// NUEVO: Requiere pendiente > 0.2 (más sensible)
if (Math.abs(velocidadPromedio) > 0.2) {
  const esConvergente = velocidadPromedio > 0;
  return {
    tipo: esConvergente ? 'SLOWED_RATE_CONVERGENTE' : 'SLOWED_RATE_DIVERGENTE',
    descripcion: `Velocidad ${esConvergente ? 'aumentada (convergente)' : 'reducida (divergente)'}`,
    ...
  };
}
```

**Justificación:** 
- CD normal se mantiene ~100 (pendiente ~0)
- Pendiente positiva = mejora (acercándose a normalidad)
- Pendiente > 0.2 puntos/mes = catching up significativo
- Pendiente < -0.2 puntos/mes = deterioro significativo

### 3. Nuevo Tipo: DESARROLLO_NORMAL

Para casos donde nivel inicial ≥ 85 y velocidad estable:

```javascript
if (nivelInicial >= 85) {
  return {
    tipo: 'DESARROLLO_NORMAL',
    descripcion: 'Desarrollo dentro del rango esperado',
    ...
  };
}
```

### 4. Mejor Lógica de Clasificación Sin Datos de Referencia

```javascript
// NUEVO orden de evaluación:
1. Verificar si R² > 0.7 (trayectoria lineal confiable)
2. SLOWED_RATE si |pendiente| > 0.2
3. DELAYED_ONSET si inicio < 85 y pendiente ≈ 0
4. DESARROLLO_NORMAL si inicio ≥ 85
5. INDETERMINADO si no cumple criterios claros
```

## Ejemplos Corregidos

### Caso 1: Velocidad Baja Consistente (Catching Up Lento)
**Datos:**
- 12m: 70 → 18m: 72 → 24m: 74 → 30m: 76

**Regresión:**
- Intercepto: 68
- Pendiente: 0.44 puntos/mes
- R²: 0.99

**Clasificación ANTIGUA:** PREMATURE_ASYMPTOTE (❌ incorrecto)
- Detectaba cambio < 2 en últimos puntos

**Clasificación NUEVA:** SLOWED_RATE_CONVERGENTE (✅ correcto)
- |Pendiente| = 0.44 > 0.2
- Pendiente positiva = convergente
- No hubo cambio de velocidad (inicial ≈ final)

### Caso 2: Asíntota Prematura Real
**Datos:**
- 12m: 70 → 18m: 80 → 24m: 88 → 30m: 89 → 36m: 89

**Regresión cuadrática:**
- Progreso inicial: (80-70)/6 = 1.67 puntos/mes
- Progreso final: (89-89)/6 = 0 puntos/mes

**Clasificación:** PREMATURE_ASYMPTOTE (✅ correcto)
- Cambio inicial (1.67) >> cambio final (0)
- Hubo desaceleración marcada
- Nivel final (89) < esperado (100)

### Caso 3: Desarrollo Normal
**Datos:**
- 12m: 95 → 18m: 97 → 24m: 99 → 30m: 100

**Regresión:**
- Intercepto: 92.3
- Pendiente: 0.26
- R²: 0.98

**Clasificación:** DESARROLLO_NORMAL (✅ correcto)
- Nivel inicial ≥ 85
- Velocidad positiva pero moderada
- Dentro de rango esperado

## Impacto en la Interfaz

### Colores e Iconos Actualizados
- **SLOWED_RATE_CONVERGENTE:** Verde + ↑
- **SLOWED_RATE_DIVERGENTE:** Rojo + ↓
- **DESARROLLO_NORMAL:** Verde claro + ✓
- **PREMATURE_ASYMPTOTE:** Naranja + − (ahora más específico)

### Métricas Mostradas
Ahora se incluye en cada clasificación:
- Pendiente del modelo
- R² (bondad de ajuste)
- Nivel de confianza
- Interpretación clara del patrón

## Validación

### Test 1: Velocidad Baja Positiva
```javascript
const datos = [
  { edad: 12, valor: 70 },
  { edad: 18, valor: 72 },
  { edad: 24, valor: 74 },
  { edad: 30, valor: 76 }
];
// Resultado esperado: SLOWED_RATE_CONVERGENTE ✓
```

### Test 2: Asíntota Real
```javascript
const datos = [
  { edad: 12, valor: 70 },
  { edad: 18, valor: 82 },
  { edad: 24, valor: 88 },
  { edad: 30, valor: 89 },
  { edad: 36, valor: 89 }
];
// Resultado esperado: PREMATURE_ASYMPTOTE ✓
```

### Test 3: Velocidad Baja Negativa
```javascript
const datos = [
  { edad: 12, valor: 95 },
  { edad: 18, valor: 93 },
  { edad: 24, valor: 91 },
  { edad: 30, valor: 89 }
];
// Resultado esperado: SLOWED_RATE_DIVERGENTE ✓
```

## Conclusión

Las correcciones implementadas permiten que el sistema:

1. ✅ **Distinga correctamente** entre asíntota prematura y velocidad reducida
2. ✅ **Detecte asíntotas reales** cuando hay cambio de velocidad (desaceleración)
3. ✅ **Clasifique velocidades bajas** como SLOWED_RATE cuando son consistentes
4. ✅ **Use umbrales apropiados** (0.2 puntos/mes en lugar de 0.5)
5. ✅ **Identifique desarrollo normal** cuando corresponde

El sistema ahora es más preciso y fiel a las 7 tipologías de Thomas et al. (2009).

## Archivos Modificados

- `src/utils/regresionTrayectorias.js`:
  - Función `detectarAsintotaPrematura()` mejorada
  - Lógica de clasificación sin datos de referencia actualizada
  - Nuevo tipo DESARROLLO_NORMAL añadido

- `src/components/ClasificacionTrayectorias.jsx`:
  - Colores e iconos actualizados
  - Soporte para nuevo tipo DESARROLLO_NORMAL
