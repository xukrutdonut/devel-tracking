# Mejoras en el Generador de Informes PDF y TXT

**Fecha**: 2024
**Componente**: `GeneradorInforme.jsx`

## Problema Identificado

La herramienta de generación de informes PDF y TXT no proporcionaba toda la información necesaria de cálculos (CD, edad de desarrollo, z-score) para cada dominio ni para la puntuación total. Además, el modo TXT carecía de gráficos ASCII visuales apropiados.

## Cambios Implementados

### 1. Información Completa de Cálculos

#### Puntuación Global (Resumen Ejecutivo)
Ahora el informe incluye todas las métricas globales:
- **Edad Cronológica (EC)**: Calculada con corrección por prematuridad
- **Edad de Desarrollo (ED)**: Promedio de las ED de todos los dominios
- **Diferencia (ED - EC)**: Muestra el adelanto/retraso en meses
- **Cociente de Desarrollo (CD)**: (ED / EC) × 100
- **Puntuación Z Global**: Promedio de z-scores de todos los dominios
- **Interpretación**: Clasificación basada en puntuación Z

#### Datos por Dominio
Para cada dominio del desarrollo se calcula y muestra:

**Formato TXT:**
```
Motor Grueso (5 hitos evaluados):
  ┌─────────────────────────────────────────────────────────┐
  │ Edad de Desarrollo (ED):     24.5    meses    │
  │ Edad Cronológica (EC):       24.0    meses    │
  │ Diferencia (ED - EC):        +0.5    meses    │
  │ Cociente Desarrollo (CD):    102.1   %         │
  │ Puntuación Z:                0.50    DE        │
  │ Interpretación:              NORMAL (-1 a +1 DE)         │
  └─────────────────────────────────────────────────────────┘
```

**Formato PDF:**
- Resumen ejecutivo con métricas globales
- Sección detallada por dominio con todas las métricas (ED, EC, CD, Z)
- Interpretación clínica de cada dominio

### 2. Gráficos ASCII para Modo TXT

Se han implementado dos gráficos ASCII de alta calidad:

#### Gráfica 1: Edad de Desarrollo por Dominio
Muestra visualmente la ED de cada dominio comparada con la EC:

```
GRÁFICA 1: EDAD DE DESARROLLO POR DOMINIO
═══════════════════════════════════════════════════════════
(Cada █ representa 0.6 meses)

Motor Grueso      │███████████████████████████████████████ 24.5m ≈ EC
Motor Fino        │███████████████████████████████████ 22.0m -2.0m
Lenguaje Receptivo│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 20.0m -4.0m
Lenguaje Expresivo│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 18.5m -5.5m
                  │──────────────────────────────────────────────────
                  │  ↓
                  0     6     12    18    24    30 (meses)

  ↓ EC (Edad Cronológica): 24.0 meses
  █ ED por encima o similar a EC
  ▓ ED por debajo de EC
```

**Características:**
- Barras horizontales con caracteres Unicode
- Diferenciación visual entre desarrollo normal (█) y atrasado (▓)
- Indicador de EC con flecha
- Valores numéricos de ED y diferencia con EC
- Escala en meses en el eje horizontal

#### Gráfica 2: Puntuación Z por Dominio
Visualiza las desviaciones estándar de cada dominio:

```
GRÁFICA 2: PUNTUACIÓN Z POR DOMINIO (DESVIACIONES ESTÁNDAR)
═══════════════════════════════════════════════════════════
(Rango normal: -1 a +1 DE | Vigilancia: -2 a -1 DE | Retraso: < -2 DE)

Motor Grueso      │                         │   ○                     z=0.50
Motor Fino        │                  ○      │                         z=-0.80
Lenguaje Receptivo│             ◐           │                         z=-1.50
Lenguaje Expresivo│       ●                 │                         z=-2.20
                  │──────────────────────────────────────────────────
                  │     ┴       ┴      ┼      ┴       ┴
                  -3   -2      -1      0     +1      +2     +3 DE

  ● Retraso severo (< -2 DE) | ◐ Vigilancia (-2 a -1 DE)
  ○ Normal (-1 a +1 DE) | ◉ Adelantado (> +1 DE)
  │ Línea de referencia (Z=0, desarrollo esperado)
```

**Características:**
- Representa el continuo de -3 a +3 desviaciones estándar
- Símbolos diferentes según gravedad:
  - ● Retraso severo (< -2 DE)
  - ◐ Vigilancia (-2 a -1 DE)
  - ○ Normal (-1 a +1 DE)
  - ◉ Adelantado (> +1 DE)
- Línea central marca Z=0 (desarrollo esperado)
- Líneas verticales marcan límites de zonas clínicas
- Valores numéricos de z-score

### 3. Cálculos Mejorados

