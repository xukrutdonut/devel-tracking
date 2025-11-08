# Fix: Gráficas de Velocidad y Aceleración con Datos Retrospectivos

## Problema Identificado

Las gráficas de **Velocidad del Desarrollo** (Derivada 1ª) y **Aceleración del Desarrollo** (Derivada 2ª) no se mostraban cuando se trabajaba con datos retrospectivos (hitos con edades de logro registradas).

## Causa Raíz

El componente `AnalisisAceleracion` depende de recibir los datos de regresión calculados en `GraficoDesarrollo` a través del prop `datosRegresionGraficoDesarrollo`. Sin embargo, había dos problemas:

1. **Datos almacenados en ref en lugar de state**: Los datos se guardaban en `datosRegresionRef.current`, que es una referencia inmutable y no provoca re-render del componente hijo.

2. **Paso de string JSON en lugar de objeto**: Se guardaba el string JSON en lugar del objeto, lo que causaba que las validaciones fallaran.

## Solución Implementada

### 1. Cambios en `GraficoDesarrollo.jsx`

```jsx
// ANTES: Solo ref (no provoca re-render)
const datosRegresionRef = useRef(null);
// ...
datosRegresionRef.current = stringJSON; // Guardaba string
// ...
<AnalisisAceleracion datosRegresionGraficoDesarrollo={datosRegresionRef.current} />

// DESPUÉS: State + Ref (provoca re-render reactivo)
const [datosRegresion, setDatosRegresion] = useState(null);
const datosRegresionRef = useRef(null);
// ...
datosRegresionRef.current = objetoDatos; // Guarda objeto
Promise.resolve().then(() => setDatosRegresion(objetoDatos)); // Actualiza state
// ...
<AnalisisAceleracion datosRegresionGraficoDesarrollo={datosRegresion} />
```

**Detalles de la implementación:**

- Se añadió estado `datosRegresion` para provocar re-renders cuando cambien los datos
- Se mantiene `datosRegresionRef` para comparar si los datos cambiaron (evita actualizaciones innecesarias)
- Se usa `Promise.resolve().then()` en lugar de `setTimeout()` para programar la actualización después del render actual
- Los datos se guardan como objeto, no como string JSON

### 2. Cambios en `AnalisisAceleracion.jsx`

Se añadieron console.logs para depuración:

```jsx
console.log('🔍 [AnalisisAceleracion] Verificando datos de regresión:', {
  existe: !!datosRegresionGraficoDesarrollo,
  tieneLineaTendencia: !!datosRegresionGraficoDesarrollo?.lineaTendencia,
  longitudLineaTendencia: datosRegresionGraficoDesarrollo?.lineaTendencia?.length,
  tipoDatos
});
```

Estos logs ayudan a:
- Confirmar que los datos llegan correctamente
- Ver la longitud de la línea de tendencia
- Identificar el tipo de datos (retrospectivo/prospectivo)

## Cómo Funcionan las Gráficas

### Gráfica de Velocidad (Derivada 1ª)

Calcula la pendiente (derivada) de la línea de tendencia del gráfico "Edad de Desarrollo vs Edad Cronológica":

```javascript
const velocidad = deltaDesarrollo / deltaEdadCronologica;
```

**Interpretación:**
- **velocidad = 1.0**: Desarrollo típico (progresa al mismo ritmo que la edad)
- **velocidad > 1.0**: Desarrollo acelerado (progresa más rápido que la edad)
- **velocidad < 1.0**: Desarrollo enlentecido (progresa más lento que la edad)

### Gráfica de Aceleración (Derivada 2ª)

Calcula el cambio en la velocidad (derivada de la derivada):

```javascript
const aceleracion = (velocidad_actual - velocidad_anterior) / deltaEdadCronologica;
```

**Interpretación:**
- **aceleración > 0**: El desarrollo se está acelerando
- **aceleración < 0**: El desarrollo se está desacelerando
- **aceleración = 0**: Velocidad constante

## Flujo de Datos

