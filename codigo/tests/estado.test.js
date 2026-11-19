// El estado guardado: leer, migrar y no perder nada.
const test = require('node:test');
const assert = require('node:assert/strict');
const { VERSION, estadoNuevo, migrar, cargar } = require('../reglas/estado.js');

test('estadoNuevo: app casa y la versión actual', () => {
  assert.deepEqual(estadoNuevo(), { app: 'casa', version: VERSION });
  assert.equal(VERSION, 1);
});

test('cargar: sin nada guardado, estado nuevo', () => {
  for (const vacio of [null, undefined, '']) {
    assert.deepEqual(cargar(vacio), { estado: estadoNuevo(), roto: false });
  }
});

test('cargar: lo guardado en la versión actual vuelve igual', () => {
  const guardado = { app: 'casa', version: 1, algo: [1, 2] };
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
  assert.throws(() => migrar({ app: 'casa', version: 1 }, 2, {}), /falta la migración de la versión 1/);
});
