// Al abrir: leer los datos, pedir que no se borren, poner la fecha y dejar la app lista para usarse sin internet.
leerDatos();
prepararDia();
pintarSubtitulo();
pintarTodo();
// si la app queda abierta y cambia el día, al volver se eligen las 3 del día nuevo y se actualiza todo
document.addEventListener('visibilitychange', () => { if (!document.hidden) { prepararDia(); pintarSubtitulo(); pintarTodo(); } });

pedirQueNoSeBorren().then(si => {
  document.getElementById('persistente').textContent = si ? 'para siempre' : 'mientras haya lugar';
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sin service worker: igual funciona con internet */ });
}
