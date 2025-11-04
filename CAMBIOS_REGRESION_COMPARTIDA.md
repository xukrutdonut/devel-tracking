# Compartir Línea de Regresión entre Gráficas de Trayectoria y Análisis Matemático

## Objetivo

Hacer que la gráfica de **Trayectoria del Desarrollo** en la pestaña "Análisis Matemático" muestre la misma línea de regresión calculada en **Gráficas de Trayectoria**.

## Implementación

### 1. Estado Compartido en App.jsx

Se añadió un estado para compartir datos entre componentes:

```javascript
const [datosRegresion, setDatosRegresion] = useState(null);
```

### 2. Callback en GraficoDesarrollo

**Archivo:** `/src/components/GraficoDesarrollo.jsx`

Se añadió una prop `onDatosRegresionCalculados` para enviar los datos calculados al padre:

```javascript
function GraficoDesarrollo({ ninoId, onDatosRegresionCalculados }) {
  // ...
  
  // Enviar datos de regresión al componente padre
  useEffect(() => {
    if (onDatosRegresionCalculados && regresionDesarrollo && lineaTendenciaDesarrollo) {
      onDatosRegresionCalculados({
        regresion: regresionDesarrollo,
        lineaTendencia: lineaTendenciaDesarrollo,
        datosOriginales: datosParaTendencia,
        dominioSeleccionado: dominioSeleccionado,
        fuenteSeleccionada: fuenteSeleccionada
      });
    }
  }, [regresionDesarrollo, lineaTendenciaDesarrollo, dominioSeleccionado, fuenteSeleccionada]);
}
```

**Datos compartidos:**
- `regresion`: Objeto con coeficientes del polinomio de regresión
- `lineaTendencia`: Array de puntos calculados de la línea de tendencia
- `datosOriginales`: Datos de hitos usados para calcular la regresión
- `dominioSeleccionado`: Dominio actualmente seleccionado
- `fuenteSeleccionada`: Fuente normativa seleccionada

### 3. Props en App.jsx

Se modificaron las llamadas a los componentes para pasar los datos:

```javascript
{vistaActual === 'grafico' && ninoSeleccionado && (
  <GraficoDesarrollo 
    ninoId={ninoSeleccionado.id} 
    onDatosRegresionCalculados={setDatosRegresion}
  />
)}

{vistaActual === 'aceleracion' && ninoSeleccionado && (
  <AnalisisAceleracion 
    ninoId={ninoSeleccionado.id} 
    datosRegresionGraficoDesarrollo={datosRegresion}
  />
)}
```

### 4. Uso en AnalisisAceleracion

**Archivo:** `/src/components/AnalisisAceleracion.jsx`

Se reciben los datos de regresión y se añade una nueva línea en la gráfica:

```javascript
export default function AnalisisAceleracion({ ninoId, datosRegresionGraficoDesarrollo }) {
  // ...
  
  {/* Línea de regresión desde GraficoDesarrollo */}
  {datosRegresionGraficoDesarrollo && datosRegresionGraficoDesarrollo.lineaTendencia && (
    <Line 
      data={datosRegresionGraficoDesarrollo.lineaTendencia}
      type="monotone" 
      dataKey="edad_desarrollo" 
      stroke="#e67e22" 
      strokeWidth={3}
      name="Tendencia de Trayectoria" 
      dot={false}
      strokeDasharray="4 4"
    />
  )}
}
```

## Flujo de Datos

```
┌─────────────────────┐
│   App.jsx           │
│                     │
│ [datosRegresion]    │
│   state             │
└──────┬─────┬────────┘
       │     │
       │     │ props
       ▼     ▼
┌──────────────┐    ┌──────────────────────┐
│GraficoDesarr │    │AnalisisAceleracion   │
│              │    │                      │
│ Calcula      │    │ Recibe:              │
│ regresión ──────► │ datosRegresionGraf.. │
│              │    │                      │
│ callback:    │    │ Renderiza línea      │
│ onDatosRegr..│    │ de tendencia         │
└──────────────┘    └──────────────────────┘
```

## Visualización en la Gráfica

La gráfica de **Trayectoria del Desarrollo** ahora muestra:

