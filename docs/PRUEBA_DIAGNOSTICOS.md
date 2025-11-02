# Guía Rápida: Probando el Sistema de Diagnóstico Automático

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor Backend
```bash
cd /home/arkantu/docker/devel-tracking
npm run server
```
El servidor iniciará en http://localhost:8001

### 2. Iniciar el Frontend (en otra terminal)
```bash
cd /home/arkantu/docker/devel-tracking
npm run dev
```
El frontend estará disponible en http://localhost:3000

## 📋 Pasos para Probar el Sistema de Diagnósticos

### Paso 1: Crear un niño de prueba
1. Accede a http://localhost:3000
2. Click en "Agregar Nuevo Niño"
3. Nombre: "Prueba Diagnóstico"
4. Fecha de nacimiento: Hace 24 meses (2 años)
5. Guardar

### Paso 2: Registrar hitos para simular diferentes patrones

#### Caso A: Retraso Global del Desarrollo
Registrar hitos con edades muy por encima de la media en múltiples áreas:
- Motor Grueso: hitos conseguidos 8-10 meses después de la media
- Lenguaje: hitos conseguidos 8-10 meses después de la media
- Social-Emocional: hitos conseguidos 8-10 meses después de la media

#### Caso B: Retraso Simple del Lenguaje
- Motor Grueso: hitos en edad normal o adelantados
- Motor Fino: hitos en edad normal o adelantados
- Lenguaje Receptivo: hitos conseguidos 6-8 meses después
- Lenguaje Expresivo: hitos conseguidos 6-8 meses después
- Social-Emocional: hitos en edad normal

#### Caso C: Sospecha de PCI
- Motor Grueso: hitos conseguidos 10-12 meses después
- Motor Fino: hitos conseguidos 8-10 meses después
- Otras áreas: desarrollo normal

#### Caso D: Sospecha de TEA
- Social-Emocional: hitos conseguidos 10-15 meses después
- Motor Grueso: hitos normales o ligeramente adelantados
- Motor Fino: hitos normales o ligeramente adelantados
- Lenguaje: hitos en rango normal

### Paso 3: Consultar Diagnósticos
1. Con el niño seleccionado, ir a la pestaña "🩺 Diagnósticos"
2. Observar:
   - Estado por dominio con Z-scores
   - Diagnósticos identificados automáticamente
   - Recomendaciones clínicas

### Paso 4: Ajustar el Umbral
1. En la sección de configuración, cambiar el umbral de -2.0 a -1.5
2. Hacer click en "Aplicar"
3. Observar cómo cambian los diagnósticos con el nuevo umbral (más sensible)
4. Probar con -2.5 (menos sensible)

## 🧪 Pruebas de API

### Probar endpoint de configuración
```bash
curl http://localhost:8001/api/configuracion
```
Respuesta esperada: `{"umbral_diagnostico":2.0}`

### Actualizar umbral
```bash
curl -X PUT http://localhost:8001/api/configuracion/umbral \
  -H "Content-Type: application/json" \
  -d '{"umbral": 1.5}'
```

### Obtener fuentes normativas
```bash
curl http://localhost:8001/api/fuentes-normativas
```

### Generar diagnóstico (reemplaza :ninoId con el ID real)
```bash
curl http://localhost:8001/api/diagnostico/1?fuente=1
```

## ✅ Verificaciones

### El sistema debe mostrar:
- [ ] Sección de configuración con input de umbral y selector de fuente normativa
- [ ] Cards con estado de cada dominio (Z-score y estado normal/retraso)
- [ ] Lista de diagnósticos identificados con:
  - Tipo de diagnóstico
  - Badge de severidad (leve/moderada/alta)
  - Criterio cumplido
  - Áreas afectadas
  - Recomendación clínica
- [ ] Información adicional sobre criterios diagnósticos
- [ ] Interpretación general (evaluación normal vs hallazgos clínicos)

### Funcionalidad esperada:
- [ ] Al cambiar el umbral y aplicar, se actualizan los diagnósticos
- [ ] Los diagnósticos cambian según los hitos registrados
- [ ] Los Z-scores se calculan correctamente
- [ ] La severidad se asigna apropiadamente
- [ ] Las recomendaciones son específicas para cada diagnóstico

## 🐛 Problemas Comunes

### El servidor no inicia
- Verificar que no haya otro proceso en el puerto 8001: `lsof -i :8001`
- Verificar permisos de la base de datos: `ls -la server/neurodesarrollo_dev.db`

### No aparecen diagnósticos
- Verificar que el niño tenga hitos registrados
- Verificar que los Z-scores estén por debajo del umbral establecido
- Revisar consola del navegador para errores

### Error "Cannot read properties of undefined"
- Asegurarse de que el servidor esté corriendo
- Verificar que la URL de la API sea correcta (puerto 8001)
- Revisar la consola del servidor para errores

## 📊 Interpretación de Resultados

### Z-scores por dominio
- **Verde (✅ Normal)**: Z > -2.0 (o el umbral configurado)
- **Rojo (⚠️ Retraso)**: Z < -2.0 (o el umbral configurado)

### Severidad de diagnósticos
- **🔴 Alta**: PCI, TEA - Requieren atención inmediata
- **🟠 Moderada**: RGD, Retraso del Lenguaje - Requieren seguimiento
- **🔵 Leve**: Retraso en área única - Vigilancia

### Umbral diagnóstico
- **-1.5 DE**: Más sensible (detecta más casos, más falsos positivos)
- **-2.0 DE**: Equilibrado (estándar clínico)
- **-2.5 DE**: Más específico (solo casos severos)

## 💡 Casos de Uso Clínico

1. **Screening inicial**: Usar umbral -2.0 DE
2. **Seguimiento de casos de riesgo**: Usar umbral -1.5 DE
3. **Confirmación diagnóstica**: Usar umbral -2.5 DE junto con otras evaluaciones

---

**Nota**: Este sistema es una herramienta de apoyo. Los diagnósticos definitivos requieren evaluación profesional integral.
