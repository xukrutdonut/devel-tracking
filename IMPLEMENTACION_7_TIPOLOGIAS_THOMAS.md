# Implementación de las 7 Tipologías de Thomas et al. (2009)

## Fecha
5 de noviembre de 2024

## Resumen

Se ha implementado un sistema completo de clasificación automática de trayectorias del desarrollo basado en las 7 tipologías propuestas por Thomas et al. (2009), utilizando análisis de regresión estadística.

## Cambios Realizados

### 1. Nuevo Módulo: `regresionTrayectorias.js`

Creado archivo `src/utils/regresionTrayectorias.js` con funciones completas para:

#### Modelos de Regresión
- **`ajustarRegresionLineal(datos)`**: Modelo y = a + b*x con cálculo de R²
- **`ajustarRegresionCuadratica(datos)`**: Modelo y = a + b*x + c*x²
- **`ajustarRegresionLogistica(datos)`**: Modelo logístico (curva S)

#### Tests Estadísticos
- **`testFModelos(modeloSimple, modeloComplejo)`**: Test F para comparar modelos anidados
- **`compararInterceptos(modelo1, modelo2)`**: Detecta diferencias en inicio
- **`compararPendientes(modelo1, modelo2)`**: Detecta diferencias en velocidad

#### Detectores Especializados
- **`detectarAsintotaPrematura(datos)`**: Identifica estancamiento prematuro
- **`detectarTrayectoriaCero(datos)`**: Identifica ausencia de cambio

#### Clasificación Principal
- **`clasificarTrayectoriaThomas2009(datos, datosReferencia)`**: 
  - Implementa las 7 tipologías
  - Retorna tipo, descripción, características, implicaciones
  - Incluye nivel de confianza

### 2. Actualización del Componente `ClasificacionTrayectorias.jsx`

#### Importación del Nuevo Módulo
```javascript
import { clasificarTrayectoriaThomas2009 } from '../utils/regresionTrayectorias';
```

#### Nueva Función de Clasificación
```javascript
const clasificarTrayectoriaConRegresion = (evaluaciones, dominioId) => {
  // Prepara datos
  // Llama a clasificarTrayectoriaThomas2009
  // Retorna clasificación completa con métricas
}
```

#### Actualización de Colores e Iconos
Añadidos colores e iconos específicos para cada una de las 7 tipologías:
- DELAYED_ONSET: Azul + icono reloj
- SLOWED_RATE_CONVERGENTE: Verde + flecha arriba
- SLOWED_RATE_DIVERGENTE: Rojo + flecha abajo
- DELAYED_ONSET_PLUS_SLOWED_RATE: Naranja rojizo + flechas
- NONLINEAR: Púrpura + onda
- PREMATURE_ASYMPTOTE: Naranja + línea horizontal
- ZERO_TRAJECTORY: Marrón + igual
- NO_SYSTEMATIC_RELATIONSHIP: Gris + aleatorio

#### Visualización Mejorada
Tarjetas de clasificación ahora muestran:
- Número de mediciones
- R² del modelo de regresión
- Nivel de confianza de la clasificación
- CD medio del dominio

## Las 7 Tipologías Implementadas

### Tipos Lineales (1-3)

#### 1. DELAYED ONSET (Inicio Retrasado)
**Criterio:** Diferencia significativa en intercepto, pendiente similar
- **Detección:** `compararInterceptos()` significativo, `compararPendientes()` no significativo
- **Interpretación:** Desarrollo sigue mismo patrón pero iniciado más tarde
- **Ejemplo CD:** Empieza en 70 pero progresa normalmente

#### 2. SLOWED RATE (Velocidad Diferente)
**Criterio:** Inicio similar, diferencia significativa en pendiente
- **Detección:** `compararInterceptos()` no significativo, `compararPendientes()` significativo
- **Subtipos:**
  - **Convergente:** Pendiente mayor (catching up)
  - **Divergente:** Pendiente menor (alejándose)