```
GraficoDesarrollo (calcula regresión)
         ↓
   datosRegresion (state)
         ↓
AnalisisAceleracion (recibe prop)
         ↓
   Renderiza gráficas de velocidad y aceleración
```

## Ventajas de esta Solución

1. **Reactivo**: Los cambios en los datos de regresión provocan automáticamente re-render
2. **Eficiente**: Se evitan actualizaciones innecesarias mediante comparación de JSON
3. **Depurable**: Console.logs permiten verificar el flujo de datos
4. **Sin loops**: Uso de `Promise.resolve().then()` evita loops infinitos de actualización

## Validación

Para verificar que funciona correctamente:

1. Registrar hitos con datos retrospectivos (edad de logro)
2. Ver la pestaña "📐 Análisis Matemático: Velocidad y Aceleración"
3. Verificar que aparecen las gráficas:
   - 🚀 Velocidad del Desarrollo (Derivada 1ª)
   - ⚡ Aceleración del Desarrollo (Derivada 2ª)
4. Abrir la consola del navegador y verificar los logs de depuración

## Referencias

- **Deboeck et al. (2016)**: "Using derivatives to articulate change theories"
- **Thomas et al. (2009)**: "Using developmental trajectories to understand developmental disorders"
- Artículo base: "Las matemáticas aplicadas a la evaluación del neurodesarrollo" de neuropediatoolkit.org

## Fix Adicional: Modo Invitado

### Problema en Modo Invitado

Tras el fix inicial, las gráficas seguían sin aparecer en modo invitado. La función `construirAnalisisLocal` que procesa los hitos guardados en `sessionStorage` no estaba enriqueciendo los hitos con toda la información necesaria de los hitos normativos.

### Solución para Modo Invitado

Se mejoró la función `construirAnalisisLocal` para:

1. **Enriquecer hitos con datos normativos**: Busca cada hito normativo correspondiente y combina la información
2. **Asegurar campos completos**: Garantiza que cada hito tenga:
   - `hito_nombre`: Nombre del hito
   - `edad_media_meses`: Edad esperada del hito
   - `desviacion_estandar`: Desviación estándar
   - `dominio_nombre`: Nombre del dominio
   - `edad_conseguido_meses`: Edad cuando se logró
   - `edad_perdido_meses`: Edad cuando se perdió (si aplica)

3. **Logging para depuración**: Console.logs que muestran cuántos hitos se procesan

```javascript
// Enriquecer hitos con información de hitos normativos
const hitosEnriquecidos = hitos.map(hito => {
  const hitoNormativo = hitosNormativos.find(hn => hn.id === hito.hito_id);
  
  if (!hitoNormativo) {
    console.warn('⚠️ Hito normativo no encontrado para hito_id:', hito.hito_id);
    return hito;
  }
  
  return {
    ...hito,
    hito_nombre: hitoNormativo.hito || hito.hito_nombre,
    edad_media_meses: hitoNormativo.edad_media_meses,
    desviacion_estandar: hitoNormativo.desviacion_estandar,
    dominio_nombre: hitoNormativo.dominio_nombre || hito.dominio_nombre,
    edad_conseguido_meses: hito.edad_conseguido_meses || hito.edad_meses,
    edad_perdido_meses: hito.edad_perdido_meses || null
  };
});
```

### Flujo Completo en Modo Invitado

```
EjemplosPracticos (crea ejemplo)
         ↓
  sessionStorage guarda hitos
         ↓
GraficoDesarrollo.cargarDatos()
         ↓
  construirAnalisisLocal() - Enriquece hitos
         ↓
   Calcula regresión polinomial
         ↓
   datosRegresion (state)
         ↓
AnalisisAceleracion (recibe prop)
         ↓
   Renderiza gráficas de velocidad y aceleración
```

## Archivos Modificados

- `src/components/GraficoDesarrollo.jsx`: 
  - Paso de datos de regresión mediante state (usuarios autenticados)
  - Función `construirAnalisisLocal` mejorada (modo invitado)
- `src/components/AnalisisAceleracion.jsx`: Console.logs para depuración
