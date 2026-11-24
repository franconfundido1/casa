'use strict';
// Bocetos de la tablet: datos de ejemplo y comportamiento (no es el código de la app).
// Datos: miércoles 18 de noviembre, 18:40, como los bocetos del iPhone. La ropa se metió a las 18:00.

const ic = (id, clase = '') => `<svg class="ic ${clase}" aria-hidden="true"><use href="../iconos.svg#${id}"/></svg>`;
const iconosEstado = () => ic('check-bold', 'i-check') + ic('arrow-right-bold', 'i-salteada') + ic('clock', 'i-reloj');
const $ = id => document.getElementById(id);
const vertical = matchMedia('(max-width: 839px)');

const ICONOS_TAREA = [
  ['check-circle', 'Tarea'], ['broom', 'Escoba'], ['bowl-food', 'Platos'], ['bed', 'Cama'],
  ['t-shirt', 'Remera'], ['washing-machine', 'Lavarropas'], ['coat-hanger', 'Percha'], ['carrot', 'Verdura'],
  ['shopping-cart', 'Carrito'], ['bathtub', 'Bañera'], ['toilet', 'Inodoro'], ['drop', 'Gota'],
  ['spray-bottle', 'Rociador'], ['trash', 'Basura'], ['cooking-pot', 'Olla'], ['plant', 'Planta'],
];

// ---- Los datos
// hoy: lo que pasó hoy (null, 'hecha', 'a-medias' o 'salteada'). Las repetitivas llevan min y max (días) y hace cuántos días
// se hicieron («ultima»); las de 1 vez, «cuando»: 'ayer' (atrasada), 'hoy', 'manana' o un día que todavía no llegó.
const tareas = [
  { id: 'plomero', nombre: 'Llamar al plomero', icono: 'toilet', minutos: 5, unaVez: true, cuando: 'ayer', hoy: null },
  { id: 'cocinar', nombre: 'Cocinar para el finde', icono: 'cooking-pot', minutos: 60, unaVez: true, cuando: '2026-11-20', hoy: null },
  { id: 'cama', nombre: 'Hacer la cama', icono: 'bed', minutos: 3, min: 1, max: 1, ultima: 0, hoy: 'hecha' },
  { id: 'platos', nombre: 'Lavar los platos', icono: 'bowl-food', minutos: 10, min: 1, max: 1, ultima: 0, hoy: 'hecha' },
  { id: 'lavar', nombre: 'Lavar la ropa', icono: 'washing-machine', minutos: 5, min: 3, max: 4, ultima: 0, hoy: 'hecha' },
  { id: 'barrer', nombre: 'Barrer', icono: 'broom', minutos: 10, min: 3, max: 3, ultima: 4, hoy: null },
  { id: 'bano', nombre: 'Limpiar el baño', icono: 'bathtub', minutos: 20, min: 7, max: 7, ultima: 8, hoy: null },
  { id: 'ordenar', nombre: 'Ordenar la ropa', icono: 't-shirt', minutos: 10, min: 2, max: 2, ultima: 2, hoy: null },
  { id: 'verdu', nombre: 'Verdulería', icono: 'carrot', minutos: 20, min: 3, max: 4, ultima: 4, hoy: null },
  { id: 'trapo', nombre: 'Pasar el trapo', icono: 'drop', minutos: 20, min: 7, max: 7, ultima: 4, hoy: null },
  { id: 'super', nombre: 'Súper', icono: 'shopping-cart', minutos: 60, min: 7, max: 7, ultima: 2, hoy: null },
];
// Las 3 de hoy, elegidas a la mañana (la cama ya está hecha)
const LAS3 = ['cama', 'barrer', 'bano'];
const buscar = id => tareas.find(t => t.id === id);

// ---- Las reglas, simplificadas (las de verdad están en codigo/reglas/)
const toca = t => !t.unaVez && (t.ultima === null || t.ultima >= t.min);
const vencimiento = t => (t.ultima === null ? Infinity : t.ultima / t.max);
const paraHoyUnaVez = t => t.unaVez && ['ayer', 'hoy'].includes(t.cuando);
const porVencimiento = (a, b) => (vencimiento(b) - vencimiento(a)) || (a.minutos - b.minutos);

