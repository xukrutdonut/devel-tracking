# 📊 Sistema de Seguimiento del Neurodesarrollo Infantil (0-6 años)

Sistema completo para el seguimiento y evaluación del desarrollo neurológico en niños de 0 a 6 años, con base de datos normativa, registro de hitos, visualización gráfica con puntuación Z y detección de señales de alarma.

## 🎯 Características Principales

### 1. **Análisis Matemático Avanzado del Desarrollo** 🆕
- **Análisis mediante derivadas** basado en conceptos de [neuropediatoolkit.org](https://neuropediatoolkit.org/evaluacion-global-del-neurodesarrollo/)
- **Tres niveles de análisis**:
  - **Derivada 0ª (Posición)**: ¿Dónde está el niño? (CD, Z-scores)
  - **Derivada 1ª (Velocidad)**: ¿Hacia dónde va? (ΔCD/Δt)
  - **Derivada 2ª (Aceleración)**: ¿Cómo cambia la trayectoria? (Δ²CD/Δt²)
- **Detección automática de patrones**:
  - ✅ Recuperación activa (velocidad positiva + aceleración positiva)
  - ⚠️ Estancamiento (velocidad ≈ 0)
  - 🚨 Regresión (velocidad negativa)
  - 📊 Retraso estable vs progresivo
- **Visualización gráfica dual**: Posición + Velocidad, Aceleración
- **Interpretaciones automáticas** según criterios matemáticos
- **Análisis por dominio** para detectar asincronías dinámicas

### 2. **Clasificación de Trayectorias del Desarrollo** 🆕
- **Basado en Thomas et al. (2009)**: Tipología de 4 tipos de trayectorias atípicas
- **Clasificación automática** por dominio:
  - **DELAY** (Retraso): Trayectoria paralela pero retrasada
  - **DEVIANCE Convergente**: Recuperación activa (catching up)
  - **DEVIANCE Divergente**: Empeoramiento progresivo
  - **DYSMATURITY**: Inicio normal, posterior desviación (regresión)
  - **DIFFERENCE**: Patrón cualitativamente diferente
- **Interpretaciones clínicas específicas** para cada tipo
- **Implicaciones pronósticas y terapéuticas** personalizadas
- **Visualización con código de colores** e iconos
- **Base científica rigurosa**: 9 referencias bibliográficas integradas

### 3. **Base de Datos Normativa Múltiple**
- **4 Fuentes normativas diferentes**: CDC, OMS, Bayley-III, Battelle
- **Sistema de información integrado**: Botón ℹ️ Info con propiedades psicométricas
- **7 Dominios de desarrollo**: Motor Grueso, Motor Fino, Lenguaje Receptivo, Lenguaje Expresivo, Social-Emocional, Cognitivo y Adaptativo
- **Más de 80 hitos del desarrollo** con edades medias y desviaciones estándar
- Selección flexible de fuente normativa según contexto clínico

### 3. **Registro Intuitivo de Hitos**
- Interfaz gráfica amigable para registrar cuándo cada niño alcanza cada hito
- **Filtrado inteligente por edad**: Solo muestra hitos relevantes
- Filtrado por dominio y estado (conseguidos/pendientes)
- Cálculo automático de Z-scores, CD y métricas de desarrollo

### 4. **Visualización Gráfica Avanzada**
- **Gráfico tipo curva de crecimiento** con Z-scores en el tiempo
- **Curva de Gauss superpuesta** al pasar el ratón sobre puntos
- Líneas de referencia para interpretar z-scores (-2 DE, -1 DE, media, +1 DE, +2 DE)
- **Itinerario de desarrollo**: Evolución del Cociente de Desarrollo con cálculo de velocidad
- Análisis por dominio del desarrollo

### 5. **Sistema de Red Flags (Señales de Alarma)**
- Catálogo de 20+ señales de alarma del desarrollo
- Registro con edad de aparición, nivel de severidad y notas clínicas
- Visualización integrada en gráficos

### 6. **Análisis Estadístico Dual**
#### Análisis con Z-Scores (Método Clásico)
- **Puntuación Z** para cada hito conseguido con interpretación automática
- Estadísticas por dominio

#### Análisis con Cociente de Desarrollo (Método Complementario)
- **Edad de Desarrollo (ED)**: Promedio de edades normativas de hitos conseguidos
- **Cociente de Desarrollo (CD)**: (ED / Edad Cronológica) × 100
- **Itinerario de Desarrollo**: Evolución temporal del cociente
- **Velocidad de Desarrollo**: Derivada del cociente (ΔCD/Δt) para detectar aceleraciones/desaceleraciones
- Análisis por dominio y global

### 7. **Sistema de Diagnóstico Automático Criterial**
- **Criterios diagnósticos basados en evidencia** para identificar patrones del desarrollo
- **Umbral de corte personalizable** (por defecto -2 DE, ajustable)
- **Diagnósticos automáticos**: Retraso Global, Retraso Simple del Lenguaje, Sospecha PCI/Neuromuscular, Sospecha TEA
- **Recomendaciones clínicas** específicas para cada hallazgo
- Análisis por dominio con niveles de severidad

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn

### Instalación

1. Las dependencias ya están instaladas. Si necesitas reinstalarlas:
```bash
npm install
```

### Ejecutar la Aplicación

#### Opción 1: Ejecutar servidor y cliente por separado (recomendado para desarrollo)

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

#### Opción 2: Ejecución simple del servidor
```bash
npm start
```
Luego acceder manualmente a `http://localhost:3000` en otra terminal con `npm run dev`

### Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📚 Estructura del Proyecto

```
devel-tracking/
├── server/
│   ├── database.js          # Configuración de SQLite y datos normativos
│   ├── server.js            # API REST con Express
│   └── neurodesarrollo.db   # Base de datos (se crea automáticamente)
├── src/
│   ├── components/
│   │   ├── NinosList.jsx           # Lista de niños
│   │   ├── NinoForm.jsx            # Formulario para agregar niños
│   │   ├── HitosRegistro.jsx       # Registro de hitos conseguidos
│   │   ├── GraficoDesarrollo.jsx   # Visualización gráfica con Z-scores
│   │   ├── RedFlagsRegistro.jsx    # Gestión de señales de alarma
│   │   └── Diagnosticos.jsx        # Sistema de diagnóstico automático
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos
│   └── main.jsx             # Punto de entrada
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Uso de la Aplicación

### 1. Agregar un Niño
1. Click en "Agregar Nuevo Niño"
2. Introducir nombre y fecha de nacimiento
3. El sistema calculará automáticamente la edad

### 2. Registrar Hitos del Desarrollo
1. Seleccionar un niño de la lista
2. Ir a "Registrar Hitos"
3. Filtrar por dominio si es necesario
4. Hacer clic en "Registrar como conseguido"
5. Introducir la edad (en meses) a la que se consiguió el hito
6. El sistema calcula automáticamente el Z-score

### 3. Visualizar Gráfico de Desarrollo
1. Seleccionar un niño
2. Ir a "Gráfico de Desarrollo"
3. Ver la progresión del desarrollo a lo largo del tiempo
4. Pasar el ratón sobre puntos para ver:
   - Detalles del hito
   - Curva de Gauss con la posición del niño
   - Interpretación del Z-score
5. Filtrar por dominio específico si es necesario

### 4. Registrar Señales de Alarma
1. Seleccionar un niño
2. Ir a "Señales de Alarma"
3. Revisar el catálogo de red flags
4. Registrar las observadas indicando:
   - Edad de observación
   - Nivel de severidad
   - Notas adicionales

### 5. Consultar Análisis Matemático del Desarrollo 🆕
1. Seleccionar un niño con al menos 2 evaluaciones registradas
2. Ir a "📐 Análisis Matemático"
3. **Revisar las tres derivadas**:
   - **Posición (0ª)**: Cociente de Desarrollo actual
   - **Velocidad (1ª)**: Ritmo de cambio (ΔCD/Δt)
   - **Aceleración (2ª)**: Cambios en el ritmo (Δ²CD/Δt²)
4. **Interpretar patrones**:
   - ✅ Recuperación activa: Velocidad positiva + Aceleración positiva
   - ⚠️ Estancamiento: Velocidad ≈ 0
   - 🚨 Regresión: Velocidad negativa
   - 📊 Retraso estable vs progresivo
5. Comparar velocidades entre dominios para detectar asincronías

### 6. Clasificar Tipo de Trayectoria 🆕
1. Seleccionar un niño con al menos 3 evaluaciones registradas
2. Ir a "🎯 Tipología Trayectorias"
3. **Ver clasificación automática** por dominio:
   - DELAY (Retraso paralelo)
   - DEVIANCE Convergente (Recuperación)
   - DEVIANCE Divergente (Empeoramiento)
   - DYSMATURITY (Regresión)
   - DIFFERENCE (Patrón atípico)
4. **Revisar implicaciones clínicas** específicas para cada tipo
5. Ajustar estrategias terapéuticas según tipo identificado

### 7. Consultar Diagnósticos Automáticos
1. Seleccionar un niño con hitos registrados
2. Ir a "🩺 Diagnósticos"
3. Ajustar umbral de corte si es necesario
4. Revisar diagnósticos identificados y recomendaciones clínicas

---

## 📚 Base Científica

Esta herramienta integra conceptos de **más de una década de investigación científica** sobre análisis de trayectorias del desarrollo:

### Literatura Científica Principal:

1. **Alcantud A (2024)** - Neuropediatoolkit.org  
   *"Las matemáticas aplicadas a la evaluación del neurodesarrollo"*  
   Base conceptual de las tres derivadas y heteroescedasticidad

2. **Thomas MS et al. (2009)** - *J Speech Lang Hear Res*  
   Tipología de 4 tipos de trayectorias atípicas (DELAY, DEVIANCE, DYSMATURITY, DIFFERENCE)

3. **Thomas MSC (2016)** - *Child Dev Perspect*  
   Distinción entre retraso (delay) y diferencia cualitativa (difference)

4. **Tervo RC (2006)** - *Clinical Pediatrics*  
   Patrones de retraso tienen valor diagnóstico específico

5. **Lajiness-O'Neill et al. (2018)** - *Infant Behav Dev*  
   PediaTrac™ - Validación de herramientas web de seguimiento longitudinal

6. **Deboeck et al. (2016)** - *Appl Dev Sci*  
   Derivadas como formas de conceptualizar teorías del cambio

7. **Annaz et al. (2008)** - *Child Neuropsychology*  
   Importancia del seguimiento longitudinal en neuropsicología infantil

8. **Sices L (2007)** - *J Dev Behav Pediatr*  
   Repensar el uso de medias en hitos del desarrollo

**Ver documentación completa**: `BIBLIOGRAFIA_TRAYECTORIAS_DESARROLLO.md`

---

## 📊 API Endpoints

### Niños
- `GET /api/ninos` - Obtener todos los niños
- `POST /api/ninos` - Crear nuevo niño
- `GET /api/ninos/:id` - Obtener un niño específico

### Dominios
- `GET /api/dominios` - Obtener todos los dominios del desarrollo

### Hitos Normativos
- `GET /api/hitos-normativos` - Obtener todos los hitos normativos
- `GET /api/hitos-normativos/dominio/:dominioId` - Hitos por dominio

### Hitos Conseguidos
- `GET /api/hitos-conseguidos/:ninoId` - Obtener hitos conseguidos por un niño
- `POST /api/hitos-conseguidos` - Registrar hito conseguido
- `DELETE /api/hitos-conseguidos/:id` - Eliminar registro de hito

### Red Flags
- `GET /api/red-flags` - Obtener catálogo de red flags
- `GET /api/red-flags-observadas/:ninoId` - Red flags observadas en un niño
- `POST /api/red-flags-observadas` - Registrar red flag observada
- `DELETE /api/red-flags-observadas/:id` - Eliminar registro de red flag

### Análisis
- `GET /api/analisis/:ninoId?fuente=1` - Obtener análisis completo del desarrollo
  - Incluye Z-scores, Edad de Desarrollo, Cociente de Desarrollo
  - Estadísticas por dominio y globales
  - Cálculo de ED y CD para cada área evaluada

### Itinerario de Desarrollo 🆕
- `GET /api/itinerario/:ninoId?fuente=1` - Obtener itinerario de desarrollo
  - Evolución temporal del Cociente de Desarrollo
  - Velocidad de desarrollo (derivada del CD)
  - Análisis por dominio en cada punto temporal
  - Interpretación de aceleraciones/desaceleraciones

### Configuración
- `GET /api/configuracion` - Obtener configuración del sistema (umbral diagnóstico)
- `PUT /api/configuracion/umbral` - Actualizar umbral diagnóstico

### Fuentes Normativas
- `GET /api/fuentes-normativas` - Obtener todas las fuentes normativas activas
- `GET /api/fuentes-normativas/:id` - Obtener una fuente normativa específica

### Diagnósticos 🆕
- `GET /api/diagnostico/:ninoId?fuente=1` - Generar diagnósticos automáticos basados en criterios clínicos
  - Parámetros query opcionales:
    - `fuente`: ID de la fuente normativa a usar (por defecto 1)
  - Respuesta incluye:
    - Estado por dominio con Z-scores promedio
    - Lista de diagnósticos identificados
    - Criterios cumplidos y áreas afectadas
    - Recomendaciones clínicas
    - Interpretación general

### Información de Fuentes Normativas 🆕
- `GET /api/fuentes-normativas-detalle` - Obtener información detallada de todas las fuentes
  - Respuesta incluye para cada fuente:
    - Dominios cubiertos con número de hitos
    - URL original de la fuente
    - Metodología y validación
    - Fortalezas y limitaciones
    - Mejor uso clínico
    - Propiedades psicométricas
    - Información de población de referencia

## 🔬 Base Científica

### Fuentes Normativas Disponibles

El sistema incluye 4 fuentes normativas diferentes, cada una con características específicas:

#### 1. CDC (Centros para el Control y Prevención de Enfermedades)
- **Tipo**: Guía clínica actualizada (2022)
- **Mejor para**: Screening inicial en atención primaria
- **Fortalezas**: Actualizada, práctica, gratuita, enfoque del 75% poblacional
- **Cobertura**: Amplia (todos los dominios)
- **Población**: General estadounidense diversa

#### 2. OMS (Organización Mundial de la Salud)
- **Tipo**: Estudio normativo internacional (2006)
- **Mejor para**: Comparación intercultural y seguimiento motor
- **Fortalezas**: Estándar internacional, muestra multicultural, ventanas de logro
- **Cobertura**: Excelente en motor grueso, limitada en otros
- **Población**: Internacional (6 países)

#### 3. Bayley Scales of Infant Development (Bayley-III)
- **Tipo**: Escala estandarizada gold standard (2006)
- **Mejor para**: Evaluación diagnóstica completa
- **Fortalezas**: Excelente fiabilidad (α > 0.86), validez establecida, cobertura completa
- **Cobertura**: Completa (5 escalas principales)
- **Población**: Normativa estadounidense estratificada (n=1,700)

#### 4. Battelle Developmental Inventory (BDI-2)
- **Tipo**: Inventario completo del desarrollo (2005)
- **Mejor para**: Planificación educativa e intervención
- **Fortalezas**: Rango amplio (0-7 años), múltiples métodos, grupos especiales
- **Cobertura**: Muy completa (5 dominios, 13 subescalas)
- **Población**: Normativa con sobremuestreo de grupos especiales (n=2,500)

**Nota**: En cada selector de fuente normativa, el botón "ℹ️ Info" proporciona acceso a información detallada, comparaciones y enlaces a las fuentes originales.

### Puntuación Z (Z-score)
La puntuación Z indica cuántas desviaciones estándar se aleja un valor de la media de la población:

```
Z = (Edad_conseguido - Edad_media_poblacional) / Desviación_estándar
```

- **Z = 0**: El niño alcanzó el hito exactamente a la edad media esperada
- **Z = -2**: El niño alcanzó el hito 2 desviaciones estándar por debajo de la media (posible retraso)
- **Z = +2**: El niño alcanzó el hito 2 desviaciones estándar por encima de la media (desarrollo avanzado)

### Interpretación Clínica
- **Z < -2**: Requiere evaluación profesional (2.5% de la población)
- **-2 < Z < -1**: Vigilancia (13.5% de la población)
- **-1 < Z < 1**: Desarrollo normal (68% de la población)
- **1 < Z < 2**: Desarrollo avanzado (13.5% de la población)
- **Z > 2**: Desarrollo muy avanzado (2.5% de la población)

### Cociente de Desarrollo (CD) 🆕

El Cociente de Desarrollo es una medida alternativa y complementaria al Z-score que permite representar el itinerario de desarrollo de forma más intuitiva:

```
Edad de Desarrollo (ED) = Promedio de edades medias de hitos conseguidos
Cociente de Desarrollo (CD) = (ED / Edad Cronológica) × 100
```

#### Ventajas del Cociente de Desarrollo:
- **Interpretación intuitiva**: CD = 100% significa que ED = EC (desarrollo típico)
- **Representación del itinerario**: Permite ver la trayectoria del desarrollo a lo largo del tiempo
- **Cálculo de velocidad**: La derivada del CD (ΔCD/Δt) indica aceleraciones o desaceleraciones
- **Detección de estancamientos**: Velocidad negativa indica pérdida de ritmo de desarrollo

#### Interpretación del CD:
- **CD = 100%**: Desarrollo típico (ED = EC)
- **CD = 85-99%**: Retraso leve (ED ligeramente menor que EC)
- **CD = 70-84%**: Retraso moderado
- **CD < 70%**: Retraso severo
- **CD > 100%**: Desarrollo adelantado (ED > EC)

#### Velocidad de Desarrollo:
```
Velocidad = ΔCD / Δt
```
- **V > 0**: Aceleración del desarrollo (recuperación, intervención efectiva)
- **V = 0**: Velocidad constante (desarrollo estable)
- **V < 0**: Desaceleración (estancamiento, regresión)

**Nota**: El CD es especialmente útil para seguimiento longitudinal y evaluación de intervenciones terapéuticas.

### Criterios Diagnósticos Automáticos 🆕

El sistema implementa criterios diagnósticos basados en patrones de desarrollo ampliamente aceptados:

#### 1. Retraso Global del Desarrollo (RGD)
- **Criterio**: 2 o más dominios del desarrollo con Z-score < umbral establecido
- **Fundamentación**: El RGD se define clínicamente como un retraso significativo en dos o más áreas del desarrollo
- **Severidad**: Moderada
- **Acción**: Evaluación multidisciplinar y programa de intervención temprana

#### 2. Retraso Simple del Lenguaje
- **Criterio**: Solo los dominios de lenguaje (receptivo y/o expresivo) presentan Z-score < umbral, con otras áreas dentro de normalidad
- **Fundamentación**: Retraso aislado en el área comunicativa sin afectación de otras competencias
- **Severidad**: Moderada
- **Acción**: Evaluación audiológica y logopédica, seguimiento a 6 meses

#### 3. Sospecha de Parálisis Cerebral Infantil (PCI) o Enfermedad Neuromuscular
- **Criterio**: Retraso en motor grueso y/o motor fino con Z-score < umbral
- **Fundamentación**: La afectación motora es el signo cardinal de PCI y enfermedades neuromusculares
- **Severidad**: Alta
- **Acción**: Derivación urgente a neuropediatría, neuroimagen y estudios electrodiagnósticos

#### 4. Sospecha de Trastorno del Espectro Autista (TEA)
- **Criterio**: Área social-emocional con Z-score al menos 2 DE por debajo del promedio de las otras áreas del desarrollo
- **Fundamentación**: La afectación desproporcionada del área social es característica del TEA
- **Severidad**: Alta
- **Acción**: Evaluación especializada con escalas diagnósticas (M-CHAT, ADOS), intervención temprana intensiva

**Nota importante**: El umbral de corte es configurable (por defecto -2 DE) permitiendo ajustar la sensibilidad/especificidad según el contexto clínico y la población evaluada.

## ⚠️ Consideraciones Importantes

1. **Este sistema es una herramienta de seguimiento**, no un instrumento diagnóstico definitivo
2. Los diagnósticos automáticos son **orientativos** y requieren confirmación por profesionales especializados
3. Los datos normativos son aproximados y deben adaptarse a cada población
4. Las señales de alarma requieren evaluación profesional
5. Considerar factores contextuales: prematuridad, bilingüismo, factores socioculturales
6. El desarrollo infantil es variable y este sistema debe usarse como guía
7. El umbral diagnóstico puede ajustarse según criterio clínico y características de la población

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, Vite, Recharts
- **Backend**: Node.js, Express
- **Base de datos**: SQLite3
- **Visualización**: Recharts (gráficos interactivos)

## 📝 Licencia

ISC

## 👥 Contribuciones

Este es un proyecto de código abierto. Las contribuciones son bienvenidas, especialmente:
- Mejoras en la base de datos normativa
- Nuevos hitos del desarrollo
- Traducción a otros idiomas
- Mejoras en la visualización

## 📧 Soporte

Para reportar problemas o sugerir mejoras, por favor crea un issue en el repositorio.

---

**Desarrollado para profesionales de la salud, educadores y familias interesadas en el seguimiento del desarrollo infantil.**
