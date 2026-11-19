// Prueba de la página compilada (salida/) en un navegador con tamaño de iPhone: 390×844, táctil.
// Uso: python3 codigo/build.py && node codigo/test_pagina.js   (usa WebKit si está instalado; si no, Chromium)
const http = require('http');
const fs = require('fs');
const path = require('path');
const pw = require('playwright');

const SALIDA = path.join(__dirname, '..', 'salida');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.txt': 'text/plain' };

function servir() {
  const srv = http.createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    const f = path.join(SALIDA, ruta);
    if (!f.startsWith(SALIDA) || !fs.existsSync(f)) { res.writeHead(404); return res.end('no está'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

let pasan = 0, fallan = 0;
function chequear(nombre, ok, detalle = '') {
  if (ok) { pasan++; console.log('ok   ' + nombre); } else { fallan++; console.log('MAL  ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

(async () => {
  const srv = await servir();
  const U = `http://127.0.0.1:${srv.address().port}/`;
  let motor = 'webkit', browser;
  try { browser = await pw.webkit.launch(); } catch (e) { motor = 'chromium'; browser = await pw.chromium.launch(); }
  console.log('navegador: ' + motor + (motor === 'chromium' ? ' (falta probar en el iPhone de verdad)' : ''));
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 390, height: 844 }, isMobile: motor === 'chromium', hasTouch: true });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  p.on('console', m => m.type() === 'error' && errores.push(m.text()));

  // carga
  await p.goto(U);
  await p.waitForTimeout(300);
  chequear('carga: el título es «hoy»', (await p.textContent('#titulo')) === 'hoy');
  const sub = await p.textContent('#subtitulo');
  chequear('carga: la fecha de hoy debajo del título', /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo) \d{1,2} de [a-z]+$/.test(sub), sub);
  chequear('carga: se ve solo la pantalla de hoy', await p.isVisible('#pantalla-hoy') && await p.isHidden('#pantalla-tareas') && await p.isHidden('#pantalla-ajustes'));
  chequear('carga: League Spartan cargada', await p.evaluate(() => document.fonts.check('700 40px "League Spartan"') && getComputedStyle(document.getElementById('titulo')).fontFamily.startsWith('"League Spartan"')));
  chequear('carga: el título usa League Spartan, no la letra del sistema', await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some(f => f.family.replace(/"/g, '') === 'League Spartan' && f.status === 'loaded'); }));
  chequear('carga: los íconos de la barra se dibujan', await p.evaluate(() => [...document.querySelectorAll('.pestanas svg')].filter(s => getComputedStyle(s).display !== 'none').every(s => s.getBBox().width > 0)));

  // se siente app
  const css = await p.evaluate(() => { const s = getComputedStyle(document.body); return { sel: s.userSelect || s.webkitUserSelect, over: s.overscrollBehaviorY, tap: s.webkitTapHighlightColor }; });
  chequear('se siente app: sin selección de texto', css.sel === 'none', css.sel);
  chequear('se siente app: sin rebote', css.over === 'none', css.over);
  chequear('se siente app: sin resaltado al tocar', /rgba\(0, 0, 0, 0\)|transparent/.test(css.tap), css.tap);
  const caja = await p.evaluate(() => { const n = document.querySelector('.pestanas').getBoundingClientRect(); const t = document.querySelector('.titulo'); return { abajo: n.bottom, alto: innerHeight, linea: getComputedStyle(t).borderBottomWidth }; });
  chequear('pantalla: la barra de pestañas va abajo de todo', Math.abs(caja.abajo - caja.alto) < 1, JSON.stringify(caja));
  chequear('pantalla: la cabecera tiene la línea fina', caja.linea === '1px', caja.linea);

  // cambio de pestaña
  await p.tap('.pestanas [data-pantalla="tareas"]');
  chequear('pestañas: Tareas cambia el título', (await p.textContent('#titulo')) === 'tareas');
  chequear('pestañas: Tareas sin fecha', (await p.textContent('#subtitulo')) === '');
  chequear('pestañas: se ve solo la pantalla de tareas', await p.isVisible('#pantalla-tareas') && await p.isHidden('#pantalla-hoy'));
  chequear('pestañas: la elegida queda marcada', (await p.getAttribute('.pestanas [data-pantalla="tareas"]', 'aria-current')) === 'page' && (await p.getAttribute('.pestanas [data-pantalla="hoy"]', 'aria-current')) === null);
  await p.waitForTimeout(300); // la transición del color dura 200 ms
  const pill = await p.evaluate(() => getComputedStyle(document.querySelector('.pestanas [aria-current]')).backgroundColor);
  chequear('pestañas: la elegida es blanca llena', pill === 'rgb(255, 255, 255)', pill);
  await p.tap('.pestanas [data-pantalla="ajustes"]');
  chequear('pestañas: Ajustes', (await p.textContent('#titulo')) === 'ajustes' && await p.isVisible('#pantalla-ajustes'));
  await p.tap('.pestanas [data-pantalla="hoy"]');
  chequear('pestañas: vuelve a Hoy con la fecha', (await p.textContent('#titulo')) === 'hoy' && (await p.textContent('#subtitulo')) === sub);
  const toques = await p.evaluate(() => [...document.querySelectorAll('.pestanas button')].map(b => b.getBoundingClientRect()).every(r => r.width >= 44 && r.height >= 44));
  chequear('pestañas: toques de 44 px como mínimo', toques);

  // datos
  const guardado = await p.evaluate(() => JSON.parse(localStorage.getItem('casa-v1')));
  chequear('datos: guarda en casa-v1 con la versión 4 y las 9 tareas', guardado.app === 'casa' && guardado.version === 4 && guardado.tareas.length === 9 && guardado.historial.length === 0, JSON.stringify(guardado).slice(0, 80));
  await p.evaluate(() => localStorage.setItem('casa-v1', '{roto'));
  await p.reload();
  const tras = await p.evaluate(() => [JSON.parse(localStorage.getItem('casa-v1')), localStorage.getItem('casa-v1-roto')]);
  chequear('datos: si lo guardado está roto, lo guarda aparte y arranca', tras[0].version === 4 &&tras[0].tareas.length === 9 && tras[1] === '{roto', JSON.stringify(tras).slice(0, 80));
  await p.evaluate(() => { localStorage.setItem('casa-v1-roto', ''); localStorage.setItem('casa-v1', JSON.stringify({ app: 'casa', version: 1, otra: 1 })); });
  await p.reload();
  const migrado = await p.evaluate(() => JSON.parse(localStorage.getItem('casa-v1')));
  chequear('datos: migra de la versión 1 a la 4 con las 9 tareas', migrado.version === 4 && migrado.tareas.length === 9 && migrado.otra === 1);

  // tareas
  const filas = () => p.$$eval('#lista-tareas .seccion', ss => ss.map(s => [s.dataset.grupo, [...s.querySelectorAll('.fila .nombre')].map(n => n.textContent)]));
  const guardadas = () => p.evaluate(() => JSON.parse(localStorage.getItem('casa-v1')));
  chequear('tareas: el «+» está en Hoy', await p.isVisible('#nueva-tarea'));
  await p.tap('.pestanas [data-pantalla="ajustes"]');
  chequear('tareas: en Ajustes no hay «+»', await p.isHidden('#nueva-tarea'));
  await p.tap('.pestanas [data-pantalla="tareas"]');
  chequear('tareas: el «+» aparece en Tareas', await p.isVisible('#nueva-tarea'));
  let g = await filas();
  chequear('tareas: las 9 tocan (nunca hechas), de la más corta a la más larga', JSON.stringify(g) === JSON.stringify([['tocan',
    ['Hacer la cama', 'Lavar la ropa', 'Barrer', 'Lavar los platos', 'Ordenar la ropa', 'Limpiar el baño', 'Pasar el trapo', 'Verdulería', 'Súper']]]), JSON.stringify(g));
  chequear('tareas: 1 línea gris corta', (await p.textContent('#lista-tareas [data-id="verduleria"] .linea')) === 'cada 3 a 4 días · 20 min');
  chequear('tareas: el ícono de cada tarea, adentro de su círculo', await p.evaluate(() => [...document.querySelectorAll('#lista-tareas .fila')].every(f => f.querySelector('.estado .i-tarea'))) &&
    (await p.getAttribute('#lista-tareas [data-id="barrer"] .i-tarea use', 'href')) === '#broom-fill');
  await p.tap('#lista-tareas [data-id="barrer"] [data-circulo]');
  chequear('tareas: tocar el círculo lo llena al toque', (await p.getAttribute('#lista-tareas [data-id="barrer"]', 'data-estado')) === 'hecha');
  await p.waitForTimeout(700);
  g = await filas();
  chequear('tareas: hecha pasa a «hechas hoy»', g.length === 2 && g[1][0] === 'hechas hoy' && g[1][1][0] === 'Barrer', JSON.stringify(g));
  const hist = (await guardadas()).historial;
  chequear('tareas: la última vez pasa a ser hoy (queda guardado)', hist.length === 1 && hist[0].tarea === 'barrer' && /^\d{4}-\d{2}-\d{2}$/.test(hist[0].dia) && hist[0].que === 'hecha', JSON.stringify(hist));
  await p.reload();
  await p.tap('.pestanas [data-pantalla="tareas"]');
  g = await filas();
  chequear('tareas: después de recargar sigue hecha', !!g[1] && g[1][1][0] === 'Barrer');
  await p.tap('#lista-tareas [data-id="barrer"] [data-circulo]');
  await p.waitForTimeout(700);
  g = await filas();
  chequear('tareas: tocarla de nuevo la deshace', g.length === 1 && g[0][1].includes('Barrer'));

  // hoja de tarea
  await p.tap('#lista-tareas [data-id="verduleria"] .nombre');
  await p.waitForTimeout(400);
  const hoja = await p.evaluate(() => ({
    abierta: document.getElementById('hoja-tarea').classList.contains('abierta'),
    nombre: document.getElementById('nombre-tarea').value,
    icono: document.querySelector('#firma > svg use').getAttribute('href'),
    entre: document.querySelector('#modo [data-op="entre"]').getAttribute('aria-pressed'),
    desde: document.querySelector('#c-desde b').textContent, hasta: document.querySelector('#c-hasta b').textContent,
    minutos: document.querySelector('#c-minutos b').textContent,
    sinTextos: !document.getElementById('nota-frec') && [...document.querySelectorAll('#hoja-tarea .cabeza')].every(c => c.textContent.trim() === ''),
    guardar: document.getElementById('guardar-tarea').disabled,
  }));
  chequear('hoja: abre con los datos de la tarea', hoja.abierta && hoja.nombre === 'Verdulería' && hoja.icono === '#carrot-fill' && hoja.entre === 'true' && hoja.desde === '3' && hoja.hasta === '4' && hoja.minutos === '20', JSON.stringify(hoja));
  chequear('hoja: los íconos solos, sin «frecuencia», «lleva», «última vez» ni la nota; «Guardar» apagado hasta cambiar algo', hoja.sinTextos && hoja.guardar);
  await p.tap('#c-minutos [data-mas]');
  chequear('hoja: al cambiar algo se prende «Guardar»', !(await p.isDisabled('#guardar-tarea')));
  await p.tap('#modo [data-op="cada"]');
  chequear('hoja: con «Cada», 1 contador', await p.isHidden('#c-hasta'));
  await p.tap('#modo [data-op="entre"]');
  await p.tap('#firma');
  await p.waitForTimeout(400);
  chequear('hoja: el círculo abre la lista de 16 íconos', await p.evaluate(() => document.getElementById('hoja-iconos').classList.contains('abierta') && document.querySelectorAll('#grilla-iconos button').length === 16));
  await p.tap('#grilla-iconos [data-id="plant"]');
  await p.waitForTimeout(500);
  chequear('hoja: elegir un ícono lo pone en el círculo y cierra la lista', (await p.getAttribute('#firma > svg use', 'href')) === '#plant-fill' && await p.evaluate(() => !document.getElementById('hoja-iconos').classList.contains('abierta')));
  await p.tap('#guardar-tarea');
  await p.waitForTimeout(400);
  chequear('hoja: guardar cambia la tarea', (await p.textContent('#lista-tareas [data-id="verduleria"] .linea')) === 'cada 3 a 4 días · 25 min' &&
    (await guardadas()).tareas.find(t => t.id === 'verduleria').icono === 'plant');

  // última vez, cargada a mano
  await p.tap('#lista-tareas [data-id="barrer"] .nombre');
  await p.waitForTimeout(400);
  chequear('última vez: en las de arranque arranca en «nunca»', (await p.textContent('#c-ultima b')) === 'nunca' && await p.isDisabled('#c-ultima [data-menos]'));
  for (let i = 0; i < 3; i++) await p.tap('#c-ultima [data-mas]');
  chequear('última vez: con el + pasa por hoy y ayer hasta «2 días atrás»', (await p.textContent('#c-ultima b')) === '2' && (await p.textContent('#c-ultima span')) === 'días atrás');
  chequear('última vez: cambiarla prende «Guardar»', !(await p.isDisabled('#guardar-tarea')));
  await p.tap('#guardar-tarea');
  await p.waitForTimeout(400);
  g = await filas();
  const adelante = g.find(x => x[0] === 'más adelante');
  chequear('última vez: hace 2 días, Barrer (cada 3) pasa a «más adelante»', !!adelante && adelante[1].includes('Barrer'), JSON.stringify(g));
  const ajustes = (await guardadas()).historial.filter(h => h.que === 'ajuste');
  chequear('última vez: queda en el historial con esa fecha', ajustes.length === 1 && ajustes[0].tarea === 'barrer' && /^\d{4}-\d{2}-\d{2}$/.test(ajustes[0].dia), JSON.stringify(ajustes));
  await p.tap('#lista-tareas [data-id="barrer"] .nombre');
  await p.waitForTimeout(400);
  chequear('última vez: al volver a abrir, dice 2', (await p.textContent('#c-ultima b')) === '2' && await p.isDisabled('#guardar-tarea'));
  await p.tap('#cerrar-tarea');
  await p.waitForTimeout(400);

  // nueva y borrar
  await p.tap('#nueva-tarea');
  await p.waitForTimeout(400);
  chequear('nueva: arranca vacía, con el ícono «Tarea» y sin «Borrar»', (await p.inputValue('#nombre-tarea')) === '' && (await p.getAttribute('#firma > svg use', 'href')) === '#check-circle-fill' && await p.isHidden('#borrar-tarea') && await p.isDisabled('#guardar-tarea'));
  await p.fill('#nombre-tarea', 'Regar las plantas');
  await p.tap('#guardar-tarea');
  await p.waitForTimeout(400);
  const nuevas = (await guardadas()).tareas;
  chequear('nueva: se guarda y aparece en la lista', nuevas.length === 10 && (await p.textContent('#lista-tareas')).includes('Regar las plantas'));
  await p.tap('#lista-tareas [data-id="' + nuevas[9].id + '"] .nombre');
  await p.waitForTimeout(400);
  await p.tap('#borrar-tarea');
  chequear('borrar: el 1.º toque avisa y no borra', (await p.textContent('#borrar-tarea')) === '¿Borrar?' && (await guardadas()).tareas.length === 10);
  await p.tap('#borrar-tarea');
  await p.waitForTimeout(400);
  chequear('borrar: el 2.º toque la borra', (await guardadas()).tareas.length === 9 && !(await p.textContent('#lista-tareas')).includes('Regar'));
  await p.tap('.pestanas [data-pantalla="hoy"]');

  // hoy: las 3 de hoy, «Tengo X minutos» y la tarea en curso
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  const filasHoy = () => p.$$eval('#lista-hoy .fila', fs => fs.map(f => [f.querySelector('.nombre').textContent, f.dataset.estado]));
  let hoyFilas = await filasHoy();
  chequear('hoy: las 3 de hoy (nunca hechas: las más cortas)', JSON.stringify(hoyFilas) === JSON.stringify([['Hacer la cama', 'toca'], ['Lavar la ropa', 'toca'], ['Barrer', 'toca']]), JSON.stringify(hoyFilas));
  chequear('hoy: 1 línea gris, solo los minutos', (await p.textContent('#lista-hoy [data-id="barrer"] .linea')) === '10 min');
  const las3 = (await guardadas()).las3;
  chequear('hoy: las 3 quedan guardadas con el día', las3 && /^\d{4}-\d{2}-\d{2}$/.test(las3.dia) && las3.ids.join() === 'cama,lavar-ropa,barrer', JSON.stringify(las3));
  // poner «última vez» antes de empezar el día vuelve a elegir las 3 de hoy
  await p.tap('.pestanas [data-pantalla="tareas"]');
  await p.tap('#lista-tareas [data-id="barrer"] .nombre');
  await p.waitForTimeout(400);
  await p.tap('#c-ultima [data-mas]');
  await p.tap('#c-ultima [data-mas]');
  await p.tap('#guardar-tarea');
  await p.waitForTimeout(400);
  await p.tap('.pestanas [data-pantalla="hoy"]');
  const reelegidas = (await guardadas()).las3.ids;
  chequear('hoy: si cambiás «última vez» antes de empezar, se vuelven a elegir las 3', !reelegidas.includes('barrer') && reelegidas.length === 3 &&
    !(await filasHoy()).some(f => f[0] === 'Barrer'), JSON.stringify(reelegidas));
  // para seguir con las mismas pruebas de antes: Barrer otra vez en «nunca»
  await p.evaluate(() => { localStorage.clear(); });
  await p.reload();
  const panel = await p.evaluate(() => { const e = document.getElementById('empezar').getBoundingClientRect(), n = document.querySelector('.pestanas').getBoundingClientRect(); return [e.bottom, n.top]; });
  chequear('hoy: «Empezar» fijo, arriba de la barra de pestañas', panel[0] <= panel[1], JSON.stringify(panel));
  chequear('hoy: 20 minutos elegidos de entrada, «Empezar» prendido', (await p.getAttribute('#minutos [data-op="20"]', 'aria-pressed')) === 'true' && !(await p.isDisabled('#empezar')));
  // marcar a mano la cama y la ropa para que con 5 minutos no entre ninguna
  await p.tap('#lista-hoy [data-id="cama"] [data-circulo]');
  await p.tap('#lista-hoy [data-id="lavar-ropa"] [data-circulo]');
  await p.waitForTimeout(600);
  chequear('hoy: el 5 va apagado (no entra ninguna), sin mensaje', await p.isDisabled('#minutos [data-op="5"]') && !(await p.$('#nota-tengo')) &&
    !(await p.isDisabled('#minutos [data-op="10"]')));
  chequear('hoy: abajo, solo los minutos y «Empezar» (sin «tengo»)', !(await p.$('.tengo .cabeza')) && (await p.textContent('.tengo')).replace(/\s+/g, ' ').trim() === '5 10 20 30 60 Empezar');
  hoyFilas = await filasHoy();
  chequear('hoy: lo hecho sale; con 20 minutos, la lista muestra lo que entra (Barrer 10, después Lavar los platos 10)', JSON.stringify(hoyFilas) === JSON.stringify([['Barrer', 'toca'], ['Lavar los platos', 'toca']]) &&
    !(await p.$('#lista-hoy h2')), JSON.stringify(hoyFilas));
  await p.tap('#minutos [data-op="10"]');
  await p.waitForTimeout(300);
  hoyFilas = await filasHoy();
  chequear('hoy: la lista sigue a los minutos (con 10, solo Barrer)', JSON.stringify(hoyFilas) === JSON.stringify([['Barrer', 'toca']]), JSON.stringify(hoyFilas));
  await p.tap('#minutos [data-op="30"]');
  chequear('hoy: con 30 entra y se prende «Empezar»', (await p.getAttribute('#minutos [data-op="30"]', 'aria-pressed')) === 'true' && !(await p.isDisabled('#empezar')));
  // con 30: barrer 10 (las 3 de hoy), después platos 10 y ordenar la ropa 10
  await p.tap('#empezar');
  await p.waitForTimeout(450);
  chequear('en curso: de a 1, la 1.ª de las 3 de hoy', (await p.textContent('#cuenta')) === '1 de 3' && (await p.textContent('#curso h3')) === 'Barrer');
  chequear('en curso: el ícono de la tarea adentro del círculo', (await p.getAttribute('#curso .i-tarea use', 'href')) === '#broom-fill');
  await p.tap('#curso [data-r="hecha"]');
  chequear('en curso: tocar el círculo la marca hecha', (await p.getAttribute('#curso .tarea', 'data-estado')) === 'hecha');
  await p.waitForTimeout(1200);
  chequear('en curso: pasa a la siguiente', (await p.textContent('#cuenta')) === '2 de 3' && (await p.textContent('#curso h3')) === 'Lavar los platos');
  await p.tap('#curso [data-r="salteada"]');
  await p.waitForTimeout(1200);
  await p.tap('#curso [data-r="a-medias"]');
  await p.waitForTimeout(1200);
  const fin = await p.$$eval('#curso .fin .fila', fs => fs.map(f => [f.querySelector('.nombre').textContent, f.dataset.estado]));
  chequear('en curso: al final, «listo por ahora» con el resumen', (await p.textContent('#curso h3')) === 'listo por ahora' &&
    JSON.stringify(fin) === JSON.stringify([['Barrer', 'hecha'], ['Lavar los platos', 'salteada'], ['Ordenar la ropa', 'a-medias']]), JSON.stringify(fin));
  const hist2 = (await guardadas()).historial.map(x => x.tarea + ':' + x.que);
  chequear('en curso: queda en el historial (hecha, salteada, a medias)', ['barrer:hecha', 'platos:salteada', 'ordenar-ropa:a-medias'].every(x => hist2.includes(x)), JSON.stringify(hist2));
  await p.tap('#listo');
  await p.waitForTimeout(500);
  hoyFilas = await filasHoy();
  // con 30: lo salteado y lo que quedó a medias no vuelve hoy; entra Limpiar el baño (20)
  chequear('hoy: con las 3 de hoy hechas, la lista muestra lo que sigue y entra', JSON.stringify(hoyFilas) === JSON.stringify([['Limpiar el baño', 'toca']]), JSON.stringify(hoyFilas));
  chequear('hoy: las 3 de hoy cuentan para el día cumplido aunque no se marquen', await p.evaluate(() => {
    const e = JSON.parse(localStorage.getItem('casa-v1'));
    return e.las3.ids.every(id => e.historial.some(h => h.tarea === id && h.que === 'hecha' && h.dia === e.las3.dia));
  }));
  await p.tap('#minutos [data-op="60"]');
  await p.tap('#empezar');
  await p.waitForTimeout(450);
  chequear('en curso: lo salteado y lo que quedó a medias no se ofrece de nuevo hoy', !['Lavar los platos', 'Ordenar la ropa'].includes(await p.textContent('#curso h3')), await p.textContent('#curso h3'));
  await p.tap('#cerrar-curso');
  await p.waitForTimeout(400);
  await p.tap('.pestanas [data-pantalla="tareas"]');
  chequear('tareas: a medias y salteada se ven en «tocan»', (await p.getAttribute('#lista-tareas [data-id="ordenar-ropa"]', 'data-estado')) === 'a-medias' &&
    (await p.getAttribute('#lista-tareas [data-id="platos"]', 'data-estado')) === 'salteada');
  await p.tap('.pestanas [data-pantalla="hoy"]');

  // tareas de 1 vez: anotar rápido desde Hoy
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.tap('#nueva-tarea');
  await p.waitForTimeout(400);
  const rapida = await p.evaluate(() => ({
    modo: document.querySelector('#modo [aria-pressed="true"]').dataset.op,
    fecha: document.querySelector('#fecha-unavez [aria-pressed="true"]').dataset.op,
    minutos: document.querySelector('#c-minutos b').textContent,
    foco: document.activeElement.id,
    sinUltima: document.getElementById('bloque-ultima').hidden,
  }));
  chequear('1 vez: el «+» de Hoy abre la hoja en «1 vez · hoy», 10 min y el teclado en el nombre', rapida.modo === 'unavez' && rapida.fecha === 'hoy' &&
    rapida.minutos === '10' && rapida.foco === 'nombre-tarea' && rapida.sinUltima, JSON.stringify(rapida));
  await p.keyboard.type('Llamar al plomero');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(500);
  const anotada = (await guardadas()).tareas.at(-1);
  chequear('1 vez: «Listo» en el teclado guarda (2 toques)', anotada.nombre === 'Llamar al plomero' && anotada.unaVez === true && /^\d{4}-\d{2}-\d{2}$/.test(anotada.fecha) &&
    await p.evaluate(() => !document.getElementById('hoja-tarea').classList.contains('abierta')), JSON.stringify(anotada));
  const conPlomero = await filasHoy();
  chequear('1 vez: va primero en la lista de Hoy', conPlomero[0][0] === 'Llamar al plomero' && conPlomero[1][0] === 'Hacer la cama', JSON.stringify(conPlomero));
  await p.tap('#minutos [data-op="10"]');
  await p.tap('#empezar');
  await p.waitForTimeout(450);
  chequear('1 vez: entra primero en «Tengo X minutos»', (await p.textContent('#curso h3')) === 'Llamar al plomero');
  await p.tap('#curso [data-r="hecha"]');
  await p.waitForTimeout(1500);
  await p.tap('#listo');
  await p.waitForTimeout(500);
  chequear('1 vez: hecha, sale de las listas y queda en el historial', !(await p.textContent('#lista-hoy')).includes('plomero') &&
    (await guardadas()).historial.some(h => h.tarea === anotada.id && h.que === 'hecha'));
  // atrasada y próxima
  await p.evaluate(() => {
    const e = JSON.parse(localStorage.getItem('casa-v1'));
    const dia = n => { const f = new Date(); f.setDate(f.getDate() + n); return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`; };
    e.tareas.push({ id: 'banco', nombre: 'Ir al banco', icono: 'check-circle', minutos: 20, unaVez: true, fecha: dia(-1) });
    e.tareas.push({ id: 'regalo', nombre: 'Comprar regalo', icono: 'check-circle', minutos: 30, unaVez: true, fecha: dia(1) });
    localStorage.setItem('casa-v1', JSON.stringify(e));
  });
  await p.reload();
  const atrasada = await p.evaluate(() => {
    const s = document.querySelector('#lista-hoy [data-id="banco"] .atraso');
    return s && [s.textContent, getComputedStyle(s).color];
  });
  chequear('1 vez: sin hacer, pasa al día siguiente con «de ayer» en blanco', !!atrasada && atrasada[0] === 'de ayer' && atrasada[1] === 'rgb(255, 255, 255)', JSON.stringify(atrasada));
  chequear('1 vez: las futuras no están en Hoy', !(await p.textContent('#lista-hoy')).includes('regalo'));
  await p.tap('.pestanas [data-pantalla="tareas"]');
  const proximas = await p.$$eval('#lista-tareas .seccion', ss => ss.map(s => [s.dataset.grupo, [...s.querySelectorAll('.linea')].map(n => n.textContent)]));
  const prox = proximas.find(x => x[0] === 'próximas');
  chequear('1 vez: en Tareas, las futuras en «próximas», con la fecha', !!prox && prox[1][0] === 'mañana · 30 min' && proximas[0][0] === 'para hoy', JSON.stringify(proximas));
  // editar una de 1 vez: elegir otro día
  await p.tap('#lista-tareas [data-id="regalo"] .nombre');
  await p.waitForTimeout(400);
  chequear('1 vez: la hoja abre en «1 vez», con «Mañana» elegido', (await p.getAttribute('#modo [data-op="unavez"]', 'aria-pressed')) === 'true' &&
    (await p.getAttribute('#fecha-unavez [data-op="manana"]', 'aria-pressed')) === 'true' && await p.isHidden('#contadores-frec'));
  await p.tap('#fecha-unavez [data-op="hoy"]');
  await p.tap('#guardar-tarea');
  await p.waitForTimeout(400);
  chequear('1 vez: pasarla a hoy la lleva a «para hoy»', (await guardadas()).tareas.find(t => t.id === 'regalo').fecha === (await guardadas()).las3.dia);
  await p.tap('.pestanas [data-pantalla="hoy"]');

  // el error de «Hola»: con menos de 3 en las 3 de hoy, lo que se crea después y toca aparece en Hoy
  await p.evaluate(() => {
    const e = JSON.parse(localStorage.getItem('casa-v1'));
    e.tareas = e.tareas.filter(t => !t.unaVez).slice(0, 1);
    e.las3 = null;
    localStorage.setItem('casa-v1', JSON.stringify(e));
  });
  await p.reload();
  await p.tap('#lista-hoy [data-id="cama"] [data-circulo]');
  await p.waitForTimeout(600);
  await p.tap('.pestanas [data-pantalla="tareas"]');
  await p.tap('#nueva-tarea');
  await p.waitForTimeout(400);
  await p.fill('#nombre-tarea', 'Hola');
  await p.tap('#guardar-tarea');
  await p.waitForTimeout(400);
  await p.tap('.pestanas [data-pantalla="hoy"]');
  const conHola = await filasHoy();
  chequear('hoy: lo que toca y se crea después aparece en Hoy (nunca «no toca nada» si hay algo)', conHola.some(f => f[0] === 'Hola' && f[1] === 'toca') &&
    !(await p.textContent('#lista-hoy')).includes('no toca nada'), JSON.stringify(conHola));
  await p.evaluate(() => localStorage.clear());
  await p.reload();

  // copia de seguridad
  await p.tap('.pestanas [data-pantalla="ajustes"]');
  const antesCopia = await guardadas();
  const [bajada] = await Promise.all([p.waitForEvent('download'), p.tap('#bajar-copia')]);
  const textoBajado = fs.readFileSync(await bajada.path(), 'utf8');
  const copiaJson = JSON.parse(textoBajado);
  chequear('copia: «Bajar copia» baja un .json con todo el estado', /^casa-copia-\d{4}-\d{2}-\d{2}\.json$/.test(bajada.suggestedFilename()) &&
    copiaJson.app === 'casa' && copiaJson.version === antesCopia.version && copiaJson.tareas.length === antesCopia.tareas.length &&
    copiaJson.historial.length === antesCopia.historial.length && /^\d{2}:\d{2}$/.test(copiaJson.copia.hora), bajada.suggestedFilename());
  // cambiar algo y después volver a la copia
  await p.evaluate(() => { const e = JSON.parse(localStorage.getItem('casa-v1')); e.tareas = e.tareas.slice(1); localStorage.setItem('casa-v1', JSON.stringify(e)); });
  await p.reload();
  await p.tap('.pestanas [data-pantalla="ajustes"]');
  await p.setInputFiles('#archivo-copia', { name: 'casa-copia.json', mimeType: 'application/json', buffer: Buffer.from(textoBajado) });
  await p.waitForTimeout(450);
  chequear('copia: al cargarla, pide confirmación con un resumen', await p.evaluate(() => document.getElementById('hoja-copia').classList.contains('abierta')) &&
    (await p.textContent('#texto-copia')).includes(`${antesCopia.tareas.length} tareas`) && await p.isVisible('#reemplazar'), await p.textContent('#texto-copia'));
  chequear('copia: hasta confirmar, no cambia nada', (await guardadas()).tareas.length === antesCopia.tareas.length - 1);
  await p.tap('#reemplazar');
  await p.waitForTimeout(400);
  const despues = await guardadas();
  chequear('copia: «Reemplazar» vuelve a lo de la copia', despues.tareas.length === antesCopia.tareas.length &&
    JSON.stringify(despues.historial) === JSON.stringify(antesCopia.historial) && despues.copia === undefined && (await p.textContent('#nota-copia')) === 'Copia cargada.');
  await p.setInputFiles('#archivo-copia', { name: 'otra.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"atril","version":1}') });
  await p.waitForTimeout(450);
  chequear('copia: un archivo que no es una copia no se carga', (await p.textContent('#texto-copia')) === 'El archivo no es una copia de casa.' && await p.isHidden('#reemplazar'));
  await p.tap('#cerrar-copia');
  await p.waitForTimeout(400);
  await p.setInputFiles('#archivo-copia', { name: 'vieja.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"casa","version":1}') });
  await p.waitForTimeout(450);
  await p.tap('#reemplazar');
  await p.waitForTimeout(400);
  const vieja = await guardadas();
  chequear('copia: una copia de una versión vieja se migra', vieja.version === antesCopia.version && vieja.tareas.length === 9 && vieja.las3 && vieja.las3.ids.length === 3);
  await p.tap('.pestanas [data-pantalla="hoy"]');

  // instalable
  const man = await (await p.request.get(U + 'manifest.json')).json();
  chequear('instalable: manifest con start_url y scope neutros', man.start_url === './' && man.scope === './' && man.display === 'standalone', JSON.stringify(man));
  const icono = await p.getAttribute('link[rel="apple-touch-icon"]', 'href');
  chequear('instalable: apple-touch-icon', icono === 'icono-180.png' && (await p.request.get(U + icono)).ok());
  chequear('instalable: los íconos del manifest existen', (await Promise.all(man.icons.map(i => p.request.get(U + i.src)))).every(r => r.ok()));

  // sin internet: con el service worker activo, cortar la red y recargar
  const activo = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
  chequear('sin internet: service worker activo', activo);
  await p.reload();
  await p.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 5000 }).catch(() => {});
  await ctx.setOffline(true);
  let sinRed = false;
  try { await p.reload({ timeout: 10000 }); sinRed = (await p.textContent('#titulo')) === 'hoy'; } catch (e) { sinRed = false; }
  chequear('sin internet: recarga y abre igual', sinRed);
  chequear('sin internet: la letra sigue (va embebida)', await p.evaluate(() => document.fonts.check('700 40px "League Spartan"')));
  await ctx.setOffline(false);

  // instalada (display-mode: standalone): la zona segura de abajo no se suma (iOS 26 ya la deja afuera)
  const reglaInstalada = await p.evaluate(() => [...document.styleSheets].some(h => [...h.cssRules].some(r =>
    r.media && /display-mode:\s*standalone/.test(r.media.mediaText) && /--abajo:\s*0px/.test(r.cssText))));
  chequear('instalada: la zona segura de abajo vale 0 (no se cuenta 2 veces)', reglaInstalada);

  chequear('sin errores en la consola', errores.length === 0, errores.join(' | '));
  console.log(`\n${pasan} de ${pasan + fallan} pasan`);
  await browser.close();
  srv.close();
  process.exit(fallan ? 1 : 0);
})();