// Lo que se ofrece: las de 1 vez (las atrasadas primero), las 3 de hoy y después lo más vencido.
function paraOfrecer() {
  const libres = t => t.hoy === null;
  const unaVez = tareas.filter(t => paraHoyUnaVez(t) && libres(t)).sort((a, b) => (a.cuando === 'ayer' ? -1 : 0) - (b.cuando === 'ayer' ? -1 : 0));
  const tres = LAS3.map(buscar).filter(t => t && toca(t) && libres(t));
  const resto = tareas.filter(t => toca(t) && libres(t) && !LAS3.includes(t.id)).sort(porVencimiento);
  return unaVez.concat(tres, resto);
}
// «Tengo X minutos»: recorre la lista en orden y se queda con las que entran.
function queEntra(lista, minutos) {
  let queda = minutos;
  return lista.filter(t => (t.minutos <= queda ? ((queda -= t.minutos), true) : false));
}

// ---- Textos
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dia = s => new Date(s + 'T12:00:00');
const fechaLarga = s => { const f = dia(s); return `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`; };
const frecuencia = t => (t.min === 1 && t.max === 1 ? 'todos los días' : t.min === t.max ? `cada ${t.min} días` : `cada ${t.min} a ${t.max} días`);
const lineaUnaVez = t => `${t.minutos} min` + (t.cuando === 'ayer' ? ' · <span class="atraso">de ayer</span>' : '');
const lineaHoy = t => (t.unaVez ? lineaUnaVez(t) : `${t.minutos} min`);
const horaTexto = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

function fila(t, estado, linea) {
  return `<button class="fila" data-id="${t.id}" data-estado="${estado}">` +
    `<span class="estado" data-circulo><i>${ic(t.icono + '-fill', 'i-tarea')}${iconosEstado()}</i></span>` +
    `<span class="texto"><span class="nombre">${t.nombre}</span><span class="linea">${linea}</span></span></button>`;
}
// La fila sale de la lista (se achica y cierra su lugar) y después, «despues».
function sacarFila(f, despues) {
  f.style.height = f.offsetHeight + 'px';
  void f.offsetHeight;
  f.classList.add('sale');
  f.style.height = '0px';
  f.style.minHeight = '0px';
  setTimeout(despues, 300);
}
const entrarFila = id => document.querySelectorAll(`.fila[data-id="${id}"]`).forEach(f => f.classList.add('entra'));

// ---- Controles: contador − y + con la lista de valores; pastillas para elegir 1
function contador(el, { valores, unidad = '', mostrar, alCambiar }) {
  el.innerHTML = `<button data-menos aria-label="Menos">${ic('minus-bold')}</button>` +
    `<div class="cifra"><b class="num"></b><span></span></div><button data-mas aria-label="Más">${ic('plus-bold')}</button>`;
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
const VALORES_MINUTOS = [...desdeHasta(1, 10), 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120, 150, 180];
const NUNCA = -1;

function abrirHoja(h) { h.classList.add('abierta'); }
function cerrarHoja(h) { h.classList.remove('abierta'); }

// ---- El ícono de la tarea: 1 hoja para todas las tareas
let alElegirIcono = null;
function abrirIconos(actual, alElegir) {
  alElegirIcono = alElegir;
  $('grilla-iconos').innerHTML = ICONOS_TAREA.map(([id, nombre]) =>
    `<button data-id="${id}" aria-pressed="${id === actual}" aria-label="${nombre}">${ic(id + '-fill')}</button>`).join('');
  abrirHoja($('hoja-iconos'));
}
$('grilla-iconos').addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  $('grilla-iconos').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  if (alElegirIcono) alElegirIcono(b.dataset.id);
  setTimeout(() => cerrarHoja($('hoja-iconos')), 150);
});

