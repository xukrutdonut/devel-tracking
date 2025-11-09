# Fix: Todas las gráficas ahora aparecen en el PDF

## Problema
Las gráficas de velocidad, aceleración, desarrollo y z-score no se incluían correctamente en el informe PDF generado. Solo aparecían parcialmente o estaban ausentes.

## Causa Raíz
El componente `GeneradorInforme.jsx` buscaba las gráficas usando el selector genérico `.recharts-wrapper`, que:
1. Capturaba solo las primeras 2 gráficas encontradas en el DOM
2. No tenía forma de identificar específicamente cada tipo de gráfica
3. Las gráficas del componente `AnalisisAceleracion` quedaban excluidas
4. No había control sobre el orden de las gráficas en el PDF

## Solución Implementada

### 1. Identificadores únicos en GraficoDesarrollo.jsx
Se agregaron IDs específicos a las gráficas principales:

```jsx
// Gráfica de desarrollo principal (línea ~1473)
<div className="chart-container" id="grafica-desarrollo-principal">
  <h3>Edad de Desarrollo vs Edad Cronológica</h3>
  <ResponsiveContainer width="100%" height={500}>
    <ComposedChart data={datosGrafico}>
    ...
    </ComposedChart>
  </ResponsiveContainer>
</div>

// Gráfica de Z-Score (línea ~1780)
<div className="chart-container" id="grafica-zscore">
  <h3>Puntuaciones Z (Desviaciones Estándar)</h3>
  <ResponsiveContainer width="100%" height={400}>
    <ComposedChart data={datosZScore}>
    ...
    </ComposedChart>
  </ResponsiveContainer>
</div>
```

### 2. Identificadores únicos en AnalisisAceleracion.jsx
Se agregaron IDs específicos a los contenedores de las gráficas:

```jsx
// Gráfica de velocidad (línea 734)
<div id="grafica-velocidad-desarrollo">
  <ResponsiveContainer width="100%" height={350}>
    <ComposedChart data={datosVelocidad}>
    ...
    </ComposedChart>
  </ResponsiveContainer>
</div>

// Gráfica de aceleración (línea 841)
<div id="grafica-aceleracion-desarrollo">
  <ResponsiveContainer width="100%" height={350}>
    <ComposedChart data={datosAceleracion}>
    ...
    </ComposedChart>
  </ResponsiveContainer>
</div>
```

### 3. Captura específica en GeneradorInforme.jsx
Se modificó la función `generarPDF()` para buscar específicamente las 4 gráficas principales por ID en el orden correcto:

```jsx
// Buscar gráficas específicas por ID en orden (línea ~789)
const graficosParaCapturar = [
  { id: 'grafica-desarrollo-principal', titulo: 'Edad de Desarrollo vs Edad Cronológica' },
  { id: 'grafica-zscore', titulo: 'Puntuaciones Z (Desviaciones Estándar)' },
  { id: 'grafica-velocidad-desarrollo', titulo: 'Velocidad del Desarrollo' },
  { id: 'grafica-aceleracion-desarrollo', titulo: 'Aceleración del Desarrollo' }
];

// Capturar cada gráfica con html2canvas
for (const grafico of graficosParaCapturar) {
  const elemento = document.getElementById(grafico.id);
  if (elemento) {
    // Capturar y agregar al PDF con título apropiado en páginas separadas
  }
}
```

### 4. Fallback para compatibilidad
Si no se encuentran las gráficas específicas, el código mantiene el comportamiento anterior de buscar `.recharts-wrapper` como respaldo (ahora buscando hasta 4 gráficas).

## Beneficios
- ✅ Las gráficas de velocidad y aceleración ahora se incluyen correctamente en el PDF
- ✅ Cada gráfica se captura en una página nueva del PDF con su título correspondiente
- ✅ Mayor calidad de imagen con `scale: 2` en html2canvas
- ✅ Manejo robusto de errores si alguna gráfica no está disponible
- ✅ Compatible con el comportamiento anterior (fallback)

## Archivos Modificados
1. `/src/components/AnalisisAceleracion.jsx`
   - Línea 734: Agregado `<div id="grafica-velocidad-desarrollo">`
   - Línea 841: Agregado `<div id="grafica-aceleracion-desarrollo">`

2. `/src/components/GeneradorInforme.jsx`
   - Líneas 788-860: Nueva lógica de captura específica de gráficas

## Pruebas Recomendadas
1. Generar un informe PDF con un niño que tenga múltiples hitos registrados
2. Verificar que aparezcan las secciones:
   - "GRÁFICOS DE VELOCIDAD Y ACELERACIÓN"
   - "Velocidad del Desarrollo"
   - "Aceleración del Desarrollo"
3. Confirmar que las imágenes se vean con buena calidad y legibles

## Referencias
- Componente: `src/components/AnalisisAceleracion.jsx`
- Componente: `src/components/GeneradorInforme.jsx`
- Librería: html2canvas para captura de elementos DOM
- Librería: jsPDF para generación de PDF