1. **Línea gris discontinua (5 5):** Desarrollo Típico (ED = EC)
2. **Línea naranja discontinua (4 4):** Tendencia de Trayectoria (desde Gráficas de Trayectoria)
3. **Línea azul sólida:** Edad de Desarrollo del Niño (puntos conectados)

### Leyenda:
- 🟢 **Desarrollo Típico (ED=EC)** - Gris, discontinua
- 🟠 **Tendencia de Trayectoria** - Naranja, discontinua (NUEVA)
- 🔵 **Edad de Desarrollo del Niño** - Azul, sólida con puntos

## Ventajas

✅ **Consistencia:** Misma línea de tendencia en ambas pestañas
✅ **Comparación:** Fácil ver cómo la trayectoria real se relaciona con la tendencia
✅ **Sin duplicación:** Cálculo de regresión se hace una sola vez
✅ **Sincronización:** Si cambia dominio/fuente en Gráficas, se actualiza en Análisis

## Notas Técnicas

### Sincronización
- Los datos se actualizan cuando el usuario navega a "Gráficas de Trayectoria"
- Si el usuario va directamente a "Análisis Matemático" sin pasar por "Gráficas", la línea naranja NO aparece (es normal)
- Para ver la línea, el usuario debe visitar primero "Gráficas de Trayectoria"

### Compatibilidad
- Si `datosRegresionGraficoDesarrollo` es `null`, la línea simplemente no se renderiza
- No hay errores si los datos no están disponibles
- La gráfica funciona correctamente con o sin la línea de tendencia

### Colores
- **Naranja (#e67e22):** Color distintivo para la tendencia compartida
- **Discontinua (4 4):** Diferente de la línea de desarrollo típico (5 5)

## Mejoras Futuras Posibles

1. **Precalcular datos:** Calcular regresión al cargar el niño, no al visitar pestaña
2. **Persistencia:** Guardar datos de regresión en contexto global
3. **Indicador visual:** Mostrar mensaje si datos no están disponibles
4. **Configuración:** Permitir ocultar/mostrar la línea de tendencia
5. **Múltiples tendencias:** Mostrar tendencias por dominio también

## Testing

### Casos de prueba:

1. **Flujo normal:**
   - Seleccionar un niño
   - Ir a "Gráficas de Trayectoria"
   - Cambiar a "Análisis Matemático"
   - ✓ La línea naranja debe aparecer

2. **Sin visitar Gráficas primero:**
   - Seleccionar un niño
   - Ir directamente a "Análisis Matemático"
   - ✓ Solo líneas gris (típico) y azul (niño) deben aparecer

3. **Cambio de dominio:**
   - Ir a "Gráficas de Trayectoria"
   - Cambiar dominio seleccionado
   - Ir a "Análisis Matemático"
   - ✓ La línea naranja debe reflejar el dominio seleccionado

4. **Cambio de fuente normativa:**
   - Ir a "Gráficas de Trayectoria"
   - Cambiar fuente normativa
   - Ir a "Análisis Matemático"
   - ✓ La línea naranja debe actualizarse

5. **Cambio de niño:**
   - Ver un niño en ambas pestañas
   - Cambiar a otro niño
   - ✓ Los datos deben actualizarse correctamente

## Archivos Modificados

- `/src/App.jsx`
  - Añadido estado `datosRegresion`
  - Modificadas props de `GraficoDesarrollo` y `AnalisisAceleracion`

- `/src/components/GraficoDesarrollo.jsx`
  - Añadida prop `onDatosRegresionCalculados`
  - Añadido `useEffect` para enviar datos de regresión

- `/src/components/AnalisisAceleracion.jsx`
  - Añadida prop `datosRegresionGraficoDesarrollo`
  - Añadida línea de tendencia naranja en gráfica
  - Añadido texto explicativo

## Documentación de Referencia

La regresión se calcula usando:
- **Método:** Regresión polinomial de grado variable (1-3)
- **Función:** `calcularRegresionPolinomial` en `GraficoDesarrollo.jsx`
- **Suavizado:** `generarLineaTendenciaSuave` genera puntos interpolados

Ver comentarios en el código fuente para más detalles sobre el algoritmo de regresión.
