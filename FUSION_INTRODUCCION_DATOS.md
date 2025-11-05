# Fusión de Pestañas: Introducción de Datos

## Fecha
Noviembre 2024

## Resumen

Se han fusionado las pestañas "Hitos del Desarrollo" y "Señales de Alarma" en una única pestaña llamada "Introducción de Datos", y se ha añadido una tercera subpestaña para el registro de puntuaciones de escalas estandarizadas de desarrollo.

## Cambios Realizados

### 1. Nuevo Componente Principal: `IntroduccionDatos.jsx`

**Ubicación**: `src/components/IntroduccionDatos.jsx`

Este componente actúa como contenedor para las tres subpestañas:
- ✅ Hitos del Desarrollo
- 🚩 Señales de Alarma
- 📋 Escalas de Desarrollo

**Características**:
- Navegación mediante subpestañas con indicadores visuales
- Transiciones suaves entre subpestañas
- Diseño responsive para móviles

### 2. Nuevo Componente: `EscalasRegistro.jsx`

**Ubicación**: `src/components/EscalasRegistro.jsx`

Componente completo para el registro de evaluaciones con escalas estandarizadas.

#### Escalas Implementadas

1. **Battelle (Inventario de Desarrollo)**
   - Rango: 0-95 meses
   - Puntuación: Media=100, DE=15
   - Dominios: Personal/Social, Adaptativa, Motora, Comunicación, Cognitiva, Total

2. **Brunet-Lézine Revisado**
   - Rango: 0-30 meses
   - Puntuación: Media=100, DE=15
   - Dominios: Control Postural, Coordinación Óculo-Manual, Lenguaje, Relaciones Sociales, Total

3. **Bayley-III**
   - Rango: 1-42 meses
   - Puntuación: Media=100, DE=15
   - Dominios: Cognitiva, Lenguaje Receptivo/Expresivo/Total, Motora Fina/Gruesa

4. **McCarthy (MSCA)**
   - Rango: 30-102 meses
   - Puntuación: IGC Media=100, DE=16
   - Dominios: Verbal, Perceptivo-Manipulativa, Numérica, Memoria, Motora, IGC

5. **WPPSI-IV**
   - Rango: 30-90 meses
   - Puntuación: CI Media=100, DE=15
   - Dominios: Comprensión Verbal, Visoespacial, Razonamiento Fluido, Memoria de Trabajo, Velocidad de Procesamiento, CI Total

6. **Merrill-Palmer-R**
   - Rango: 1-78 meses
   - Puntuación: Media=100, DE=15
   - Dominios: Cognitiva, Lenguaje y Comunicación, Motora, Socio-Emocional, Conducta Adaptativa, Total

#### Funcionalidades

**Registro de Evaluaciones**:
- Selección de escala con información detallada
- Fecha de evaluación con cálculo automático de edad
- Formulario dinámico según dominios de cada escala
- Validación de rangos de puntuación
- Cálculo automático de Z-scores
- Interpretación visual con colores y emojis
- Campos opcionales: profesional evaluador, centro, notas

**Visualización de Resultados**:
- Lista de evaluaciones registradas ordenadas por fecha
- Tarjetas con información completa de cada evaluación
- Puntuaciones con interpretación por colores según Z-score
- Opciones de eliminación con confirmación

**Interpretación de Z-scores**:
- Z < -3: ⚠️⚠️⚠️ Muy significativo (rojo oscuro)
- -3 < Z < -2: ⚠️⚠️ Significativamente por debajo (rojo)
- -2 < Z < -1: ⚠️ Por debajo del promedio (naranja)
- -1 < Z < 1: ✅ Dentro del promedio (verde)
- 1 < Z < 2: 🌟 Por encima del promedio (azul)
- 2 < Z < 3: 🌟🌟 Significativamente por encima (púrpura)
- Z > 3: 🌟🌟🌟 Muy por encima (púrpura oscuro)

### 3. Actualización de `App.jsx`

**Cambios en la navegación**:
- Eliminadas pestañas separadas "Hitos del Desarrollo" y "Señales de Alarma"
- Añadida pestaña única "Introducción de Datos" (📝)
- La nueva pestaña solo aparece cuando hay un niño seleccionado

**Importaciones actualizadas**:
```javascript
import IntroduccionDatos from './components/IntroduccionDatos';
// Eliminadas: HitosRegistro, RedFlagsRegistro (ahora son subpestañas)
```

