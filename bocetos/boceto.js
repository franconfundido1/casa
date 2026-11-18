// Comportamiento compartido de los bocetos (no es el código de la app).
const ic = (id, clase = '') => `<svg class="ic ${clase}" aria-hidden="true"><use href="iconos.svg#${id}"/></svg>`;

const circulo = () => `<span class="estado"><i>${ic('check-bold', 'i-check')}${ic('arrow-right-bold', 'i-salteada')}${ic('clock', 'i-reloj')}</i></span>`;

function fila({ nombre, linea, estado }) {
  return `<button class="fila" data-estado="${estado}">${circulo()}<span class="texto"><span class="nombre">${nombre}</span><span class="linea">${linea}</span></span></button>`;
}

// Contador − y +. Devuelve una función para leer el valor.
function contador(el, { valor, min, max, paso, unidad, alCambiar }) {
  const menos = el.querySelector('[data-menos]'), mas = el.querySelector('[data-mas]');
  const cifra = el.querySelector('[data-valor]');
  const pintar = () => {
    cifra.textContent = typeof unidad === 'function' ? unidad(valor) : `${valor}${unidad || ''}`;
    cifra.classList.remove('cambia'); void cifra.offsetWidth; cifra.classList.add('cambia');
    menos.disabled = valor - paso < min; mas.disabled = valor + paso > max;
    alCambiar && alCambiar(valor);
  };
  menos.onclick = () => { valor -= paso; pintar(); };
  mas.onclick = () => { valor += paso; pintar(); };
  pintar();
  return { get: () => valor, set: v => { valor = v; pintar(); } };
}

// Selector: la marca se desliza a la opción elegida.
function selector(el, alCambiar) {
  const ops = [...el.querySelectorAll('button')];
  const marca = el.querySelector('.marca');
  marca.style.width = `calc((100% - 6px) / ${ops.length})`;
  const elegir = (i, avisar = true) => {
    ops.forEach((b, j) => b.setAttribute('aria-pressed', j === i));
    marca.style.transform = `translateX(${i * 100}%)`;
    avisar && alCambiar && alCambiar(ops[i].dataset.op);
  };
  ops.forEach((b, i) => b.onclick = () => elegir(i));
  return { elegir: op => elegir(ops.findIndex(b => b.dataset.op === op), false) };
}

function abrirHoja(hoja) { hoja.classList.add('abierta'); }
function cerrarHoja(hoja) { hoja.classList.remove('abierta'); }

function menu(boton, el) {
  const atrapa = document.createElement('div');
  atrapa.className = 'atrapa'; document.body.append(atrapa);
  const cerrar = () => { el.classList.remove('abierto'); atrapa.classList.remove('abierto'); };
  boton.onclick = () => {
    const r = boton.getBoundingClientRect();
    el.style.top = `${r.bottom + 8}px`;
    el.style.right = `${innerWidth - r.right}px`;
    el.classList.add('abierto'); atrapa.classList.add('abierto');
  };
  atrapa.onclick = cerrar;
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', cerrar));
}

// Barra de pestañas
function pestanas(actual) {
  const p = [['hoy', 'sun', 'Hoy', 'hoy.html'], ['tareas', 'list-checks', 'Tareas', 'tareas.html'], ['ajustes', 'gear-six', 'Ajustes', '#']];
  const nav = document.createElement('nav');
  nav.className = 'pestanas';
  nav.innerHTML = p.map(([id, icono, nombre, href]) =>
    `<a href="${href}" ${id === actual ? 'aria-current="page"' : ''}>${ic(id === actual ? icono + '-fill' : icono)}${nombre}</a>`).join('');
  nav.querySelector('a[href="#"]').onclick = e => e.preventDefault();
  document.body.append(nav);
}
