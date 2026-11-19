// El estado guardado (localStorage, clave 'casa-v1'). Puro: recibe el texto guardado y devuelve el estado listo para usar.
// Cada cambio en la forma de guardar sube VERSION y suma en MIGRACIONES cómo pasar de la versión anterior a la nueva.
// Las migraciones no se cambian nunca después de publicadas: llevan sus datos adentro.

const VERSION = 2;

// MIGRACIONES[n]: datos de la versión n → datos de la versión n + 1.
const MIGRACIONES = {
  // 1 → 2: las 9 tareas de arranque (docs/vision.md) y el historial, vacío.
  // Cada tarea: minutos que lleva, cada cuántos días toca (min a max) y su ícono. Nunca hechas: tocan hoy.
  1: d => ({
    ...d,
    tareas: [
      { id: 'cama', nombre: 'Hacer la cama', icono: 'bed', minutos: 3, min: 1, max: 1 },
      { id: 'platos', nombre: 'Lavar los platos', icono: 'bowl-food', minutos: 10, min: 1, max: 1 },
      { id: 'ordenar-ropa', nombre: 'Ordenar la ropa', icono: 't-shirt', minutos: 10, min: 2, max: 2 },
      { id: 'barrer', nombre: 'Barrer', icono: 'broom', minutos: 10, min: 3, max: 3 },
      { id: 'verduleria', nombre: 'Verdulería', icono: 'carrot', minutos: 20, min: 3, max: 4 },
      { id: 'lavar-ropa', nombre: 'Lavar la ropa', icono: 'washing-machine', minutos: 5, min: 3, max: 4 },
      { id: 'trapo', nombre: 'Pasar el trapo', icono: 'drop', minutos: 20, min: 7, max: 7 },
      { id: 'bano', nombre: 'Limpiar el baño', icono: 'bathtub', minutos: 20, min: 7, max: 7 },
      { id: 'super', nombre: 'Súper', icono: 'shopping-cart', minutos: 60, min: 7, max: 7 },
    ],
    historial: [],
  }),
};

function estadoNuevo(version = VERSION, migraciones = MIGRACIONES) {
  return migrar({ app: 'casa', version: 1 }, version, migraciones);
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
  if (texto === null || texto === undefined || texto === '') return { estado: estadoNuevo(version, migraciones), roto: false };
  let datos;
  try { datos = JSON.parse(texto); } catch (e) { return { estado: estadoNuevo(version, migraciones), roto: true }; }
  const valido = datos && typeof datos === 'object' && datos.app === 'casa' && Number.isInteger(datos.version) && datos.version >= 1;
  if (!valido) return { estado: estadoNuevo(version, migraciones), roto: true };
  if (datos.version > version) return { estado: datos, roto: false };
  return { estado: migrar(datos, version, migraciones), roto: false };
}

if (typeof module === 'object') module.exports = { VERSION, MIGRACIONES, estadoNuevo, migrar, cargar };