### 4. Base de Datos

**Nueva tabla**: `escalas_evaluaciones`

```sql
CREATE TABLE IF NOT EXISTS escalas_evaluaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nino_id INTEGER NOT NULL,
  escala TEXT NOT NULL,
  fecha_evaluacion DATE NOT NULL,
  edad_evaluacion_meses REAL NOT NULL,
  puntuaciones TEXT NOT NULL,  -- JSON con puntuaciones y z-scores
  profesional_evaluador TEXT,
  centro_evaluacion TEXT,
  notas TEXT,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nino_id) REFERENCES ninos(id)
)
```

**Campo `puntuaciones`**: JSON con estructura:
```json
{
  "dominio_id": {
    "puntuacion": 85,
    "z_score": -1.0
  },
  ...
}
```

### 5. API REST

**Nuevas rutas**:

#### GET `/api/escalas-evaluaciones/:ninoId`
- Obtiene todas las evaluaciones de escalas de un niño
- Requiere autenticación
- Verifica acceso del usuario al niño
- Retorna array de evaluaciones ordenadas por fecha (más recientes primero)

#### POST `/api/escalas-evaluaciones`
- Crea una nueva evaluación con escala
- Requiere autenticación
- Campos requeridos: nino_id, escala, fecha_evaluacion, edad_evaluacion_meses, puntuaciones
- Campos opcionales: profesional_evaluador, centro_evaluacion, notas
- Valida acceso del usuario al niño

#### DELETE `/api/escalas-evaluaciones/:id`
- Elimina una evaluación
- Requiere autenticación
- Verifica que el usuario tenga acceso al niño de la evaluación

### 6. Archivos CSS

**Nuevos archivos**:
- `src/components/IntroduccionDatos.css`: Estilos para navegación de subpestañas
- `src/components/EscalasRegistro.css`: Estilos completos para formularios y visualización de escalas

**Características de diseño**:
- Gradientes modernos
- Tarjetas con sombras y efectos hover
- Diseño responsive con breakpoints para móviles
- Colores semánticos para interpretación de resultados
- Animaciones suaves (fadeIn, transformaciones)

## Estructura de Archivos

```
src/
  components/
    IntroduccionDatos.jsx      ← Nuevo contenedor principal
    IntroduccionDatos.css      ← Nuevo
    EscalasRegistro.jsx        ← Nuevo componente de escalas
    EscalasRegistro.css        ← Nuevo
    HitosRegistro.jsx          ← Sin cambios (ahora subpestaña)
    RedFlagsRegistro.jsx       ← Sin cambios (ahora subpestaña)
  App.jsx                      ← Actualizado

server/
  database.js                  ← Añadida tabla escalas_evaluaciones
  server.js                    ← Añadidas 3 rutas API

docs/
  FUNDAMENTO_CIENTIFICO.md     ← Nuevo (consolidado)
```

## Flujo de Uso

1. Usuario selecciona un niño de la lista
2. Click en "📝 Introducción de Datos"
3. Navegación por subpestañas:
   - **Hitos**: Registro tradicional de hitos alcanzados
   - **Señales de Alarma**: Registro de red flags observadas
   - **Escalas**: Nuevo formulario para puntuaciones estandarizadas

### Uso de Escalas

1. Click en "➕ Nueva Evaluación"
2. Seleccionar escala del dropdown
3. Sistema muestra:
   - Información de la escala (rango edad, puntuación tipificada)
   - Formulario dinámico con dominios específicos
4. Ingresar:
   - Fecha de evaluación
   - Puntuaciones por dominio (las no evaluadas se dejan en blanco)
   - Opcionalmente: evaluador, centro, notas
5. Sistema calcula y muestra Z-scores en tiempo real
6. Guardar evaluación

## Ventajas del Nuevo Sistema

### Usabilidad
- ✅ Menos pestañas en navegación principal (de 3 a 1)
- ✅ Agrupación lógica: toda la introducción de datos en un solo lugar
- ✅ Navegación más clara y organizada

### Funcionalidad
- ✅ Registro de evaluaciones formales de centros especializados
- ✅ Integración de datos de múltiples escalas
- ✅ Conversión automática a puntuaciones tipificadas (Z-scores)
- ✅ Interpretación visual inmediata
- ✅ Historial completo de evaluaciones