// ---- La tarea (la hoja de «nuevo hábito» de la app): se usa en el detalle de Tareas y en «Anotar»
function armarTarea(cont, t, alCambiar) {
  cont.innerHTML = `
    <div class="form">
      <button class="firma" aria-label="Cambiar el ícono"></button>
      <input class="nombre-tarea" placeholder="nombrá la tarea" autocomplete="off" maxlength="40" enterkeyhint="done">
      <div class="rayita"></div>
      <div class="bloque-hoja">
        <div class="cabeza" aria-label="Frecuencia">${ic('repeat')}</div>
        <div class="pastillas" data-modo>
          <button data-op="cada">Cada</button><button data-op="entre">Entre</button><button data-op="unavez">1 vez</button>
        </div>
        <div class="pastillas" data-fecha>
          <button data-op="hoy">Hoy</button><button data-op="manana">Mañana</button>
          <label class="elegir-fecha" data-op="elegir"><span>Elegir</span><input type="date" min="2026-11-18"></label>
        </div>
        <div class="contadores"><div class="contador" data-desde></div><div class="contador" data-hasta></div></div>
      </div>
      <div class="par">
        <div class="bloque-hoja"><div class="cabeza" aria-label="Minutos">${ic('timer')}</div><div class="contador" data-min></div></div>
        <div class="bloque-hoja" data-bloque-ultima><div class="cabeza" aria-label="Última vez">${ic('clock-counter-clockwise')}</div><div class="contador" data-ultima></div></div>
      </div>
    </div>`;
  const q = s => cont.querySelector(s);
  let icono = t.icono, modo = t.unaVez ? 'unavez' : t.min === t.max ? 'cada' : 'entre';
  let fecha = t.unaVez ? t.cuando : 'hoy'; // 'ayer' (atrasada) se ve como «Hoy» y sigue atrasada si no la cambiás
  let armando = true;
  const avisar = () => { if (!armando) alCambiar(); };
  const nombre = q('.nombre-tarea');
  nombre.value = t.nombre;
  nombre.oninput = avisar;

  const firma = q('.firma');
  const pintarIcono = () => { firma.innerHTML = ic(icono + '-fill') + `<span class="lapiz">${ic('pencil-simple-fill')}</span>`; };
  firma.onclick = () => abrirIconos(icono, id => { icono = id; pintarIcono(); avisar(); });

  const cMin = contador(q('[data-min]'), { valores: VALORES_MINUTOS, unidad: 'minutos', alCambiar: avisar });
  const cDesde = contador(q('[data-desde]'), {
    valores: desdeHasta(1, 60), unidad: n => (modo === 'cada' ? (n === 1 ? 'día' : 'días') : 'desde'),
    alCambiar: () => { cHasta.limites(desdeHasta(cDesde.get() + 1, 61)); avisar(); },
  });
  const cHasta = contador(q('[data-hasta]'), { valores: desdeHasta(2, 61), unidad: 'hasta', alCambiar: avisar });
  const cUltima = contador(q('[data-ultima]'), {
    valores: [NUNCA, ...desdeHasta(0, 60)], alCambiar: avisar,
    mostrar: v => (v === NUNCA ? 'nunca' : v === 0 ? 'hoy' : v === 1 ? 'ayer' : v), unidad: v => (v >= 2 ? 'días atrás' : ''),
  });

  const pintarFecha = () => {
    const cual = ['ayer', 'hoy'].includes(fecha) ? 'hoy' : fecha === 'manana' ? 'manana' : 'elegir';
    q('[data-fecha]').querySelectorAll('[data-op]').forEach(b => b.setAttribute('aria-pressed', b.dataset.op === cual));
    q('.elegir-fecha span').textContent = cual === 'elegir' ? `${DIAS_CORTOS[dia(fecha).getDay()]} ${dia(fecha).getDate()}` : 'Elegir';
  };
  const pintarModo = () => {
    q('[data-modo]').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.op === modo));
    const unaVez = modo === 'unavez';
    q('[data-fecha]').hidden = !unaVez;
    q('.contadores').hidden = unaVez;
    q('[data-bloque-ultima]').hidden = unaVez;
    q('.par').classList.toggle('solo', unaVez);
    q('[data-hasta]').hidden = modo === 'cada';
    cDesde.set(cDesde.get());
    pintarFecha();
  };
  q('[data-modo]').onclick = e => {
    const b = e.target.closest('button[data-op]');
    if (!b || b.dataset.op === modo) return;
    modo = b.dataset.op;
    pintarModo();
    avisar();
  };
  q('[data-fecha]').onclick = e => {
    const b = e.target.closest('button[data-op]');
    if (!b) return;
    fecha = b.dataset.op;
    pintarFecha();
    avisar();
  };
  q('.elegir-fecha input').onchange = e => { if (e.target.value) { fecha = e.target.value; pintarFecha(); avisar(); } };

  cMin.set(t.minutos);
  cDesde.set(t.unaVez ? 3 : t.min);
  cHasta.limites(desdeHasta(cDesde.get() + 1, 61));
  cHasta.set(!t.unaVez && t.max > t.min ? t.max : cDesde.get() + 1);
  cUltima.set(t.unaVez || t.ultima === null || t.ultima === undefined ? NUNCA : t.ultima);
  pintarIcono();
  pintarModo();
  armando = false;

  const leer = () => {
    const base = { nombre: nombre.value.trim(), icono, minutos: cMin.get() };
    if (modo === 'unavez') return { ...base, unaVez: true, cuando: fecha };
    return { ...base, unaVez: false, min: cDesde.get(), max: modo === 'entre' ? cHasta.get() : cDesde.get(), ultima: cUltima.get() === NUNCA ? null : cUltima.get() };
  };
  return { leer, nombre };
}
const firmaDe = t => JSON.stringify(t);

