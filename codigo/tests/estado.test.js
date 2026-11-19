// El estado guardado: leer, migrar y no perder nada.
const test = require('node:test');
const assert = require('node:assert/strict');
const { VERSION, MIGRACIONES, estadoNuevo, migrar, cargar } = require('../reglas/estado.js');
const { tareaValida } = require('../reglas/tareas.js');

test('VERSION es 2', () => {
  assert.equal(VERSION, 2);
});

test('estadoNuevo: app casa, versión actual, las 9 tareas de arranque y el historial vacío', () => {
  const e = estadoNuevo();
  assert.equal(e.app, 'casa');
  assert.equal(e.version, VERSION);
  assert.equal(e.tareas.length, 9);
  assert.deepEqual(e.historial, []);
});

test('las 9 tareas de arranque: las de docs/vision.md, con su ícono', () => {
  const e = estadoNuevo();
  const resumen = e.tareas.map(t => [t.nombre, t.min, t.max, t.minutos, t.icono]);
  assert.deepEqual(resumen, [
    ['Hacer la cama', 1, 1, 3, 'bed'],
    ['Lavar los platos', 1, 1, 10, 'bowl-food'],
    ['Ordenar la ropa', 2, 2, 10, 't-shirt'],
    ['Barrer', 3, 3, 10, 'broom'],
    ['Verdulería', 3, 4, 20, 'carrot'],
    ['Lavar la ropa', 3, 4, 5, 'washing-machine'],
    ['Pasar el trapo', 7, 7, 20, 'drop'],
    ['Limpiar el baño', 7, 7, 20, 'bathtub'],
    ['Súper', 7, 7, 60, 'shopping-cart'],
  ]);
  assert.ok(e.tareas.every(tareaValida));
  assert.equal(new Set(e.tareas.map(t => t.id)).size, 9, 'ids distintos');
});

test('migración 1 → 2: lo guardado en la versión 1 recibe las 9 tareas y no pierde lo que tenía', () => {
  const r = cargar(JSON.stringify({ app: 'casa', version: 1, otra: 'cosa' }));
  assert.equal(r.roto, false);
  assert.equal(r.estado.version, 2);
  assert.equal(r.estado.tareas.length, 9);
  assert.deepEqual(r.estado.historial, []);
  assert.equal(r.estado.otra, 'cosa');
});

test('cargar: sin nada guardado, estado nuevo', () => {
  for (const vacio of [null, undefined, '']) {
    assert.deepEqual(cargar(vacio), { estado: estadoNuevo(), roto: false });
  }
});

test('cargar: lo guardado en la versión actual vuelve igual', () => {
  const guardado = { ...estadoNuevo(), historial: [{ tarea: 'barrer', dia: '2026-11-18', que: 'hecha' }] };
  assert.deepEqual(cargar(JSON.stringify(guardado)), { estado: guardado, roto: false });
});

test('cargar: si no se puede leer, estado nuevo y avisa que estaba roto', () => {
  for (const malo of ['{no es json', '"hola"', '42', 'null', '{"app":"atril","version":1}', '{"app":"casa"}', '{"app":"casa","version":0}']) {
    const r = cargar(malo);
    assert.deepEqual(r.estado, estadoNuevo(), malo);
    assert.equal(r.roto, true, malo);
  }
});

test('cargar: datos de una versión más nueva se dejan como están', () => {
  const futuro = { app: 'casa', version: 9, nuevo: true };
  assert.deepEqual(cargar(JSON.stringify(futuro)), { estado: futuro, roto: false });
});

test('migrar: aplica las migraciones de a 1, en orden', () => {
  const migraciones = {
    1: d => ({ ...d, tareas: [] }),
    2: d => ({ ...d, tareas: d.tareas.concat('barrer') }),
  };
  const r = cargar(JSON.stringify({ app: 'casa', version: 1 }), 3, migraciones);
  assert.deepEqual(r.estado, { app: 'casa', version: 3, tareas: ['barrer'] });
  assert.deepEqual(migrar({ app: 'casa', version: 2, tareas: [] }, 3, migraciones), { app: 'casa', version: 3, tareas: ['barrer'] });
});

test('migrar: si falta una migración, error (no se pierde nada en silencio)', () => {
  assert.throws(() => migrar({ app: 'casa', version: 2 }, 3, MIGRACIONES), /falta la migración de la versión 2/);
});
