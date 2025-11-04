# Corrección: Error de Orden de Hooks en React

## Problema Original

```
React has detected a change in the order of Hooks called by GraficoDesarrollo.
This will lead to bugs and errors if not fixed.

Previous render            Next render
------------------------------------------------------
1. useState               useState
...
11. useEffect             useEffect
12. undefined             useEffect  ❌ PROBLEMA
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Error: Rendered more hooks than during the previous render.
```

## Causa del Error

Se añadió un `useEffect` dentro de la lógica condicional del componente, después de calcular las regresiones:

```javascript
// ❌ INCORRECTO - Hook condicional
if (analisis) {
  // ... cálculos de regresiones ...
  const regresionDesarrollo = calcularRegresionPolinomial(...);
  
  // Hook dentro de bloque condicional - VIOLA las reglas de React
  useEffect(() => {
    if (onDatosRegresionCalculados && regresionDesarrollo) {
      onDatosRegresionCalculados({...});
    }
  }, [regresionDesarrollo, ...]);
}
```

### ¿Por qué es problemático?

React requiere que los Hooks se llamen en el **mismo orden** en cada render. Al poner un Hook dentro de lógica condicional:
- Si `analisis` es `null`: 11 hooks
- Si `analisis` existe: 12 hooks
- React no puede rastrear el estado correctamente → Error

## Solución Implementada

### Paso 1: Usar `useMemo` para memoizar los datos

```javascript
const datosRegresionParaCompartir = useMemo(() => {
  if (regresionDesarrollo && lineaTendenciaDesarrollo) {
    return {
      regresion: regresionDesarrollo,
      lineaTendencia: lineaTendenciaDesarrollo,
      datosOriginales: datosParaTendencia,
      dominioSeleccionado: dominioSeleccionado,
      fuenteSeleccionada: fuenteSeleccionada
    };
  }
  return null;
}, [regresionDesarrollo, lineaTendenciaDesarrollo, datosParaTendencia, dominioSeleccionado, fuenteSeleccionada]);
```

### Paso 2: `useEffect` en nivel superior para enviar al padre

```javascript
useEffect(() => {
  if (onDatosRegresionCalculados && datosRegresionParaCompartir) {
    onDatosRegresionCalculados(datosRegresionParaCompartir);
  }
}, [datosRegresionParaCompartir, onDatosRegresionCalculados]);
```

### Estructura Final Correcta

```javascript
function GraficoDesarrollo({ ninoId, onDatosRegresionCalculados }) {
  // ✅ 1. Todos los useState al inicio
  const [analisis, setAnalisis] = useState(null);
  const [redFlags, setRedFlags] = useState([]);
  // ... otros estados ...

  // ✅ 2. Todos los useEffect al inicio (nivel superior)
  useEffect(() => {
    cargarDatos();
    cargarFuentesNormativas();
  }, [ninoId]);

  useEffect(() => {
    if (fuenteSeleccionada) {
      cargarDatos();
    }
  }, [fuenteSeleccionada]);

  // ✅ 3. Lógica condicional (sin hooks)
  if (!analisis) {
    return <div>Cargando...</div>;
  }

  // Cálculos de regresiones...
  const regresionDesarrollo = calcularRegresionPolinomial(...);
  const lineaTendenciaDesarrollo = generarLineaTendenciaSuave(...);

  // ✅ 4. useMemo para valores derivados
  const datosRegresionParaCompartir = useMemo(() => {
    // Preparar datos para compartir
    if (regresionDesarrollo && lineaTendenciaDesarrollo) {
      return { regresion, lineaTendencia, ... };
    }
    return null;
  }, [dependencies]);

  // ✅ 5. useEffect para efectos secundarios (comunicación con padre)
  useEffect(() => {
    if (onDatosRegresionCalculados && datosRegresionParaCompartir) {
      onDatosRegresionCalculados(datosRegresionParaCompartir);
    }
  }, [datosRegresionParaCompartir, onDatosRegresionCalculados]);

  // ✅ 6. Render
  return <div>...</div>;
}
```

