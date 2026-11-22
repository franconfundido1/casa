// Al abrir: leer los datos, pedir que no se borren, poner la fecha y dejar la app lista para usarse sin internet.
// La entrada con el logo dura 700 ms; después se saca (no queda nada encima de la app)
setTimeout(() => { const e = document.getElementById('entrada'); if (e) e.remove(); }, 750);
leerDatos();
prepararDia();
pintarSubtitulo();
pintarTodo();
// si la app queda abierta y cambia el día, al volver se eligen las 3 del día nuevo y se actualiza todo
document.addEventListener('visibilitychange', () => { if (!document.hidden) { prepararDia(); pintarSubtitulo(); pintarTodo(); } });

pedirQueNoSeBorren().then(si => {
  document.getElementById('persistente').textContent = si ? 'para siempre' : 'mientras haya lugar';
});

// en la app de Android la página ya viene adentro: el service worker es solo para la versión web
if ('serviceWorker' in navigator && !(window.Capacitor && Capacitor.isNativePlatform())) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sin service worker: igual funciona con internet */ });
}
