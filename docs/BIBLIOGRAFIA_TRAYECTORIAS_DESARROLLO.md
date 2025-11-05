# 📚 Base Bibliográfica: Trayectorias del Desarrollo

## 🎯 Introducción

Este documento integra los conceptos clave de la literatura científica sobre análisis de trayectorias del desarrollo que fundamentan las funcionalidades avanzadas de esta herramienta.

---

## 📖 Referencias Principales

### 1. Thomas MSC (2016) - Understanding Delay in Developmental Disorders

**Referencia completa**: Thomas MSC. Understanding Delay in Developmental Disorders. *Child Dev Perspect*. 2016;10(2):73-80.

#### Conceptos Clave:

##### A. Retraso vs Diferencia en el Desarrollo

**Distinción fundamental**:
- **Retraso (Delay)**: El desarrollo sigue la misma trayectoria que la normalidad pero desplazada en el tiempo
- **Diferencia (Difference)**: El desarrollo sigue una trayectoria cualitativamente diferente

**Aplicación en esta herramienta**:
- ✅ Análisis de **velocidad** permite distinguir: 
  - Velocidad normal pero posición retrasada = **Retraso puro**
  - Velocidad inferior a la normal = **Divergencia progresiva**
- ✅ Análisis de **aceleración** detecta cambios en la trayectoria

##### B. Trayectorias Atípicas

Thomas identifica que los trastornos del neurodesarrollo no son simplemente "versiones retrasadas" del desarrollo típico, sino que pueden mostrar **patrones cualitativamente diferentes**.

**Implementación**:
- Análisis de **asincronías** entre dominios
- Detección de patrones específicos (TEA, PCI, etc.)
- Comparación de velocidades entre áreas

---

### 2. Thomas et al. (2009) - Using Developmental Trajectories to Understand Developmental Disorders

**Referencia completa**: Thomas MS, Annaz D, Ansari D, Scerif G, Jarrold C, Karmiloff-Smith A. Using developmental trajectories to understand developmental disorders. *Journal of Speech, Language, and Hearing Research*. 2009;52(2):336-58.

#### Conceptos Clave:

##### A. Los Cuatro Tipos de Trayectorias Atípicas

**1. DELAY, IMMATURITY (Retraso - inicio retrasado)**
- Definición: Misma pendiente, inicio retrasado (immaturity)
- Características: Trayectoria paralela a la normalidad con inicio retrasado
- Z-score: Constante en el tiempo
- **Detección en herramienta**: Velocidad normal, CD constante < 100

**2. DEVIANCE (Desviación de la media)**
- Definición: Diferente pendiente desde el inicio (desviación progresiva de la media)
- Características: Trayectoria divergente o convergente
- Z-score: Cambia sistemáticamente
- **Detección en herramienta**: Velocidad diferente a la normal, aceleración ≠ 0

**3. DYSMATURITY (Dismadurez - desarrollo trastornado)**
- Definición: Inicio normal pero posterior desaceleración
- Características: Comienza típico, luego se aleja (desarrollo trastornado)
- Z-score: Inicialmente normal, luego empeora
- **Detección en herramienta**: Velocidad inicialmente normal → luego negativa

**4. DIFFERENCE (Diferencia cualitativa)**
- Definición: Patrón completamente diferente
- Características: No comparable con desarrollo típico
- Z-score: Puede no ser aplicable
- **Detección en herramienta**: Asincronías marcadas entre dominios

##### B. Importancia de Mediciones Repetidas

**Cita clave**: *"A single assessment provides a snapshot, but only repeated measurements reveal the trajectory"*

**Implementación en esta herramienta**:
- ✅ Sistema diseñado para **mediciones longitudinales**
- ✅ Mínimo 2 evaluaciones para velocidad, 3 para aceleración
- ✅ Gráficos de trayectorias temporales
- ✅ Tabla histórica de evaluaciones

##### C. Aproximación Neuroconstructivista

El desarrollo cerebral es un proceso de **especialización progresiva** donde:
- Las estructuras iniciales influyen en el desarrollo posterior
- Los módulos cognitivos se desarrollan de forma interactiva
- Las trayectorias atípicas tempranas tienen efectos en cascada

**Aplicación**:
- Análisis de **interdependencias** entre dominios
- Detección de efectos en cascada mediante aceleración
- Enfoque en **intervención temprana** (modificar trayectorias)

