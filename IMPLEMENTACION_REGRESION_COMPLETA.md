# Implementación Completa de Regresión del Desarrollo

## Fecha
1 de noviembre de 2024

## Problema Identificado

La representación anterior de regresión del desarrollo no reflejaba el fenómeno clínico real, que implica **pérdida de habilidades ya adquiridas**, no solo un estancamiento en la adquisición de nuevas habilidades.

### Definición Clínica de Regresión
**Regresión del desarrollo** es la pérdida de habilidades previamente adquiridas. Es característico de:
- Trastorno del Espectro Autista (regresión autística)
- Trastornos neurodegenerativos
- Síndrome de Rett
- Epilepsias severas

---

## Solución Implementada

### 1. Modificaciones en la Base de Datos

#### Tabla: `hitos_conseguidos`
Se agregaron dos nuevas columnas:

```sql
ALTER TABLE hitos_conseguidos ADD COLUMN edad_perdido_meses REAL
ALTER TABLE hitos_conseguidos ADD COLUMN fecha_perdido DATE
```

**Campos:**
- `edad_perdido_meses`: Edad cronológica (en meses) cuando se perdió el hito
- `fecha_perdido`: Fecha cuando se registró la pérdida del hito

**Archivo modificado:** `server/database.js`

---

### 2. Modificaciones en el API

#### Endpoint POST `/api/hitos-conseguidos`
**Modificado para aceptar información de pérdida:**

```javascript
{
  nino_id: 1,
  hito_id: 15,
  edad_conseguido_meses: 12.5,
  fecha_registro: "2024-01-15",
  edad_perdido_meses: 18.2,  // NUEVO
  fecha_perdido: "2024-07-10" // NUEVO
}
```

#### Nuevo Endpoint PUT `/api/hitos-conseguidos/:id/registrar-perdida`
**Para registrar pérdida de un hito ya existente:**

```javascript
PUT /api/hitos-conseguidos/123/registrar-perdida
{
  edad_perdido_meses: 20.0,
  fecha_perdido: "2024-08-15"
}
```

**Archivo modificado:** `server/server.js`

---

### 3. Modificaciones en la Generación de Ejemplos

#### Perfil de Regresión - Nueva Lógica

**Características:**
- Desarrollo normal hasta 18 meses
- A partir de 18 meses: pérdida de hitos en dominios vulnerables
- Dominios más afectados: Social-Emocional (ID 5), Lenguaje Receptivo (ID 3), Lenguaje Expresivo (ID 4)

**Algoritmo:**
```javascript
Para cada hito:
  1. Se adquiere normalmente en su edad esperada
  2. SI fue adquirido antes de los 18 meses Y 
     SI pertenece a dominios vulnerables (3, 4, 5)
     ENTONCES se pierde entre 18-21 meses
  3. Se registra con edad_conseguido Y edad_perdido
```

**Ejemplo:**
- Hito: "Dice mamá/papá con significado" (12 meses, Lenguaje Expresivo)
  - edad_conseguido: 12.3 meses
  - edad_perdido: 18.7 meses

**Archivo modificado:** `src/components/EjemplosClinicos.jsx`

---

### 4. Modificaciones en la Visualización

#### Sistema de Eventos Temporales

La visualización ahora procesa dos tipos de eventos:

1. **Eventos de Adquisición:** Cuando se consigue un hito
2. **Eventos de Pérdida:** Cuando se pierde un hito

**Algoritmo de Procesamiento:**

```javascript
// 1. Crear eventos temporales
hitosConEdadDesarrollo.forEach(hito => {
  eventos.push({
    edad: hito.edad_conseguido,
    tipo: 'adquisicion',
    hito: hito
  });
  
  if (hito.edad_perdido) {
    eventos.push({
      edad: hito.edad_perdido,
      tipo: 'perdida',
      hito: hito
    });
  }
});

// 2. Ordenar eventos cronológicamente
eventos.sort((a, b) => a.edad - b.edad);

// 3. Calcular edad desarrollo en cada punto temporal
// manteniendo solo hitos activos (no perdidos)
```

