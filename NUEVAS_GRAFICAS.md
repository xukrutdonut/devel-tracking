# Nuevas Gráficas de Análisis del Desarrollo

## Resumen de Cambios

Se han añadido tres nuevas gráficas al sistema de seguimiento del neurodesarrollo para proporcionar un análisis más completo y dinámico del progreso del niño:

### 1. Gráfica de Edad de Desarrollo vs Edad Cronológica ✅ (Ya existente)

Esta gráfica muestra la relación entre la edad de desarrollo (basada en hitos alcanzados) y la edad cronológica del niño. La línea diagonal de 45° representa el desarrollo típico.

**Interpretación:**
- Puntos sobre la línea: desarrollo adelantado
- Puntos sobre la línea: desarrollo típico
- Puntos bajo la línea: desarrollo más lento

### 2. Gráfica de Velocidad de Desarrollo 🆕

**¿Qué mide?**
La velocidad de desarrollo es la **primera derivada** de la edad de desarrollo respecto a la edad cronológica. Mide qué tan rápido progresa el desarrollo del niño.

**Fórmula:**
```
Velocidad = ΔEdad_Desarrollo / ΔEdad_Cronológica
```

**Interpretación:**
- **Velocidad = 1.0**: Desarrollo típico (por cada mes que pasa, avanza un mes en desarrollo)
- **Velocidad > 1.0**: Desarrollo acelerado (progresa más rápido que lo esperado)
- **Velocidad < 1.0**: Desarrollo más lento (progresa más lentamente que lo esperado)
- **Velocidad > 1.2**: Desarrollo significativamente acelerado 🚀
- **Velocidad 0.8-1.2**: Rango típico ✅
- **Velocidad < 0.8**: Desarrollo lento ⚠️

**Líneas de referencia:**
- Línea sólida en 1.0: desarrollo típico
- Líneas punteadas en 0.8 y 1.2: límites del rango normal

**Utilidad clínica:**
- Detecta períodos de progreso acelerado o estancamiento
- Identifica respuesta a intervenciones
- Ayuda a ajustar estrategias terapéuticas

### 3. Gráfica de Aceleración de Desarrollo 🆕

**¿Qué mide?**
La aceleración es la **segunda derivada** de la edad de desarrollo, o la primera derivada de la velocidad. Mide los **cambios en el ritmo de desarrollo**.

**Fórmula:**
```
Aceleración = ΔVelocidad / ΔEdad_Cronológica
```

**Interpretación:**
- **Aceleración > 0**: El desarrollo se está acelerando (mejorando) 📈
- **Aceleración ≈ 0**: Velocidad constante (ritmo estable) ➡️
- **Aceleración < 0**: El desarrollo se está desacelerando 📉

**Línea de referencia:**
- Línea en y=0: velocidad constante (sin cambios en el ritmo)

**Utilidad clínica:**
- Detecta cambios en la eficacia de intervenciones
- Identifica puntos de inflexión en el desarrollo
- Alerta sobre desaceleraciones que requieren atención
- Confirma aceleraciones tras iniciar terapias

### 4. Gráfica de Puntuaciones Z 🆕

**¿Qué mide?**
Las puntuaciones Z (z-scores) normalizan la diferencia entre la edad de desarrollo y la edad cronológica en unidades de desviación estándar, permitiendo comparar el desarrollo del niño con la población general.

**Fórmula:**
```
Z-Score = (Edad_Desarrollo - Edad_Cronológica) / Desviación_Estándar
```

**Nota:** Se utiliza una desviación estándar estimada del 15% de la edad cronológica, con un mínimo de 2 meses.

**Interpretación:**
- **Z > +2**: Muy por encima del promedio (+2 SD) ✅
- **Z entre +1 y +2**: Por encima del promedio (+1 SD) ✅
- **Z entre -1 y +1**: Dentro del rango normal (68% de la población) ✅
- **Z entre -1 y -2**: Por debajo del promedio (-1 SD) ⚠️
- **Z < -2**: Muy por debajo del promedio (-2 SD) ⚠️

**Líneas de referencia:**
- Verde sólida en Z=0: media poblacional
- Naranja punteada en Z=±1: límites del rango normal común (68%)
- Roja punteada en Z=±2: límites del rango de 95% de confianza

**Utilidad clínica:**
- Estandariza el desarrollo para comparaciones objetivas
- Facilita identificación de casos fuera del rango normal
- Permite seguimiento longitudinal normalizado
- Útil para comunicación con otros profesionales

## Implementación Técnica

### Archivos Modificados

