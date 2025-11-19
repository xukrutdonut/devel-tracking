# Funcionalidad de Videos Educativos

## Descripción General

Se ha implementado una funcionalidad completa de videos educativos para los hitos del desarrollo. Los usuarios ahora pueden hacer click en cualquier punto del gráfico de desarrollo que tenga un video asociado para visualizarlo en una ventana modal dentro de la aplicación.

## Características Implementadas

### 1. Modal de Video (`VideoModal.jsx`)
- **Componente React reutilizable** para reproducir videos educativos
- **Soporte multi-plataforma**:
  - Videos de YouTube (con autoplay)
  - Videos de Vimeo
  - Videos directos (MP4)
  - Enlaces externos a CDC y Pathways.org
- **Controles integrados**:
  - Botón de cierre (X) y tecla ESC
  - Click fuera del modal para cerrar
  - Responsive para móviles y tablets

### 2. Base de Datos de Videos (`videosHitos.js`)
- **Mapeo completo** de hitos a recursos de video
- **Fuentes oficiales**:
  - CDC (Centers for Disease Control and Prevention)
  - Pathways.org (Pathways Awareness Foundation)
- **Videos incluidos** para hitos clave:
  - Tummy Time (2 meses)
  - Control de cabeza (4 meses)
  - Rodar (6 meses)
  - Gatear (9 meses)
  - Pararse y caminar (9-15 meses)
  - Correr, saltar, trepar (2-5 años)
  - Y muchos más...

### 3. Integración en Gráfico de Desarrollo (`GraficoDesarrollo.jsx`)
- **Indicadores visuales**: Pequeño círculo azul en puntos con video disponible
- **Tooltips mejorados**: Mensaje "🎥 Click para ver video educativo"
- **Interacción intuitiva**: Click en cualquier punto abre el video automáticamente
- **Funcionamiento en todos los modos**:
  - Vista global
  - Vista por dominio específico
  - Vista de todos los dominios

## URLs de Videos

### Videos de YouTube Embebidos
Se utilizan URLs de YouTube de canales oficiales:
- CDC Official Channel: `https://www.youtube.com/@CDCgov`
- Pathways.org: `https://www.youtube.com/@PathwaysBaby`

Ejemplos de videos incluidos:
```javascript
'Sonríe': {
  youtube: 'https://www.youtube.com/watch?v=xdD8z8VF5h4', // CDC - Social smile
  descripcion: 'El bebé comienza a sonreír de forma social...'
}

'Gatea': {
  youtube: 'https://www.youtube.com/watch?v=nOof49Z3u3Q', // Pathways - Crawling
  pathways: 'https://pathways.org/topics-of-development/crawling/',
  descripcion: 'El bebé se desplaza gateando en cuatro patas...'
}
```

### Enlaces Externos
Para hitos sin video embebido, se muestran botones que enlazan a:
- Páginas de CDC con información detallada
- Recursos de Pathways.org

## Uso para el Usuario

1. **Visualizar el gráfico de desarrollo** de un niño
2. **Identificar puntos con videos**: Buscar pequeños círculos azules
3. **Hacer hover** sobre un punto: Ver mensaje "Click para ver video educativo"
4. **Hacer click** en el punto: Se abre el modal con el video
5. **Reproducir el video**: Se inicia automáticamente
6. **Cerrar el modal**: 
   - Click en la X
   - Presionar ESC
   - Click fuera del modal

## Estructura de Archivos

```
src/
├── components/
│   ├── VideoModal.jsx          # Componente modal de video
│   ├── VideoModal.css          # Estilos del modal
│   └── GraficoDesarrollo.jsx   # Integración en gráfico (modificado)
└── utils/
    └── videosHitos.js          # Base de datos de videos (modificado)
```

## Ampliación Futura

### Agregar Más Videos

Para agregar videos a nuevos hitos, editar `src/utils/videosHitos.js`:

```javascript
export const videosHitos = {
  'Nombre del Hito': {
    youtube: 'URL_DEL_VIDEO_YOUTUBE',    // Opcional
    vimeo: 'URL_DEL_VIDEO_VIMEO',        // Opcional
    cdc: 'URL_CDC',                       // Opcional
    pathways: 'URL_PATHWAYS',             // Opcional
    thumbnail: 'URL_IMAGEN',              // Opcional
    descripcion: 'Descripción del hito'   // Opcional
  }
};
```

### Búsqueda de Videos

Para encontrar videos educativos oficiales:

1. **CDC Milestone Videos**:
   - Ir a: https://www.cdc.gov/ncbddd/actearly/milestones/index.html
   - Buscar el hito específico
   - Copiar URL del video de YouTube embebido

2. **Pathways.org Videos**:
   - Ir a: https://pathways.org
   - Buscar en "Topics of Development"
   - Copiar URL del video educativo

3. **YouTube Search**:
   - Buscar: "CDC milestone [nombre del hito]"
   - Buscar: "Pathways.org [nombre del hito]"

## Beneficios Clínicos

- **Educación visual** para padres y profesionales
- **Referencia rápida** durante consultas
- **Validación externa** con fuentes oficiales (CDC, Pathways.org)
- **Mejora la comprensión** de los hitos del desarrollo
- **Reduce incertidumbre** sobre qué esperar en cada edad

## Notas Técnicas

- Los videos de YouTube se cargan con `autoplay=1` para mejor experiencia
- El modal usa z-index alto (10000) para aparecer sobre otros elementos
- Los videos respetan las proporciones 16:9
- Compatible con navegadores modernos
- Funciona en modo invitado y autenticado

## Copyright y Atribución

Todos los videos y contenidos pertenecen a sus respectivos propietarios:
- **CDC**: Dominio público del gobierno de EE.UU.
- **Pathways.org**: © Pathways Awareness Foundation

El sistema solo enlaza y embebe contenido oficial, sin redistribución.
