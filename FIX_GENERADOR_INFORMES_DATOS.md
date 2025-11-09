# Fix: Generador de Informes - Recuperación de Datos

## Problema Detectado

El generador de informes no estaba recuperando correctamente las puntuaciones ni generando gráficos ASCII porque la estructura de datos `analisisData` puede venir en dos formatos diferentes:

1. **Formato 1** (modo invitado): `analisisData.hitos_conseguidos` (array directo)
2. **Formato 2** (API servidor): `analisisData.estadisticas_por_dominio` (objeto con arrays por dominio)

## Solución Implementada

### Cambios en `GeneradorInforme.jsx`

#### 1. Detección Flexible de Fuentes de Datos

Se agregó lógica para intentar obtener los hitos desde ambas estructuras:

```javascript
// Intentar obtener hitos desde diferentes fuentes
let hitos_conseguidos = [];

if (analisisData) {
  // Opción 1: hitos_conseguidos directamente (modo invitado)
  if (analisisData.hitos_conseguidos && Array.isArray(analisisData.hitos_conseguidos)) {
    hitos_conseguidos = analisisData.hitos_conseguidos;
  }
  // Opción 2: estadisticas_por_dominio (API servidor)
  else if (analisisData.estadisticas_por_dominio) {
    // Convertir estadisticas_por_dominio a array de hitos
    Object.entries(analisisData.estadisticas_por_dominio).forEach(([dominioId, hitos]) => {
      if (Array.isArray(hitos)) {
        hitos_conseguidos.push(...hitos);
      }
    });
  }
}
```

#### 2. Logging de Debug

Se agregaron console.log para diagnosticar problemas:

```javascript
console.log('📄 [GeneradorInforme] Generando informe...');
console.log('   - analisisData:', analisisData);
console.log('   - analisisData.hitos_conseguidos:', analisisData?.hitos_conseguidos?.length);
console.log('   - analisisData.estadisticas_por_dominio:', 
  analisisData?.estadisticas_por_dominio ? Object.keys(analisisData.estadisticas_por_dominio) : 'N/A');
```

#### 3. Aplicado en Dos Lugares

Esta lógica se aplicó en:
- `generarInformeTexto()` - Para generar informes TXT con gráficos ASCII
- `generarPDF()` - Para generar informes PDF con métricas completas

## Estructura de Datos Esperada

### Opción 1: hitos_conseguidos (array)
```javascript
{
  hitos_conseguidos: [
    {
      dominio_id: 1,
      edad_media_meses: 12,
      desviacion_estandar: 2.5,
      // ... otros campos
    },
    // ... más hitos
  ]
}
```

### Opción 2: estadisticas_por_dominio (objeto)
```javascript
{
  estadisticas_por_dominio: {
    "1": [ // Motor Grueso
      {
        dominio_id: 1,
        edad_media_meses: 12,
        desviacion_estandar: 2.5,
        // ... otros campos
      }
    ],
    "2": [ // Motor Fino
      // ... hitos
    ],
    // ... más dominios
  }
}
```

## Cómo Verificar si Funciona

### 1. Abrir la consola del navegador
Presionar F12 o Ctrl+Shift+I

### 2. Generar un informe
Click en "Generar Informe" desde el componente de gráficos

### 3. Revisar la consola
Deberías ver algo como:
```
📄 [GeneradorInforme] Generando informe...
   - analisisData: {estadisticas_por_dominio: {...}, ...}
   - analisisData.hitos_conseguidos: undefined
   - analisisData.estadisticas_por_dominio: ["1", "2", "3", "4", "5", "6", "7"]
   → Convirtiendo estadisticas_por_dominio a hitos...
   ✓ Hitos extraídos: 42
   - Total hitos a procesar: 42
   - Dominios encontrados: ["1", "2", "3", "4", "5", "6", "7"]
   ✓ Datos de dominios calculados: 7
```

### 4. Verificar el informe generado
El informe debe mostrar:
- ✅ Métricas globales (EC, ED, CD, Z-score)
- ✅ Gráfico ASCII 1: Barras de ED por dominio
- ✅ Gráfico ASCII 2: Z-scores por dominio
- ✅ Tabla detallada con métricas por cada dominio

## Problemas Conocidos y Soluciones

### Problema: "No hay datos suficientes para generar gráfica"

**Causa**: No se encontraron hitos en ninguna estructura

**Solución**:
1. Verificar que el niño tenga hitos registrados
2. Revisar en consola qué estructura tiene `analisisData`
3. Si `analisisData` es null, el problema está en el componente padre

### Problema: Todos los valores muestran "N/A"

**Causa**: Los hitos no tienen `edad_media_meses` o `desviacion_estandar`

**Solución**:
1. Verificar que los hitos normativos estén correctamente cargados
2. En modo invitado, asegurar que `construirAnalisisLocal` enriquece los hitos
3. Revisar que la API devuelva hitos con campos completos

### Problema: Solo algunos dominios aparecen

**Causa Normal**: El niño solo ha completado hitos en esos dominios

**Si es incorrecto**:
1. Verificar agrupación por `dominio_id`
2. Asegurar que `dominio_id` es un número o string consistente

## Testing

Para probar manualmente:

1. **Modo Invitado**:
   - Crear un niño de prueba
   - Registrar varios hitos en diferentes dominios
   - Generar informe → Debe mostrar todos los cálculos

2. **Modo Autenticado**:
   - Seleccionar un niño existente con hitos
   - Generar informe → Debe mostrar todos los cálculos

3. **Verificar Gráficos ASCII**:
   - En modo TXT, debe haber 2 gráficos
   - Gráfico 1: Barras horizontales (█ y ▓)
   - Gráfico 2: Símbolos de Z-score (●◐○◉)

## Archivos Modificados

- `src/components/GeneradorInforme.jsx`
  - Función `generarInformeTexto()`: Lógica de detección de datos + logging
  - Función `generarPDF()`: Lógica de detección de datos

## Próximos Pasos

Si el problema persiste:

1. **Capturar estructura real**: 
   ```javascript
   console.log('ESTRUCTURA COMPLETA:', JSON.stringify(analisisData, null, 2));
   ```

2. **Verificar API**: 
   - Endpoint: `/analisis/{ninoId}`
   - Debe devolver hitos con todos los campos necesarios

3. **Verificar construirAnalisisLocal**:
   - En `GraficoDesarrollo.jsx`
   - Debe enriquecer hitos con datos normativos

## Notas Importantes

- Los cálculos requieren `edad_media_meses` y `desviacion_estandar` en cada hito
- Sin estos campos, las métricas no se pueden calcular
- El código ahora intenta ambas estructuras automáticamente
- Los logs de consola ayudan a diagnosticar problemas rápidamente
