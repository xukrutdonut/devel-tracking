# Cambios: Línea de Tendencia con Exclusión Biológica de Hitos Post-Regresión

## Fecha
2025-01-XX

## Problema Identificado
La línea de tendencia de la gráfica de desarrollo no incluía los puntos de pérdida de hitos en su cálculo de regresión. Esto causaba que la línea de tendencia no reflejara correctamente las regresiones del desarrollo, ya que solo consideraba los puntos promediados por edad cronológica, perdiendo la información de las "caídas" cuando se perdían hitos.

Adicionalmente, se identificó que **no es biológicamente plausible** que un niño adquiera nuevos hitos durante una regresión activa del desarrollo. Por lo tanto, cualquier hito registrado después de la primera pérdida debe excluirse tanto de la visualización como del cálculo de tendencias.

## Solución Implementada

### Cambios en el Filtrado y Visualización

#### Filtrado de Puntos Biológicamente Plausibles
Se agregó lógica para filtrar los puntos antes de cualquier cálculo o visualización:

```javascript
// Filtrar puntos biológicamente plausibles:
// Una vez que ocurre la primera pérdida, no se incluyen adquisiciones posteriores
const primeraEdadPerdida = puntosParaGrafica.find(p => p.tipo === 'perdida')?.edad_cronologica;
const puntosPlausibles = primeraEdadPerdida
  ? puntosParaGrafica.filter(p => {
      // Incluir todas las adquisiciones antes de la primera pérdida
      if (p.tipo === 'adquisicion' && p.edad_cronologica < primeraEdadPerdida) return true;
      // Incluir todas las pérdidas
      if (p.tipo === 'perdida') return true;
      // Excluir adquisiciones posteriores a la primera pérdida
      return false;
    })
  : puntosParaGrafica; // Si no hay pérdidas, usar todos los puntos

// Usar puntos plausibles para TODO: visualización, cálculos, agrupaciones
const datosGraficoGlobal = puntosPlausibles;
const datosParaTendencia = puntosPlausibles;
```

#### Uso en Regresión
**Antes:**
```javascript
const regresionDesarrollo = calcularRegresionPolinomial(datosGrafico, 'edad_cronologica', 'edad_desarrollo_global');
```

**Después:**
```javascript
const regresionDesarrollo = calcularRegresionPolinomial(datosParaTendencia, 'edad_cronologica', 'edad_desarrollo');
```

### Estructuras de Datos

#### `puntosParaGrafica`
- Contiene **todos** los puntos registrados en la base de datos
- Se usa solo para **detectar** inconsistencias
- NO se muestra ni se usa en cálculos

#### `puntosPlausibles` / `datosGraficoGlobal` / `datosParaTendencia`
- Subconjunto filtrado de `puntosParaGrafica`
- Incluye solo puntos biológicamente plausibles:
  - ✅ Todas las adquisiciones **antes** de la primera pérdida
  - ✅ Todas las pérdidas
  - ❌ Adquisiciones **después** de la primera pérdida (completamente excluidas)
- Se usa para:
  - ✅ Visualización en gráfica
  - ✅ Cálculo de regresión de desarrollo
  - ✅ Cálculo de regresión de velocidad
  - ✅ Cálculo de aceleración
  - ✅ Agrupación por dominios

### Cambios Relacionados

1. **Agrupación de Puntos por Dominio** (línea ~333-356)
   - Actualizado para usar `puntosPlausibles` en lugar de `puntosParaGrafica`
   - Solo agrupa puntos biológicamente plausibles

2. **Cálculo de Velocidad** (línea ~513-540)
   - Se calcula desde la **regresión de desarrollo** (no desde puntos crudos)
   - Derivada de `lineaTendenciaDesarrollo`
   - Refleja velocidad suavizada de la tendencia filtrada

3. **Cálculo de Aceleración** (línea ~547-570)
   - Se calcula desde la **regresión de velocidad** (no desde velocidad cruda)
   - Derivada de `lineaTendenciaVelocidad`
   - Muestra cambios en la velocidad suavizada

4. **Regresiones por Dominio** (línea ~589-658)
   - Cada dominio calcula su propia regresión de desarrollo
   - Velocidad por dominio: derivada de regresión de desarrollo del dominio
   - Aceleración por dominio: derivada de regresión de velocidad del dominio

5. **Notas Interpretativas** (línea ~1127-1145)
   - Alerta cuando se detectan adquisiciones post-pérdida
   - Indica cantidad de hitos excluidos
   - Explica que NO se muestran en gráfica

## Comportamiento Resultante

