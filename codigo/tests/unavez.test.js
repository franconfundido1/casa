// Tareas de 1 sola vez: para hoy, atrasadas, próximas y su lugar en «hoy».
const test = require('node:test');
const assert = require('node:assert/strict');
const U = require('../reglas/unavez.js');
const H = require('../reglas/hoy.js');
const T = require('../reglas/tareas.js');
const { estadoNuevo } = require('../reglas/estado.js');

const HOY = '2026-11-19';
const unaVez = (id, fecha, minutos = 10) => ({ id, nombre: id, icono: 'check-circle', minutos, unaVez: true, fecha });

test('tareaValida y guardarTarea: una de 1 vez tiene fecha en vez de frecuencia', () => {
  assert.equal(T.tareaValida(unaVez('turno', HOY)), true);
  assert.equal(T.tareaValida({ ...unaVez('turno', HOY), fecha: '2026-02-30' }), false);
  assert.equal(T.tareaValida({ ...unaVez('turno', HOY), fecha: undefined }), false);
  const e = T.guardarTarea(estadoNuevo(), { ...unaVez('turno', HOY), min: 3, max: 4 });
  assert.deepEqual(e.tareas.at(-1), { id: 'turno', nombre: 'turno', icono: 'check-circle', minutos: 10, unaVez: true, fecha: HOY });
  // pasarla a repetitiva le saca la fecha
  const rep = T.guardarTarea(e, { id: 'turno', nombre: 'turno', icono: 'check-circle', minutos: 10, min: 7, max: 7 });
  assert.deepEqual(rep.tareas.at(-1), { id: 'turno', nombre: 'turno', icono: 'check-circle', minutos: 10, min: 7, max: 7 });
});

test('paraHoyUnaVez: las de hoy y las atrasadas, primero la más atrasada; sin las hechas ni las futuras', () => {
  const tareas = [unaVez('hoy', HOY), unaVez('ayer', '2026-11-18'), unaVez('antes', '2026-11-16'), unaVez('manana', '2026-11-20'), unaVez('hecha', '2026-11-17')];
  const historial = [{ tarea: 'hecha', dia: '2026-11-17', que: 'hecha' }];
  assert.deepEqual(U.paraHoyUnaVez(tareas, historial, HOY).map(t => t.id), ['antes', 'ayer', 'hoy']);
  assert.deepEqual(U.proximasUnaVez(tareas, historial, HOY).map(t => t.id), ['manana']);
});

test('atrasoTexto: nada si es de hoy; «de ayer» o «hace N días»', () => {
  assert.equal(U.atrasoTexto(HOY, HOY), null);
  assert.equal(U.atrasoTexto('2026-11-18', HOY), 'de ayer');
  assert.equal(U.atrasoTexto('2026-11-16', HOY), 'hace 3 días');
});

test('cuandoTexto: hoy, mañana o la fecha', () => {
  assert.equal(U.cuandoTexto(HOY, HOY), 'hoy');
  assert.equal(U.cuandoTexto('2026-11-20', HOY), 'mañana');
  assert.equal(U.cuandoTexto('2026-11-27', HOY), 'viernes 27 de noviembre');
});

test('las de 1 vez no entran en las 3 de hoy ni en los grupos de Tareas', () => {
  let e = T.guardarTarea(estadoNuevo(), unaVez('turno', HOY, 3));
  e = H.asegurarLasTres(e, HOY);
  assert.ok(!e.las3.ids.includes('turno'));
  const g = T.agrupar(e.tareas, e.historial, HOY);
  assert.ok(![...g.tocan, ...g.adelante, ...g.hechas].some(t => t.id === 'turno'));
});

