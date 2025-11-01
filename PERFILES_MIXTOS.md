# Perfiles Mixtos de Desarrollo

## Fecha
1 de noviembre de 2024

## Nuevos Perfiles Clínicos Implementados

Se han agregado dos nuevos perfiles clínicos que representan situaciones complejas donde existe un retraso global del desarrollo con afectación desproporcionada de un dominio específico.

### Criterio Definitorio

**Afectación Desproporcionada:** El dominio específico debe estar desproporcionadamente afectado, es decir, más de 2 desviaciones estándar (DE) por debajo del promedio del resto de las áreas de desarrollo.

---

## 1. Retraso Global + TEA

### Identificador
`retraso-global-tea`

### Características
- **Icono:** 🔵🧩
- **Color:** #8b5cf6 (morado)
- **Edad del niño:** 36 meses

### Perfil Clínico
- **CD Base:** 60 (retraso global del 40%)
- **Dominio desproporcionado:** Social-Emocional (ID: 5)
- **Factor de desproporción:** 0.5 (50% del CD base)
- **CD efectivo del dominio afectado:** 30 (retraso del 70%)

### Descripción
Retraso global del desarrollo con coeficiente de desarrollo del 60%, pero con afectación desproporcionada del área social-emocional, alcanzando un CD efectivo de solo 30 en ese dominio.

### Interpretación Clínica
Este patrón sugiere un niño con:
- Retraso global moderado en todas las áreas
- Afectación severa adicional en el área social-emocional
- Perfil compatible con TEA sobre una base de retraso global
- La diferencia entre el CD social-emocional (30) y el CD promedio de otras áreas (60) es de 30 puntos, equivalente a más de 2 DE

### Cálculo de Edades de Consecución
- **Dominios no afectados:** `edad_conseguido = edad_normativa / 0.60`
- **Dominio social-emocional:** `edad_conseguido = edad_normativa / 0.30`

**Ejemplo:**
- Hito normativo a 12 meses:
  - Otros dominios: conseguido a 20 meses (12/0.6)
  - Social-emocional: conseguido a 40 meses (12/0.3)

---

## 2. Retraso Global + Lenguaje Severo

### Identificador
`retraso-global-lenguaje`

### Características
- **Icono:** 🔵💬
- **Color:** #f59e0b (ámbar)
- **Edad del niño:** 30 meses

### Perfil Clínico
- **CD Base:** 65 (retraso global del 35%)
- **Dominio desproporcionado:** Comunicación/Lenguaje (ID: 3)
- **Factor de desproporción:** 0.55 (55% del CD base)
- **CD efectivo del dominio afectado:** 35.75 (retraso del 64%)

### Descripción
Retraso global del desarrollo con coeficiente de desarrollo del 65%, pero con afectación desproporcionada del lenguaje, alcanzando un CD efectivo de aproximadamente 36 en ese dominio.

### Interpretación Clínica
Este patrón sugiere un niño con:
- Retraso global leve-moderado en todas las áreas
- Afectación severa adicional específica del lenguaje
- Posible trastorno específico del lenguaje sobre una base de retraso global
- La diferencia entre el CD del lenguaje (36) y el CD promedio de otras áreas (65) es de 29 puntos, equivalente a más de 2 DE

### Cálculo de Edades de Consecución
- **Dominios no afectados:** `edad_conseguido = edad_normativa / 0.65`
- **Dominio del lenguaje:** `edad_conseguido = edad_normativa / 0.3575`

**Ejemplo:**
- Hito normativo a 18 meses:
  - Otros dominios: conseguido a 27.7 meses (18/0.65)
  - Lenguaje: conseguido a 50.3 meses (18/0.3575)

---

## Fundamento Técnico

### Cálculo de la Desproporción

Para que un dominio esté desproporcionadamente afectado (>2 DE), utilizamos el siguiente modelo:

1. **CD Base:** El coeficiente de desarrollo general
2. **Factor de Desproporción:** Multiplicador que reduce el CD en el dominio específico
3. **CD Efectivo del Dominio:** `CD_base × Factor_desproporcion`

### Verificación del Criterio >2 DE

Considerando que:
- 1 DE ≈ 15 puntos de CD
- 2 DE ≈ 30 puntos de CD

**Retraso Global + TEA:**
- Diferencia: 60 - 30 = 30 puntos ≈ 2 DE ✓

**Retraso Global + Lenguaje:**
- Diferencia: 65 - 35.75 = 29.25 puntos ≈ 2 DE ✓

Ambos perfiles cumplen con el criterio de afectación desproporcionada.

---

## Visualización en las Gráficas

### Gráfica de Edad de Desarrollo vs Edad Cronológica
- **Modo Global:** Mostrará una trayectoria general por debajo de la línea de 45°
- **Modo Todos los Dominios:** Se verán claramente dos grupos de puntos:
  - Un grupo siguiendo una trayectoria correspondiente al CD base
  - Un grupo del dominio afectado siguiendo una trayectoria mucho más baja

### Gráfica de Velocidad
- La velocidad del dominio desproporcionado será notablemente menor
- Se evidenciará la diferencia entre velocidades de desarrollo

### Gráfica de Z-Scores
- El dominio afectado mostrará puntuaciones Z significativamente más negativas
- Diferencia de >2 desviaciones estándar respecto al promedio

---

## Uso Clínico

Estos perfiles son útiles para:

1. **Entrenamiento:** Familiarizar al personal clínico con patrones complejos
2. **Diagnóstico Diferencial:** Distinguir entre:
   - Retraso global puro
   - Retraso global con componente específico adicional
3. **Planificación de Intervención:** Identificar áreas que requieren atención especial más allá del retraso global
4. **Seguimiento:** Monitorear si la intervención está mejorando el dominio específico o si persiste la desproporción

---

## Archivo Modificado

- `src/components/EjemplosClinicos.jsx`

## Casos de Prueba Recomendados

1. **Crear ambos perfiles mixtos**
2. **Verificar en modo "Todos los Dominios":**
   - Que existe clara separación visual entre el dominio afectado y los demás
   - Que la diferencia es aproximadamente 2 DE
3. **Verificar en modo de dominio específico:**
   - Que el dominio desproporcionado muestra una trayectoria marcadamente más baja
   - Que los otros dominios muestran la trayectoria del retraso global base
4. **Verificar las estadísticas:**
   - Que el Z-score del dominio afectado es significativamente negativo
   - Que el CD del dominio afectado difiere sustancialmente del CD global