#### Metodología de Cálculo
Para cada dominio:
1. **ED del dominio**: Promedio de las edades medias de los hitos conseguidos en ese dominio
2. **Desviación estándar**: Promedio de las DE de los hitos, o 15% de EC (mínimo 2 meses)
3. **Z-score**: (ED - EC) / DE
4. **CD**: (ED / EC) × 100

Para el total global:
1. **ED global**: Promedio de las ED de todos los dominios
2. **Z-score global**: Promedio de los z-scores de todos los dominios
3. **CD global**: (ED global / EC) × 100

#### Interpretación de Z-score
```javascript
z >= 2    → MUY ADELANTADO (>+2 DE) - Desarrollo significativamente superior
z >= 1    → ADELANTADO (+1 a +2 DE) - Desarrollo superior al promedio
z >= -1   → NORMAL (-1 a +1 DE) - Desarrollo dentro del rango esperado
z >= -2   → VIGILANCIA (-2 a -1 DE) - Requiere seguimiento
z >= -3   → RETRASO MODERADO (-3 a -2 DE) - Requiere intervención
z < -3    → RETRASO SEVERO (<-3 DE) - Requiere intervención urgente
```

## Mejoras Técnicas

### Compatibilidad con Modo Invitado
Los cálculos funcionan tanto con datos del servidor como con datos locales (modo invitado):
- Verifica existencia de `analisisData.hitos_conseguidos`
- Agrupa hitos por dominio dinámicamente
- Calcula métricas desde los datos disponibles

### Corrección de Edad
Utiliza `calcularEdadCorregidaMeses()` que considera:
- Prematuridad (semanas de gestación)
- Corrección hasta los 24 meses en prematuros

### Robustez
- Manejo de casos donde no hay datos (`N/A`)
- Validación de existencia de hitos por dominio
- Cálculos seguros con valores por defecto

## Estructura del Informe

### Modo TXT (para copiar/pegar en historias clínicas)
1. **Encabezado**: Fecha, sistema, institución
2. **Datos del Paciente**: Información demográfica
3. **Resumen Ejecutivo**: Métricas globales completas
4. **Perfil de Desarrollo por Dominios**:
   - Gráfica 1: Barras de ED por dominio
   - Gráfica 2: Z-scores por dominio
   - Tabla detallada con todas las métricas
5. **Análisis de Asincronías**: Diferencias significativas entre dominios
6. **Señales de Alarma**: Red flags observadas (si existen)
7. **Interpretación y Recomendaciones**: Análisis clínico
8. **Referencias Científicas**: CDC, Pathways.org, Thomas 2009, Tervo 2006
9. **Nota Importante**: Disclaimer profesional

### Modo PDF
Similar estructura pero con:
- Formato profesional con tipografías
- Gráficos Recharts capturados (si disponibles)
- Paginación automática
- Layout optimizado para impresión

## Uso

### Generar Informe TXT
1. Abrir generador de informes desde componente de gráficos
2. Seleccionar "Texto plano"
3. Opciones:
   - **Copiar al portapapeles**: Para pegar en historia clínica electrónica
   - **Descargar TXT**: Para archivo local

### Generar Informe PDF
1. Seleccionar "PDF (con gráficos)"
2. Click en "Descargar PDF"
3. Se genera archivo con formato profesional

## Ejemplo de Salida Completa

Ver el informe generado incluye:
- ✅ Todas las métricas de cálculo (ED, EC, CD, Z) por dominio
- ✅ Puntuación global con todas las métricas
- ✅ 2 gráficos ASCII visuales en modo TXT
- ✅ Interpretación clínica basada en Z-scores
- ✅ Análisis de asincronías entre dominios
- ✅ Referencias científicas
- ✅ Formato apropiado para historia clínica

## Referencias Científicas Utilizadas

- **CDC (2022)**: Developmental Milestones - Learn the Signs. Act Early.
- **Pathways.org (2024)**: Developmental Milestone Resources
- **Thomas et al. (2009)**: Using developmental trajectories to understand developmental disorders. J Speech Lang Hear Res, 52(2):336-58
- **Tervo (2006)**: Identifying patterns of developmental delays can help diagnose neurodevelopmental disorders. Clin Pediatr, 45(6):509-17

## Impacto Clínico

Los informes mejorados proporcionan:
1. **Información completa** para toma de decisiones clínicas
2. **Visualización clara** del perfil de desarrollo
3. **Métricas estandarizadas** (z-scores, CD) comparables
4. **Formato profesional** para documentación clínica
5. **Compatibilidad** con sistemas de historia clínica electrónica

## Archivos Modificados

- `src/components/GeneradorInforme.jsx`: Todas las mejoras implementadas

## Testing

✅ Verificado funcionamiento de:
- Cálculo de métricas por dominio
- Cálculo de métricas globales
- Generación de gráficos ASCII
- Formato TXT completo
- Formato PDF con todas las secciones
