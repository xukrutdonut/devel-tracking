# Sistema de Seguimiento del Neurodesarrollo - Resumen Completo

## 📋 Descripción General

Sistema web completo para el seguimiento y análisis del desarrollo neurológico infantil, con gráficas avanzadas de desarrollo, velocidad y aceleración, basado en datos normativos de múltiples fuentes.

## ✨ Características Principales

### 1. Gestión de Niños
- Registro de niños con datos de nacimiento
- Soporte para edad corregida en prematuros (< 37 semanas)
- Cálculo automático de edad cronológica y corregida
- Interfaz responsive adaptada a móvil y escritorio

### 2. Registro de Hitos del Desarrollo
- Base de datos con hitos normativos de múltiples fuentes:
  - CDC (Centers for Disease Control)
  - Haizea-Llevant
  - Bayley-III
  - Brunet-Lézine Revisado
  - Otros
- 5 dominios del desarrollo:
  - Motor Grueso
  - Motor Fino
  - Lenguaje Expresivo
  - Lenguaje Receptivo
  - Social/Cognitivo
- **Videos educativos integrados**: Enlaces directos a videos de CDC y Pathways.org para cada hito
- Registro de hitos conseguidos con edad específica
- Marcado de hitos no alcanzados para seguimiento
- Filtros por dominio y fuente normativa
- Muestra hitos pendientes según edad del niño

### 3. Gráficas Avanzadas

#### Gráfica de Desarrollo (Edad de Desarrollo vs Edad Cronológica)
- Scatter plot con puntos de medición reales
- Línea de tendencia no lineal (regresión LOESS)
- Línea de referencia de desarrollo típico (45°)
- Bandas de heteroescedasticidad que muestran dispersión creciente
- Representación por dominio con colores diferenciados
- Desarrollo global agregado

#### Gráfica de Velocidad de Desarrollo
- Calcula la primera derivada de la curva de desarrollo
- Muestra cambios en el ritmo de desarrollo
- Línea de tendencia no lineal
- Visualización por dominios

#### Gráfica de Aceleración de Desarrollo  
- Calcula la segunda derivada (aceleración)
- Identifica cambios en la trayectoria de desarrollo
- Sin regresión adicional (muestra oscilaciones reales)
- Escala optimizada para detectar variaciones sutiles

#### Gráfica de Puntuaciones Z
- Z-scores en función de la edad
- Scatter plot de mediciones individuales
- Bandas de referencia:
  - Verde: desarrollo típico (±1 DE)
  - Amarillo: vigilancia (±2 DE)
  - Rojo: alerta (> ±2 DE)
- Por dominio y global

### 4. Análisis y Estadísticas
- Cálculo automático de Z-scores para cada hito
- Estadísticas por dominio:
  - Z-score promedio
  - Rango de Z-scores
  - Número de hitos evaluados
- Edad de desarrollo calculada
- Cociente de desarrollo (DQ)
- Identificación automática de áreas de preocupación

### 5. Red Flags (Señales de Alerta)
- Sistema de registro de señales de alerta por edad
- Categorización por severidad
- Seguimiento temporal de red flags

### 6. Características Técnicas

#### Frontend
- React 18 con Vite
- Plotly.js para gráficas interactivas
- Diseño responsive
- Hot Module Replacement (HMR)
- CSS modular

#### Backend
- Node.js con Express
- SQLite3 para base de datos
- API RESTful completa
- CORS configurado para acceso móvil

#### Despliegue
- Docker y Docker Compose
- Configuración multi-contenedor
- Volúmenes persistentes para datos
- Auto-reinicio de servicios

## 🔧 Instalación y Uso

### Requisitos
- Docker y Docker Compose
- Navegador web moderno

### Inicio Rápido

```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd devel-tracking

# Iniciar con Docker
docker-compose up -d

# Acceder a la aplicación
# Escritorio: http://localhost:8080
# Móvil: http://[IP_DEL_SERVIDOR]:8080
```

### Sin Docker

```bash
# Instalar dependencias
npm install

# Iniciar backend
node server/server.js &

# Iniciar frontend (en otra terminal)
npm run dev
```

## 📊 Flujo de Trabajo

1. **Crear perfil del niño**: Nombre, fecha de nacimiento, semanas de gestación
2. **Registrar hitos conseguidos**: Seleccionar hitos y edad de consecución
3. **Ver gráficas de análisis**: 
   - Desarrollo global y por dominios
   - Velocidad y aceleración
   - Z-scores
4. **Identificar áreas de preocupación**: Revisar Z-scores y red flags
5. **Seguimiento longitudinal**: Actualizar regularmente con nuevos hitos

## 🎨 Mejoras Visuales

- Líneas de tendencia suaves y continuas
- Gradientes para representar incertidumbre
- Colores diferenciados por dominio:
  - Rojo: Motor Grueso
  - Turquesa: Motor Fino
  - Azul: Lenguaje Receptivo
  - Naranja: Lenguaje Expresivo
  - Púrpura: Social/Cognitivo
- Scatter plots para visualizar datos originales
- Bandas de heteroescedasticidad en gráfica principal
- Tooltips interactivos con información detallada

## 📱 Acceso Móvil

El sistema está optimizado para uso móvil:
- Interfaz táctil responsive
- Formularios adaptados
- Gráficas interactivas touch-friendly
- Servidor configurado para acceso en red local

## 🔐 Seguridad y Privacidad

- Datos almacenados localmente en SQLite
- Sin conexión a servicios externos (excepto videos educativos)
- Control total sobre los datos del paciente
- Cumplimiento con normativas de privacidad médica

## 🚀 Próximas Mejoras Sugeridas

- Exportación de informes PDF
- Comparación con múltiples fuentes normativas simultáneas
- Sistema de alertas automáticas
- Integración con sistemas EMR/EHR
- Modo offline completo
- Backup automático de datos
- Multi-usuario con autenticación
- Internacionalización (i18n)

## 📚 Referencias Normativas

- CDC Milestones: https://www.cdc.gov/ncbddd/actearly/milestones/index.html
- Pathways.org: https://pathways.org
- Haizea-Llevant
- Bayley Scales of Infant Development III
- Brunet-Lézine Revisado

## 🐛 Solución de Problemas

### La aplicación no inicia
```bash
docker-compose down
docker-compose up -d --build
```

### Error al crear niño desde móvil
- Verificar que el servidor backend escucha en 0.0.0.0:8001
- Comprobar firewall y reglas de red
- Asegurar que la IP del servidor es accesible

### Gráficas no se muestran
- Verificar consola del navegador
- Comprobar que hay hitos registrados
- Refrescar la página (Ctrl+F5)

## 🤝 Contribuciones

Este es un sistema en desarrollo activo. Sugerencias y mejoras son bienvenidas.

## 📄 Licencia

[Especificar licencia]

---

**Versión**: 2.0  
**Última actualización**: Octubre 2024  
**Autor**: [Tu nombre/organización]
