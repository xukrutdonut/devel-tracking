# Componentes de Recursos Externos

Este directorio contiene componentes React para mostrar recursos educativos de fuentes externas como **Pathways.org**.

## 📁 Archivos

- `RecursoExterno.jsx` - Card individual para mostrar un recurso externo
- `RecursoExterno.css` - Estilos para el card de recurso
- `RecursosPorEdad.jsx` - Vista completa de recursos organizados por edad
- `RecursosPorEdad.css` - Estilos para la vista por edad

## 🎯 Uso

### RecursoExterno

Componente básico para mostrar un recurso externo individual:

```jsx
import RecursoExterno from './components/RecursosExternos/RecursoExterno';

<RecursoExterno
  fuente="Pathways.org"
  titulo="Tummy Time Básico"
  descripcion="Cómo practicar tiempo boca abajo"
  url="https://pathways.org/tummy-timer"
  tipo="video_externo"
  duracion="2-3 min"
  tags={["tummy-time", "motor-grueso"]}
/>
```

### RecursosPorEdad

Vista completa con todos los recursos de una edad específica:

```jsx
import RecursosPorEdad from './components/RecursosExternos/RecursosPorEdad';

<RecursosPorEdad edad="2_meses" />
```

## 🔧 Tipos de Recursos Soportados

- `video_externo` - Videos (YouTube, Vimeo, etc.)
- `articulo` - Artículos educativos
- `checklist_pdf` - Checklists en PDF
- `herramienta_interactiva` - Herramientas web
- `pdf` - Documentos PDF generales

## 🎨 Personalización

Los componentes usan CSS modules para facilitar la personalización. Puedes modificar los archivos `.css` para ajustar:

- Colores de marca
- Espaciado y tamaños
- Animaciones
- Responsive breakpoints

## ⚖️ Importante - Atribución

Todos los recursos externos incluyen:
- Atribución clara de la fuente
- Enlace a la organización original
- Nota de copyright
- Iconos de enlace externo

**No redistribuir contenido sin permiso explícito.**

## 📊 Estructura de Datos

Los recursos se definen en `/src/data/pathwaysResources.js`:

```javascript
{
  "2_meses": {
    nombre: "2 Meses",
    url_pathways: "https://pathways.org/milestones/2-months",
    categorias: {
      motor_grueso: {
        titulo: "Motor Grueso",
        recursos: [...]
      }
    }
  }
}
```

## 🚀 Próximas Mejoras

- [ ] Agregar soporte para embeds de video
- [ ] Sistema de favoritos
- [ ] Búsqueda y filtrado avanzado
- [ ] Integración con más fuentes (AAP, WHO, etc.)
- [ ] Preview de contenido
- [ ] Sistema de ratings/reviews
