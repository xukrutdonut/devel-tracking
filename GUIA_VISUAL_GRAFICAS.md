# Guía Visual de las Nuevas Gráficas

## Vista General

Ahora el sistema muestra **4 gráficas complementarias** que proporcionan un análisis completo del desarrollo:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Seguimiento del Neurodesarrollo Infantil                │
├─────────────────────────────────────────────────────────────┤
│  [👶 Niños] [✅ Hitos] [🚩 Señales] [📈 Gráficas]         │
└─────────────────────────────────────────────────────────────┘

Cuando haces clic en "📈 Gráficas", verás:

┌───────────────────────────────────────────────────────────┐
│ 1️⃣ EDAD DE DESARROLLO VS EDAD CRONOLÓGICA                │
│                                                             │
│    ↑ Edad                                                   │
│    │ Desarrollo    ╱ Línea 45° (desarrollo típico)        │
│  60│             ╱                                          │
│    │           ╱ •──•──•  (progreso del niño)             │
│  40│         ╱                                              │
│    │       ╱                                                │
│  20│     ╱                                                  │
│    │   ╱                                                    │
│   0└──────────────────────> Edad Cronológica              │
│      0    20    40    60                                   │
│                                                             │
│  💡 Puntos SOBRE la línea = desarrollo adelantado         │
│  💡 Puntos BAJO la línea = desarrollo más lento           │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 2️⃣ VELOCIDAD DE DESARROLLO                                │
│                                                             │
│    ↑ Velocidad                                             │
│ 1.5│     •──────•                                          │
│    │           ╱ ╲                                          │
│ 1.2│- - - - -╱- - ╲- - - - (umbral superior)             │
│    │       ╱       ╲                                        │
│ 1.0│═════════════════════════ (típico)                    │
│    │                 ╲     •                               │
│ 0.8│- - - - - - - - - ╲- - - (umbral inferior)           │
│    │                   ╲                                    │
│ 0.5│                    •                                   │
│   0└──────────────────────> Edad Cronológica              │
│                                                             │
│  💡 1.0 = progreso típico (1 mes de desarrollo/mes)       │
│  💡 >1.0 = progreso acelerado                             │
│  💡 <1.0 = progreso más lento                             │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 3️⃣ ACELERACIÓN DE DESARROLLO                              │
│                                                             │
│    ↑ Aceleración                                           │
│ 0.3│        •                                              │
│    │      ╱ ╲        📈 (mejorando)                        │
│ 0.1│    ╱   ╲                                              │
│   0│═══════════•═════════════ (constante)                 │
│    │             ╲                                          │
│-0.1│              ╲   •     📉 (desacelerando)            │
│    │               ╲╱                                       │
│-0.3│                •                                       │
│    └──────────────────────> Edad Cronológica              │
│                                                             │
│  💡 Positiva = el ritmo está mejorando                    │
│  💡 Cerca de 0 = ritmo estable                            │
│  💡 Negativa = el ritmo está disminuyendo                 │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 4️⃣ PUNTUACIONES Z (DESVIACIONES ESTÁNDAR)                │
│                                                             │
│    ↑ Z-Score                                               │
│  +2│- - - - - - - - - - - - - - (muy alto)               │
│    │                                                        │
│  +1│- - - - - - - - - - - - - - (alto)                   │
│    │           •──•──•                                     │
│   0│════════════════════════════ (promedio)               │
│    │                                                        │
│  -1│- - - - - - - - - - - - - - (bajo)                   │
│    │                                                        │
│  -2│- - - - - - - - - - - - - - (muy bajo)               │
│    └──────────────────────> Edad Cronológica              │
│                                                             │
│  💡 Entre -1 y +1: rango normal (68% población)          │
│  💡 Entre -2 y +2: rango amplio (95% población)          │
│  💡 Fuera de ±2: requiere atención especial              │
└───────────────────────────────────────────────────────────┘
```

## Casos de Uso Típicos

### Caso 1: Desarrollo Normal
```
Edad vs Cronológica: Puntos cercanos a la línea 45°
Velocidad:          Constante alrededor de 1.0
Aceleración:        Cerca de 0 (estable)
Z-Score:            Entre -1 y +1
```

### Caso 2: Respuesta Positiva a Terapia
```
Edad vs Cronológica: Puntos comenzando bajo la línea, 
                     acercándose progresivamente
