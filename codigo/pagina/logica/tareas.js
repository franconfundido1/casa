// La pantalla Tareas: la lista (para hoy, tocan, más adelante, próximas, hechas hoy), marcar hecha y la hoja de tarea.
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

// El círculo de estado: ✓ (hecha), flecha (salteada) y la mitad (a medias, con CSS).
const iconosEstado = () => ic('check-bold', 'i-check') + ic('arrow-right-bold', 'i-salteada');

// En las listas, el ícono de la tarea va adentro de su círculo (1 sola cosa por fila).
function filaTarea(t, estadoFila, linea = lineaTarea(t)) {
  return `<button class="fila" data-id="${t.id}" data-estado="${estadoFila}">` +
    `<span class="estado" data-circulo><i>${ic(t.icono + '-fill', 'i-tarea')}${iconosEstado()}</i></span>` +
    `<span class="texto"><span class="nombre">${escapar(t.nombre)}</span><span class="linea">${linea}</span></span></button>`;
}

// Tocar el círculo marca hecha (la última vez pasa a ser hoy) o deshace lo de hoy. Sirve en Hoy y en Tareas.
function tocarCirculo(fila, tarea) {
  const hoy = hoyLocal();
  const yaHecha = ultimaVez(estado.historial, tarea.id) === hoy;
  estado = yaHecha ? desmarcarHecha(estado, tarea.id, hoy) : marcarHecha(estado, tarea.id, hoy);
  guardarDatos();
  // el círculo cambia ahí mismo; después se acomodan las listas
  fila.dataset.estado = yaHecha ? 'toca' : 'hecha';
  setTimeout(pintarTodo, 450);
}

// La línea de una de 1 vez para hoy: los minutos y, si está atrasada, «de ayer» o «hace N días» en blanco.
function lineaUnaVez(t, hoy) {
  const atraso = atrasoTexto(t.fecha, hoy);
  return `${t.minutos} min` + (atraso ? ` · <span class="atraso">${atraso}</span>` : '');
}

function seccionFilas(titulo, filas) {
  return filas.length ? `<section class="seccion"><h2>${titulo}</h2><div>${filas.join('')}</div></section>` : '';
}

function pintarTareas() {
  const hoy = hoyLocal();
  const g = agrupar(estado.tareas, estado.historial, hoy);
  const conEstado = t => estadoDelDia(estado.historial, t.id, hoy) || 'toca';
  listaTareas.innerHTML = '<div class="lista">' +
    seccionFilas('para hoy', paraHoyUnaVez(estado.tareas, estado.historial, hoy).map(t => filaTarea(t, conEstado(t), lineaUnaVez(t, hoy)))) +
    seccionFilas('tocan', g.tocan.map(t => filaTarea(t, conEstado(t)))) +
    seccionFilas('más adelante', g.adelante.map(t => filaTarea(t, 'no'))) +
    seccionFilas('próximas', proximasUnaVez(estado.tareas, estado.historial, hoy).map(t => filaTarea(t, 'no', `${cuandoTexto(t.fecha, hoy)} · ${t.minutos} min`))) +
    seccionFilas('hechas hoy', g.hechas.map(t => filaTarea(t, 'hecha'))) +
    '</div>';
}

// Tocar el círculo marca hecha (o deshace la de hoy); tocar la fila abre la hoja.
listaTareas.addEventListener('click', e => {
  const fila = e.target.closest('.fila');
  if (!fila) return;
  const tarea = estado.tareas.find(t => t.id === fila.dataset.id);
  if (!tarea) return;
  if (e.target.closest('[data-circulo]')) { tocarCirculo(fila, tarea); return; }
  abrirHojaTarea(tarea);
});

// ---- Controles de la hoja

