# Marcado Visual de Pérdidas de Hitos en Gráficas

## Fecha
1 de noviembre de 2024

## Cambios Implementados

### Objetivo
Hacer visibles los momentos exactos de pérdida de hitos en la gráfica para que se observe claramente la **pendiente descendente** característica de la regresión del desarrollo.

---

## 1. Preservación de Eventos de Pérdida

### Problema Anterior
Los eventos se agrupaban por edad cronológica redondeada, lo que podía hacer que eventos de pérdida se "fusionaran" con otros eventos, perdiendo su visibilidad.

### Solución Implementada
```javascript
// Antes: redondeaba las edades
const edad = Math.round(evento.edad * 10) / 10;

// Ahora: preserva la edad exacta
const edad = evento.edad; // Sin redondear
```

**Resultado:** Cada evento de pérdida genera su propio punto en la gráfica.

---

## 2. Marcado Visual de Puntos de Pérdida

### Función de Renderizado Personalizado

Se creó una función que renderiza puntos de manera diferente según el tipo de evento:

```javascript
const renderizarPuntoPersonalizado = (props) => {
  const { cx, cy, payload, fill } = props;
  
  if (payload.tiene_perdida) {
    // Punto ROJO con X para pérdidas
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="#e74c3c" stroke="#fff" />
        <text x={cx} y={cy}>×</text>
      </g>
    );
  }
  
  // Punto normal para adquisiciones
  return <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#fff" />;
};
```

### Características Visuales

