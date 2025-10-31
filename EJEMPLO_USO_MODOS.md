# Ejemplos de Uso de los Modos de Evaluación

## Ejemplo 1: Evaluación Puntual de Cribado

### Contexto
Pediatra evalúa a Miguel de 15 meses en consulta rutinaria.

### Proceso

1. **Configuración inicial**
   ```
   Modo: Evaluación Puntual
   Fecha de evaluación: 20/12/2024
   Edad calculada: 15 meses
   ```

2. **Hitos presentados inicialmente** (13-17 meses)
   - Camina solo
   - Usa cuchara
   - Dice "mamá" y "papá" con significado
   - Señala para pedir cosas
   - Imita tareas domésticas

3. **Evaluación rápida**
   ```
   ✓ Camina solo → Conseguido (se registra a 15 meses)
   ✓ Usa cuchara → Conseguido (se registra a 15 meses)
   ✗ Dice "mamá" y "papá" → No alcanzado
   ✓ Señala para pedir → Conseguido (se registra a 15 meses)
   ✗ Imita tareas → No alcanzado
   ```

4. **Sistema detecta evaluación completa y expande automáticamente**
   ```
   ┌──────────────────────────────────────────────────────┐
   │ 🔄 Expandiendo automáticamente el rango...          │
   │    Se detectaron 2 hito(s) no alcanzado(s).         │
   │    Mostrando hitos de edades anteriores.            │
   └──────────────────────────────────────────────────────┘
   ```

5. **Expansión automática progresiva**
   - Sistema expande automáticamente a 11-17 meses (sin intervención)
   - Pediatra evalúa hitos adicionales de 11-13 meses
   - Proceso continúa automáticamente hasta encontrar 100% de hitos conseguidos

### Resultado
- Evaluación rápida (5-10 minutos)
- Identificado nivel basal de desarrollo
- Detectadas áreas de retraso específicas

---

## Ejemplo 2: Evaluación Longitudinal Detallada

### Contexto
Madre de Ana (24 meses) tiene registro detallado en libreta del bebé.

### Proceso

1. **Configuración inicial**
   ```
   Modo: Evaluación Longitudinal
   Hitos mostrados: Todos desde 0 hasta 26 meses
   ```

2. **Registro de hitos motores gruesos**
   ```
   ✓ Control cefálico → "¿A qué edad?" → 3 meses
   ✓ Sedestación sin apoyo → "¿A qué edad?" → 6.5 meses
   ✓ Gateo → "¿A qué edad?" → 8 meses
   ✓ Bipedestación con apoyo → "¿A qué edad?" → 10 meses
   ✓ Primeros pasos → "¿A qué edad?" → 13 meses
   ✓ Corre → "¿A qué edad?" → 18 meses
   ✓ Sube escaleras → "¿A qué edad?" → 22 meses
   ```

3. **Registro de hitos del lenguaje**
   ```
   ✓ Balbuceo → "¿A qué edad?" → 5 meses
   ✓ "Mamá" / "Papá" inespecífico → "¿A qué edad?" → 9 meses
   ✓ "Mamá" / "Papá" específico → "¿A qué edad?" → 12 meses
   ✓ 3-5 palabras → "¿A qué edad?" → 14 meses
   ✓ 10-20 palabras → "¿A qué edad?" → 18 meses
   ✓ Frases 2 palabras → "¿A qué edad?" → 21 meses
   ```

4. **Hitos no recordados**
   ```
   ✗ Algunos hitos específicos → No alcanzado
   (Se marcan para evaluación futura)
   ```

### Resultado
- Historia completa de desarrollo
- Datos precisos para análisis de curvas
- Identificación de patrón de desarrollo individual
- Tiempo: 20-30 minutos

---

## Ejemplo 3: Combinación de Modos

### Contexto
Familia de Carlos (18 meses), múltiples evaluadores con diferente información.

