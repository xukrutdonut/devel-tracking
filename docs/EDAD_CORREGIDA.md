# Edad Corregida para Niños Pretérmino

## Descripción

El sistema ahora soporta el cálculo de edad corregida para niños nacidos prematuramente (pretérmino), lo cual es esencial para una evaluación precisa del desarrollo neurológico.

## ¿Qué es la Edad Corregida?

La edad corregida es la edad que tendría un niño si hubiera nacido a término (40 semanas de gestación). Se utiliza para evaluar el desarrollo de niños pretérmino, especialmente durante los primeros 2-3 años de vida.

## Cálculo de la Edad Corregida

**Fórmula:**
```
Edad Corregida (meses) = Edad Cronológica (meses) - ((40 - Semanas de Gestación) / 4)
```

**Ejemplo:**
- Niño con 12 meses de edad cronológica
- Nacido a las 32 semanas de gestación
- Corrección: (40 - 32) / 4 = 2 meses
- Edad corregida: 12 - 2 = 10 meses

## ¿Cuándo se Aplica?

- Se considera pretérmino cualquier nacimiento antes de las 37 semanas de gestación
- La corrección se aplica automáticamente cuando se registran menos de 37 semanas
- Para niños a término (≥37 semanas), la edad corregida es igual a la cronológica

## Clasificación de Prematuridad

| Clasificación | Semanas de Gestación |
|---------------|---------------------|
| Término completo | 37-42 semanas |
| Pretérmino tardío | 34-36 semanas |
| Pretérmino moderado | 32-33 semanas |
| Muy pretérmino | 28-31 semanas |
| Extremadamente pretérmino | <28 semanas |

## Uso en el Sistema

### 1. Registro de Niños

Al crear un nuevo niño, se solicita:
- **Nombre**
- **Fecha de Nacimiento**
- **Semanas de Gestación al Nacer** (valor por defecto: 40)

Si se ingresan menos de 37 semanas, el sistema mostrará una advertencia indicando que se calculará la edad corregida.

### 2. Visualización de Edades

En la lista de niños:
- Niños a término: Se muestra solo la edad en meses
- Niños pretérmino: Se muestra "X meses (corregida: Y meses)"

Ejemplo: "14 meses (corregida: 12.5 meses)"

### 3. Evaluación de Hitos

En el registro de hitos del desarrollo:
- Para niños pretérmino, se muestra tanto la edad cronológica como la corregida
- Los hitos relevantes se filtran según la **edad corregida**
- Esto asegura que se evalúen hitos apropiados para su desarrollo real

## Importancia Clínica

### ¿Por Qué es Importante?

1. **Evaluación Precisa**: Los niños pretérmino no han tenido el mismo tiempo de desarrollo intrauterino
2. **Evita Diagnósticos Erróneos**: Sin corrección, podrían parecer retrasados cuando su desarrollo es normal
3. **Intervención Apropiada**: Permite identificar verdaderos retrasos que requieren intervención

### ¿Hasta Cuándo se Debe Corregir?

La práctica clínica varía, pero generalmente:
- **Motor grueso**: Hasta los 18-24 meses
- **Motor fino y cognitivo**: Hasta los 24-30 meses
- **Lenguaje**: Hasta los 24-36 meses

## Ejemplo Práctico

**Caso:** Sofía nació a las 30 semanas de gestación y hoy tiene 15 meses de edad cronológica.

**Cálculo:**
```
Corrección = (40 - 30) / 4 = 2.5 meses
Edad corregida = 15 - 2.5 = 12.5 meses
```

**Evaluación:**
- Se deben esperar hitos correspondientes a ~12-13 meses, no a 15 meses
- Ejemplo: Si Sofía aún no camina sola, esto es normal para 12.5 meses
- Sin corrección, podría parecer retrasada incorrectamente

## Referencias

- American Academy of Pediatrics. (2004). Age Terminology During the Perinatal Period. Pediatrics, 114(5), 1362-1364.
- WHO. (2006). WHO Child Growth Standards: Length/height-for-age, weight-for-age, weight-for-length, weight-for-height and body mass index-for-age.
- Canadian Paediatric Society. (2017). Assessment of the infant born to a mother who used drugs during pregnancy.

## Implementación Técnica

### Archivos Modificados

1. **`server/database.js`**: 
   - Añadido campo `semanas_gestacion` a tabla `ninos`
   - Migración automática para bases de datos existentes

2. **`server/server.js`**: 
   - Actualizado endpoint POST `/api/ninos` para aceptar semanas de gestación

3. **`src/utils/ageCalculations.js`** (NUEVO):
   - `calcularEdadCronologicaMeses()`: Calcula edad desde fecha de nacimiento
   - `calcularEdadCorregidaMeses()`: Aplica corrección por prematuridad
   - `esPretermino()`: Determina si un niño es pretérmino
   - `formatearEdades()`: Formatea edades para visualización

4. **`src/components/NinoForm.jsx`**:
   - Campo de entrada para semanas de gestación
   - Validación (rango 22-42 semanas)
   - Advertencia visual para pretérminos

5. **`src/components/NinosList.jsx`**:
   - Muestra semanas de gestación para pretérminos
   - Formato de edad diferenciado

6. **`src/components/HitosRegistro.jsx`**:
   - Usa edad corregida para filtrar hitos relevantes
   - Muestra ambas edades en estadísticas
   - Tarjeta destacada para edad corregida

7. **`src/App.css`**:
   - Estilos para campos y advertencias de gestación
   - Estilo destacado para edad corregida

## Próximas Mejoras Sugeridas

1. **Configuración de Corrección**:
   - Permitir desactivar corrección por edad para ciertos dominios
   - Configurar hasta qué edad se aplica corrección

2. **Gráficas Especializadas**:
   - Curvas de crecimiento específicas para pretérminos
   - Visualización doble (cronológica vs corregida)

3. **Reportes**:
   - Incluir edad corregida en informes
   - Historial de evaluaciones con ambas edades

4. **Alertas Inteligentes**:
   - Recordatorios cuando el niño alcance edad para dejar de corregir
   - Notas sobre dominios donde ya no es necesaria la corrección
