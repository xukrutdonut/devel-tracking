import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { fetchConAuth } from '../utils/authService';
import GraficoDesarrollo from './GraficoDesarrollo';

function EjemplosClinicos({ onEjemploCreado }) {
  const [ejemplos, setEjemplos] = useState([]);
  const [ejemploSeleccionado, setEjemploSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Nombres aleatorios para generar ejemplos variados
  const nombresAleatorios = [
    'Sofía', 'Mateo', 'Isabella', 'Sebastián', 'Valentina', 'Santiago', 'Camila', 'Nicolás',
    'Emma', 'Diego', 'Lucía', 'Miguel', 'María', 'Daniel', 'Victoria', 'Andrés',
    'Martina', 'Gabriel', 'Julieta', 'David', 'Paula', 'Lucas', 'Carolina', 'Alejandro'
  ];

  // Función para generar nombre aleatorio
  const generarNombreAleatorio = (perfil) => {
    const nombre = nombresAleatorios[Math.floor(Math.random() * nombresAleatorios.length)];
    const id = Math.floor(Math.random() * 1000);
    return `${nombre} #${id} - ${perfil}`;
  };

  // Definición de perfiles clínicos de ejemplo
  const perfilesEjemplo = [
    {
      id: 'desarrollo-tipico',
      nombre: 'Desarrollo Típico',
      descripcion: 'Niño con desarrollo normotípico, alcanza todos los hitos en edades esperadas',
      icono: '😊',
      color: '#28a745',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Desarrollo Típico'),
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      }),
      perfil: 'tipico',
      cd: 0 // Coeficiente de desarrollo normal
    },
    {
      id: 'retraso-global-moderado',
      nombre: 'Retraso Global Moderado',
      descripcion: 'Retraso del desarrollo en todos los dominios con CD 50 (alcanza hitos al 50% de la edad esperada)',
      icono: '🔵',
      color: '#ffc107',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Retraso Global CD50'),
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      }),
      perfil: 'retraso-global',
      cd: 50 // 50% de retraso en todos los dominios
    },
    {
      id: 'retraso-motor-grueso',
      nombre: 'Retraso Motor Grueso',
      descripcion: 'Desarrollo típico excepto en motricidad gruesa, sugiere hipotonía o problema motor específico',
      icono: '🏃',
      color: '#17a2b8',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Retraso Motor'),
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      }),
      perfil: 'retraso-motor',
      dominioAfectado: 1 // ID del dominio motor grueso
    },
    {
      id: 'retraso-lenguaje',
      nombre: 'Retraso del Lenguaje',
      descripcion: 'Desarrollo típico excepto en comunicación/lenguaje, sugiere trastorno específico del lenguaje',
      icono: '💬',
      color: '#dc3545',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Retraso Lenguaje'),
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      }),
      perfil: 'retraso-lenguaje',
      dominioAfectado: 3 // ID del dominio de comunicación
    },
    {
      id: 'tea',
      nombre: 'Trastorno del Espectro Autista',
      descripcion: 'Perfil compatible con TEA: afectación del área social-emocional con desarrollo típico o adelantado en otras áreas',
      icono: '🧩',
      color: '#6f42c1',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Perfil TEA'),
        fecha_nacimiento: calcularFechaNacimiento(36), // 36 meses
        semanas_gestacion: 40
      }),
      perfil: 'tea',
      dominioAfectado: 5 // ID del dominio Social-Emocional
    },
    {
      id: 'regresion',
      nombre: 'Regresión del Desarrollo',
      descripcion: 'Desarrollo normal hasta 18m, luego PÉRDIDA de hitos en áreas vulnerables (lenguaje, social)',
      icono: '📉',
      color: '#e91e63',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Regresión Desarrollo'),
        fecha_nacimiento: calcularFechaNacimiento(30), // 30 meses
        semanas_gestacion: 40
      }),
      perfil: 'regresion',
      edadRegresion: 18 // Edad en meses donde inicia la regresión
    },
    {
      id: 'estancamiento',
      nombre: 'Estancamiento/Meseta',
      descripcion: 'Desarrollo normal hasta 12m, luego velocidad reducida a 15% (progreso casi detenido)',
      icono: '📊',
      color: '#ff9800',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Estancamiento'),
        fecha_nacimiento: calcularFechaNacimiento(30), // 30 meses
        semanas_gestacion: 40
      }),
      perfil: 'estancamiento',
      edadEstancamiento: 12 // Edad en meses donde se detiene el desarrollo
    },
    {
      id: 'aceleracion-intervencion',
      nombre: 'Aceleración por Intervención',
      descripcion: 'Retraso inicial seguido de aceleración del desarrollo tras inicio de atención temprana a los 18 meses',
      icono: '📈',
      color: '#4caf50',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Respuesta a Intervención'),
        fecha_nacimiento: calcularFechaNacimiento(30), // 30 meses
        semanas_gestacion: 40
      }),
      perfil: 'aceleracion',
      edadIntervencion: 18, // Edad en meses donde inicia la intervención
      retrasoInicial: 0.65 // Retraso del 35% antes de la intervención
    },
    {
      id: 'retraso-global-tea',
      nombre: 'Retraso Global + TEA',
      descripcion: 'Retraso global (CD 60) con afectación desproporcionada del área social-emocional (>2 DE del promedio)',
      icono: '🔵🧩',
      color: '#8b5cf6',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Retraso Global + TEA'),
        fecha_nacimiento: calcularFechaNacimiento(36), // 36 meses
        semanas_gestacion: 40
      }),
      perfil: 'retraso-global-especifico',
      cdBase: 60, // Retraso global del 40%
      dominioDesproporcionado: 5, // Social-Emocional
      factorDesproporcion: 0.5 // El dominio específico está al 50% del CD base (30% absoluto)
    },
    {
      id: 'retraso-global-lenguaje',
      nombre: 'Retraso Global + Lenguaje Severo',
      descripcion: 'Retraso global (CD 65) con afectación desproporcionada del lenguaje (>2 DE del promedio)',
      icono: '🔵💬',
      color: '#f59e0b',
      generarNinoData: () => ({
        nombre: generarNombreAleatorio('Retraso Global + Lenguaje'),
        fecha_nacimiento: calcularFechaNacimiento(30), // 30 meses
        semanas_gestacion: 40
      }),
      perfil: 'retraso-global-especifico',
      cdBase: 65, // Retraso global del 35%
      dominioDesproporcionado: 3, // Comunicación/Lenguaje
      factorDesproporcion: 0.55 // El dominio específico está al 55% del CD base (35.75% absoluto)
    }
  ];

  const crearEjemplo = async (perfil) => {
    setCargando(true);
    setMensaje(`Creando ejemplo: ${perfil.nombre}...`);

    try {
      // 1. Crear el niño con datos aleatorios
      const ninoData = perfil.generarNinoData();
      const ninoResponse = await fetchConAuth(`${API_URL}/ninos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ninoData)
      });
      const nino = await ninoResponse.json();

      // 2. Obtener hitos normativos
      const hitosResponse = await fetchConAuth(`${API_URL}/hitos-normativos?fuente=1`);
      const hitosNormativos = await hitosResponse.json();

      // 3. Generar hitos según el perfil (con semilla aleatoria basada en el ID del niño)
      const hitosAGenerar = generarHitosPorPerfil(hitosNormativos, perfil, nino);

      // 4. Registrar hitos
      for (const hito of hitosAGenerar) {
        const hitoData = {
          nino_id: nino.id,
          hito_id: hito.hito_id,
          edad_conseguido_meses: hito.edad_conseguido,
          fecha_registro: new Date().toISOString().split('T')[0]
        };
        
        // Si el hito tiene información de pérdida (regresión)
        if (hito.edad_perdido !== undefined && hito.edad_perdido !== null) {
          hitoData.edad_perdido_meses = hito.edad_perdido;
          hitoData.fecha_perdido = new Date().toISOString().split('T')[0];
        }
        
        await fetchConAuth(`${API_URL}/hitos-conseguidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hitoData)
        });
      }

      setMensaje(`✅ Ejemplo creado: ${ninoData.nombre}`);
      cargarEjemplos();
      
      // Notificar al componente padre para recargar la lista principal
      if (onEjemploCreado) {
        onEjemploCreado();
      }
      
      setTimeout(() => {
        setEjemploSeleccionado(nino.id);
        setMensaje('');
      }, 1500);

    } catch (error) {
      console.error('Error al crear ejemplo:', error);
      setMensaje(`❌ Error al crear ejemplo: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const generarHitosPorPerfil = (hitosNormativos, perfil, nino) => {
    const hitosGenerados = [];
    const edadActualMeses = calcularEdadMeses(nino.fecha_nacimiento);

    // Generador de números pseudoaleatorios seeded para reproducibilidad
    // Usar el ID del niño como semilla para que cada niño tenga variabilidad consistente
    let seed = nino.id || Math.floor(Math.random() * 10000);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Filtrar hitos hasta la edad actual
    const hitosRelevantes = hitosNormativos.filter(h => h.edad_media_meses <= edadActualMeses);

    switch (perfil.perfil) {
      case 'tipico':
        // Desarrollo típico: hitos en edad esperada ± variabilidad normal
        hitosRelevantes.forEach(hito => {
          const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 2; // Variabilidad completa
          hitosGenerados.push({
            hito_id: hito.id,
            edad_conseguido: Math.max(0, hito.edad_media_meses + variabilidad)
          });
        });
        break;

      case 'retraso-global':
        // Retraso global: todos los hitos al CD especificado con algo de variabilidad
        hitosRelevantes.forEach(hito => {
          const factorRetraso = perfil.cd / 100;
          const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 0.5; // Menor variabilidad
          const edadConseguido = (hito.edad_media_meses / factorRetraso) + variabilidad;
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      case 'retraso-motor':
        // Retraso motor: solo dominio motor afectado
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          if (hito.dominio_id === perfil.dominioAfectado) {
            // Dominio afectado: retraso del 50% + variabilidad
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar;
            edadConseguido = hito.edad_media_meses * 1.5 + variabilidad;
          } else {
            // Otros dominios: desarrollo típico
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 2;
            edadConseguido = hito.edad_media_meses + variabilidad;
          }
          
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      case 'retraso-lenguaje':
        // Retraso del lenguaje: solo comunicación afectada
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          if (hito.dominio_id === perfil.dominioAfectado) {
            // Dominio comunicación afectado: retraso del 60% + variabilidad
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar;
            edadConseguido = hito.edad_media_meses * 1.6 + variabilidad;
          } else {
            // Otros dominios: desarrollo típico
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 2;
            edadConseguido = hito.edad_media_meses + variabilidad;
          }
          
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      case 'tea':
        // TEA: afectación solo del dominio social-emocional
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          if (hito.dominio_id === perfil.dominioAfectado) {
            // Dominio social-emocional afectado: retraso significativo del 70% + variabilidad
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar;
            edadConseguido = hito.edad_media_meses * 1.7 + variabilidad;
          } else {
            // Otros dominios: desarrollo típico o incluso ligeramente adelantado
            const variabilidad = (random() - 0.7) * hito.desviacion_estandar * 2;
            edadConseguido = hito.edad_media_meses + variabilidad;
          }
          
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      case 'regresion':
        // Regresión: desarrollo normal hasta punto de regresión, luego PÉRDIDA de hitos
        const edadRegresion = perfil.edadRegresion;
        
        hitosRelevantes.forEach(hito => {
          const variabilidad = (random() - 0.5) * hito.desviacion_estandar;
          const edadConseguido = hito.edad_media_meses + variabilidad;
          
          if (edadConseguido <= edadActualMeses) {
            const hitoData = {
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            };
            
            // Si el hito se consiguió antes de la regresión Y está en ciertos dominios vulnerables
            if (edadConseguido < edadRegresion && hito.edad_media_meses < edadRegresion) {
              // Dominios más afectados por regresión: Social-Emocional (5) y Lenguaje (3, 4)
              const dominiosVulnerables = [3, 4, 5];
              
              if (dominiosVulnerables.includes(hito.dominio_id)) {
                // Probabilidad aleatoria de perder el hito (60-90%)
                if (random() > 0.2) {
                  const variabilidadPerdida = random() * 4; // 0-4 meses después
                  hitoData.edad_perdido = edadRegresion + variabilidadPerdida;
                }
              }
            }
            
            hitosGenerados.push(hitoData);
          }
        });
        break;

      case 'estancamiento':
        // Estancamiento/Meseta: velocidad se reduce drásticamente
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          const edadEstancamiento = perfil.edadEstancamiento;
          
          if (hito.edad_media_meses <= edadEstancamiento) {
            // Hitos hasta el estancamiento: desarrollo normal
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar;
            edadConseguido = hito.edad_media_meses + variabilidad;
          } else {
            // Hitos posteriores: velocidad muy lenta (15%)
            const mesesDespuesEstancamiento = hito.edad_media_meses - edadEstancamiento;
            edadConseguido = edadEstancamiento + (mesesDespuesEstancamiento / 0.15);
          }
          
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      case 'aceleracion':
        // Aceleración por intervención
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          const edadIntervencion = perfil.edadIntervencion;
          const factorRetrasoInicial = perfil.retrasoInicial;
          
          if (hito.edad_media_meses < edadIntervencion) {
            // Antes de la intervención: retraso
            edadConseguido = hito.edad_media_meses / factorRetrasoInicial;
          } else {
            // Después de la intervención: aceleración progresiva
            const tiempoDesdeIntervencion = hito.edad_media_meses - edadIntervencion;
            const factorMejora = Math.min(0.95, factorRetrasoInicial + (tiempoDesdeIntervencion / 40));
            edadConseguido = edadIntervencion + (hito.edad_media_meses - edadIntervencion) / factorMejora;
          }
          
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      case 'retraso-global-especifico':
        // Retraso global con un dominio desproporcionadamente afectado
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          const cdBase = perfil.cdBase / 100;
          const dominioDesproporcionado = perfil.dominioDesproporcionado;
          const factorDesproporcion = perfil.factorDesproporcion;
          
          if (hito.dominio_id === dominioDesproporcionado) {
            // Dominio desproporcionadamente afectado
            const cdEfectivo = cdBase * factorDesproporcion;
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 0.3;
            edadConseguido = (hito.edad_media_meses / cdEfectivo) + variabilidad;
          } else {
            // Otros dominios: retraso global base
            const variabilidad = (random() - 0.5) * hito.desviacion_estandar * 0.5;
            edadConseguido = (hito.edad_media_meses / cdBase) + variabilidad;
          }
          
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      default:
        break;
    }

    return hitosGenerados;
  };

  const cargarEjemplos = async () => {
    try {
      const response = await fetchConAuth(`${API_URL}/ninos`);
      const todosLosNinos = await response.json();
      
      // Verificar que sea un array antes de filtrar
      if (Array.isArray(todosLosNinos)) {
        // Filtrar solo los ejemplos (nombres que contienen "Ejemplo")
        const ejemplosFiltrados = todosLosNinos.filter(n => n.nombre.includes('Ejemplo'));
        setEjemplos(ejemplosFiltrados);
      } else {
        // Si hay un error o no es array, usar array vacío
        setEjemplos([]);
      }
    } catch (error) {
      console.error('Error al cargar ejemplos:', error);
      setEjemplos([]);
    }
  };

  const eliminarEjemplo = async (ninoId) => {
    if (!confirm('¿Eliminar este caso de ejemplo?')) return;

    try {
      await fetchConAuth(`${API_URL}/ninos/${ninoId}`, {
        method: 'DELETE'
      });
      setMensaje('✅ Ejemplo eliminado');
      cargarEjemplos();
      if (ejemploSeleccionado === ninoId) {
        setEjemploSeleccionado(null);
      }
      
      // Notificar al componente padre
      if (onEjemploCreado) {
        onEjemploCreado();
      }
      
      setTimeout(() => setMensaje(''), 2000);
    } catch (error) {
      console.error('Error al eliminar ejemplo:', error);
      setMensaje('❌ Error al eliminar ejemplo');
    }
  };

  const eliminarTodosEjemplos = async () => {
    if (!confirm('¿Eliminar TODOS los casos de ejemplo? Esta acción no se puede deshacer.')) return;

    setCargando(true);
    setMensaje('Eliminando todos los ejemplos...');

    try {
      for (const ejemplo of ejemplos) {
        await fetchConAuth(`${API_URL}/ninos/${ejemplo.id}`, {
          method: 'DELETE'
        });
      }
      setMensaje('✅ Todos los ejemplos eliminados');
      setEjemplos([]);
      setEjemploSeleccionado(null);
      
      // Notificar al componente padre
      if (onEjemploCreado) {
        onEjemploCreado();
      }
      
      setTimeout(() => setMensaje(''), 2000);
    } catch (error) {
      console.error('Error al eliminar ejemplos:', error);
      setMensaje('❌ Error al eliminar ejemplos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEjemplos();
  }, []);

  return (
    <div className="ejemplos-clinicos" style={{ padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2>📚 Ejemplos Clínicos de Trayectorias de Desarrollo</h2>
        
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          borderLeft: '4px solid #2196F3'
        }}>
          <p style={{ margin: 0, fontSize: '0.95em' }}>
            <strong>ℹ️ Acerca de estos ejemplos:</strong> Esta sección contiene casos clínicos simulados que representan 
            diferentes trayectorias de desarrollo infantil. Cada ejemplo muestra cómo se visualizan diferentes patrones 
            de desarrollo en las gráficas del sistema.
          </p>
        </div>

        {mensaje && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '6px',
            backgroundColor: mensaje.includes('❌') ? '#f8d7da' : '#d4edda',
            color: mensaje.includes('❌') ? '#721c24' : '#155724',
            border: `1px solid ${mensaje.includes('❌') ? '#f5c6cb' : '#c3e6cb'}`
          }}>
            {mensaje}
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h3>Crear Nuevos Ejemplos</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            {perfilesEjemplo.map(perfil => (
              <div 
                key={perfil.id}
                style={{
                  border: `2px solid ${perfil.color}`,
                  borderRadius: '10px',
                  padding: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  opacity: cargando ? 0.6 : 1,
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!cargando) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ fontSize: '2em', marginBottom: '10px' }}>{perfil.icono}</div>
                <h4 style={{ margin: '0 0 8px 0', color: perfil.color }}>{perfil.nombre}</h4>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '12px', minHeight: '60px' }}>
                  {perfil.descripcion}
                </p>
                <button
                  onClick={() => crearEjemplo(perfil)}
                  disabled={cargando}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: perfil.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: cargando ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95em'
                  }}
                >
                  {cargando ? '⏳ Creando...' : '+ Crear Ejemplo'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {ejemplos.length > 0 && (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3>Ejemplos Creados ({ejemplos.length})</h3>
              <button
                onClick={eliminarTodosEjemplos}
                disabled={cargando}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  fontSize: '0.9em'
                }}
              >
                🗑️ Eliminar Todos
              </button>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px',
              marginBottom: '25px'
            }}>
              {ejemplos.map(ejemplo => (
                <div
                  key={ejemplo.id}
                  style={{
                    padding: '12px',
                    border: ejemploSeleccionado === ejemplo.id ? '2px solid #2196F3' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: ejemploSeleccionado === ejemplo.id ? '#e3f2fd' : 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => setEjemploSeleccionado(ejemplo.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{ejemplo.nombre}</strong>
                      <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                        Edad: {calcularEdadMeses(ejemplo.fecha_nacimiento)} meses
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarEjemplo(ejemplo.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85em'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {ejemploSeleccionado && (
              <div style={{ 
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '2px solid #2196F3'
              }}>
                <h3 style={{ marginTop: 0 }}>📈 Gráfica del Ejemplo Seleccionado</h3>
                <GraficoDesarrollo ninoId={ejemploSeleccionado} />
              </div>
            )}
          </>
        )}

        {ejemplos.length === 0 && !cargando && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            color: '#666'
          }}>
            <p style={{ fontSize: '1.1em', margin: 0 }}>
              No hay ejemplos creados. Haz clic en los botones de arriba para crear casos de ejemplo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Funciones helper
function calcularFechaNacimiento(mesesAtras) {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - mesesAtras);
  return fecha.toISOString().split('T')[0];
}

function calcularEdadMeses(fechaNacimiento) {
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  const diffTime = Math.abs(hoy - fechaNac);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.44);
}

export default EjemplosClinicos;
