// Fechas en días locales (Argentina, UTC−3). Funciones puras: reciben las fechas como parámetro.
// Un día se escribe 'AAAA-MM-DD'. Nunca se cuentan días con milisegundos de la hora: solo días de calendario.

const DIA_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// 'AAAA-MM-DD' → número de día (días desde 1970-01-01). Error si no es un día válido.
function numeroDeDia(dia) {
  const m = DIA_RE.exec(dia);
  if (!m) throw new Error('día inválido: ' + dia);
  const [a, mes, d] = [+m[1], +m[2], +m[3]];
  const ms = Date.UTC(a, mes - 1, d);
  const f = new Date(ms);
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d) throw new Error('día inválido: ' + dia);
  return ms / 86400000;
}

// Días de calendario de «desde» a «hasta» (negativo si «hasta» es antes).
function diasEntre(desde, hasta) {
  return numeroDeDia(hasta) - numeroDeDia(desde);
}

// El día que queda n días después (o antes, con n negativo).
function sumarDias(dia, n) {
  const f = new Date((numeroDeDia(dia) + n) * 86400000);
  const dos = x => String(x).padStart(2, '0');
  return `${f.getUTCFullYear()}-${dos(f.getUTCMonth() + 1)}-${dos(f.getUTCDate())}`;
}

// El día local de un momento (un Date), según la zona horaria del dispositivo.
function diaLocal(momento) {
  const dos = n => String(n).padStart(2, '0');
  return `${momento.getFullYear()}-${dos(momento.getMonth() + 1)}-${dos(momento.getDate())}`;
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// 'AAAA-MM-DD' → «miércoles 18 de noviembre».
function fechaLarga(dia) {
  const n = numeroDeDia(dia);
  const f = new Date(n * 86400000);
  return `${DIAS_SEMANA[f.getUTCDay()]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`;
}

if (typeof module === 'object') module.exports = { diasEntre, sumarDias, diaLocal, fechaLarga };
