# Resumen Ejecutivo: Línea de Tendencia con Exclusión Biológica

## Cambio Implementado
La línea de tendencia de la gráfica de desarrollo ahora incluye los puntos de pérdida en su cálculo, pero **excluye adquisiciones posteriores a la primera pérdida** por no ser biológicamente plausibles durante una regresión activa.

## ¿Por qué este cambio?

### Observación Clínica Clave
Durante una regresión del desarrollo (TEA, Síndrome de Rett, epilepsia catastrófica), el niño **pierde** habilidades previamente adquiridas. En este período de regresión activa, **no es normal** adquirir nuevos hitos del desarrollo.

### Problema Anterior
- La línea de tendencia no reflejaba las pérdidas (solo mostraba promedios)
- No había filtrado de puntos biológicamente implausibles
- Datos atípicos contaminaban la interpretación de la regresión

### Solución Actual
1. **Incluir pérdidas en la tendencia** → la línea desciende correctamente
2. **Excluir adquisiciones post-pérdida** → evita contaminación de datos
3. **Alertar al clínico** → señala inconsistencias para revisión

## Comportamiento del Sistema

### Caso Normal (sin pérdidas)
```
Hitos: 12m ● → 15m ● → 18m ● → 21m ●
Tendencia: Incluye todos los puntos
Resultado: Línea ascendente normal
```

### Caso con Regresión (sin recuperación)
```
Hitos: 12m ● → 15m ● → 18m ● → 20m × (pérdida)
Tendencia: Incluye 12, 15, 18 + pérdida en 20
Resultado: Línea desciende después de 18m
Alerta: ⚠️ "Regresión detectada"
```

### Caso con Regresión + Adquisición Posterior (inusual)
```
Hitos: 12m ● → 15m ● → 18m × (pérdida) → 22m ● (nueva adquisición)

Visualización:
  - TODOS los puntos se muestran en gráfica (incluido 22m)
  
Línea de Tendencia:
  - USA: 12m, 15m, 18m (pérdida) 
  - EXCLUYE: 22m (no biológicamente plausible)
  - La línea desciende correctamente

Alertas:
  ⚠️ "Regresión detectada"
  ℹ️ "Se registraron hitos después de pérdida (18.0m)"
     "Excluidos de tendencia - no biológicamente plausible"
     "Si es recuperación, considere período separado"
```

## Interpretación Clínica

### ¿Qué significa la alerta de adquisiciones post-pérdida?

Puede indicar:

1. **Error de Registro**
   - Fechas incorrectas
   - Hito mal clasificado
   - → Acción: Revisar y corregir registros

2. **Recuperación Posterior**
   - Respuesta a intervención
   - Estabilización post-regresión
   - → Acción: Analizar como fase separada del desarrollo

3. **Evaluación Incorrecta**
   - Hito no realmente perdido
   - Observación temporal vs pérdida permanente
   - → Acción: Reevaluar criterios de pérdida

## Ventajas del Sistema

### Para el Clínico
- ✅ Detecta automáticamente patrones atípicos
- ✅ Alerta sobre inconsistencias en datos
- ✅ Permite identificar errores de registro
- ✅ Distingue regresión de recuperación

### Para el Diagnóstico
- ✅ Compatible con criterios DSM-5 (regresión en TEA)
- ✅ Refleja patrones biológicos esperados
- ✅ Facilita documentación precisa
- ✅ Mejora comunicación entre especialistas

### Para la Investigación
- ✅ Datos más limpios y precisos
- ✅ Trayectorias biológicamente plausibles
- ✅ Identificación de casos excepcionales
- ✅ Base para análisis longitudinal

## Ejemplos Clínicos Reales

### Ejemplo 1: TEA con Regresión Típica
**Caso:** Niño de 24 meses, regresión de lenguaje a los 18 meses

