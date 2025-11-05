import React, { useState } from 'react';
import HitosRegistro from './HitosRegistro';
import RedFlagsRegistro from './RedFlagsRegistro';
import EscalasRegistro from './EscalasRegistro';
import './IntroduccionDatos.css';

function IntroduccionDatos({ ninoId }) {
  const [subpestaña, setSubpestaña] = useState('hitos'); // 'hitos', 'redflags', 'escalas'

  return (
    <div className="introduccion-datos-container">
      <div className="subpestanas">
        <button 
          className={`subpestaña-btn ${subpestaña === 'hitos' ? 'active' : ''}`}
          onClick={() => setSubpestaña('hitos')}
        >
          ✅ Hitos del Desarrollo
        </button>
        <button 
          className={`subpestaña-btn ${subpestaña === 'redflags' ? 'active' : ''}`}
          onClick={() => setSubpestaña('redflags')}
        >
          🚩 Señales de Alarma
        </button>
        <button 
          className={`subpestaña-btn ${subpestaña === 'escalas' ? 'active' : ''}`}
          onClick={() => setSubpestaña('escalas')}
        >
          📋 Escalas de Desarrollo
        </button>
      </div>

      <div className="subpestaña-contenido">
        {subpestaña === 'hitos' && <HitosRegistro ninoId={ninoId} />}
        {subpestaña === 'redflags' && <RedFlagsRegistro ninoId={ninoId} />}
        {subpestaña === 'escalas' && <EscalasRegistro ninoId={ninoId} />}
      </div>
    </div>
  );
}

export default IntroduccionDatos;