---

### 3. Tervo RC (2006) - Identifying Patterns of Developmental Delays

**Referencia completa**: Tervo RC. Identifying Patterns of Developmental Delays Can Help Diagnose Neurodevelopmental Disorders. *Clinical Pediatrics*. 2006;45(6):509-17.

#### Conceptos Clave:

##### A. Patrones Diagnósticos Específicos

Tervo identifica que **los patrones de retraso tienen valor diagnóstico**:

| Patrón | Trastorno Probable | Acción Clínica |
|--------|-------------------|----------------|
| Motor grueso aislado | PCI, trastorno neuromuscular | Neuroimagen, EMG |
| Lenguaje aislado | Retraso simple del lenguaje | Audiología, logopedia |
| Social + comunicación | TEA | ADOS, M-CHAT |
| Global (≥2 dominios) | RGD, síndrome genético | Evaluación multidisciplinar |
| Motor fino + adaptativo | Dispraxia | Terapia ocupacional |

**Implementación**:
- ✅ **Sistema de diagnósticos criteriales** automático
- ✅ Análisis por **patrones de asincronía**
- ✅ Recomendaciones clínicas específicas

##### B. Valor del Seguimiento Longitudinal

**Concepto**: El patrón **evolutivo** del retraso es tan importante como el patrón transversal.

**Ejemplos**:
- Retraso motor que mejora vs que persiste
- Retraso del lenguaje que converge vs que diverge
- Aparición de nuevas áreas afectadas (regresión)

**Implementación**:
- ✅ Análisis de **velocidad por dominio**
- ✅ Detección de **convergencia/divergencia**
- ✅ Alertas de **nuevas áreas afectadas**

---

### 4. Lajiness-O'Neill et al. (2018) - PediaTrac™ Development and Validation

**Referencia completa**: Lajiness-O'Neill R, Brooks J, Lukomski A, Schilling S, Huth-Bocks A, Warschausky S, et al. Development and validation of PediaTrac™: A web-based tool to track developing infants. *Infant Behavior and Development*. 2018;50:224-37.

#### Conceptos Clave de PediaTrac™:

##### A. Características del Sistema PediaTrac

**PediaTrac** es una herramienta web validada para seguimiento del desarrollo infantil con:
- Seguimiento longitudinal automatizado
- Múltiples dominios del desarrollo
- Generación de gráficos de trayectorias
- Alertas automáticas de retraso
- Validación psicométrica rigurosa

##### B. Dominios Evaluados

PediaTrac evalúa 6 dominios principales:
1. Motor grueso
2. Motor fino
3. Comunicación receptiva
4. Comunicación expresiva
5. Cognitivo
6. Social-emocional

**Paralelismo con nuestra herramienta**:
- ✅ 7 dominios (incluye Adaptativo)
- ✅ Seguimiento longitudinal
- ✅ Gráficos de trayectorias
- ✅ Sistema de alertas

##### C. Validación Científica

**Hallazgos del estudio de validación**:
- Sensibilidad: 85% para detectar retrasos significativos
- Especificidad: 78% para descartar desarrollo típico
- Fiabilidad test-retest: r = 0.89
- Validez concurrente con Bayley-III: r = 0.82

**Lecciones aplicadas**:
- ✅ Uso de **múltiples fuentes normativas** (CDC, OMS, Bayley, Battelle)
- ✅ **Umbrales ajustables** para sensibilidad/especificidad
- ✅ Comparación con **instrumentos gold standard**

##### D. Enfoque de Vigilancia del Desarrollo

PediaTrac implementa un modelo de **developmental surveillance**:
- Evaluaciones periódicas estructuradas
- Seguimiento continuo en lugar de screening puntual
- Integración en atención primaria
- Participación de familias en el registro

**Implementación en nuestra herramienta**:
- ✅ Registro periódico de hitos
- ✅ Seguimiento continuo con gráficos temporales
- ✅ Interfaz accesible para familias
- ✅ Alertas automáticas

---

### 5. Deboeck et al. (2016) - Using Derivatives to Articulate Change Theories

**Referencia completa**: Deboeck PR, Nicholson J, Kouros C, Little TD, Garber J. Integrating developmental theory and methodology: Using derivatives to articulate change theories, models, and inferences. *Appl Dev Sci*. 2016;19(4):217-31.

