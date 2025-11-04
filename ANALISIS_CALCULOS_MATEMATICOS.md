# Análisis de Problemas en Cálculos de Análisis Matemático

## Problemas Identificados

### 1. PROBLEMA EN CONSTRUCCIÓN DE PUNTOS DE EVALUACIÓN

**Ubicación:** `/src/utils/trayectoriasUtils.js` - función `construirPuntosEvaluacion`

#### Problema Crítico: Agrupación por edad de logro

**Línea 47-51:**
```javascript
edadesLogro.forEach(edadLogro => {
    const hitosEnEdad = hitosMap.get(edadLogro);
    
    // Obtener TODOS los hitos conseguidos hasta esta edad (acumulativo)
    const hitosHastaEdad = hitosConseguidos.filter(h => h.edad_conseguido_meses <= edadLogro);
```

**¿Por qué es problemático?**

Si un niño consigue múltiples hitos en la misma edad, se crea UN SOLO punto de evaluación en esa edad. Esto puede:
- Reducir artificialmente el número de puntos de evaluación
- Hacer que falten datos para calcular derivadas
- Producir saltos abruptos en las gráficas

**Ejemplo:**
```
Hitos conseguidos:
- "Camina solo" a los 14 meses (ED normativa: 13 meses)
- "Sube escaleras" a los 14 meses (ED normativa: 18 meses)
- "Corre" a los 18 meses (ED normativa: 24 meses)

Resultado actual:
Punto 1: edad_meses=14, ED=(13+18)/2=15.5, CD=15.5/14*100=110.7%
Punto 2: edad_meses=18, ED=(13+18+24)/3=18.3, CD=18.3/18*100=101.7%

Solo 2 puntos → velocidad y aceleración limitadas
```

### 2. PROBLEMA EN CÁLCULO DE EDAD DE DESARROLLO (ED)

**Ubicación:** Línea 82-83 en `trayectoriasUtils.js`

```javascript
const ed = sumaEdadesNormativas / count;
const cd = (ed / edadLogro) * 100;
```

**Problema:** Se promedian las edades normativas de todos los hitos conseguidos HASTA ESA EDAD.

**Consecuencia:**
- El CD se calcula acumulativamente
- Cada nuevo hito influye retroactivamente en todos los puntos anteriores (NO CORRECTO)
- No representa el estado del niño en ese momento específico

**¿Qué debería ser?**
La edad de desarrollo en un punto debería reflejar el nivel de desarrollo en ESE momento, no un promedio de todos los hitos hasta entonces.

### 3. PROBLEMA EN CÁLCULO DE VELOCIDAD

**Ubicación:** `/src/components/AnalisisAceleracion.jsx` - línea 221-226

```javascript
const delta_tiempo = punto_actual.edad_meses - punto_anterior.edad_meses;
const delta_cd = cd_actual - cd_anterior;

if (delta_tiempo > 0) {
    punto.velocidad = delta_cd / delta_tiempo;
}
```

**Problema:** La velocidad se calcula entre puntos consecutivos que pueden tener deltas de tiempo muy irregulares.

**Ejemplo:**
```
Punto 1: edad=6m, CD=95%
Punto 2: edad=12m, CD=100%  → velocidad = (100-95)/(12-6) = 0.83 puntos/mes
Punto 3: edad=15m, CD=98%   → velocidad = (98-100)/(15-12) = -0.67 puntos/mes
```

Si los intervalos son irregulares, la velocidad no es comparable entre puntos.

### 4. PROBLEMA EN CÁLCULO DE ACELERACIÓN

**Ubicación:** `/src/components/AnalisisAceleracion.jsx` - línea 254-259

```javascript
const velocidad1 = delta_cd1 / delta_tiempo1;
const velocidad2 = delta_cd2 / delta_tiempo2;
const delta_tiempo_promedio = (delta_tiempo1 + delta_tiempo2) / 2;

punto.aceleracion = (velocidad1 - velocidad2) / delta_tiempo_promedio;
```

**Problema:** Se usa delta_tiempo_promedio para normalizar, pero esto no es correcto matemáticamente.

**Correcto sería:**
```javascript
// Aceleración = Δvelocidad / Δtiempo
const delta_velocidad = velocidad1 - velocidad2;
const delta_tiempo_entre_velocidades = punto_actual.edad_meses - punto_anterior2.edad_meses;
punto.aceleracion = delta_velocidad / delta_tiempo_entre_velocidades;
```

### 5. PROBLEMA: DATOS INSUFICIENTES

**Consecuencia de los problemas anteriores:**
- Con pocos puntos de evaluación (por agrupación), las derivadas son muy sensibles a errores
- Las gráficas muestran saltos abruptos en lugar de trayectorias suaves
- La aceleración puede dar valores extremos poco realistas

---

## PROPUESTAS DE SOLUCIÓN

### Solución 1: Cambiar Modelo de Puntos de Evaluación

**Opción A: Un punto por cada hito (RECOMENDADA)**