Velocidad:          Aumentando de <1.0 a ≈1.0
Aceleración:        Positiva (📈 mejorando)
Z-Score:            Aumentando hacia 0
```

### Caso 3: Alerta - Desaceleración
```
Edad vs Cronológica: Puntos alejándose de la línea
Velocidad:          Disminuyendo
Aceleración:        Negativa (📉 empeorando)
Z-Score:            Disminuyendo
```

### Caso 4: Desarrollo Avanzado
```
Edad vs Cronológica: Puntos consistentemente sobre la línea
Velocidad:          >1.0 constante
Aceleración:        Cerca de 0 (estable pero rápido)
Z-Score:            Positivo (+1 a +2)
```

## Tooltips Interactivos

Al pasar el ratón sobre cualquier punto, verás información detallada:

**Gráfica 1 - Edad de Desarrollo:**
```
┌────────────────────────────────┐
│ Edad Cronológica: 24.5 meses   │
│ Edad de Desarrollo: 26.2 meses │
│ ✅ Ligero adelanto (+1.7 meses)│
│                                 │
│ Hitos evaluados:                │
│ • Motor Grueso: 3 hitos        │
│ • Lenguaje: 2 hitos            │
└────────────────────────────────┘
```

**Gráfica 2 - Velocidad:**
```
┌────────────────────────────────┐
│ Edad: 24.5 meses               │
│ Velocidad: 1.12                │
│ 112% del desarrollo esperado   │
│ ✅ Desarrollo típico a rápido  │
└────────────────────────────────┘
```

**Gráfica 3 - Aceleración:**
```
┌────────────────────────────────┐
│ Edad: 24.5 meses               │
│ Aceleración: 0.08              │
│ 📈 Acelerando (mejorando)      │
└────────────────────────────────┘
```

**Gráfica 4 - Z-Score:**
```
┌────────────────────────────────┐
│ Edad: 24.5 meses               │
│ Puntuación Z: 0.45             │
│ Diferencia: +1.7 meses         │
│ ✅ Dentro del rango normal     │
└────────────────────────────────┘
```

## Orden de Análisis Recomendado

1. **Primero**: Mirar la gráfica de Edad de Desarrollo para ver la tendencia general
2. **Segundo**: Revisar la Velocidad para entender el ritmo de progreso
3. **Tercero**: Analizar la Aceleración para detectar cambios en el ritmo
4. **Cuarto**: Consultar los Z-Scores para contextualizar respecto a la población

## Interpretación Integrada

### Pregunta: ¿El niño está progresando adecuadamente?
→ **Mira:** Gráfica 1 (posición respecto a línea) + Gráfica 4 (Z-score)

### Pregunta: ¿La terapia está funcionando?
→ **Mira:** Gráfica 2 (velocidad aumentando) + Gráfica 3 (aceleración positiva)

### Pregunta: ¿Hay señales de estancamiento?
→ **Mira:** Gráfica 2 (velocidad disminuyendo) + Gráfica 3 (aceleración negativa)

### Pregunta: ¿Cuándo derivar a especialista?
→ **Mira:** Gráfica 4 (Z-score < -2) + Gráfica 2 (velocidad < 0.6)

## Acceso Rápido

La aplicación está disponible en:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001

Para ver las gráficas:
1. Selecciona un niño de la lista
2. Haz clic en "📈 Gráficas" en el menú de navegación
3. Las 4 gráficas se muestran automáticamente una debajo de otra

## Notas Importantes

⚠️ **Datos Mínimos Requeridos:** Se necesitan al menos 2 evaluaciones con hitos registrados para calcular velocidad, y 3 para aceleración.

⚠️ **Interpretación Clínica:** Estas gráficas son herramientas de apoyo. La decisión clínica debe considerar factores adicionales y contexto individual.

✅ **Actualización Automática:** Al registrar nuevos hitos, las gráficas se actualizan inmediatamente.

✅ **Filtros Disponibles:** Puedes ver desarrollo global o por dominios específicos (Motor, Lenguaje, etc.)