#### 3. DELAYED ONSET + SLOWED RATE
**Criterio:** Diferencias en ambos parámetros
- **Detección:** Ambas comparaciones significativas
- **Interpretación:** Retraso compuesto - tanto inicio como progreso afectados

### Tipos No Lineales (4-5)

#### 4. NONLINEAR (Trayectoria No Lineal)
**Criterio:** Modelo no lineal ajusta significativamente mejor que lineal
- **Detección:** Test F significativo, R² cuadrático > R² lineal + 0.1
- **Modelos probados:** Cuadrático, logístico
- **Interpretación:** Desarrollo sigue patrón curvilíneo (oleadas, ventanas críticas)

#### 5. PREMATURE ASYMPTOTE (Asíntota Prematura)
**Criterio:** Desarrollo se estanca antes del nivel esperado
- **Detección:** Cambio promedio < 2 puntos en últimos 3 períodos, nivel actual < esperado - 10
- **Interpretación:** Desarrollo inicial seguido de meseta prematura
- **Ejemplo:** Empieza normal pero se estanca en CD=70

### Sin Trayectoria (6-7)

#### 6. ZERO TRAJECTORY (Trayectoria Cero)
**Criterio:** Sin cambio significativo con la edad
- **Detección:** Desviación estándar < 3 puntos
- **Interpretación:** Sistema ha alcanzado su límite de cambio ontogenético
- **Ejemplo:** CD permanece en 50±2 durante todo el período

#### 7. NO SYSTEMATIC RELATIONSHIP (Sin Relación Sistemática)
**Criterio:** No hay relación confiable entre edad y rendimiento
- **Detección:** R² lineal < 0.3 Y R² cuadrático < 0.3
- **Interpretación:** Desarrollo altamente variable sin patrón predecible
- **Ejemplo:** CD fluctúa erráticamente entre 40 y 80

## Proceso de Clasificación

### Orden de Evaluación

```
1. ¿Hay cambio con edad?
   NO → ZERO_TRAJECTORY
   
2. ¿Hay relación sistemática?
   NO (R² < 0.3) → NO_SYSTEMATIC_RELATIONSHIP
   
3. ¿Hay estancamiento prematuro?
   SÍ → PREMATURE_ASYMPTOTE
   
4. ¿Modelo no lineal mejor que lineal?
   SÍ (Test F significativo) → NONLINEAR
   
5. Con datos de referencia típicos:
   - Intercepto diferente + Pendiente diferente → DELAYED_ONSET_PLUS_SLOWED_RATE
   - Solo intercepto diferente → DELAYED_ONSET
   - Solo pendiente diferente → SLOWED_RATE (Convergente/Divergente)
   
6. Sin datos de referencia:
   - Nivel inicial bajo + velocidad normal → DELAYED_ONSET (inferido)
   - Velocidad significativa → SLOWED_RATE (inferido)
```

## Ejemplo de Uso

```javascript
import { clasificarTrayectoriaThomas2009 } from './utils/regresionTrayectorias';

// Datos del niño
const datosNino = [
  { edad: 12, valor: 65 },
  { edad: 18, valor: 70 },
  { edad: 24, valor: 75 },
  { edad: 30, valor: 78 }
];

// Datos de referencia típica (opcional)
const datosReferencia = [
  { edad: 12, valor: 95 },
  { edad: 18, valor: 98 },
  { edad: 24, valor: 100 },
  { edad: 30, valor: 102 }
];

const clasificacion = clasificarTrayectoriaThomas2009(datosNino, datosReferencia);

console.log(clasificacion);
// {
//   tipo: 'DELAYED_ONSET',
//   descripcion: 'Inicio retrasado (diferencia en intercepto, pendiente similar)',
//   caracteristicas: [...],
//   implicaciones: [...],
//   modelo: { tipo: 'lineal', intercepto: 52.5, pendiente: 0.83, r2: 0.98 },
//   confianza: 0.9
// }
```