// ---- Hoy
let minutos = 20;
let tresAntes = {};
function pintarHoy(fundir = false) {
  const lista = paraOfrecer();
  const botones = [...$('minutos').querySelectorAll('button')];
  const posibles = botones.map(b => +b.dataset.op).filter(m => queEntra(lista, m).length);
  if (!posibles.includes(minutos) && posibles.length) minutos = posibles[0];
  botones.forEach(b => {
    b.disabled = !posibles.includes(+b.dataset.op);
    b.setAttribute('aria-pressed', posibles.length > 0 && +b.dataset.op === minutos);
  });
  $('empezar').disabled = !posibles.length;
  const entran = queEntra(lista, minutos);
  const algoHecho = tareas.some(t => t.hoy === 'hecha');
  $('hoy-lista').innerHTML = entran.length
    ? `<div class="lista${fundir ? ' fundir' : ''}">${entran.map(t => fila(t, 'toca', lineaHoy(t))).join('')}</div>`
    : `<p class="nada lista fundir">${algoHecho ? 'Nada más por hoy.' : 'Hoy no toca nada.'}</p>`;
  // Sin las 3 a la vista: con todo lo del día hecho, el círculo grande en vez de los minutos
  const cumplido = !document.body.classList.contains('con-tres') && !lista.length && algoHecho;
  if (cumplido && $('cumplido').hidden) {
    $('cumplido').innerHTML = `<span class="estado"><i>${iconosEstado()}</i></span><p>día cumplido</p>`;
    $('cumplido').dataset.estado = 'hecha';
  }
  $('cumplido').hidden = !cumplido;
  $('tengo').hidden = cumplido;
  pintarTres();
}

// Las 3 de hoy, a la vista: al hacer las 3, «día cumplido» (la regla de diaCumplido), aunque quede algo más
function pintarTres() {
  const tres = LAS3.map(buscar).filter(Boolean);
  const cumplido = tres.length > 0 && tres.every(t => t.hoy === 'hecha');
  const yaEstaba = Object.keys(tresAntes).length && tres.every(t => tresAntes[t.id] === 'hecha');
  $('tres-circulos').innerHTML = tres.map(t => {
    const estado = t.hoy || 'toca';
    const recien = Object.keys(tresAntes).length && tresAntes[t.id] !== estado && estado !== 'toca';
    return `<div class="uno${recien ? ' premio' : ''}" data-estado="${estado}"><span class="estado"><i>${ic(t.icono + '-fill', 'i-tarea')}${iconosEstado()}</i></span></div>`;
  }).join('');
  if (cumplido && !yaEstaba && Object.keys(tresAntes).length) {
    $('tres-circulos').querySelectorAll('.uno').forEach((u, i) => {
      u.classList.remove('premio');
      setTimeout(() => u.classList.add('premio'), 120 + i * 90);
    });
  }
  $('tres-pie').textContent = cumplido ? 'día cumplido' : '';
  tresAntes = Object.fromEntries(tres.map(t => [t.id, t.hoy || 'toca']));
}

