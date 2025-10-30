# Cambios en Gráficas: Edad de Desarrollo vs Edad Cronológica

## Fecha de Implementación
30 de Octubre, 2024

## Descripción General
Se ha reemplazado el sistema de gráficas basado en Z-scores, velocidad y aceleración por un nuevo enfoque que visualiza la **Edad de Desarrollo** vs **Edad Cronológica**, proporcionando una interpretación más intuitiva y clínicamente relevante del progreso del niño.

## Concepto: Edad de Desarrollo

### ¿Qué es la Edad de Desarrollo?
La edad de desarrollo es la edad normativa (edad media esperada) de los hitos que un niño ha alcanzado. Por ejemplo:
- Si un niño logra un hito que típicamente se alcanza a los 12 meses, su edad de desarrollo para ese hito es de 12 meses
- Si ha logrado múltiples hitos, la edad de desarrollo es el promedio de las edades normativas de esos hitos

### Cálculo de Edad de Desarrollo

#### Edad de Desarrollo Global
```
Edad de Desarrollo Global = Promedio(edad_media_meses de todos los hitos alcanzados)
```

**Ejemplo:**
- Hito 1: "Camina solo" - edad media: 13 meses
- Hito 2: "Dice palabras" - edad media: 12 meses  
- Hito 3: "Pinza superior" - edad media: 10 meses
- **Edad de Desarrollo Global = (13 + 12 + 10) / 3 = 11.67 meses**

#### Edad de Desarrollo por Dominio
```
Edad de Desarrollo de Dominio X = Promedio(edad_media_meses de hitos del dominio X)
```

**Ejemplo (Motor Grueso):**
- "Se sienta sin apoyo" - edad media: 7 meses
- "Gatea" - edad media: 9 meses
- "Camina solo" - edad media: 13 meses
- **Edad de Desarrollo Motor Grueso = (7 + 9 + 13) / 3 = 9.67 meses**

## Cambios Realizados

### Eliminado
- ❌ Gráfico de Z-scores a lo largo del tiempo
- ❌ Gráfico de Velocidad de Desarrollo (primera derivada)
- ❌ Gráfico de Aceleración de Desarrollo (segunda derivada)
- ❌ Métricas basadas en desviaciones estándar

### Agregado
- ✅ Gráfico de Edad de Desarrollo vs Edad Cronológica
- ✅ Cálculo de Edad de Desarrollo Global
- ✅ Cálculo de Edad de Desarrollo por Dominio
- ✅ Línea de referencia de desarrollo típico (45°)
- ✅ Métricas de diferencia (adelanto/retraso en meses)

## Componente Modificado

### `src/components/GraficoDesarrollo.jsx`

#### Nuevas Funcionalidades

1. **Cálculo de Edad de Desarrollo**
   ```javascript
   // La edad de desarrollo es la edad normativa del hito
   const hitosConEdadDesarrollo = analisis.hitos_conseguidos.map(hito => ({
     ...hito,
     edad_desarrollo: hito.edad_media_meses,
     edad_cronologica: hito.edad_conseguido_meses
   }));
   ```

2. **Agrupación por Edad Cronológica**
   - Se agrupan los hitos por edad cronológica
   - Se calcula el promedio de edad de desarrollo en cada punto temporal
   - Se separa por dominio para análisis específico

3. **Visualizaciones Disponibles**
   - **Global**: Muestra edad de desarrollo global vs edad cronológica
   - **Todos los Dominios**: Muestra todas las líneas de dominios simultáneamente
   - **Dominio Específico**: Muestra solo un dominio seleccionado

4. **Línea de Desarrollo Típico**
   - Línea diagonal de 45° que representa desarrollo = cronología
   - Puntos sobre la línea = desarrollo adelantado
   - Puntos bajo la línea = desarrollo retrasado
   - Opcional (checkbox para mostrar/ocultar)

## Interpretación de la Gráfica

### Ejes
- **Eje X**: Edad Cronológica (meses)
- **Eje Y**: Edad de Desarrollo (meses)

### Línea de Referencia (45°)
La línea diagonal representa desarrollo típico donde:
```
Edad de Desarrollo = Edad Cronológica
```

### Posición de los Puntos

