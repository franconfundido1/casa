// Al abrir: leer los datos, pedir que no se borren, poner la fecha y dejar la app lista para usarse sin internet.
leerDatos();
pintarSubtitulo();
pintarTareas();
// si la app queda abierta y cambia el día, la fecha y lo que toca se actualizan al volver
document.addEventListener('visibilitychange', () => { if (!document.hidden) { pintarSubtitulo(); pintarTareas(); } });

pedirQueNoSeBorren().then(si => {
  document.getElementById('persistente').textContent = si ? 'para siempre' : 'mientras haya lugar';
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sin service worker: igual funciona con internet */ });
}