- **`src/components/GraficoDesarrollo.jsx`**: Se añadieron los cálculos y componentes de visualización para las tres nuevas gráficas.

### Nuevas Funciones

1. **Cálculo de Velocidad:**
   ```javascript
   const datosVelocidad = datosGrafico.map((punto, idx) => {
     const deltaEdadDesarrollo = punto.edad_desarrollo_global - puntoAnterior.edad_desarrollo_global;
     const deltaEdadCronologica = punto.edad_cronologica - puntoAnterior.edad_cronologica;
     const velocidad = deltaEdadDesarrollo / deltaEdadCronologica;
     return { edad_cronologica, velocidad, velocidad_porcentaje: velocidad * 100 };
   });
   ```

2. **Cálculo de Aceleración:**
   ```javascript
   const datosAceleracion = datosVelocidad.map((punto, idx) => {
     const deltaVelocidad = punto.velocidad - puntoAnterior.velocidad;
     const deltaEdadCronologica = punto.edad_cronologica - puntoAnterior.edad_cronologica;
     const aceleracion = deltaVelocidad / deltaEdadCronologica;
     return { edad_cronologica, aceleracion };
   });
   ```

3. **Cálculo de Z-Scores:**
   ```javascript
   const datosZScore = datosGrafico.map(punto => {
     const diferencia = punto.edad_desarrollo_global - punto.edad_cronologica;
     const sd = Math.max(punto.edad_cronologica * 0.15, 2);
     const zscore = diferencia / sd;
     return { edad_cronologica, zscore, diferencia_meses: diferencia };
   });
   ```

### Tooltips Personalizados

Se crearon tooltips específicos para cada gráfica:
- `VelocityTooltip`: Muestra velocidad y porcentaje con interpretación
- `AccelerationTooltip`: Muestra aceleración con interpretación
- `ZScoreTooltip`: Muestra puntuación Z y diferencia en meses

### Funciones de Interpretación

Se añadieron funciones auxiliares para interpretación automática:
- `interpretarVelocidad(velocidad)`: Clasifica la velocidad de desarrollo
- `interpretarAceleracion(aceleracion)`: Interpreta cambios en velocidad
- `interpretarZScore(zscore)`: Evalúa la posición respecto a la norma

## Visualización

Todas las gráficas:
- Usan el mismo eje X (edad cronológica en meses)
- Incluyen tooltips informativos al pasar el ratón
- Tienen líneas de referencia para facilitar interpretación
- Muestran notas explicativas debajo de cada gráfica
- Se actualizan automáticamente con los datos del niño

## Beneficios Clínicos

1. **Análisis Dinámico**: Las derivadas (velocidad y aceleración) proporcionan información sobre cambios en el desarrollo que no son evidentes en la gráfica estática.

2. **Evaluación de Intervenciones**: Permite ver si las terapias están teniendo efecto mediante cambios en velocidad y aceleración.

3. **Detección Temprana**: La aceleración negativa puede alertar sobre problemas antes de que sean evidentes en la gráfica principal.

4. **Comparación Normalizada**: Los z-scores facilitan la comunicación entre profesionales y la identificación de casos atípicos.

5. **Seguimiento Longitudinal**: Las cuatro gráficas juntas proporcionan una visión completa y multidimensional del desarrollo.

## Próximos Pasos Sugeridos

1. **Validación Clínica**: Revisar con profesionales de neurodesarrollo la utilidad de estas métricas.

2. **Refinamiento de SD**: Ajustar la fórmula de desviación estándar basándose en datos reales de la población.

3. **Alertas Automáticas**: Implementar alertas cuando velocidad, aceleración o z-scores caen fuera de rangos esperados.

4. **Exportación de Reportes**: Añadir funcionalidad para exportar las gráficas en informes PDF.

5. **Comparación Multi-dominio**: Extender velocidad, aceleración y z-scores a dominios específicos.

## Notas Técnicas

- Las derivadas numéricas pueden ser sensibles al ruido en los datos. Considerar suavizado si hay muchas fluctuaciones.
- El primer punto de velocidad y los dos primeros de aceleración son nulos por definición.
- La estimación de desviación estándar (15% de edad) es conservadora y puede ajustarse según evidencia clínica.
- Las gráficas usan `connectNulls` para manejar datos faltantes elegantemente.

## Referencias

- Las derivadas numéricas se calculan usando diferencias finitas de primer orden.
- Los z-scores siguen la metodología estándar de estandarización estadística.
- La interpretación clínica se basa en rangos típicos del neurodesarrollo infantil.
