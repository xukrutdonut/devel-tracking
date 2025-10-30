/**
 * Calcula la edad cronológica en meses desde la fecha de nacimiento
 * @param {string} fechaNacimiento - Fecha de nacimiento en formato ISO
 * @returns {number} Edad en meses
 */
export function calcularEdadCronologicaMeses(fechaNacimiento) {
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  const diffTime = Math.abs(hoy - fechaNac);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.44);
}

/**
 * Calcula la edad corregida para niños pretérmino
 * Fórmula: Edad corregida = Edad cronológica - ((40 - semanas de gestación) / 4)
 * @param {string} fechaNacimiento - Fecha de nacimiento en formato ISO
 * @param {number} semanasGestacion - Semanas de gestación al nacer (default: 40)
 * @returns {number} Edad corregida en meses
 */
export function calcularEdadCorregidaMeses(fechaNacimiento, semanasGestacion = 40) {
  const edadCronologica = calcularEdadCronologicaMeses(fechaNacimiento);
  
  // Si es término (>= 37 semanas), no hay corrección
  if (semanasGestacion >= 37) {
    return edadCronologica;
  }
  
  // Calcular meses de corrección: (40 - semanas gestación) / 4
  const mesesCorreccion = (40 - semanasGestacion) / 4;
  const edadCorregida = edadCronologica - mesesCorreccion;
  
  // No devolver edad negativa
  return Math.max(0, edadCorregida);
}

/**
 * Determina si un niño es pretérmino
 * @param {number} semanasGestacion - Semanas de gestación al nacer
 * @returns {boolean} True si es pretérmino (< 37 semanas)
 */
export function esPretermino(semanasGestacion) {
  return semanasGestacion < 37;
}

/**
 * Formatea las edades para mostrar en la UI
 * @param {string} fechaNacimiento - Fecha de nacimiento en formato ISO
 * @param {number} semanasGestacion - Semanas de gestación al nacer
 * @returns {object} Objeto con las edades formateadas
 */
export function formatearEdades(fechaNacimiento, semanasGestacion = 40) {
  const edadCronologica = calcularEdadCronologicaMeses(fechaNacimiento);
  const edadCorregida = calcularEdadCorregidaMeses(fechaNacimiento, semanasGestacion);
  const esPreter = esPretermino(semanasGestacion);
  
  return {
    edadCronologica,
    edadCorregida,
    esPretermino: esPreter,
    textoEdad: esPreter 
      ? `${edadCronologica} meses (corregida: ${Math.round(edadCorregida * 10) / 10} meses)`
      : `${edadCronologica} meses`
  };
}
