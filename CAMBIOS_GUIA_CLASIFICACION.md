# Cambios: Pestaña de Clasificación Convertida en Guía Educativa

## Fecha
5 de noviembre de 2024

## Resumen del Cambio

La pestaña "Clasificación de Trayectorias" ha sido transformada de un sistema de **clasificación automática** a una **guía educativa e informativa** con gráficas teóricas similares a las del artículo de referencia de Thomas et al. (2009).

## Razón del Cambio

El sistema de clasificación automática estaba clasificando incorrectamente algunas trayectorias. En lugar de intentar afinar algoritmos complejos, se optó por proporcionar una **herramienta educativa** que permite al clínico clasificar manualmente basándose en criterios visuales y su experiencia profesional.

## Nuevo Componente: GuiaClasificacionTrayectorias

### Características Principales

1. **Gráficas teóricas interactivas** para los 7 tipos de trayectorias
2. **Selector dropdown** para explorar cada tipo
3. **Criterios de clasificación** explícitos para cada tipo
4. **Implicaciones clínicas** detalladas
5. **Tabla comparativa** de todos los tipos
6. **Referencias** al artículo original

### Los 7 Tipos Incluidos

1. **Delayed Onset** - Inicio retrasado (Figura 4a)
2. **Slowed Rate** - Velocidad reducida (Figura 4b)
3. **Delayed + Slowed** - Ambos (Figura 4c)
4. **Nonlinear** - Trayectoria curva (Figura 4d)
5. **Premature Asymptote** - Meseta prematura (Figura 4e)
6. **Zero Trajectory** - Sin cambio
7. **No Systematic Relationship** - Patrón errático

## Archivos Creados/Modificados

- **Nuevo:** `src/components/GuiaClasificacionTrayectorias.jsx` (500+ líneas)
- **Modificado:** `src/App.jsx` (cambio de import y navegación)
- **Conservado:** `src/components/ClasificacionTrayectorias.jsx` (no se usa actualmente)

## Ventajas

✅ **Educativo:** Enseña visualmente los conceptos  
✅ **Preciso:** El clínico usa su criterio experto  
✅ **Flexible:** Se adapta a casos complejos  
✅ **Siempre disponible:** No requiere niño seleccionado  
✅ **Basado en evidencia:** Fiel a Thomas et al. (2009)

## Cómo Usar

1. Navegar a **"📚 Guía: Tipología Trayectorias"**
2. Seleccionar un tipo de trayectoria del dropdown
3. Revisar gráfica teórica, criterios e implicaciones
4. Comparar visualmente con los datos del niño
5. Clasificar manualmente basándose en la guía