$('espera').innerHTML = `${ic('clock')}Colgar la ropa, desde las 19:30`;
$('minutos').addEventListener('click', e => {
  const b = e.target.closest('button[data-op]');
  if (!b) return;
  minutos = +b.dataset.op;
  pintarHoy(true);
});

// Marcar hecha tocando el círculo, en Hoy: se llena con el premio y la fila sale
const marcarHecha = t => { if (!t.unaVez) { t.ultimaAntes = t.ultima; t.ultima = 0; } t.hoy = 'hecha'; };
const desmarcar = t => { if (!t.unaVez && 'ultimaAntes' in t) t.ultima = t.ultimaAntes; t.hoy = null; };
$('hoy-lista').addEventListener('click', e => {
  if (enCurso) return;
  const f = e.target.closest('.fila');
  if (!f || !e.target.closest('[data-circulo]')) return;
  const t = buscar(f.dataset.id);
  marcarHecha(t);
  f.dataset.estado = 'hecha';
  f.classList.add('premio');
  pintarTres();
  setTimeout(() => sacarFila(f, () => { pintarHoy(); pintarTareas(); }), 320);
});

// ---- La tarea en curso, de a 1, en el panel principal (en vertical, en una hoja)
const curso = $('curso'), cuerpoCurso = $('curso-cuerpo');
let elegidas = [], paso = 0, enCurso = false;

function marcarActual() {
  $('hoy-lista').querySelectorAll('.fila').forEach(f => {
    if (paso < elegidas.length && f.dataset.id === elegidas[paso].id) f.setAttribute('aria-current', 'true');
    else f.removeAttribute('aria-current');
  });
}
function pintarTareaEnCurso(entrando) {
  const t = elegidas[paso];
  $('cuenta').textContent = `${paso + 1} de ${elegidas.length}`;
  cuerpoCurso.innerHTML = `
    <div class="tarea${entrando ? ' entra' : ''}" data-estado="toca">
      <h3>${t.nombre}</h3>
      <p class="num">${t.minutos} min</p>
      <button class="estado" data-r="hecha" aria-label="Hecha"><i>${ic(t.icono + '-fill', 'i-tarea')}${iconosEstado()}</i></button>
    </div>
    <div class="otras">
      <button class="boton-texto" data-r="a-medias">A medias</button>
      <button class="boton-texto" data-r="salteada">Saltear</button>
    </div>`;
  const tarea = cuerpoCurso.querySelector('.tarea');
  if (entrando) requestAnimationFrame(() => requestAnimationFrame(() => tarea.classList.remove('entra')));
  cuerpoCurso.querySelectorAll('[data-r]').forEach(b => { b.onclick = () => marcarEnCurso(t, b.dataset.r, tarea); });
  marcarActual();
}
function marcarEnCurso(t, r, tarea) {
  cuerpoCurso.querySelectorAll('[data-r]').forEach(b => { b.disabled = true; });
  if (r === 'hecha') marcarHecha(t); else t.hoy = r;
  tarea.dataset.estado = r;
  // la lista de la izquierda sigue lo que pasa: la fila toma el estado, con el premio
  const f = $('hoy-lista').querySelector(`.fila[data-id="${t.id}"]`);
  if (f) { f.dataset.estado = r; f.classList.add('premio'); }
  setTimeout(() => {
    tarea.classList.add('sale');
    setTimeout(() => {
      paso++;
      if (paso < elegidas.length) pintarTareaEnCurso(true); else pintarFin();
    }, 250);
  }, 700);
}
function pintarFin() {
  $('cuenta').textContent = '';
  marcarActual();
  cuerpoCurso.innerHTML = `<div class="fin"><h3>listo por ahora</h3><button class="boton" id="listo">Cerrar</button></div>`;
  $('listo').onclick = cerrarCurso;
}
function empezar() {
  elegidas = queEntra(paraOfrecer(), minutos);
  if (!elegidas.length) return;
  paso = 0;
  enCurso = true;
  $('hoy-lista').classList.add('siguiendo');
  pintarTareaEnCurso(false);
  abrirHoja(curso);
}
function cerrarCurso() {
  enCurso = false;
  cerrarHoja(curso);
  $('hoy-lista').classList.remove('siguiendo');
  pintarHoy(true);
  pintarTareas();
}
$('empezar').onclick = empezar;
$('cerrar-curso').onclick = cerrarCurso;
$('velo-curso').onclick = cerrarCurso;

