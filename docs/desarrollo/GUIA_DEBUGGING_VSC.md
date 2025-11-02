# 🐛 Guía de Debugging - Proyecto devel-tracking

## ✅ Estado Actual del Proyecto

- **Backend**: ✅ Funcionando en http://localhost:8001
- **Frontend**: ✅ Funcionando en http://localhost:3002
- **Dependencias**: ✅ Instaladas correctamente
- **Configuración VS Code**: ✅ Lista para debugging

## 🎯 Cómo hacer debugging en VS Code

### 1. **Debugging del Backend (Node.js)**

#### Pasos para debuggear el servidor:
1. **Detener** el servidor actual (Ctrl+C en el terminal)
2. **Ir a la pestaña "Run and Debug"** (Ctrl+Shift+D)
3. **Seleccionar** "Debug Server (Node.js)"
4. **Colocar breakpoints** en el código del servidor
5. **Presionar F5** para iniciar el debugging

#### Lugares estratégicos para breakpoints en server.js:
- **Línea 40**: Middleware de logging para ver todas las requests
- **Línea 47**: Ruta de registro de usuarios
- **Línea 85**: Ruta de login
- **Línea 117**: Verificación de token
- **Línea 15**: Función verificarAccesoNino (para debugging de permisos)

### 2. **Debugging del Frontend (React)**

#### Pasos para debuggear React:
1. **Asegúrate** de que el frontend esté corriendo en http://localhost:3002
2. **Ir a la pestaña "Run and Debug"** (Ctrl+Shift+D)
3. **Seleccionar** "Debug Frontend (Chrome)"
4. **Presionar F5** - Se abrirá Chrome con debugging habilitado
5. **Colocar breakpoints** en el código React (archivos .jsx)

#### Archivos principales para debugging:
- `src/App.jsx`: Componente principal
- `src/components/`: Componentes específicos
- `src/config.js`: Configuración de la API

### 3. **Comandos de Debugging**

- **F5**: Continuar ejecución
- **F10**: Step Over (siguiente línea)
- **F11**: Step Into (entrar en función)
- **Shift+F11**: Step Out (salir de función)
- **Ctrl+Shift+F5**: Reiniciar debugging
- **Shift+F5**: Detener debugging

### 4. **Tareas Automatizadas**

Puedes usar las tareas configuradas desde la **Command Palette** (Ctrl+Shift+P):
- **Tasks: Run Task** → "Start Backend Server"
- **Tasks: Run Task** → "Start Frontend Dev Server"
- **Tasks: Run Task** → "Install Dependencies"
- **Tasks: Run Task** → "Build Production"

## 🔍 Herramientas de Debug Disponibles

### **Panel de Variables**
- **Variables locales**: Ver el estado actual de las variables
- **Watch**: Añadir expresiones para monitorear constantemente
- **Call Stack**: Ver la pila de llamadas

### **Panel de Debug Console**
- Puedes ejecutar código JavaScript directamente
- Evaluar variables y expresiones
- Usar `console.log()` para output adicional

### **Breakpoints Condicionales**
- **Click derecho** en el breakpoint
- **Añadir condición**: El breakpoint solo se activará si la condición es verdadera
- Ejemplo: `usuario.id === 1`

## 🚨 Errores Comunes y Soluciones

### **Error: ENOENT package.json**
**Solución**: Asegúrate de estar en el directorio correcto
```bash
cd /home/arkantu/docker/devel-tracking
```

### **Error: Puerto en uso**
**Solución**: El frontend automáticamente busca puertos disponibles (3002, 3003, etc.)

### **Error: Cannot GET /api/...**
**Solución**: Verifica que el backend esté corriendo en puerto 8001

### **Error de CORS**
**Solución**: El servidor ya tiene CORS configurado permisivamente

## 🎯 Flujo de Trabajo Recomendado

1. **Instalar dependencias** (si es necesario): `npm install`
2. **Iniciar backend**: F5 → "Debug Server (Node.js)" 
3. **Iniciar frontend**: En terminal: `npm run dev`
4. **Colocar breakpoints** en el código que quieres debuggear
5. **Interactuar con la aplicación** para activar los breakpoints
6. **Usar las herramientas de VS Code** para inspeccionar variables y flujo

## 📋 Checklist de Debugging

- [ ] Backend corriendo en puerto 8001
- [ ] Frontend corriendo en puerto 3002+
- [ ] Breakpoints colocados en lugares estratégicos
- [ ] Panel "Run and Debug" abierto
- [ ] Variables y Call Stack visibles
- [ ] Console de Debug lista para comandos

## 💡 Tips Avanzados

1. **Logpoints**: En lugar de console.log, usa logpoints (click derecho en breakpoint)
2. **Exception breakpoints**: Parar automáticamente en errores no manejados
3. **Debug Console**: Ejecutar código en el contexto actual
4. **Source Maps**: Debugging directo del código TypeScript/JSX

¡Ahora tienes todo configurado para hacer debugging efectivo! 🎉