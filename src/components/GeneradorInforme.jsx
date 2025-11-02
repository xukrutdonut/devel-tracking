import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { calcularEdadCorregidaMeses } from '../utils/ageCalculations';

/**
 * Componente para generar informes PDF exportables
 * Compatible con copiar/pegar en historias clínicas electrónicas
 */
export default function GeneradorInforme({ ninoId, ninoData, analisisData, redFlags, onClose }) {
  const [generando, setGenerando] = useState(false);
  const [formato, setFormato] = useState('pdf'); // 'pdf' o 'texto'

  const generarInformeTexto = () => {
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

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
Edad cronológica: ${calcularEdadTexto(ninoData.fecha_nacimiento)}
Sexo: ${ninoData.sexo === 'M' ? 'Masculino' : 'Femenino'}
${ninoData.prematuridad ? `Prematuridad: Sí (${ninoData.semanas_gestacion} semanas)\nEdad corregida: ${calcularEdadCorregidaMeses(ninoData.fecha_nacimiento, ninoData.semanas_gestacion)} meses` : ''}
${ninoData.factores_riesgo ? `Factores de riesgo: ${ninoData.factores_riesgo}` : ''}

───────────────────────────────────────────────────────────
2. RESULTADOS DE LA EVALUACIÓN POR DOMINIOS
───────────────────────────────────────────────────────────

`;

    // Añadir resultados por dominio
    if (analisisData && analisisData.dominios) {
      const nombresDominios = {
        1: 'Motor Grueso',
        2: 'Motor Fino',
        3: 'Lenguaje Receptivo',
        4: 'Lenguaje Expresivo',
        5: 'Social-Emocional',
        6: 'Cognitivo',
        7: 'Adaptativo'
      };

      Object.entries(analisisData.dominios).forEach(([id, datos]) => {
        const nombre = nombresDominios[id] || `Dominio ${id}`;
        const ultimoPunto = datos.puntos[datos.puntos.length - 1];
        
        informe += `${nombre}:
  • Edad de desarrollo: ${ultimoPunto?.edad_desarrollo?.toFixed(1) || 'N/A'} meses
  • Edad cronológica: ${ultimoPunto?.edad_cronologica?.toFixed(1) || 'N/A'} meses
  • Cociente de desarrollo: ${ultimoPunto?.cociente?.toFixed(0) || 'N/A'}%
  • Velocidad: ${datos.velocidad?.toFixed(2) || 'N/A'} meses/mes
  • Estado: ${interpretarCociente(ultimoPunto?.cociente)}

`;
      });
    }

    informe += `───────────────────────────────────────────────────────────
3. ANÁLISIS DE TRAYECTORIAS
───────────────────────────────────────────────────────────

`;

    // Análisis global
    if (analisisData?.global) {
      const glob = analisisData.global;
      informe += `Evaluación global:
  • Velocidad de desarrollo: ${glob.velocidad?.toFixed(2) || 'N/A'} meses/mes
  • Aceleración: ${glob.aceleracion?.toFixed(3) || 'N/A'} meses/mes²
  • Interpretación: ${interpretarVelocidad(glob.velocidad)}

`;
    }

    // Análisis de asincronías
    if (analisisData?.asinchronias && analisisData.asinchronias.length > 0) {
      informe += `Asincronías detectadas:
`;
      analisisData.asinchronias.forEach(asin => {
        informe += `  • ${asin.dominio1} vs ${asin.dominio2}: ${asin.diferencia.toFixed(1)} meses
`;
      });
      informe += '\n';
    }

    // Red flags
    if (redFlags && redFlags.length > 0) {
      informe += `───────────────────────────────────────────────────────────
4. SEÑALES DE ALARMA OBSERVADAS
───────────────────────────────────────────────────────────

`;
      redFlags.forEach(rf => {
        informe += `• ${rf.descripcion}
  Edad de observación: ${rf.edad_meses} meses
  Nivel de severidad: ${rf.severidad || 'No especificado'}

`;
      });
    }

    informe += `───────────────────────────────────────────────────────────
5. INTERPRETACIÓN Y RECOMENDACIONES
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

      // Resultados por dominios
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('RESULTADOS POR DOMINIOS', margin, yPosition);
      yPosition += 7;

      // Capturar gráficos si están disponibles
      const graficosElements = document.querySelectorAll('.recharts-wrapper');
      for (let i = 0; i < Math.min(graficosElements.length, 2); i++) {
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
