// El estado guardado (localStorage, clave 'casa-v1'). Puro: recibe el texto guardado y devuelve el estado listo para usar.
// Cada cambio en la forma de guardar sube VERSION y suma en MIGRACIONES cómo pasar de la versión anterior a la nueva.

const VERSION = 1;

// MIGRACIONES[n]: datos de la versión n → datos de la versión n + 1. Vacía por ahora.
const MIGRACIONES = {};

function estadoNuevo() {
  return { app: 'casa', version: VERSION };
}

// Lleva unos datos ya leídos a la versión actual.
function migrar(datos, version = VERSION, migraciones = MIGRACIONES) {
  let d = datos;
  while (d.version < version) {
    const paso = migraciones[d.version];
    if (!paso) throw new Error('falta la migración de la versión ' + d.version);
    d = { ...paso(d), version: d.version + 1 };
  }
  return d;
}

// Texto guardado → { estado, roto }. «roto» es true si había algo que no se pudo leer (se guarda aparte, no se pierde).
// Datos de una versión más nueva que esta app se dejan como están.
function cargar(texto, version = VERSION, migraciones = MIGRACIONES) {
  if (texto === null || texto === undefined || texto === '') return { estado: estadoNuevo(), roto: false };
  let datos;
  try { datos = JSON.parse(texto); } catch (e) { return { estado: estadoNuevo(), roto: true }; }
  const valido = datos && typeof datos === 'object' && datos.app === 'casa' && Number.isInteger(datos.version) && datos.version >= 1;
  if (!valido) return { estado: estadoNuevo(), roto: true };
  if (datos.version > version) return { estado: datos, roto: false };
  return { estado: migrar(datos, version, migraciones), roto: false };
}

if (typeof module === 'object') module.exports = { VERSION, estadoNuevo, migrar, cargar };