### Primera Sesión - Padre (Modo Puntual)
**Fecha:** 15/01/2024

```
Modo: Puntual
Fecha evaluación: 15/01/2024
Edad: 18 meses

Hitos evaluados (16-20 meses):
✓ Camina bien
✓ Sube a silla
✗ Corre (no alcanzado)
✓ Come con cuchara
✗ Se quita ropa (no alcanzado)
```

### Segunda Sesión - Madre (Modo Longitudinal)
**Fecha:** 20/01/2024

```
Modo: Longitudinal
Complementa información histórica:

✓ Sonrisa social → 2 meses
✓ Prensión voluntaria → 4 meses
✓ Sedestación → 7 meses
✓ Gateo → 9 meses
✓ Primeros pasos → 14 meses
✓ Primeras palabras → 13 meses
✓ Señala objetos → 11 meses
```

### Tercera Sesión - Terapeuta (Modo Puntual)
**Fecha:** 15/02/2024

```
Modo: Puntual
Fecha evaluación: 15/02/2024
Edad: 19 meses

Nuevos hitos evaluados:
✓ Corre (ahora conseguido) → 19 meses
✓ Sube escaleras con apoyo → 19 meses
✓ Combina 2 palabras → 19 meses
```

### Resultado Final
- **Trayectoria completa** desde nacimiento hasta 19 meses
- **Múltiples perspectivas** de diferentes evaluadores
- **Datos precisos** donde se conocen las edades exactas
- **Evaluaciones puntuales** de progreso reciente
- **Integración perfecta** de toda la información

---

## Ejemplo 4: Detección de Retraso con Modo Puntual

### Contexto
Laura (12 meses) acude a primera evaluación, sin información histórica.

### Evaluación Progresiva (Automática)

1. **Rango inicial: 10-14 meses**
   ```
   ✗ Todos los hitos → No alcanzado
   Sistema detecta: todos no alcanzados
   ```

2. **Expansión automática a 8-14 meses**
   ```
   🔄 Expandiendo automáticamente...
   
   ✓ Sedestación independiente → Conseguido (12 meses)
   ✓ Desplazamiento (arrastre) → Conseguido (12 meses)
   ✗ Gateo → No alcanzado
   ✗ Bipedestación con apoyo → No alcanzado
   ✗ Resto de hitos → No alcanzado
   
   Sistema detecta: aún hay hitos no alcanzados
   ```

3. **Expansión automática a 6-14 meses**
   ```
   🔄 Expandiendo automáticamente...
   
   ✓ Control cefálico → Conseguido (12 meses)
   ✓ Volteo → Conseguido (12 meses)
   ✓ Sedestación con apoyo → Conseguido (12 meses)
   [Continúa evaluación...]
   ```

4. **Resultado**
   - Detectado: nivel de desarrollo ~6-8 meses
   - Edad cronológica: 12 meses
   - Retraso identificado: ~4-6 meses
   - Requiere: evaluación especializada

### Ventaja del Modo Puntual con Expansión Automática
- Detección rápida y automática de retraso
- Identificación precisa del nivel funcional sin intervención manual
- No requiere información histórica
- Guía sistemática y automática hacia nivel basal
- Evaluador solo marca hitos, el sistema gestiona el rango

---

## Ejemplo 5: Actualización Periódica

### Contexto
Seguimiento mensual de Sofía (prematura 32 semanas), ahora 10 meses cronológicos.

### Mes 1 (Edad cronológica: 6 meses, corregida: 4 meses)
```
Modo: Puntual
Fecha: 15/07/2024
Sistema usa edad corregida: 4 meses
Hitos: 2-6 meses

✓ Control cefálico → 4 meses corregidos
✓ Volteo → 4 meses corregidos
✗ Sedestación con apoyo → No alcanzado
```

