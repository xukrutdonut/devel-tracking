# Cambio de Tooltips: De Hover a Click

## Resumen

Se ha modificado el comportamiento de los tooltips en los gráficos de scatter para que se activen mediante **click** en lugar de hover (pasar el ratón por encima).

## Cambios Implementados

### 1. Estado de Tooltip Activo

Se añadió un nuevo estado para controlar qué punto tiene el tooltip activo:

```javascript
const [tooltipActivo, setTooltipActivo] = useState(null);
```

### 2. Handler de Click en Puntos

Nueva función para manejar los clicks en los puntos:

```javascript
const handlePuntoClick = (payload) => {
  if (!payload || !payload.hito_nombre) return;
  
  // Si ya está activo este punto, desactivar
  if (tooltipActivo && tooltipActivo.hito_id === payload.hito_id) {
    setTooltipActivo(null);
  } else {
    // Activar este punto
    setTooltipActivo(payload);
  }
};
```

### 3. Modificación de Puntos Personalizados

Cada punto ahora:
- Tiene un handler `onClick` que llama a `handlePuntoClick`
- Muestra un perímetro negro cuando está activo
- Tiene cursor pointer para indicar que es clickeable
- Escala ligeramente en hover (efecto visual)

```javascript
<g 
  className="scatter-point"
  onClick={() => handlePuntoClick(payload)}
  style={{ cursor: 'pointer' }}
>
  <circle 
    cx={cx} 
    cy={cy} 
    r={8} 
    fill="none" 
    stroke="#000" 
    strokeWidth={isActivo ? 2 : 0} 
    style={{ pointerEvents: 'none' }} 
  />
  <circle cx={cx} cy={cy} r={6} fill={colorPunto} stroke="#fff" strokeWidth={2} />
</g>
```

### 4. Modal de Tooltip

En lugar del tooltip flotante de Recharts, ahora se muestra un **modal centrado** cuando se hace click en un punto:

#### Características del modal:
- Fondo oscuro semitransparente (overlay)
- Ventana blanca centrada con la información
- Botón de cerrar (X) en la esquina superior derecha
- Se cierra al hacer click fuera del modal o en el botón X
- Muestra toda la información del hito clickeado

#### Información mostrada:
- ✅ Nombre del hito
- ✅ Dominio (con color)
- ✅ Edad cronológica
- ✅ Edad de desarrollo
- ✅ Cociente de Desarrollo (CD)
- ✅ Puntuación Z
- ✅ Indicador de pérdida (si aplica)

### 5. Deshabilitación de Tooltips de Recharts

Los tooltips nativos de Recharts fueron deshabilitados:

```javascript
<Tooltip content={() => null} cursor={false} />
```

### 6. CSS Actualizado

```css
/* Estilos para puntos de scatter plot con click */
.scatter-point {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.scatter-point:hover {
  transform: scale(1.1);
}
```

## Componentes Afectados

### Gráficos actualizados:

1. **Gráfico de Edad de Desarrollo**:
   - Vista "Global" con hitos individuales
   - Vista "Todos los dominios" con scatter de todos los puntos
   - Vista de dominio específico

2. **Gráfico de Z-Score**:
   - Vista "Global" con hitos individuales
   - Vista "Todos los dominios" con scatter por colores
   - Vista de dominio específico

## Flujo de Interacción

### Antes (Hover):
1. Usuario pasa el ratón sobre un punto
2. Tooltip aparece automáticamente
3. Tooltip desaparece al sacar el ratón

### Ahora (Click):
1. Usuario hace click en un punto
2. Aparece perímetro negro alrededor del punto
3. Se abre modal centrado con la información
4. Usuario puede:
   - Cerrar el modal clickeando fuera
   - Cerrar con el botón X
   - Clickear otro punto (cierra el anterior y abre el nuevo)
   - Clickear el mismo punto de nuevo para cerrar

## Ventajas del Nuevo Sistema

✅ **Mejor en dispositivos táctiles**: No hay hover en móviles/tablets
✅ **Información permanente**: El tooltip no desaparece accidentalmente
✅ **Más legible**: Modal grande y centrado vs tooltip pequeño
✅ **Navegación controlada**: Usuario decide cuándo ver y cerrar la información
✅ **Feedback visual**: Perímetro negro indica qué punto está seleccionado
✅ **Menos accidental**: No se activan tooltips por error al mover el ratón

## Archivos Modificados

- `/src/components/GraficoDesarrollo.jsx`
  - Añadido estado `tooltipActivo`
  - Añadida función `handlePuntoClick`
  - Modificada función `renderizarPuntoPersonalizado`
  - Añadido componente de modal
  - Actualizados todos los Scatter con onClick
  - Deshabilitados tooltips nativos de Recharts

- `/src/App.css`
  - Actualizados estilos de `.scatter-point`
  - Añadida transición de escala en hover
  - Eliminados estilos de `.hover-highlight`

## Testing Recomendado

1. ✓ Verificar que los puntos muestran cursor pointer
2. ✓ Verificar escala en hover
3. ✓ Clickear punto y verificar que aparece modal
4. ✓ Verificar que aparece perímetro negro en punto seleccionado
5. ✓ Cerrar modal clickeando fuera
6. ✓ Cerrar modal con botón X
7. ✓ Clickear diferentes puntos y verificar cambio
8. ✓ Verificar en las 3 vistas de cada gráfico
9. ✓ Probar con puntos de pérdida (rojos con X)
10. ✓ Verificar responsividad en diferentes tamaños de pantalla

## Notas Técnicas

- El modal tiene `z-index: 10000` para estar por encima de todo
- El overlay tiene `rgba(0, 0, 0, 0.5)` para oscurecer el fondo
- `stopPropagation()` previene que el click en el modal cierre el modal
- El estado `tooltipActivo` se compara por `hito_id` para unicidad

## Posibles Mejoras Futuras

- Añadir animación de entrada/salida del modal (fade in/out)
- Permitir navegación con teclado (ESC para cerrar)
- Añadir botones "Anterior/Siguiente" para navegar entre puntos
- Opción de configuración para volver a hover si se prefiere
