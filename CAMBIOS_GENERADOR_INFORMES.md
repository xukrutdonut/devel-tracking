# Mejoras en el Generador de Informes

## Fecha
5 de noviembre de 2024

## Resumen

Se ha mejorado significativamente el componente `GeneradorInforme.jsx` para incluir datos mínimos obligatorios y una visualización ASCII de los resultados.

## Cambios Realizados

### 1. Nueva Sección: Resumen Ejecutivo (Sección 2)

Ahora incluye los **datos mínimos obligatorios**:

```
───────────────────────────────────────────────────────────
2. RESUMEN EJECUTIVO
───────────────────────────────────────────────────────────

Edad Cronológica (EC): 23.0 meses
Edad de Desarrollo Global (ED): 22.5 meses
Diferencia (ED - EC): -0.5 meses
Puntuación Z Global: -0.35 DE
Cociente Desarrollo (CD): 97.8%

Interpretación Global: NORMAL (-1 a +1 DE) - Desarrollo dentro del rango esperado
```

#### Datos Incluidos:
1. **Edad Cronológica (EC):** En meses, calculada desde fecha de nacimiento
2. **Edad de Desarrollo Global (ED):** Promedio ponderado de todos los dominios
3. **Diferencia (ED - EC):** Diferencia en meses entre ED y EC
4. **Puntuación Z Global:** Estandarizada, en desviaciones estándar
5. **Cociente de Desarrollo (CD):** Porcentaje (ED/EC * 100)
6. **Interpretación:** Basada en Z-score

### 2. Gráfica ASCII de Barras (Sección 3)

Nueva visualización en formato texto del perfil de desarrollo:

```
GRÁFICA DE EDAD DE DESARROLLO POR DOMINIO
(Cada █ representa 0.5 meses)

Motor Grueso      │████████████████████████████ 22.0m ≈ EC
Motor Fino        │█████████████████████ 18.0m -5.0m
Lenguaje Recep.   │████████████████████████████ 24.0m +1.0m
Lenguaje Expr.    │████████████████████████ 20.0m -3.0m
Social-Emocional  │███████████████████████████ 23.0m ≈ EC
Cognitivo         │██████████████████████████████ 25.0m +2.0m
Adaptativo        │████████████████████████ 21.0m -2.0m
                  │─────────────────────────────────
                  │┴        ┴        ┴      ↓ ┴        
                   0        7        14     21     28   (meses)

  EC (Edad Cronológica): 23.0 meses ↓
  ED (Edad de Desarrollo): Mostrada para cada dominio
```

#### Características de la Gráfica:
- **Barras horizontales:** Cada dominio tiene su barra proporcional
- **Escala automática:** Se ajusta al rango de datos
- **Indicador de EC:** Flecha ↓ marca la edad cronológica
- **Diferencias claras:** Muestra +/-X.Xm respecto a EC
- **Comparación visual:** Símbolo ≈ para diferencias < 2 meses

### 3. Datos Detallados por Dominio

Para cada dominio se incluye:

```
Motor Fino:
  Edad de Desarrollo: 18.0 meses
  Edad Cronológica:   23.0 meses
  Diferencia:         -5.0 meses
  Puntuación Z:       -1.50 DE
  CD:                 78.3%
  Interpretación:     VIGILANCIA (-2 a -1 DE) - Requiere seguimiento
```

### 4. Nueva Función: `generarGraficaASCII()`

```javascript
function generarGraficaASCII(datosDominios, edadCronologica) {
  // Calcula escala automática
  const escalaMax = Math.max(edadCronologica * 1.2, ...datosDominios.map(d => d.ed));
  const anchoGrafica = 60; // caracteres
  
  // Genera barras proporcionales
  // Añade indicadores de diferencia
  // Dibuja línea de escala con marcas
  // Incluye leyenda explicativa
  
  return grafica;
}
```

### 5. Nueva Función: `interpretarZScore()`

Proporciona interpretación clínica del Z-score:

```javascript
function interpretarZScore(z) {
  if (z >= 2) return 'MUY ADELANTADO (>+2 DE)';
  if (z >= 1) return 'ADELANTADO (+1 a +2 DE)';
  if (z >= -1) return 'NORMAL (-1 a +1 DE)';
  if (z >= -2) return 'VIGILANCIA (-2 a -1 DE)';
  if (z >= -3) return 'RETRASO MODERADO (-3 a -2 DE)';
  return 'RETRASO SEVERO (<-3 DE)';
}
```

### 6. Análisis de Asincronías Mejorado

Ahora detecta automáticamente diferencias significativas entre dominios:

```
───────────────────────────────────────────────────────────
4. ANÁLISIS DE ASINCRONÍAS
───────────────────────────────────────────────────────────

• Motor Fino vs Cognitivo: 7.0 meses de diferencia
  → Cognitivo está más adelantado
• Motor Fino vs Lenguaje Recep.: 6.0 meses de diferencia
  → Lenguaje Recep. está más adelantado
```

**Criterio:** Diferencia > 3 meses entre dominios se considera significativa.

## Estructura Completa del Informe

```
1. DATOS DEL PACIENTE
   - Identificación básica
   - Edad cronológica
   - Prematuridad (si aplica)
   - Factores de riesgo

2. RESUMEN EJECUTIVO
   ✨ NUEVO: Datos mínimos obligatorios
   - EC, ED, Diferencia, Z-score, CD
   - Interpretación global

3. PERFIL DE DESARROLLO POR DOMINIOS
   ✨ NUEVO: Gráfica ASCII de barras
   - Visualización proporcional
   - Indicador de EC
   - Datos detallados por dominio

4. ANÁLISIS DE ASINCRONÍAS
   ✨ MEJORADO: Detección automática
   - Diferencias significativas
   - Interpretación clínica

5. SEÑALES DE ALARMA OBSERVADAS
   - Red flags registradas
   - Edad de observación

6. INTERPRETACIÓN Y RECOMENDACIONES
   - Análisis clínico
   - Plan de seguimiento
```

