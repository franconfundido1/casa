// Fechas en días locales. Las pruebas corren con la zona de Argentina (UTC−3), cerca de la medianoche.
process.env.TZ = 'America/Argentina/Buenos_Aires';
const test = require('node:test');
const assert = require('node:assert/strict');
const { diasEntre, diaLocal, fechaLarga } = require('../reglas/fechas.js');

test('diasEntre: el mismo día es 0', () => {
  assert.equal(diasEntre('2026-11-18', '2026-11-18'), 0);
});

test('diasEntre: cuenta días de calendario, hacia adelante y hacia atrás', () => {
  assert.equal(diasEntre('2026-11-18', '2026-11-19'), 1);
  assert.equal(diasEntre('2026-11-18', '2026-11-25'), 7);
  assert.equal(diasEntre('2026-11-25', '2026-11-18'), -7);
});

test('diasEntre: cruza meses, años y el 29 de febrero', () => {
  assert.equal(diasEntre('2026-10-31', '2026-11-01'), 1);
  assert.equal(diasEntre('2026-12-31', '2027-01-01'), 1);
  assert.equal(diasEntre('2028-02-28', '2028-03-01'), 2);
  assert.equal(diasEntre('2027-02-28', '2027-03-01'), 1);
  assert.equal(diasEntre('2026-01-01', '2027-01-01'), 365);
});

test('diasEntre: no lo mueven los cambios de horario de otros países', () => {
  // marzo y noviembre, cuando cambian la hora en Europa y Estados Unidos
  assert.equal(diasEntre('2026-03-28', '2026-03-30'), 2);
  assert.equal(diasEntre('2026-10-31', '2026-11-02'), 2);
});

test('diasEntre: un día mal escrito da error', () => {
  for (const malo of ['2026-11-31', '2026-02-29', '18/11/2026', '2026-1-5', '', null]) {
    assert.throws(() => diasEntre(malo, '2026-11-18'));
  }
});

test('diaLocal: a las 23:59 de Argentina sigue siendo el mismo día, aunque en UTC ya sea mañana', () => {
  assert.equal(diaLocal(new Date('2026-11-19T02:59:00Z')), '2026-11-18'); // 23:59 en Argentina
  assert.equal(diaLocal(new Date('2026-11-19T03:00:00Z')), '2026-11-19'); // 0:00 en Argentina
  assert.equal(diaLocal(new Date('2026-11-18T23:30:00Z')), '2026-11-18'); // 20:30
});

test('diaLocal y diasEntre juntos, cerca de la medianoche', () => {
  const ayerTarde = diaLocal(new Date('2026-11-19T02:50:00Z')); // 23:50 del 18
  const hoyTemprano = diaLocal(new Date('2026-11-19T03:10:00Z')); // 0:10 del 19
  assert.equal(diasEntre(ayerTarde, hoyTemprano), 1);
  const misma = diaLocal(new Date('2026-11-18T03:05:00Z')); // 0:05 del 18
  assert.equal(diasEntre(misma, ayerTarde), 0);
});

test('diaLocal: fin de año en Argentina', () => {
  assert.equal(diaLocal(new Date('2027-01-01T02:30:00Z')), '2026-12-31');
});

test('fechaLarga: día de la semana, número y mes', () => {
  assert.equal(fechaLarga('2026-11-18'), 'miércoles 18 de noviembre');
  assert.equal(fechaLarga('2026-11-19'), 'jueves 19 de noviembre');
  assert.equal(fechaLarga('2027-01-01'), 'viernes 1 de enero');
});