#### Sobre la línea (Y > X)
- **Significado**: Desarrollo adelantado
- **Ejemplo**: A los 12 meses cronológicos, edad de desarrollo de 15 meses
- **Interpretación**: El niño está 3 meses adelantado

#### En la línea (Y = X)
- **Significado**: Desarrollo típico
- **Ejemplo**: A los 12 meses cronológicos, edad de desarrollo de 12 meses
- **Interpretación**: Desarrollo acorde a la edad

#### Bajo la línea (Y < X)
- **Significado**: Desarrollo retrasado
- **Ejemplo**: A los 12 meses cronológicos, edad de desarrollo de 9 meses
- **Interpretación**: El niño está 3 meses retrasado

### Criterios de Interpretación

| Diferencia | Categoría | Significado Clínico |
|-----------|-----------|-------------------|
| > +3 meses | Adelanto significativo | Desarrollo notablemente avanzado |
| +1 a +3 meses | Ligero adelanto | Desarrollo algo avanzado |
| -1 a +1 mes | Desarrollo típico | Dentro de variabilidad normal |
| -1 a -3 meses | Ligero retraso | Requiere monitoreo |
| < -3 meses | Retraso significativo | Requiere evaluación especializada |

## Nuevas Métricas Mostradas

### Tarjetas de Resumen

1. **Edad Cronológica**
   - Edad actual del niño en meses
   - Se calcula desde fecha de nacimiento

2. **Edad de Desarrollo Global**
   - Promedio de edades normativas de todos los hitos alcanzados
   - Indica nivel global de madurez del desarrollo

3. **Diferencia**
   - Edad de Desarrollo - Edad Cronológica
   - Positivo: adelanto, Negativo: retraso
   - En meses

4. **Total de Hitos**
   - Número total de hitos evaluados

### Estadísticas por Dominio

Para cada dominio del desarrollo:

1. **Edad de Desarrollo**: Promedio de edades normativas de hitos del dominio
2. **Diferencia**: Comparación con edad cronológica
3. **Hitos Evaluados**: Cantidad de hitos del dominio
4. **Estado**: Interpretación (adelanto/típico/retraso)

## Ventajas del Nuevo Enfoque

### Para Clínicos

1. **Interpretación Intuitiva**
   - Más fácil de entender que Z-scores
   - Diferencias expresadas en meses son más tangibles
   - Visualización clara del adelanto o retraso

2. **Comunicación con Familias**
   - Lenguaje más accesible
   - "Su hijo tiene desarrollo de X meses" vs "Z-score de +1.5"
   - Facilita conversaciones sobre progreso

3. **Planificación de Intervenciones**
   - Identifica dominios específicos con retraso
   - Cuantifica magnitud del retraso en términos temporales
   - Facilita establecer objetivos medibles

### Para el Seguimiento

1. **Progresión Clara**
   - La pendiente de la línea muestra velocidad de desarrollo
   - Línea paralela a 45° = desarrollo consistente
   - Cambios de pendiente indican aceleración/desaceleración

2. **Comparación Entre Dominios**
   - Visualización simultánea de todos los dominios
   - Identifica fortalezas y debilidades
   - Detecta patrones de desarrollo asincrónico

3. **Integración con Edad Corregida**
   - Compatible con niños pretérmino
   - Se usa edad corregida en evaluaciones cuando corresponde
   - Interpretación uniforme

## Ejemplo Práctico

### Caso: Niño de 18 meses

**Hitos Alcanzados:**
- Motor Grueso: Camina solo (13m), Sube escaleras (18m) → Edad Desarrollo = 15.5m
- Motor Fino: Pinza superior (10m), Apila 4 cubos (18m) → Edad Desarrollo = 14m
- Lenguaje: Primera palabra (12m), 10-20 palabras (18m) → Edad Desarrollo = 15m
- Social: Juego paralelo (24m) → Edad Desarrollo = 24m