// Contador − y +, con la lista de valores posibles. Devuelve get, set y la forma de cambiar los límites.
function contador(el, { valores, unidad, mostrar, alCambiar }) {
  el.innerHTML = `<button data-menos aria-label="Menos">${ic('minus-bold')}</button>` +
    `<div class="cifra"><b class="num"></b><span></span></div>` +
    `<button data-mas aria-label="Más">${ic('plus-bold')}</button>`;
  const menos = el.querySelector('[data-menos]'), mas = el.querySelector('[data-mas]'), cifra = el.querySelector('.cifra');
  let lista = valores, valor = valores[0];
  const pintar = (avisar = true) => {
    cifra.querySelector('b').textContent = mostrar ? mostrar(valor) : valor;
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
// Última vez: nunca (-1), hoy (0), ayer (1), y hasta 60 días atrás. Arranca en «nunca»: con el + se llega rápido a «hace 2 días».
const NUNCA = -1;
const VALORES_ULTIMA = [NUNCA, ...desdeHasta(0, 60)];

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
const fechaEl = document.getElementById('fecha-unavez');
const fechaElegir = document.getElementById('fecha-elegir');
let enEdicion = null, icono = 'check-circle', modo = 'cada', fechaUnaVez = null, original = '', ultimaOriginal = NUNCA, armando = false;

const cMinutos = contador(document.getElementById('c-minutos'), { valores: VALORES_MINUTOS, unidad: 'minutos', alCambiar: revisar });
const cDesde = contador(document.getElementById('c-desde'), {
  valores: VALORES_DIAS, unidad: n => (modo === 'cada' ? (n === 1 ? 'día' : 'días') : 'desde'),
  alCambiar: () => { ajustarHasta(); pintarNota(); revisar(); },
});
const cHasta = contador(document.getElementById('c-hasta'), { valores: VALORES_DIAS, unidad: 'hasta', alCambiar: () => { pintarNota(); revisar(); } });
const cUltima = contador(document.getElementById('c-ultima'), {
  valores: VALORES_ULTIMA, alCambiar: revisar,
  mostrar: v => (v === NUNCA ? 'nunca' : v === 0 ? 'hoy' : v === 1 ? 'ayer' : v),
  unidad: v => (v >= 2 ? 'días atrás' : ''),
});

// Con «Entre», el máximo es siempre mayor que el mínimo.
function ajustarHasta() {
  cHasta.limites(desdeHasta(cDesde.get() + 1, 61));
}

function tareaDeLaHoja() {
  const base = { id: enEdicion ? enEdicion.id : 't' + Date.now().toString(36), nombre: nombreTarea.value, icono, minutos: cMinutos.get() };
  if (modo === 'unavez') return { ...base, unaVez: true, fecha: fechaUnaVez };
  const min = cDesde.get();
  return { ...base, min, max: modo === 'entre' ? cHasta.get() : min };
}
const firmaDe = t => JSON.stringify([t.nombre.trim(), t.icono, t.minutos, t.unaVez ? t.fecha : [t.min, t.max]]);

// «Guardar» se prende cuando la tarea está completa y cambió algo.
function revisar() {
  if (armando) return;
  const t = tareaDeLaHoja();
  const cambioUltima = modo !== 'unavez' && cUltima.get() !== ultimaOriginal;
  guardarBtn.disabled = !tareaValida(t) || (firmaDe(t) === original && !cambioUltima);
}

// 1 vez: el día, con «Hoy», «Mañana» o «Elegir» (el calendario del iPhone); un día elegido se ve en la pastilla.
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
function pintarFecha() {
  const hoy = hoyLocal(), manana = sumarDias(hoy, 1);
  const cual = fechaUnaVez === hoy ? 'hoy' : fechaUnaVez === manana ? 'manana' : 'elegir';
  fechaEl.querySelectorAll('[data-op]').forEach(b => b.setAttribute('aria-pressed', b.dataset.op === cual));
  const f = new Date(fechaUnaVez + 'T12:00:00');
  document.getElementById('texto-elegir').textContent = cual === 'elegir' ? `${DIAS_CORTOS[f.getDay()]} ${f.getDate()}` : 'Elegir';
  fechaElegir.min = hoy;
  fechaElegir.value = fechaUnaVez;
}
fechaEl.addEventListener('click', e => {
  const b = e.target.closest('button[data-op]');
  if (!b) return;
  fechaUnaVez = b.dataset.op === 'hoy' ? hoyLocal() : sumarDias(hoyLocal(), 1);
  pintarFecha();
  revisar();
});
fechaElegir.addEventListener('change', () => {
  if (!fechaElegir.value) return;
  fechaUnaVez = fechaElegir.value < hoyLocal() ? hoyLocal() : fechaElegir.value;
  pintarFecha();
  revisar();
});

// La nota de la frecuencia, solo con «Entre».
function pintarNota() {
  notaFrec.hidden = modo !== 'entre';
  notaFrec.textContent = `Toca a partir de los ${cDesde.get()} días; después de los ${cHasta.get()}, está atrasada.`;
}

function pintarModo() {
  modoEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.op === modo));
  // 1 vez: el día en vez de la frecuencia, y sin «última vez»
  const unaVez = modo === 'unavez';
  fechaEl.hidden = !unaVez;
  document.getElementById('contadores-frec').hidden = unaVez;
  document.getElementById('bloque-ultima').hidden = unaVez;
  if (unaVez) { if (!fechaUnaVez) fechaUnaVez = hoyLocal(); pintarFecha(); }
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

// t: la tarea a editar (o null para una nueva). unaVezHoy: la nueva arranca en «1 vez · hoy» (el «+» de Hoy).
function abrirHojaTarea(t, { unaVezHoy = false } = {}) {
  armando = true;
  enEdicion = t || null;
  const base = t || (unaVezHoy ? { nombre: '', icono: 'check-circle', minutos: 10, unaVez: true, fecha: hoyLocal() }
    : { nombre: '', icono: 'check-circle', minutos: 10, min: 3, max: 3 });
  nombreTarea.value = base.nombre;
  icono = base.icono;
  modo = base.unaVez ? 'unavez' : base.min === base.max ? 'cada' : 'entre';
  fechaUnaVez = base.unaVez ? base.fecha : null;
  cMinutos.set(base.minutos);
  cDesde.set(base.unaVez ? 3 : base.min);
  ajustarHasta();
  cHasta.set(!base.unaVez && base.max > base.min ? base.max : cDesde.get() + 1);
  pintarModo();
  pintarIcono();
  const d = t ? diasDesde(ultimaVez(estado.historial, t.id), hoyLocal()) : null;
  ultimaOriginal = d === null || d < 0 ? NUNCA : d;
  cUltima.set(ultimaOriginal);
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
// «Listo» en el teclado guarda (así anotar rápido es: «+», escribir y «Listo»)
nombreTarea.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  if (!guardarBtn.disabled) guardarBtn.click();
});
guardarBtn.onclick = () => {
  const t = tareaDeLaHoja();
  if (!tareaValida(t)) return;
  estado = guardarTarea(estado, t);
  // la última vez cargada a mano se suma al historial con esa fecha
  if (!t.unaVez && cUltima.get() !== ultimaOriginal) {
    estado = cargarUltimaVez(estado, t.id, cUltima.get() === NUNCA ? null : cUltima.get(), hoyLocal());
    // si todavía no empezaste con las 3 de hoy, se vuelven a elegir con la fecha nueva
    estado = reelegirSiNoEmpezo(estado, hoyLocal());
  }
  guardarDatos();
  cerrarHojaTarea();
  pintarTodo();
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
  pintarTodo();
};

document.getElementById('cerrar-tarea').onclick = cerrarHojaTarea;
document.getElementById('velo-tarea').onclick = cerrarHojaTarea;
document.getElementById('cerrar-iconos').onclick = () => cerrarHoja(hojaIconos);
document.getElementById('velo-iconos').onclick = () => cerrarHoja(hojaIconos);
// El «+» de la cabecera: en Hoy, anotar rápido (1 vez · hoy, con el teclado abierto); en Tareas, una tarea nueva.
document.getElementById('nueva-tarea').onclick = () => {
  if (pantallaActual === 'hoy') {
    abrirHojaTarea(null, { unaVezHoy: true });
    nombreTarea.focus();
  } else {
    abrirHojaTarea(null);
  }
};
