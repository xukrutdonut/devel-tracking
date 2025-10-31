import React, { useState, useEffect } from 'react';
import './App.css';
import NinosList from './components/NinosList';
import NinoForm from './components/NinoForm';
import HitosRegistro from './components/HitosRegistro';
import GraficoDesarrollo from './components/GraficoDesarrollo';
import RedFlagsRegistro from './components/RedFlagsRegistro';
import EjemplosClinicos from './components/EjemplosClinicos';
import { API_URL } from './config';

function App() {
  const [ninos, setNinos] = useState([]);
  const [ninoSeleccionado, setNinoSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista'); // lista, registro, grafico, redflags, ejemplos

  useEffect(() => {
    cargarNinos();
  }, []);

  const cargarNinos = async () => {
    try {
      const response = await fetch(`${API_URL}/ninos`);
      const data = await response.json();
      setNinos(data);
    } catch (error) {
      console.error('Error al cargar niños:', error);
    }
  };

  const handleNinoCreado = (nuevoNino) => {
    cargarNinos();
    setNinoSeleccionado(nuevoNino);
    setVistaActual('registro');
  };

  const handleNinoSeleccionado = (nino) => {
    setNinoSeleccionado(nino);
    setVistaActual('grafico');
  };

  const handleNinoEliminado = () => {
    cargarNinos();
    setNinoSeleccionado(null);
    setVistaActual('lista');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Seguimiento del Neurodesarrollo Infantil</h1>
        <p className="subtitle">Sistema de evaluación del desarrollo 0-6 años</p>
      </header>

      <nav className="navigation">
        <button 
          className={vistaActual === 'lista' ? 'active' : ''}
          onClick={() => setVistaActual('lista')}
        >
          👶 Niños
        </button>
        <button 
          className={vistaActual === 'ejemplos' ? 'active' : ''}
          onClick={() => {
            setVistaActual('ejemplos');
            setNinoSeleccionado(null);
          }}
        >
          📚 Ejemplos Clínicos
        </button>
        {ninoSeleccionado && (
          <>
            <button 
              className={vistaActual === 'registro' ? 'active' : ''}
              onClick={() => setVistaActual('registro')}
            >
              ✅ Hitos del Desarrollo
            </button>
            <button 
              className={vistaActual === 'redflags' ? 'active' : ''}
              onClick={() => setVistaActual('redflags')}
            >
              🚩 Señales de Alarma
            </button>
            <button 
              className={vistaActual === 'grafico' ? 'active' : ''}
              onClick={() => setVistaActual('grafico')}
            >
              📈 Gráficas
            </button>
          </>
        )}
      </nav>

      <main className="main-content">
        {ninoSeleccionado && vistaActual !== 'ejemplos' && (
          <div className="nino-info">
            <h2>{ninoSeleccionado.nombre}</h2>
            <p>Fecha de nacimiento: {new Date(ninoSeleccionado.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
            <p>Edad: {calcularEdad(ninoSeleccionado.fecha_nacimiento)}</p>
          </div>
        )}

        {vistaActual === 'lista' && (
          <div>
            <NinoForm onNinoCreado={handleNinoCreado} />
            <NinosList 
              ninos={ninos} 
              onNinoSeleccionado={handleNinoSeleccionado}
              onNinoEliminado={handleNinoEliminado}
            />
          </div>
        )}

        {vistaActual === 'ejemplos' && (
          <EjemplosClinicos />
        )}

        {vistaActual === 'registro' && ninoSeleccionado && (
          <HitosRegistro ninoId={ninoSeleccionado.id} />
        )}

        {vistaActual === 'grafico' && ninoSeleccionado && (
          <GraficoDesarrollo ninoId={ninoSeleccionado.id} />
        )}

        {vistaActual === 'redflags' && ninoSeleccionado && (
          <RedFlagsRegistro ninoId={ninoSeleccionado.id} />
        )}
      </main>
    </div>
  );
}

function calcularEdad(fechaNacimiento) {
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

export default App;
