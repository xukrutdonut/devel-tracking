# 🔄 Soporte de Datos Duales: Retrospectivos y Prospectivos

## 🎯 Objetivo

Los componentes de análisis matemático y clasificación de trayectorias ahora soportan **dos tipos de datos** diferentes, permitiendo análisis tanto con datos históricos (retrospectivos) como con evaluaciones realizadas en tiempo real (prospectivos).

---

## 📊 Tipos de Datos Soportados

### 1. Datos Longitudinales Retrospectivos 📚

**Definición**: Múltiples hitos del desarrollo registrados con sus **edades de logro** en una o varias sesiones.

**Características**:
- Los hitos se registran con la edad específica en que se lograron
- Puede ser información histórica reportada por padres/cuidadores
- Permite construir trayectorias retrospectivamente
- No requiere evaluaciones en tiempo real

**Ejemplo**:
```
Sesión única de registro (niño de 24 meses):
- Sonrisa social: logrado a los 2 meses
- Sedestación: logrado a los 6 meses
- Gateo: logrado a los 9 meses
- Primeras palabras: logrado a los 12 meses
- Caminar independiente: logrado a los 14 meses
- Frases de 2 palabras: logrado a los 20 meses
```

**Ventajas**:
- ✅ Permite análisis inmediato desde la primera consulta
- ✅ Útil en contextos de atención primaria con consultas espaciadas
- ✅ Aprovecha información histórica valiosa
- ✅ No requiere seguimiento longitudinal prospectivo

**Limitaciones**:
- ⚠️ Dependiente de memoria de cuidadores
- ⚠️ Posible sesgo de recuerdo
- ⚠️ Menos preciso que observación directa

---

### 2. Datos Prospectivos 📊

**Definición**: Múltiples evaluaciones **puntuales** realizadas en diferentes momentos en el tiempo.

**Características**:
- Evaluaciones realizadas en tiempo real
- Cada evaluación es una "fotografía" del estado actual
- Seguimiento longitudinal activo
- Mayor precisión al ser observación directa

**Ejemplo**:
```
Evaluación 1 (12 meses): 
  - Hitos logrados a esta edad: 15 hitos
  - CD global: 95%

Evaluación 2 (18 meses):
  - Hitos logrados a esta edad: 28 hitos
  - CD global: 98%

Evaluación 3 (24 meses):
  - Hitos logrados a esta edad: 42 hitos
  - CD global: 102%
```

**Ventajas**:
- ✅ Mayor precisión (observación directa)
- ✅ Permite detectar cambios sutiles
- ✅ Evaluación del efecto de intervenciones
- ✅ Seguimiento objetivo de evolución

**Limitaciones**:
- ⚠️ Requiere múltiples consultas
- ⚠️ No hay datos hasta segunda evaluación
- ⚠️ Más costoso en tiempo y recursos

---

## �� Implementación Técnica

### Archivo de Utilidades: `trayectoriasUtils.js`

Se ha creado un módulo de utilidades que maneja ambos tipos de datos:

#### Función Principal: `construirPuntosEvaluacion()`

```javascript
/**
 * Construye puntos de evaluación para análisis de trayectorias
 * @param {Array} hitosConseguidos - Hitos con edad_conseguido_meses
 * @param {Array} hitosNormativos - Base de datos normativa
 * @param {Array} dominios - Dominios del desarrollo
 * @param {number} edadActualMeses - Edad actual del niño
 * @returns {Array} Puntos de evaluación con CD, Z-scores por dominio
 */
```

**Proceso**:
1. Agrupa hitos por edad de logro
2. Crea puntos temporales en cada edad donde se logró al menos un hito
3. Calcula métricas acumulativas (todos los hitos hasta esa edad)
4. Genera CD y Z-scores por dominio en cada punto

#### Otras Funciones:

- `calcularVelocidad()`: Calcula derivada 1ª
- `calcularAceleracion()`: Calcula derivada 2ª
- `calcularMetricasTrayectoria()`: Enriquece puntos con todas las métricas
- `interpretarTrayectoria()`: Genera interpretaciones automáticas
- `clasificarTipoTrayectoria()`: Clasifica según Thomas et al. (2009)
- `determinarTipoDatos()`: Identifica si datos son retrospectivos o prospectivos

---

## 📱 Interfaz de Usuario

### Indicadores Visuales

Los componentes ahora muestran claramente qué tipo de datos se están analizando:

