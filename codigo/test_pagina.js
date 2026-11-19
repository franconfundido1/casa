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
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: motor === 'chromium', hasTouch: true });
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
  chequear('datos: guarda en casa-v1 con la versión 2 y las 9 tareas', guardado.app === 'casa' && guardado.version === 2 && guardado.tareas.length === 9 && guardado.historial.length === 0, JSON.stringify(guardado).slice(0, 80));
  await p.evaluate(() => localStorage.setItem('casa-v1', '{roto'));
  await p.reload();
  const tras = await p.evaluate(() => [JSON.parse(localStorage.getItem('casa-v1')), localStorage.getItem('casa-v1-roto')]);
  chequear('datos: si lo guardado está roto, lo guarda aparte y arranca', tras[0].version === 2 && tras[0].tareas.length === 9 && tras[1] === '{roto', JSON.stringify(tras).slice(0, 80));
  await p.evaluate(() => { localStorage.setItem('casa-v1-roto', ''); localStorage.setItem('casa-v1', JSON.stringify({ app: 'casa', version: 1, otra: 1 })); });
  await p.reload();
  const migrado = await p.evaluate(() => JSON.parse(localStorage.getItem('casa-v1')));
  chequear('datos: migra de la versión 1 a la 2 con las 9 tareas', migrado.version === 2 && migrado.tareas.length === 9 && migrado.otra === 1);

  // tareas
  const filas = () => p.$$eval('#lista-tareas .seccion', ss => ss.map(s => [s.querySelector('h2').textContent, [...s.querySelectorAll('.fila .nombre')].map(n => n.textContent)]));
  const guardadas = () => p.evaluate(() => JSON.parse(localStorage.getItem('casa-v1')));
  chequear('tareas: el «+» solo en Tareas', await p.isHidden('#nueva-tarea'));
  await p.tap('.pestanas [data-pantalla="tareas"]');
  chequear('tareas: el «+» aparece en Tareas', await p.isVisible('#nueva-tarea'));
  let g = await filas();
  chequear('tareas: las 9 tocan (nunca hechas), de la más corta a la más larga', JSON.stringify(g) === JSON.stringify([['tocan',
    ['Hacer la cama', 'Lavar la ropa', 'Barrer', 'Lavar los platos', 'Ordenar la ropa', 'Limpiar el baño', 'Pasar el trapo', 'Verdulería', 'Súper']]]), JSON.stringify(g));
  chequear('tareas: 1 línea gris corta', (await p.textContent('#lista-tareas [data-id="verduleria"] .linea')) === 'cada 3 a 4 días · 20 min');
  chequear('tareas: las filas no tienen ícono de tarea, solo el círculo', (await p.$$('#lista-tareas .fila svg')).length === 9);
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
    nota: !document.getElementById('nota-frec').hidden, guardar: document.getElementById('guardar-tarea').disabled,
  }));
  chequear('hoja: abre con los datos de la tarea', hoja.abierta && hoja.nombre === 'Verdulería' && hoja.icono === '#carrot-fill' && hoja.entre === 'true' && hoja.desde === '3' && hoja.hasta === '4' && hoja.minutos === '20', JSON.stringify(hoja));
  chequear('hoja: con «Entre», la nota; «Guardar» apagado hasta cambiar algo', hoja.nota && hoja.guardar);
  await p.tap('#c-minutos [data-mas]');
  chequear('hoja: al cambiar algo se prende «Guardar»', !(await p.isDisabled('#guardar-tarea')));
  await p.tap('#modo [data-op="cada"]');
  chequear('hoja: con «Cada», 1 contador y sin nota', await p.isHidden('#c-hasta') && await p.isHidden('#nota-frec'));
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
  chequear('borrar: el 1.º toque avisa y no borra', (await p.textContent('#borrar-tarea')) === 'Tocá de nuevo para borrar' && (await guardadas()).tareas.length === 10);
  await p.tap('#borrar-tarea');
  await p.waitForTimeout(400);
  chequear('borrar: el 2.º toque la borra', (await guardadas()).tareas.length === 9 && !(await p.textContent('#lista-tareas')).includes('Regar'));
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
