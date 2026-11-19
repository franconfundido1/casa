// La copia de seguridad: bajar, leer, validar y migrar.
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../reglas/copia.js');
const { estadoNuevo, VERSION } = require('../reglas/estado.js');
const { marcarHecha } = require('../reglas/tareas.js');

const HOY = '2026-11-19';

test('armarCopia: todo el estado, con app casa, la versión y cuándo se bajó', () => {
  const e = marcarHecha(estadoNuevo(), 'barrer', HOY);
  const datos = JSON.parse(C.armarCopia(e, HOY, '21:30'));
  assert.equal(datos.app, 'casa');
  assert.equal(datos.version, VERSION);
  assert.deepEqual(datos.copia, { dia: HOY, hora: '21:30' });
  assert.deepEqual(datos.tareas, e.tareas);
  assert.deepEqual(datos.historial, e.historial);
});

test('nombreCopia: str3ak-copia con el día', () => {
  assert.equal(C.nombreCopia(HOY), 'str3ak-copia-2026-11-19.json');
});

test('leerCopia: lo que se bajó vuelve igual (sin el dato de la copia), con un resumen', () => {
  const e = marcarHecha(marcarHecha(estadoNuevo(), 'barrer', HOY), 'cama', HOY);
  const r = C.leerCopia(C.armarCopia(e, HOY, '21:30'));
  assert.equal(r.ok, true);
  assert.deepEqual(r.estado, e);
  assert.deepEqual(r.resumen, { dia: HOY, tareas: 9, hechas: 2 });
});

test('leerCopia: una copia de una versión vieja se migra', () => {
  const r = C.leerCopia(JSON.stringify({ app: 'casa', version: 1 }));
  assert.equal(r.ok, true);
  assert.equal(r.estado.version, VERSION);
  assert.equal(r.estado.tareas.length, 9);
  assert.equal(r.resumen.dia, null);
});

test('leerCopia: lo que no es una copia de str3ak no se carga', () => {
  for (const malo of ['{roto', '"hola"', 'null', '[]', JSON.stringify({ app: 'atril', version: 1 }), JSON.stringify({ app: 'casa' })]) {
    const r = C.leerCopia(malo);
    assert.equal(r.ok, false, malo);
    assert.equal(r.error, 'El archivo no es una copia de str3ak.');
  }
});

test('leerCopia: una copia de una versión más nueva no se carga', () => {
  const r = C.leerCopia(JSON.stringify({ ...estadoNuevo(), version: VERSION + 1 }));
  assert.equal(r.ok, false);
  assert.match(r.error, /versión más nueva/);
});

test('leerCopia: una copia incompleta o con tareas mal escritas no se carga', () => {
  const e = estadoNuevo();
  const casos = [
    { ...e, tareas: 'no' },
    { ...e, historial: null },
    { ...e, tareas: e.tareas.concat({ id: 'x', nombre: '', icono: 'check-circle', minutos: 5, min: 1, max: 1 }) },
    { ...e, tareas: e.tareas.concat(e.tareas[0]) },
    { ...e, historial: [{ dia: HOY }] },
  ];
  for (const c of casos) {
    const r = C.leerCopia(JSON.stringify(c));
    assert.equal(r.ok, false);
    assert.equal(r.error, 'La copia está incompleta.');
  }
});
