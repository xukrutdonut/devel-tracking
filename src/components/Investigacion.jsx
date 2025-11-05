import React, { useState } from 'react';
import './Investigacion.css';

/**
 * Componente de Investigación
 * 
 * Permite generar conjuntos de datos experimentales de poblaciones de niños
 * para valorar las propiedades psicométricas de cada escala de desarrollo,
 * así como identificar puntos ciegos del sistema, errores sistemáticos o limitaciones.
 */
function Investigacion() {
  const [parametros, setParametros] = useState({
    tamañoPoblacion: 100,
    rangoEdadMin: 0,
    rangoEdadMax: 36,
    distribucionDesarrollo: 'normal', // 'normal', 'sesgada', 'bimodal'
    porcentajeRetraso: 20,
    porcentajeAtipico: 10,
    variabilidadIntraIndividual: 'baja', // 'baja', 'media', 'alta'
    correlacionDominios: 0.7,
    incluirRegresiones: false,
    incluirEstancamientos: false,
    semillasAleatorias: true,
    valorSemilla: 12345
  });

  const [datosGenerados, setDatosGenerados] = useState(null);
  const [analisisGenerado, setAnalisisGenerado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleParametroChange = (nombre, valor) => {
    setParametros(prev => ({
      ...prev,
      [nombre]: valor
    }));
  };

  const generarDatosExperimentales = () => {
    setCargando(true);
    
    // Simulación de generación de datos
    setTimeout(() => {
      const datos = {
        poblacion: generarPoblacion(parametros),
        timestamp: new Date().toISOString(),
        parametrosUsados: { ...parametros }
      };
      
      setDatosGenerados(datos);
      
      // Analizar propiedades psicométricas
      const analisis = analizarPropiedadesPsicometricas(datos.poblacion, parametros);
      setAnalisisGenerado(analisis);
      
      setCargando(false);
    }, 1500);
  };

  const generarPoblacion = (params) => {
    const poblacion = [];
    
    for (let i = 0; i < params.tamañoPoblacion; i++) {
      const edadMeses = Math.random() * (params.rangoEdadMax - params.rangoEdadMin) + params.rangoEdadMin;
      
      // Determinar perfil del niño
      const rand = Math.random();
      let perfil = 'tipico';
      let factorDesarrollo = 1.0;
      
      if (rand < params.porcentajeRetraso / 100) {
        perfil = 'retraso';
        factorDesarrollo = 0.6 + Math.random() * 0.2; // 60-80% del desarrollo típico
      } else if (rand < (params.porcentajeRetraso + params.porcentajeAtipico) / 100) {
        perfil = 'atipico';
        factorDesarrollo = 0.4 + Math.random() * 0.3; // 40-70% del desarrollo típico
      }
      
      // Generar datos por dominio
      const dominios = ['motor_grueso', 'motor_fino', 'comunicacion', 'cognitivo', 'social_emocional'];
      const datosDominios = {};
      
      const edadDesarrolloBase = edadMeses * factorDesarrollo;
      
      dominios.forEach(dominio => {
        let variabilidad = 0;
        
        switch (params.variabilidadIntraIndividual) {
          case 'baja':
            variabilidad = (Math.random() - 0.5) * 2; // ±1 mes
            break;
          case 'media':
            variabilidad = (Math.random() - 0.5) * 6; // ±3 meses
            break;
          case 'alta':
            variabilidad = (Math.random() - 0.5) * 12; // ±6 meses
            break;
        }
        
        datosDominios[dominio] = Math.max(0, edadDesarrolloBase + variabilidad);
      });
      
      poblacion.push({
        id: `sim_${i + 1}`,
        edadCronologica: edadMeses,
        perfil: perfil,
        factorDesarrollo: factorDesarrollo,
        dominios: datosDominios,
        zScoreGlobal: ((factorDesarrollo - 1.0) / 0.15) // Asumiendo DE = 0.15
      });
    }
    
    return poblacion;
  };

  const analizarPropiedadesPsicometricas = (poblacion, params) => {
    // Calcular estadísticas descriptivas
    const edades = poblacion.map(n => n.edadCronologica);
    const factoresDesarrollo = poblacion.map(n => n.factorDesarrollo);
    const zScores = poblacion.map(n => n.zScoreGlobal);
    
    const mediaEdad = edades.reduce((a, b) => a + b, 0) / edades.length;
    const mediaFactorDesarrollo = factoresDesarrollo.reduce((a, b) => a + b, 0) / factoresDesarrollo.length;
    const mediaZScore = zScores.reduce((a, b) => a + b, 0) / zScores.length;
    
    // Calcular desviación estándar
    const deEdad = Math.sqrt(edades.map(x => Math.pow(x - mediaEdad, 2)).reduce((a, b) => a + b, 0) / edades.length);
    const deFactorDesarrollo = Math.sqrt(factoresDesarrollo.map(x => Math.pow(x - mediaFactorDesarrollo, 2)).reduce((a, b) => a + b, 0) / factoresDesarrollo.length);
    const deZScore = Math.sqrt(zScores.map(x => Math.pow(x - mediaZScore, 2)).reduce((a, b) => a + b, 0) / zScores.length);
    
    // Detectar casos atípicos (outliers)
    const outliers = poblacion.filter(n => Math.abs(n.zScoreGlobal) > 2).length;
    const porcentajeOutliers = (outliers / poblacion.length) * 100;
    
    // Analizar correlaciones entre dominios
    const correlaciones = calcularCorrelacionesDominios(poblacion);
    
    // Identificar puntos ciegos (rangos de edad con poca cobertura)
    const puntoCiegos = identificarPuntoCiegos(poblacion, params);
    
    // Análisis de sensibilidad y especificidad
    const sensibilidadEspecificidad = calcularSensibilidadEspecificidad(poblacion);
    
    return {
      estadisticasDescriptivas: {
        tamañoMuestra: poblacion.length,
        edadMedia: mediaEdad.toFixed(2),
        edadDE: deEdad.toFixed(2),
        factorDesarrolloMedio: mediaFactorDesarrollo.toFixed(3),
        factorDesarrolloDE: deFactorDesarrollo.toFixed(3),
        zScoreMedio: mediaZScore.toFixed(2),
        zScoreDE: deZScore.toFixed(2)
      },
      distribucionPerfiles: {
        tipico: poblacion.filter(n => n.perfil === 'tipico').length,
        retraso: poblacion.filter(n => n.perfil === 'retraso').length,
        atipico: poblacion.filter(n => n.perfil === 'atipico').length
      },
      outliers: {
        cantidad: outliers,
        porcentaje: porcentajeOutliers.toFixed(2)
      },
      correlacionesDominios: correlaciones,
      puntosCiegos: puntoCiegos,
      sensibilidadEspecificidad: sensibilidadEspecificidad,
      recomendaciones: generarRecomendaciones(poblacion, params, puntoCiegos, correlaciones)
    };
  };

  const calcularCorrelacionesDominios = (poblacion) => {
    const dominios = ['motor_grueso', 'motor_fino', 'comunicacion', 'cognitivo', 'social_emocional'];
    const correlaciones = {};
    
    for (let i = 0; i < dominios.length; i++) {
      for (let j = i + 1; j < dominios.length; j++) {
        const dom1 = dominios[i];
        const dom2 = dominios[j];
        
        const valores1 = poblacion.map(n => n.dominios[dom1]);
        const valores2 = poblacion.map(n => n.dominios[dom2]);
        
        const corr = calcularCorrelacionPearson(valores1, valores2);
        correlaciones[`${dom1}_${dom2}`] = corr.toFixed(3);
      }
    }
    
    return correlaciones;
  };

  const calcularCorrelacionPearson = (x, y) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
    const sumY2 = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);
    
    const numerador = n * sumXY - sumX * sumY;
    const denominador = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominador === 0 ? 0 : numerador / denominador;
  };

  const identificarPuntoCiegos = (poblacion, params) => {
    const rangoTotal = params.rangoEdadMax - params.rangoEdadMin;
    const numBins = 6; // Dividir el rango en 6 segmentos
    const anchoBin = rangoTotal / numBins;
    
    const bins = Array(numBins).fill(0);
    
    poblacion.forEach(n => {
      const binIndex = Math.min(Math.floor((n.edadCronologica - params.rangoEdadMin) / anchoBin), numBins - 1);
      bins[binIndex]++;
    });
    
    const puntoCiegos = [];
    const umbralMinimo = poblacion.length / (numBins * 2); // Menos del 50% del promedio
    
    bins.forEach((count, index) => {
      if (count < umbralMinimo) {
        const edadInicio = params.rangoEdadMin + index * anchoBin;
        const edadFin = edadInicio + anchoBin;
        puntoCiegos.push({
          rangoEdad: `${edadInicio.toFixed(0)}-${edadFin.toFixed(0)} meses`,
          muestras: count,
          severidad: count === 0 ? 'Crítico' : 'Moderado'
        });
      }
    });
    
    return puntoCiegos;
  };

  const calcularSensibilidadEspecificidad = (poblacion) => {
    // Simulación de clasificación correcta/incorrecta
    // En un caso real, esto compararía con diagnósticos clínicos validados
    
    const verdaderosPositivos = poblacion.filter(n => n.perfil !== 'tipico' && n.zScoreGlobal < -1.5).length;
    const falsosNegativos = poblacion.filter(n => n.perfil !== 'tipico' && n.zScoreGlobal >= -1.5).length;
    const verdaderosNegativos = poblacion.filter(n => n.perfil === 'tipico' && n.zScoreGlobal >= -1.5).length;
    const falsosPositivos = poblacion.filter(n => n.perfil === 'tipico' && n.zScoreGlobal < -1.5).length;
    
    const sensibilidad = verdaderosPositivos / (verdaderosPositivos + falsosNegativos) || 0;
    const especificidad = verdaderosNegativos / (verdaderosNegativos + falsosPositivos) || 0;
    const precision = verdaderosPositivos / (verdaderosPositivos + falsosPositivos) || 0;
    
    return {
      sensibilidad: (sensibilidad * 100).toFixed(2) + '%',
      especificidad: (especificidad * 100).toFixed(2) + '%',
      precision: (precision * 100).toFixed(2) + '%',
      verdaderosPositivos,
      falsosNegativos,
      verdaderosNegativos,
      falsosPositivos
    };
  };

  const generarRecomendaciones = (poblacion, params, puntoCiegos, correlaciones) => {
    const recomendaciones = [];
    
    // Recomendación sobre puntos ciegos
    if (puntoCiegos.length > 0) {
      recomendaciones.push({
        tipo: 'warning',
        titulo: 'Puntos Ciegos Detectados',
        mensaje: `Se detectaron ${puntoCiegos.length} rangos de edad con baja cobertura. Considere aumentar el muestreo en estos rangos.`
      });
    }
    
    // Recomendación sobre correlaciones
    const correlacionesAltas = Object.values(correlaciones).filter(c => parseFloat(c) > 0.9).length;
    if (correlacionesAltas > 3) {
      recomendaciones.push({
        tipo: 'info',
        titulo: 'Alta Correlación Entre Dominios',
        mensaje: 'Múltiples dominios muestran correlaciones muy altas (>0.9), lo que podría indicar redundancia en la evaluación.'
      });
    }
    
    // Recomendación sobre variabilidad
    if (params.variabilidadIntraIndividual === 'alta') {
      recomendaciones.push({
        tipo: 'info',
        titulo: 'Alta Variabilidad Intra-Individual',
        mensaje: 'La alta variabilidad entre dominios puede dificultar la detección de patrones específicos. Considere análisis por dominio individual.'
      });
    }
    
    // Recomendación sobre tamaño de muestra
    if (params.tamañoPoblacion < 50) {
      recomendaciones.push({
        tipo: 'warning',
        titulo: 'Tamaño de Muestra Pequeño',
        mensaje: 'Un tamaño de muestra menor a 50 puede no tener suficiente poder estadístico. Considere aumentar el tamaño de la población.'
      });
    }
    
    return recomendaciones;
  };

  const exportarDatos = () => {
    if (!datosGenerados) return;
    
    const dataStr = JSON.stringify({
      datos: datosGenerados,
      analisis: analisisGenerado
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investigacion_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="investigacion-container">
      <div className="investigacion-header">
        <h2>🔬 Módulo de Investigación</h2>
        <p className="investigacion-descripcion">
          Genere conjuntos de datos experimentales para evaluar propiedades psicométricas de las escalas de desarrollo,
          identificar puntos ciegos del sistema y analizar errores sistemáticos.
        </p>
      </div>

      {/* Fundamento Teórico */}
      <div className="fundamento-teorico-seccion">
        <h3>📚 Fundamento Teórico: Limitaciones del Cociente de Desarrollo y Heterocedasticidad</h3>
        
        <div className="teoria-card">
          <h4>⚠️ Problema 1: Limitaciones del Cociente de Desarrollo (CD) Aislado</h4>
          <p className="teoria-texto">
            El <strong>Cociente de Desarrollo</strong> se define como <code>CD = (Edad de Desarrollo / Edad Cronológica) × 100</code>. 
            Aunque es una métrica útil, su uso aislado presenta problemas metodológicos importantes:
          </p>
          
          <div className="problema-detalle">
            <h5>🔴 Problema del Análisis Transversal Único</h5>
            <ul>
              <li><strong>Una evaluación única proporciona solo una instantánea</strong>, no revela la trayectoria del desarrollo</li>
              <li>Un CD de 70% puede representar situaciones muy diferentes:
                <ul>
                  <li>Retraso estable con velocidad normal (trayectoria paralela)</li>
                  <li>Desaceleración progresiva (trayectoria divergente)</li>
                  <li>Recuperación tras intervención (trayectoria convergente)</li>
                </ul>
              </li>
              <li><strong>Solo mediciones repetidas revelan la trayectoria</strong> y permiten distinguir estos patrones</li>
            </ul>
            <p className="referencia-cita">
              <em>"A single assessment provides a snapshot, but only repeated measurements reveal the trajectory"</em> 
              <br/>— Thomas et al. (2009), J Speech Lang Hear Res, 52(2):336-58
            </p>
          </div>

          <div className="problema-detalle">
            <h5>🔴 Problema del CD Acumulativo</h5>
            <ul>
              <li>Cuando el CD se calcula promediando <strong>todos los hitos conseguidos hasta ese momento</strong>, 
                  cada nuevo hito influye retroactivamente en puntos anteriores</li>
              <li>Esto produce:
                <ul>
                  <li>Inercia artificial en la trayectoria</li>
                  <li>Subestimación de cambios recientes</li>
                  <li>Dificultad para detectar aceleraciones o desaceleraciones</li>
                </ul>
              </li>
              <li><strong>Solución</strong>: Usar ventanas deslizantes o ponderación temporal que den más peso a hitos recientes</li>
            </ul>
          </div>

          <div className="problema-detalle">
            <h5>🔴 Problema de Comparabilidad entre Edades</h5>
            <ul>
              <li>Un CD del 80% a los 6 meses (diferencia de 1.2 meses) <strong>no es equivalente</strong> a un CD del 80% a los 24 meses (diferencia de 4.8 meses)</li>
              <li>El impacto funcional y clínico es muy diferente</li>
              <li><strong>Solución</strong>: Usar Z-scores que incorporan tanto la media como la varianza esperada para cada edad</li>
            </ul>
          </div>
        </div>

        <div className="teoria-card">
          <h4>⚠️ Problema 2: Heterocedasticidad en el Desarrollo Infantil</h4>
          <p className="teoria-texto">
            La <strong>heterocedasticidad</strong> se refiere al fenómeno donde <strong>la variabilidad (desviación estándar) 
            cambia sistemáticamente con la edad</strong>. Este es un problema fundamental en la evaluación del desarrollo infantil.
          </p>
          
          <div className="problema-detalle">
            <h5>🔴 El Problema de Usar Solo Medias (Sices, 2007)</h5>
            <ul>
              <li><strong>Usar la edad media como punto de corte patologiza al 50% de niños normales</strong></li>
              <li>La desviación estándar es tan importante como la media, pero a menudo se ignora</li>
              <li>Ejemplo: Caminar independientemente
                <ul>
                  <li>Media: 12 meses</li>
                  <li>Rango normal (±2 DE): 9-15 meses</li>
                  <li>Si solo usamos la media, un niño de 14 meses se consideraría "retrasado"</li>
                </ul>
              </li>
            </ul>
            <p className="referencia-cita">
              <em>"Use of Developmental Milestones in Pediatric Residency Training and Practice: Time to Rethink the Meaning of the Mean"</em>
              <br/>— Sices L. (2007), J Dev Behav Pediatr, 28(1):47-52
            </p>
          </div>

          <div className="problema-detalle">
            <h5>🔴 La Varianza Aumenta con la Edad</h5>
            <ul>
              <li><strong>A mayor edad, mayor variabilidad inter-individual</strong></li>
              <li>A los 2 meses: DE ≈ 0.5 meses (variabilidad baja)</li>
              <li>A los 24 meses: DE ≈ 3-4 meses (variabilidad alta)</li>
              <li>Esto implica que:
                <ul>
                  <li>Los umbrales fijos en meses no son apropiados</li>
                  <li>Se necesitan umbrales proporcionales a la edad</li>
                  <li>Los Z-scores son más apropiados que diferencias absolutas</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="problema-detalle">
            <h5>✅ Solución: Sistema de Ventanas de Logro</h5>
            <p>Sices (2007) propone usar <strong>ventanas de logro</strong> en lugar de edades fijas:</p>
            <div className="semaforo-ejemplo">
              <div className="semaforo-item verde">
                <strong>🟢 Verde (Normal)</strong>: Percentil 25-75
                <br/><small>50% de niños típicos están aquí</small>
              </div>
              <div className="semaforo-item amarillo">
                <strong>🟡 Amarillo (Vigilancia)</strong>: Percentil 5-25 o 75-95
                <br/><small>Seguimiento cercano, puede ser variabilidad normal</small>
              </div>
              <div className="semaforo-item rojo">
                <strong>🔴 Rojo (Evaluación)</strong>: {'<'}P5 o {'>'}P95
                <br/><small>Fuera del rango de variabilidad típica, requiere evaluación</small>
              </div>
            </div>
            <p><strong>Beneficios</strong>:</p>
            <ul>
              <li>Reduce falsos positivos (ansiedad innecesaria en padres y clínicos)</li>
              <li>Mejora la especificidad del screening</li>
              <li>Reconoce la normalidad de la variabilidad</li>
              <li>Respeta la heterocedasticidad inherente al desarrollo</li>
            </ul>
          </div>
        </div>

        <div className="teoria-card">
          <h4>💡 Implicaciones para Este Módulo de Investigación</h4>
          <p className="teoria-texto">
            Este módulo permite <strong>simular poblaciones</strong> con diferentes características para:
          </p>
          <ul>
            <li>✅ <strong>Evaluar sensibilidad y especificidad</strong> de diferentes umbrales de detección</li>
            <li>✅ <strong>Identificar puntos ciegos</strong>: rangos de edad con cobertura insuficiente de hitos</li>
            <li>✅ <strong>Analizar efectos de la heterocedasticidad</strong>: comparar CD vs Z-scores en diferentes edades</li>
            <li>✅ <strong>Detectar sesgos sistemáticos</strong>: problemas con CD acumulativo vs ventanas deslizantes</li>
            <li>✅ <strong>Validar propiedades psicométricas</strong>: consistencia interna, fiabilidad test-retest</li>
          </ul>
          <p className="teoria-importante">
            <strong>⚠️ Importante</strong>: Los resultados de este módulo son simulaciones para fines de investigación y educación. 
            Cualquier decisión clínica debe basarse en evaluaciones reales por profesionales cualificados.
          </p>
        </div>
      </div>

      <div className="parametros-seccion">
        <h3>Parámetros de Generación</h3>
        
        <div className="parametros-grid">
          <div className="parametro-grupo">
            <label htmlFor="tamañoPoblacion">Tamaño de Población:</label>
            <input
              type="number"
              id="tamañoPoblacion"
              min="10"
              max="1000"
              value={parametros.tamañoPoblacion}
              onChange={(e) => handleParametroChange('tamañoPoblacion', parseInt(e.target.value))}
            />
            <small>Número de niños a simular (10-1000)</small>
          </div>

          <div className="parametro-grupo">
            <label htmlFor="rangoEdadMin">Edad Mínima (meses):</label>
            <input
              type="number"
              id="rangoEdadMin"
              min="0"
              max="60"
              value={parametros.rangoEdadMin}
              onChange={(e) => handleParametroChange('rangoEdadMin', parseInt(e.target.value))}
            />
          </div>

          <div className="parametro-grupo">
            <label htmlFor="rangoEdadMax">Edad Máxima (meses):</label>
            <input
              type="number"
              id="rangoEdadMax"
              min="0"
              max="60"
              value={parametros.rangoEdadMax}
              onChange={(e) => handleParametroChange('rangoEdadMax', parseInt(e.target.value))}
            />
          </div>

          <div className="parametro-grupo">
            <label htmlFor="porcentajeRetraso">% Niños con Retraso:</label>
            <input
              type="number"
              id="porcentajeRetraso"
              min="0"
              max="100"
              value={parametros.porcentajeRetraso}
              onChange={(e) => handleParametroChange('porcentajeRetraso', parseInt(e.target.value))}
            />
            <small>Porcentaje de niños con retraso del desarrollo</small>
          </div>

          <div className="parametro-grupo">
            <label htmlFor="porcentajeAtipico">% Desarrollo Atípico:</label>
            <input
              type="number"
              id="porcentajeAtipico"
              min="0"
              max="100"
              value={parametros.porcentajeAtipico}
              onChange={(e) => handleParametroChange('porcentajeAtipico', parseInt(e.target.value))}
            />
            <small>Porcentaje con desarrollo atípico severo</small>
          </div>

          <div className="parametro-grupo">
            <label htmlFor="variabilidadIntraIndividual">Variabilidad Intra-Individual:</label>
            <select
              id="variabilidadIntraIndividual"
              value={parametros.variabilidadIntraIndividual}
              onChange={(e) => handleParametroChange('variabilidadIntraIndividual', e.target.value)}
            >
              <option value="baja">Baja (±1 mes)</option>
              <option value="media">Media (±3 meses)</option>
              <option value="alta">Alta (±6 meses)</option>
            </select>
            <small>Variación entre dominios dentro de cada niño</small>
          </div>

          <div className="parametro-grupo">
            <label htmlFor="correlacionDominios">Correlación entre Dominios:</label>
            <input
              type="number"
              id="correlacionDominios"
              min="0"
              max="1"
              step="0.1"
              value={parametros.correlacionDominios}
              onChange={(e) => handleParametroChange('correlacionDominios', parseFloat(e.target.value))}
            />
            <small>Nivel de correlación esperado (0-1)</small>
          </div>

          <div className="parametro-grupo checkbox-grupo">
            <label>
              <input
                type="checkbox"
                checked={parametros.incluirRegresiones}
                onChange={(e) => handleParametroChange('incluirRegresiones', e.target.checked)}
              />
              Incluir casos de regresión
            </label>
          </div>

          <div className="parametro-grupo checkbox-grupo">
            <label>
              <input
                type="checkbox"
                checked={parametros.incluirEstancamientos}
                onChange={(e) => handleParametroChange('incluirEstancamientos', e.target.checked)}
              />
              Incluir casos de estancamiento
            </label>
          </div>

          <div className="parametro-grupo checkbox-grupo">
            <label>
              <input
                type="checkbox"
                checked={parametros.semillasAleatorias}
                onChange={(e) => handleParametroChange('semillasAleatorias', e.target.checked)}
              />
              Usar semillas aleatorias (reproducibilidad)
            </label>
          </div>
        </div>

        <div className="acciones-parametros">
          <button 
            className="btn-generar"
            onClick={generarDatosExperimentales}
            disabled={cargando}
          >
            {cargando ? '⏳ Generando...' : '🚀 Generar Datos Experimentales'}
          </button>
        </div>
      </div>

      {analisisGenerado && (
        <div className="resultados-seccion">
          <h3>Resultados del Análisis</h3>

          {/* Estadísticas Descriptivas */}
          <div className="analisis-card">
            <h4>📊 Estadísticas Descriptivas</h4>
            <div className="estadisticas-grid">
              <div className="estadistica-item">
                <span className="label">Tamaño de Muestra:</span>
                <span className="valor">{analisisGenerado.estadisticasDescriptivas.tamañoMuestra}</span>
              </div>
              <div className="estadistica-item">
                <span className="label">Edad Media:</span>
                <span className="valor">{analisisGenerado.estadisticasDescriptivas.edadMedia} meses (DE: {analisisGenerado.estadisticasDescriptivas.edadDE})</span>
              </div>
              <div className="estadistica-item">
                <span className="label">Factor Desarrollo Medio:</span>
                <span className="valor">{analisisGenerado.estadisticasDescriptivas.factorDesarrolloMedio} (DE: {analisisGenerado.estadisticasDescriptivas.factorDesarrolloDE})</span>
              </div>
              <div className="estadistica-item">
                <span className="label">Z-Score Medio:</span>
                <span className="valor">{analisisGenerado.estadisticasDescriptivas.zScoreMedio} (DE: {analisisGenerado.estadisticasDescriptivas.zScoreDE})</span>
              </div>
            </div>
          </div>

          {/* Distribución de Perfiles */}
          <div className="analisis-card">
            <h4>👥 Distribución de Perfiles</h4>
            <div className="perfiles-grid">
              <div className="perfil-item" style={{ backgroundColor: '#e8f5e9' }}>
                <span className="perfil-label">Típico:</span>
                <span className="perfil-valor">{analisisGenerado.distribucionPerfiles.tipico} ({((analisisGenerado.distribucionPerfiles.tipico / parametros.tamañoPoblacion) * 100).toFixed(1)}%)</span>
              </div>
              <div className="perfil-item" style={{ backgroundColor: '#fff3e0' }}>
                <span className="perfil-label">Retraso:</span>
                <span className="perfil-valor">{analisisGenerado.distribucionPerfiles.retraso} ({((analisisGenerado.distribucionPerfiles.retraso / parametros.tamañoPoblacion) * 100).toFixed(1)}%)</span>
              </div>
              <div className="perfil-item" style={{ backgroundColor: '#fce4ec' }}>
                <span className="perfil-label">Atípico:</span>
                <span className="perfil-valor">{analisisGenerado.distribucionPerfiles.atipico} ({((analisisGenerado.distribucionPerfiles.atipico / parametros.tamañoPoblacion) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Sensibilidad y Especificidad */}
          <div className="analisis-card">
            <h4>🎯 Sensibilidad y Especificidad</h4>
            <div className="sensibilidad-grid">
              <div className="sens-item">
                <span className="label">Sensibilidad:</span>
                <span className="valor">{analisisGenerado.sensibilidadEspecificidad.sensibilidad}</span>
                <small>Capacidad de detectar casos verdaderos</small>
              </div>
              <div className="sens-item">
                <span className="label">Especificidad:</span>
                <span className="valor">{analisisGenerado.sensibilidadEspecificidad.especificidad}</span>
                <small>Capacidad de descartar casos falsos</small>
              </div>
              <div className="sens-item">
                <span className="label">Precisión:</span>
                <span className="valor">{analisisGenerado.sensibilidadEspecificidad.precision}</span>
                <small>Proporción de verdaderos positivos</small>
              </div>
            </div>
            <div className="matriz-confusion">
              <h5>Matriz de Confusión</h5>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Predicho Positivo</th>
                    <th>Predicho Negativo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Real Positivo</strong></td>
                    <td className="vp">{analisisGenerado.sensibilidadEspecificidad.verdaderosPositivos}</td>
                    <td className="fn">{analisisGenerado.sensibilidadEspecificidad.falsosNegativos}</td>
                  </tr>
                  <tr>
                    <td><strong>Real Negativo</strong></td>
                    <td className="fp">{analisisGenerado.sensibilidadEspecificidad.falsosPositivos}</td>
                    <td className="vn">{analisisGenerado.sensibilidadEspecificidad.verdaderosNegativos}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Puntos Ciegos */}
          {analisisGenerado.puntosCiegos.length > 0 && (
            <div className="analisis-card warning">
              <h4>⚠️ Puntos Ciegos Detectados</h4>
              <p>Los siguientes rangos de edad tienen baja cobertura en la muestra:</p>
              <ul className="puntos-ciegos-lista">
                {analisisGenerado.puntosCiegos.map((punto, index) => (
                  <li key={index} className={punto.severidad === 'Crítico' ? 'critico' : 'moderado'}>
                    <strong>{punto.rangoEdad}</strong>: {punto.muestras} muestras 
                    <span className="badge">{punto.severidad}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Correlaciones entre Dominios */}
          <div className="analisis-card">
            <h4>🔗 Correlaciones entre Dominios</h4>
            <div className="correlaciones-grid">
              {Object.entries(analisisGenerado.correlacionesDominios).map(([pares, corr]) => {
                const [dom1, dom2] = pares.split('_');
                const corrValue = parseFloat(corr);
                const nivel = corrValue > 0.8 ? 'alta' : corrValue > 0.5 ? 'media' : 'baja';
                return (
                  <div key={pares} className={`correlacion-item ${nivel}`}>
                    <span className="label">{dom1.replace('_', ' ')} ↔ {dom2.replace('_', ' ')}</span>
                    <span className="valor">r = {corr}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendaciones */}
          {analisisGenerado.recomendaciones.length > 0 && (
            <div className="analisis-card recomendaciones">
              <h4>💡 Recomendaciones</h4>
              <ul className="recomendaciones-lista">
                {analisisGenerado.recomendaciones.map((rec, index) => (
                  <li key={index} className={`recomendacion-item ${rec.tipo}`}>
                    <strong>{rec.titulo}:</strong> {rec.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón de Exportación */}
          <div className="acciones-resultados">
            <button className="btn-exportar" onClick={exportarDatos}>
              💾 Exportar Datos y Análisis (JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Investigacion;