#### Datos Retrospectivos:
```
┌─────────────────────────────────────────────────────────┐
│ 📚 Datos longitudinales retrospectivos: Análisis        │
│    basado en hitos con edades de logro registradas      │
└─────────────────────────────────────────────────────────┘
```
- Color: Verde claro (#E8F5E9)
- Icono: 📚 (libro)

#### Datos Prospectivos:
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Datos prospectivos: Análisis basado en múltiples     │
│    evaluaciones en el tiempo                             │
└─────────────────────────────────────────────────────────┘
```
- Color: Azul claro (#E3F2FD)
- Icono: 📊 (gráfico de barras)

---

## 🚀 Flujo de Análisis

### Algoritmo de Decisión:

```
┌─────────────────┐
│ Cargar datos    │
│ del niño        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ¿Hay itinerario │ ───SI──▶ Usar datos prospectivos
│ con ≥2 eval?    │          (múltiples evaluaciones)
└────────┬────────┘
         │
         NO
         │
         ▼
┌─────────────────┐
│ ¿Hay ≥2 hitos   │ ───SI──▶ Construir puntos desde
│ con edades?     │          datos retrospectivos
└────────┬────────┘
         │
         NO
         │
         ▼
┌─────────────────┐
│ Mostrar mensaje │
│ de datos        │
│ insuficientes   │
└─────────────────┘
```

### Componentes Actualizados:

1. **`AnalisisAceleracion.jsx`**
   - Función `cargarDatos()`: Intenta prospectivos, luego retrospectivos
   - Función `construirDatosRetrospectivos()`: Construye puntos desde hitos
   - Función `calcularAceleracionesDesdePuntos()`: Calcula métricas
   - Indicador visual del tipo de datos

2. **`ClasificacionTrayectorias.jsx`**
   - Mismo patrón que AnalisisAceleracion
   - Clasificación funciona con ambos tipos
   - Indicador visual del tipo de datos

---

## 📈 Casos de Uso

### Caso 1: Primera Consulta con Historia Completa

**Contexto**: 
- Niño de 24 meses en primera consulta
- Padres proporcionan historia de desarrollo

**Flujo**:
1. Registrar hitos históricos con edades de logro
2. Sistema construye automáticamente puntos retrospectivos
3. Análisis matemático y clasificación disponibles inmediatamente
4. Ver: "📚 Datos longitudinales retrospectivos"

**Beneficio**: Análisis completo desde primera visita

---

### Caso 2: Seguimiento Longitudinal Activo

**Contexto**:
- Niño con sospecha de retraso en seguimiento
- Evaluaciones cada 3 meses

**Flujo**:
1. Evaluación 1 (12m): Registro de estado actual
2. Evaluación 2 (15m): Segundo punto de datos
3. Sistema detecta evaluaciones prospectivas
4. Ver: "📊 Datos prospectivos"
5. Análisis de velocidad disponible
6. Evaluación 3 (18m): Tercer punto
7. Análisis de aceleración y clasificación disponibles

**Beneficio**: Seguimiento preciso de evolución en tiempo real

---

### Caso 3: Datos Mixtos

**Contexto**:
- Primera consulta con historia (datos retrospectivos)
- Luego seguimiento prospectivo

**Flujo**:
1. Primera visita: Registro histórico → Análisis retrospectivo
2. Seguimiento: Evaluaciones prospectivas → Sistema cambia automáticamente
3. Prioridad a datos prospectivos cuando disponibles
4. Indicador se actualiza automáticamente

**Beneficio**: Transición fluida entre tipos de datos

---

## 🎨 Ventajas del Sistema Dual

### Para el Clínico:

1. **Flexibilidad**: Adapta el análisis al tipo de datos disponible
2. **Inmediatez**: Puede obtener análisis desde primera consulta
3. **Precisión**: Prioriza datos prospectivos cuando existen
4. **Transparencia**: Indicadores claros del tipo de datos usado

### Para la Investigación:

1. **Aprovechamiento de datos**: No se descartan datos retrospectivos valiosos
2. **Comparabilidad**: Mismas métricas para ambos tipos
3. **Validación**: Permite comparar retrospectivos vs prospectivos
4. **Versatilidad**: Aplicable a diferentes diseños de estudio

### Para la Práctica Clínica:

1. **Atención primaria**: Útil con consultas espaciadas
2. **Especializada**: Permite seguimiento intensivo
3. **Combinación**: Aprovecha ambos enfoques
4. **Eficiencia**: Maximiza uso de información disponible

---

## 📊 Comparación de Tipos

| Aspecto | Retrospectivo 📚 | Prospectivo 📊 |
|---------|------------------|----------------|
| **Fuente** | Historia reportada | Observación directa |
| **Precisión** | Moderada (memoria) | Alta (observación) |
| **Inmediatez** | ✅ Inmediato | ⏳ Requiere tiempo |
| **Costo** | 💰 Bajo | 💰💰 Moderado-Alto |
| **Sesgo** | ⚠️ Sesgo de recuerdo | ✅ Objetivo |
| **Utilidad inicial** | ✅✅✅ Excelente | ⏳ Limitada |
| **Seguimiento** | ⚠️ Limitado | ✅✅✅ Excelente |
| **Intervenciones** | ⚠️ Difícil evaluar | ✅✅✅ Ideal |

---

## 🔍 Validación

### Heurísticas para Detectar Tipo:

1. **Prospectivo si**:
   - Hay endpoint de itinerario con múltiples evaluaciones
   - Puntos espaciados > 1 mes entre sí

2. **Retrospectivo si**:
   - Múltiples hitos con edades muy cercanas (< 1 mes)
   - Registro tipo_dato = 'longitudinal'
   - Solo datos de hitos_conseguidos disponibles

### Señales de Calidad:

**Retrospectivos**:
- ✅ Consistencia temporal (hitos en orden esperado)
- ⚠️ Hitos agrupados (posible sesgo de redondeo)
- ⚠️ Edades "redondas" (3m, 6m, 12m → menos preciso)

**Prospectivos**:
- ✅ Intervalos regulares entre evaluaciones
- ✅ Incremento acumulativo de hitos
- ✅ Fechas de registro documentadas

---

## 🚧 Consideraciones Especiales

### Calidad de Datos Retrospectivos:

1. **Validación con hitos "ancla"**:
   - Hitos muy visibles (primeros pasos, primeras palabras)
   - Más fáciles de recordar con precisión

2. **Complementar con documentación**:
   - Fotos con fecha
   - Registros de salud previos
   - Diarios de desarrollo

3. **Educación a familias**:
   - Explicar importancia de precisión
   - Usar "ventanas" si no recuerdan exacto
   - Aceptar incertidumbre ("entre 8-10 meses")

### Transición entre Tipos:

- Sistema prioriza datos prospectivos cuando ambos existen
- Mantiene históricos para comparación
- Permite análisis temporal: antes y después de comenzar seguimiento

---

## 📚 Referencias

Esta implementación se basa en:

1. **Annaz et al. (2008)**: Tipos de estudios longitudinales
   - Longitudinales puros
   - Transversales acelerados
   - Longitudinales acelerados (cohort-sequential)

2. **Thomas et al. (2009)**: Análisis de trayectorias
   - Mismo marco teórico aplicable a ambos tipos

3. **Lajiness-O'Neill et al. (2018)**: PediaTrac™
   - Sistema validado que usa datos prospectivos
   - Pero nuestro enfoque añade flexibilidad retrospectiva

---

## ✅ Estado de Implementación

- [x] Utilidades para manejo dual de datos
- [x] AnalisisAceleracion con soporte dual
- [x] ClasificacionTrayectorias con soporte dual
- [x] Indicadores visuales de tipo de datos
- [x] Detección automática de tipo
- [x] Priorización de datos prospectivos
- [x] Construcción de puntos retrospectivos
- [x] Documentación completa
- [ ] Tests unitarios para ambos tipos
- [ ] Validación clínica comparativa

---

## 🎯 Conclusión

El soporte dual de datos retrospectivos y prospectivos hace que la herramienta sea **versátil y práctica** para diferentes contextos clínicos:

- **Atención primaria**: Análisis inmediato con datos históricos
- **Seguimiento especializado**: Precisión con datos prospectivos
- **Investigación**: Flexibilidad metodológica
- **Práctica real**: Adaptación a recursos disponibles

**La herramienta ahora maximiza el valor de cualquier tipo de información sobre el desarrollo infantil disponible.** 🌟

---

**Versión**: 2.1 - Soporte de Datos Duales  
**Fecha**: Noviembre 2024  
**Estado**: ✅ IMPLEMENTADO