test('paraOfrecer: las de 1 vez para hoy van primero (la atrasada antes), y entran primero en «Tengo X minutos»', () => {
  let e = T.guardarTarea(estadoNuevo(), unaVez('turno', HOY, 15));
  e = T.guardarTarea(e, unaVez('banco', '2026-11-18', 5));
  e = T.guardarTarea(e, unaVez('viaje', '2026-11-22', 5));
  e = H.asegurarLasTres(e, HOY);
  const lista = H.paraOfrecer(e, HOY);
  assert.deepEqual(lista.slice(0, 5).map(t => t.id), ['banco', 'turno', 'cama', 'lavar-ropa', 'barrer']);
  assert.ok(!lista.some(t => t.id === 'viaje'), 'las futuras no');
  assert.deepEqual(H.queEntra(lista, 20).entran.map(t => t.id), ['banco', 'turno']);
});

test('una de 1 vez sin hacer pasa al día siguiente como atrasada; hecha, sale de las listas y queda en el historial', () => {
  let e = T.guardarTarea(estadoNuevo(), unaVez('turno', HOY));
  const manana = '2026-11-20';
  assert.deepEqual(U.paraHoyUnaVez(e.tareas, e.historial, manana).map(t => t.id), ['turno']);
  assert.equal(U.atrasoTexto('2026-11-19', manana), 'de ayer');
  e = T.marcarHecha(e, 'turno', manana);
  assert.deepEqual(U.paraHoyUnaVez(e.tareas, e.historial, manana), []);
  assert.deepEqual(U.proximasUnaVez(e.tareas, e.historial, manana), []);
  assert.deepEqual(e.historial, [{ tarea: 'turno', dia: manana, que: 'hecha' }]);
});

test('salteada o a medias hoy: no se ofrece más hoy; mañana vuelve, atrasada', () => {
  let e = H.asegurarLasTres(T.guardarTarea(estadoNuevo(), unaVez('turno', HOY)), HOY);
  e = H.marcarSalteada(e, 'turno', HOY);
  assert.ok(!H.paraOfrecer(e, HOY).some(t => t.id === 'turno'));
  assert.equal(H.paraOfrecer(e, '2026-11-20')[0].id, 'turno');
});

test('completarLasTres: si eran menos de 3 y aparece algo que toca, se suma', () => {
  // 2 tareas tocan al elegir; después se crea «Hola»
  let e = { ...estadoNuevo(), tareas: estadoNuevo().tareas.slice(0, 2) };
  e = H.asegurarLasTres(e, HOY);
  assert.equal(e.las3.ids.length, 2);
  e = T.guardarTarea(e, { id: 'hola', nombre: 'Hola', icono: 'check-circle', minutos: 5, min: 1, max: 1 });
  e = H.completarLasTres(e, HOY);
  assert.deepEqual(e.las3.ids, ['cama', 'platos', 'hola']);
  assert.equal(H.completarLasTres(e, HOY), e, 'llenas: no cambia');
});

test('completarLasTres: si se borra una de las 3, se completa con la que sigue', () => {
  let e = H.asegurarLasTres(estadoNuevo(), HOY);
  e = T.borrarTarea(e, 'barrer');
  e = H.completarLasTres(e, HOY);
  assert.equal(e.las3.ids.length, 3);
  assert.ok(!e.las3.ids.includes('barrer'));
});

test('tambienTocan: con las 3 de hoy ya hechas, aparecen hasta 3 más de las que tocan', () => {
  let e = H.asegurarLasTres(estadoNuevo(), HOY);
  assert.deepEqual(H.tambienTocan(e, HOY), [], 'mientras haya algo pendiente en las 3, nada más');
  for (const id of e.las3.ids) e = T.marcarHecha(e, id, HOY);
  assert.equal(H.tambienTocan(e, HOY).length, 3);
  assert.ok(H.tambienTocan(e, HOY).every(t => !e.las3.ids.includes(t.id)));
});

test('minutosPosibles: solo los minutos en los que entra al menos 1 tarea', () => {
  const lista = [{ minutos: 10 }, { minutos: 20 }];
  assert.deepEqual(H.minutosPosibles(lista, [5, 10, 20, 30, 60]), [10, 20, 30, 60]);
  assert.deepEqual(H.minutosPosibles([], [5, 10, 20, 30, 60]), []);
});
