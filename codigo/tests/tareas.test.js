// Las reglas de vencimiento y los cambios en las tareas.
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../reglas/tareas.js');
const { estadoNuevo } = require('../reglas/estado.js');

const HOY = '2026-11-18';
const tarea = (id, minutos, min, max, nombre = id) => ({ id, nombre, icono: 'check-circle', minutos, min, max });
const hecha = (id, dia) => ({ tarea: id, dia, que: 'hecha' });

test('ultimaVez: el día más reciente de esa tarea; null si nunca', () => {
  const h = [hecha('barrer', '2026-11-10'), hecha('barrer', '2026-11-13'), hecha('platos', '2026-11-17'), hecha('barrer', '2026-11-11')];
  assert.equal(T.ultimaVez(h, 'barrer'), '2026-11-13');
  assert.equal(T.ultimaVez(h, 'platos'), '2026-11-17');
  assert.equal(T.ultimaVez(h, 'super'), null);
});

test('diasDesde: días locales de calendario; null si nunca', () => {
  assert.equal(T.diasDesde('2026-11-13', HOY), 5);
  assert.equal(T.diasDesde(HOY, HOY), 0);
  assert.equal(T.diasDesde('2026-10-31', '2026-11-01'), 1);
  assert.equal(T.diasDesde(null, HOY), null);
});

test('toca: cuando pasó el mínimo; si nunca se hizo, toca hoy', () => {
  const barrer = tarea('barrer', 10, 3, 3);
  assert.equal(T.toca(barrer, '2026-11-16', HOY), false); // 2 días
  assert.equal(T.toca(barrer, '2026-11-15', HOY), true); // 3 días
  assert.equal(T.toca(barrer, '2026-11-13', HOY), true); // 5 días
  assert.equal(T.toca(barrer, null, HOY), true);
  assert.equal(T.toca(barrer, HOY, HOY), false);
});

test('atrasada: cuando pasó el máximo (no al llegar); nunca hecha no cuenta como atrasada', () => {
  const verdu = tarea('verdu', 20, 3, 4);
  assert.equal(T.atrasada(verdu, '2026-11-14', HOY), false); // 4 días: toca, no atrasada
  assert.equal(T.atrasada(verdu, '2026-11-13', HOY), true); // 5 días
  assert.equal(T.atrasada(verdu, null, HOY), false);
});

test('vencimiento: días ÷ máximo (1 día de atraso en algo diario pesa más que en algo semanal)', () => {
  assert.equal(T.vencimiento(tarea('platos', 10, 1, 1), '2026-11-16', HOY), 2);
  assert.equal(T.vencimiento(tarea('trapo', 20, 7, 7), '2026-11-10', HOY), 8 / 7);
  assert.equal(T.vencimiento(tarea('x', 5, 1, 1), null, HOY), Infinity);
});

test('ordenarPorVencimiento: primero la más vencida; si empatan, la más corta', () => {
  const tareas = [tarea('trapo', 20, 7, 7), tarea('platos', 10, 1, 1), tarea('barrer', 10, 3, 3), tarea('verdu', 20, 3, 4), tarea('cama', 3, 1, 1)];
  const h = [hecha('trapo', '2026-11-10'), hecha('platos', '2026-11-16'), hecha('barrer', '2026-11-13'), hecha('verdu', '2026-11-12'), hecha('cama', '2026-11-16')];
  // platos y cama: 2 (cama más corta), barrer 5/3, verdu 6/4 = 1,5, trapo 8/7
  assert.deepEqual(T.ordenarPorVencimiento(tareas, h, HOY).map(t => t.id), ['cama', 'platos', 'barrer', 'verdu', 'trapo']);
});

test('ordenarPorVencimiento: las nunca hechas van primero, de la más corta a la más larga', () => {
  const e = estadoNuevo();
  assert.deepEqual(T.ordenarPorVencimiento(e.tareas, [], HOY).map(t => t.nombre),
    ['Hacer la cama', 'Lavar la ropa', 'Barrer', 'Lavar los platos', 'Ordenar la ropa', 'Limpiar el baño', 'Pasar el trapo', 'Verdulería', 'Súper']);
});

test('agrupar: tocan, más adelante (la que toca antes primero) y hechas hoy', () => {
  const tareas = [tarea('barrer', 10, 3, 3), tarea('trapo', 20, 7, 7), tarea('super', 60, 7, 7), tarea('platos', 10, 1, 1), tarea('cama', 3, 1, 1)];
  const h = [hecha('barrer', '2026-11-13'), hecha('trapo', '2026-11-13'), hecha('super', '2026-11-15'), hecha('platos', HOY)];
  const g = T.agrupar(tareas, h, HOY);
  assert.deepEqual(g.tocan.map(t => t.id), ['cama', 'barrer']);
  assert.deepEqual(g.adelante.map(t => t.id), ['trapo', 'super']); // trapo en 2 días, súper en 4
  assert.deepEqual(g.hechas.map(t => t.id), ['platos']);
});

test('lineaTarea: corta, «cada 3 días · 10 min»', () => {
  assert.equal(T.lineaTarea(tarea('cama', 3, 1, 1)), 'todos los días · 3 min');
  assert.equal(T.lineaTarea(tarea('barrer', 10, 3, 3)), 'cada 3 días · 10 min');
  assert.equal(T.lineaTarea(tarea('verdu', 20, 3, 4)), 'cada 3 a 4 días · 20 min');
});

