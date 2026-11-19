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
  const guardado = await p.evaluate(() => localStorage.getItem('casa-v1'));
  chequear('datos: guarda en casa-v1 con la versión', guardado === JSON.stringify({ app: 'casa', version: 1 }), guardado);
  await p.evaluate(() => localStorage.setItem('casa-v1', '{roto'));
  await p.reload();
  const tras = await p.evaluate(() => [localStorage.getItem('casa-v1'), localStorage.getItem('casa-v1-roto')]);
  chequear('datos: si lo guardado está roto, lo guarda aparte y arranca', tras[0] === JSON.stringify({ app: 'casa', version: 1 }) && tras[1] === '{roto', JSON.stringify(tras));
  await p.evaluate(() => localStorage.removeItem('casa-v1-roto'));

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

  // instalada, con un alto menor que la pantalla (el iPhone deja afuera la barra de inicio): la app igual llega hasta abajo
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 810 }, screen: { width: 390, height: 844 }, isMobile: motor === 'chromium', hasTouch: true });
  await ctx2.addInitScript(() => Object.defineProperty(navigator, 'standalone', { get: () => true }));
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => errores.push(e.message));
  await p2.goto(U);
  const instalada = await p2.evaluate(() => [document.body.getBoundingClientRect().height, document.querySelector('.pestanas').getBoundingClientRect().bottom]);
  chequear('instalada: llega hasta abajo de la pantalla, sin franja', instalada[0] === 844 && instalada[1] === 844, JSON.stringify(instalada));
  await ctx2.close();
  chequear('en Safari (sin instalar): no cambia el alto', await p.evaluate(() => !document.documentElement.classList.contains('alto-pantalla')));

  chequear('sin errores en la consola', errores.length === 0, errores.join(' | '));
  console.log(`\n${pasan} de ${pasan + fallan} pasan`);
  await browser.close();
  srv.close();
  process.exit(fallan ? 1 : 0);
})();