#### Conceptos Clave:

##### A. Derivadas como Herramientas Teóricas

**Argumento central**: Las derivadas no son solo herramientas matemáticas, sino **formas de conceptualizar el cambio** en teorías del desarrollo.

**Tres niveles de teorización**:

**Nivel 0 (Posición)**:
- Pregunta: ¿Dónde está el individuo?
- Teoría: Estado actual, nivel de funcionamiento
- Ejemplo: "El niño tiene un CD de 75%"

**Nivel 1 (Velocidad)**:
- Pregunta: ¿Cómo está cambiando?
- Teoría: Dirección y ritmo del cambio
- Ejemplo: "El desarrollo avanza a 0.8 puntos/mes"

**Nivel 2 (Aceleración)**:
- Pregunta: ¿Cómo cambia el cambio?
- Teoría: Dinámica del proceso de desarrollo
- Ejemplo: "La recuperación se está acelerando"

##### B. Modelos de Cambio

Deboeck propone que diferentes **teorías del desarrollo predicen diferentes patrones de derivadas**:

**Teoría de Maduración (modelo simple)**:
- Predicción: Velocidad constante positiva
- Aceleración: Cercana a cero
- Patrón: Desarrollo lineal progresivo

**Teoría de Ventanas Críticas**:
- Predicción: Aceleración positiva en periodos sensibles
- Aceleración: Picos en momentos específicos
- Patrón: Desarrollo en oleadas

**Teoría de Efectos Acumulativos**:
- Predicción: Aceleración progresivamente positiva o negativa
- Patrón: Efecto "bola de nieve" (Matthew effect)

**Teoría de Intervención**:
- Predicción: Cambio brusco en velocidad post-intervención
- Aceleración: Pico en momento de inicio de terapia
- Patrón: Discontinuidad en trayectoria

##### C. Inferencias Causales

**Concepto clave**: El análisis de derivadas permite **inferencias causales más robustas**:
- Comparar velocidades pre/post intervención
- Detectar efectos de moderadores (aceleración variable según contexto)
- Identificar mediadores (cambios en una variable preceden cambios en otra)

**Implementación en herramienta**:
- 🔄 **Pendiente**: Análisis pre/post intervención
- 🔄 **Pendiente**: Comparación de trayectorias con/sin terapia
- 🔄 **Pendiente**: Análisis de moderadores (prematuridad, nivel socioeconómico)

---

### 6. Annaz et al. (2008) - Tracing Developmental Trajectories for Clinical Child Neuropsychology

**Referencia completa**: Annaz D, Karmiloff-Smith A, Thomas MS. The importance of tracing developmental trajectories for clinical child neuropsychology. In: Reed J, Warner Rogers J, editors. *Child Neuropsychology: Concepts, Theory and Practice*. 2008. p. 7-32.

#### Conceptos Clave:

##### A. Limitaciones del Enfoque Transversal

**Problema**: La neuropsicología infantil tradicional compara niños con trastornos vs controles en un momento único.

**Limitaciones identificadas**:
1. No captura la **naturaleza dinámica** del desarrollo
2. No diferencia retraso vs diferencia
3. No permite predecir evolución
4. Ignora la **heterocronia** (dominios con trayectorias diferentes)

##### B. Ventajas del Enfoque Longitudinal

**Beneficios del análisis de trayectorias**:

1. **Diagnóstico más preciso**: Distinguir trastornos con presentación similar en corte transversal
2. **Pronóstico**: Predecir evolución futura
3. **Evaluación de intervención**: Medir cambios en trayectoria
4. **Comprensión de mecanismos**: Entender procesos subyacentes

##### C. Tipos de Datos Longitudinales

**Estudios longitudinales puros**:
- Mismo grupo seguido en el tiempo
- Máxima información individual
- Costosos y largos

**Estudios transversales acelerados**:
- Múltiples cohortes de edad evaluadas transversalmente
- Asume equivalencia entre cohortes
- Más rápidos

**Estudios longitudinales acelerados (cohort-sequential)**:
- Múltiples cohortes seguidas longitudinalmente
- Combina ventajas de ambos
- Diseño óptimo

**Implementación en herramienta**:
- ✅ Sistema permite **datos longitudinales puros** (seguimiento individual)
- ✅ Base de datos normativa de **estudios transversales**
- 🔄 **Futura**: Análisis agregado de múltiples casos (longitudinal acelerado)