test('tareaValida: nombre, minutos y días enteros; el máximo no menor que el mínimo', () => {
  assert.equal(T.tareaValida(tarea('a', 10, 3, 4)), true);
  assert.equal(T.tareaValida({ ...tarea('a', 10, 3, 4), nombre: '   ' }), false);
  assert.equal(T.tareaValida(tarea('a', 0, 3, 4)), false);
  assert.equal(T.tareaValida(tarea('a', 10, 4, 3)), false);
  assert.equal(T.tareaValida(tarea('a', 10, 0, 1)), false);
  assert.equal(T.tareaValida(tarea('a', 2.5, 3, 4)), false);
});

test('guardarTarea: agrega una nueva o cambia la que existe, sin tocar el estado de antes', () => {
  const e = estadoNuevo();
  const nueva = T.guardarTarea(e, { ...tarea('regar', 5, 2, 3, '  Regar  '), icono: 'plant' });
  assert.equal(nueva.tareas.length, 10);
  assert.deepEqual(nueva.tareas[9], { id: 'regar', nombre: 'Regar', icono: 'plant', minutos: 5, min: 2, max: 3 });
  assert.equal(e.tareas.length, 9);
  const cambiada = T.guardarTarea(nueva, { ...nueva.tareas[3], minutos: 15 });
  assert.equal(cambiada.tareas[3].minutos, 15);
  assert.equal(cambiada.tareas.length, 10);
  assert.throws(() => T.guardarTarea(e, tarea('mal', 10, 5, 2)));
});

test('borrarTarea: sale de la lista; lo hecho queda en el historial', () => {
  let e = T.marcarHecha(estadoNuevo(), 'barrer', HOY);
  e = T.borrarTarea(e, 'barrer');
  assert.equal(e.tareas.some(t => t.id === 'barrer'), false);
  assert.deepEqual(e.historial, [hecha('barrer', HOY)]);
});

test('marcarHecha: la última vez pasa a ser hoy; 2 veces el mismo día no duplica', () => {
  let e = estadoNuevo();
  e = T.marcarHecha(e, 'barrer', HOY);
  e = T.marcarHecha(e, 'barrer', HOY);
  assert.equal(T.ultimaVez(e.historial, 'barrer'), HOY);
  assert.equal(e.historial.length, 1);
  assert.equal(T.toca(e.tareas.find(t => t.id === 'barrer'), HOY, HOY), false);
});

test('desmarcarHecha: deshace solo la marca de hoy; lo de otros días queda', () => {
  let e = { ...estadoNuevo(), historial: [hecha('barrer', '2026-11-13')] };
  e = T.marcarHecha(e, 'barrer', HOY);
  e = T.desmarcarHecha(e, 'barrer', HOY);
  assert.deepEqual(e.historial, [hecha('barrer', '2026-11-13')]);
  assert.equal(T.ultimaVez(e.historial, 'barrer'), '2026-11-13');
});

const ajuste = (id, dia) => ({ tarea: id, dia, que: 'ajuste' });

test('ultimaVez: la fecha cargada a mano reemplaza lo anterior, aunque sea más vieja; las hechas después la suben', () => {
  assert.equal(T.ultimaVez([hecha('barrer', '2026-11-17'), ajuste('barrer', '2026-11-10')], 'barrer'), '2026-11-10');
  assert.equal(T.ultimaVez([ajuste('barrer', '2026-11-10'), hecha('barrer', HOY)], 'barrer'), HOY);
  assert.equal(T.ultimaVez([hecha('barrer', '2026-11-17'), ajuste('barrer', null)], 'barrer'), null);
  assert.equal(T.ultimaVez([ajuste('platos', '2026-11-10')], 'barrer'), null);
});

test('cargarUltimaVez: hoy, ayer, hace N días o nunca; queda en el historial', () => {
  let e = estadoNuevo();
  e = T.cargarUltimaVez(e, 'barrer', 2, HOY);
  assert.deepEqual(e.historial, [ajuste('barrer', '2026-11-16')]);
  assert.equal(T.toca(e.tareas.find(t => t.id === 'barrer'), T.ultimaVez(e.historial, 'barrer'), HOY), false); // 2 días: todavía no
  e = T.cargarUltimaVez(e, 'barrer', 5, HOY);
  assert.equal(T.ultimaVez(e.historial, 'barrer'), '2026-11-13');
  e = T.cargarUltimaVez(e, 'barrer', null, HOY);
  assert.equal(T.ultimaVez(e.historial, 'barrer'), null);
  assert.equal(e.historial.length, 3, 'aditivo: no se borra lo anterior');
  const igual = T.cargarUltimaVez(e, 'barrer', null, HOY);
  assert.equal(igual, e, 'si no cambia, no suma nada');
  e = T.cargarUltimaVez(e, 'platos', 0, HOY);
  assert.equal(T.ultimaVez(e.historial, 'platos'), HOY);
});

test('desmarcarHecha: también deshace un «hoy» cargado a mano', () => {
  let e = { ...estadoNuevo(), historial: [ajuste('barrer', '2026-11-13')] };
  e = T.cargarUltimaVez(e, 'barrer', 0, HOY);
  e = T.desmarcarHecha(e, 'barrer', HOY);
  assert.equal(T.ultimaVez(e.historial, 'barrer'), '2026-11-13');
});

test('ultimaVezTexto: hoy, ayer, hace N días, nunca', () => {
  assert.equal(T.ultimaVezTexto(HOY, HOY), 'hoy');
  assert.equal(T.ultimaVezTexto('2026-11-17', HOY), 'ayer');
  assert.equal(T.ultimaVezTexto('2026-11-13', HOY), 'hace 5 días');
  assert.equal(T.ultimaVezTexto(null, HOY), 'nunca');
});
