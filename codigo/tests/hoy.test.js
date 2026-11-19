// «Hoy»: las 3 de hoy, el orden, qué entra en X minutos, a medias y salteada.
const test = require('node:test');
const assert = require('node:assert/strict');
const H = require('../reglas/hoy.js');
const { marcarHecha } = require('../reglas/tareas.js');
const { estadoNuevo } = require('../reglas/estado.js');

const HOY = '2026-11-18', AYER = '2026-11-17', MANANA = '2026-11-19';
const tarea = (id, minutos, min, max) => ({ id, nombre: id, icono: 'check-circle', minutos, min, max });
const h = (id, dia, que = 'hecha') => ({ tarea: id, dia, que });

// Los datos de docs/vision.md y bocetos/hoy.html: miércoles 18 de noviembre.
const TAREAS = [
  tarea('cama', 3, 1, 1), tarea('platos', 10, 1, 1), tarea('ordenar', 10, 2, 2), tarea('barrer', 10, 3, 3),
  tarea('verdu', 20, 3, 4), tarea('trapo', 20, 7, 7), tarea('bano', 20, 7, 7), tarea('super', 60, 7, 7),
];
const HISTORIAL = [
  h('cama', AYER), h('platos', '2026-11-16'), h('ordenar', '2026-11-16'), h('barrer', '2026-11-13'),
  h('verdu', '2026-11-12'), h('trapo', '2026-11-13'), h('bano', '2026-11-10'), h('super', '2026-11-15'),
];
const ESTADO = { app: 'casa', version: 3, tareas: TAREAS, historial: HISTORIAL, las3: null };
// vencidas: platos 2, barrer 5/3, verdu 6/4 = 1,5, baño 8/7, cama 1, ordenar 1; trapo y súper no tocan

test('elegirLasTres: las 3 más vencidas que tocan', () => {
  assert.deepEqual(H.elegirLasTres(TAREAS, HISTORIAL, HOY), ['platos', 'barrer', 'verdu']);
});

test('elegirLasTres: si tocan menos de 3, las que haya; si no toca nada, ninguna', () => {
  const pocas = [tarea('trapo', 20, 7, 7), tarea('cama', 3, 1, 1)];
  assert.deepEqual(H.elegirLasTres(pocas, [h('trapo', AYER), h('cama', AYER)], HOY), ['cama']);
  assert.deepEqual(H.elegirLasTres(pocas, [h('trapo', AYER), h('cama', HOY)], HOY), []);
});

test('asegurarLasTres: se eligen la 1.ª vez del día y quedan fijas hasta mañana', () => {
  let e = H.asegurarLasTres(ESTADO, HOY);
  assert.deepEqual(e.las3, { dia: HOY, ids: ['platos', 'barrer', 'verdu'] });
  e = marcarHecha(e, 'platos', HOY);
  e = { ...e, historial: e.historial.concat(h('cama', '2026-11-10')) }; // aunque cambie lo vencido, no se vuelven a elegir
  assert.equal(H.asegurarLasTres(e, HOY), e, 'el mismo día no cambia nada');
  const manana = H.asegurarLasTres(e, MANANA);
  assert.equal(manana.las3.dia, MANANA);
  assert.notDeepEqual(manana.las3.ids, e.las3.ids);
});

test('estadoDelDia: hecha, a medias, salteada o nada', () => {
  let e = H.asegurarLasTres(ESTADO, HOY);
  assert.equal(H.estadoDelDia(e.historial, 'barrer', HOY), null);
  e = H.marcarSalteada(e, 'barrer', HOY);
  assert.equal(H.estadoDelDia(e.historial, 'barrer', HOY), 'salteada');
  e = H.marcarAMedias(e, 'verdu', HOY);
  assert.equal(H.estadoDelDia(e.historial, 'verdu', HOY), 'a-medias');
  e = marcarHecha(e, 'platos', HOY);
  assert.equal(H.estadoDelDia(e.historial, 'platos', HOY), 'hecha');
  assert.equal(H.estadoDelDia(e.historial, 'barrer', MANANA), null, 'salteada es solo por hoy');
});

