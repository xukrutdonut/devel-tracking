import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import GraficoDesarrollo from './GraficoDesarrollo';

function EjemplosClinicos() {
  const [ejemplos, setEjemplos] = useState([]);
  const [ejemploSeleccionado, setEjemploSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Definición de perfiles clínicos de ejemplo
  const perfilesEjemplo = [
    {
      id: 'desarrollo-tipico',
      nombre: 'Desarrollo Típico',
      descripcion: 'Niño con desarrollo normotípico, alcanza todos los hitos en edades esperadas',
      icono: '😊',
      color: '#28a745',
      ninoData: {
        nombre: 'María Ejemplo - Desarrollo Típico',
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      },
      perfil: 'tipico',
      cd: 0 // Coeficiente de desarrollo normal
    },
    {
      id: 'retraso-global-moderado',
      nombre: 'Retraso Global Moderado',
      descripcion: 'Retraso del desarrollo en todos los dominios con CD 50 (alcanza hitos al 50% de la edad esperada)',
      icono: '🔵',
      color: '#ffc107',
      ninoData: {
        nombre: 'Juan Ejemplo - Retraso Global CD50',
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      },
      perfil: 'retraso-global',
      cd: 50 // 50% de retraso en todos los dominios
    },
    {
      id: 'retraso-motor-grueso',
      nombre: 'Retraso Motor Grueso',
      descripcion: 'Desarrollo típico excepto en motricidad gruesa, sugiere hipotonía o problema motor específico',
      icono: '🏃',
      color: '#17a2b8',
      ninoData: {
        nombre: 'Carlos Ejemplo - Retraso Motor',
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      },
      perfil: 'retraso-motor',
      dominioAfectado: 1 // ID del dominio motor grueso
    },
    {
      id: 'retraso-lenguaje',
      nombre: 'Retraso del Lenguaje',
      descripcion: 'Desarrollo típico excepto en comunicación/lenguaje, sugiere trastorno específico del lenguaje',
      icono: '💬',
      color: '#dc3545',
      ninoData: {
        nombre: 'Laura Ejemplo - Retraso Lenguaje',
        fecha_nacimiento: calcularFechaNacimiento(24), // 24 meses
        semanas_gestacion: 40
      },
      perfil: 'retraso-lenguaje',
      dominioAfectado: 3 // ID del dominio de comunicación
    },
    {
      id: 'tea',
      nombre: 'Trastorno del Espectro Autista',
      descripcion: 'Perfil compatible con TEA: afectación del área social-emocional con desarrollo típico o adelantado en otras áreas',
      icono: '🧩',
      color: '#6f42c1',
      ninoData: {
        nombre: 'Pedro Ejemplo - Perfil TEA',
        fecha_nacimiento: calcularFechaNacimiento(36), // 36 meses
        semanas_gestacion: 40
      },
      perfil: 'tea',
      dominioAfectado: 5 // ID del dominio Social-Emocional
    },
    {
      id: 'regresion',
      nombre: 'Regresión del Desarrollo',
      descripcion: 'Inversión de velocidad: desarrollo normal hasta 18m, luego velocidad muy reducida (hitos se consiguen con gran retraso)',
      icono: '📉',
      color: '#e91e63',
      ninoData: {
        nombre: 'Ana Ejemplo - Regresión Desarrollo',
        fecha_nacimiento: calcularFechaNacimiento(30), // 30 meses
        semanas_gestacion: 40
      },
      perfil: 'regresion',
      edadRegresion: 18 // Edad en meses donde inicia la regresión
    },
    {
      id: 'estancamiento',
      nombre: 'Estancamiento/Meseta',
      descripcion: 'Velocidad drásticamente reducida: desarrollo normal hasta 12m, luego progreso mínimo (hitos muy espaciados)',
      icono: '📊',
      color: '#ff9800',
      ninoData: {
        nombre: 'Luis Ejemplo - Estancamiento',
        fecha_nacimiento: calcularFechaNacimiento(30), // 30 meses
        semanas_gestacion: 40
      },
      perfil: 'estancamiento',
      edadEstancamiento: 12 // Edad en meses donde se detiene el desarrollo
    },
    {
      id: 'aceleracion-intervencion',
      nombre: 'Aceleración por Intervención',
      descripcion: 'Retraso inicial seguido de aceleración del desarrollo tras inicio de atención temprana a los 18 meses',
      icono: '📈',
      color: '#4caf50',
      ninoData: {
        nombre: 'Sofia Ejemplo - Respuesta a Intervención',
        fecha_nacimiento: calcularFechaNacimiento(30), // 30 meses
        semanas_gestacion: 40
      },
      perfil: 'aceleracion',
      edadIntervencion: 18, // Edad en meses donde inicia la intervención
      retrasoInicial: 0.65 // Retraso del 35% antes de la intervención
    }
  ];

  const crearEjemplo = async (perfil) => {
    setCargando(true);
    setMensaje(`Creando ejemplo: ${perfil.nombre}...`);

    try {
      // 1. Crear el niño
      const ninoResponse = await fetch(`${API_URL}/ninos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfil.ninoData)
      });
      const nino = await ninoResponse.json();

      // 2. Obtener hitos normativos
      const hitosResponse = await fetch(`${API_URL}/hitos-normativos?fuente=1`);
      const hitosNormativos = await hitosResponse.json();

      // 3. Generar hitos según el perfil
      const hitosAGenerar = generarHitosPorPerfil(hitosNormativos, perfil, nino);

      // 4. Registrar hitos
      for (const hito of hitosAGenerar) {
        await fetch(`${API_URL}/hitos-conseguidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nino_id: nino.id,
            hito_id: hito.hito_id,
            edad_conseguido_meses: hito.edad_conseguido,
            fecha_registro: new Date().toISOString().split('T')[0]
          })
        });
      }

      setMensaje(`✅ Ejemplo creado: ${perfil.nombre}`);
      cargarEjemplos();
      
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

    // Filtrar hitos hasta la edad actual
    const hitosRelevantes = hitosNormativos.filter(h => h.edad_media_meses <= edadActualMeses);

    switch (perfil.perfil) {
      case 'tipico':
        // Desarrollo típico: hitos en edad esperada ± variabilidad normal
        hitosRelevantes.forEach(hito => {
          const variabilidad = (Math.random() - 0.5) * hito.desviacion_estandar;
          hitosGenerados.push({
            hito_id: hito.id,
            edad_conseguido: Math.max(0, hito.edad_media_meses + variabilidad)
          });
        });
        break;

      case 'retraso-global':
        // Retraso global: todos los hitos al CD especificado
        hitosRelevantes.forEach(hito => {
          const factorRetraso = perfil.cd / 100;
          const edadConseguido = hito.edad_media_meses / factorRetraso;
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: edadConseguido
            });
          }
        });
        break;

      case 'retraso-motor':
        // Retraso motor: solo dominio motor afectado
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          if (hito.dominio_id === perfil.dominioAfectado) {
            // Dominio afectado: retraso del 50%
            edadConseguido = hito.edad_media_meses * 1.5;
          } else {
            // Otros dominios: desarrollo típico
            const variabilidad = (Math.random() - 0.5) * hito.desviacion_estandar;
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
            // Dominio comunicación afectado: retraso del 60%
            edadConseguido = hito.edad_media_meses * 1.6;
          } else {
            // Otros dominios: desarrollo típico
            const variabilidad = (Math.random() - 0.5) * hito.desviacion_estandar;
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
            // Dominio social-emocional afectado: retraso significativo del 70%
            edadConseguido = hito.edad_media_meses * 1.7;
          } else {
            // Otros dominios: desarrollo típico o incluso ligeramente adelantado
            const variabilidad = (Math.random() - 0.7) * hito.desviacion_estandar;
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
        // Regresión: inversión de tendencia de velocidad
        // Antes de regresión: desarrollo normal
        // Después de regresión: velocidad muy lenta (hitos se consiguen muy tarde)
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          const edadRegresion = perfil.edadRegresion;
          
          if (hito.edad_media_meses < edadRegresion) {
            // Hitos anteriores a la regresión: conseguidos normalmente
            const variabilidad = (Math.random() - 0.5) * hito.desviacion_estandar;
            edadConseguido = hito.edad_media_meses + variabilidad;
          } else {
            // Hitos posteriores a la regresión: velocidad muy reducida
            // Se consiguen pero con gran retraso (inversión de tendencia)
            const retrasoPostRegresion = (hito.edad_media_meses - edadRegresion) * 2.5;
            edadConseguido = edadRegresion + retrasoPostRegresion;
          }
          
          if (edadConseguido <= edadActualMeses) {
            hitosGenerados.push({
              hito_id: hito.id,
              edad_conseguido: Math.max(0, edadConseguido)
            });
          }
        });
        break;

      case 'estancamiento':
        // Estancamiento/Meseta: velocidad se reduce drásticamente (pero sigue habiendo progreso mínimo)
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          const edadEstancamiento = perfil.edadEstancamiento;
          
          if (hito.edad_media_meses <= edadEstancamiento) {
            // Hitos hasta el estancamiento: desarrollo normal
            const variabilidad = (Math.random() - 0.5) * hito.desviacion_estandar;
            edadConseguido = hito.edad_media_meses + variabilidad;
          } else {
            // Hitos posteriores al estancamiento: velocidad muy muy lenta (meseta)
            // Se consiguen pero con enorme retraso
            const tiempoPostEstancamiento = (hito.edad_media_meses - edadEstancamiento) * 3;
            edadConseguido = edadEstancamiento + tiempoPostEstancamiento;
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
        // Aceleración por intervención: retraso inicial, luego aceleración tras intervención
        hitosRelevantes.forEach(hito => {
          let edadConseguido;
          const edadIntervencion = perfil.edadIntervencion;
          const factorRetrasoInicial = perfil.retrasoInicial;
          
          if (hito.edad_media_meses < edadIntervencion) {
            // Antes de la intervención: retraso del 35% (CD 65)
            edadConseguido = hito.edad_media_meses / factorRetrasoInicial;
          } else {
            // Después de la intervención: aceleración progresiva
            // Calcula cuánto tiempo después de la intervención debería conseguirse
            const tiempoDesdeIntervencion = hito.edad_media_meses - edadIntervencion;
            
            // Aceleración gradual: empieza con retraso pero va mejorando
            // Factor de aceleración mejora con el tiempo
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

      default:
        break;
    }

    return hitosGenerados;
  };

  const cargarEjemplos = async () => {
    try {
      const response = await fetch(`${API_URL}/ninos`);
      const todosLosNinos = await response.json();
      
      // Filtrar solo los ejemplos (nombres que contienen "Ejemplo")
      const ejemplosFiltrados = todosLosNinos.filter(n => n.nombre.includes('Ejemplo'));
      setEjemplos(ejemplosFiltrados);
    } catch (error) {
      console.error('Error al cargar ejemplos:', error);
    }
  };

  const eliminarEjemplo = async (ninoId) => {
    if (!confirm('¿Eliminar este caso de ejemplo?')) return;

    try {
      await fetch(`${API_URL}/ninos/${ninoId}`, {
        method: 'DELETE'
      });
      setMensaje('✅ Ejemplo eliminado');
      cargarEjemplos();
      if (ejemploSeleccionado === ninoId) {
        setEjemploSeleccionado(null);
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
        await fetch(`${API_URL}/ninos/${ejemplo.id}`, {
          method: 'DELETE'
        });
      }
      setMensaje('✅ Todos los ejemplos eliminados');
      setEjemplos([]);
      setEjemploSeleccionado(null);
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
        <h2>📚 Ejemplos Clínicos de Perfiles de Desarrollo</h2>
        
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          borderLeft: '4px solid #2196F3'
        }}>
          <p style={{ margin: 0, fontSize: '0.95em' }}>
            <strong>ℹ️ Acerca de estos ejemplos:</strong> Esta sección contiene casos clínicos simulados que representan 
            diferentes perfiles de desarrollo infantil. Cada ejemplo muestra cómo se visualizan diferentes patrones 
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