---

### 7. Thomas - Statistical Approaches to Analysing Developmental Trajectories

**Referencia**: Thomas MS. Statistical approaches to analysing developmental trajectories using SPSS. Birkbeck College, University of London. Disponible en: http://www.psyc.bbk.ac.uk/research/DNL/stats/Thomas_trajectories.html

#### Conceptos Clave:

##### A. Modelos Estadísticos para Trayectorias

**1. Regresión Lineal Múltiple**:
- Variables predictoras: tiempo, grupo, tiempo×grupo
- Detecta: diferencias en pendiente entre grupos
- Limitación: Asume linealidad

**2. Modelos Polinomiales**:
- Añade términos cuadráticos, cúbicos
- Captura: trayectorias curvilíneas
- Aplicación: Oleadas de desarrollo

**3. Modelos Mixtos (HLM/MLM)**:
- Nivel 1: Cambio intra-individual
- Nivel 2: Diferencias inter-individuales
- Ventaja: Maneja datos desbalanceados

**4. Modelos de Curva de Crecimiento Latente (LGCM)**:
- Estima: intercepto y pendiente como variables latentes
- Permite: Correlacionar intercepto con pendiente
- Pregunta: ¿Los que empiezan más bajo mejoran más rápido?

##### B. Consideraciones Prácticas

**Número de mediciones**:
- Mínimo 3 para detectar cambio no lineal
- Mínimo 4 para estimar aceleración confiablemente
- Ideal: 5+ mediciones

**Intervalos entre mediciones**:
- Deben capturar el ritmo de cambio esperado
- Muy cortos: Ruido de medición domina
- Muy largos: Pérdida de información

**Datos faltantes**:
- Modelos mixtos manejan bien missing data (MAR)
- FIML (Full Information Maximum Likelihood) preferible

**Implementación en herramienta**:
- ✅ Regresión lineal para tendencias
- 🔄 **Futura**: Modelos polinomiales para oleadas
- 🔄 **Futura**: HLM para análisis poblacional
- 🔄 **Futura**: LGCM para predictores de cambio

---

### 8. Sices L (2007) - Rethinking the Meaning of the Mean

**Referencia completa**: Sices L. Use of Developmental Milestones in Pediatric Residency Training and Practice: Time to Rethink the Meaning of the Mean. *J Dev Behav Pediatr*. 2007;28(1):47-52.

#### Conceptos Clave:

##### A. Problema del Uso de Medias

**Argumento central**: Los pediatras usan la **edad media** de logro de hitos como punto de corte, lo cual es **estadísticamente incorrecto**.

**Problema**:
- Si la edad media de caminar es 12 meses
- 50% de niños normales caminarán DESPUÉS de 12 meses
- Usar la media como límite **patologiza a niños normales**

##### B. Importancia de la Varianza

**Concepto**: La **desviación estándar** es tan importante como la media.

**Ejemplo con caminar independiente**:
- Media: 12 meses
- DE: 2 meses
- Rango normal (-2 DE a +2 DE): 8 a 16 meses
- Punto de alarma real: >16 meses (no >12 meses)

##### C. Ventanas de Logro vs Puntos de Corte

**Propuesta de Sices**: Usar **ventanas de logro** en lugar de edades fijas.

**Sistema de semáforo**:
- 🟢 **Verde** (25-75 percentil): Desarrollo típico
- 🟡 **Amarillo** (5-25 o 75-95 percentil): Vigilancia
- 🔴 **Rojo** (<5 o >95 percentil): Evaluación

**Implementación en herramienta**:
- ✅ Uso de **Z-scores** (incorpora media Y varianza)
- ✅ **Umbral ajustable** (por defecto -2 DE, no la media)
- ✅ **Interpretación graduada** (normal, vigilancia, evaluación)
- ✅ Visualización de **bandas de confianza** en gráficos

##### D. Implicaciones Clínicas

**Cambio de paradigma**:
- ❌ **Antes**: "¿El niño tiene el hito a la edad media?"
- ✅ **Ahora**: "¿El niño está dentro del rango esperado de variabilidad?"

**Beneficios**:
- Reduce falsos positivos (ansiedad innecesaria)
- Mejora especificidad del screening
- Reconoce la normalidad de la variabilidad

