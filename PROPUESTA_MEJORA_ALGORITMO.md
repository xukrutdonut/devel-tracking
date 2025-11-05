# Propuesta de Mejora del Algoritmo de Clasificación

## Situación Actual

El sistema está clasificando algunas trayectorias incorrectamente. Esto puede deberse a:

1. **Umbrales inadecuados:** Los valores numéricos (0.2, 85, etc.) no reflejan la práctica clínica
2. **Criterios ambiguos:** No está claro cuándo algo es DELAYED_ONSET vs SLOWED_RATE
3. **Falta de datos de referencia:** Sin curvas normativas, los criterios son arbitrarios
4. **Lógica de decisión:** El orden o las condiciones de clasificación no son óptimas

## Opciones de Mejora

### Opción A: Ajuste Rápido de Umbrales

**Ventaja:** Rápido, sin cambios estructurales
**Desventaja:** Puede no resolver problemas conceptuales

**Parámetros ajustables:**

```javascript
// En regresionTrayectorias.js

// 1. Umbral de pendiente significativa
const UMBRAL_PENDIENTE_SIGNIFICATIVA = 0.2;  // Actual
// Propuesta: 0.3 (más estricto) o 0.15 (más sensible)

// 2. Umbral de intercepto retrasado
const UMBRAL_INTERCEPTO_BAJO = 85;  // Actual: < 85 es retraso
// Propuesta: 80 (más estricto) o 90 (más sensible)

// 3. Umbral R² para linealidad
const UMBRAL_R2_LINEAL = 0.7;  // Actual
// Propuesta: 0.8 (más estricto)

// 4. Ratio para detectar asíntota
const RATIO_ASINTOTA = 3;  // Actual: cambioInicial > cambioFinal * 3
// Propuesta: 4 o 5 (más estricto)

// 5. Umbral de estancamiento
const UMBRAL_ESTANCAMIENTO = 1;  // Actual: < 1 punto
// Propuesta: 0.5 (más estricto)
```

**Proceso:**
1. Ejecutar `compararClasificaciones()` en consola
2. Ver qué casos fallan
3. Ajustar umbrales específicos
4. Re-test

### Opción B: Clasificación en Dos Pasos

**Ventaja:** Más clara, separa aspectos ortogonales
**Desventaja:** Requiere más código

**Paso 1: Clasificar INICIO**
```javascript
function clasificarInicio(intercepto, edadCronologica) {
  const cdInicial = (intercepto / edadCronologica) * 100;
  
  if (cdInicial >= 85) return 'NORMAL';
  if (cdInicial >= 70) return 'RETRASO_LEVE';
  return 'RETRASO_SIGNIFICATIVO';
}
```

**Paso 2: Clasificar TRAYECTORIA**
```javascript
function clasificarTrayectoria(pendiente, r2) {
  if (r2 < 0.5) return 'NO_LINEAL';
  
  if (Math.abs(pendiente) < 0.2) return 'ESTABLE';
  if (pendiente > 0.2) return 'ACELERANDO';
  if (pendiente < -0.2) return 'DESACELERANDO';
}
```

**Paso 3: Combinar**
```javascript
const inicio = clasificarInicio(...);
const trayectoria = clasificarTrayectoria(...);

if (inicio === 'RETRASO_SIGNIFICATIVO' && trayectoria === 'ESTABLE') {
  return 'DELAYED_ONSET';
}
if (inicio === 'NORMAL' && trayectoria === 'DESACELERANDO') {
  return 'SLOWED_RATE_DIVERGENTE';
}
// etc...
```

### Opción C: Usar Datos Normativos

**Ventaja:** Científicamente más riguroso
**Desventaja:** Requiere curvas de referencia

**Datos necesarios:**
- Percentil 50 de cada dominio por edad
- Desviación estándar esperada
- Velocidad típica de progreso

**Implementación:**
```javascript
// Cargar datos normativos
const curvaReferencia = cargarCurvaP50(dominio);

// Ajustar modelos
const modeloNino = ajustarRegresionLineal(datosNino);
const modeloReferencia = ajustarRegresionLineal(curvaReferencia);

// Comparar parámetros
const difIntercepto = modeloNino.intercepto - modeloReferencia.intercepto;
const difPendiente = modeloNino.pendiente - modeloReferencia.pendiente;

// Test estadístico
const esSignificativoIntercepto = Math.abs(difIntercepto) > 2 * sigma;
const esSignificativoPendiente = Math.abs(difPendiente) > 0.3;

// Clasificar basándose en tests
if (esSignificativoIntercepto && !esSignificativoPendiente) {
  return 'DELAYED_ONSET';
}
```

### Opción D: Machine Learning / Expert System

**Ventaja:** Se adapta automáticamente
**Desventaja:** Requiere conjunto de entrenamiento