### Escenario 1: Sin Pérdidas
- Todos los puntos de adquisición se incluyen
- Se muestran en gráfica
- Comportamiento idéntico al anterior
- Tendencia muestra progresión normal

### Escenario 2: Con Pérdidas, Sin Adquisiciones Posteriores
- Tendencia incluye adquisiciones pre-pérdida + todas las pérdidas
- Todos los puntos se muestran en gráfica
- La línea muestra claramente la regresión
- Comportamiento clínicamente esperado

### Escenario 3: Con Pérdidas Y Adquisiciones Posteriores
- **Visualización:**
  - Solo se muestran adquisiciones pre-pérdida y pérdidas
  - Adquisiciones post-pérdida NO aparecen en gráfica
  - Eliminación completa de puntos no plausibles
  
- **Línea de Tendencia:**
  - Calcula desde puntos mostrados (solo plausibles)
  - Refleja la trayectoria de regresión sin contaminación
  - Coherente con visualización

- **Alerta Clínica:**
  - Se muestra mensaje sobre N hito(s) excluido(s)
  - Explica que NO se muestran ni se usan en cálculos
  - Razonamiento biológico explícito
  - Sugiere revisión de registros o período separado

### Ejemplo Visual

```
ANTES (con puntos post-regresión):
Edad Desarrollo
     ↑
  20 │         ● (mostrado pero problemático)
  18 │       ╱   
  15 │   ●──● ×  ← tendencia confusa
  12 │ ●      
     └────────────────→ Edad Cronológica
       12  15  18  20

AHORA (sin puntos post-regresión):
Edad Desarrollo
     ↑
  20 │         
  18 │         
  15 │   ●──● ×───×  ← tendencia clara de regresión
  12 │ ●      
     └────────────────→ Edad Cronológica
       12  15  18  20
  
  ⚠️ Alerta: "2 hito(s) excluido(s) - registrados después de pérdida"
```

● azul = adquisición mostrada (pre-pérdida)
× rojo = pérdida mostrada
(vacío) = adquisiciones post-pérdida NO mostradas

## Jerarquía de Cálculos (Cascada)

### Para Desarrollo Global
```
1. datosGraficoGlobal (puntos filtrados)
   ↓
2. regresionDesarrollo (polinómica sobre puntos)
   ↓
3. lineaTendenciaDesarrollo (curva suave generada)
   ↓
4. datosVelocidadDesdeTendencia (derivada de la curva)
   ↓
5. regresionVelocidad (polinómica sobre velocidad)
   ↓
6. lineaTendenciaVelocidad (curva suave de velocidad)
   ↓
7. datosAceleracion (derivada de curva de velocidad)
```

### Para Cada Dominio
```
1. datosGrafico filtrados por dominio
   ↓
2. regresionPorDominio[id] (polinómica)
   ↓
3. lineaTendenciaPorDominio[id] (curva suave)
   ↓
4. datosVelDominio (derivada)
   ↓
5. regresionVelocidadPorDominio[id] (polinómica)
   ↓
6. lineaTendenciaVelocidadPorDominio[id] (curva suave)
   ↓
7. aceleracionDominio (derivada)
```

**Importante:** Todas las regresiones y derivadas trabajan con datos filtrados (biológicamente plausibles)

## Ventajas Clínicas

### 1. **Precisión Diagnóstica**
- La tendencia refleja solo patrones biológicamente plausibles
- Evita interpretaciones erróneas por datos atípicos
- Compatible con criterios DSM-5 para regresión en TEA
- Visualización limpia sin contaminación de datos

### 2. **Detección de Inconsistencias**
- Alerta al clínico cuando hay adquisiciones post-regresión
- Indica cantidad exacta de hitos excluidos
- Puede indicar:
  - Error en fechas de registro
  - Período de recuperación (requiere análisis separado)
  - Necesidad de reevaluación clínica

### 3. **Seguimiento Longitudinal**
- Documenta claramente el inicio de la regresión
- Permite identificar intervenciones efectivas si hay recuperación
- Facilita comunicación con especialistas
- Gráficas coherentes entre desarrollo, velocidad y aceleración

## Fundamento Biológico

### Regresión del Desarrollo
En condiciones neurológicas que causan regresión (ej. TEA, Síndrome de Rett, epilepsia catastrófica):

- **Período Pre-Regresión:** Desarrollo típico con adquisición de hitos
- **Inicio de Regresión:** Pérdida de habilidades previamente adquiridas
- **Período de Regresión Activa:** NO hay nuevas adquisiciones
- **Recuperación (si ocurre):** Es un evento separado, posterior a la estabilización

### Por qué se Excluyen COMPLETAMENTE Adquisiciones Post-Pérdida