### Mes 2 (Edad cronológica: 8 meses, corregida: 6 meses)
```
Modo: Puntual  
Fecha: 15/09/2024
Sistema usa edad corregida: 6 meses
Hitos: 4-8 meses

✓ Sedestación con apoyo → 6 meses corregidos
✓ Prensión palmar → 6 meses corregidos
✗ Sedestación independiente → No alcanzado
```

### Mes 3 (Edad cronológica: 10 meses, corregida: 8 meses)
```
Modo: Puntual
Fecha: 15/11/2024
Sistema usa edad corregida: 8 meses
Hitos: 6-10 meses

✓ Sedestación independiente → 8 meses corregidos
✓ Gateo → 8 meses corregidos
✓ Alcanza objetos → 8 meses corregidos
```

### Ventaja
- Seguimiento sistemático del progreso
- Uso automático de edad corregida
- Historial claro de evolución
- Fácil identificación de tendencias

---

## Comparación de Modos en Diferentes Escenarios

| Escenario | Modo Recomendado | Tiempo | Precisión |
|-----------|------------------|---------|-----------|
| Primera consulta sin información | Puntual | 5-10 min | Media |
| Evaluación de cribado | Puntual | 5-10 min | Media |
| Padres con registros detallados | Longitudinal | 20-30 min | Alta |
| Seguimiento periódico | Puntual | 5-10 min | Media |
| Segunda opinión con nueva información | Longitudinal | Variable | Alta |
| Evaluación de equipo multidisciplinar | Ambos | Variable | Muy Alta |
| Detección de retraso | Puntual | 10-15 min | Media-Alta |
| Análisis de trayectoria completa | Longitudinal | 30-45 min | Muy Alta |

---

## Tips para Máximo Aprovechamiento

### Para Modo Puntual
1. Usar fecha actual para evaluaciones en tiempo real
2. Expandir progresivamente solo si hay preocupación
3. Marcar "no alcanzado" sin temor (se puede revisar después)
4. Ideal para evaluaciones periódicas consistentes

### Para Modo Longitudinal
1. Tener a mano registros previos (libreta del bebé, fotos, videos)
2. Consultar con otros cuidadores si hay duda
3. Si no se recuerda edad exacta, mejor usar modo puntual
4. Completar primero hitos más relevantes/preocupantes

### Para Combinación
1. Empezar con modo que tenga más información disponible
2. Complementar con el otro modo en sesiones posteriores
3. Diferentes evaluadores pueden usar diferentes modos
4. La visualización final integra todo automáticamente

---

## Preguntas Frecuentes con Ejemplos

**P: ¿Qué hago si empecé en modo puntual pero luego consigo las edades exactas?**

R: Puedes eliminar los registros puntuales y volver a registrarlos en modo longitudinal con las edades exactas. Ejemplo:
```
Antes (puntual): Camina solo → 15 meses (edad evaluación)
Después (longitudinal): Eliminar → Registrar como 13.5 meses (edad real)
```

**P: ¿Puedo cambiar entre modos durante la misma sesión?**

R: Sí, completamente. Ejemplo típico:
```
1. Empiezas en modo longitudinal (tienes datos históricos)
2. Registras hitos pasados con edades exactas
3. Cambias a puntual para hitos recientes que no recuerdas bien
4. Evalúas hitos actuales rápidamente
```

**P: ¿El sistema recomienda cuándo cambiar de modo?**

R: No automáticamente, pero hay indicadores:
- Si en puntual todos están conseguidos → quizás expandir o cambiar a longitudinal
- Si en longitudinal no recuerdas edades → cambiar a puntual
- Si tienes documentación detallada → longitudinal
- Si es evaluación rápida → puntual

---

## Conclusión

Los modos de evaluación ofrecen flexibilidad para adaptarse a cualquier situación clínica, desde evaluaciones rápidas de cribado hasta análisis detallados de trayectorias de desarrollo, siempre manteniendo la integridad de los datos y facilitando la colaboración entre múltiples evaluadores.