## Cálculos Realizados

### Edad de Desarrollo por Dominio
```javascript
const sumaEdades = hitos.reduce((sum, h) => sum + (h.edad_media_meses || 0), 0);
const edadDesarrollo = sumaEdades / hitos.length;
```

### Z-Score por Dominio
```javascript
const zScore = (edadDesarrollo - edadCronologica) / Math.max(edadCronologica * 0.15, 2);
```

Fórmula: `Z = (ED - EC) / σ`
Donde `σ ≈ 15% de EC` (mínimo 2 meses)

### Cociente de Desarrollo (CD)
```javascript
const cd = (edadDesarrollo / edadCronologica) * 100;
```

## Compatibilidad

### Formato Texto
- ✅ Copiable y pegable en historias clínicas electrónicas
- ✅ Formato ASCII compatible con cualquier sistema
- ✅ Gráfica visualizable en cualquier editor de texto
- ✅ Sin dependencias de fuentes especiales

### Formato PDF
- Mantiene todas las mejoras
- Incluye la gráfica ASCII renderizada
- Formato profesional para informes oficiales

## Ejemplo de Salida Completa

```
═══════════════════════════════════════════════════════════
INFORME DE EVALUACIÓN DEL NEURODESARROLLO
═══════════════════════════════════════════════════════════

Fecha de evaluación: 5 de noviembre de 2024
Sistema: Seguimiento del Neurodesarrollo Infantil v0.3.0
Institución: Neuropedia Lab

───────────────────────────────────────────────────────────
1. DATOS DEL PACIENTE
───────────────────────────────────────────────────────────

Nombre: Juan Pérez García
Fecha de nacimiento: 01/12/2022
Edad cronológica: 1 año 11 meses (23 meses)
Sexo: Masculino

───────────────────────────────────────────────────────────
2. RESUMEN EJECUTIVO
───────────────────────────────────────────────────────────

Edad Cronológica (EC): 23.0 meses
Edad de Desarrollo Global (ED): 22.1 meses
Diferencia (ED - EC): -0.9 meses
Puntuación Z Global: -0.26 DE
Cociente Desarrollo (CD): 96.1%

Interpretación Global: NORMAL (-1 a +1 DE) - Desarrollo dentro del rango esperado

───────────────────────────────────────────────────────────
3. PERFIL DE DESARROLLO POR DOMINIOS
───────────────────────────────────────────────────────────

GRÁFICA DE EDAD DE DESARROLLO POR DOMINIO
(Cada █ representa 0.5 meses)

Motor Grueso      │████████████████████████████████████████████████ 22.0m ≈ EC
Motor Fino        │███████████████████████████████████████ 18.0m -5.0m
Lenguaje Recep.   │████████████████████████████████████████████████████ 24.0m ≈ EC
Lenguaje Expr.    │███████████████████████████████████████████ 20.0m -3.0m
Social-Emocional  │██████████████████████████████████████████████████ 23.0m ≈ EC
Cognitivo         │██████████████████████████████████████████████████████ 25.0m +2.0m
Adaptativo        │██████████████████████████████████████████████ 21.0m -2.0m
                  │────────────────────────────────────────────────────────────
                  │┴              ┴              ┴              ┴    ↓         
                   0              7              14             21             28              (meses)

  EC (Edad Cronológica): 23.0 meses ↓
  ED (Edad de Desarrollo): Mostrada para cada dominio

DATOS DETALLADOS POR DOMINIO:

[... continúa con detalles ...]
```

## Archivos Modificados

- `src/components/GeneradorInforme.jsx`:
  - Añadida función `generarGraficaASCII()`
  - Añadida función `interpretarZScore()`
  - Reestructurado informe con nueva sección de resumen
  - Mejorado cálculo de datos por dominio
  - Ajustada numeración de secciones

## Archivo de Test Creado

- `test-grafica-ascii.js`:
  - Test independiente de la función de gráfica
  - Ejecutable con: `node test-grafica-ascii.js`
  - Valida que la visualización funciona correctamente

## Uso

1. Navegar a un niño con evaluaciones registradas
2. Hacer clic en el botón **"📄 Generar Informe"**
3. Seleccionar formato:
   - **Texto:** Para copiar/pegar en historia clínica
   - **PDF:** Para informe oficial imprimible
4. El informe incluirá automáticamente:
   - Todos los datos mínimos obligatorios
   - Gráfica ASCII del perfil
   - Análisis de asincronías
   - Interpretaciones clínicas

## Ventajas

1. **Datos completos:** Incluye todos los datos mínimos requeridos
2. **Visualización clara:** Gráfica ASCII fácil de interpretar
3. **Compatible:** Funciona en cualquier sistema (texto plano)
4. **Profesional:** Formato adecuado para documentación clínica
5. **Automático:** No requiere cálculos manuales
6. **Interpretativo:** Incluye interpretaciones clínicas automáticas

## Próximas Mejoras Sugeridas

1. **Gráfica de trayectorias en ASCII:** Visualizar evolución temporal
2. **Comparación con percentiles:** Añadir referencia a percentiles normativos
3. **Sugerencias de intervención:** Basadas en el perfil detectado
4. **Exportación a otros formatos:** Word, HTML, JSON
5. **Plantillas personalizables:** Permitir configurar secciones del informe