**Cálculos:**
```
Edad Cronológica = 18 meses

Edad Desarrollo Motor Grueso = 15.5 meses → Diferencia: -2.5 meses
Edad Desarrollo Motor Fino = 14 meses → Diferencia: -4 meses (⚠️)
Edad Desarrollo Lenguaje = 15 meses → Diferencia: -3 meses
Edad Desarrollo Social = 24 meses → Diferencia: +6 meses (✅)

Edad Desarrollo Global = (15.5 + 14 + 15 + 24) / 4 = 17.1 meses
Diferencia Global = -0.9 meses (típico)
```

**Interpretación:**
- Desarrollo global dentro de lo típico
- Fortaleza en área social (adelantado)
- Área de atención: Motor fino (retraso de 4 meses)
- Recomendación: Estimulación específica de motricidad fina

## Filtros y Opciones

### Selector de Visualización
1. **Edad de Desarrollo Global**: Una sola línea con promedio general
2. **Todos los Dominios**: Todas las líneas de colores simultáneamente
3. **Dominio Específico**: Solo el dominio seleccionado

### Selector de Fuente Normativa
- CDC, OMS, Bayley, Battelle
- Cambia los valores de referencia (edad media de hitos)
- Afecta el cálculo de edad de desarrollo

### Checkbox: Línea de Desarrollo Típico
- Muestra/oculta la línea diagonal de referencia
- Útil para reducir ruido visual cuando se analizan múltiples dominios

## Colores por Dominio

Los mismos colores se mantienen para consistencia:

| Dominio | Color |
|---------|-------|
| Motor Grueso | Rojo (#FF6B6B) |
| Motor Fino | Turquesa (#4ECDC4) |
| Lenguaje Receptivo | Azul claro (#45B7D1) |
| Lenguaje Expresivo | Verde claro (#96CEB4) |
| Social-Emocional | Amarillo (#FFEAA7) |
| Cognitivo | Gris claro (#DFE6E9) |
| Adaptativo | Morado (#A29BFE) |
| Global | Azul oscuro (#2c3e50) |

## Tooltip Interactivo

Al pasar el mouse sobre un punto se muestra:
- Edad cronológica del punto
- Edad de desarrollo (global o por dominio)
- Interpretación de la diferencia
- Lista de hitos evaluados en ese momento
- Cantidad de hitos por dominio

## Red Flags

Se mantienen las señales de alarma:
- Marcadores rojos (🚩) en la línea temporal
- Lista detallada al final del componente
- Correlación con momentos específicos del desarrollo

## Compatibilidad

### Con Edad Corregida
- Si el niño es pretérmino, se usa edad corregida para evaluaciones
- Los cálculos de edad de desarrollo son independientes
- La comparación refleja el desarrollo real vs edad corregida

### Con Múltiples Fuentes Normativas
- Cada fuente tiene sus propios valores de edad media
- Cambiar fuente recalcula todas las edades de desarrollo
- Permite comparación entre diferentes estándares

## Próximas Mejoras Sugeridas

1. **Proyección de Desarrollo**
   - Línea de tendencia para proyectar desarrollo futuro
   - Estimación de cuándo alcanzará ciertos hitos

2. **Comparación Temporal**
   - Superponer evaluaciones de diferentes fechas
   - Ver evolución a lo largo del tiempo

3. **Rangos de Normalidad**
   - Banda de confianza alrededor de la línea 45°
   - Visualizar rangos de variabilidad típica

4. **Export de Gráficas**
   - Guardar como imagen para informes
   - Generar PDF con interpretaciones

5. **Alertas Automáticas**
   - Notificaciones cuando la diferencia supera umbrales
   - Sugerencias de áreas a estimular

## Referencias Conceptuales

Este enfoque está basado en:
- **Edad Equivalente** en escalas como Bayley-III y BDI-2
- **Age-equivalent scores** en evaluación del desarrollo
- **Developmental quotient** = (Edad de Desarrollo / Edad Cronológica) × 100

## Conclusión

El cambio de Z-scores a Edad de Desarrollo proporciona:
- **Mayor claridad**: Meses son más intuitivos que desviaciones estándar
- **Mejor comunicación**: Lenguaje accesible para familias y equipos multidisciplinarios
- **Utilidad clínica**: Facilita planificación de intervenciones y seguimiento
- **Visualización efectiva**: La gráfica 2D es más fácil de interpretar

Esta aproximación mantiene el rigor científico mientras mejora la usabilidad práctica del sistema.
