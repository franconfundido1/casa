// Hoy: las 3 de hoy, «Tengo X minutos» y la tarea en curso, de a 1.
// Las reglas (cuáles son las 3, qué entra, el orden) son de reglas/hoy.js; acá solo se dibuja y se guarda.

const listaHoy = document.getElementById('lista-hoy');
const empezarBtn = document.getElementById('empezar');
const minutosEl = document.getElementById('minutos');
let minutos = 20;

// La 1.ª vez del día elige las 3 de hoy (después quedan fijas hasta mañana); si les falta lugar, se completan.
function prepararDia() {
  const antes = estado;
  estado = completarLasTres(asegurarLasTres(estado, hoyLocal()), hoyLocal());
  if (estado !== antes) guardarDatos();
}

// Hoy: para hoy (las de 1 vez), las 3 de hoy y, si esas ya no tienen nada pendiente, también tocan.
function pintarHoy() {
  const hoy = hoyLocal();
  const conEstado = t => estadoDelDia(estado.historial, t.id, hoy) || 'toca';
  const unaVez = paraHoyUnaVez(estado.tareas, estado.historial, hoy).map(t => filaTarea(t, conEstado(t), lineaUnaVez(t, hoy)));
  const tres = lasTres(estado).map(t => filaTarea(t, conEstado(t), `${t.minutos} min`));
  const mas = tambienTocan(estado, hoy).map(t => filaTarea(t, 'toca', `${t.minutos} min`));
  const titulo = diaCumplido(estado, hoy) ? 'las 3 de hoy · cumplido' : 'las 3 de hoy';
  listaHoy.innerHTML = unaVez.length || tres.length || mas.length
    ? '<div class="lista">' + seccionFilas('para hoy', unaVez) + seccionFilas(titulo, tres) + seccionFilas('también tocan', mas) + '</div>'
    : '<p class="nada lista">Hoy no toca nada.</p>';
  pintarTengo();
}

// «Tengo X minutos»: los minutos que no alcanzan para ninguna tarea van apagados; si el elegido quedó apagado,
// pasa al más chico que alcanza. Sin ninguno, «Empezar» apagado.
function pintarTengo() {
  const lista = paraOfrecer(estado, hoyLocal());
  const botones = [...minutosEl.querySelectorAll('button')];
  const posibles = minutosPosibles(lista, botones.map(b => +b.dataset.op));
  if (!posibles.includes(minutos) && posibles.length) minutos = posibles[0];
  botones.forEach(b => {
    b.disabled = !posibles.includes(+b.dataset.op);
    b.setAttribute('aria-pressed', posibles.length > 0 && +b.dataset.op === minutos);
  });
  empezarBtn.disabled = !posibles.length;
}

function pintarTodo() { prepararDia(); pintarHoy(); pintarTareas(); }

minutosEl.addEventListener('click', e => {
  const b = e.target.closest('button[data-op]');
  if (!b) return;
  minutos = +b.dataset.op;
  minutosEl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  pintarTengo();
});

listaHoy.addEventListener('click', e => {
  const fila = e.target.closest('.fila');
  if (!fila || !e.target.closest('[data-circulo]')) return;
  const tarea = estado.tareas.find(t => t.id === fila.dataset.id);
  if (tarea) tocarCirculo(fila, tarea);
});

// ---- La tarea en curso, de a 1

const hojaCurso = document.getElementById('hoja-curso');
const curso = document.getElementById('curso');
const cuenta = document.getElementById('cuenta');
let elegidas = [], paso = 0, resultados = [];

function pintarTareaEnCurso(entrando) {
  const t = elegidas[paso];
  cuenta.textContent = `${paso + 1} de ${elegidas.length}`;
  curso.innerHTML = `
    <div class="tarea ${entrando ? 'entra' : ''}" data-estado="toca">
      <h3>${escapar(t.nombre)}</h3>
      <p class="num">${t.minutos} min</p>
      <button class="estado" data-r="hecha" aria-label="Hecha"><i>${ic(t.icono + '-fill', 'i-tarea')}${iconosEstado()}</i></button>
      <div class="etiqueta">hecha</div>
    </div>
    <div class="otras">
      <button class="boton-texto" data-r="a-medias">A medias</button>
      <button class="boton-texto" data-r="salteada">Saltear</button>
    </div>`;
  const tarea = curso.querySelector('.tarea');
  if (entrando) requestAnimationFrame(() => requestAnimationFrame(() => tarea.classList.remove('entra')));
  curso.querySelectorAll('[data-r]').forEach(b => { b.onclick = () => marcarEnCurso(t, b.dataset.r, tarea); });
}

const ETIQUETAS = { 'hecha': 'hecha', 'a-medias': 'a medias', 'salteada': 'salteada' };
function marcarEnCurso(t, r, tarea) {
  curso.querySelectorAll('[data-r]').forEach(b => { b.disabled = true; });
  const hoy = hoyLocal();
  estado = r === 'hecha' ? marcarHecha(estado, t.id, hoy) : r === 'a-medias' ? marcarAMedias(estado, t.id, hoy) : marcarSalteada(estado, t.id, hoy);
  guardarDatos();
  tarea.dataset.estado = r;
  tarea.querySelector('.etiqueta').textContent = ETIQUETAS[r];
  resultados.push([t, r]);
  setTimeout(() => {
    tarea.classList.add('sale');
    setTimeout(() => {
      paso++;
      if (paso < elegidas.length) pintarTareaEnCurso(true); else pintarFin();
    }, 250);
  }, 700);
}

function pintarFin() {
  cuenta.textContent = '';
  curso.innerHTML = `
    <div class="fin">
      <h3>listo por ahora</h3>
      <div>${resultados.map(([t, r]) => filaTarea(t, r, `${t.minutos} min`)).join('')}</div>
    </div>
    <button class="boton" id="listo">Cerrar</button>`;
  document.getElementById('listo').onclick = cerrarCurso;
}

function empezar() {
  const { entran } = queEntra(paraOfrecer(estado, hoyLocal()), minutos);
  if (!entran.length) return;
  elegidas = entran; paso = 0; resultados = [];
  pintarTareaEnCurso(false);
  hojaCurso.classList.add('abierta');
}
function cerrarCurso() {
  hojaCurso.classList.remove('abierta');
  pintarTodo();
}
empezarBtn.onclick = empezar;
document.getElementById('cerrar-curso').onclick = cerrarCurso;
document.getElementById('velo-curso').onclick = cerrarCurso;
