// La pantalla Tareas: la lista (tocan, más adelante, hechas hoy), marcar hecha y la hoja de tarea.
// Las reglas (qué toca, en qué orden) son de reglas/tareas.js; acá solo se dibuja y se guarda.

const ic = (id, clase = '') => `<svg class="ic ${clase}" aria-hidden="true"><use href="#${id}"/></svg>`;
const hoyLocal = () => diaLocal(new Date());
const escapar = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Los íconos de tarea: Phosphor rellenos, de la casa (docs/diseno.md)
const ICONOS_TAREA = [
  ['check-circle', 'Tarea'], ['broom', 'Escoba'], ['bowl-food', 'Platos'], ['bed', 'Cama'],
  ['t-shirt', 'Remera'], ['washing-machine', 'Lavarropas'], ['coat-hanger', 'Percha'], ['carrot', 'Verdura'],
  ['shopping-cart', 'Carrito'], ['bathtub', 'Bañera'], ['toilet', 'Inodoro'], ['drop', 'Gota'],
  ['spray-bottle', 'Rociador'], ['trash', 'Basura'], ['cooking-pot', 'Olla'], ['plant', 'Planta'],
];

// ---- La lista

const listaTareas = document.getElementById('lista-tareas');

function filaTarea(t, estadoFila) {
  return `<button class="fila" data-id="${t.id}" data-estado="${estadoFila}">` +
    `<span class="estado" data-circulo><i>${ic('check-bold', 'i-check')}</i></span>` +
    `<span class="texto"><span class="nombre">${escapar(t.nombre)}</span><span class="linea">${lineaTarea(t)}</span></span></button>`;
}

function pintarTareas() {
  const g = agrupar(estado.tareas, estado.historial, hoyLocal());
  const seccion = (titulo, lista, estadoFila) => lista.length
    ? `<section class="seccion"><h2>${titulo}</h2><div>${lista.map(t => filaTarea(t, estadoFila)).join('')}</div></section>` : '';
  listaTareas.innerHTML = `<div class="lista">${seccion('tocan', g.tocan, 'toca')}${seccion('más adelante', g.adelante, 'no')}${seccion('hechas hoy', g.hechas, 'hecha')}</div>`;
}

// Tocar el círculo marca hecha (o deshace la de hoy); tocar la fila abre la hoja.
listaTareas.addEventListener('click', e => {
  const fila = e.target.closest('.fila');
  if (!fila) return;
  const tarea = estado.tareas.find(t => t.id === fila.dataset.id);
  if (!tarea) return;
  if (e.target.closest('[data-circulo]')) {
    const hoy = hoyLocal();
    const yaHecha = ultimaVez(estado.historial, tarea.id) === hoy;
    estado = yaHecha ? desmarcarHecha(estado, tarea.id, hoy) : marcarHecha(estado, tarea.id, hoy);
    guardarDatos();
    // el círculo cambia ahí mismo; después la fila pasa a su grupo
    fila.dataset.estado = yaHecha ? 'toca' : 'hecha';
    setTimeout(pintarTareas, 450);
    return;
  }
  abrirHojaTarea(tarea);
});

// ---- Controles de la hoja

// Contador − y +, con la lista de valores posibles. Devuelve get, set y la forma de cambiar los límites.
function contador(el, { valores, unidad, alCambiar }) {
  el.innerHTML = `<button data-menos aria-label="Menos">${ic('minus-bold')}</button>` +
    `<div class="cifra"><b class="num"></b><span></span></div>` +
    `<button data-mas aria-label="Más">${ic('plus-bold')}</button>`;
  const menos = el.querySelector('[data-menos]'), mas = el.querySelector('[data-mas]'), cifra = el.querySelector('.cifra');
  let lista = valores, valor = valores[0];
  const pintar = (avisar = true) => {
    cifra.querySelector('b').textContent = valor;
    cifra.querySelector('span').textContent = typeof unidad === 'function' ? unidad(valor) : unidad;
    cifra.classList.remove('cambia'); void cifra.offsetWidth; cifra.classList.add('cambia');
    menos.disabled = valor <= lista[0];
    mas.disabled = valor >= lista[lista.length - 1];
    if (avisar && alCambiar) alCambiar(valor);
  };
  menos.onclick = () => { valor = [...lista].reverse().find(v => v < valor) ?? valor; pintar(); };
  mas.onclick = () => { valor = lista.find(v => v > valor) ?? valor; pintar(); };
  return {
    get: () => valor,
    set: (v, avisar = false) => { if (!lista.includes(v)) lista = [...lista, v].sort((a, b) => a - b); valor = v; pintar(avisar); },
    limites: nuevos => { lista = nuevos; if (!lista.includes(valor)) valor = lista.find(v => v >= valor) ?? lista[lista.length - 1]; pintar(false); },
  };
}

const desdeHasta = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// Minutos: de a 1 hasta 10, de a 5 hasta 60 y después de a 15 o 30.
const VALORES_MINUTOS = [...desdeHasta(1, 10), 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120, 150, 180];
const VALORES_DIAS = desdeHasta(1, 60);

// ---- La hoja de tarea, como «nuevo hábito»

const hojaTarea = document.getElementById('hoja-tarea');
const hojaIconos = document.getElementById('hoja-iconos');
const nombreTarea = document.getElementById('nombre-tarea');
const guardarBtn = document.getElementById('guardar-tarea');
const borrarBtn = document.getElementById('borrar-tarea');
const firma = document.getElementById('firma');
const grilla = document.getElementById('grilla-iconos');
const modoEl = document.getElementById('modo');
const notaFrec = document.getElementById('nota-frec');
let enEdicion = null, icono = 'check-circle', modo = 'cada', original = '', armando = false;