// ---- Tareas: lista y detalle
let elegida = 'verdu', formDetalle = null, original = '';
function grupos() {
  const sinHacer = t => t.hoy !== 'hecha';
  const atraso = t => (t.cuando === 'ayer' ? 0 : 1);
  return [
    ['para hoy', tareas.filter(t => paraHoyUnaVez(t) && sinHacer(t)).sort((a, b) => atraso(a) - atraso(b)), t => lineaUnaVez(t)],
    ['tocan', tareas.filter(t => toca(t) && sinHacer(t)).sort(porVencimiento), t => `${frecuencia(t)} · ${t.minutos} min`],
    ['más adelante', tareas.filter(t => !t.unaVez && !toca(t) && sinHacer(t)).sort((a, b) => (a.min - a.ultima) - (b.min - b.ultima)), t => `${frecuencia(t)} · ${t.minutos} min`],
    ['próximas', tareas.filter(t => t.unaVez && !paraHoyUnaVez(t) && sinHacer(t)), t => `${t.cuando === 'manana' ? 'mañana' : fechaLarga(t.cuando)} · ${t.minutos} min`],
    ['hechas hoy', tareas.filter(t => t.hoy === 'hecha'), t => (t.unaVez ? `${t.minutos} min` : `${frecuencia(t)} · ${t.minutos} min`)],
  ];
}
const estadoEnTareas = (grupo, t) => (grupo === 'hechas hoy' ? 'hecha' : ['más adelante', 'próximas'].includes(grupo) ? 'no' : t.hoy || 'toca');
function pintarTareas() {
  $('lista-tareas').innerHTML = '<div class="lista">' + grupos().map(([g, ts, linea]) => (ts.length
    ? `<section class="seccion" data-grupo="${g}"><div>${ts.map(t => fila(t, estadoEnTareas(g, t), linea(t))).join('')}</div></section>` : '')).join('') + '</div>';
  marcarElegida();
}
function marcarElegida() {
  $('lista-tareas').querySelectorAll('.fila').forEach(f => {
    if (f.dataset.id === elegida && !(vertical.matches && !$('detalle').classList.contains('abierta'))) f.setAttribute('aria-selected', 'true');
    else f.removeAttribute('aria-selected');
  });
}
function revisarGuardar() { $('guardar').disabled = !formDetalle.leer().nombre || firmaDe(formDetalle.leer()) === original; }
function pintarDetalle(fundir) {
  const t = buscar(elegida);
  if (!t) return;
  formDetalle = armarTarea($('detalle-cuerpo'), t, revisarGuardar);
  original = firmaDe(formDetalle.leer());
  $('guardar').disabled = true;
  reiniciarBorrar();
  $('detalle-cuerpo').scrollTop = 0;
  if (fundir) { $('detalle-cuerpo').classList.remove('fundir'); void $('detalle-cuerpo').offsetWidth; $('detalle-cuerpo').classList.add('fundir'); }
}
function elegir(id) {
  const cambia = id !== elegida;
  elegida = id;
  pintarDetalle(cambia);
  if (vertical.matches) abrirHoja($('detalle'));
  marcarElegida();
}
$('lista-tareas').addEventListener('click', e => {
  const f = e.target.closest('.fila');
  if (!f) return;
  const t = buscar(f.dataset.id);
  if (e.target.closest('[data-circulo]')) {
    const yaHecha = t.hoy === 'hecha';
    if (yaHecha) desmarcar(t); else marcarHecha(t);
    f.dataset.estado = yaHecha ? 'toca' : 'hecha';
    if (!yaHecha) f.classList.add('premio');
    setTimeout(() => sacarFila(f, () => { pintarTareas(); entrarFila(t.id); pintarHoy(); if (t.id === elegida) pintarDetalle(false); }), 320);
    return;
  }
  elegir(t.id);
});
function cerrarDetalle() { cerrarHoja($('detalle')); formDetalle.nombre.blur(); marcarElegida(); }
$('cerrar-detalle').onclick = cerrarDetalle;
$('velo-detalle').onclick = cerrarDetalle;
$('guardar').onclick = () => {
  const t = buscar(elegida);
  Object.assign(t, formDetalle.leer());
  if (!t.unaVez) delete t.cuando; else { delete t.min; delete t.max; }
  pintarTareas();
  pintarHoy();
  pintarDetalle(false);
  if (vertical.matches) cerrarDetalle();
};
// Borrar pide 2 toques: el 1.º avisa; si no se toca otra vez en 3 segundos, vuelve.
let borrarEspera = null;
function reiniciarBorrar() { clearTimeout(borrarEspera); borrarEspera = null; $('borrar').textContent = 'Borrar'; }
$('borrar').onclick = () => {
  if (!borrarEspera) { $('borrar').textContent = '¿Borrar?'; borrarEspera = setTimeout(reiniciarBorrar, 3000); return; }
  reiniciarBorrar();
  const i = tareas.findIndex(t => t.id === elegida);
  const f = $('lista-tareas').querySelector(`.fila[data-id="${elegida}"]`);
  tareas.splice(i, 1);
  const siguiente = tareas.find(t => toca(t) && t.hoy !== 'hecha') || tareas[0];
  if (vertical.matches) cerrarDetalle();
  const listo = () => { elegida = siguiente.id; pintarTareas(); pintarHoy(); pintarDetalle(true); };
  if (f) sacarFila(f, listo); else listo();
};

