// Comportamiento compartido de los bocetos (no es el código de la app).
const ic = (id, clase = '') => `<svg class="ic ${clase}" aria-hidden="true"><use href="iconos.svg#${id}"/></svg>`;

const circuloIconos = () => `${ic('check-bold', 'i-check')}${ic('arrow-right-bold', 'i-salteada')}${ic('clock', 'i-reloj')}`;
const circulo = () => `<span class="estado"><i>${circuloIconos()}</i></span>`;

function fila({ nombre, linea, estado }) {
  return `<button class="fila" data-estado="${estado}">${circulo()}<span class="texto"><span class="nombre">${nombre}</span><span class="linea">${linea}</span></span></button>`;
}

// Contador − y +. Devuelve get y set.
function contador(el, { valor, min, max, paso, unidad, alCambiar }) {
  el.innerHTML = `<button data-menos aria-label="Menos">${ic('minus-bold')}</button>
    <div class="cifra"><b class="num"></b><span></span></div>
    <button data-mas aria-label="Más">${ic('plus-bold')}</button>`;
  const menos = el.querySelector('[data-menos]'), mas = el.querySelector('[data-mas]');
  const cifra = el.querySelector('.cifra');
  const pintar = () => {
    cifra.querySelector('b').textContent = valor;
    cifra.querySelector('span').textContent = typeof unidad === 'function' ? unidad(valor) : unidad;
    cifra.classList.remove('cambia'); void cifra.offsetWidth; cifra.classList.add('cambia');
    menos.disabled = valor - paso < min; mas.disabled = valor + paso > max;
    alCambiar && alCambiar(valor);
  };
  menos.onclick = () => { valor -= paso; pintar(); };
  mas.onclick = () => { valor += paso; pintar(); };
  pintar();
  return { get: () => valor, set: v => { valor = v; pintar(); } };
}

// Elegir 1 entre pastillas o círculos: lo elegido queda blanco lleno.
function elegir(el, alCambiar) {
  const ops = [...el.querySelectorAll('button')];
  const marcar = (op, avisar = true) => {
    ops.forEach(b => b.setAttribute('aria-pressed', b.dataset.op === op));
    avisar && alCambiar && alCambiar(op);
  };
  ops.forEach(b => b.onclick = () => marcar(b.dataset.op));
  return { marcar };
}

// Íconos de tarea: Phosphor rellenos, de la casa (la lista corta de la hoja)
const ICONOS_TAREA = [
  ['check-circle', 'Tarea'], ['broom', 'Escoba'], ['bowl-food', 'Platos'], ['bed', 'Cama'],
  ['t-shirt', 'Remera'], ['washing-machine', 'Lavarropas'], ['coat-hanger', 'Percha'], ['carrot', 'Verdura'],
  ['shopping-cart', 'Carrito'], ['bathtub', 'Bañera'], ['toilet', 'Inodoro'], ['drop', 'Gota'],
  ['spray-bottle', 'Rociador'], ['trash', 'Basura'], ['cooking-pot', 'Olla'], ['plant', 'Planta'],
];

function abrirHoja(hoja) { hoja.classList.add('abierta'); }
function cerrarHoja(hoja) { hoja.classList.remove('abierta'); }

// Barra de pestañas (en los bocetos, Ajustes lleva a la portada)
function pestanas(actual) {
  const p = [['hoy', 'sun', 'Hoy', 'hoy.html'], ['tareas', 'list-checks', 'Tareas', 'tareas.html'], ['ajustes', 'gear-six', 'Ajustes', 'index.html']];
  const nav = document.createElement('nav');
  nav.className = 'pestanas';
  nav.innerHTML = p.map(([id, icono, nombre, href]) =>
    `<a href="${href}" ${id === actual ? 'aria-current="page"' : ''}>${ic(id === actual ? icono + '-fill' : icono)}${nombre}</a>`).join('');
  document.body.append(nav);
}