En lugar de agrupar por edad, crear un punto de evaluación por cada hito conseguido:

```javascript
export function construirPuntosEvaluacionPorHito(hitosConseguidos, hitosNormativos, dominios) {
  const puntosEvaluacion = [];
  
  // Ordenar hitos por edad de logro
  const hitosOrdenados = [...hitosConseguidos].sort((a, b) => 
    a.edad_conseguido_meses - b.edad_conseguido_meses
  );
  
  hitosOrdenados.forEach((hito, index) => {
    const hitoNormativo = hitosNormativos.find(hn => hn.id === hito.hito_id);
    if (!hitoNormativo) return;
    
    const edadConseguido = hito.edad_conseguido_meses;
    const edadNormativa = hitoNormativo.edad_media_meses;
    const cd = (edadNormativa / edadConseguido) * 100;
    
    // Obtener todos los hitos hasta este momento para CD global
    const hitosHastaAhora = hitosOrdenados.slice(0, index + 1);
    const cdGlobal = calcularCDGlobal(hitosHastaAhora, hitosNormativos);
    
    puntosEvaluacion.push({
      edad_meses: edadConseguido,
      hito_nombre: hito.nombre,
      dominio_id: hitoNormativo.dominio_id,
      cd_hito: cd,
      cd_global: cdGlobal,
      ed_normativa: edadNormativa
    });
  });
  
  return puntosEvaluacion;
}
```

**Ventajas:**
- Más puntos de evaluación → derivadas más estables
- Cada punto representa un evento real (logro de hito)
- No hay agrupaciones artificiales

**Opción B: Interpolación de puntos en intervalos regulares**

Crear puntos a intervalos fijos (ej: cada mes) e interpolar el CD:

```javascript
export function construirPuntosInterpolados(hitosConseguidos, hitosNormativos, edadInicio, edadFin, intervalo = 1) {
  const puntosEvaluacion = [];
  
  for (let edad = edadInicio; edad <= edadFin; edad += intervalo) {
    // Obtener hitos conseguidos hasta esta edad
    const hitosHastaEdad = hitosConseguidos.filter(h => h.edad_conseguido_meses <= edad);
    
    if (hitosHastaEdad.length === 0) continue;
    
    // Calcular CD basado en hitos hasta ese momento
    const cd = calcularCDEnEdad(hitosHastaEdad, hitosNormativos, edad);
    
    puntosEvaluacion.push({
      edad_meses: edad,
      cd: cd,
      n_hitos: hitosHastaEdad.length
    });
  }
  
  return puntosEvaluacion;
}
```

**Ventajas:**
- Intervalos regulares → velocidades comparables
- Suavizado natural de la trayectoria
- Fácil de interpretar

**Desventaja:**
- Introduce interpolación que puede no reflejar eventos reales

---

### Solución 2: Mejorar Cálculo de CD

**Problema actual:** CD se calcula acumulativamente

**Propuesta:** Usar ventana deslizante o ponderación temporal

```javascript
// CD ponderado por tiempo - más peso a hitos recientes
function calcularCDPonderado(hitosHastaEdad, hitosNormativos, edadActual) {
  let sumaEDPonderada = 0;
  let sumaPesos = 0;
  
  hitosHastaEdad.forEach(hito => {
    const hitoNorm = hitosNormativos.find(hn => hn.id === hito.hito_id);
    if (!hitoNorm) return;
    
    // Peso mayor a hitos más recientes
    const antiguedad = edadActual - hito.edad_conseguido_meses;
    const peso = Math.exp(-antiguedad / 6); // decay exponencial (6 meses = tau)
    
    sumaEDPonderada += hitoNorm.edad_media_meses * peso;
    sumaPesos += peso;
  });
  
  const edPonderada = sumaEDPonderada / sumaPesos;
  const cd = (edPonderada / edadActual) * 100;
  
  return cd;
}
```

**O bien, usar VENTANA DESLIZANTE:**

```javascript
// Solo considerar hitos de los últimos N meses
function calcularCDVentana(hitosHastaEdad, hitosNormativos, edadActual, ventanaMeses = 6) {
  const edadMinima = edadActual - ventanaMeses;
  
  const hitosRecientes = hitosHastaEdad.filter(h => 
    h.edad_conseguido_meses >= edadMinima
  );
  
  if (hitosRecientes.length === 0) return null;
  
  const edPromedio = hitosRecientes.reduce((sum, hito) => {
    const hitoNorm = hitosNormativos.find(hn => hn.id === hito.hito_id);
    return sum + (hitoNorm?.edad_media_meses || 0);
  }, 0) / hitosRecientes.length;
  
  return (edPromedio / edadActual) * 100;
}
```

---

### Solución 3: Corregir Cálculo de Aceleración

**Fórmula correcta:**