// ---- Anotar: el «+» del riel abre la tarea nueva en «1 vez · hoy», con el teclado en el nombre
let formAnotar = null;
$('anotar').onclick = () => {
  formAnotar = armarTarea($('anotar-cuerpo'), { nombre: '', icono: 'check-circle', minutos: 10, unaVez: true, cuando: 'hoy' },
    () => { $('guardar-anotar').disabled = !formAnotar.leer().nombre; });
  $('guardar-anotar').disabled = true;
  $('anotar-cuerpo').scrollTop = 0;
  abrirHoja($('hoja-anotar'));
  setTimeout(() => formAnotar.nombre.focus(), 320);
};
const cerrarAnotar = () => { formAnotar.nombre.blur(); cerrarHoja($('hoja-anotar')); };
$('cerrar-anotar').onclick = cerrarAnotar;
$('velo-anotar').onclick = cerrarAnotar;
$('guardar-anotar').onclick = () => {
  const nueva = { id: 'n' + Date.now().toString(36), hoy: null, ...formAnotar.leer() };
  tareas.push(nueva);
  cerrarAnotar();
  pintarHoy();
  pintarTareas();
  entrarFila(nueva.id);
};
$('anotar-cuerpo').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('.nombre-tarea') && !$('guardar-anotar').disabled) { e.preventDefault(); $('guardar-anotar').click(); }
});
$('cerrar-iconos').onclick = () => cerrarHoja($('hoja-iconos'));
$('velo-iconos').onclick = () => cerrarHoja($('hoja-iconos'));

