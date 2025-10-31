# Modos de Evaluación de Hitos del Desarrollo

## Descripción General

El sistema de seguimiento del desarrollo infantil ahora incluye dos modalidades distintas de evaluación de hitos, diseñadas para adaptarse a diferentes escenarios clínicos y necesidades de documentación:

1. **Evaluación Puntual** (modo por defecto)
2. **Evaluación Longitudinal** (retrospectiva)

Ambos modos son **totalmente compatibles y combinables**, permitiendo que diferentes evaluadores aporten información complementaria sobre el mismo niño.

---

## 1. Modo de Evaluación Puntual

### Descripción
La evaluación puntual está diseñada para valoraciones en un momento específico del tiempo. Es ideal cuando un profesional o cuidador evalúa al niño en una fecha concreta y determina qué hitos ha conseguido o no en ese momento.

### Características Principales

#### Selección de Fecha de Evaluación
- Permite seleccionar la fecha específica en que se realiza la evaluación
- Muestra automáticamente la edad del niño en esa fecha
- Por defecto usa la fecha actual, pero se puede ajustar a evaluaciones anteriores

#### Presentación de Hitos
- **Rango inicial**: Muestra hitos esperables en ±2 meses alrededor de la edad de evaluación
- Ejemplo: Si el niño tiene 12 meses, muestra hitos de 10-14 meses

#### Registro de Hitos
- **Conseguido**: Registra el hito como conseguido a la edad de evaluación
  - No requiere introducir manualmente la edad específica
  - La edad se registra automáticamente según la fecha de evaluación
- **No alcanzado**: Marca el hito como no conseguido en esa evaluación
  - Se guarda para seguimiento posterior
  - Permite revisión en futuras evaluaciones

#### Expansión Automática del Rango
Cuando todos los hitos del rango actual han sido evaluados y hay hitos marcados como "no alcanzados":
- **El sistema expande automáticamente** el rango 2 meses adicionales hacia atrás
- No requiere intervención manual del evaluador
- El proceso continúa automáticamente hasta:
  - Identificar el 100% de hitos conseguidos a una edad determinada, o
  - Alcanzar el límite de expansión (24 meses hacia atrás)
- Se muestra un indicador visual cuando se está expandiendo el rango
- Esto permite evaluar sistemáticamente el nivel basal de desarrollo en niños con posible retraso

#### Ejemplo de Uso
```
Evaluación de María (18 meses):
1. Fecha evaluación: 15/03/2024
2. Edad automática: 18 meses
3. Hitos mostrados inicialmente: 16-20 meses
4. Evaluador marca: 
   - "Camina solo" → ✓ Conseguido (se registra a los 18 meses)
   - "Sube escaleras" → ✗ No alcanzado
5. Al evaluar todos los hitos del rango:
   → Sistema detecta hitos "no alcanzados"
   → Expande automáticamente a 14-20 meses
6. Evaluador continúa evaluando los nuevos hitos
7. Proceso se repite automáticamente hasta encontrar base de desarrollo
```

### Ventajas
- Rápido para evaluaciones clínicas puntuales
- No requiere recordar edades específicas de consecución
- Ideal para cribado sistemático
- Permite identificar nivel basal de desarrollo

---

## 2. Modo de Evaluación Longitudinal

### Descripción
La evaluación longitudinal es un método retrospectivo donde padres, cuidadores o profesionales que conocen la historia del niño pueden registrar hitos con la edad específica en que fueron conseguidos.

### Características Principales

#### Presentación Completa de Hitos
- Muestra **todos los hitos** esperables desde el nacimiento hasta la edad actual + 2 meses
- No hay limitación de rango inicial
- Vista completa del desarrollo esperado

#### Registro con Edad Específica
- **Conseguido**: Al marcar un hito, el sistema solicita la edad específica de consecución
  - Ejemplo: "¿A qué edad (en meses) se consiguió este hito?"
  - El evaluador introduce la edad precisa (ej: 9.5 meses)
