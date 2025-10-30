import React, { useState } from 'react';

const API_URL = 'http://localhost:8001/api';

function NinoForm({ onNinoCreado }) {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [semanasGestacion, setSemanasGestacion] = useState(40);
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/ninos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre, 
          fecha_nacimiento: fechaNacimiento,
          semanas_gestacion: parseInt(semanasGestacion)
        }),
      });
      
      const nuevoNino = await response.json();
      onNinoCreado(nuevoNino);
      setNombre('');
      setFechaNacimiento('');
      setSemanasGestacion(40);
      setMostrarForm(false);
    } catch (error) {
      console.error('Error al crear niño:', error);
      alert('Error al crear niño');
    }
  };

  if (!mostrarForm) {
    return (
      <div className="form-container">
        <button 
          className="btn-primary"
          onClick={() => setMostrarForm(true)}
        >
          + Agregar Nuevo Niño
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Nuevo Niño</h2>
      <form onSubmit={handleSubmit} className="nino-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Nombre del niño/a"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
          <input
            id="fechaNacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="semanasGestacion">
            Semanas de Gestación al Nacer:
            <span className="label-hint"> (40 = término completo, &lt;37 = pretérmino)</span>
          </label>
          <input
            id="semanasGestacion"
            type="number"
            value={semanasGestacion}
            onChange={(e) => setSemanasGestacion(e.target.value)}
            min="22"
            max="42"
            step="1"
            required
          />
          {semanasGestacion < 37 && (
            <p className="warning-text">
              ⚠️ Niño pretérmino: se calculará edad corregida
            </p>
          )}
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn-primary">Crear</button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setMostrarForm(false)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NinoForm;
