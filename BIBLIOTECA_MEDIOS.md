# Biblioteca de Medios - Gestión de Videos Educativos

## Descripción

Se ha implementado una **Biblioteca de Medios** que permite a los administradores gestionar los videos educativos asociados a los hitos del desarrollo. Esta herramienta facilita la asociación manual de videos de CDC y Pathways.org con los hitos correspondientes.

## Acceso

La biblioteca de medios está disponible **solo para usuarios administradores** a través del menú de navegación principal:

```
🎬 Biblioteca de Medios
```

## Funcionalidades

### 1. Visualización de Videos

La biblioteca muestra todos los videos disponibles en el sistema con:
- **Miniatura del video** (thumbnail de YouTube)
- **Título y descripción**
- **Fuente** (CDC o Pathways.org) con badge de color
- **Enlace directo** a YouTube
- **Hitos asociados** (si los tiene)

### 2. Filtros

Permite filtrar los videos por:
- **Fuente**: Todos, CDC, Pathways
- **Edad**: Todos, 2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60 meses
- **Búsqueda**: Por título, descripción o URL

### 3. Asociar Video a Hito

Para asociar un video a un hito:

1. Hacer clic en el botón **"+ Asociar a Hito"** en la tarjeta del video
2. Se abre un panel amarillo con el video seleccionado
3. Seleccionar el hito correspondiente del desplegable
   - Los hitos están ordenados por: edad → área → descripción
4. Hacer clic en **"Asociar"**

### 4. Desasociar Video de Hito

Para desasociar un video:

1. En la sección "Asociado a:" de cada video, hacer clic en el botón **✕** junto al hito
2. Confirmar la acción

### 5. Eliminar Video

Para eliminar un video del sistema:

1. Hacer clic en el icono **🗑️** en la esquina superior derecha de la tarjeta
2. Confirmar la acción
3. El video se desasociará de todos los hitos y se eliminará

## Estructura de Datos

### Tabla `videos_hitos`

```sql
CREATE TABLE videos_hitos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  hito_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (hito_id) REFERENCES hitos_desarrollo(id) ON DELETE CASCADE,
  UNIQUE(video_id, hito_id)
)
```

Esta tabla permite asociaciones múltiples: un video puede estar asociado a varios hitos y un hito puede tener varios videos.

## API Endpoints

### GET /api/videos
Obtiene todos los videos con sus hitos asociados.
- Requiere autenticación
- Devuelve array de videos con campo `hitosAsociados`

### GET /api/hitos-completos
Obtiene todos los hitos del sistema para el selector.
- Requiere autenticación
- Devuelve array de hitos ordenados

### POST /api/videos/asociar
Asocia un video a un hito.
- Requiere autenticación y rol admin
- Body: `{ videoId, hitoId }`

### POST /api/videos/desasociar
Desasocia un video de un hito.
- Requiere autenticación y rol admin
- Body: `{ videoId, hitoId }`

### DELETE /api/videos/:id
Elimina un video y todas sus asociaciones.
- Requiere autenticación y rol admin
- Elimina primero las asociaciones, luego el video

## Integración con el Sistema

Los videos asociados a cada hito aparecen:

1. **En el Registro de Hitos del Desarrollo**: 
   - Cada hito muestra iconos de video (CDC y/o Pathways)
   - Al hacer clic, se abre el video en YouTube

2. **En Hitos Pendientes de Evaluación**:
   - Los evaluadores pueden consultar los videos al momento de evaluar

## Ubicación

- **Frontend**: `/src/components/BibliotecaMedios.jsx` y `.css`
- **Backend**: Endpoints en `/server/server.js`
- **Script de migración**: `/server/create_videos_hitos_table.js`

## Flujo de Trabajo Recomendado

1. **Revisar videos existentes** usando los filtros
2. **Identificar videos sin hito asociado**
3. **Reproducir el video** en YouTube para confirmar el contenido
4. **Asociar al hito correspondiente** usando el selector
5. **Verificar la asociación** en el registro de hitos

## Mejoras Futuras

- Importación masiva de videos desde archivo
- Edición de títulos y descripciones de videos
- Duplicar asociaciones a múltiples hitos similares
- Previsualización del video sin salir de la aplicación
- Estadísticas de cobertura de videos por edad/área

---

**Fecha de implementación**: Diciembre 2024
**Versión**: 1.0