1. **No es el patrón típico:** Durante regresión activa, el desarrollo se detiene o retrocede
2. **Puede indicar errores:** Fechas mal registradas o evaluación incorrecta
3. **Si es real:** Representa recuperación, que debe analizarse como fase separada
4. **Evita confusión:** Mezclar regresión y recuperación distorsiona ambas
5. **Mantiene coherencia:** Todas las gráficas (desarrollo, velocidad, aceleración) usan mismos datos

## Archivos Modificados

- `src/components/GraficoDesarrollo.jsx`:
  - Línea ~311-331: Filtrado completo de puntos biológicamente plausibles
  - Línea ~333-356: Agrupación usando solo puntos plausibles
  - Línea ~503-511: Regresión de desarrollo con datos filtrados
  - Línea ~513-540: Velocidad calculada desde regresión de desarrollo
  - Línea ~542-570: Aceleración calculada desde regresión de velocidad
  - Línea ~589-658: Regresiones por dominio siguiendo misma cascada
  - Línea ~1127-1145: Alerta clínica sobre hitos excluidos (NO mostrados)

## Casos de Prueba Recomendados

### Caso 1: Desarrollo Normal
```javascript
Hitos: [12m, 15m, 18m, 21m, 24m] - sin pérdidas
Esperado: 
  - Todos incluidos y mostrados
  - Tendencia ascendente
  - Sin alertas
```

### Caso 2: Regresión Pura
```javascript
Hitos: [12m (adq), 15m (adq), 18m (adq), 20m (pérdida), 21m (pérdida)]
Esperado: 
  - Puntos mostrados: 12m, 15m, 18m + pérdidas
  - Tendencia desciende después de 18m
  - Alerta de regresión
  - Sin alertas de exclusión
```

### Caso 3: Regresión con Adquisiciones Posteriores (Alerta)
```javascript
Hitos: [12m (adq), 15m (adq), 18m (pérdida), 22m (nueva adq), 24m (otra adq)]
Esperado: 
  - Puntos mostrados: 12m, 15m, 18m× (solo 3 puntos)
  - Puntos NO mostrados: 22m, 24m (2 puntos excluidos)
  - Tendencia: solo con 12m, 15m, 18×
  - Alerta: "⚠️ Regresión detectada"
  - Alerta: "ℹ️ 2 hito(s) excluido(s)... NO se muestran en gráfica"
```

### Caso 4: Error de Registro Detectado
```javascript
Hitos: [12m (adq), 15m (pérdida), 14m (adq - fecha incorrecta)]
Esperado: 
  - Alerta visible sobre 1 hito excluido
  - Clínico debe revisar: el hito de 14m está mal fechado
  - Acción: Corregir fecha o eliminar registro
  - Tendencia usa: 12m, 15m, 18m× (excluye 22m)
  - Alerta: "Se registraron hitos después de pérdida..."
```

### Caso 4: Error de Registro
```javascript
Hitos: [12m (adq), 15m (pérdida), 14m (adq - fecha incorrecta)]
Esperado: 
  - Alerta visible
  - Clínico debe revisar fechas
  - Posible corrección de registros
```

## Notas Técnicas

### Detección de Primera Pérdida
```javascript
const primeraEdadPerdida = puntosParaGrafica.find(p => p.tipo === 'perdida')?.edad_cronologica;
```
- Usa el primer punto con `tipo === 'perdida'`
- Array ordenado por edad cronológica garantiza secuencia temporal
- `?.` operator previene errores si no hay pérdidas

### Filtrado Condicional
- Si NO hay pérdidas: `datosParaTendencia === puntosParaGrafica`
- Si HAY pérdidas: `datosParaTendencia` es subconjunto filtrado
- Mantiene compatibilidad con casos sin regresión

### Impacto en Gráficas Derivadas

- **Velocidad:** Calculada desde tendencia filtrada → refleja solo patrón plausible
- **Aceleración:** Cambios en velocidad de tendencia filtrada
- **Z-Score:** Ya excluía pérdidas por diseño previo (sin cambios)

## Compatibilidad

- ✅ Compatible con todos los modos de visualización
- ✅ No afecta vistas por dominio (tienen sus propios filtros)
- ✅ Retrocompatible con datos sin pérdidas
- ✅ No requiere migración de base de datos

## Referencias Clínicas

- **DSM-5:** Criterios de regresión en Trastorno del Espectro Autista
- **Rett Syndrome:** Patrón característico de regresión entre 6-18 meses
- **Epilepsia Catastrófica:** Síndrome de Landau-Kleffner, Síndrome de West
- **Literatura:** Hansen et al. (2008) - Regresión en TEA: timing y características