**Aplicación educativa**:
- ✅ Sistema muestra **distribución completa**, no solo la media
- ✅ Curva de Gauss en tooltips educativa
- ✅ Interpretaciones incluyen contexto de variabilidad

---

## 🔬 Síntesis: Marco Conceptual Integrado

### Modelo Teórico de Esta Herramienta

Basándose en la bibliografía, esta herramienta implementa un **modelo de análisis de trayectorias de desarrollo** que:

#### 1. Reconoce la Naturaleza Dinámica del Desarrollo (Thomas et al., 2009; Annaz et al., 2008)
- El desarrollo es un **proceso**, no un estado
- Las mediciones únicas tienen **valor limitado**
- Las **trayectorias revelan** mecanismos subyacentes

#### 2. Diferencia Tipos de Trayectorias Atípicas (Thomas et al., 2009)
- **Delay**: Paralela pero retrasada
- **Deviance**: Pendiente diferente
- **Dysmaturity**: Inicio normal, posterior desviación
- **Difference**: Cualitativamente diferente

#### 3. Usa Derivadas para Cuantificar el Cambio (Deboeck et al., 2016; Alcantud, 2024)
- **Posición**: Estado actual
- **Velocidad**: Ritmo de cambio
- **Aceleración**: Dinámica del cambio

#### 4. Identifica Patrones Diagnósticos (Tervo, 2006)
- Patrones de asincronía tienen **valor diagnóstico**
- El **seguimiento longitudinal** mejora la precisión
- La **evolución** del patrón es clave

#### 5. Aplica Principios de Vigilancia del Desarrollo (Lajiness-O'Neill et al., 2018)
- **Seguimiento continuo** > screening puntual
- **Múltiples fuentes** de información
- **Participación familiar** en el registro

#### 6. Respeta la Variabilidad Normal (Sices, 2007)
- Usa **rangos de normalidad** (±2 DE), no medias
- Reconoce que la **varianza** es inherente al desarrollo
- **Umbrales ajustables** según contexto clínico

#### 7. Fundamenta Decisiones en Evidencia Estadística (Thomas, SPSS)
- Métodos estadísticos **apropiados** para datos longitudinales
- Manejo de **heteroscedasticidad** mediante Z-scores
- Consideración de **datos faltantes**

---

## 📊 Funcionalidades Implementadas con Base Bibliográfica

| Funcionalidad | Fundamentación Bibliográfica |
|---------------|------------------------------|
| **Análisis de 3 derivadas** | Deboeck et al. (2016), Alcantud (2024) |
| **Detección de tipos de trayectoria** | Thomas et al. (2009) |
| **Patrones diagnósticos** | Tervo (2006) |
| **Sistema de vigilancia continua** | Lajiness-O'Neill et al. (2018) |
| **Uso de Z-scores vs medias** | Sices (2007) |
| **Múltiples fuentes normativas** | Lajiness-O'Neill et al. (2018) |
| **Análisis por dominios** | Thomas (2016), Tervo (2006) |
| **Visualización de trayectorias** | Annaz et al. (2008), Thomas (SPSS) |
| **Interpretaciones automáticas** | Thomas et al. (2009), Tervo (2006) |
| **Umbrales ajustables** | Sices (2007) |

---

## 🔄 Mejoras Futuras Sugeridas (Con Base Bibliográfica)

### 1. Modelos Estadísticos Avanzados (Thomas, SPSS)
- **HLM/MLM**: Análisis multinivel de trayectorias
- **LGCM**: Curvas de crecimiento latente
- **Modelos polinomiales**: Capturar oleadas de desarrollo

### 2. Análisis Pre/Post Intervención (Deboeck et al., 2016)
- Comparar velocidades antes y después de terapia
- Detectar efectos de intervención en aceleración
- Cuantificar efecto del tratamiento en trayectorias

### 3. Clasificación Automática de Tipos de Trayectoria (Thomas et al., 2009)
- Algoritmo para clasificar: delay, deviance, dysmaturity, difference
- Alertas específicas según tipo de trayectoria
- Recomendaciones personalizadas por tipo

### 4. Ventanas de Logro OMS (Sices, 2007)
- Implementar sistema de semáforo (verde/amarillo/rojo)
- Usar percentiles 5-25-75-95 para interpretación
- Educación sobre variabilidad normal

