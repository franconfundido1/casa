// Tareas de 1 sola vez: tienen una fecha en vez de una frecuencia. Funciones puras: reciben «hoy» ('AAAA-MM-DD').
// Si no se hacen ese día, siguen al día siguiente como atrasadas; hechas, salen de las listas y quedan en el historial.
const fechasU = typeof module === 'object' ? require('./fechas.js') : { diasEntre, fechaLarga };

function esUnaVez(t) { return t.unaVez === true; }

// Pendiente: de 1 vez y todavía sin hacer (una vez hecha, no vuelve).
function unaVezPendiente(t, historial) {
  return esUnaVez(t) && !historial.some(h => h.tarea === t.id && h.que === 'hecha');
}

const porFecha = (a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0) || (a.minutos - b.minutos) || a.nombre.localeCompare(b.nombre, 'es');

// Para hoy: las de hoy y las atrasadas, primero la más atrasada.
function paraHoyUnaVez(tareas, historial, hoy) {
  return tareas.filter(t => unaVezPendiente(t, historial) && t.fecha <= hoy).sort(porFecha);
}

// Próximas: las de días que todavía no llegaron, por fecha.
function proximasUnaVez(tareas, historial, hoy) {
  return tareas.filter(t => unaVezPendiente(t, historial) && t.fecha > hoy).sort(porFecha);
}

// El atraso, dicho corto: null (es de hoy), «de ayer» o «hace N días».
function atrasoTexto(fecha, hoy) {
  const d = fechasU.diasEntre(fecha, hoy);
  if (d <= 0) return null;
  return d === 1 ? 'de ayer' : `hace ${d} días`;
}

// Cuándo es una próxima: «mañana» o «viernes 21 de noviembre».
function cuandoTexto(fecha, hoy) {
  const d = fechasU.diasEntre(hoy, fecha);
  if (d === 0) return 'hoy';
  if (d === 1) return 'mañana';
  return fechasU.fechaLarga(fecha);
}

if (typeof module === 'object') module.exports = { esUnaVez, unaVezPendiente, paraHoyUnaVez, proximasUnaVez, atrasoTexto, cuandoTexto };