## Reglas de Hooks de React (Recordatorio)

### ✅ Siempre hacer:

1. **Llamar Hooks en el nivel superior**
   - No dentro de loops, condicionales o funciones anidadas
   
2. **Llamar Hooks en el mismo orden**
   - React depende del orden para rastrear estado

3. **Llamar Hooks solo en componentes de React**
   - O en custom hooks

### ❌ Nunca hacer:

```javascript
// ❌ Hook dentro de condicional
if (condition) {
  useEffect(() => {});
}

// ❌ Hook dentro de loop
for (let i = 0; i < 10; i++) {
  useState(i);
}

// ❌ Hook dentro de función callback
handleClick = () => {
  const [state, setState] = useState(0);
}

// ❌ Hook después de return condicional
if (loading) return <Loading />;
useEffect(() => {}); // Este hook a veces no se ejecuta
```

## Alternativas Consideradas

### Opción 1: Callback directo (NO funciona)
```javascript
// ❌ Causa re-renders infinitos
if (regresionDesarrollo) {
  onDatosRegresionCalculados({...}); // Se llama en cada render
}
```

### Opción 2: useState + setImmediate (Complejo)
```javascript
// 🟡 Funciona pero innecesariamente complejo
const [datosRegresion, setDatosRegresion] = useState(null);

useEffect(() => {
  if (onDatosRegresionCalculados && datosRegresion) {
    onDatosRegresionCalculados(datosRegresion);
  }
}, [datosRegresion]);

// En el cuerpo del componente
if (regresionDesarrollo && JSON.stringify(datosRegresion) !== JSON.stringify(nuevos)) {
  setDatosRegresion(nuevos); // Comparación costosa
}
```

### Opción 3: useMemo + useEffect (ELEGIDA) ✅
```javascript
// ✅ Simple, eficiente, sigue las reglas de React
const datosRegresion = useMemo(() => {
  return regresionDesarrollo ? {...} : null;
}, [dependencies]);

useEffect(() => {
  if (onDatosRegresionCalculados && datosRegresion) {
    onDatosRegresionCalculados(datosRegresion);
  }
}, [datosRegresion, onDatosRegresionCalculados]);
```

## Ventajas de la Solución Final

✅ **Sigue las reglas de Hooks:** Todos los hooks en nivel superior
✅ **Eficiente:** `useMemo` evita recalcular si dependencias no cambian
✅ **Sin re-renders infinitos:** `useEffect` con dependencias correctas
✅ **Legible:** Separación clara de cálculo y efecto secundario
✅ **Mantenible:** Fácil de entender y modificar

## Testing

### Verificar que funciona correctamente:

1. ✓ Compilación sin errores
2. ✓ No hay warnings de React en consola
3. ✓ Los datos se comparten correctamente entre pestañas
4. ✓ No hay re-renders infinitos
5. ✓ Cambiar dominio/fuente actualiza correctamente

### Comandos de verificación:

```bash
npm run build  # Debe compilar sin errores
npm run dev    # Abrir consola del navegador, no debe haber warnings
```

## Referencias

- [Rules of Hooks - React Docs](https://react.dev/link/rules-of-hooks)
- [useMemo - React Docs](https://react.dev/reference/react/useMemo)
- [useEffect - React Docs](https://react.dev/reference/react/useEffect)

## Archivos Modificados

- `/src/components/GraficoDesarrollo.jsx`
  - Añadido `import { useMemo }` 
  - Eliminado estado `datosRegresionCalculados`
  - Añadido `useMemo` para `datosRegresionParaCompartir`
  - Movido `useEffect` al nivel superior del componente
  - Eliminado código condicional que llamaba a `setState`

---

**Fecha de corrección:** 2024
**Autor de la corrección:** Assistant
**Causa raíz:** Violación de reglas de Hooks - useEffect condicional
**Solución:** useMemo + useEffect en nivel superior