### 5. Análisis Poblacional (Thomas, SPSS; Annaz et al., 2008)
- Agregación de datos de múltiples usuarios (anónimos)
- Trayectorias normativas locales
- Comparación con datos normativos publicados

### 6. Predictores de Trayectoria (Deboeck et al., 2016)
- Variables que predicen velocidad de desarrollo
- Factores de riesgo/protección
- Modelos predictivos de evolución

---

## 📝 Citas Clave para Documentación

### Sobre la Importancia de Trayectorias:

> "A single assessment provides a snapshot, but only repeated measurements reveal the trajectory" 
> — Thomas et al. (2009)

### Sobre Retraso vs Diferencia:

> "Developmental disorders are not simply delayed versions of typical development, but may follow qualitatively different trajectories"
> — Thomas (2016)

### Sobre Patrones Diagnósticos:

> "Identifying patterns of developmental delays can help diagnose neurodevelopmental disorders"
> — Tervo (2006)

### Sobre el Uso de Derivadas:

> "Derivatives provide not just mathematical tools, but ways of conceptualizing change in developmental theories"
> — Deboeck et al. (2016)

### Sobre la Variabilidad:

> "Time to rethink the meaning of the mean - the variance is as important as the average"
> — Sices (2007)

### Sobre Vigilancia vs Screening:

> "Developmental surveillance through continuous tracking is more effective than episodic screening"
> — Lajiness-O'Neill et al. (2018)

---

## 🎯 Conclusión

Esta herramienta integra **más de una década de investigación científica** sobre análisis de trayectorias del desarrollo, implementando:

1. ✅ **Marco teórico sólido** (neuroconstructivismo, teorías del cambio)
2. ✅ **Métodos cuantitativos rigurosos** (derivadas, Z-scores, modelos estadísticos)
3. ✅ **Aplicabilidad clínica** (patrones diagnósticos, vigilancia continua)
4. ✅ **Respeto por la variabilidad** (rangos normativos, umbrales ajustables)
5. ✅ **Base empírica** (validación tipo PediaTrac, múltiples fuentes normativas)

**La herramienta no es solo una aplicación de registro, sino una implementación práctica de los avances científicos en el análisis del desarrollo infantil.**

---

## 📚 Referencias Completas

1. Thomas MSC. Understanding Delay in Developmental Disorders. *Child Dev Perspect*. 2016;10(2):73-80.

2. Thomas MS, Annaz D, Ansari D, Scerif G, Jarrold C, Karmiloff-Smith A. Using developmental trajectories to understand developmental disorders. *Journal of Speech, Language, and Hearing Research*. 2009;52(2):336-58.

3. Tervo RC. Identifying Patterns of Developmental Delays Can Help Diagnose Neurodevelopmental Disorders. *Clinical Pediatrics*. 2006;45(6):509-17.

4. Lajiness-O'Neill R, Brooks J, Lukomski A, Schilling S, Huth-Bocks A, Warschausky S, et al. Development and validation of PediaTrac™: A web-based tool to track developing infants. *Infant Behavior and Development*. 2018;50:224-37.

5. Deboeck PR, Nicholson J, Kouros C, Little TD, Garber J. Integrating developmental theory and methodology: Using derivatives to articulate change theories, models, and inferences. *Appl Dev Sci*. 2016;19(4):217-31.

6. Annaz D, Karmiloff-Smith A, Thomas MS. The importance of tracing developmental trajectories for clinical child neuropsychology. In: Reed J, Warner Rogers J, editors. *Child Neuropsychology: Concepts, Theory and Practice*. 2008. p. 7-32.

7. Thomas MS. Statistical approaches to analysing developmental trajectories using SPSS. Birkbeck College, University of London. [Internet]. Disponible en: http://www.psyc.bbk.ac.uk/research/DNL/stats/Thomas_trajectories.html

8. Sices L. Use of Developmental Milestones in Pediatric Residency Training and Practice: Time to Rethink the Meaning of the Mean. *J Dev Behav Pediatr*. 2007;28(1):47-52.

9. Alcantud A. Las matemáticas aplicadas a la evaluación del neurodesarrollo. Neuropediatoolkit.org. 2024. Disponible en: https://neuropediatoolkit.org/evaluacion-global-del-neurodesarrollo/

---

**Esta base bibliográfica documenta el rigor científico y la fundamentación empírica de las funcionalidades de la herramienta de seguimiento del neurodesarrollo.**