```javascript
function calcularAceleracionCorrecta(puntos, index) {
  if (index < 2) return null;
  
  const p0 = puntos[index - 2];
  const p1 = puntos[index - 1];
  const p2 = puntos[index];
  
  // Calcular velocidades
  const v1 = (p1.cd - p0.cd) / (p1.edad_meses - p0.edad_meses);
  const v2 = (p2.cd - p1.cd) / (p2.edad_meses - p1.edad_meses);
  
  // Aceleración = cambio de velocidad / tiempo entre puntos medios
  const tiempoMedio = (p2.edad_meses + p1.edad_meses) / 2 - (p1.edad_meses + p0.edad_meses) / 2;
  const aceleracion = (v2 - v1) / tiempoMedio;
  
  return aceleracion;
}
```

**O usar diferencias finitas de segundo orden:**

```javascript
function aceleracionDiferenciasFinitas(puntos, index) {
  if (index < 2) return null;
  
  const p0 = puntos[index - 2];
  const p1 = puntos[index - 1];
  const p2 = puntos[index];
  
  // Segunda derivada por diferencias finitas centradas
  // d²y/dx² ≈ (y[i-1] - 2*y[i] + y[i+1]) / h²
  
  const h1 = p1.edad_meses - p0.edad_meses;
  const h2 = p2.edad_meses - p1.edad_meses;
  const h_promedio = (h1 + h2) / 2;
  
  const aceleracion = (p0.cd - 2 * p1.cd + p2.cd) / (h_promedio * h_promedio);
  
  return aceleracion;
}
```

---

### Solución 4: Suavizado de Trayectorias

Para evitar saltos abruptos, aplicar suavizado:

```javascript
// Suavizado por promedio móvil
function suavizarPorPromedioMovil(puntos, ventana = 3) {
  const puntosSuavizados = [];
  
  for (let i = 0; i < puntos.length; i++) {
    const inicio = Math.max(0, i - Math.floor(ventana / 2));
    const fin = Math.min(puntos.length, i + Math.floor(ventana / 2) + 1);
    
    const ventanaDatos = puntos.slice(inicio, fin);
    const cdPromedio = ventanaDatos.reduce((sum, p) => sum + p.cd, 0) / ventanaDatos.length;
    
    puntosSuavizados.push({
      ...puntos[i],
      cd_suavizado: cdPromedio,
      cd_original: puntos[i].cd
    });
  }
  
  return puntosSuavizados;
}
```

**O usar regresión local (LOESS):**

```javascript
// Ajuste polinomial local para suavizado
function suavizarLoess(puntos, grado = 2, ventana = 5) {
  // Implementación de regresión polinomial local
  // Para cada punto, ajustar polinomio de grado 'grado' 
  // usando 'ventana' puntos cercanos
  
  // Esta es una implementación simplificada
  // En producción se usaría una librería como science.js o simple-statistics
  
  return puntos; // TODO: implementar LOESS
}
```

---

## RECOMENDACIÓN FINAL

### Implementación por Fases

**FASE 1 (INMEDIATA):**
1. Corregir cálculo de aceleración (usar fórmula correcta)
2. Añadir validación de datos (intervalos mínimos, valores extremos)
3. Añadir smoothing opcional a las gráficas

**FASE 2 (CORTO PLAZO):**
4. Cambiar a modelo de un punto por hito
5. Implementar interpolación para intervalos regulares
6. Añadir opción de ventana deslizante para CD

**FASE 3 (MEDIO PLAZO):**
7. Implementar suavizado LOESS o splines
8. Añadir intervalos de confianza para las derivadas
9. Validar con datos clínicos reales

---

## VALIDACIÓN NECESARIA

Para confirmar que los cálculos son correctos, necesitamos:

1. **Datos de prueba:** Crear casos de prueba con trayectorias conocidas
   ```
   Ejemplo 1: Desarrollo típico (CD constante ~100%)
   Ejemplo 2: Retraso estable (CD constante ~70%)
   Ejemplo 3: Aceleración (CD aumenta de 70% a 90%)
   Ejemplo 4: Desaceleración (CD disminuye de 110% a 95%)
   ```

2. **Verificación manual:** Calcular a mano las derivadas de los ejemplos

3. **Comparación con literatura:** Verificar que los valores de velocidad y aceleración están en rangos razonables según la literatura científica

---

## PREGUNTAS PARA DECISIÓN

1. **¿Prefieres un punto por hito o intervalos regulares?**
   - Punto por hito: más preciso, más puntos
   - Intervalos regulares: más suave, comparable

2. **¿Qué ventana temporal para CD?**
   - Acumulativo (actual): historia completa
   - Ventana deslizante: estado reciente (ej: 6 meses)
   - Ponderado: balance entre ambos

3. **¿Aplicar suavizado?**
   - Sí: trayectorias más interpretables
   - No: datos "crudos" más fieles a observaciones

4. **¿Mostrar intervalos de confianza?**
   - Útil para interpretar incertidumbre
   - Requiere bootstrap o estimación de error

Por favor, indícame qué enfoque prefieres y puedo implementar las correcciones.
