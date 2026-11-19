// La copia de seguridad: un .json con todo el estado (app: 'casa' y la versión). Funciones puras.
const estadoC = typeof module === 'object' ? require('./estado.js') : { VERSION, migrar };
const tareasC = typeof module === 'object' ? require('./tareas.js') : { tareaValida };

// El texto de la copia: el estado tal cual, más el día y la hora en que se bajó.
function armarCopia(estado, dia, hora) {
  return JSON.stringify({ ...estado, copia: { dia, hora } }, null, 1);
}

// El nombre del archivo: str3ak-copia-AAAA-MM-DD.json (el nombre que se ve; adentro sigue app: 'casa')
function nombreCopia(dia) {
  return `str3ak-copia-${dia}.json`;
}

// Leer una copia: { ok: true, estado, resumen } o { ok: false, error } (con un texto corto para el usuario).
// Si es de una versión vieja, la migra; si es de una más nueva que esta app, no la carga.
function leerCopia(texto) {
  let datos;
  try { datos = JSON.parse(texto); } catch (e) { return { ok: false, error: 'El archivo no es una copia de str3ak.' }; }
  if (!datos || typeof datos !== 'object' || datos.app !== 'casa' || !Number.isInteger(datos.version) || datos.version < 1) {
    return { ok: false, error: 'El archivo no es una copia de str3ak.' };
  }
  if (datos.version > estadoC.VERSION) return { ok: false, error: 'La copia es de una versión más nueva de la app. Actualizala y probá de nuevo.' };
  const { copia, ...resto } = datos;
  let estado;
  try { estado = estadoC.migrar(resto); } catch (e) { return { ok: false, error: 'La copia está incompleta.' }; }
  const bien = Array.isArray(estado.tareas) && estado.tareas.every(t => t && typeof t.id === 'string' && tareasC.tareaValida(t)) &&
    new Set(estado.tareas.map(t => t.id)).size === estado.tareas.length &&
    Array.isArray(estado.historial) && estado.historial.every(h => h && typeof h.tarea === 'string' && typeof h.que === 'string');
  if (!bien) return { ok: false, error: 'La copia está incompleta.' };
  const resumen = { dia: copia && copia.dia || null, tareas: estado.tareas.length, hechas: estado.historial.filter(h => h.que === 'hecha').length };
  return { ok: true, estado, resumen };
}

if (typeof module === 'object') module.exports = { armarCopia, nombreCopia, leerCopia };