**Resultado:**
- La edad de desarrollo **aumenta** cuando se adquiere un hito
- La edad de desarrollo **disminuye** cuando se pierde un hito

**Archivo modificado:** `src/components/GraficoDesarrollo.jsx`

---

## Visualización Esperada

### Gráfica: Edad de Desarrollo vs Edad Cronológica

```
Edad Desarrollo (meses)
      ^
   24 |
      |
   18 |           ••   
      |         ••  ••  ← Regresión: edad desarrollo baja
   15 |       ••      •••
      |     ••           ••
   12 |   ••               ← Puntos después de 18m más bajos
      | ••
    6 |•
      |
    0 +---------------------------------> Edad Cronológica
        0    6   12   18   24   30
```

**Características:**
1. **Fase 0-18 meses:** Línea diagonal ascendente (desarrollo normal)
2. **Fase 18-21 meses:** Caída visible de puntos (pérdida de hitos)
3. **Fase 21+ meses:** Línea más baja y/o plana (desarrollo reducido)

### Interpretación de la Trayectoria

- **Punto A (12m, 12m):** Desarrollo normal
- **Punto B (18m, 18m):** Último punto antes de regresión
- **Punto C (20m, 14m):** Después de perder hitos - edad desarrollo cayó a 14m
- **Punto D (24m, 15m):** Desarrollo muy lento post-regresión

---

## Ejemplo Clínico Completo

### Niño: Ana - 30 meses

#### Hitos Adquiridos Normalmente (0-18 meses)

| Edad | Hito | Dominio | Estado |
|------|------|---------|--------|
| 6m | Sostiene cabeza | Motor Grueso | ✓ Mantenido |
| 9m | Se sienta solo | Motor Grueso | ✓ Mantenido |
| 12m | Dice "mamá" | Lenguaje | ✗ Perdido a 18.5m |
| 15m | Señala objetos | Social | ✗ Perdido a 19.2m |
| 18m | Camina solo | Motor Grueso | ✓ Mantenido |

#### Resultado a los 30 meses

**Hitos Activos:**
- Motor grueso: 3 hitos (máximo: 18m)
- Lenguaje: 0 hitos (todos perdidos)
- Social: 0 hitos (todos perdidos)

**Edad de Desarrollo:** ~10-12 meses (solo hitos motores mantenidos)

**Edad Cronológica:** 30 meses

**Diferencia:** -18 a -20 meses (regresión severa)

---

## Impacto en las Gráficas

### 1. Edad de Desarrollo vs Cronológica
- **Muestra inversión clara:** Puntos suben, luego bajan
- **Trayectoria visible:** Diagonal → Caída → Meseta baja

### 2. Velocidad de Desarrollo
- **Velocidad normal (1.0) hasta 18m**
- **Velocidad negativa alrededor de 18m** (pérdida = velocidad <0)
- **Velocidad muy reducida después** (~0.1-0.3)

### 3. Aceleración
- **Aceleración fuertemente negativa** en el punto de regresión
- **Pico negativo muy pronunciado** alrededor de 18-20m

### 4. Z-Score
- **Z-score normal hasta 18m** (≈0)
- **Z-score muy negativo después** (< -2 o -3)
- **Divergencia creciente** del desarrollo típico

---

## Ventajas de esta Implementación

### 1. Realismo Clínico
✓ Refleja el fenómeno real de pérdida de habilidades
✓ Permite distinguir entre estancamiento y regresión
✓ Facilita identificación de patrones autistas

### 2. Capacidad Diagnóstica
✓ Registra qué hitos se pierden
✓ Registra cuándo se pierden
✓ Permite análisis de dominios afectados

### 3. Seguimiento Longitudinal
✓ Rastrea evolución completa
✓ Identifica momentos críticos
✓ Evalúa efectividad de intervenciones

