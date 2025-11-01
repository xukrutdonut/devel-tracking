# Corrección de la Gráfica de Regresión del Desarrollo

## Fecha
1 de noviembre de 2024

## Problema Identificado

La gráfica del perfil "Regresión del Desarrollo" mostraba una trayectoria similar a un desarrollo más lento pero continuo, cuando debería mostrar una **inversión clara de la trayectoria** donde la edad de desarrollo se estanca o crece mínimamente después del punto de regresión.

### Comportamiento Anterior (Incorrecto)
- Los hitos posteriores a la regresión seguían conseguiéndose, solo que más tarde
- La trayectoria continuaba ascendiendo, aunque con menor pendiente
- No mostraba el verdadero patrón de una regresión (estancamiento)

### Comportamiento Esperado (Correcto)
- Los hitos hasta el punto de regresión (18 meses) se consiguen normalmente
- Después de la regresión, la edad de desarrollo se mantiene **casi estancada**
- La trayectoria en la gráfica debe verse como:
  - Una línea diagonal (normal) hasta 18 meses
  - Una línea casi **horizontal** después de 18 meses

---

## Solución Implementada

### Nueva Lógica de Generación de Hitos

#### Fase 1: Antes de la Regresión (0-18 meses)
```javascript
// Hitos hasta 18 meses: desarrollo normal
if (hito.edad_media_meses <= 18) {
  edadConseguido = hito.edad_media_meses + variabilidad_pequeña;
}
```
**Resultado:** Puntos que siguen la línea diagonal de 45°

#### Fase 2: Después de la Regresión (18+ meses)
```javascript
// Solo hitos muy cercanos al punto de regresión (18-24 meses de edad normativa)
if (hito.edad_media_meses > 18 && hito.edad_media_meses <= 24) {
  // Velocidad reducida a 10% (necesita 10 meses reales por cada mes de desarrollo)
  edadConseguido = 18 + (mesesDesarrolloExtra * 10);
}
```
**Resultado:** Puntos que forman una línea casi horizontal

---

## Ejemplo Concreto

Para un niño de 30 meses con regresión a los 18 meses:

### Hitos Pre-Regresión (conseguidos normalmente)
| Edad Normativa | Edad Conseguido | En Gráfica |
|----------------|-----------------|------------|
| 6 meses        | ~6 meses        | (6, 6)     |
| 12 meses       | ~12 meses       | (12, 12)   |
| 18 meses       | ~18 meses       | (18, 18)   |

### Hitos Post-Regresión (estancamiento)
| Edad Normativa | Edad Conseguido | En Gráfica |
|----------------|-----------------|------------|
| 19 meses       | 28 meses        | (28, 19)   |
| 20 meses       | 38 meses        | (38, 20)   |
| 21 meses       | 48 meses*       | No visible |

*Más allá de la edad actual del niño (30 meses)

---

## Visualización en la Gráfica

### Interpretación Visual

```
Edad Desarrollo (meses)
      ^
   30 |
      |
   24 |                        ← Solo alcanza ~20 meses
      |                    ••  ← desarrollo a los 30 meses
   18 |              •• ←── Punto de regresión
      |          ••
   12 |      ••
      |  ••
    6 |••
      |
    0 +---------------------------------> Edad Cronológica
        0    6   12   18   24   30
```

### Características Clave

1. **Línea Diagonal (0-18m):** Desarrollo típico
2. **Línea Horizontal (18-30m):** Estancamiento/regresión
3. **Pendiente cambia drásticamente:** De ~1.0 a ~0.1
4. **Inversión visible:** La trayectoria se aplana claramente

---

## Cálculo de Velocidad

### Antes de la Regresión
- Velocidad = edad_desarrollo / edad_cronológica
- A los 18 meses: Velocidad = 18/18 = **1.0** (normal)

### Después de la Regresión
- A los 30 meses con edad desarrollo ~20:
- Velocidad = 20/30 = **0.67** (reducida)
- Cambio en velocidad: **-33%** respecto al esperado

### Velocidad Post-Regresión Específica
- Solo avanza ~2 meses de desarrollo en 12 meses reales
- Velocidad post-regresión = 2/12 = **0.167** (~10%)

---

## Patrón Clínico Representado

### Regresión Autística
Este patrón es típico de:
- Regresión autística (pérdida de habilidades entre 18-24 meses)
- Trastornos neurodegenerativos
- Encefalopatías epilépticas severas

### Características Clínicas
1. Desarrollo normal inicial
2. Pérdida o estancamiento de habilidades
3. Adquisición muy lenta o nula de nuevos hitos
4. Brecha creciente entre edad cronológica y desarrollo

---

## Diferencia con Estancamiento

### Regresión
- Desarrollo normal hasta punto específico (18m)
- Luego velocidad casi cero (10%)
- Edad de desarrollo se mantiene cerca del punto de regresión
- **Gráfica:** Diagonal → Horizontal

### Estancamiento
- Desarrollo normal hasta punto específico (12m)
- Luego velocidad muy reducida (15%)
- Edad de desarrollo sigue creciendo pero lentamente
- **Gráfica:** Diagonal → Pendiente muy suave

---

## Impacto en Otras Gráficas

### Gráfica de Velocidad
- Velocidad ~1.0 hasta 18 meses
- Caída brusca a ~0.1-0.2 después de 18 meses
- **Inversión visible** en la velocidad

### Gráfica de Aceleración
- Aceleración cerca de 0 hasta 18 meses
- **Aceleración fuertemente negativa** en 18 meses
- Aceleración cerca de 0 después (velocidad estable baja)

### Gráfica de Z-Score
- Z-score cercano a 0 hasta 18 meses
- Z-score cada vez más negativo después de 18 meses
- Divergencia creciente respecto a la normalidad

---

## Cambios Realizados

### Archivo Modificado
- `src/components/EjemplosClinicos.jsx`

### Cambios Específicos
1. **Lógica de generación bifurcada:**
   - Primera pasada: hitos pre-regresión (normales)
   - Segunda pasada: hitos post-regresión (muy limitados)

2. **Limitación de hitos post-regresión:**
   - Solo se incluyen hitos de 18-24 meses normativos
   - Velocidad reducida a 10% (factor x10)

3. **Descripción actualizada:**
   - Antes: "velocidad reducida a 30%"
   - Ahora: "trayectoria casi horizontal (edad de desarrollo se estanca)"

---

## Validación

Para verificar que funciona correctamente:

1. **Crear ejemplo "Regresión del Desarrollo"**
2. **Verificar en gráfica principal:**
   - Puntos siguen línea diagonal hasta ~18 meses
   - Puntos forman línea casi horizontal después de 18 meses
   - La línea de tendencia muestra la inversión
3. **Verificar gráfica de velocidad:**
   - Velocidad cae drásticamente alrededor de 18 meses
4. **Verificar estadísticas:**
   - CD global muy reducido (< 0.7)
   - Diferencia creciente con edad cronológica

---

## Nota Clínica

Esta implementación representa una **regresión severa** donde el desarrollo prácticamente se detiene. En la práctica clínica, algunos niños pueden mostrar:
- Regresiones parciales (solo algunos dominios)
- Recuperación parcial posterior
- Velocidad post-regresión algo mayor

El perfil actual representa el escenario más severo para fines educativos y de identificación clara del patrón.
