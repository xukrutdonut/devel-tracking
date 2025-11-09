import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { calcularEdadCorregidaMeses } from '../utils/ageCalculations';

/**
 * Componente para generar informes PDF exportables
 * Compatible con copiar/pegar en historias clínicas electrónicas
 */

/**
 * Genera una gráfica de barras ASCII para visualizar edad de desarrollo por dominio
 */
function generarGraficaASCII(datosDominios, edadCronologica) {
  if (!datosDominios || datosDominios.length === 0) {
    return 'No hay datos suficientes para generar gráfica.\n';
  }

  // Escala: cada carácter representa cierta cantidad de meses
  const escalaMax = Math.max(
    edadCronologica * 1.3,
    ...datosDominios.map(d => d.ed)
  );
  const escalaMin = 0;
  const anchoGrafica = 50; // caracteres
  
  let grafica = `\nGRÁFICA 1: EDAD DE DESARROLLO POR DOMINIO
═══════════════════════════════════════════════════════════
(Cada █ representa ${(escalaMax / anchoGrafica).toFixed(1)} meses)\n\n`;
  
  // Línea de referencia para edad cronológica
  const posEC = Math.round((edadCronologica / escalaMax) * anchoGrafica);
  
  // Generar cada barra
  datosDominios.forEach(dom => {
    const longitudBarra = Math.round((dom.ed / escalaMax) * anchoGrafica);
    const nombreAbreviado = dom.nombre.substring(0, 18).padEnd(18, ' ');
    
    // Crear la barra con color según diferencia
    const diferencia = dom.ed - edadCronologica;
    let caracterBarra = '█';
    if (Math.abs(diferencia) < 2) {
      caracterBarra = '█'; // Normal
    } else if (diferencia > 0) {
      caracterBarra = '█'; // Adelantado
    } else {
      caracterBarra = '▓'; // Atrasado (trama más clara)
    }
    
    let barra = caracterBarra.repeat(Math.max(0, longitudBarra));
    
    // Añadir indicador de diferencia con EC
    let indicador = '';
    if (Math.abs(diferencia) < 2) {
      indicador = ' ≈ EC';
    } else if (diferencia > 0) {
      indicador = ` +${diferencia.toFixed(1)}m`;
    } else {
      indicador = ` ${diferencia.toFixed(1)}m`;
    }
    
    grafica += `${nombreAbreviado}│${barra} ${dom.ed.toFixed(1)}m${indicador}\n`;
  });
  
  // Línea de escala
  grafica += `${''.padEnd(18, ' ')}│${''.padEnd(anchoGrafica, '─')}\n`;
  
  // Marcas de escala
  const marcas = [];
  for (let i = 0; i <= 4; i++) {
    const valor = (escalaMax / 4) * i;
    const pos = Math.round((valor / escalaMax) * anchoGrafica);
    marcas.push({ pos, valor });
  }
  
  // Línea con marcas
  let lineaMarcas = ''.padEnd(18, ' ') + '│';
  for (let i = 0; i < anchoGrafica; i++) {
    const marca = marcas.find(m => m.pos === i);
    if (marca) {
      lineaMarcas += '┴';
    } else if (i === posEC) {
      lineaMarcas += '↓'; // Indicador de EC
    } else {
      lineaMarcas += ' ';
    }
  }
  grafica += lineaMarcas + '\n';
  
  // Valores de escala
  let lineaValores = ''.padEnd(18, ' ') + '  ';
  marcas.forEach(marca => {
    const valorStr = marca.valor.toFixed(0);
    lineaValores += valorStr.padEnd(Math.floor(anchoGrafica / 4), ' ');
  });
  grafica += lineaValores + ' (meses)\n';
  
  // Leyenda
  grafica += `\n  ↓ EC (Edad Cronológica): ${edadCronologica.toFixed(1)} meses\n`;
  grafica += `  █ ED por encima o similar a EC\n`;
  grafica += `  ▓ ED por debajo de EC\n`;
  
  return grafica;
}

/**
 * Genera una gráfica de Z-scores ASCII
 */