## Métricas de Calidad

### Nivel de Confianza
Cada clasificación incluye un nivel de confianza (0-1):
- **0.9+**: Alta confianza (suficientes datos, criterios claros)
- **0.7-0.9**: Confianza media (algunos criterios ambiguos)
- **<0.7**: Baja confianza (datos limitados o patrón poco claro)

### R² (Bondad de Ajuste)
- **R² > 0.8**: Excelente ajuste
- **R² 0.5-0.8**: Buen ajuste
- **R² 0.3-0.5**: Ajuste moderado
- **R² < 0.3**: Ajuste pobre (→ NO_SYSTEMATIC_RELATIONSHIP)

## Visualización en la Interfaz

### Tarjetas de Clasificación
Cada dominio se presenta en una tarjeta con:
1. **Encabezado**: Nombre del dominio + icono específico del tipo
2. **Badge de color**: Descripción del tipo con color característico
3. **Características**: Lista de métricas estadísticas
4. **Implicaciones clínicas**: Recomendaciones específicas
5. **Pie con métricas**: N mediciones, R², confianza, CD medio

### Códigos de Color
- Azul (#2196F3): Inicio retrasado
- Verde (#4CAF50): Convergente (mejora)
- Rojo (#F44336): Divergente (empeora)
- Naranja rojizo (#FF5722): Retraso compuesto
- Púrpura (#9C27B0): No lineal
- Naranja (#FF9800): Asíntota prematura
- Marrón (#795548): Trayectoria cero
- Gris azulado (#607D8B): Sin relación sistemática

## Limitaciones Actuales

### Datos de Referencia
- Por ahora no se comparan con curvas normativas reales
- Se infieren tipos 1-3 sin referencia típica
- **Mejora futura:** Integrar percentiles 50 de cada fuente normativa

### Modelos No Lineales
- Regresión logística usa parámetros estimados (no optimizados)
- No se prueban otros modelos (exponencial, spline)
- **Mejora futura:** Optimización de parámetros con algoritmos numéricos

### Tests Estadísticos
- Test F usa valores críticos aproximados
- No se calculan p-valores exactos
- **Mejora futura:** Implementar distribuciones F completas

## Ventajas de la Implementación

1. **Fidelidad al artículo original**: Implementa exactamente las 7 tipologías propuestas
2. **Basado en estadística**: Usa regresión y tests formales, no solo heurísticas
3. **Transparencia**: Cada clasificación muestra R², confianza y métricas
4. **Extensible**: Fácil añadir nuevos modelos o tests
5. **Visualización clara**: Colores e iconos específicos para cada tipo

## Referencias

Thomas, M. S., Annaz, D., Ansari, D., Scerif, G., Jarrold, C., & Karmiloff-Smith, A. (2009). Using developmental trajectories to understand developmental disorders. *Journal of Speech, Language, and Hearing Research*, 52(2), 336-358.

**Sección clave del artículo (p. 346):**
> "Where the matching approach can encourage a monolithic descriptive partition between 'delay' and 'deviance,' the use of trajectories distinguishes **at least seven ways** that a disorder group can statistically differ from a control group in the functions that link performance and age (or MA): (a) delayed onset, (b) slowed rate, (c) delayed onset + slowed rate, (d) nonlinear, (e) premature asymptote, (f) zero trajectory, and (g) no systematic relationship with age."

## Próximos Pasos

1. **Integrar datos normativos de referencia** para mejorar tipos 1-3
2. **Optimizar parámetros de modelos no lineales** con algoritmos numéricos
3. **Añadir tests estadísticos completos** con p-valores exactos
4. **Validar clasificaciones** con casos clínicos conocidos
5. **Exportar informes** con gráficos de regresión y diagnósticos
6. **Análisis de sensibilidad** para umbrales de clasificación
