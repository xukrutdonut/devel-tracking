import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import NinosList from './components/NinosList';
import NinoForm from './components/NinoForm';
import HitosRegistro from './components/HitosRegistro';
import GraficoDesarrollo from './components/GraficoDesarrollo';
import RedFlagsRegistro from './components/RedFlagsRegistro';
import EjemplosClinicos from './components/EjemplosClinicos';
import AnalisisAceleracion from './components/AnalisisAceleracion';
import ClasificacionTrayectorias from './components/ClasificacionTrayectorias';
import Bibliografia from './components/Bibliografia';
import { API_URL } from './config';
import { 
  estaAutenticado, 
  getUsuario, 
  cerrarSesion, 
  fetchConAuth,
  esAdmin,
  esModoInvitado
} from './utils/authService';

function App() {
  const [autenticado, setAutenticado] = useState(estaAutenticado());
  const [usuario, setUsuario] = useState(getUsuario());
  const [ninos, setNinos] = useState([]);
  const [ninoSeleccionado, setNinoSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista'); // lista, registro, grafico, redflags, ejemplos, aceleracion, clasificacion, bibliografia

  useEffect(() => {
    if (autenticado) {
      cargarNinos();
    }
  }, [autenticado]);

  const handleLoginSuccess = (usuarioData) => {
    setAutenticado(true);
    setUsuario(usuarioData);
  };

  const handleLogout = () => {
    cerrarSesion();
    setAutenticado(false);
    setUsuario(null);
    setNinos([]);
    setNinoSeleccionado(null);
    setVistaActual('lista');
  };

  const handleEjemploCreado = (ninoData, hitosData) => {
    // Si recibe datos del niño y hitos, es modo invitado
    if (ninoData && hitosData && esModoInvitado()) {
      // Agregar el niño a la lista
      const ninosActuales = [...ninos, ninoData];
      setNinos(ninosActuales);
      sessionStorage.setItem('invitado_ninos', JSON.stringify(ninosActuales));
      
      // Guardar los hitos del ejemplo en sessionStorage
      const hitosKey = `invitado_hitos_${ninoData.id}`;
      sessionStorage.setItem(hitosKey, JSON.stringify(hitosData));
    } else {
      // Usuario autenticado: recargar desde DB
      cargarNinos();
    }
  };

  const cargarNinos = async () => {
    // Si es modo invitado, cargar desde sessionStorage
    if (esModoInvitado()) {
      const ninosGuardados = sessionStorage.getItem('invitado_ninos');
      if (ninosGuardados) {
        setNinos(JSON.parse(ninosGuardados));
      }
      return;
    }

    // Si no, cargar desde API
    try {
      const response = await fetchConAuth(`${API_URL}/ninos`);
      const data = await response.json();
      setNinos(data);
    } catch (error) {
      console.error('Error al cargar niños:', error);
    }
  };

  const handleNinoCreado = (nuevoNino) => {
    // En modo invitado, guardar en sessionStorage
    if (esModoInvitado()) {
      const ninosActuales = [...ninos, nuevoNino];
      setNinos(ninosActuales);
      sessionStorage.setItem('invitado_ninos', JSON.stringify(ninosActuales));
    } else {
      cargarNinos();
    }
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

  // Si no está autenticado, mostrar login
  if (!autenticado) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      {/* Banner de advertencia para modo invitado */}
      {esModoInvitado() && (
        <div className="banner-invitado">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div className="banner-text">
              <strong>Modo Invitado:</strong> Los datos NO se guardan permanentemente. 
              Al cerrar el navegador se perderán todos los datos. 
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                Registrarse gratis
              </a> para guardar permanentemente.
            </div>
          </div>
        </div>
      )}

      <header className="App-header">
        <div className="header-content">
          <div>
            <h1>📊 Seguimiento del Neurodesarrollo Infantil</h1>
            <p className="subtitle">Sistema de evaluación del desarrollo 0-6 años</p>
          </div>
          <div className="user-info">
            <span className="user-name">👤 {usuario.nombre}</span>
            {esAdmin() && <span className="admin-badge">ADMIN</span>}
            {esModoInvitado() && <span className="invitado-badge">INVITADO</span>}
            <button className="btn-logout" onClick={handleLogout}>
              {esModoInvitado() ? 'Salir / Registrarse' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
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
        <button 
          className={vistaActual === 'bibliografia' ? 'active' : ''}
          onClick={() => {
            setVistaActual('bibliografia');
            setNinoSeleccionado(null);
          }}
        >
          📖 Fundamentos Científicos
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
            <button 
              className={vistaActual === 'aceleracion' ? 'active' : ''}
              onClick={() => setVistaActual('aceleracion')}
            >
              📐 Análisis Matemático
            </button>
            <button 
              className={vistaActual === 'clasificacion' ? 'active' : ''}
              onClick={() => setVistaActual('clasificacion')}
            >
              🎯 Tipología Trayectorias
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
          <EjemplosClinicos 
            onEjemploCreado={handleEjemploCreado}
            onSeleccionarNino={(nino) => {
              setNinoSeleccionado(nino);
              setVistaActual('grafico');
            }}
          />
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

        {vistaActual === 'aceleracion' && ninoSeleccionado && (
          <AnalisisAceleracion ninoId={ninoSeleccionado.id} />
        )}

        {vistaActual === 'clasificacion' && ninoSeleccionado && (
          <ClasificacionTrayectorias ninoId={ninoSeleccionado.id} />
        )}

        {vistaActual === 'bibliografia' && (
          <Bibliografia />
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
