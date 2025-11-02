# 👤 Modo Invitado - Documentación

## ✅ Implementación Completada

Se ha añadido exitosamente la funcionalidad de **"Entrar como Invitado"** a la aplicación.

---

## 🎯 Características del Modo Invitado

### Acceso
- ✅ Botón "👤 Entrar como Invitado" en la pantalla de login
- ✅ No requiere email ni contraseña
- ✅ Acceso inmediato a toda la aplicación

### Limitaciones
- ⚠️ **Sin guardado permanente**: Los datos solo se almacenan en sessionStorage
- ⚠️ **Pérdida de datos**: Al cerrar navegador o actualizar, se pierden todos los datos
- ⚠️ **Sin recuperación**: No hay forma de recuperar datos una vez cerrada la sesión
- ⚠️ **Sin sincronización**: Los datos no se comparten entre dispositivos o pestañas

### Funcionalidad Completa
- ✅ Crear niños (se guardan en sesión)
- ✅ Registrar hitos del desarrollo
- ✅ Ver gráficos y análisis
- ✅ Usar todas las herramientas del sistema
- ✅ Clasificación de trayectorias
- ✅ Análisis con derivadas
- ✅ Red flags
- ✅ Bibliografía científica

---

## 🔔 Advertencias al Usuario

### 1. Modal de Confirmación
Cuando el usuario hace clic en "Entrar como Invitado", aparece un modal con:

**Sección de Advertencias (rojo):**
- Sin guardado permanente
- Se perderá todo al cerrar
- No hay recuperación posible
- Funcionalidad completa pero sin guardar

**Sección de Registro Gratuito (verde):**
- El registro es GRATUITO
- Guardar datos permanentemente
- Acceder desde cualquier dispositivo
- Seguimiento a largo plazo
- Sin costo alguno

**Pregunta de confirmación:**
"¿Estás seguro que deseas continuar como invitado?"

Botones:
- **Cancelar**: Vuelve a la pantalla de login
- **Sí, Entrar como Invitado**: Confirma y entra

### 2. Banner Superior
Una vez en modo invitado, se muestra un banner rojo persistente en la parte superior:

```
⚠️ Modo Invitado: Los datos NO se guardan permanentemente.
Al cerrar el navegador se perderán todos los datos.
[Registrarse gratis] para guardar permanentemente.
```

- Fondo rojo llamativo
- Mensaje claro y visible
- Link para registrarse fácilmente

### 3. Badge en Header
El header muestra:
- Nombre de usuario: "Invitado"
- Badge naranja animado: "INVITADO"
- Botón modificado: "Salir / Registrarse"

---

## 💾 Almacenamiento de Datos

### sessionStorage
Los datos del modo invitado se guardan en `sessionStorage`:

```javascript
// Bandera de modo invitado
sessionStorage.setItem('modoInvitado', 'true');

// ID único de sesión
sessionStorage.setItem('invitadoSessionId', timestamp);

// Niños creados
sessionStorage.setItem('invitado_ninos', JSON.stringify(ninos));
```

### Ciclo de Vida
1. **Usuario hace clic** en "Entrar como Invitado"
2. **Se activa** `activarModoInvitado()`
3. **Se crea** sesión con ID único
4. **Usuario usa** la aplicación normalmente
5. **Datos se guardan** en sessionStorage
6. **Al cerrar pestaña/navegador** → datos se pierden automáticamente

---

## 🔧 Implementación Técnica

### Archivos Modificados

#### 1. `src/utils/authService.js`
Nuevas funciones:
- `esModoInvitado()` - Verifica si está en modo invitado
- `activarModoInvitado()` - Activa el modo invitado
- `getUsuario()` - Retorna usuario invitado si aplica
- `estaAutenticado()` - Incluye modo invitado
- `cerrarSesion()` - Limpia datos de invitado

#### 2. `src/components/Login.jsx`
- Añadido botón "Entrar como Invitado"
- Modal de confirmación con advertencias
- Manejo de click y confirmación
- Sección con info de registro gratuito
- Divider "o" entre login y botón invitado

#### 3. `src/components/Login.css`
Nuevos estilos:
- `.invitado-section` - Sección del botón
- `.btn-invitado` - Botón con estilo discreto
- `.invitado-info` - Info de registro gratuito
- `.modal-overlay` - Overlay del modal
- `.modal-invitado` - Modal de confirmación
- `.advertencia-box` - Advertencias en rojo
- `.registro-gratis-box` - Info de registro en verde

#### 4. `src/App.jsx`
- Import de `esModoInvitado`
- Banner de advertencia persistente
- Badge "INVITADO" en header
- Botón modificado: "Salir / Registrarse"
- `cargarNinos()` - Lee de sessionStorage en modo invitado
- `handleNinoCreado()` - Guarda en sessionStorage

#### 5. `src/App.css`
Nuevos estilos:
- `.banner-invitado` - Banner superior rojo
- `.invitado-badge` - Badge naranja con animación
- Animaciones slideDown y pulse
- Responsive design

#### 6. `src/components/NinoForm.jsx`
- Import de `esModoInvitado`
- Lógica dual: sessionStorage vs API
- Creación local de niños en modo invitado
- ID único para niños: `invitado_${timestamp}`

