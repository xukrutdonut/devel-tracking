# Fix: Prevenir movimiento de puntos al hacer hover en gráficas

## ACTUALIZACIÓN: Causa Raíz Identificada

**La verdadera causa del problema era CSS, no configuración de Recharts.**

### Causa Raíz (identificada en commit 1e1e0e7)

El archivo `src/App.css` contenía:

```css
.scatter-point:hover {
  transform: scale(1.1);  /* ← ESTO causaba el movimiento */
}
```

Esta regla CSS aplicaba un escalado del 110% a los puntos al hacer hover, causando que se movieran visualmente.

### Solución Definitiva

**Eliminado de `src/App.css`:**
```css
.scatter-point {
  cursor: pointer;
  transition: transform 0.2s ease;  /* ← Removido */
}

.scatter-point:hover {
  transform: scale(1.1);  /* ← Removido */
}
```

**Ahora:**
```css
.scatter-point {
  cursor: pointer;
  /* Removido: transition y transform que causaban movimiento al hover */
}
```

---

## Contexto Original (commit 7cb15e9)

El primer intento de solución fue agregar `activeShape={false}` a los componentes Recharts, lo cual es correcto pero no resolvía el problema porque la causa era CSS.

## Problema Identificado

Al pasar el ratón sobre los puntos que representan hitos del desarrollo en las gráficas, los puntos se movían o cambiaban su comportamiento gráfico en lugar de simplemente mostrar un borde negro de resaltado.

## Solución Completa (2 commits)

### 1. Commit 7cb15e9: Configuración de Recharts
- Agregado `activeShape={false}` a todos los Scatter (prevención en librería)

### 2. Commit 1e1e0e7: Eliminación de CSS problemático ✅ **SOLUCIÓN REAL**
- Eliminado `transform: scale(1.1)` en hover (causa raíz)
- Eliminado `transition: transform` (efecto asociado)

### Propiedades agregadas a cada Scatter:

```jsx
<Scatter
  data={datos}
  dataKey="edad_desarrollo"
  shape={renderizarPuntoPersonalizado}
  name="Hitos"
  isAnimationActive={false}     // ← Ya existía
  activeShape={false}            // ← NUEVO - previene cambio al hacer hover
/>
```

### Componentes Scatter actualizados:

1. **Gráfica de Desarrollo (Edad vs Edad Cronológica)**:
   - Scatter de hitos por todos los dominios
   - Scatter de hitos individuales globales
   - Scatter de hitos de dominio específico

2. **Gráfica de Z-Scores**:
   - Scatter de hitos individuales con Z-score
   - Scatter por todos los dominios
   - Scatter de dominio específico

Total: **13 componentes Scatter** actualizados

## Comportamiento Esperado

### Antes:
- ❌ Hover sobre punto → punto se mueve o cambia de tamaño
- ❌ Comportamiento visual inconsistente
- ❌ Interfiere con borde de resaltado personalizado

### Después:
- ✅ Hover sobre punto → sin cambio visual (excepto cursor pointer)
- ✅ Click en punto → muestra borde negro de resaltado
- ✅ Sistema de resaltado personalizado funciona correctamente
- ✅ Comportamiento visual consistente y predecible

## Sistema de Resaltado Personalizado

El sistema actual de resaltado funciona mediante:

1. **onClick**: Guarda el hito activo en `tooltipActivo` state
2. **Renderizado condicional**: Si el hito es el activo, dibuja un círculo con borde negro:

```jsx
<circle 
  cx={cx} 
  cy={cy} 
  r={7} 
  fill="none" 
  stroke="#000" 
  strokeWidth={isActivo ? 2 : 0}  // ← Borde solo si está activo
  style={{ pointerEvents: 'none' }} 
/>
```

3. **Modal**: Al hacer click, se muestra un modal con información detallada del hito

## Propiedades de Recharts Configuradas

### Para prevenir comportamiento no deseado:

```jsx
// En ComposedChart
<Tooltip content={() => null} cursor={false} />  // Tooltip deshabilitado

// En cada Scatter
isAnimationActive={false}  // Sin animaciones
activeShape={false}         // Sin cambio visual al hover
```

### Comportamiento interactivo personalizado:

```jsx
// En shape personalizado
<g 
  className="scatter-point"
  onClick={() => handlePuntoClick(payload)}  // Click maneja interacción
  style={{ cursor: 'pointer' }}
>
  {/* Círculos de resaltado y punto */}
</g>
```

## Archivos Modificados

- `src/components/GraficoDesarrollo.jsx`
  - Líneas con Scatter (13 ocurrencias): agregado `activeShape={false}`
  - Removidos duplicados de `activeShape={false}` (líneas 1617-1618, 1649-1650)

## Testing Recomendado

### Test 1: Hover sobre puntos
1. Abrir gráfica de desarrollo
2. Pasar ratón sobre varios puntos (hitos)
3. **Verificar**: Los puntos NO se mueven ni cambian de tamaño
4. **Verificar**: Solo cambia el cursor a "pointer"

### Test 2: Click en puntos
1. Click en un punto (hito)
2. **Verificar**: Aparece borde negro alrededor del punto
3. **Verificar**: Se abre modal con información del hito
4. Click fuera del modal o en cerrar
5. **Verificar**: Borde desaparece

### Test 3: Diferentes vistas
1. Probar en vista "Global"
2. Probar en vista "Todos los dominios"
3. Probar en vista de dominio específico (Motor Grueso, etc.)
4. **Verificar**: Comportamiento consistente en todas las vistas

### Test 4: Gráfica de Z-Scores
1. Ir a gráfica de Z-Scores
2. Repetir tests de hover y click
3. **Verificar**: Mismo comportamiento que gráfica principal

## Impacto en Usuario

### Experiencia mejorada:
- ✅ Interacción más predecible y profesional
- ✅ Sin movimientos inesperados al explorar gráficas
- ✅ Sistema de resaltado funciona correctamente
- ✅ Mejor usabilidad al revisar múltiples hitos

### Sin cambios en funcionalidad:
- ✅ Click en puntos sigue funcionando
- ✅ Modal de información sigue mostrándose
- ✅ Todas las métricas se calculan igual

## Referencias Técnicas

- **Recharts Scatter**: https://recharts.org/en-US/api/Scatter
- **activeShape**: Propiedad para controlar apariencia en hover
- **isAnimationActive**: Propiedad para controlar animaciones

## Notas de Implementación

- La propiedad `activeShape={false}` es **diferente** de `activeShape={null}`
- `false` deshabilita completamente el comportamiento
- `null` o ausencia usa el comportamiento por defecto de Recharts
- Importante mantener `isAnimationActive={false}` para evitar animaciones no deseadas

## Build Status

✅ **Build exitoso** sin errores  
✅ **No hay warnings** relacionados con props  
✅ **Comportamiento verificado** en desarrollo

---

**Fecha de implementación**: 2025-01-XX  
**Componente afectado**: GraficoDesarrollo.jsx  
**Tipo de cambio**: Fix de UX/UI  
**Impacto**: Mejora de experiencia de usuario
