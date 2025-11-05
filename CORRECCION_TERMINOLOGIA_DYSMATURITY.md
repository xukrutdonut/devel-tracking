# Corrección Terminológica: DYSMATURITY

## Fecha
2024-12-19

## Objetivo
Corregir la traducción errónea del término técnico "dysmaturity" de "inmadurez" a "dismadurez" (desarrollo trastornado), que refleja mejor el concepto original.

## Justificación

### Término Original
**Dysmaturity** (inglés) - Thomas et al. (2009)

### Traducción Anterior (Incorrecta)
**Inmadurez** - Implica simplemente falta de maduración, lo cual no refleja el concepto completo.

### Traducción Corregida
**Dismadurez (desarrollo trastornado)** - Refleja mejor la alteración del proceso de desarrollo, no solo su retraso.

## Concepto

**DYSMATURITY** se refiere a un patrón de desarrollo donde:
- El inicio es **normal o típico**
- Posteriormente hay una **desaceleración o deterioro**
- Representa un **trastorno del desarrollo**, no simplemente inmadurez
- Es un patrón **regresivo** o de **desarrollo trastornado**

## Diferencia con otros patrones

1. **DELAY, IMMATURITY (Retraso - inicio retrasado)**: Trayectoria paralela con inicio retrasado
2. **DEVIANCE (Desviación de la media)**: Pendiente diferente desde el inicio
3. **DYSMATURITY (Dismadurez)**: Inicio normal → posterior alteración (desarrollo trastornado)
4. **DIFFERENCE (Diferencia)**: Patrón cualitativamente diferente

## Archivos Modificados

### Código Fuente
1. **src/components/ClasificacionTrayectorias.jsx**
   - Línea 29: Comentario descriptivo
   - Línea 332: Comentario de criterio
   - Línea 336: Descripción de clasificación
   - Línea 646: Etiqueta en UI

2. **src/utils/trayectoriasUtils.js**
   - Línea 372: Descripción de clasificación

### Documentación
3. **docs/BIBLIOGRAFIA_TRAYECTORIAS_DESARROLLO.md**
   - Línea 60: Definición del concepto

4. **docs/releases/RELEASE_v0.3.0.md**
   - Línea 48: Descripción en notas de versión

5. **docs/MEJORAS_ESTADISTICAS_AVANZADAS.md**
   - Línea 125: Lista de tipos de trayectoria

6. **CHANGELOG.md**
   - Línea 29: Descripción en changelog

## Cambios Específicos

### Antes
```
DYSMATURITY (Inmadurez)
```

### Después
```
DYSMATURITY (Dismadurez - desarrollo trastornado)
```

## Referencias

- **Thomas MS, et al. (2009)**. Using developmental trajectories to understand developmental disorders. *J Speech Lang Hear Res*. 52(2):336-58.
  - Describe "dysmaturity" como un patrón donde el desarrollo comienza de forma típica pero posteriormente se desvía o deteriora

- **Thomas MSC. (2016)**. Understanding Delay in Developmental Disorders. *Child Dev Perspect*. 10(2):73-80.
  - Profundiza en la distinción entre diferentes tipos de trayectorias atípicas

## Implicaciones Clínicas

El término "dismadurez" (desarrollo trastornado) es más apropiado porque:

1. **Refleja alteración activa del desarrollo**, no solo lentitud
2. **Sugiere procesos patológicos subyacentes** (regresión, neurodegeneración, etc.)
3. **Orienta la evaluación clínica** hacia causas de deterioro o regresión
4. **Es consistente con la literatura especializada** en neurodesarrollo

## Contextos de Uso

### Trastornos donde se observa DYSMATURITY:
- **Trastorno del Espectro Autista (TEA)**: Regresión en habilidades sociales/comunicativas
- **Trastornos neurodegenerativos**: Pérdida de habilidades previamente adquiridas
- **Epilepsia catastrófica infantil**: Deterioro cognitivo posterior a inicio típico
- **Trastornos metabólicos**: Desarrollo inicial normal con posterior deterioro

## Verificación

✅ Build exitoso sin errores
✅ Todas las instancias de "inmadurez" corregidas a "dismadurez"
✅ Terminología consistente en código y documentación
✅ Aclaración añadida: "desarrollo trastornado"

## Conclusión

La corrección terminológica mejora la precisión conceptual y alinea la herramienta con la terminología técnica correcta utilizada en la literatura especializada sobre trayectorias del desarrollo.