test('diaCumplido: con las 3 de hoy hechas (aunque haga más)', () => {
  let e = H.asegurarLasTres(ESTADO, HOY);
  assert.equal(H.diaCumplido(e, HOY), false);
  for (const id of ['platos', 'barrer']) e = marcarHecha(e, id, HOY);
  e = H.marcarAMedias(e, 'verdu', HOY);
  assert.equal(H.diaCumplido(e, HOY), false, 'a medias no cuenta');
  e = marcarHecha(e, 'verdu', HOY);
  assert.equal(H.diaCumplido(e, HOY), true);
  assert.equal(H.diaCumplido({ ...ESTADO, las3: { dia: HOY, ids: [] } }, HOY), false, 'sin las 3 no hay día cumplido');
});

test('paraOfrecer: primero las 3 de hoy, después por qué tan vencidas están; sin lo hecho, salteado ni a medias de hoy', () => {
  let e = H.asegurarLasTres(ESTADO, HOY);
  assert.deepEqual(H.paraOfrecer(e, HOY).map(t => t.id), ['platos', 'barrer', 'verdu', 'bano', 'cama', 'ordenar']);
  e = marcarHecha(e, 'platos', HOY);
  e = H.marcarSalteada(e, 'barrer', HOY);
  e = H.marcarAMedias(e, 'bano', HOY);
  assert.deepEqual(H.paraOfrecer(e, HOY).map(t => t.id), ['verdu', 'cama', 'ordenar']);
});

test('queEntra: «Tengo 20 minutos» como en el boceto', () => {
  let e = H.asegurarLasTres(ESTADO, HOY);
  e = marcarHecha(e, 'platos', HOY);
  // barrer 10 entra (quedan 10), verdu 20 no, baño 20 no, cama 3 entra (quedan 7), ordenar 10 no
  assert.deepEqual(H.queEntra(H.paraOfrecer(e, HOY), 20).entran.map(t => t.id), ['barrer', 'cama']);
  assert.deepEqual(H.queEntra(H.paraOfrecer(e, HOY), 60).entran.map(t => t.id), ['barrer', 'verdu', 'bano', 'cama']);
});

test('queEntra: si no entra ninguna, dice la más corta; sin nada para ofrecer, ninguna', () => {
  const lista = [tarea('barrer', 10, 3, 3), tarea('verdu', 20, 3, 4), tarea('platos', 10, 1, 1)];
  const r = H.queEntra(lista, 5);
  assert.deepEqual(r.entran, []);
  assert.equal(r.masCorta.id, 'barrer', 'si empatan, la 1.ª en el orden');
  assert.deepEqual(H.queEntra([], 30), { entran: [], masCorta: null });
});

test('a medias: no reinicia la cuenta y al día siguiente va primero; al hacerla, deja de ir primero', () => {
  let e = H.asegurarLasTres(ESTADO, HOY);
  e = H.marcarAMedias(e, 'bano', HOY);
  assert.equal(require('../reglas/tareas.js').ultimaVez(e.historial, 'bano'), '2026-11-10', 'no cuenta como hecha');
  assert.equal(H.aMediasPendiente(e.historial, 'bano', MANANA), true);
  const manana = H.asegurarLasTres(e, MANANA);
  assert.equal(manana.las3.ids[0], 'bano', 'mañana es lo primero');
  assert.equal(H.paraOfrecer(manana, MANANA)[0].id, 'bano');
  const hecha = marcarHecha(manana, 'bano', MANANA);
  assert.equal(H.aMediasPendiente(hecha.historial, 'bano', '2026-11-20'), false);
});

test('salteada: mañana sigue igual de vencida (o más)', () => {
  let e = H.asegurarLasTres(ESTADO, HOY);
  e = H.marcarSalteada(e, 'barrer', HOY);
  assert.ok(H.paraOfrecer(e, MANANA).some(t => t.id === 'barrer'));
});

test('anotar 2 veces lo mismo el mismo día no duplica', () => {
  let e = H.marcarSalteada(ESTADO, 'barrer', HOY);
  assert.equal(H.marcarSalteada(e, 'barrer', HOY), e);
  e = H.marcarAMedias(e, 'verdu', HOY);
  assert.equal(H.marcarAMedias(e, 'verdu', HOY), e);
});

test('las 9 de arranque, nunca hechas: las 3 de hoy son las más cortas', () => {
  const e = H.asegurarLasTres(estadoNuevo(), HOY);
  assert.deepEqual(e.las3.ids, ['cama', 'lavar-ropa', 'barrer']);
});
