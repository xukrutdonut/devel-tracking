# Implementación del Modo Básico/Avanzado

## Descripción
Se ha implementado un interruptor tipo toggle switch en la esquina superior derecha del header para cambiar entre modo básico y modo avanzado. Este cambio permite adaptar la interfaz según el nivel de conocimiento del usuario.

## Diseño del Interruptor
- **Estilo**: Toggle switch moderno tipo iOS/Material Design
- **Posición**: Header, dentro de user-info, antes del nombre de usuario
- **Etiquetas**: "📖 Básico" (izquierda) y "🔬 Avanzado" (derecha)
- **Animación**: Deslizamiento suave con transición de 0.3s
- **Estados visuales**:
  - Básico (OFF): Switch gris, etiqueta "Básico" resaltada en azul
  - Avanzado (ON): Switch azul (#0073AA), etiqueta "Avanzado" resaltada en azul
  - Hover: Ligera opacidad al pasar el mouse
  - Focus: Anillo de enfoque azul para accesibilidad

## Cambios Realizados

### 1. App.jsx
- **Estado nuevo**: `modoAvanzado` (false = básico, true = avanzado)
- **Interruptor toggle switch**: Agregado en el header, al lado de la información del usuario
  - Checkbox oculto con label personalizado
  - Slider animado que se desliza al cambiar de modo
  - Etiquetas descriptivas a ambos lados
  - La etiqueta del modo activo se resalta en azul y negrita

### 2. Navegación Condicional
- **Modo Básico** (modoAvanzado = false):
  - ✅ Muestra: Niños, Fundamentos Científicos, Ejemplos Prácticos
  - ❌ Oculta: Investigación
  
- **Modo Avanzado** (modoAvanzado = true):
  - ✅ Muestra: Niños, Investigación
  - ❌ Oculta: Fundamentos Científicos, Ejemplos Prácticos

### 3. GraficoDesarrollo.jsx
- **Prop nuevo**: `modoAvanzado` recibido desde App.jsx
- **Gráficas de Velocidad y Aceleración**: 
  - Solo se muestran en modo avanzado
  - El componente `AnalisisAceleracion` se renderiza condicionalmente
  - El encabezado "📐 Análisis Matemático: Velocidad y Aceleración" también es condicional

### 4. App.css
- **Estilos nuevos para el toggle switch**:
  - `.mode-switch-container`: Contenedor con fondo sutil y borde
  - `.toggle-switch`: Interruptor de 50px × 26px
  - `.toggle-slider`: Fondo del interruptor con border-radius redondeado
  - `.toggle-slider:before`: Círculo blanco que se desliza (20px × 20px)
  - Estados visuales: gris (básico) / azul #0073AA (avanzado)
  - Animaciones suaves con transition 0.3s
  - Sombras internas y externas para efecto 3D
  - Focus ring para accesibilidad del teclado

## Comportamiento del Usuario

### Al cambiar a Modo Básico:
1. El usuario ve una interfaz simplificada y educativa
2. La pestaña de "Investigación" desaparece del menú
3. Las pestañas de "Fundamentos Científicos" y "Ejemplos Prácticos" están disponibles para aprender
4. Si estaba en la vista de gráficas, no verá las secciones de velocidad y aceleración

### Al cambiar a Modo Avanzado:
1. El usuario ve una interfaz profesional y técnica
2. La pestaña de "Investigación" aparece en el menú (con teoría avanzada)
3. Las pestañas de "Fundamentos Científicos" y "Ejemplos Prácticos" desaparecen (se asume conocimiento previo)
4. En las gráficas, se muestran las secciones de velocidad y aceleración del desarrollo

## Ubicación Visual
El interruptor de modo está ubicado en:
```
Header > user-info section > mode-switch-container
├── Label "📖 Básico"
├── Toggle Switch (checkbox + slider)
└── Label "🔬 Avanzado"
```

Estructura HTML:
```html
<div class="mode-switch-container">
  <span class="mode-label">📖 Básico</span>
  <label class="toggle-switch">
    <input type="checkbox" checked={modoAvanzado} />
    <span class="toggle-slider"></span>
  </label>
  <span class="mode-label">🔬 Avanzado</span>
</div>
```

Esto lo hace fácilmente accesible y visible para el usuario en todo momento.

## Archivos Modificados
1. `/src/App.jsx` - Lógica principal y navegación condicional
2. `/src/components/GraficoDesarrollo.jsx` - Renderizado condicional de análisis avanzado
3. `/src/App.css` - Estilos del botón de modo

## Compilación
✅ El código compila exitosamente sin errores
✅ Build completado: 1331.87 kB (389.41 kB gzip)
✅ Interruptor tipo toggle switch con animación fluida implementado

## Características del Toggle Switch
- ✅ Diseño moderno inspirado en iOS/Material Design
- ✅ Animación suave de deslizamiento
- ✅ Feedback visual claro del estado activo
- ✅ Accesible por teclado (focus ring)
- ✅ Etiquetas descriptivas en ambos lados
- ✅ Colores consistentes con el tema de la aplicación