function generarGraficaZScoreASCII(datosDominios) {
  if (!datosDominios || datosDominios.length === 0) {
    return '';
  }

  const anchoGrafica = 50;
  const zMax = 3; // -3 a +3 DE
  const zMin = -3;
  const rangoZ = zMax - zMin;
  const posicionCero = Math.round((Math.abs(zMin) / rangoZ) * anchoGrafica);
  
  let grafica = `\n\nGRÁFICA 2: PUNTUACIÓN Z POR DOMINIO (DESVIACIONES ESTÁNDAR)
═══════════════════════════════════════════════════════════
(Rango normal: -1 a +1 DE | Vigilancia: -2 a -1 DE | Retraso: < -2 DE)\n\n`;
  
  // Zonas de referencia
  const pos_menos2 = Math.round(((Math.abs(zMin) - 2) / rangoZ) * anchoGrafica);
  const pos_menos1 = Math.round(((Math.abs(zMin) - 1) / rangoZ) * anchoGrafica);
  const pos_mas1 = Math.round(((Math.abs(zMin) + 1) / rangoZ) * anchoGrafica);
  const pos_mas2 = Math.round(((Math.abs(zMin) + 2) / rangoZ) * anchoGrafica);
  
  // Generar cada barra de Z-score
  datosDominios.forEach(dom => {
    const nombreAbreviado = dom.nombre.substring(0, 18).padEnd(18, ' ');
    const zScore = Math.max(zMin, Math.min(zMax, dom.z)); // Limitar a rango
    const posZ = Math.round(((zScore - zMin) / rangoZ) * anchoGrafica);
    
    // Construir la línea
    let linea = '';
    for (let i = 0; i < anchoGrafica; i++) {
      if (i === posicionCero) {
        linea += '│'; // Línea central (Z=0)
      } else if (i === posZ) {
        // Marcar la posición del Z-score con símbolo según zona
        if (zScore < -2) {
          linea += '●'; // Retraso severo
        } else if (zScore < -1) {
          linea += '◐'; // Vigilancia
        } else if (zScore <= 1) {
          linea += '○'; // Normal
        } else {
          linea += '◉'; // Adelantado
        }
      } else if ((i === pos_menos2 || i === pos_menos1 || i === pos_mas1 || i === pos_mas2)) {
        linea += '┊'; // Líneas de zona
      } else {
        linea += ' ';
      }
    }
    
    grafica += `${nombreAbreviado}│${linea} z=${zScore.toFixed(2)}\n`;
  });
  
  // Línea de escala
  grafica += `${''.padEnd(18, ' ')}│${''.padEnd(anchoGrafica, '─')}\n`;
  
  // Marcas de escala
  let lineaMarcas = ''.padEnd(18, ' ') + '│';
  for (let i = 0; i < anchoGrafica; i++) {
    if (i === posicionCero) {
      lineaMarcas += '┼';
    } else if (i === pos_menos2 || i === pos_mas2) {
      lineaMarcas += '┴';
    } else if (i === pos_menos1 || i === pos_mas1) {
      lineaMarcas += '┴';
    } else {
      lineaMarcas += ' ';
    }
  }
  grafica += lineaMarcas + '\n';
  
  // Valores de escala
  let lineaValores = ''.padEnd(18, ' ') + '  ';
  const posiciones = [
    { pos: 0, valor: '-3' },
    { pos: pos_menos2, valor: '-2' },
    { pos: pos_menos1, valor: '-1' },
    { pos: posicionCero, valor: '0' },
    { pos: pos_mas1, valor: '+1' },
    { pos: pos_mas2, valor: '+2' },
    { pos: anchoGrafica - 1, valor: '+3' }
  ];
  
  let ultPos = 0;
  posiciones.forEach(p => {
    const espacios = p.pos - ultPos;
    lineaValores += ''.padEnd(Math.max(0, espacios), ' ') + p.valor;
    ultPos = p.pos + p.valor.length;
  });
  grafica += lineaValores + ' DE\n';
  
  // Leyenda
  grafica += `\n  ● Retraso severo (< -2 DE) | ◐ Vigilancia (-2 a -1 DE)\n`;
  grafica += `  ○ Normal (-1 a +1 DE) | ◉ Adelantado (> +1 DE)\n`;
  grafica += `  │ Línea de referencia (Z=0, desarrollo esperado)\n`;
  
  return grafica;
}

/**
 * Interpreta el Z-score
 */
function interpretarZScore(z) {
  if (z === null || z === undefined || isNaN(z)) {
    return 'No disponible';
  }
  
  if (z >= 2) {
    return `MUY ADELANTADO (>${+2} DE) - Desarrollo significativamente superior`;
  } else if (z >= 1) {
    return `ADELANTADO (+1 a +2 DE) - Desarrollo superior al promedio`;
  } else if (z >= -1) {
    return `NORMAL (-1 a +1 DE) - Desarrollo dentro del rango esperado`;
  } else if (z >= -2) {
    return `VIGILANCIA (-2 a -1 DE) - Desarrollo ligeramente por debajo, requiere seguimiento`;
  } else if (z >= -3) {
    return `RETRASO MODERADO (-3 a -2 DE) - Requiere intervención`;
  } else {
    return `RETRASO SEVERO (<-3 DE) - Requiere intervención urgente y evaluación especializada`;
  }
}

