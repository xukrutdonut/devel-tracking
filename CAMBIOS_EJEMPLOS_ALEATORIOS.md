# Cambios: Generación Aleatoria de Ejemplos Clínicos

## Fecha
Enero 2025

## Objetivo
Permitir la generación de múltiples ejemplos clínicos con la misma trayectoria de desarrollo pero con variabilidad aleatoria, facilitando la comparación de diferentes realizaciones del mismo patrón clínico.

## Problema Anterior
- Los ejemplos generados tenían nombres fijos y poca variabilidad
- No se podían crear múltiples instancias del mismo perfil clínico
- La variabilidad era inconsistente (usaba Math.random() directamente)
- Difícil comparar diferentes realizaciones de la misma trayectoria

## Solución Implementada

### 1. Nombres Aleatorios con Identificadores Únicos
```javascript
const nombresAleatorios = [
  'Sofía', 'Mateo', 'Isabella', 'Sebastián', 'Valentina', 'Santiago', 
  'Camila', 'Nicolás', 'Emma', 'Diego', 'Lucía', 'Miguel', 'María', 
  'Daniel', 'Victoria', 'Andrés', 'Martina', 'Gabriel', 'Julieta', 
  'David', 'Paula', 'Lucas', 'Carolina', 'Alejandro'
];

const generarNombreAleatorio = (perfil) => {
  const nombre = nombresAleatorios[Math.floor(Math.random() * nombresAleatorios.length)];
  const id = Math.floor(Math.random() * 1000);
  return `${nombre} #${id} - ${perfil}`;
};
```

**Ejemplo de nombres generados:**
- `Sofía #742 - Desarrollo Típico`
- `Mateo #123 - Regresión Desarrollo`
- `Isabella #891 - Retraso Global CD50`

### 2. Generación Dinámica de Datos del Niño
Cada perfil ahora usa una función generadora en lugar de datos fijos:

**Antes:**
```javascript
{
  id: 'desarrollo-tipico',
  nombre: 'Desarrollo Típico',
  ninoData: {
    nombre: 'María Ejemplo - Desarrollo Típico',  // Fijo
    fecha_nacimiento: calcularFechaNacimiento(24),
    semanas_gestacion: 40
  }
}
```

**Después:**
```javascript
{
  id: 'desarrollo-tipico',
  nombre: 'Desarrollo Típico',
  generarNinoData: () => ({
    nombre: generarNombreAleatorio('Desarrollo Típico'),  // Dinámico
    fecha_nacimiento: calcularFechaNacimiento(24),
    semanas_gestacion: 40
  })
}
```

### 3. Generador de Números Pseudoaleatorios Seeded
Implementación de un PRNG (Pseudo-Random Number Generator) con semilla:

```javascript
// Usar el ID del niño como semilla para consistencia por individuo
let seed = nino.id || Math.floor(Math.random() * 10000);
const random = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
```

**Ventajas:**
- **Reproducibilidad:** Cada niño tiene su propia secuencia aleatoria consistente
- **Variabilidad controlada:** Diferentes niños tienen diferentes patrones
- **Determinismo:** Con el mismo ID, siempre genera los mismos datos

### 4. Variabilidad Mejorada en Todos los Perfiles

#### Desarrollo Típico
```javascript
// ANTES: Variabilidad simple
const variabilidad = (Math.random() - 0.5) * hito.desviacion_estandar;

// AHORA: Variabilidad completa seeded
const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 2;
```

#### Retraso Global
```javascript
// AHORA incluye variabilidad además del factor de retraso
const factorRetraso = perfil.cd / 100;
const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 0.5;
const edadConseguido = (hito.edad_media_meses / factorRetraso) + variabilidad;
```

#### Regresión con Probabilidades
```javascript
// Probabilidad aleatoria de perder el hito (60-90%)
if (random() > 0.2) {
  const variabilidadPerdida = random() * 4; // 0-4 meses después
  hitoData.edad_perdido = edadRegresion + variabilidadPerdida;
}
```

## Características del Nuevo Sistema

### Mantiene Criterios Clínicos
Cada perfil mantiene sus criterios fundamentales:
- **Desarrollo Típico:** Hitos en edad esperada ± variabilidad normal
- **Retraso Global CD50:** Todos los dominios al 50% + variabilidad
- **TEA:** Social-emocional afectado, otros típicos/adelantados
- **Regresión:** Desarrollo normal → pérdida de hitos en dominios vulnerables

### Permite Comparación
Ahora se pueden crear múltiples ejemplos del mismo tipo:
```
- Sofía #123 - Desarrollo Típico
- Diego #456 - Desarrollo Típico
- Emma #789 - Desarrollo Típico
```

Y comparar sus trayectorias en las gráficas.