### 4. Flexibilidad
✓ Aplicable a cualquier dominio
✓ Permite regresiones parciales
✓ Soporta regresiones múltiples

---

## Uso Clínico

### Registro Manual (Futuro)
Los clínicos podrán:
1. Registrar hito conseguido normalmente
2. Posteriormente marcar el hito como "perdido"
3. Especificar edad/fecha de pérdida
4. Ver inmediatamente el impacto en la gráfica

### Identificación de Patrones
- **Regresión autística:** Pérdida de lenguaje y habilidades sociales 18-24m
- **Rett:** Pérdida de habilidades motoras finas 12-18m
- **Degenerativo:** Pérdida progresiva en múltiples dominios

---

## Archivos Modificados

### Base de Datos y API
- `server/database.js` - Schema con nuevas columnas
- `server/server.js` - Endpoints actualizados

### Frontend
- `src/components/EjemplosClinicos.jsx` - Generación de perfil regresión
- `src/components/GraficoDesarrollo.jsx` - Procesamiento de eventos temporales

---

## Testing Recomendado

### 1. Crear Ejemplo de Regresión
```
1. Ir a "Ejemplos Clínicos"
2. Click en "Crear Ejemplo" - "Regresión del Desarrollo"
3. Esperar confirmación
```

### 2. Verificar Gráfica Principal
```
✓ Puntos ascienden hasta ~18 meses
✓ Puntos descienden o se estancan después de 18 meses
✓ Línea de tendencia muestra inflexión
✓ Edad desarrollo final < 15 meses
```

### 3. Verificar Gráfica de Velocidad
```
✓ Velocidad ~1.0 hasta 18m
✓ Velocidad negativa o cercana a 0 en 18-21m
✓ Velocidad muy reducida después
```

### 4. Verificar Estadísticas
```
✓ CD global < 0.5
✓ Dominios social y lenguaje muy afectados
✓ Dominio motor menos afectado
```

---

## Próximos Pasos

### Interfaz de Usuario
- [ ] Botón "Marcar como perdido" en lista de hitos
- [ ] Modal para registrar fecha/edad de pérdida
- [ ] Indicador visual de hitos perdidos (tachado, color rojo)
- [ ] Filtro para ver solo hitos activos/perdidos

### Reportes
- [ ] Sección específica de regresión en informe clínico
- [ ] Lista de hitos perdidos con fechas
- [ ] Gráfica específica de eventos de pérdida

### Análisis Avanzado
- [ ] Detección automática de posible regresión
- [ ] Alerta si se pierden >2 hitos en <6 meses
- [ ] Comparación con patrones típicos de regresión

---

## Notas Técnicas

### Manejo de Estado
Los hitos activos se calculan acumulativamente:
- Inicialmente: conjunto vacío
- +1 por cada adquisición
- -1 por cada pérdida
- Estado en cada momento = suma acumulativa

### Ordenamiento de Eventos
Eventos en la misma edad se procesan:
1. Primero adquisiciones
2. Luego pérdidas

Esto evita inconsistencias si un hito se adquiere y pierde en edades muy cercanas.

### Compatibilidad
- Hitos sin `edad_perdido` se tratan como normales (no perdidos)
- Sistema completamente compatible con registros anteriores
- Migración automática de BD sin pérdida de datos

---

## Conclusión

Esta implementación permite representar correctamente el fenómeno clínico de **regresión del desarrollo**, capturando la pérdida real de habilidades y su impacto en las trayectorias de desarrollo. El sistema ahora puede:

1. **Registrar** pérdidas de hitos
2. **Visualizar** inversiones de trayectoria
3. **Analizar** patrones de regresión
4. **Diferenciar** entre regresión y estancamiento

La representación gráfica ahora refleja fielmente lo que sucede en casos como la regresión autística, donde niños con desarrollo inicial normal pierden habilidades en áreas específicas.