export default function GeneradorInforme({ ninoId, ninoData, analisisData, redFlags, onClose }) {
  const [generando, setGenerando] = useState(false);
  const [formato, setFormato] = useState('pdf'); // 'pdf' o 'texto'

  const generarInformeTexto = () => {
    // Debug: verificar qué datos estamos recibiendo
    console.log('📄 [GeneradorInforme] Generando informe...');
    console.log('   - ninoData:', ninoData);
    console.log('   - analisisData:', analisisData);
    
    if (analisisData) {
      console.log('   - analisisData.hitos_conseguidos:', analisisData.hitos_conseguidos);
      console.log('   - analisisData.hitos_conseguidos.length:', analisisData.hitos_conseguidos?.length);
      console.log('   - analisisData.estadisticas_por_dominio:', analisisData.estadisticas_por_dominio);
      
      if (analisisData.hitos_conseguidos && analisisData.hitos_conseguidos.length > 0) {
        console.log('   - Primer hito:', analisisData.hitos_conseguidos[0]);
      }
      
      if (analisisData.estadisticas_por_dominio) {
        console.log('   - Dominios en estadisticas:', Object.keys(analisisData.estadisticas_por_dominio));
        const primerDominio = Object.keys(analisisData.estadisticas_por_dominio)[0];
        if (primerDominio) {
          console.log('   - Contenido primer dominio:', analisisData.estadisticas_por_dominio[primerDominio]);
        }
      }
    } else {
      console.error('   ⚠️ analisisData es null o undefined');
    }
    
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calcular edad cronológica en meses
    const fechaNac = new Date(ninoData.fecha_nacimiento);
    const hoy = new Date();
    const edadCronologicaMeses = calcularEdadCorregidaMeses(
      ninoData.fecha_nacimiento, 
      ninoData.semanas_gestacion || 40
    );

    let informe = `═══════════════════════════════════════════════════════════
INFORME DE EVALUACIÓN DEL NEURODESARROLLO
═══════════════════════════════════════════════════════════

Fecha de evaluación: ${fecha}
Sistema: Seguimiento del Neurodesarrollo Infantil v0.3.0
Institución: Neuropedia Lab

───────────────────────────────────────────────────────────
1. DATOS DEL PACIENTE
───────────────────────────────────────────────────────────

Nombre: ${ninoData.nombre}
Fecha de nacimiento: ${new Date(ninoData.fecha_nacimiento).toLocaleDateString('es-ES')}
Edad cronológica: ${calcularEdadTexto(ninoData.fecha_nacimiento)} (${edadCronologicaMeses.toFixed(1)} meses)
Sexo: ${ninoData.sexo === 'M' ? 'Masculino' : 'Femenino'}
${ninoData.prematuridad ? `Prematuridad: Sí (${ninoData.semanas_gestacion} semanas)\nEdad corregida: ${edadCronologicaMeses.toFixed(1)} meses` : ''}
${ninoData.factores_riesgo ? `Factores de riesgo: ${ninoData.factores_riesgo}` : ''}

───────────────────────────────────────────────────────────
2. RESUMEN EJECUTIVO
───────────────────────────────────────────────────────────
`;

    // Recopilar datos de dominios primero
    const nombresDominios = {
      1: 'Motor Grueso',
      2: 'Motor Fino',
      3: 'Lenguaje Receptivo',
      4: 'Lenguaje Expresivo',
      5: 'Social-Emocional',
      6: 'Cognitivo',
      7: 'Adaptativo'
    };

    const datosDominios = [];
    
    // Intentar obtener hitos desde diferentes fuentes
    let hitos_conseguidos = [];
    
    if (analisisData) {
      // Opción 1: hitos_conseguidos directamente
      if (analisisData.hitos_conseguidos && Array.isArray(analisisData.hitos_conseguidos)) {
        hitos_conseguidos = analisisData.hitos_conseguidos;
        console.log('   ✓ Usando hitos_conseguidos:', hitos_conseguidos.length);
      }
      // Opción 2: estadisticas_por_dominio (estructura alternativa)
      else if (analisisData.estadisticas_por_dominio) {
        console.log('   → Convirtiendo estadisticas_por_dominio a hitos...');
        // Convertir estadisticas_por_dominio a array de hitos
        Object.entries(analisisData.estadisticas_por_dominio).forEach(([dominioId, hitos]) => {
          if (Array.isArray(hitos)) {
            hitos_conseguidos.push(...hitos);
          }
        });
        console.log('   ✓ Hitos extraídos:', hitos_conseguidos.length);
      } else {
        console.warn('   ⚠️ No se encontraron hitos en ninguna estructura');
      }
    } else {
      console.warn('   ⚠️ analisisData es null o undefined');
    }
    
    console.log('   - Total hitos a procesar:', hitos_conseguidos.length);
    
    if (hitos_conseguidos.length > 0) {
      // Verificar que los hitos tengan los campos necesarios
      const primerHito = hitos_conseguidos[0];
      console.log('   - Campos del primer hito:', Object.keys(primerHito));
      console.log('   - edad_media_meses:', primerHito.edad_media_meses);
      console.log('   - desviacion_estandar:', primerHito.desviacion_estandar);
      console.log('   - dominio_id:', primerHito.dominio_id);
      
      // Agrupar hitos por dominio y calcular ED promedio
      const hitosPorDominio = {};
      
      hitos_conseguidos.forEach(hito => {
        const dominioId = hito.dominio_id;
        if (!hitosPorDominio[dominioId]) {
          hitosPorDominio[dominioId] = [];
        }
        hitosPorDominio[dominioId].push(hito);
      });
      
      console.log('   - Dominios encontrados:', Object.keys(hitosPorDominio));
      console.log('   - Hitos por dominio:', Object.entries(hitosPorDominio).map(([id, h]) => `${id}:${h.length}`).join(', '));
      
      // Calcular métricas para cada dominio
      Object.entries(hitosPorDominio).forEach(([dominioId, hitos]) => {
        if (hitos.length > 0) {
          // Calcular edad de desarrollo del dominio (promedio de edades medias de los hitos)
          const sumaEdades = hitos.reduce((sum, h) => sum + (h.edad_media_meses || 0), 0);
          const edadDesarrollo = sumaEdades / hitos.length;
          
          // Calcular desviación estándar promedio del dominio
          const sumaDE = hitos.reduce((sum, h) => sum + (h.desviacion_estandar || 0), 0);
          const dePromedio = sumaDE / hitos.length || Math.max(edadCronologicaMeses * 0.15, 2);
          
          // Calcular Z-score para este dominio: (ED - EC) / DE
          const zScore = (edadDesarrollo - edadCronologicaMeses) / dePromedio;
          
          // Calcular cociente de desarrollo: (ED / EC) * 100
          const cd = (edadDesarrollo / edadCronologicaMeses) * 100;
          
          console.log(`   - Dominio ${dominioId}: ED=${edadDesarrollo.toFixed(1)}, Z=${zScore.toFixed(2)}, CD=${cd.toFixed(1)}%`);
          
          datosDominios.push({
            id: parseInt(dominioId),
            nombre: nombresDominios[dominioId] || `Dominio ${dominioId}`,
            ed: edadDesarrollo,
            z: zScore,
            cd: cd,
            numHitos: hitos.length
          });
        }
      });
      
      console.log('   ✓ Datos de dominios calculados:', datosDominios.length);
    } else {
      console.warn('   ⚠️ No hay hitos para procesar - El informe estará vacío');
    }

    // Ordenar por ID de dominio
    datosDominios.sort((a, b) => a.id - b.id);
    
    // Calcular métricas globales
    let edadDesarrolloGlobal = null;
    let zScoreGlobal = null;
    let cdGlobal = null;
    
    if (datosDominios.length > 0) {
      // ED global = promedio de las ED de todos los dominios
      const sumaED = datosDominios.reduce((sum, d) => sum + d.ed, 0);
      edadDesarrolloGlobal = sumaED / datosDominios.length;
      
      // Z-score global = promedio de z-scores de dominios
      const sumaZ = datosDominios.reduce((sum, d) => sum + d.z, 0);
      zScoreGlobal = sumaZ / datosDominios.length;
      
      // CD global = (ED global / EC) * 100
      cdGlobal = (edadDesarrolloGlobal / edadCronologicaMeses) * 100;
    }

    informe += `
PUNTUACIÓN GLOBAL:
  Edad Cronológica (EC):         ${edadCronologicaMeses.toFixed(1)} meses
  Edad de Desarrollo (ED):       ${edadDesarrolloGlobal ? edadDesarrolloGlobal.toFixed(1) : 'N/A'} meses
  Diferencia (ED - EC):          ${edadDesarrolloGlobal ? (edadDesarrolloGlobal - edadCronologicaMeses > 0 ? '+' : '') + (edadDesarrolloGlobal - edadCronologicaMeses).toFixed(1) : 'N/A'} meses
  Cociente de Desarrollo (CD):   ${cdGlobal ? cdGlobal.toFixed(1) : 'N/A'}%
  Puntuación Z Global:           ${zScoreGlobal !== null ? zScoreGlobal.toFixed(2) : 'N/A'} DE

Interpretación Global: ${interpretarZScore(zScoreGlobal)}

`;

    // Añadir gráfica ASCII de barras para ED por dominio
    informe += `───────────────────────────────────────────────────────────
3. PERFIL DE DESARROLLO POR DOMINIOS
───────────────────────────────────────────────────────────

`;

    // Crear gráficas ASCII
    informe += generarGraficaASCII(datosDominios, edadCronologicaMeses);
    informe += generarGraficaZScoreASCII(datosDominios);

    informe += `\n
DATOS DETALLADOS POR DOMINIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // Tabla detallada de dominios
    datosDominios.forEach(dom => {
      informe += `
${dom.nombre} (${dom.numHitos} hitos evaluados):
  ┌─────────────────────────────────────────────────────────┐
  │ Edad de Desarrollo (ED):     ${dom.ed.toFixed(1).padEnd(7)} meses    │
  │ Edad Cronológica (EC):       ${edadCronologicaMeses.toFixed(1).padEnd(7)} meses    │
  │ Diferencia (ED - EC):        ${((dom.ed - edadCronologicaMeses > 0 ? '+' : '') + (dom.ed - edadCronologicaMeses).toFixed(1)).padEnd(7)} meses    │
  │ Cociente Desarrollo (CD):    ${dom.cd.toFixed(1).padEnd(7)}%         │
  │ Puntuación Z:                ${dom.z.toFixed(2).padEnd(7)} DE        │
  │ Interpretación:              ${interpretarZScore(dom.z).substring(0, 30).padEnd(30)} │
  └─────────────────────────────────────────────────────────┘
`;
    });

    informe += `
───────────────────────────────────────────────────────────
4. ANÁLISIS DE ASINCRONÍAS
───────────────────────────────────────────────────────────

`;

    // Detectar asincronías entre dominios
    const asincronias = [];
    for (let i = 0; i < datosDominios.length; i++) {
      for (let j = i + 1; j < datosDominios.length; j++) {
        const diferencia = Math.abs(datosDominios[i].ed - datosDominios[j].ed);
        if (diferencia > 3) { // Diferencia significativa > 3 meses
          asincronias.push({
            dom1: datosDominios[i].nombre,
            dom2: datosDominios[j].nombre,
            dif: diferencia,
            mayor: datosDominios[i].ed > datosDominios[j].ed ? datosDominios[i].nombre : datosDominios[j].nombre
          });
        }
      }
    }

    if (asincronias.length > 0) {
      asincronias.sort((a, b) => b.dif - a.dif);
      asincronias.forEach(asin => {
        informe += `• ${asin.dom1} vs ${asin.dom2}: ${asin.dif.toFixed(1)} meses de diferencia
  → ${asin.mayor} está más adelantado
`;
      });
    } else {
      informe += `No se detectaron asincronías significativas entre dominios.
El desarrollo es relativamente homogéneo.
`;
    }

    // Red flags
    if (redFlags && redFlags.length > 0) {
      informe += `
───────────────────────────────────────────────────────────
5. SEÑALES DE ALARMA OBSERVADAS
───────────────────────────────────────────────────────────

`;
      redFlags.forEach(rf => {
        informe += `• ${rf.descripcion}
  Edad de observación: ${rf.edad_meses} meses
  Nivel de severidad: ${rf.severidad || 'No especificado'}

`;
      });
    }

    informe += `
───────────────────────────────────────────────────────────
6. INTERPRETACIÓN Y RECOMENDACIONES
───────────────────────────────────────────────────────────

`;

    // Interpretación basada en resultados
    const interpretacion = generarInterpretacionClinica(analisisData, redFlags);
    informe += interpretacion;

    informe += `

───────────────────────────────────────────────────────────
6. REFERENCIAS CIENTÍFICAS
───────────────────────────────────────────────────────────

Este informe se basa en las siguientes fuentes científicas:

• CDC (2022). Developmental Milestones - Learn the Signs. Act Early.
  Centers for Disease Control and Prevention.

• Pathways.org (2024). Developmental Milestone Resources.
  Pathways Medical Organization.

• Thomas et al. (2009). Using developmental trajectories to understand
  developmental disorders. J Speech Lang Hear Res, 52(2):336-58.

• Tervo (2006). Identifying patterns of developmental delays can help
  diagnose neurodevelopmental disorders. Clin Pediatr, 45(6):509-17.

───────────────────────────────────────────────────────────
NOTA IMPORTANTE
───────────────────────────────────────────────────────────

Este informe es una herramienta de apoyo clínico y no sustituye
la evaluación integral por profesionales de la salud especializados
en neurodesarrollo infantil. Los resultados deben interpretarse en
el contexto clínico completo del paciente.

Generado automáticamente por: Sistema de Seguimiento del
Neurodesarrollo Infantil v0.3.0 - Neuropedia Lab
Fecha de generación: ${fecha}

═══════════════════════════════════════════════════════════
`;

    return informe;
  };

  const generarPDF = async () => {
    setGenerando(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      let yPosition = margin;

      // Título
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('INFORME DE EVALUACIÓN DEL NEURODESARROLLO', margin, yPosition);
      yPosition += 10;

      // Subtítulo
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
      yPosition += 5;
      pdf.text('Sistema: Seguimiento del Neurodesarrollo Infantil v0.3.0', margin, yPosition);
      yPosition += 10;

      // Línea separadora
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Datos del paciente
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('DATOS DEL PACIENTE', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const datosTexto = [
        `Nombre: ${ninoData.nombre}`,
        `Fecha de nacimiento: ${new Date(ninoData.fecha_nacimiento).toLocaleDateString('es-ES')}`,
        `Edad: ${calcularEdadTexto(ninoData.fecha_nacimiento)}`,
        `Sexo: ${ninoData.sexo === 'M' ? 'Masculino' : 'Femenino'}`
      ];

      if (ninoData.prematuridad) {
        datosTexto.push(`Prematuridad: Sí (${ninoData.semanas_gestacion} semanas)`);
        datosTexto.push(`Edad corregida: ${calcularEdadCorregidaMeses(ninoData.fecha_nacimiento, ninoData.semanas_gestacion)} meses`);
      }

      datosTexto.forEach(texto => {
        pdf.text(texto, margin, yPosition);
        yPosition += 5;
      });

      yPosition += 5;

      // Resumen ejecutivo con métricas globales
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('RESUMEN EJECUTIVO', margin, yPosition);
      yPosition += 7;

      // Calcular métricas globales (similar a la función de texto)
      const edadCronologicaMeses = calcularEdadCorregidaMeses(
        ninoData.fecha_nacimiento, 
        ninoData.semanas_gestacion || 40
      );

      const nombresDominios = {
        1: 'Motor Grueso',
        2: 'Motor Fino',
        3: 'Lenguaje Receptivo',
        4: 'Lenguaje Expresivo',
        5: 'Social-Emocional',
        6: 'Cognitivo',
        7: 'Adaptativo'
      };

      const datosDominios = [];
      
      // Intentar obtener hitos desde diferentes fuentes
      let hitos_conseguidos = [];
      
      if (analisisData) {
        // Opción 1: hitos_conseguidos directamente
        if (analisisData.hitos_conseguidos && Array.isArray(analisisData.hitos_conseguidos)) {
          hitos_conseguidos = analisisData.hitos_conseguidos;
        }
        // Opción 2: estadisticas_por_dominio (estructura alternativa)
        else if (analisisData.estadisticas_por_dominio) {
          // Convertir estadisticas_por_dominio a array de hitos
          Object.entries(analisisData.estadisticas_por_dominio).forEach(([dominioId, hitos]) => {
            if (Array.isArray(hitos)) {
              hitos_conseguidos.push(...hitos);
            }
          });
        }
      }
      
      if (hitos_conseguidos.length > 0) {
        const hitosPorDominio = {};
        
        hitos_conseguidos.forEach(hito => {
          const dominioId = hito.dominio_id;
          if (!hitosPorDominio[dominioId]) {
            hitosPorDominio[dominioId] = [];
          }
          hitosPorDominio[dominioId].push(hito);
        });
        
        Object.entries(hitosPorDominio).forEach(([dominioId, hitos]) => {
          if (hitos.length > 0) {
            const sumaEdades = hitos.reduce((sum, h) => sum + (h.edad_media_meses || 0), 0);
            const edadDesarrollo = sumaEdades / hitos.length;
            
            const sumaDE = hitos.reduce((sum, h) => sum + (h.desviacion_estandar || 0), 0);
            const dePromedio = sumaDE / hitos.length || Math.max(edadCronologicaMeses * 0.15, 2);
            
            const zScore = (edadDesarrollo - edadCronologicaMeses) / dePromedio;
            const cd = (edadDesarrollo / edadCronologicaMeses) * 100;
            
            datosDominios.push({
              id: parseInt(dominioId),
              nombre: nombresDominios[dominioId] || `Dominio ${dominioId}`,
              ed: edadDesarrollo,
              z: zScore,
              cd: cd,
              numHitos: hitos.length
            });
          }
        });
      }

      datosDominios.sort((a, b) => a.id - b.id);
      
      let edadDesarrolloGlobal = null;
      let zScoreGlobal = null;
      let cdGlobal = null;
      
      if (datosDominios.length > 0) {
        const sumaED = datosDominios.reduce((sum, d) => sum + d.ed, 0);
        edadDesarrolloGlobal = sumaED / datosDominios.length;
        
        const sumaZ = datosDominios.reduce((sum, d) => sum + d.z, 0);
        zScoreGlobal = sumaZ / datosDominios.length;
        
        cdGlobal = (edadDesarrolloGlobal / edadCronologicaMeses) * 100;
      }

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const resumenTexto = [
        `Edad Cronológica (EC): ${edadCronologicaMeses.toFixed(1)} meses`,
        `Edad de Desarrollo (ED): ${edadDesarrolloGlobal ? edadDesarrolloGlobal.toFixed(1) : 'N/A'} meses`,
        `Diferencia (ED - EC): ${edadDesarrolloGlobal ? (edadDesarrolloGlobal - edadCronologicaMeses > 0 ? '+' : '') + (edadDesarrolloGlobal - edadCronologicaMeses).toFixed(1) : 'N/A'} meses`,
        `Cociente de Desarrollo (CD): ${cdGlobal ? cdGlobal.toFixed(1) : 'N/A'}%`,
        `Puntuación Z Global: ${zScoreGlobal !== null ? zScoreGlobal.toFixed(2) : 'N/A'} DE`,
        ``,
        `Interpretación: ${interpretarZScore(zScoreGlobal)}`
      ];

      resumenTexto.forEach(texto => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = margin;
        }
        const lineas = pdf.splitTextToSize(texto, maxWidth);
        pdf.text(lineas, margin, yPosition);
        yPosition += lineas.length * 5;
      });

      yPosition += 5;

      // Resultados detallados por dominios
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('RESULTADOS DETALLADOS POR DOMINIOS', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');

      datosDominios.forEach(dom => {
        if (yPosition > pageHeight - 35) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFont(undefined, 'bold');
        pdf.text(`${dom.nombre} (${dom.numHitos} hitos)`, margin, yPosition);
        yPosition += 5;

        pdf.setFont(undefined, 'normal');
        const detallesDominio = [
          `  ED: ${dom.ed.toFixed(1)} meses | EC: ${edadCronologicaMeses.toFixed(1)} meses | Dif: ${(dom.ed - edadCronologicaMeses > 0 ? '+' : '')}${(dom.ed - edadCronologicaMeses).toFixed(1)} meses`,
          `  CD: ${dom.cd.toFixed(1)}% | Z-score: ${dom.z.toFixed(2)} DE`,
          `  ${interpretarZScore(dom.z)}`
        ];

        detallesDominio.forEach(texto => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = margin;
          }
          const lineas = pdf.splitTextToSize(texto, maxWidth);
          pdf.text(lineas, margin, yPosition);
          yPosition += lineas.length * 4;
        });

        yPosition += 3;
      });

      yPosition += 5;

      // Capturar gráficos específicos si están disponibles
      const graficosParaCapturar = [
        { id: 'grafica-desarrollo-principal', titulo: 'Edad de Desarrollo vs Edad Cronológica' },
        { id: 'grafica-zscore', titulo: 'Puntuaciones Z (Desviaciones Estándar)' },
        { id: 'grafica-velocidad-desarrollo', titulo: 'Velocidad del Desarrollo' },
        { id: 'grafica-aceleracion-desarrollo', titulo: 'Aceleración del Desarrollo' }
      ];

      let graficosCapturados = 0;
      
      for (const grafico of graficosParaCapturar) {
        const elemento = document.getElementById(grafico.id);
        
        if (elemento) {
          // Agregar nueva página si no hay espacio
          if (yPosition > pageHeight - 100 || graficosCapturados > 0) {
            pdf.addPage();
            yPosition = margin;
          }

          // Título de la sección en la primera gráfica
          if (graficosCapturados === 0) {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('GRÁFICOS DEL DESARROLLO', margin, yPosition);
            yPosition += 10;
          }

          try {
            // Título del gráfico
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text(grafico.titulo, margin, yPosition);
            yPosition += 7;

            const canvas = await html2canvas(elemento, {
              scale: 2, // Mejor calidad
              logging: false,
              useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = maxWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Limitar altura de imagen si es muy grande
            const maxImgHeight = pageHeight - yPosition - margin;
            const finalImgHeight = Math.min(imgHeight, maxImgHeight);
            const finalImgWidth = (finalImgHeight / imgHeight) * imgWidth;
            
            pdf.addImage(imgData, 'PNG', margin, yPosition, finalImgWidth, finalImgHeight);
            yPosition += finalImgHeight + 10;
            graficosCapturados++;
          } catch (error) {
            console.error(`Error al capturar gráfico ${grafico.id}:`, error);
          }
        } else {
          console.warn(`No se encontró el elemento con id: ${grafico.id}`);
        }
      }

      // Si no se capturaron gráficos específicos, intentar con las gráficas generales
      if (graficosCapturados === 0) {
        const graficosElements = document.querySelectorAll('.recharts-wrapper');
        if (graficosElements.length > 0) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.text('GRÁFICOS DEL DESARROLLO', margin, yPosition);
          yPosition += 7;

          for (let i = 0; i < Math.min(graficosElements.length, 4); i++) {
            if (yPosition > pageHeight - 100) {
              pdf.addPage();
              yPosition = margin;
            }

            try {
              const canvas = await html2canvas(graficosElements[i]);
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = maxWidth;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              
              pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
              yPosition += imgHeight + 10;
            } catch (error) {
              console.error('Error al capturar gráfico:', error);
            }
          }
        }
      }


      // Red flags
      if (redFlags && redFlags.length > 0) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('SEÑALES DE ALARMA', margin, yPosition);
        yPosition += 7;

        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        redFlags.slice(0, 5).forEach(rf => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          const texto = `• ${rf.descripcion} (${rf.edad_meses} meses)`;
          const lineas = pdf.splitTextToSize(texto, maxWidth);
          pdf.text(lineas, margin, yPosition);
          yPosition += lineas.length * 4;
        });
      }

      // Interpretación
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('INTERPRETACIÓN Y RECOMENDACIONES', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      const interpretacion = generarInterpretacionClinica(analisisData, redFlags);
      const lineasInterpretacion = pdf.splitTextToSize(interpretacion, maxWidth);
      lineasInterpretacion.forEach(linea => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(linea, margin, yPosition);
        yPosition += 4;
      });

      // Guardar PDF
      pdf.save(`informe_neurodesarrollo_${ninoData.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Intenta usar el formato de texto.');
    } finally {
      setGenerando(false);
    }
  };

  const copiarAlPortapapeles = () => {
    const texto = generarInformeTexto();
    navigator.clipboard.writeText(texto).then(() => {
      alert('✅ Informe copiado al portapapeles\n\nPuedes pegarlo directamente en tu historia clínica electrónica');
    }).catch(err => {
      console.error('Error al copiar:', err);
      // Fallback: mostrar en textarea para copiar manualmente
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Informe copiado al portapapeles');
    });
  };

  const descargarTexto = () => {
    const texto = generarInformeTexto();
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe_${ninoData.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-informe" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Generar Informe</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="informe-descripcion">
            Genera un informe completo con los resultados de la evaluación del neurodesarrollo.
            Puedes exportarlo en PDF o copiarlo como texto plano para pegar en historias clínicas electrónicas.
          </p>

          <div className="formato-selector">
            <h3>Selecciona el formato:</h3>
            <div className="formato-opciones">
              <label className={formato === 'pdf' ? 'active' : ''}>
                <input
                  type="radio"
                  value="pdf"
                  checked={formato === 'pdf'}
                  onChange={() => setFormato('pdf')}
                />
                <span>📄 PDF (con gráficos)</span>
              </label>
              <label className={formato === 'texto' ? 'active' : ''}>
                <input
                  type="radio"
                  value="texto"
                  checked={formato === 'texto'}
                  onChange={() => setFormato('texto')}
                />
                <span>📋 Texto plano (para copiar/pegar)</span>
              </label>
            </div>
          </div>

          <div className="informe-contenido">
            <h3>Vista previa del contenido:</h3>
            <div className="informe-preview">
              <pre>{generarInformeTexto().substring(0, 800)}...</pre>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          {formato === 'pdf' ? (
            <button 
              className="btn-generar-pdf" 
              onClick={generarPDF}
              disabled={generando}
            >
              {generando ? '⏳ Generando PDF...' : '📄 Descargar PDF'}
            </button>
          ) : (
            <>
              <button 
                className="btn-copiar" 
                onClick={copiarAlPortapapeles}
              >
                📋 Copiar al portapapeles
              </button>
              <button 
                className="btn-descargar-txt" 
                onClick={descargarTexto}
              >
                💾 Descargar TXT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Funciones auxiliares

function calcularEdadTexto(fechaNacimiento) {
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  const diffTime = Math.abs(hoy - fechaNac);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const meses = Math.floor(diffDays / 30.44);
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  
  if (anos > 0) {
    return `${anos} año${anos > 1 ? 's' : ''} y ${mesesRestantes} mes${mesesRestantes !== 1 ? 'es' : ''}`;
  } else {
    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  }
}

function interpretarCociente(cociente) {
  if (!cociente) return 'No evaluado';
  if (cociente >= 90) return 'Normal';
  if (cociente >= 75) return 'Retraso leve';
  if (cociente >= 60) return 'Retraso moderado';
  return 'Retraso severo';
}

function interpretarVelocidad(velocidad) {
  if (!velocidad) return 'No evaluada';
  if (velocidad >= 0.9) return 'Normal o acelerada';
  if (velocidad >= 0.7) return 'Levemente reducida';
  if (velocidad >= 0.5) return 'Moderadamente reducida';
  return 'Severamente reducida';
}

function generarInterpretacionClinica(analisisData, redFlags) {
  let interpretacion = '';

  // Análisis global
  if (analisisData?.global?.velocidad) {
    const vel = analisisData.global.velocidad;
    if (vel >= 0.9) {
      interpretacion += 'El paciente presenta un desarrollo global dentro de los parámetros esperados, con velocidad normal o acelerada. ';
    } else if (vel >= 0.7) {
      interpretacion += 'Se observa una velocidad de desarrollo levemente reducida que requiere monitoreo. ';
    } else if (vel >= 0.5) {
      interpretacion += 'El paciente muestra una velocidad de desarrollo moderadamente reducida, sugiriendo necesidad de intervención. ';
    } else {
      interpretacion += 'Se detecta una velocidad de desarrollo severamente reducida, indicando necesidad de evaluación especializada inmediata. ';
    }
  }

  // Asincronías
  if (analisisData?.asinchronias && analisisData.asinchronias.length > 0) {
    interpretacion += '\n\nSe identificaron asincronías significativas entre dominios del desarrollo, lo cual puede orientar hacia patrones diagnósticos específicos según la literatura (Tervo, 2006). ';
  }

  // Red flags
  if (redFlags && redFlags.length > 0) {
    interpretacion += `\n\nSe han observado ${redFlags.length} señal${redFlags.length > 1 ? 'es' : ''} de alarma que requieren atención clínica especializada. `;
  }

  // Recomendaciones generales
  interpretacion += '\n\nRecomendaciones:\n';
  interpretacion += '• Continuar seguimiento longitudinal del desarrollo\n';
  interpretacion += '• Considerar evaluación multidisciplinaria si hay señales de alarma\n';
  interpretacion += '• Promover ambientes estimulantes y apropiados al nivel del desarrollo\n';
  
  if (redFlags && redFlags.length > 0) {
    interpretacion += '• Derivación a neuropediatría o especialista en neurodesarrollo\n';
    interpretacion += '• Considerar programa de intervención temprana\n';
  }

  return interpretacion;
}
