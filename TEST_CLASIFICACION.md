# Test de Clasificación de Trayectorias

## Cómo Probar

1. Abre la aplicación en el navegador
2. Abre las herramientas de desarrollo (F12)
3. Ve a la consola
4. Copia y pega este código:

```javascript
// Test de clasificación con velocidad baja
import { clasificarTrayectoriaThomas2009 } from './src/utils/regresionTrayectorias.js';

// Caso 1: Velocidad baja pero constante (debería ser SLOWED_RATE_CONVERGENTE)
const datosVelocidadBaja = [
  { edad: 12, valor: 70 },
  { edad: 18, valor: 72 },
  { edad: 24, valor: 74 },
  { edad: 30, valor: 76 }
];

console.log('=== TEST 1: Velocidad Baja Constante ===');
const resultado1 = clasificarTrayectoriaThomas2009(datosVelocidadBaja);
console.log('Tipo:', resultado1.tipo);
console.log('Descripción:', resultado1.descripcion);
console.log('Esperado: SLOWED_RATE_CONVERGENTE');
console.log('');

// Caso 2: Asíntota prematura real (debería ser PREMATURE_ASYMPTOTE)
const datosAsintota = [
  { edad: 12, valor: 70 },
  { edad: 18, valor: 82 },
  { edad: 24, valor: 88 },
  { edad: 30, valor: 89 },
  { edad: 36, valor: 89 }
];

console.log('=== TEST 2: Asíntota Prematura Real ===');
const resultado2 = clasificarTrayectoriaThomas2009(datosAsintota);
console.log('Tipo:', resultado2.tipo);
console.log('Descripción:', resultado2.descripcion);
console.log('Esperado: PREMATURE_ASYMPTOTE');
console.log('');

// Caso 3: Desarrollo normal (debería ser DESARROLLO_NORMAL)
const datosNormales = [
  { edad: 12, valor: 95 },
  { edad: 18, valor: 97 },
  { edad: 24, valor: 99 },
  { edad: 30, valor: 100 }
];

console.log('=== TEST 3: Desarrollo Normal ===');
const resultado3 = clasificarTrayectoriaThomas2009(datosNormales);
console.log('Tipo:', resultado3.tipo);
console.log('Descripción:', resultado3.descripcion);
console.log('Esperado: DESARROLLO_NORMAL');
```

## Verificar en la Consola

Los logs de debug deberían mostrar algo como:

```
🔍 Clasificando trayectoria: {
  nPuntos: 4,
  modeloLineal: {
    intercepto: "68.00",
    pendiente: "0.444",
    r2: "0.990"
  }
}

🔬 Detector Asíntota Prematura: {
  hayEstancamiento: true,
  esPrematura: true,
  huboCambioVelocidad: false,    ← CLAVE: debe ser false
  cambioPromedioInicial: "2.00",
  cambioPromedioFinal: "2.00",
  ratio: "1.00"                  ← CLAVE: debe ser ~1.0, no > 2.0
}

✓ No es asíntota (progreso lineal)
```

## Qué Buscar

### Para SLOWED_RATE_CONVERGENTE:
- **R² alto** (> 0.7): Indica trayectoria lineal confiable
- **Pendiente positiva** (> 0.2): Indica mejora progresiva
- **huboCambioVelocidad = false**: Velocidad constante, no desaceleración
- **ratio ≈ 1.0**: Cambio inicial similar al cambio final

### Para PREMATURE_ASYMPTOTE:
- **R² bajo o modelo cuadrático mejor**: No es lineal
- **huboCambioVelocidad = true**: Hubo desaceleración marcada
- **ratio > 2.0**: Cambio inicial >> cambio final

## Si Sigue Fallando

### Posibles Causas:

1. **El detector de asíntota se ejecuta antes de SLOWED_RATE**
   - Verifica el orden en el código
   - Debe evaluar trayectoria lineal PRIMERO

2. **El umbral de `huboCambioVelocidad` es demasiado bajo**
   - Actualmente requiere ratio > 2.0
   - Considera aumentar a > 3.0 para ser más estricto

3. **Los datos tienen solo 3 puntos**
   - La función requiere 4+ puntos para detectar asíntota
   - Con 3 puntos, debería ir directo a clasificación lineal

4. **El cambio promedio se calcula mal**
   - Verifica que usa valores absolutos
   - Verifica que divide correctamente

## Solución Rápida

Si el problema persiste, puedes **deshabilitar temporalmente** la detección de asíntota para velocidades bajas:

```javascript
// En detectarAsintotaPrematura()
// Línea ~195

// AÑADIR ESTA VALIDACIÓN ADICIONAL:
// Solo detectar asíntota si el cambio final es REALMENTE cero
const esEstancamientoTotal = cambioPromedioFinal < 0.5;  // Muy estricto
const hayEstancamiento = esEstancamientoTotal;  // Usar el más estricto

// En lugar de:
// const hayEstancamiento = cambioPromedioFinal < 2;
```

Esto hará que solo detecte asíntota cuando el progreso sea prácticamente cero, no solo lento.
