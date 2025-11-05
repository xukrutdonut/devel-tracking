/**
 * Herramienta de Testing Interactivo para Clasificación de Trayectorias
 * 
 * USO:
 * 1. Abre la consola del navegador (F12)
 * 2. Importa este módulo
 * 3. Llama a testCaso() con tus datos
 * 
 * Ejemplo:
 * ```
 * import { testCaso, compararCasos } from './utils/testClasificacion';
 * 
 * // Test un caso específico
 * testCaso([
 *   { edad: 12, valor: 9 },
 *   { edad: 18, valor: 15 },
 *   { edad: 24, valor: 21 },
 *   { edad: 30, valor: 27 }
 * ], 'DELAYED_ONSET');
 * 
 * // Comparar múltiples casos
 * compararCasos();
 * ```
 */

import { clasificarTrayectoriaThomas2009 } from './regresionTrayectorias.js';

/**
 * Prueba un caso individual y compara con clasificación esperada
 */
export function testCaso(datos, clasificacionEsperada, descripcion = '') {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('TEST DE CLASIFICACIÓN' + (descripcion ? `: ${descripcion}` : ''));
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Mostrar datos
  console.log('📊 Datos de entrada:');
  console.table(datos);
  
  // Calcular estadísticas básicas
  const valores = datos.map(d => d.valor);
  const edades = datos.map(d => d.edad);
  const n = datos.length;
  
  // Regresión lineal simple
  const sumX = edades.reduce((a, b) => a + b, 0);
  const sumY = valores.reduce((a, b) => a + b, 0);
  const sumXY = edades.reduce((sum, x, i) => sum + x * valores[i], 0);
  const sumX2 = edades.reduce((sum, x) => sum + x * x, 0);
  
  const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercepto = (sumY - pendiente * sumX) / n;
  
  console.log('\n📈 Estadísticas:');
  console.log(`  Intercepto: ${intercepto.toFixed(2)}`);
  console.log(`  Pendiente: ${pendiente.toFixed(3)}`);
  console.log(`  Cambio total: ${(valores[n-1] - valores[0]).toFixed(1)} en ${(edades[n-1] - edades[0]).toFixed(0)} meses`);
  console.log(`  Cambio promedio: ${((valores[n-1] - valores[0]) / (edades[n-1] - edades[0])).toFixed(3)} por mes`);
  
  // Clasificar
  console.log('\n🤖 Clasificando...');
  const resultado = clasificarTrayectoriaThomas2009(datos, null);
  
  // Mostrar resultado
  console.log('\n✨ Resultado de la clasificación:');
  console.log(`  Tipo: ${resultado.tipo}`);
  console.log(`  Descripción: ${resultado.descripcion}`);
  console.log(`  Confianza: ${(resultado.confianza * 100).toFixed(0)}%`);
  
  if (resultado.modelo) {
    console.log(`  R²: ${resultado.modelo.r2.toFixed(3)}`);
  }
  
  console.log('\n📋 Características:');
  resultado.caracteristicas.forEach(c => console.log(`  • ${c}`));
  
  // Comparar con esperado
  if (clasificacionEsperada) {
    const coincide = resultado.tipo === clasificacionEsperada;
    console.log('\n' + (coincide ? '✅' : '❌') + ' Comparación:');
    console.log(`  Esperado: ${clasificacionEsperada}`);
    console.log(`  Obtenido: ${resultado.tipo}`);
    
    if (!coincide) {
      console.log('\n⚠️  CLASIFICACIÓN INCORRECTA');
      console.log('Por favor reporta este caso para ajustar los criterios.');
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  return {
    datos,
    estadisticas: { intercepto, pendiente },
    resultado,
    esperado: clasificacionEsperada,
    coincide: resultado.tipo === clasificacionEsperada
  };
}

/**
 * Casos de prueba predefinidos
 */
export const CASOS_PRUEBA = {
  retrasoEstable: {
    nombre: 'Retraso Estable (Delayed Onset)',
    datos: [
      { edad: 12, valor: 9 },
      { edad: 18, valor: 15 },
      { edad: 24, valor: 21 },
      { edad: 30, valor: 27 }
    ],
    esperado: 'DELAYED_ONSET',
    descripcion: 'Intercepto bajo, pendiente ~1.0, brecha constante'
  },
  
  velocidadReducida: {
    nombre: 'Velocidad Reducida (Slowed Rate Divergente)',
    datos: [
      { edad: 12, valor: 12 },
      { edad: 18, valor: 15 },
      { edad: 24, valor: 18 },
      { edad: 30, valor: 21 }
    ],
    esperado: 'SLOWED_RATE_DIVERGENTE',
    descripcion: 'Inicio normal, pendiente 0.5, alejándose'
  },
  
  catchingUp: {
    nombre: 'Catching Up (Slowed Rate Convergente)',
    datos: [
      { edad: 12, valor: 8 },
      { edad: 18, valor: 15 },
      { edad: 24, valor: 22 },
      { edad: 30, valor: 29 }
    ],
    esperado: 'SLOWED_RATE_CONVERGENTE',
    descripcion: 'Inicio bajo, pendiente >1, acercándose'
  },
  
  asintotaPrematura: {
    nombre: 'Asíntota Prematura',
    datos: [
      { edad: 12, valor: 10 },
      { edad: 18, valor: 18 },
      { edad: 24, valor: 25 },
      { edad: 30, valor: 26 },
      { edad: 36, valor: 26 }
    ],
    esperado: 'PREMATURE_ASYMPTOTE',
    descripcion: 'Progreso inicial rápido, luego se detiene'
  },
  
  desarrolloNormal: {
    nombre: 'Desarrollo Normal',
    datos: [
      { edad: 12, valor: 12 },
      { edad: 18, valor: 18 },
      { edad: 24, valor: 24 },
      { edad: 30, valor: 30 }
    ],
    esperado: 'DESARROLLO_NORMAL',
    descripcion: 'Pendiente 1.0, nivel adecuado'
  },
  
  regresion: {
    nombre: 'Regresión/Dismadurez',
    datos: [
      { edad: 12, valor: 12 },
      { edad: 18, valor: 17 },
      { edad: 24, valor: 20 },
      { edad: 30, valor: 21 },
      { edad: 36, valor: 20 }
    ],
    esperado: 'DYSMATURITY',
    descripcion: 'Inicio normal, deterioro progresivo'
  },
  
  velocidadBajaConstante: {
    nombre: 'Velocidad Baja pero Constante',
    datos: [
      { edad: 12, valor: 70 },
      { edad: 18, valor: 72 },
      { edad: 24, valor: 74 },
      { edad: 30, valor: 76 }
    ],
    esperado: 'SLOWED_RATE_CONVERGENTE',
    descripcion: 'Progreso lento pero lineal'
  }
};

/**
 * Ejecuta todos los casos de prueba y genera un reporte
 */
export function compararCasos() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  SUITE DE VALIDACIÓN DE CLASIFICACIÓN DE TRAYECTORIAS    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  const resultados = [];
  
  Object.entries(CASOS_PRUEBA).forEach(([id, caso]) => {
    const resultado = testCaso(caso.datos, caso.esperado, caso.nombre);
    resultados.push({
      id,
      nombre: caso.nombre,
      esperado: caso.esperado,
      obtenido: resultado.resultado.tipo,
      coincide: resultado.coincide,
      confianza: resultado.resultado.confianza
    });
  });
  
  // Reporte final
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMEN DE RESULTADOS                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  const total = resultados.length;
  const correctos = resultados.filter(r => r.coincide).length;
  const porcentaje = (correctos / total * 100).toFixed(1);
  
  console.table(resultados.map(r => ({
    'Caso': r.nombre,
    'Esperado': r.esperado,
    'Obtenido': r.obtenido,
    'OK': r.coincide ? '✅' : '❌',
    'Confianza': `${(r.confianza * 100).toFixed(0)}%`
  })));
  
  console.log(`\n📊 Precisión: ${correctos}/${total} (${porcentaje}%)`);
  
  if (correctos < total) {
    console.log('\n⚠️  Hay casos mal clasificados. Revisa los logs arriba.');
    console.log('📝 Por favor reporta los casos incorrectos para ajustar criterios.');
  } else {
    console.log('\n✅ Todos los casos clasificados correctamente!');
  }
  
  return resultados;
}

/**
 * Genera un reporte markdown para documentar casos
 */
export function generarReporteMarkdown(resultados) {
  let md = '# Reporte de Validación de Clasificación\n\n';
  md += `Fecha: ${new Date().toLocaleString()}\n\n`;
  
  const correctos = resultados.filter(r => r.coincide).length;
  const total = resultados.length;
  
  md += `## Resumen\n\n`;
  md += `- Total casos: ${total}\n`;
  md += `- Correctos: ${correctos}\n`;
  md += `- Incorrectos: ${total - correctos}\n`;
  md += `- Precisión: ${(correctos/total*100).toFixed(1)}%\n\n`;
  
  md += `## Casos Incorrectos\n\n`;
  resultados.filter(r => !r.coincide).forEach(r => {
    md += `### ${r.nombre}\n\n`;
    md += `- **Esperado:** ${r.esperado}\n`;
    md += `- **Obtenido:** ${r.obtenido}\n`;
    md += `- **Confianza:** ${(r.confianza * 100).toFixed(0)}%\n\n`;
  });
  
  return md;
}

/**
 * Exporta función para probar un caso personalizado desde la consola
 */
window.testClasificacion = testCaso;
window.compararClasificaciones = compararCasos;

console.log('✨ Herramienta de testing cargada!');
console.log('Usa: testClasificacion(datos, esperado, descripcion)');
console.log('O: compararClasificaciones() para ver todos los casos');
