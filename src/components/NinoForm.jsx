import React, { useState } from 'react';
import { API_URL } from '../config';
import { fetchConAuth, esModoInvitado } from '../utils/authService';

function NinoForm({ onNinoCreado }) {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [semanasGestacion, setSemanasGestacion] = useState(40);
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Modo invitado: crear niño localmente
    if (esModoInvitado()) {
      const nuevoNino = {
        id: `invitado_${Date.now()}`,
        nombre,
        fecha_nacimiento: fechaNacimiento,
        semanas_gestacion: parseInt(semanasGestacion),
        creado_en: new Date().toISOString()
      };
      
      onNinoCreado(nuevoNino);
      setNombre('');
      setFechaNacimiento('');
      setSemanasGestacion(40);
      setMostrarForm(false);
      return;
    }
    
    // Modo normal: crear en servidor
    try {
      const response = await fetchConAuth(`${API_URL}/ninos`, {
        method: 'POST',
        body: JSON.stringify({ 
          nombre, 
          fecha_nacimiento: fechaNacimiento,
          semanas_gestacion: parseInt(semanasGestacion)
        }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Error al crear niño';
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          errorMessage = 'Error al crear niño';
        }
        throw new Error(errorMessage);
      }
      
      const nuevoNino = await response.json();
      onNinoCreado(nuevoNino);
      setNombre('');
      setFechaNacimiento('');
      setSemanasGestacion(40);
      setMostrarForm(false);
    } catch (error) {
      console.error('Error al crear niño:', error);
      alert(`Error al crear niño: ${error.message}`);
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