**Puntos de Adquisición (normal):**
- Color: Azul oscuro (#2c3e50) o color del dominio
- Tamaño: Radio 6px
- Borde: Blanco 2px

**Puntos de Pérdida (regresión):**
- Color: Rojo (#e74c3c)
- Tamaño: Radio 8px (más grande)
- Símbolo: × (cruz) blanca dentro
- Borde: Blanco 2px

---

## 3. Ordenamiento Cronológico Preciso

### Mejora en el Procesamiento

```javascript
// Ordenar las edades para procesarlas cronológicamente
const edadesOrdenadas = Object.keys(hitosPorEdadCronologica)
  .map(e => parseFloat(e))
  .sort((a, b) => a - b);

// Procesar eventos en orden estricto
edadesOrdenadas.forEach(edad => {
  // Aplicar eventos de adquisición y pérdida
});
```

**Resultado:** La trayectoria se construye correctamente, mostrando ascensos (adquisiciones) y descensos (pérdidas).

---

## 4. Punto Inicial en Origen

Se agrega automáticamente un punto en (0, 0) si no existe:

```javascript
if (edadesOrdenadas.length > 0 && edadesOrdenadas[0] > 0) {
  hitosPorEdadCronologica[0] = {
    edad_cronologica: 0,
    eventos_por_dominio: {},
    hitos_activos_por_dominio: {}
  };
}
```

**Beneficio:** La gráfica siempre empieza desde el origen, facilitando la interpretación.

---

## 5. Indicador de Regresión

### Alerta Visual Dinámica

Si se detectan pérdidas de hitos, aparece un mensaje explicativo:

```
⚠️ Regresión detectada: Los puntos rojos con × indican momentos 
donde se perdieron hitos previamente adquiridos. Esto produce una 
pendiente descendente en la trayectoria de desarrollo.
```

**Condición de activación:**
```javascript
{datosGrafico.some(d => d.tiene_perdida) && (
  <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
    ⚠️ Regresión detectada...
  </p>
)}
```

---

## Visualización Esperada

### Ejemplo: Niño con Regresión a 18 meses

```
Edad Desarrollo (meses)
      ^
   24 |
      |
   18 |         ○○    
      |       ○○  ×× ← Puntos ROJOS (pérdidas)
   15 |     ○○      ×××
   12 |   ○○           ××
      | ○○
    6 |○
      |
    0 +---------------------------------> Edad Cronológica
        0    6   12   18   24   30

Leyenda:
○ = Punto azul (adquisición normal)
× = Punto rojo con cruz (pérdida)
```

### Secuencia de Eventos Visualizada

| Edad | Evento | Visual | Edad Desarrollo |
|------|--------|--------|-----------------|
| 6m   | Adquiere hito 6m | ○ Azul | 6m |
| 12m  | Adquiere hito 12m | ○ Azul | 12m |
| 18m  | Adquiere hito 18m | ○ Azul | 18m |
| 18.5m | **PIERDE** hito 15m | **× Rojo** | **16m** ↓ |
| 19m  | **PIERDE** hito 12m | **× Rojo** | **14m** ↓ |
| 20m  | **PIERDE** hito 9m | **× Rojo** | **12m** ↓ |
| 24m  | Adquiere hito 10m | ○ Azul | 13m |

**Observación clave:** La edad de desarrollo **baja** de 18m a 12m por las pérdidas.

---

## Interpretación Clínica

### Patrones Visuales

**1. Desarrollo Típico**
```
    ○
  ○
○
```
Solo puntos azules en diagonal ascendente.

**2. Retraso Simple**
```
      ○
    ○
  ○
○
```
Puntos azules por debajo de la diagonal, pero ascendentes.

**3. Regresión (NUEVO)**
```
    ○
  ○   ××
○       ××
```
Puntos azules ascienden, luego puntos rojos descienden.

**4. Estancamiento**
```
    ○○○○
  ○
○
```
Puntos azules en meseta (horizontal).

---

## Impacto en el Diagnóstico

### Antes (Sin Marcado)
- Difícil distinguir regresión de estancamiento
- No se veía cuándo ocurrían las pérdidas
- Trayectoria confusa

### Ahora (Con Marcado)
✓ Pérdidas claramente marcadas con puntos rojos
✓ Momento exacto de regresión visible
✓ Pendiente descendente evidente
✓ Diferenciación clara entre patrones

---

## Casos de Uso

### 1. Regresión Autística
**Patrón esperado:**
- Desarrollo normal 0-18 meses (puntos azules)
- Pérdidas 18-24 meses (puntos rojos en lenguaje y social)
- Estancamiento posterior (pocos puntos azules)

### 2. Síndrome de Rett
**Patrón esperado:**
- Desarrollo normal 6-18 meses (puntos azules)
- Pérdidas 18-30 meses (puntos rojos en motor fino)
- Deterioro progresivo (más puntos rojos)

### 3. Trastorno Desintegrativo
**Patrón esperado:**
- Desarrollo normal prolongado (puntos azules hasta 36m)
- Pérdidas súbitas (cluster de puntos rojos)
- Deterioro marcado

---

## Archivos Modificados

### Frontend
- `src/components/GraficoDesarrollo.jsx`
  - Función `renderizarPuntoPersonalizado()` (nueva)
  - Preservación de edades exactas (sin redondeo)
  - Ordenamiento cronológico preciso
  - Alerta de regresión dinámica

---

## Testing Recomendado

### 1. Crear Ejemplo de Regresión
```
1. Ir a "Ejemplos Clínicos"
2. Crear "Regresión del Desarrollo"
3. Seleccionar el ejemplo creado
```

### 2. Verificar Visualización
```
✓ Puntos azules ascienden hasta ~18 meses
✓ Puntos ROJOS aparecen alrededor de 18-21 meses
✓ Puntos rojos tienen símbolo × visible
✓ Puntos rojos son más grandes que los azules
✓ Trayectoria muestra descenso visible
```

### 3. Verificar Alerta
```
✓ Aparece mensaje "⚠️ Regresión detectada"
✓ Mensaje en color rojo
✓ Explicación clara sobre puntos rojos
```

### 4. Comparar con Otros Perfiles
```
• Desarrollo Típico: Solo puntos azules ✓
• Retraso Global: Puntos azules bajo diagonal ✓
• Estancamiento: Puntos azules en meseta ✓
• Regresión: Puntos azules + rojos ✓
```

---

## Ventajas de la Implementación

### 1. Claridad Visual
✓ Imposible no ver las pérdidas (puntos rojos grandes)
✓ Símbolo × intuitivo (pérdida/eliminación)
✓ Color rojo universalmente asociado con alerta

### 2. Precisión Temporal
✓ Cada pérdida en su momento exacto
✓ No se pierden eventos por redondeo
✓ Secuencia temporal clara

### 3. Educativa
✓ Clínicos aprenden a identificar regresión
✓ Familias entienden qué sucedió
✓ Facilita comunicación del diagnóstico

### 4. Diagnóstica
✓ Distingue regresión de estancamiento
✓ Identifica dominios afectados
✓ Marca temporalidad de la regresión

---

## Notas Técnicas

### Renderizado con Recharts

Los puntos personalizados se renderizan usando la prop `dot` de `<Line>`:

```javascript
<Line
  data={datosGrafico}
  dataKey="edad_desarrollo_global"
  dot={renderizarPuntoPersonalizado}  // Función personalizada
/>
```

### Props Recibidas

La función de renderizado recibe:
- `cx`, `cy`: Coordenadas del punto
- `payload`: Datos del punto
- `fill`: Color por defecto

### Performance

- Los puntos se renderizan eficientemente con SVG
- No hay impacto significativo en el rendimiento
- Escala bien incluso con muchos puntos

---

## Extensiones Futuras

### Posibles Mejoras

1. **Tooltip Detallado para Pérdidas**
   - Mostrar qué hito se perdió
   - Fecha/edad exacta de pérdida
   - Dominio afectado

2. **Líneas Conectoras**
   - Conectar adquisición con pérdida del mismo hito
   - Visualizar "vida útil" del hito

3. **Colores por Dominio**
   - Pérdidas en lenguaje: rojo claro
   - Pérdidas en social: rojo oscuro
   - Pérdidas en motor: naranja

4. **Animaciones**
   - Destacar puntos de pérdida al cargar
   - Parpadeo sutil para llamar atención

---

## Conclusión

El marcado visual de pérdidas transforma la representación de regresión del desarrollo de un concepto abstracto a una visualización concreta e inmediata. Los puntos rojos con × no solo marcan dónde ocurrieron las pérdidas, sino que **demuestran visualmente la pendiente descendente** que define clínicamente la regresión.

Esta implementación cumple el objetivo original: hacer que la gráfica muestre claramente la inversión de trayectoria característica de la regresión del desarrollo.