**Proceso:**
1. Recopilar 50-100 casos etiquetados por ti
2. Extraer features (pendiente, intercepto, R², cambios, etc.)
3. Entrenar clasificador (ej: árbol de decisión)
4. El sistema aprende tus criterios

**Features sugeridas:**
```javascript
const features = {
  // Modelo lineal
  intercepto: modelo.intercepto,
  pendiente: modelo.pendiente,
  r2: modelo.r2,
  
  // Cambios
  cambioTotal: ultimoPunto - primerPunto,
  cambioPromedio: cambioTotal / tiempoTotal,
  
  // Niveles
  nivelInicial: primerPunto,
  nivelFinal: ultimoPunto,
  cdInicial: primerPunto / edadInicial * 100,
  cdFinal: ultimoPunto / edadFinal * 100,
  
  // Aceleración
  aceleracion: calcularAceleracion(datos),
  
  // Cambios de velocidad
  velocidadInicial: calcularVelocidad(datos.slice(0, 3)),
  velocidadFinal: calcularVelocidad(datos.slice(-3)),
  ratioVelocidad: velocidadFinal / velocidadInicial
};
```

### Opción E: Sistema de Reglas Experto

**Ventaja:** Transparente, ajustable, basado en tu conocimiento
**Desventaja:** Requiere definir todas las reglas

**Ejemplo de reglas:**

```javascript
const REGLAS = [
  {
    nombre: 'DELAYED_ONSET',
    condiciones: [
      { variable: 'cdInicial', operador: '<', valor: 85 },
      { variable: 'pendiente', operador: 'entre', valor: [-0.2, 0.2] },
      { variable: 'r2', operador: '>', valor: 0.7 }
    ],
    prioridad: 1
  },
  {
    nombre: 'SLOWED_RATE_DIVERGENTE',
    condiciones: [
      { variable: 'cdInicial', operador: '>=', valor: 85 },
      { variable: 'pendiente', operador: '<', valor: -0.2 },
      { variable: 'r2', operador: '>', valor: 0.7 }
    ],
    prioridad: 1
  },
  // ... más reglas
];

function clasificarConReglas(features, reglas) {
  for (const regla of reglas.sort((a, b) => a.prioridad - b.prioridad)) {
    if (cumpleRegla(features, regla.condiciones)) {
      return regla.nombre;
    }
  }
  return 'INDETERMINADO';
}
```

## Recomendación Inmediata

**Enfoque híbrido:**

1. **Corto plazo (hoy):**
   - Ejecuta `compararClasificaciones()` en consola
   - Identifica qué casos fallan
   - Ajusta 2-3 umbrales críticos
   - Re-test hasta que mejore

2. **Medio plazo (esta semana):**
   - Completa la herramienta de validación con 10-15 casos reales
   - Implementa clasificación en dos pasos (Opción B)
   - Documenta criterios clínicos claros

3. **Largo plazo (próximo mes):**
   - Integra datos normativos (Opción C)
   - O implementa sistema de reglas experto (Opción E)

## Herramientas Disponibles

### 1. Test en Consola
```javascript
// Abre la consola del navegador (F12)
import { testCaso, compararCasos } from './utils/testClasificacion';

// Test un caso
testCaso([
  { edad: 12, valor: 9 },
  { edad: 18, valor: 15 },
  { edad: 24, valor: 21 }
], 'DELAYED_ONSET', 'Mi caso de prueba');

// Test todos los casos predefinidos
compararCasos();
```

### 2. Archivo de Validación
- `HERRAMIENTA_VALIDACION_CLASIFICACION.md`
- Complétalo con tus casos y criterios

### 3. Logs de Debug
El sistema ya imprime logs detallados:
```
🔍 Clasificando trayectoria: { ... }
🔬 Detector Asíntota Prematura: { ... }
```

## Próximos Pasos

**Para que yo pueda mejorar el algoritmo, necesito:**

1. **Casos específicos mal clasificados:**
   ```
   Caso: Niño con catching up
   Datos: [12m→8, 18m→15, 24m→22, 30m→28]
   Sistema dice: SLOWED_RATE_CONVERGENTE
   Debería ser: DELAYED_ONSET + RECOVERING
   Razón: Empieza con retraso pero lo está superando
   ```

2. **Tus criterios específicos:**
   - ¿Cuándo consideras que algo es "retraso inicial"?
   - ¿Cuándo consideras que la velocidad es "significativamente diferente"?
   - ¿Cómo distingues entre asíntota y velocidad muy baja?

3. **Tu preferencia de enfoque:**
   - ¿Prefieres ajuste rápido de umbrales (A)?
   - ¿O prefieres reestructuración más profunda (B, C, E)?

4. **Prioridad:**
   - ¿Qué tipos de clasificación son más críticos para acertar?
   - ¿Hay algún tipo que sea menos importante?

**Responde estas preguntas y podré afinar el algoritmo específicamente para tus necesidades clínicas.**
