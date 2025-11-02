# 🚀 Inicio Rápido

## Opción 1: Script Automático (Recomendado)

### Paso 1: Iniciar el Backend
```bash
./start.sh
```

### Paso 2: Iniciar el Frontend (en otra terminal)
```bash
npm run dev
```

### Paso 3: Abrir en el navegador
```
http://localhost:3000
```

---

## Opción 2: Manual

### Terminal 1 - Backend (API)
```bash
npm run server
```
El servidor estará disponible en `http://localhost:3001`

### Terminal 2 - Frontend (Interfaz)
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

---

## 🎯 Primeros Pasos en la Aplicación

### 1️⃣ Crear tu primer niño
1. En la pantalla principal, haz clic en **"+ Agregar Nuevo Niño"**
2. Introduce el nombre y fecha de nacimiento
3. Haz clic en **"Crear"**

### 2️⃣ Registrar hitos del desarrollo
1. Selecciona el niño de la lista
2. Haz clic en **"✅ Registrar Hitos"**
3. Explora los diferentes dominios del desarrollo
4. Haz clic en **"Registrar como conseguido"** en los hitos alcanzados
5. Introduce la edad (en meses) a la que se consiguió el hito

### 3️⃣ Ver el gráfico de desarrollo
1. Haz clic en **"📈 Gráfico de Desarrollo"**
2. Observa la curva de progreso con Z-scores
3. Pasa el ratón sobre los puntos para ver detalles
4. Revisa las estadísticas por dominio

### 4️⃣ Registrar señales de alarma (si aplica)
1. Haz clic en **"🚩 Señales de Alarma"**
2. Revisa el catálogo de red flags
3. Registra las observadas con edad y severidad

---

## 📊 Ejemplo de Uso

### Caso: María, 18 meses

**Hitos registrados:**
- ✅ Camina solo (13 meses) → Z-score = 0
- ✅ Primera palabra (12 meses) → Z-score = 0
- ✅ Señala objetos (11 meses) → Z-score = +1.5
- ✅ Control de esfínteres NO (pendiente)

**Interpretación:**
- Desarrollo motor: Normal ✅
- Desarrollo del lenguaje: Normal ✅
- Desarrollo social: Ligeramente adelantado 🌟

**Red Flags:** Ninguna

---

## 🆘 Solución de Problemas

### El backend no inicia
```bash
# Verificar que el puerto 3001 está libre
lsof -i :3001

# Si está ocupado, matar el proceso
kill -9 [PID]

# Reintentar
npm run server
```

### El frontend no inicia
```bash
# Verificar que el puerto 3000 está libre
lsof -i :3000

# Reinstalar dependencias si es necesario
rm -rf node_modules
npm install
npm run dev
```

### Error de conexión a la API
- ✅ Verifica que el backend esté corriendo en el puerto 3001
- ✅ Abre `http://localhost:3001/api/dominios` en el navegador
- ✅ Deberías ver un JSON con los dominios del desarrollo

---

## 📁 Archivos Importantes

- **`README.md`** - Documentación completa del sistema
- **`GUIA_CLINICA.md`** - Guía clínica de interpretación
- **`server/neurodesarrollo.db`** - Base de datos (se crea automáticamente)

---

## 💡 Consejos

1. **Edad en meses**: Usa decimales si es necesario (ej: 18.5 meses)
2. **Prematuros**: Corrige la edad hasta los 24 meses
3. **Z-scores**: Entre -1 y +1 es normal
4. **Red flags**: Cualquier regresión es señal de alarma crítica
5. **Seguimiento**: Registra hitos regularmente para mejor seguimiento

---

## 🎓 Recursos de Aprendizaje

### Videos Recomendados
- CDC "Learn the Signs. Act Early"
- Hitos del desarrollo AAP

### Lecturas
- Consulta `GUIA_CLINICA.md` para interpretación detallada
- Manual DSM-5 para criterios diagnósticos si es necesario

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo (puerto 3001)
- [ ] Frontend corriendo (puerto 3000)
- [ ] Base de datos creada automáticamente
- [ ] Primer niño creado
- [ ] Primer hito registrado
- [ ] Gráfico visualizado correctamente

---

¡Listo para empezar! 🎉

Si tienes alguna duda, consulta el `README.md` completo o la `GUIA_CLINICA.md`.
