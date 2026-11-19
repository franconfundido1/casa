// «Hoy»: las 3 de hoy, el orden en que se ofrecen las tareas y qué entra en «Tengo X minutos».
// Funciones puras: reciben «hoy» ('AAAA-MM-DD') y devuelven datos nuevos, sin tocar los que reciben.
const tareasH = typeof module === 'object' ? require('./tareas.js') : { ultimaVez, toca, ordenarPorVencimiento };
const unaVezH = typeof module === 'object' ? require('./unavez.js') : { paraHoyUnaVez };
const repetitivas = tareas => tareas.filter(t => !t.unaVez);

// Lo que pasó hoy con una tarea: 'hecha', 'a-medias', 'salteada' o null (nada todavía).
function estadoDelDia(historial, id, hoy) {
  if (tareasH.ultimaVez(historial, id) === hoy) return 'hecha';
  const deHoy = historial.filter(h => h.tarea === id && h.dia === hoy);
  if (deHoy.some(h => h.que === 'a-medias')) return 'a-medias';
  if (deHoy.some(h => h.que === 'salteada')) return 'salteada';
  return null;
}

// A medias de un día anterior y todavía sin terminar: va primero (no reinicia la cuenta de días).
function aMediasPendiente(historial, id, hoy) {
  const ultima = tareasH.ultimaVez(historial, id);
  return historial.some(h => h.tarea === id && h.que === 'a-medias' && h.dia < hoy && (ultima === null || h.dia > ultima));
}

// El orden en que se ofrecen: primero las que quedaron a medias, después de la más vencida a la menos.
function ordenParaHoy(tareas, historial, hoy) {
  const ordenadas = tareasH.ordenarPorVencimiento(tareas, historial, hoy);
  const primero = ordenadas.filter(t => aMediasPendiente(historial, t.id, hoy));
  return primero.concat(ordenadas.filter(t => !primero.includes(t)));
}

// Las 3 de hoy: las 3 primeras que tocan, en el orden de arriba.
function elegirLasTres(tareas, historial, hoy) {
  const tocan = repetitivas(tareas).filter(t => tareasH.toca(t, tareasH.ultimaVez(historial, t.id), hoy));
  return ordenParaHoy(tocan, historial, hoy).slice(0, 3).map(t => t.id);
}

// La 1.ª vez que se abre la app en el día, elige las 3 de hoy; después quedan fijas hasta mañana.
function asegurarLasTres(estado, hoy) {
  if (estado.las3 && estado.las3.dia === hoy) return estado;
  return { ...estado, las3: { dia: hoy, ids: elegirLasTres(estado.tareas, estado.historial, hoy) } };
}

// Si cambia «última vez» de una tarea y todavía no se hizo nada con las 3 de hoy (ni hecha, ni a medias, ni salteada),
// se vuelven a elegir: así, al poner las tareas al día, salen las que de verdad tocan.
function reelegirSiNoEmpezo(estado, hoy) {
  if (!estado.las3 || estado.las3.dia !== hoy) return asegurarLasTres(estado, hoy);
  const empezo = estado.las3.ids.some(id => estadoDelDia(estado.historial, id, hoy) !== null);
  if (empezo) return estado;
  return { ...estado, las3: { dia: hoy, ids: elegirLasTres(estado.tareas, estado.historial, hoy) } };
}

// Si a las 3 de hoy les falta lugar (eran menos de 3, o se borró alguna) y aparece algo que toca, se completan.
function completarLasTres(estado, hoy) {
  if (!estado.las3 || estado.las3.dia !== hoy) return asegurarLasTres(estado, hoy);
  const ids = lasTres(estado).map(t => t.id);
  if (ids.length >= 3) return ids.length === estado.las3.ids.length ? estado : { ...estado, las3: { dia: hoy, ids } };
  const nuevas = elegirLasTres(estado.tareas.filter(t => !ids.includes(t.id) && estadoDelDia(estado.historial, t.id, hoy) === null), estado.historial, hoy);
  const completas = ids.concat(nuevas).slice(0, 3);
  if (completas.length === estado.las3.ids.length && completas.every((id, i) => id === estado.las3.ids[i])) return estado;
  return { ...estado, las3: { dia: hoy, ids: completas } };
}

