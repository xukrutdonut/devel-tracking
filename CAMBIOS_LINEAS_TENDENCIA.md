# Cambios: Líneas de Tendencia y Puntuación Z

## Resumen de Cambios

Se han implementado dos mejoras importantes en las gráficas de desarrollo:

1. **Líneas de tendencia por regresión lineal** en las 4 gráficas
2. **Puntuación Z** añadida a las estadísticas principales

---

## 1. Líneas de Tendencia (Regresión Lineal)

### Cambio Realizado

**ANTES:** Las gráficas unían todos los puntos con líneas continuas, conectando cada hito con el siguiente.

**AHORA:** Las gráficas muestran:
- **Puntos dispersos** (scatter) representando cada medición/hito
- **Línea de tendencia punteada** calculada mediante regresión lineal que muestra la dirección general del desarrollo

### Implementación Técnica

Se añadieron dos funciones auxiliares:

```javascript
// Calcula la regresión lineal (pendiente e intercepto)
const calcularRegresionLineal = (puntos, keyX, keyY) => {
  const n = datos.length;
  const sumX = Σx;
  const sumY = Σy;
  const sumXY = Σxy;
  const sumX2 = Σx²;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

// Genera puntos de la línea de tendencia
const generarLineaTendencia = (puntos, keyX, keyY, regresion) => {
  const xMin = min(x);
  const xMax = max(x);
  
  return [
    { x: xMin, y: slope * xMin + intercept },
    { x: xMax, y: slope * xMax + intercept }
  ];
};
```

### Gráficas Actualizadas

#### Gráfica 1: Edad de Desarrollo vs Edad Cronológica
- **Puntos negros/color:** Hitos evaluados
- **Línea roja punteada:** Tendencia del desarrollo global
- **Línea gris diagonal:** Desarrollo típico (45°)

#### Gráfica 2: Velocidad de Desarrollo
- **Puntos naranjas:** Velocidad en cada momento
- **Línea roja oscura punteada:** Tendencia de la velocidad
- **Línea gris en 1.0:** Desarrollo típico

#### Gráfica 3: Aceleración de Desarrollo
- **Puntos morados:** Aceleración en cada momento
- **Línea morado oscuro punteada:** Tendencia de la aceleración
- **Línea gris en 0:** Sin cambio en velocidad

#### Gráfica 4: Puntuaciones Z
- **Puntos azules:** Z-score en cada momento
- **Línea azul oscuro punteada:** Tendencia del Z-score
- **Líneas de referencia:** -2, -1, 0, +1, +2 SD

### Ventajas de las Líneas de Tendencia

1. **Claridad visual:** Más fácil ver la dirección general sin el ruido de variaciones puntuales
2. **Predicción:** La tendencia ayuda a anticipar la evolución futura
3. **Evaluación de intervenciones:** Cambios en la pendiente indican efectividad
4. **Comparación:** Más fácil comparar entre diferentes evaluaciones
5. **Interpretación estadística:** Base matemática sólida (regresión lineal)

### Componentes Recharts Utilizados

Se cambió de `LineChart` a `ComposedChart` para combinar:
- `<Scatter>`: Puntos dispersos
- `<Line>`: Líneas de tendencia

```jsx
<ComposedChart data={datos}>
  <Scatter 
    data={datos.filter(d => d.valor != null)}
    fill="#color"
    name="Puntos"
    shape="circle"
    r={5}
  />
  <Line 
    data={lineaTendencia}
    type="monotone" 
    dataKey="valor"
    stroke="#color-oscuro"
    strokeWidth={3}
    dot={false}
    name="Tendencia"
    strokeDasharray="5 5"
  />
</ComposedChart>
```

---

## 2. Puntuación Z en Estadísticas

### Cambio Realizado

**ANTES:** Las estadísticas mostraban:
- Edad Cronológica
- Edad de Desarrollo Global
- Diferencia (meses)
- Total de hitos evaluados

**AHORA:** Las estadísticas muestran:
- Edad Cronológica
- Edad de Desarrollo Global
- Diferencia (meses)
- **Puntuación Z** ⭐ NUEVO

### Cálculo del Z-Score Actual

```javascript
const zScoreActual = datosZScore.length > 0 && 
                     datosZScore[datosZScore.length - 1].zscore !== null
  ? datosZScore[datosZScore.length - 1].zscore
  : null;
```

Se toma el último valor de Z-score calculado (la medición más reciente).

### Visualización en Tarjeta Estadística

```jsx
<div className="stat-card">
  <h3>Puntuación Z</h3>
  <span className={`big-number ${
    zScoreActual === null ? 'sin-datos' :
    zScoreActual < -2 ? 'retraso' :
    zScoreActual > 2 ? 'adelanto' : 'normal'
  }`}>
    {zScoreActual !== null ? zScoreActual.toFixed(2) : 'N/A'}
  </span>
  <p>{zScoreActual !== null ? 'desviaciones estándar' : 'Sin datos'}</p>
</div>
```

### Colores según Z-Score

- **Verde (normal):** -2 < Z < +2
- **Rojo (retraso):** Z < -2
- **Azul (adelanto):** Z > +2

### Interpretación del Z-Score

| Z-Score | Interpretación | Acción |
|---------|----------------|--------|
| > +2 | Muy por encima del promedio | Desarrollo avanzado |
| +1 a +2 | Por encima del promedio | Desarrollo típico-alto |
| -1 a +1 | Rango normal | Desarrollo típico |
| -1 a -2 | Por debajo del promedio | Vigilar |
| < -2 | Muy por debajo del promedio | Evaluación especializada |

### Ventajas de Mostrar Z-Score