const cMinutos = contador(document.getElementById('c-minutos'), { valores: VALORES_MINUTOS, unidad: 'minutos', alCambiar: revisar });
const cDesde = contador(document.getElementById('c-desde'), {
  valores: VALORES_DIAS, unidad: n => (modo === 'cada' ? (n === 1 ? 'día' : 'días') : 'desde'),
  alCambiar: () => { ajustarHasta(); pintarNota(); revisar(); },
});
const cHasta = contador(document.getElementById('c-hasta'), { valores: VALORES_DIAS, unidad: 'hasta', alCambiar: () => { pintarNota(); revisar(); } });

// Con «Entre», el máximo es siempre mayor que el mínimo.
function ajustarHasta() {
  cHasta.limites(desdeHasta(cDesde.get() + 1, 61));
}

function tareaDeLaHoja() {
  const min = cDesde.get();
  return { id: enEdicion ? enEdicion.id : 't' + Date.now().toString(36), nombre: nombreTarea.value, icono,
    minutos: cMinutos.get(), min, max: modo === 'entre' ? cHasta.get() : min };
}
const firmaDe = t => JSON.stringify([t.nombre.trim(), t.icono, t.minutos, t.min, t.max]);

// «Guardar» se prende cuando la tarea está completa y cambió algo.
function revisar() {
  if (armando) return;
  const t = tareaDeLaHoja();
  guardarBtn.disabled = !tareaValida(t) || firmaDe(t) === original;
}

// La nota de la frecuencia, solo con «Entre».
function pintarNota() {
  notaFrec.hidden = modo !== 'entre';
  notaFrec.textContent = `Toca a partir de los ${cDesde.get()} días; después de los ${cHasta.get()}, está atrasada.`;
}

function pintarModo() {
  modoEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.op === modo));
  document.getElementById('c-hasta').hidden = modo === 'cada';
  cDesde.set(cDesde.get()); // la unidad cambia entre «días» y «desde»
  ajustarHasta();
  pintarNota();
}
modoEl.addEventListener('click', e => {
  const b = e.target.closest('button[data-op]');
  if (!b || b.dataset.op === modo) return;
  modo = b.dataset.op;
  pintarModo();
  revisar();
});

function pintarIcono() {
  firma.innerHTML = ic(icono + '-fill') + `<span class="lapiz">${ic('pencil-simple-fill')}</span>`;
  grilla.innerHTML = ICONOS_TAREA.map(([id, nombre]) =>
    `<button data-id="${id}" aria-pressed="${id === icono}">${ic(id + '-fill')}${nombre}</button>`).join('');
}
firma.onclick = () => abrirHoja(hojaIconos);
grilla.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  icono = b.dataset.id;
  pintarIcono();
  revisar();
  setTimeout(() => cerrarHoja(hojaIconos), 150);
});

function abrirHoja(h) { h.classList.add('abierta'); }
function cerrarHoja(h) { h.classList.remove('abierta'); }

function abrirHojaTarea(t) {
  armando = true;
  enEdicion = t || null;
  const base = t || { nombre: '', icono: 'check-circle', minutos: 10, min: 3, max: 3 };
  nombreTarea.value = base.nombre;
  icono = base.icono;
  modo = base.min === base.max ? 'cada' : 'entre';
  cMinutos.set(base.minutos);
  cDesde.set(base.min);
  ajustarHasta();
  cHasta.set(base.max > base.min ? base.max : base.min + 1);
  pintarModo();
  pintarIcono();
  borrarBtn.hidden = !t;
  reiniciarBorrar();
  armando = false;
  original = t ? firmaDe(t) : '';
  revisar();
  hojaTarea.querySelector('.hoja-cuerpo').scrollTop = 0;
  abrirHoja(hojaTarea);
}
function cerrarHojaTarea() {
  nombreTarea.blur();
  cerrarHoja(hojaIconos);
  cerrarHoja(hojaTarea);
}

nombreTarea.addEventListener('input', revisar);
guardarBtn.onclick = () => {
  const t = tareaDeLaHoja();
  if (!tareaValida(t)) return;
  estado = guardarTarea(estado, t);
  guardarDatos();
  cerrarHojaTarea();
  pintarTareas();
};

// Borrar pide 2 toques: el 1.º avisa, el 2.º borra (si no, se vuelve a «Borrar tarea» a los 3 segundos).
let borrarEspera = null;
function reiniciarBorrar() {
  clearTimeout(borrarEspera);
  borrarEspera = null;
  borrarBtn.textContent = 'Borrar tarea';
}
borrarBtn.onclick = () => {
  if (!enEdicion) return;
  if (!borrarEspera) {
    borrarBtn.textContent = 'Tocá de nuevo para borrar';
    borrarEspera = setTimeout(reiniciarBorrar, 3000);
    return;
  }
  reiniciarBorrar();
  estado = borrarTarea(estado, enEdicion.id);
  guardarDatos();
  cerrarHojaTarea();
  pintarTareas();
};

document.getElementById('cerrar-tarea').onclick = cerrarHojaTarea;
document.getElementById('velo-tarea').onclick = cerrarHojaTarea;
document.getElementById('cerrar-iconos').onclick = () => cerrarHoja(hojaIconos);
document.getElementById('velo-iconos').onclick = () => cerrarHoja(hojaIconos);
document.getElementById('nueva-tarea').onclick = () => abrirHojaTarea(null);
