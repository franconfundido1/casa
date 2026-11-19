// Las tareas: cuándo tocan, qué tan vencidas están y los cambios que hace el usuario. Funciones puras:
// reciben «hoy» ('AAAA-MM-DD') como parámetro y devuelven datos nuevos, sin tocar los que reciben.
const fechasT = typeof module === 'object' ? require('./fechas.js') : { diasEntre };

// La última vez que se hizo (el día más reciente en el historial), o null si nunca.
function ultimaVez(historial, id) {
  let ultima = null;
  for (const h of historial) if (h.tarea === id && h.que === 'hecha' && (ultima === null || h.dia > ultima)) ultima = h.dia;
  return ultima;
}

// Días desde la última vez (null si nunca se hizo).
function diasDesde(ultima, hoy) {
  return ultima === null ? null : fechasT.diasEntre(ultima, hoy);
}

// Toca: si nunca se hizo, o si pasaron al menos el mínimo de días.
function toca(tarea, ultima, hoy) {
  const d = diasDesde(ultima, hoy);
  return d === null || d >= tarea.min;
}

// Atrasada: pasaron más días que el máximo.
function atrasada(tarea, ultima, hoy) {
  const d = diasDesde(ultima, hoy);
  return d !== null && d > tarea.max;
}

// Qué tan vencida está: días desde la última vez ÷ máximo. Nunca hecha: lo más vencido.
function vencimiento(tarea, ultima, hoy) {
  const d = diasDesde(ultima, hoy);
  return d === null ? Infinity : d / tarea.max;
}

// Primero la más vencida; si empatan, la más corta; si también, por nombre (así el orden no cambia solo).
function ordenarPorVencimiento(tareas, historial, hoy) {
  return tareas
    .map(t => ({ t, v: vencimiento(t, ultimaVez(historial, t.id), hoy) }))
    .sort((a, b) => (b.v - a.v) || (a.t.minutos - b.t.minutos) || a.t.nombre.localeCompare(b.t.nombre, 'es'))
    .map(x => x.t);
}

// La pantalla Tareas: tocan (de la más vencida a la menos), más adelante (de la que toca antes a la que toca después) y hechas hoy.
function agrupar(tareas, historial, hoy) {
  const tocan = [], adelante = [], hechas = [];
  for (const t of tareas) {
    const u = ultimaVez(historial, t.id);
    if (u === hoy) hechas.push(t);
    else if (toca(t, u, hoy)) tocan.push(t);
    else adelante.push(t);
  }
  const faltan = t => t.min - diasDesde(ultimaVez(historial, t.id), hoy);
  return {
    tocan: ordenarPorVencimiento(tocan, historial, hoy),
    adelante: adelante.sort((a, b) => (faltan(a) - faltan(b)) || (a.minutos - b.minutos) || a.nombre.localeCompare(b.nombre, 'es')),
    hechas,
  };
}

// La línea gris de la fila: «cada 3 días · 10 min».
function frecuenciaTexto(t) {
  if (t.min === 1 && t.max === 1) return 'todos los días';
  if (t.min === t.max) return `cada ${t.min} días`;
  return `cada ${t.min} a ${t.max} días`;
}
function lineaTarea(t) {
  return `${frecuenciaTexto(t)} · ${t.minutos} min`;
}

// Una tarea está bien si tiene nombre, minutos y días enteros, y el máximo no es menor que el mínimo.
function tareaValida(t) {
  const entero = (n, desde) => Number.isInteger(n) && n >= desde;
  return typeof t.nombre === 'string' && t.nombre.trim() !== '' && typeof t.icono === 'string' &&
    entero(t.minutos, 1) && entero(t.min, 1) && entero(t.max, 1) && t.max >= t.min;
}

// Cambios del usuario: devuelven un estado nuevo.
function guardarTarea(estado, tarea) {
  if (!tareaValida(tarea)) throw new Error('tarea inválida');
  const limpia = { id: tarea.id, nombre: tarea.nombre.trim(), icono: tarea.icono, minutos: tarea.minutos, min: tarea.min, max: tarea.max };
  const existe = estado.tareas.some(t => t.id === tarea.id);
  const tareas = existe ? estado.tareas.map(t => (t.id === tarea.id ? { ...t, ...limpia } : t)) : estado.tareas.concat(limpia);
  return { ...estado, tareas };
}

// Borrar saca la tarea de la lista; lo que ya hiciste queda en el historial.
function borrarTarea(estado, id) {
  return { ...estado, tareas: estado.tareas.filter(t => t.id !== id) };
}

// Hecha: la última vez pasa a ser hoy (se suma al historial).
function marcarHecha(estado, id, hoy) {
  if (estado.historial.some(h => h.tarea === id && h.que === 'hecha' && h.dia === hoy)) return estado;
  return { ...estado, historial: estado.historial.concat({ tarea: id, dia: hoy, que: 'hecha' }) };
}

// Deshacer una marca de hoy (si la tocaste sin querer). Solo la de hoy.
function desmarcarHecha(estado, id, hoy) {
  return { ...estado, historial: estado.historial.filter(h => !(h.tarea === id && h.que === 'hecha' && h.dia === hoy)) };
}

if (typeof module === 'object') module.exports = {
  ultimaVez, diasDesde, toca, atrasada, vencimiento, ordenarPorVencimiento, agrupar,
  frecuenciaTexto, lineaTarea, tareaValida, guardarTarea, borrarTarea, marcarHecha, desmarcarHecha,
};