// ---- Ajustes: los avisos (prender, apagar y la hora), el permiso que falta y la copia
const avisos = { plan: { on: true, hora: 9 * 60 }, falta: { on: true, hora: 19 * 60 } };
function pintarAvisos() {
  document.querySelectorAll('[data-aviso]').forEach(d => {
    const a = avisos[d.dataset.aviso];
    d.querySelector('[data-hora]').textContent = horaTexto(a.hora);
    d.querySelector('.interruptor').setAttribute('aria-checked', a.on);
    d.classList.toggle('apagado', !a.on);
  });
}
let horaDe = null;
const cHora = contador($('c-hora'), { valores: desdeHasta(12, 47).map(n => n * 30), mostrar: horaTexto });
$('avisos').addEventListener('click', e => {
  const d = e.target.closest('[data-aviso]');
  if (!d) return;
  const a = avisos[d.dataset.aviso];
  if (e.target.closest('.interruptor')) { a.on = !a.on; pintarAvisos(); return; }
  if (e.target.closest('[data-hora]')) { horaDe = a; cHora.set(a.hora); abrirHoja($('hoja-hora')); }
});
$('listo-hora').onclick = () => { horaDe.hora = cHora.get(); horaDe.on = true; pintarAvisos(); cerrarHoja($('hoja-hora')); };
$('cerrar-hora').onclick = () => cerrarHoja($('hoja-hora'));
$('velo-hora').onclick = () => cerrarHoja($('hoja-hora'));
// El permiso que falta: con «Permitir» se va a los Ajustes de Android; al volver, la fila se va
$('permitir').onclick = () => {
  const d = $('permiso');
  d.classList.add('sale');
  setTimeout(() => d.remove(), 260);
};
function avisarCopia(texto) {
  const n = $('nota-copia');
  n.textContent = '';
  void n.offsetWidth;
  n.textContent = texto;
}
$('bajar-copia').onclick = () => { $('ultima-copia').textContent = 'hoy'; avisarCopia('Copia guardada en Documentos: str3ak-copia-2026-11-18.json'); };
$('cargar-copia').onclick = () => abrirHoja($('hoja-copia'));
$('reemplazar').onclick = () => { cerrarHoja($('hoja-copia')); avisarCopia('Copia cargada.'); };
$('cerrar-copia').onclick = () => cerrarHoja($('hoja-copia'));
$('velo-copia').onclick = () => cerrarHoja($('hoja-copia'));

// ---- El riel: 1 pantalla por vez, con un fundido
const DESTINOS = [['hoy', 'sun', 'Hoy'], ['tareas', 'list-checks', 'Tareas'], ['ajustes', 'gear-six', 'Ajustes']];
$('destinos').querySelectorAll('button').forEach((b, i) => {
  const [, icono, nombre] = DESTINOS[i];
  b.innerHTML = `${ic(icono, 'contorno')}${ic(icono + '-fill', 'lleno')}${nombre}`;
});
function mostrar(vista) {
  document.querySelectorAll('.vista').forEach(v => { v.hidden = v.id !== vista; });
  $('destinos').querySelectorAll('button').forEach(b => {
    if (b.dataset.vista === vista) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  history.replaceState(null, '', '#' + vista);
}
$('destinos').addEventListener('click', e => {
  const b = e.target.closest('button[data-vista]');
  if (b && b.getAttribute('aria-current') !== 'page') mostrar(b.dataset.vista);
});
// Al girar la tablet: en horizontal, la tarea vuelve a su panel (sin la hoja)
vertical.addEventListener('change', () => { if (!vertical.matches) cerrarHoja($('detalle')); marcarElegida(); });

// ---- Los íconos de los botones
$('anotar').innerHTML = ic('plus-circle');
['cerrar-curso', 'cerrar-detalle', 'cerrar-anotar', 'cerrar-iconos', 'cerrar-hora', 'cerrar-copia'].forEach(id => { $(id).innerHTML = ic('x-bold'); });
document.querySelector('.ic-bajar').outerHTML = ic('download-simple');
document.querySelector('.ic-cargar').outerHTML = ic('upload-simple');

// ---- Portada: la variante (con o sin las 3 de hoy a la vista) y «Abrir», en pantalla completa
$('variante').onclick = e => {
  const b = e.target.closest('button[data-op]');
  if (!b) return;
  $('variante').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
};
$('abrir').onclick = () => {
  const con = $('variante').querySelector('[aria-pressed="true"]').dataset.op === 'con';
  document.body.classList.toggle('con-tres', con);
  tresAntes = {};
  pintarHoy();
  const pantalla = document.documentElement;
  if (pantalla.requestFullscreen) pantalla.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  $('portada').classList.add('sale');
  setTimeout(() => $('portada').remove(), 260);
};

pintarAvisos();
pintarHoy();
pintarTareas();
pintarDetalle(false);
if (['#tareas', '#ajustes'].includes(location.hash)) mostrar(location.hash.slice(1));