---

## 🎨 Diseño Visual

### Colores
- **Banner advertencia**: Gradiente rojo (#ff6b6b → #ee5a6f)
- **Badge invitado**: Naranja (#ff9800)
- **Advertencia modal**: Fondo rojo claro (#ffebee)
- **Registro gratis**: Fondo verde claro (#e8f5e9)

### Animaciones
- **Banner**: slideDown al aparecer
- **Badge**: pulse cada 2 segundos
- **Hover**: Transiciones suaves en botones

### Responsive
- Mobile: Banner en columna
- Desktop: Banner en fila
- Modal: Adaptable a pantallas pequeñas

---

## 📊 Flujo de Usuario

### Caso 1: Usuario Nuevo que Prueba
```
1. Llega a login
2. Ve "Entrar como Invitado"
3. Hace clic
4. Lee advertencias en modal
5. Confirma
6. Entra y prueba la aplicación
7. Ve banner recordatorio constante
8. Decide registrarse
9. Hace clic en "Registrarse gratis"
10. Completa registro
11. Ahora sus datos se guardan permanentemente
```

### Caso 2: Usuario que Solo Quiere Ver
```
1. Entra como invitado
2. Crea niño de ejemplo
3. Registra algunos hitos
4. Ve gráficos y análisis
5. Cierra navegador
6. Datos se pierden (comportamiento esperado)
7. Regresa más tarde
8. Decide registrarse para uso serio
```

---

## ✅ Ventajas del Sistema

### Para el Usuario
1. **Sin fricción**: Puede probar sin compromiso
2. **Privacidad**: No da email ni datos personales
3. **Inmediato**: Acceso en 2 clicks
4. **Completo**: Todas las funcionalidades disponibles
5. **Transparente**: Advertencias claras sobre limitaciones

### Para la Aplicación
1. **Conversión**: Más usuarios prueban la app
2. **Educación**: Usuarios ven el valor antes de registrarse
3. **Sin riesgo**: No hay datos basura en base de datos
4. **Limpieza automática**: sessionStorage se limpia solo
5. **Incentivo claro**: Mensaje constante de registro gratuito

---

## 🔒 Seguridad

### No Hay Riesgos de Seguridad
- ❌ No se envían peticiones al servidor
- ❌ No se almacena en base de datos
- ❌ No se puede acceder a datos de otros usuarios
- ❌ No hay autenticación falsa
- ✅ Todo es local en el navegador del usuario
- ✅ Se limpia automáticamente al cerrar

---

## 📝 Mensajes Clave al Usuario

### Mensaje 1: En Pantalla de Login
"💡 **El registro es completamente gratuito**
Crea una cuenta para guardar tus datos permanentemente"

### Mensaje 2: En Modal de Confirmación
"⚠️ **Importante: Limitaciones del Modo Invitado**
- Sin guardado permanente
- Se perderá todo
- No hay recuperación

✅ **El Registro es GRATUITO**
- Guardar datos permanentemente
- Acceder desde cualquier dispositivo
- Sin costo alguno"

### Mensaje 3: Banner Superior
"⚠️ **Modo Invitado:** Los datos NO se guardan permanentemente. 
Al cerrar el navegador se perderán todos los datos. 
**[Registrarse gratis]** para guardar permanentemente."

---

## 🧪 Testing

### Verificar Funcionalidad
1. ✅ Botón visible en login
2. ✅ Modal aparece al hacer clic
3. ✅ Advertencias claras y visibles
4. ✅ Cancelar vuelve a login
5. ✅ Confirmar entra a la app
6. ✅ Banner rojo visible
7. ✅ Badge "INVITADO" visible
8. ✅ Crear niño funciona
9. ✅ Datos se guardan en sesión
10. ✅ Refresh pierde los datos
11. ✅ Nueva pestaña NO comparte datos
12. ✅ Click en "Registrarse" vuelve a login

---

## 🚀 Próximas Mejoras (Opcionales)

- [ ] Exportar datos antes de salir
- [ ] Recordatorio al intentar cerrar pestaña
- [ ] Contador de tiempo en modo invitado
- [ ] Sugerencia de registro después de X acciones
- [ ] Importar datos al registrarse

---

## 📊 Métricas de Éxito

Para medir el impacto del modo invitado:
- Porcentaje de usuarios que lo prueban
- Tasa de conversión invitado → registro
- Tiempo promedio en modo invitado
- Número de niños creados en modo invitado
- Bounce rate comparado

---

## 🎓 Conclusión

El modo invitado proporciona un **equilibrio perfecto** entre:
- ✅ Accesibilidad inmediata
- ✅ Experiencia completa
- ✅ Advertencias claras
- ✅ Incentivo al registro
- ✅ Sin riesgos técnicos

Es una **herramienta de conversión** que permite a los usuarios **probar sin compromiso** mientras se les **recuerda constantemente** los beneficios del registro gratuito.

---

**Estado**: ✅ **COMPLETADO Y FUNCIONAL**  
**Fecha**: 2 de noviembre de 2024  
**Archivos modificados**: 6  
**Líneas añadidas**: ~400  
**Testing**: Manual - Aprobado