// Cuando las 3 de hoy ya no tienen nada pendiente (hechas, a medias o salteadas), hasta 3 más de las que tocan.
function tambienTocan(estado, hoy) {
  const tres = lasTres(estado);
  if (tres.some(t => estadoDelDia(estado.historial, t.id, hoy) === null)) return [];
  return paraOfrecer(estado, hoy).filter(t => !t.unaVez && !tres.includes(t)).slice(0, 3);
}

// Las 3 de hoy, como tareas (sin las que se borraron).
function lasTres(estado) {
  if (!estado.las3) return [];
  return estado.las3.ids.map(id => estado.tareas.find(t => t.id === id)).filter(Boolean);
}

// El día está cumplido cuando las 3 de hoy están hechas.
function diaCumplido(estado, hoy) {
  const tres = lasTres(estado);
  return tres.length > 0 && tres.every(t => estadoDelDia(estado.historial, t.id, hoy) === 'hecha');
}

// Lo que se puede ofrecer ahora: lo que hoy no se hizo, no se salteó ni quedó a medias.
// Primero las de 1 vez para hoy (las atrasadas antes), después las 3 de hoy (en su orden) y después las demás que tocan.
function paraOfrecer(estado, hoy) {
  const unaVez = unaVezH.paraHoyUnaVez(estado.tareas, estado.historial, hoy).filter(t => estadoDelDia(estado.historial, t.id, hoy) === null);
  const libres = repetitivas(estado.tareas).filter(t =>
    tareasH.toca(t, tareasH.ultimaVez(estado.historial, t.id), hoy) && estadoDelDia(estado.historial, t.id, hoy) === null);
  const tresIds = estado.las3 && estado.las3.dia === hoy ? estado.las3.ids : [];
  const deLasTres = tresIds.map(id => libres.find(t => t.id === id)).filter(Boolean);
  const resto = ordenParaHoy(libres.filter(t => !deLasTres.includes(t)), estado.historial, hoy);
  return unaVez.concat(deLasTres, resto);
}

// Los minutos que se pueden elegir en «Tengo X minutos»: solo los que alcanzan para al menos 1 tarea.
function minutosPosibles(lista, opciones) {
  return opciones.filter(m => queEntra(lista, m).entran.length > 0);
}

// «Tengo X minutos»: recorre la lista en orden y se queda con las que entran en el tiempo.
// Si no entra ninguna, dice cuál es la más corta (null si no hay nada para ofrecer).
function queEntra(lista, minutos) {
  let queda = minutos;
  const entran = [];
  for (const t of lista) if (t.minutos <= queda) { entran.push(t); queda -= t.minutos; }
  let masCorta = null;
  if (!entran.length) for (const t of lista) if (masCorta === null || t.minutos < masCorta.minutos) masCorta = t;
  return { entran, masCorta };
}

function anotar(estado, id, hoy, que) {
  if (estado.historial.some(h => h.tarea === id && h.dia === hoy && h.que === que)) return estado;
  return { ...estado, historial: estado.historial.concat({ tarea: id, dia: hoy, que }) };
}
// Salteada: hoy no se ofrece más; mañana sigue igual de vencida (o más).
function marcarSalteada(estado, id, hoy) { return anotar(estado, id, hoy, 'salteada'); }
// A medias: queda anotada, no reinicia la cuenta y mañana va primero.
function marcarAMedias(estado, id, hoy) { return anotar(estado, id, hoy, 'a-medias'); }

if (typeof module === 'object') module.exports = {
  estadoDelDia, aMediasPendiente, ordenParaHoy, elegirLasTres, asegurarLasTres, reelegirSiNoEmpezo, completarLasTres, tambienTocan,
  lasTres, diaCumplido, paraOfrecer, queEntra, minutosPosibles, marcarSalteada, marcarAMedias,
};
