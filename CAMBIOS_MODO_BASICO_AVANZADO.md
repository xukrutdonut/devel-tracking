# Implementación del Modo Básico/Avanzado

## Descripción
Se ha implementado un botón de interruptor en la esquina superior derecha del header para cambiar entre modo básico y modo avanzado. Este cambio permite adaptar la interfaz según el nivel de conocimiento del usuario.

## Cambios Realizados

### 1. App.jsx
- **Estado nuevo**: `modoAvanzado` (false = básico, true = avanzado)
- **Botón interruptor**: Agregado en el header, al lado de la información del usuario
  - Muestra "📖 Básico" cuando está en modo básico
  - Muestra "🔬 Avanzado" cuando está en modo avanzado
  - Cambia visualmente de color según el modo activo

### 2. Navegación Condicional
- **Modo Básico** (modoAvanzado = false):
  - ✅ Muestra: Niños, Fundamentos Científicos, Ejemplos Prácticos
  - ❌ Oculta: Investigación
  
- **Modo Avanzado** (modoAvanzado = true):
  - ✅ Muestra: Niños, Fundamentos Científicos, Investigación
  - ❌ Oculta: Ejemplos Prácticos

### 3. GraficoDesarrollo.jsx
- **Prop nuevo**: `modoAvanzado` recibido desde App.jsx
- **Gráficas de Velocidad y Aceleración**: 
  - Solo se muestran en modo avanzado
  - El componente `AnalisisAceleracion` se renderiza condicionalmente
  - El encabezado "📐 Análisis Matemático: Velocidad y Aceleración" también es condicional

### 4. App.css
- **Estilos nuevos para `.mode-toggle`**:
  - Botón con diseño consistente con el tema Twenty Nineteen
  - Estados visual diferenciados para básico y avanzado
  - Efecto hover con elevación sutil
  - Color azul (#0073AA) cuando está en modo avanzado
  - Fondo blanco cuando está en modo básico

## Comportamiento del Usuario

### Al cambiar a Modo Básico:
1. El usuario ve una interfaz simplificada
2. La pestaña de "Investigación" desaparece del menú
3. Si estaba en la vista de gráficas, no verá las secciones de velocidad y aceleración
4. La pestaña de "Ejemplos Prácticos" está disponible para aprender

### Al cambiar a Modo Avanzado:
1. El usuario ve todas las funcionalidades
2. La pestaña de "Investigación" aparece en el menú
3. En las gráficas, se muestran las secciones de velocidad y aceleración del desarrollo
4. La pestaña de "Ejemplos Prácticos" desaparece (se asume conocimiento previo)

## Ubicación Visual
El botón de modo está ubicado en:
```
Header > user-info section > primera posición (antes del nombre de usuario)
```

Esto lo hace fácilmente accesible y visible para el usuario en todo momento.

## Archivos Modificados
1. `/src/App.jsx` - Lógica principal y navegación condicional
2. `/src/components/GraficoDesarrollo.jsx` - Renderizado condicional de análisis avanzado
3. `/src/App.css` - Estilos del botón de modo

## Compilación
✅ El código compila exitosamente sin errores
✅ Build completado: 1331.71 kB (389.41 kB gzip)
