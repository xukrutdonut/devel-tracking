# Herramienta de Validación y Ajuste de Clasificación

## Objetivo

Afinar los criterios de clasificación automática para que coincidan con tu juicio clínico experto.

## Casos de Prueba

Por favor, proporciona ejemplos de trayectorias y cómo deberían clasificarse:

### Formato de Caso

```
Caso X: [Nombre descriptivo]
Datos:
  - Edad 1: ED=X, EC=Y
  - Edad 2: ED=X, EC=Y
  - ...

Tu clasificación esperada: [TIPO]
Clasificación actual del sistema: [TIPO]
```

## Ejemplos para Completar

### Caso 1: Retraso estable
```
Datos:
  - 12m: ED=9, EC=12
  - 18m: ED=15, EC=18
  - 24m: ED=21, EC=24
  - 30m: ED=27, EC=30

Análisis:
  - Intercepto bajo: ~3 meses de retraso
  - Pendiente: 1.0 (normal)
  - R²: ~1.0

Tu clasificación: _______________
Sistema clasifica: DELAYED_ONSET
```

### Caso 2: Velocidad reducida
```
Datos:
  - 12m: ED=12, EC=12
  - 18m: ED=15, EC=18
  - 24m: ED=18, EC=24
  - 30m: ED=21, EC=30

Análisis:
  - Intercepto: Normal (12)
  - Pendiente: 0.5 (reducida a la mitad)
  - R²: ~1.0
  - Diferencia aumenta con el tiempo

Tu clasificación: _______________
Sistema clasifica: SLOWED_RATE_DIVERGENTE
```

### Caso 3: Catching up
```
Datos:
  - 12m: ED=8, EC=12
  - 18m: ED=15, EC=18
  - 24m: ED=22, EC=24
  - 30m: ED=29, EC=30

Análisis:
  - Intercepto bajo: ~4 meses retraso inicial
  - Pendiente: 1.4 (acelerada)
  - R²: ~1.0
  - Diferencia disminuye con el tiempo

Tu clasificación: _______________
Sistema clasifica: SLOWED_RATE_CONVERGENTE
```

### Caso 4: Regresión/Dismadurez
```
Datos:
  - 12m: ED=12, EC=12
  - 18m: ED=17, EC=18
  - 24m: ED=20, EC=24
  - 30m: ED=21, EC=30

Análisis:
  - Inicio normal
  - Desaceleración progresiva
  - R² cuadrático mejor que lineal

Tu clasificación: _______________
Sistema clasifica: _______________
```

### Caso 5: Asíntota prematura
```
Datos:
  - 12m: ED=10, EC=12
  - 18m: ED=18, EC=18
  - 24m: ED=25, EC=24
  - 30m: ED=26, EC=30
  - 36m: ED=26, EC=36

Análisis:
  - Progreso inicial rápido
  - Se estanca en 26 meses
  - Cambio inicial: 8m/6meses
  - Cambio final: 0m/6meses

Tu clasificación: _______________
Sistema clasifica: PREMATURE_ASYMPTOTE
```

## Parámetros Actuales del Sistema

### DELAYED_ONSET
```javascript
// Criterios:
- R² > 0.7 (lineal confiable)
- Intercepto < 85% (nivel inicial bajo)
- |Pendiente| < 0.2 (velocidad cercana a 0)

// Traducción:
- Empieza por debajo
- Progresa al mismo ritmo que normales
- La brecha se mantiene constante
```

### SLOWED_RATE
```javascript
// CONVERGENTE (catching up):
- R² > 0.7
- |Pendiente| > 0.2
- Pendiente > 0 (positiva)

// DIVERGENTE (alejándose):
- R² > 0.7
- |Pendiente| > 0.2
- Pendiente < 0 (negativa)

// Traducción:
- Inicio puede ser normal o bajo
- Velocidad diferente a la normal
- Convergente: se acerca a normalidad
- Divergente: se aleja de normalidad
```

### PREMATURE_ASYMPTOTE
```javascript
// Criterios:
- Cambio promedio final < 1 punto
- Nivel actual < esperado - 10
- Cambio inicial > Cambio final * 3

// Traducción:
- Progresaba bien al inicio
- Se detuvo antes de llegar al nivel esperado
- Desaceleración marcada (>3x)
```

### NONLINEAR
```javascript
// Criterios:
- R² cuadrático > R² lineal + 0.1
- Test F significativo

// Traducción:
- La trayectoria es curva, no recta
- Velocidad cambia con la edad
- Posibles oleadas o ventanas críticas
```

## Preguntas Críticas

### 1. Sobre DELAYED_ONSET vs SLOWED_RATE

**Pregunta:** Si un niño empieza con retraso (ED=8 a EC=12) pero luego progresa más rápido (catching up), ¿cómo lo clasificarías?

A) DELAYED_ONSET (porque empezó tarde)
B) SLOWED_RATE_CONVERGENTE (porque está recuperando)
C) DELAYED_ONSET + SLOWED_RATE (ambos)

**Sistema actual clasifica como:** B (SLOWED_RATE_CONVERGENTE)

### 2. Sobre umbrales de pendiente

**Pregunta:** ¿Qué consideras una velocidad "significativamente diferente"?