### Variabilidad Realista
La variabilidad sigue distribuciones biológicamente plausibles:
- Basada en desviaciones estándar normativas
- Respeta rangos esperados por dominio
- Mantiene coherencia interna por niño

## Casos de Uso

### Caso 1: Comparar Variabilidad Normal
Crear 3-5 ejemplos de "Desarrollo Típico" y observar:
- Diferentes trayectorias, todas dentro de lo normal
- Algunos niños más rápidos, otros más lentos
- Diferentes dominios predominantes

### Caso 2: Validar Detección de Patrones
Crear múltiples ejemplos de "Regresión" y verificar:
- Todos muestran caída en la línea de tendencia
- Alertas de regresión se activan correctamente
- Diferentes grados de severidad

### Caso 3: Comparar Respuesta a Intervención
Crear varios ejemplos de "Aceleración por Intervención" y analizar:
- Diferentes velocidades de mejora
- Variabilidad en punto de inicio
- Efectividad relativa

### Caso 4: Estudiar Perfiles Mixtos
Crear múltiples "Retraso Global + TEA" y observar:
- Consistencia del patrón desproporcionado
- Variabilidad en dominios no afectados
- Diferentes grados de severidad

## Ejemplos de Uso

### Crear Serie de Comparación
1. Click en "Crear Ejemplo" → "Desarrollo Típico" (5 veces)
2. Ver los 5 ejemplos creados con nombres únicos
3. Seleccionar cada uno y comparar sus gráficas
4. Observar que todos están dentro del rango normal pero con trayectorias diferentes

### Validar Sistema con Casos Extremos
1. Crear "Retraso Global CD50" (3 veces)
2. Crear "Desarrollo Típico" (3 veces)
3. Comparar las diferencias entre grupos
4. Verificar que el sistema distingue claramente entre ambos

## Beneficios

### Para Desarrollo
- Pruebas más robustas del sistema
- Validación de algoritmos con múltiples realizaciones
- Detección de casos edge

### Para Clínicos
- Entender variabilidad esperada en cada perfil
- Comparar casos similares
- Formación con múltiples ejemplos del mismo patrón

### Para Investigación
- Datos sintéticos para análisis
- Validación de métricas estadísticas
- Comparación de métodos de evaluación

## Detalles Técnicos

### Algoritmo PRNG
- **Método:** Linear Congruential Generator (LCG)
- **Fórmula:** `seed = (seed * 9301 + 49297) % 233280`
- **Período:** 233,280 números antes de repetirse
- **Distribución:** Uniforme en [0, 1)

### Transformación a Distribución Normal
Para variabilidad gaussiana:
```javascript
// Box-Muller transform (si se necesita)
const u1 = random();
const u2 = random();
const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
```

Actualmente se usa distribución uniforme escalada por desviación estándar.

### Consistencia de Semilla
- ID de niño → semilla única
- Misma semilla → mismos resultados
- Diferentes niños → diferentes patrones
- Permite reproducibilidad en debugging

## Archivos Modificados

- **`src/components/EjemplosClinicos.jsx`**
  - Línea ~11-25: Lista de nombres aleatorios y función generadora
  - Línea ~26-170: Perfiles con `generarNinoData()` en lugar de `ninoData`
  - Línea ~175-235: Función `crearEjemplo` actualizada
  - Línea ~238-470: Función `generarHitosPorPerfil` con PRNG seeded

## Limitaciones y Consideraciones

### Nombres Limitados
- Lista de 24 nombres
- Identificador numérico evita colisiones
- Expandible agregando más nombres

### Pseudo-aleatoriedad
- No es criptográficamente seguro
- Suficiente para propósitos clínicos/educativos
- Reproducible con misma semilla

### Variabilidad Acotada
- Siempre dentro de rangos biológicamente plausibles
- No genera outliers extremos
- Mantiene coherencia clínica

## Futuras Mejoras

### Corto Plazo
1. Permitir especificar semilla manualmente
2. Exportar/importar configuraciones de ejemplos
3. Previsualización antes de crear

### Mediano Plazo
1. Distribuciones de variabilidad configurables
2. Perfiles personalizados por usuario
3. Batch creation (crear N ejemplos de un tipo)

### Largo Plazo
1. Generación basada en datos reales anonimizados
2. Machine learning para patrones más realistas
3. Integración con bases de datos normativas

## Resumen

El nuevo sistema de generación aleatoria permite:
- ✅ Crear múltiples instancias del mismo perfil clínico
- ✅ Nombres únicos e identificables
- ✅ Variabilidad reproducible y consistente
- ✅ Mantener criterios clínicos fundamentales
- ✅ Facilitar comparación entre casos similares
- ✅ Mejorar validación y testing del sistema

Esto transforma la sección de ejemplos clínicos de un conjunto estático de demostraciones a una herramienta dinámica de comparación y aprendizaje.