### Clínico
- ✅ Compatibilidad con informes de Atención Temprana
- ✅ Trazabilidad: quién, dónde, cuándo
- ✅ Comparabilidad entre evaluaciones
- ✅ Seguimiento longitudinal con datos estandarizados

### Técnico
- ✅ Estructura de datos flexible (JSON para puntuaciones)
- ✅ Fácil añadir nuevas escalas
- ✅ Validación automática de rangos
- ✅ Cálculos matemáticos precisos

## Próximos Pasos Sugeridos

### Integración con Gráficas
1. Visualizar puntuaciones de escalas en gráficas temporales
2. Comparar Z-scores de escalas con Z-scores de hitos
3. Identificar convergencias/divergencias entre evaluaciones

### Análisis Avanzado
1. Correlación entre puntuaciones de diferentes escalas
2. Detección de patrones de asincronía entre dominios
3. Alertas cuando Z-scores cambian significativamente

### Exportación
1. Incluir datos de escalas en informes PDF
2. Tablas comparativas entre evaluaciones
3. Gráficos de evolución de Z-scores

### Escalas Adicionales
Fácil añadir nuevas escalas al objeto `ESCALAS_DESARROLLO`:
- WPPSI-V (cuando se publique)
- WISC para mayores de 6 años
- Vineland para conducta adaptativa
- ADOS-2 para TEA
- Otras escalas específicas por dominio

## Validación y Testing

### Casos de Prueba

1. **Crear evaluación Battelle**:
   - Niño de 24 meses
   - Puntuaciones en rango normal (95-105)
   - Verificar Z-scores cercanos a 0

2. **Crear evaluación Bayley-III**:
   - Niño de 18 meses
   - Puntuaciones bajas en lenguaje (70)
   - Verificar Z-score ≈ -2, color rojo

3. **Evaluación parcial**:
   - McCarthy con solo algunos dominios
   - Verificar que acepta campos vacíos

4. **Validación de rangos**:
   - Intentar ingresar puntuación fuera de rango
   - Verificar mensaje de error

5. **Eliminación**:
   - Eliminar evaluación
   - Verificar confirmación y actualización de lista

### Compatibilidad
- ✅ Chrome/Edge (testeado)
- ✅ Firefox (testeado)
- ✅ Safari (pendiente)
- ✅ Móviles (diseño responsive)

## Notas de Implementación

### Cálculo de Z-score
```javascript
Z = (puntuacion - media) / desviación_estándar
```

Cada escala tiene su propia media y DE configurada en el objeto de definición.

### Almacenamiento
Las puntuaciones se guardan como JSON string, permitiendo:
- Estructura flexible
- Fácil extensión
- Búsquedas eficientes con JSON functions de SQLite

### Seguridad
- Todas las rutas requieren autenticación (verificarToken)
- Verificación de acceso al niño (verificarAccesoNino)
- Validación de datos en servidor

## Documentación de Usuario

### Para Profesionales

**¿Cuándo usar cada subpestaña?**

1. **Hitos del Desarrollo**: 
   - Evaluación informal durante consulta
   - Observación directa de habilidades
   - Registro continuo de adquisiciones

2. **Señales de Alarma**:
   - Identificación de red flags
   - Registro de comportamientos preocupantes
   - Seguimiento de síntomas

3. **Escalas de Desarrollo**:
   - Resultados de evaluaciones formales
   - Informes de centros especializados
   - Datos de seguimientos programados

**¿Qué escala usar?**
- 0-30 meses: Brunet-Lézine
- 1-42 meses: Bayley-III (gold standard)
- 0-95 meses: Battelle (versátil)
- 30-102 meses: McCarthy (preescolar/escolar)
- 30-90 meses: WPPSI-IV (CI preescolar)
- 1-78 meses: Merrill-Palmer-R (amplio)

## Conclusión

La fusión de las pestañas de introducción de datos y la adición del módulo de escalas estandarizadas representa una mejora significativa en la usabilidad y capacidad analítica del sistema. 

Los profesionales ahora pueden:
- Organizar mejor sus datos de entrada
- Integrar evaluaciones formales con observación clínica
- Realizar comparaciones estandarizadas
- Mantener trazabilidad completa de evaluaciones

El sistema está preparado para futuras integraciones con las gráficas y análisis estadísticos avanzados.

---

**Desarrollado para facilitar la integración de datos clínicos estandarizados en el seguimiento del neurodesarrollo infantil.**
