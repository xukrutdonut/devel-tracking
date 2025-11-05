# Fusión de Pestañas: Gráficas de Trayectoria + Análisis Matemático

## Fecha
5 de noviembre de 2024

## Resumen del Cambio

Las pestañas **"📈 Gráficas de Trayectoria"** y **"📐 Análisis Matemático"** se han fusionado en una única pestaña llamada **"📊 Gráficas"** con dos vistas seleccionables mediante botones internos.

## Razón del Cambio

Ambas pestañas mostraban diferentes visualizaciones de los mismos datos:
- **Trayectorias:** Gráficas ED vs EC, Z-scores, scatter plots
- **Análisis Matemático:** Velocidad, aceleración, derivadas

**Beneficio de la fusión:** Todas las visualizaciones gráficas ahora están en un solo lugar, reduciendo la navegación entre pestañas y manteniendo el contexto.

## Implementación

### 1. Nuevo Selector de Vista en GraficoDesarrollo

Se añadió un selector con dos botones en la parte superior:

```jsx
<div style={{ marginBottom: '20px', padding: '10px', ... }}>
  <button onClick={() => setVistaGrafica('trayectoria')}>
    📈 Trayectorias del Desarrollo
  </button>
  <button onClick={() => setVistaGrafica('matematico')}>
    📐 Análisis Matemático
  </button>
</div>
```

**Estado inicial:** 'trayectoria'

### 2. Renderizado Condicional

```jsx
{vistaGrafica === 'trayectoria' ? (
  <>
    {/* Gráficas de trayectoria (contenido original) */}
    {/* - Selector de dominio */}
    {/* - Gráfica ED vs EC */}
    {/* - Gráfica Z-scores */}
    {/* - Scatter plot */}
    {/* - etc. */}
  </>
) : (
  <>
    {/* Análisis Matemático */}
    <AnalisisAceleracion 
      ninoId={ninoId} 
      datosRegresionGraficoDesarrollo={datosRegresionRef.current}
    />
  </>
)}
```

### 3. Cambios en la Navegación (App.jsx)

**Antes:**
```
[ninoSeleccionado]
├── ✅ Hitos del Desarrollo
├── 🚩 Señales de Alarma
├── 📈 Gráficas de Trayectoria
└── 📐 Análisis Matemático
```

**Ahora:**
```
[ninoSeleccionado]
├── ✅ Hitos del Desarrollo
├── 🚩 Señales de Alarma
└── 📊 Gráficas (con selector interno)
    ├── 📈 Trayectorias del Desarrollo
    └── 📐 Análisis Matemático
```

## Archivos Modificados

### 1. `src/components/GraficoDesarrollo.jsx`

**Cambios:**
- Añadido estado: `const [vistaGrafica, setVistaGrafica] = useState('trayectoria')`
- Importado: `import AnalisisAceleracion from './AnalisisAceleracion'`
- Añadido selector de vista con botones
- Renderizado condicional del contenido
- Título cambiado: "Gráfico de Edad de Desarrollo" → "Gráficas del Desarrollo"

### 2. `src/App.jsx`

**Cambios:**
- Eliminado import: `import AnalisisAceleracion from './components/AnalisisAceleracion'`
- Eliminado botón: "📐 Análisis Matemático"
- Actualizado botón: "📈 Gráficas de Trayectoria" → "📊 Gráficas"
- Eliminado bloque de renderizado de AnalisisAceleracion standalone
- Actualizado comentario vistaActual (eliminada 'aceleracion')

### 3. Sin Cambios: `src/components/AnalisisAceleracion.jsx`

El componente permanece intacto, ahora se renderiza dentro de GraficoDesarrollo.

## Estructura de la Vista Fusionada

### Vista "Trayectorias del Desarrollo" (por defecto)

Contenido original del GraficoDesarrollo:
- Selector de visualización (Global, Motor Grueso, etc.)
- Selector de fuente normativa
- **Gráfica 1:** Edad de Desarrollo vs Edad Cronológica
  - Líneas de percentiles
  - Línea 45° de referencia
  - Puntos del niño