Contexto:
- Pendiente normal ≈ 0 (CD se mantiene)
- Pendiente de 0.5 = gana 0.5 meses ED por cada mes EC
- Pendiente de 1.0 = gana 1 mes ED por cada mes EC (catching up perfecto)

**Opciones:**
A) Umbral actual (|pendiente| > 0.2) está bien
B) Debería ser más estricto (> 0.3 o > 0.5)
C) Debería ser menos estricto (> 0.1)

**Sistema actual usa:** 0.2

### 3. Sobre asíntota vs velocidad muy baja

**Pregunta:** Si un niño progresa muy lentamente pero de forma constante (ej: 0.5 meses cada 6 meses), ¿es asíntota o velocidad reducida?

**Opciones:**
A) PREMATURE_ASYMPTOTE (casi no avanza)
B) SLOWED_RATE_DIVERGENTE (avanza pero muy lento)
C) Depende del contexto (edad, nivel alcanzado)

**Sistema actual clasifica como:** B (si velocidad es constante)

### 4. Sobre datos de referencia

**Pregunta:** ¿Sería útil tener curvas normativas de referencia (percentil 50) para comparar?

**Beneficio:** Podría clasificar basándose en:
- Diferencia real en intercepto vs referencia típica
- Diferencia real en pendiente vs referencia típica

**¿Es necesario?**
- Sí, mejoraría significativamente
- No, los criterios actuales son suficientes

## Propuestas de Mejora

### Opción 1: Ajustar umbrales numéricos

Modificar los valores actuales:

```javascript
// ACTUAL:
const UMBRAL_PENDIENTE = 0.2;
const UMBRAL_INTERCEPTO = 85;
const RATIO_ASINTOTA = 3;

// PROPUESTA:
const UMBRAL_PENDIENTE = 0.3;  // Más estricto
const UMBRAL_INTERCEPTO = 80;  // Más estricto
const RATIO_ASINTOTA = 4;      // Más estricto
```

### Opción 2: Añadir lógica contextual

```javascript
// Ejemplo: Para catching up, considerar también nivel inicial
if (pendiente > 0.2 && intercepto < 70) {
  // Si empieza muy bajo Y velocidad aumentada
  tipo = 'DELAYED_ONSET_PLUS_SLOWED_RATE';
  subtipo = 'RECOVERING'; // Catching up desde retraso inicial
}
```

### Opción 3: Clasificación jerárquica

Primero determinar categoría principal, luego subcategoría:

```
1. ¿Inicio retrasado? (intercepto < 85)
   SÍ → 
     - ¿Velocidad normal? → DELAYED_ONSET
     - ¿Velocidad baja? → DELAYED_ONSET + SLOWED_RATE
     - ¿Velocidad alta? → DELAYED_ONSET + CATCHING_UP
   NO →
     - ¿Velocidad normal? → NORMAL
     - ¿Velocidad baja? → SLOWED_RATE_DIVERGENTE
     - ¿Velocidad alta? → SLOWED_RATE_CONVERGENTE
```

### Opción 4: Usar percentiles de velocidad

En lugar de umbrales fijos, usar desviaciones estándar:

```javascript
// Si tienes datos normativos de velocidad típica:
const velocidadNormal = 0.0; // CD se mantiene
const sigmaVelocidad = 0.15; // Desviación típica

// Clasificar según Z-score de velocidad:
const zVelocidad = (velocidad - velocidadNormal) / sigmaVelocidad;

if (zVelocidad < -2) {
  // Velocidad significativamente reducida
  tipo = 'SLOWED_RATE_DIVERGENTE';
} else if (zVelocidad > 2) {
  // Velocidad significativamente aumentada
  tipo = 'SLOWED_RATE_CONVERGENTE';
}
```

## Cómo Proceder

Para afinar el algoritmo, necesito que me proporciones:

1. **Ejemplos reales de casos mal clasificados:**
   - Los datos (edades y EDs)
   - Tu clasificación esperada
   - La clasificación que dio el sistema

2. **Tus respuestas a las preguntas críticas (1-4 arriba)**

3. **Tu preferencia entre las opciones de mejora**

4. **Casos límite importantes:**
   - ¿Qué diferencia mínima consideras "retraso"?
   - ¿Qué cambio de velocidad consideras "significativo"?
   - ¿Cuándo algo pasa de "velocidad baja" a "estancado"?

## Formato de Respuesta Sugerido

```
CASO MAL CLASIFICADO:
Datos: [pegar datos]
Sistema dice: X
Debería ser: Y
Razón: [tu justificación clínica]

RESPUESTAS:
Pregunta 1: B
Pregunta 2: A
Pregunta 3: C - depende si nivel > 70% o < 70%
Pregunta 4: Sí, sería muy útil

UMBRALES SUGERIDOS:
Pendiente significativa: > 0.25
Intercepto retrasado: < 80
Ratio asíntota: > 4

CASOS LÍMITE:
- Retraso: < 85% o diferencia > 3 meses
- Velocidad significativa: > 0.3 puntos/mes
- Estancado: < 0.5 puntos en 6 meses
```

Con esta información podré ajustar el algoritmo para que coincida con tu criterio clínico.
