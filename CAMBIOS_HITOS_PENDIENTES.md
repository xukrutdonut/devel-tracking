# Cambios en Hitos Pendientes de Evaluación

## Resumen del Cambio

Se ha modificado la lógica de filtrado de "Hitos Pendientes de Evaluación" para que muestre **todos los hitos cuya edad esperada sea menor o igual a la edad actual del niño**, en lugar de solo mostrar aquellos en un rango estrecho de ±2 meses.

## Comportamiento Anterior ❌

**Filtro previo:** Mostraba solo hitos en un rango de ±2 meses desde la edad mínima esperada del hito.

```javascript
// ANTES: Filtrado restrictivo
const rangoInferior = edadMinima - 2;
const rangoSuperior = edadMinima + 2;
return edadParaEvaluacion >= rangoInferior && edadParaEvaluacion <= rangoSuperior;
```

**Problema:** Muchos hitos que deberían haber sido evaluados no aparecían en la lista, especialmente en niños con evaluaciones poco frecuentes o con retrasos en el desarrollo.

## Comportamiento Actual ✅

**Nuevo filtro:** Muestra **todos** los hitos con edad esperada ≤ edad actual del niño (que no hayan sido evaluados ya).

```javascript
// AHORA: Muestra todos los hitos que deberían haberse alcanzado
return hito.edad_media_meses <= edadParaEvaluacion;
```

### Criterios de Inclusión

Un hito aparece en "Pendientes de Evaluación" si cumple **todos** estos criterios:

1. ✅ Su edad media esperada es **menor o igual** a la edad actual del niño
2. ✅ **NO** ha sido marcado como "conseguido"
3. ✅ **NO** ha sido marcado como "no alcanzado"
4. ✅ Coincide con el filtro de dominio (si hay uno seleccionado)

### Orden de Presentación

Los hitos pendientes ahora se muestran **ordenados por edad media ascendente**, mostrando primero los hitos más tempranos y luego los más tardíos. Esto facilita una evaluación sistemática del desarrollo.

## Ejemplo Práctico

### Caso: Niño de 24 meses

**Antes (filtro restrictivo):**
```
Hitos mostrados: Solo aquellos entre ~20-24 meses
- Cantidad limitada: ~10-15 hitos
- Muchos hitos tempranos no aparecían
```

**Ahora (filtro completo):**
```
Hitos mostrados: Todos los de 0-24 meses no evaluados
- Cantidad completa: Todos los pendientes (puede ser 50+)
- Incluye hitos de todas las etapas anteriores
- Ordenados cronológicamente desde el nacimiento
```

## Ventajas del Nuevo Sistema

### 1. Evaluación Completa
Permite identificar todos los hitos que el niño debería haber alcanzado, detectando posibles lagunas en la evaluación.

### 2. Detección de Retrasos
Si un niño de 24 meses no ha alcanzado hitos de 12 meses, estos aparecerán claramente en la lista.

### 3. Recuperación de Evaluaciones
Facilita completar evaluaciones que quedaron incompletas en visitas anteriores.

### 4. Orden Cronológico
El ordenamiento por edad ayuda a evaluar sistemáticamente desde los hitos más tempranos.

### 5. Flexibilidad
Útil tanto para evaluaciones iniciales completas como para seguimientos puntuales.

## Uso Recomendado

### Para Evaluación Inicial Completa

1. Acceder a "Hitos del Desarrollo" para el niño
2. La lista mostrará TODOS los hitos pendientes hasta la edad actual
3. Evaluar sistemáticamente de arriba hacia abajo (orden cronológico)
4. Marcar cada hito como:
   - ✓ **Conseguido** (indicar edad de logro)
   - ✗ **No alcanzado** (para revisión posterior)

### Para Seguimiento Regular

1. Los hitos nuevos (recién alcanzados por edad) aparecerán al final
2. Los hitos no evaluados en visitas anteriores permanecen visibles
3. Se pueden completar evaluaciones pendientes en cualquier momento

### Para Detección de Retrasos

1. La lista completa permite ver hitos de etapas anteriores no alcanzados
2. Facilita identificar patrones de retraso en dominios específicos
3. Ayuda a planificar intervenciones específicas

## Estadísticas Actualizadas

La tarjeta de estadísticas ahora muestra:
```
┌─────────────────────────────────┐
│  XX  Pendientes de evaluación   │
└─────────────────────────────────┘
```

Esta cifra incluye **todos** los hitos con edad ≤ edad actual que no han sido evaluados.

## Mensaje Informativo

Se actualizó el mensaje informativo para reflejar el nuevo comportamiento:

```
ℹ️ Hitos pendientes de evaluación: Se muestran todos los hitos cuya edad 
esperada es menor o igual a la edad actual del niño (XX meses). Estos son 
los hitos que ya deberían haber sido alcanzados o estar en proceso de desarrollo.
```

Para niños pretérmino, se usa la edad corregida y se indica explícitamente.

## Consideraciones Especiales

### Edad Corregida para Prematuros

El sistema automáticamente usa la **edad corregida** para niños prematuros (<37 semanas de gestación) al filtrar los hitos, asegurando una evaluación apropiada según su desarrollo real.

### Gestión de Listas Largas

Si la lista de hitos pendientes es muy larga (por ejemplo, en una primera evaluación de un niño mayor), se recomienda:

1. **Usar filtros por dominio** para evaluar sistemáticamente un área a la vez
2. **Priorizar hitos críticos** según la edad actual
3. **Dividir la evaluación** en múltiples sesiones si es necesario

### Hitos "No Alcanzados"

Los hitos marcados como "no alcanzados" se mueven a una sección separada al final de la página, permitiendo:
- Revisarlos posteriormente
- Marcarlos como conseguidos cuando sea apropiado
- Mantener un registro de señales de alarma potenciales

## Archivos Modificados

**Archivo:** `src/components/HitosRegistro.jsx`

**Cambios principales:**
1. Línea 162-172: Simplificación de `esHitoRelevante()` para incluir todos los hitos ≤ edad actual
2. Línea 194: Añadido ordenamiento por edad media ascendente
3. Línea 265: Actualización del mensaje informativo
4. Línea 249: Cambio de etiqueta a "Pendientes de evaluación"

## Pruebas Recomendadas

1. ✅ Verificar que niño de 24 meses muestra todos los hitos de 0-24 meses
2. ✅ Confirmar que hitos conseguidos no aparecen en pendientes
3. ✅ Verificar que hitos no alcanzados aparecen en sección separada
4. ✅ Comprobar ordenamiento cronológico (edad media ascendente)
5. ✅ Validar filtros por dominio
6. ✅ Confirmar uso de edad corregida en prematuros

## Compatibilidad

- ✅ Compatible con todas las funcionalidades existentes
- ✅ No afecta cálculos de gráficas
- ✅ Mantiene sistema de edad corregida para prematuros
- ✅ Conserva filtros por dominio y fuente normativa

## Próximos Pasos Sugeridos

1. **Paginación:** Considerar añadir paginación si las listas son muy largas
2. **Búsqueda:** Implementar búsqueda de hitos por nombre/descripción
3. **Priorización:** Añadir indicador de hitos críticos para la edad actual
4. **Resumen visual:** Gráfico de progreso por rango de edad