- **Gráfica 2:** Puntuaciones Z por edad
- **Gráfica 3:** Scatter plot con regresión
- **Gráfica 4:** Asincronías entre dominios
- Indicadores numéricos (CD, Z-score, velocidad)
- Botón "Generar Informe"

### Vista "Análisis Matemático"

Contenido del AnalisisAceleracion:
- Selector de dominio
- Selector de fuente normativa
- **Análisis conceptual** (Deboeck et al., 2016):
  - Derivada 0: Posición (CD) - "¿Dónde está?"
  - Derivada 1ª: Velocidad (ΔCD/Δt) - "¿Cómo cambia?"
  - Derivada 2ª: Aceleración (Δ²CD/Δt²) - "¿Cómo cambia el cambio?"
- **Gráficas:**
  - Cociente de Desarrollo en el tiempo
  - Velocidad de desarrollo
  - Aceleración del desarrollo
- **Análisis de periodos:**
  - Aceleraciones positivas (catching up)
  - Desaceleraciones (slowing down)
  - Periodos estables
- Interpretación automática de patrones

## Ventajas de la Fusión

1. **Navegación simplificada:** Una pestaña menos en el menú principal
2. **Contexto unificado:** Todas las gráficas en un mismo lugar
3. **Fácil comparación:** Cambio rápido entre vistas sin perder contexto
4. **Coherencia:** Ambas vistas comparten el mismo niño y fuente normativa
5. **Menos clicks:** Ya no hay que navegar entre pestañas diferentes

## Flujo de Uso

1. Usuario selecciona un niño
2. Click en **"📊 Gráficas"**
3. Por defecto ve **"📈 Trayectorias del Desarrollo"**
4. Puede cambiar a **"📐 Análisis Matemático"** con un click
5. Ambas vistas se actualizan con los mismos datos del niño

## Comunicación entre Vistas

Los datos calculados en la vista de Trayectorias se pasan a Análisis Matemático:

```jsx
<AnalisisAceleracion 
  ninoId={ninoId} 
  datosRegresionGraficoDesarrollo={datosRegresionRef.current}
/>
```

`datosRegresionRef.current` contiene:
- Coeficientes de regresión
- Puntos calculados
- Estadísticas derivadas

## Estilo de los Botones

```css
/* Botón activo */
border: 2px solid #2196F3
backgroundColor: #E3F2FD
fontWeight: bold

/* Botón inactivo */
border: 1px solid #ddd
backgroundColor: white
fontWeight: normal
```

## Compatibilidad

- ✅ Funciona con datos longitudinales retrospectivos
- ✅ Funciona con datos prospectivos (itinerario)
- ✅ Mantiene todas las funcionalidades originales
- ✅ Botón "Generar Informe" sigue disponible en vista Trayectorias
- ✅ Compartición de datos de regresión entre vistas

## Posibles Mejoras Futuras

1. **Tercera vista:** Añadir "📊 Comparativas" para comparar con otros niños
2. **Pestañas en lugar de botones:** Usar componente de pestañas más sofisticado
3. **Sincronización:** Sincronizar selección de dominio entre ambas vistas
4. **Vista dividida:** Opción de ver ambas vistas lado a lado
5. **Exportar análisis:** Botón para exportar solo el análisis matemático

## Resumen de Navegación Actualizada

```
📚 Ejemplos Clínicos
📚 Guía: Tipología Trayectorias
📖 Fundamentos Científicos
[Cuando hay niño seleccionado:]
  ✅ Hitos del Desarrollo
  🚩 Señales de Alarma
  📊 Gráficas ← NUEVA (fusión de 2 pestañas)
    ├── 📈 Trayectorias del Desarrollo
    └── 📐 Análisis Matemático
```

**Total de pestañas:** Reducidas de 7 a 6

## Conclusión

La fusión de las pestañas de gráficas simplifica la navegación y mantiene todas las visualizaciones relacionadas en un único lugar contextual, mejorando la experiencia de usuario y la coherencia de la interfaz.
