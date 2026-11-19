// Los datos del usuario: localStorage, clave 'casa-v1' (no se renombra nunca). La lectura y las migraciones son de reglas/estado.js.
const CLAVE = 'casa-v1';
let estado = null;

function leerDatos() {
  let texto = null;
  try { texto = localStorage.getItem(CLAVE); } catch (e) { /* sin acceso al almacenamiento: arranca vacía */ }
  const r = cargar(texto);
  // si había algo que no se pudo leer, se guarda aparte antes de seguir: no se pierde
  if (r.roto) { try { if (localStorage.getItem(CLAVE + '-roto') === null) localStorage.setItem(CLAVE + '-roto', texto); } catch (e) {} }
  estado = r.estado;
  guardarDatos();
}

function guardarDatos() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin espacio o sin acceso: sigue en memoria */ }
}

// Pide que el iPhone no borre los datos cuando le falta espacio. Devuelve true si quedan guardados para siempre.
async function pedirQueNoSeBorren() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch (e) { return false; }
}