1. **Estandarización:** Comparable independientemente de la edad
2. **Interpretación universal:** Lenguaje común entre profesionales
3. **Detección rápida:** Un vistazo indica si requiere atención
4. **Base estadística:** Contexto poblacional claro
5. **Documentación:** Facilita reportes y seguimiento longitudinal

---

## Cambios en el Código

### Archivo Modificado
`src/components/GraficoDesarrollo.jsx`

### Líneas Añadidas/Modificadas

1. **Importaciones (línea 2):**
   - Añadido `ComposedChart` a las importaciones de Recharts

2. **Funciones auxiliares (líneas 62-92):**
   - `calcularRegresionLineal()`: Calcula pendiente e intercepto
   - `generarLineaTendencia()`: Genera puntos de la línea de tendencia

3. **Cálculo de regresiones (líneas 253-280):**
   - `regresionDesarrollo` y `lineaTendenciaDesarrollo`
   - `regresionVelocidad` y `lineaTendenciaVelocidad`
   - `regresionAceleracion` y `lineaTendenciaAceleracion`
   - `regresionZScore` y `lineaTendenciaZScore`
   - `zScoreActual`: Último valor de Z-score

4. **Estadísticas (líneas 556-563):**
   - Reemplazada tarjeta "Total de hitos" por "Puntuación Z"
   - Colores condicionales según valor de Z

5. **Gráficas (4 secciones):**
   - Cambio de `LineChart` a `ComposedChart`
   - Añadido `<Scatter>` para puntos
   - Añadido `<Line>` para tendencia (cuando existe regresión)
   - Actualizada nota interpretativa

---

## Validación y Pruebas

### Estado Actual
✅ Código compilando sin errores
✅ Frontend reiniciado correctamente
✅ Vite v7.1.12 listo

### Para Validar en Navegador

1. **Acceder a:** http://localhost:3000
2. **Seleccionar un niño** con múltiples hitos registrados
3. **Navegar a:** 📈 Gráficas

### Qué Verificar

**Estadísticas:**
- [ ] Aparece tarjeta "Puntuación Z"
- [ ] Muestra valor numérico con 2 decimales
- [ ] Color apropiado según valor
- [ ] Ya no aparece "Total de hitos"

**Gráfica 1 - Desarrollo:**
- [ ] Se ven puntos dispersos (círculos negros)
- [ ] Aparece línea de tendencia roja punteada
- [ ] Línea de 45° visible

**Gráfica 2 - Velocidad:**
- [ ] Puntos naranjas dispersos
- [ ] Línea de tendencia roja oscura punteada
- [ ] Línea de referencia en 1.0

**Gráfica 3 - Aceleración:**
- [ ] Puntos morados dispersos
- [ ] Línea de tendencia morado oscuro punteada
- [ ] Línea de referencia en 0

**Gráfica 4 - Z-Scores:**
- [ ] Puntos azules dispersos
- [ ] Línea de tendencia azul oscuro punteada
- [ ] 5 líneas de referencia (-2, -1, 0, +1, +2)

**Tooltips:**
- [ ] Al pasar mouse sobre puntos, aparece información
- [ ] Información clara y formateada

---

## Notas Técnicas

### Regresión Lineal - Fórmula

Para una línea `y = mx + b`:

```
m (pendiente) = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
b (intercepto) = (Σy - m·Σx) / n
```

Donde:
- `n` = número de puntos
- `Σxy` = suma de productos x·y
- `Σx` = suma de x
- `Σy` = suma de y
- `Σx²` = suma de x²

### Manejo de Datos Nulos

Las funciones filtran datos nulos antes de calcular:
```javascript
datos.filter(d => d.valor != null)
```

Esto evita errores y asegura cálculos precisos.

### Requisitos Mínimos

- **Tendencia de desarrollo:** Mínimo 2 puntos
- **Tendencia de velocidad:** Mínimo 2 puntos con velocidad válida
- **Tendencia de aceleración:** Mínimo 2 puntos con aceleración válida
- **Tendencia de Z-score:** Mínimo 2 puntos con Z-score válido

Si no hay suficientes puntos, no se muestra la línea de tendencia pero sí los puntos individuales.

---

## Interpretación Clínica

### Uso de las Tendencias

**Pregunta:** ¿El desarrollo mejora o empeora?
→ **Respuesta:** Observa la pendiente de la línea de tendencia en la gráfica de desarrollo

**Pregunta:** ¿La velocidad es constante?
→ **Respuesta:** Mira la tendencia de velocidad (horizontal = constante)

**Pregunta:** ¿Hay cambios recientes?
→ **Respuesta:** Compara últimos puntos con la tendencia general

**Pregunta:** ¿Está en rango normal?
→ **Respuesta:** Revisa la Puntuación Z en las estadísticas

### Combinación de Métricas

Para evaluación completa, considera:
1. **Posición actual:** Puntuación Z
2. **Tendencia histórica:** Línea de regresión
3. **Variabilidad:** Dispersión de puntos respecto a tendencia
4. **Dirección:** Pendiente positiva/negativa/plana

---

## Próximas Mejoras Sugeridas

1. **Intervalo de confianza:** Añadir bandas de confianza alrededor de la tendencia
2. **R²:** Mostrar coeficiente de determinación (calidad del ajuste)
3. **Predicción:** Extender línea de tendencia al futuro
4. **Alertas:** Notificar si tendencia es negativa sostenida
5. **Comparación:** Superponer tendencias de diferentes períodos
6. **Exportar datos:** Descargar tabla con valores y tendencias

---

## Referencias

- **Regresión lineal:** Método de mínimos cuadrados ordinarios
- **Z-scores:** Estandarización estadística clásica
- **Recharts:** ComposedChart para gráficas mixtas
- **React:** Hooks para gestión de estado

---

## Contacto y Soporte

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **Logs:** `docker logs neurodesarrollo-frontend --tail 50`