- **No alcanzado**: Marca el hito como no conseguido a la edad actual

#### Validación Flexible
- Permite registrar hitos en cualquier edad dentro del rango de desarrollo
- Advierte si la edad registrada es mayor que la edad actual del niño
- No bloquea el registro, solo informa

#### Ejemplo de Uso
```
Evaluación retrospectiva de Pedro (24 meses):
1. Modo: Longitudinal
2. Hitos mostrados: Todos desde 0 a 26 meses
3. Madre recuerda y registra:
   - "Sonrisa social" → ✓ a los 2 meses
   - "Sedestación sin apoyo" → ✓ a los 7 meses
   - "Primeros pasos" → ✓ a los 13 meses
   - "Primeras palabras" → ✓ a los 11 meses
4. Hitos recientes no recordados → ✗ No alcanzado
```

### Ventajas
- Captura información histórica detallada
- Permite análisis de trayectorias de desarrollo
- Ideal cuando hay información precisa disponible
- Útil para segunda opinión con información complementaria

---

## 3. Combinación de Modos

### Escenarios de Uso Combinado

#### Escenario 1: Evaluación Inicial Puntual + Seguimiento Longitudinal
```
1. Primera visita (pediatra):
   - Modo puntual
   - Evaluación rápida del estado actual
   - Identifica hitos conseguidos y pendientes

2. Segunda visita (misma madre):
   - Modo longitudinal  
   - Aporta información retrospectiva detallada
   - Completa edades específicas de hitos previamente marcados
```

#### Escenario 2: Información Longitudinal + Evaluaciones Puntuales de Seguimiento
```
1. Primera evaluación (madre con información histórica):
   - Modo longitudinal
   - Registra hitos pasados con edades específicas
   
2. Seguimientos posteriores (profesional):
   - Modo puntual
   - Evaluaciones periódicas del progreso
   - Añade nuevos hitos a medida que se alcanzan
```

#### Escenario 3: Múltiples Evaluadores con Información Complementaria
```
1. Padre:
   - Modo puntual (evaluación reciente)
   - Marca hitos observados actualmente

2. Madre:
   - Modo longitudinal
   - Añade información histórica más detallada
   - Completa edades específicas

3. Terapeuta:
   - Modo puntual
   - Evaluaciones especializadas periódicas
```

### Persistencia de Datos
- Todos los datos registrados se mantienen independientemente del modo usado
- Cambiar de modo no afecta datos previamente registrados
- Los hitos ya conseguidos se muestran con su información completa
- Las evaluaciones de "no alcanzado" se mantienen para seguimiento

---

## 4. Consideraciones Clínicas

### Corrección de Edad Prematuridad
- **Automática** en ambos modos
- Si el niño es pretérmino (< 37 semanas gestación):
  - Modo puntual: Usa edad corregida para el rango de hitos
  - Modo longitudinal: Usa edad corregida como referencia
- Se indica claramente cuando se usa edad corregida

### Validaciones y Advertencias
- **Edad mayor que actual**: Advertencia en ambos modos
- **Hitos fuera de rango**: Permitidos pero notificados
- **Fecha de evaluación futura**: Bloqueado (solo fechas pasadas o actuales)

### Notas sobre Precisión
- **Modo puntual**: Menor precisión en edad exacta, pero más práctico
- **Modo longitudinal**: Mayor precisión cuando hay buena memoria/documentación
- **Recomendación**: Usar modo longitudinal cuando hay registros confiables

---

## 5. Interfaz de Usuario

### Selector de Modo
Ubicado en la parte superior de la pantalla de registro:
```
┌─────────────────────────────────────────────────┐
│ Modo de evaluación:                             │
│ [Evaluación Puntual (momento específico) ▼]     │
└─────────────────────────────────────────────────┘
```

