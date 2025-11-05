# Correcciones Terminológicas: DYSMATURITY y DEVIANCE

## Fecha
2024-12-19

## Objetivo
Corregir y aclarar las traducciones de términos técnicos utilizados en la tipología de trayectorias del desarrollo de Thomas et al. (2009), para reflejar mejor los conceptos originales y mejorar la precisión clínica.

---

## 1. DYSMATURITY (Dismadurez)

### Término Original
**Dysmaturity** (inglés) - Thomas et al. (2009)

### Traducción Anterior (Incorrecta)
**Inmadurez** - Implica simplemente falta de maduración

### Traducción Corregida
**Dismadurez (desarrollo trastornado)** - Refleja la alteración activa del proceso de desarrollo

### Justificación
- "Inmadurez" sugiere solo lentitud o falta de maduración
- "Dismadurez" indica un trastorno o alteración del desarrollo
- El término debe reflejar que es un proceso patológico, no solo retraso

### Concepto
**DYSMATURITY** se refiere a:
- Inicio **normal o típico**
- Posterior **desaceleración o deterioro**
- Representa **desarrollo trastornado**, no simple inmadurez
- Patrón **regresivo**

---

## 2. DEVIANCE (Desviación de la media)

### Término Original
**Deviance** (inglés) - Thomas et al. (2009)

### Traducción Anterior (Incompleta)
**Desviación** - Término correcto pero incompleto

### Traducción Aclarada
**Desviación de la media** - Especifica que se refiere a desviación respecto a la media poblacional

### Justificación
- En estadística y psicometría, "deviance" se refiere específicamente a desviación respecto a la media
- La trayectoria tiene una **pendiente diferente** a la media poblacional
- Puede ser convergente (acercándose a la media) o divergente (alejándose de la media)
- Aclara que se trata de un concepto estadístico preciso

### Concepto
**DEVIANCE** se refiere a:
- Pendiente **diferente** a la trayectoria típica (media poblacional)
- Puede ser **convergente**: mejorando hacia la media (catching up)
- Puede ser **divergente**: alejándose de la media (empeoramiento)
- La distancia con la media **cambia sistemáticamente**

---

## Diferencias entre los Cuatro Tipos de Trayectorias

1. **DELAY, IMMATURITY (Retraso - inicio retrasado)**: 
   - Trayectoria paralela a la media
   - Inicio retrasado (immaturity)
   - Distancia constante con la normalidad

2. **DEVIANCE (Desviación de la media)**: 
   - Pendiente diferente desde el inicio
   - Convergente (recuperación) o divergente (empeoramiento)
   - Distancia con la media cambia sistemáticamente

3. **DYSMATURITY (Dismadurez - desarrollo trastornado)**: 
   - Inicio normal → posterior alteración
   - Desarrollo trastornado o regresivo
   - Comienza en/cerca de la media, luego se deteriora

4. **DIFFERENCE (Diferencia cualitativa)**: 
   - Patrón cualitativamente diferente
   - No comparable directamente con desarrollo típico
   - Asincronías marcadas entre dominios

---

## Archivos Modificados

### DYSMATURITY (Inmadurez → Dismadurez)

#### Código Fuente
1. **src/components/ClasificacionTrayectorias.jsx** - 4 instancias
2. **src/utils/trayectoriasUtils.js** - 1 instancia

#### Documentación
3. **docs/BIBLIOGRAFIA_TRAYECTORIAS_DESARROLLO.md** - 1 instancia
4. **docs/releases/RELEASE_v0.3.0.md** - 1 instancia
5. **docs/MEJORAS_ESTADISTICAS_AVANZADAS.md** - 1 instancia
6. **CHANGELOG.md** - 1 instancia

### DEVIANCE (Desviación → Desviación de la media)

#### Código Fuente
1. **src/components/ClasificacionTrayectorias.jsx** - 5 instancias
2. **src/utils/trayectoriasUtils.js** - 3 instancias
3. **src/components/Bibliografia.jsx** - 3 instancias

#### Documentación
4. **docs/BIBLIOGRAFIA_TRAYECTORIAS_DESARROLLO.md** - 1 instancia
5. **docs/releases/RELEASE_v0.3.0.md** - 1 instancia
6. **docs/MEJORAS_ESTADISTICAS_AVANZADAS.md** - 1 instancia
7. **CHANGELOG.md** - 1 instancia
8. **README.md** - 4 instancias
9. **CORRECCION_TERMINOLOGIA_DYSMATURITY.md** - 1 instancia

---

## Cambios Específicos Realizados

### DYSMATURITY
```
Antes: DYSMATURITY (Inmadurez)
Después: DYSMATURITY (Dismadurez - desarrollo trastornado)
```

### DEVIANCE
```
Antes: DEVIANCE (Desviación)
Después: DEVIANCE (Desviación de la media)

Antes: Desviación convergente
Después: Desviación de la media convergente

Antes: Desviación divergente
Después: Desviación de la media divergente
```

---

## Referencias Bibliográficas

### Principal
**Thomas MS, Annaz D, Ansari D, Scerif G, Jarrold C, Karmiloff-Smith A.** (2009). Using developmental trajectories to understand developmental disorders. *Journal of Speech, Language, and Hearing Research*. 52(2):336-58.

- Define los 4 tipos de trayectorias atípicas
- Establece criterios estadísticos para clasificación
- Describe "deviance" como pendiente diferente a la media poblacional
- Describe "dysmaturity" como inicio típico con posterior desviación

### Complementaria
**Thomas MSC.** (2016). Understanding Delay in Developmental Disorders. *Child Development Perspectives*. 10(2):73-80.

- Profundiza en la distinción entre tipos de trayectorias
- Enfatiza la importancia de mediciones longitudinales
- Aclara conceptos estadísticos subyacentes

---

## Implicaciones Clínicas

### DYSMATURITY (Dismadurez)
El término "dismadurez" es más apropiado porque:
1. Refleja **alteración activa** del desarrollo
2. Sugiere **procesos patológicos** (regresión, neurodegeneración)
3. Orienta hacia **causas de deterioro**
4. Es consistente con literatura especializada

**Contextos clínicos:**
- TEA con regresión
- Trastornos neurodegenerativos
- Epilepsia catastrófica infantil
- Trastornos metabólicos

### DEVIANCE (Desviación de la media)
El término completo es más preciso porque:
1. Especifica que es respecto a la **media poblacional**
2. Clarifica el concepto **estadístico** subyacente
3. Facilita interpretación de **convergencia/divergencia**
4. Distingue de otros tipos de "desviación" no estadísticos

**Contextos clínicos:**
- **Convergente**: Intervención exitosa, catching up
- **Divergente**: Deterioro progresivo, necesita intensificación

---

## Verificación

✅ Build exitoso sin errores  
✅ 9 instancias de "inmadurez" corregidas a "dismadurez"  
✅ 20+ instancias de "desviación" aclaradas a "desviación de la media"  
✅ Terminología consistente en código y documentación  
✅ Conceptos estadísticos correctamente especificados  

---

## Conclusión

Estas correcciones terminológicas mejoran:

1. **Precisión conceptual**: Términos reflejan mejor los conceptos originales
2. **Claridad clínica**: Facilitan interpretación y toma de decisiones
3. **Rigor estadístico**: Especifican conceptos psicométricos correctamente
4. **Alineación bibliográfica**: Consistentes con literatura especializada
5. **Comunicación profesional**: Lenguaje técnico preciso y profesional

La herramienta ahora utiliza terminología técnica correcta que facilita la comunicación entre profesionales del neurodesarrollo y mejora la interpretación clínica de las trayectorias del desarrollo.