```
Trayectoria:
- 12m: primeras palabras ●
- 15m: 10 palabras ●
- 18m: pérdida de lenguaje ×
- 21m: sin nuevas palabras (esperado)
- 24m: evaluación actual

Tendencia: Asciende hasta 18m, luego desciende
Interpretación: ✅ Patrón consistente con TEA con regresión
```

### Ejemplo 2: Síndrome de Rett
**Caso:** Niña de 18 meses, inicio de regresión a los 12 meses

```
Trayectoria:
- 6m: prensión normal ●
- 9m: pinza fina ●
- 12m: pérdida de uso intencional de manos ×
- 15m: estereotipias (sin nuevas adquisiciones)
- 18m: evaluación actual

Tendencia: Desciende a partir de 12m
Interpretación: ✅ Patrón consistente con Rett
```

### Ejemplo 3: Caso con Datos Sospechosos
**Caso:** Registro muestra adquisiciones durante regresión

```
Trayectoria:
- 15m: hitos normales ●
- 18m: pérdida de lenguaje ×
- 21m: ¿nuevo hito registrado? ● ← inusual

Sistema: ⚠️ ALERTA
- Punto 21m se muestra pero no afecta tendencia
- Requiere revisión clínica
- Posibles acciones:
  1. Corregir fecha del hito
  2. Reclasificar como recuperación
  3. Confirmar que no es error de evaluación
```

## Impacto en Otras Gráficas

### Gráfica de Velocidad
- Calcula desde línea de tendencia filtrada
- Muestra velocidad negativa durante regresión
- No contaminada por puntos post-pérdida

### Gráfica de Aceleración
- Cambios en velocidad de tendencia filtrada
- Detecta inicio brusco de regresión
- Ignora artefactos de datos atípicos

### Gráfica de Z-Score
- Sin cambios (ya excluía pérdidas por diseño previo)
- Compara solo con datos normativos de adquisición

## Configuración y Uso

### No Requiere Configuración
- Se activa automáticamente al detectar pérdidas
- Funciona con datos existentes sin migración
- Compatible con todos los modos de visualización

### Para Registrar Datos Correctamente

**Regresión:**
1. Marcar fecha de adquisición original
2. Marcar fecha de pérdida cuando ocurra
3. NO registrar nuevos hitos durante período de regresión activa

**Recuperación (si ocurre):**
1. Considerar como fase separada del desarrollo
2. Documentar fecha de inicio de recuperación
3. Analizar independiente de la fase de regresión

## Referencias y Fundamento

### Criterios Diagnósticos
- **DSM-5:** Regresión en TEA (pérdida de habilidades entre 18-24 meses)
- **Rett:** Fase II de regresión rápida (pérdida de habilidades manuales y lenguaje)
- **Epilepsia:** Landau-Kleffner, West (regresión cognitiva/lenguaje)

### Literatura Científica
- Hansen et al. (2008) - Timing y características de regresión en TEA
- Charman et al. (2005) - Patrones de pérdida de habilidades
- Landa et al. (2007) - Trayectorias de desarrollo en TEA

## Resumen Técnico

### Cambios en Código
- Archivo: `src/components/GraficoDesarrollo.jsx`
- Líneas modificadas: ~40 líneas
- Complejidad: Baja (filtrado simple)
- Rendimiento: Sin impacto (mismo algoritmo de regresión)

### Testing
- ✅ Compila sin errores
- ✅ Compatible con datos existentes
- ✅ Retrocompatible (casos sin pérdida funcionan igual)
- ⏳ Pendiente: Pruebas con datos reales de pacientes

## Conclusión

Este cambio mejora significativamente la **precisión clínica** del sistema al:
1. Reflejar correctamente las regresiones del desarrollo
2. Filtrar datos biológicamente implausibles
3. Alertar sobre inconsistencias para revisión
4. Mantener la compatibilidad con casos normales

El resultado es una herramienta más confiable para el diagnóstico y seguimiento de trastornos del neurodesarrollo.
