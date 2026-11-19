// La barra de pestañas: muestra 1 pantalla por vez y cambia el título de la cabecera.
const tituloEl = document.getElementById('titulo');
const subtituloEl = document.getElementById('subtitulo');
let pantallaActual = 'hoy';

function pintarSubtitulo() {
  subtituloEl.textContent = pantallaActual === 'hoy' ? fechaLarga(diaLocal(new Date())) : '';
}

function mostrarPantalla(nombre) {
  if (nombre === pantallaActual) return;
  pantallaActual = nombre;
  document.querySelectorAll('.pantalla').forEach(p => { p.hidden = p.id !== 'pantalla-' + nombre; });
  document.querySelectorAll('.pestanas button').forEach(b => {
    if (b.dataset.pantalla === nombre) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  tituloEl.textContent = document.getElementById('pantalla-' + nombre).dataset.titulo;
  document.getElementById('nueva-tarea').hidden = nombre === 'ajustes';
  pintarSubtitulo();
  // el título entra con un fundido corto
  tituloEl.parentNode.classList.remove('cambia'); void tituloEl.offsetWidth; tituloEl.parentNode.classList.add('cambia');
}

document.querySelector('.pestanas').addEventListener('click', e => {
  const b = e.target.closest('button[data-pantalla]');
  if (b) mostrarPantalla(b.dataset.pantalla);
});