### En Modo Puntual
```
┌─────────────────────────────────────────────────┐
│ Fecha de evaluación: [15/03/2024] Edad: 18 meses│
└─────────────────────────────────────────────────┘

Hitos mostrados: 16-20 meses

[Hito 1] ─── [✓ Conseguido] [✗ No alcanzado]
[Hito 2] ─── [✓ Conseguido] [✗ No alcanzado]

✅ Todos los hitos evaluados
[Ver hitos de edades anteriores (−2 meses)]
```

### En Modo Longitudinal
```
┌─────────────────────────────────────────────────┐
│ Se muestran todos los hitos hasta 26 meses      │
└─────────────────────────────────────────────────┘

[Hito 1] Edad: 6 meses ── [✓ Conseguido] [✗ No alcanzado]
[Hito 2] Edad: 8 meses ── [✓ Conseguido] [✗ No alcanzado]
[Hito 3] Edad: 10 meses ─ [✓ Conseguido] [✗ No alcanzado]
...

(Al hacer clic en Conseguido, pregunta la edad específica)
```

---

## 6. Estadísticas y Visualización

Independientemente del modo usado:
- **Gráficas de desarrollo**: Incluyen todos los hitos con su edad de consecución
- **Z-scores**: Calculados según edad específica registrada
- **Líneas de tendencia**: Integran datos de ambos modos
- **Hitos pendientes**: Actualizados en tiempo real

---

## 7. Mejores Prácticas

### Para Profesionales de la Salud
1. **Primera evaluación**: Usar modo puntual para cribado rápido
2. **Seguimientos**: Continuar en modo puntual para consistencia
3. **Información adicional**: Cambiar a longitudinal si hay datos históricos confiables

### Para Padres/Cuidadores
1. **Con registros previos**: Usar modo longitudinal desde el inicio
2. **Sin información precisa**: Usar modo puntual
3. **Actualización periódica**: Modo puntual cada X semanas/meses

### Para Equipos Multidisciplinares
1. **Coordinador principal**: Establece modo base
2. **Otros evaluadores**: Complementan con información adicional
3. **Documentación**: Notar qué modo se usó en cada evaluación

---

## 8. Preguntas Frecuentes

**P: ¿Puedo cambiar de modo en medio de una evaluación?**
R: Sí, cambiar de modo no afecta los datos ya registrados.

**P: ¿Qué pasa si registro un hito en modo puntual y luego obtengo la edad exacta?**
R: Puedes eliminar el registro puntual y crear uno nuevo en modo longitudinal con la edad exacta.

**P: ¿Hay un modo "mejor" que otro?**
R: Depende del contexto. Puntual es más práctico y rápido; longitudinal es más preciso pero requiere información confiable.

**P: ¿Los hitos marcados como "no alcanzado" desaparecen?**
R: No, se mantienen en una sección separada para revisión posterior.

**P: ¿Puedo evaluar hitos pasados en modo puntual?**
R: Sí, cambia la fecha de evaluación a la fecha pasada deseada.

**P: ¿El sistema recomienda cuándo expandir el rango en modo puntual?**
R: Sí, cuando todos los hitos visibles están evaluados, aparece un botón para expandir.

---

## 9. Implementación Técnica

### Campos de Base de Datos
- `edad_conseguido_meses`: Edad específica de consecución (decimal)
- `fecha_registro`: Fecha en que se registró el dato
- `edad_evaluacion_meses`: Edad en el momento de evaluación (para "no alcanzados")

### Cálculos Automáticos
- Edad del niño en fecha de evaluación
- Edad corregida para prematuros
- Rangos de hitos relevantes según modo
- Z-scores para análisis estadístico

---

## 10. Conclusión

El sistema dual de evaluación proporciona la flexibilidad necesaria para adaptarse a diferentes contextos clínicos y tipos de información disponible, manteniendo siempre la integridad de los datos y la facilidad de uso tanto para profesionales como para padres y cuidadores.
