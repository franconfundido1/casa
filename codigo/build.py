"""Junta la app en 1 solo HTML: salida/index.html, más sw.js, el manifest y los íconos. Solo necesita python3.

En codigo/pagina/plantilla.html, cada línea <!-- incluir: ruta --> se reemplaza por ese archivo (ruta desde codigo/), en ese orden.
"""
import base64, json, pathlib, re, shutil

CODIGO = pathlib.Path(__file__).resolve().parent
SALIDA = CODIGO.parent / 'salida'
RECURSOS = CODIGO / 'recursos'
INCLUIR = re.compile(r'^<!-- incluir: (\S+) -->\n', re.M)

plantilla = (CODIGO / 'pagina' / 'plantilla.html').read_text()
partes = INCLUIR.findall(plantilla)
assert len(partes) == len(set(partes)), 'un archivo incluido 2 veces'
for p in partes:
    assert (CODIGO / p).is_file(), 'la plantilla incluye un archivo que no existe: ' + p
# todo archivo de la página y de las reglas tiene que estar en la plantilla (así no queda nada suelto sin usar)
fuentes = {f.relative_to(CODIGO).as_posix() for d in ('pagina', 'reglas') for f in (CODIGO / d).rglob('*.*')}
sobran = fuentes - set(partes) - {'pagina/plantilla.html'}
assert not sobran, 'archivos que la plantilla no incluye: ' + ', '.join(sorted(sobran))


def archivo(ruta):
    texto = (CODIGO / ruta).read_text()
    if ruta == 'recursos/iconos.svg':
        # el juego de íconos (Phosphor) va escondido: la página los usa con <use href="#nombre">
        texto = texto.replace('<svg xmlns="http://www.w3.org/2000/svg">',
                              '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">', 1)
    assert '</script' not in texto or ruta.endswith('.html'), 'un </script> adentro de ' + ruta
    return texto if texto.endswith('\n') else texto + '\n'


pagina = INCLUIR.sub(lambda m: archivo(m.group(1)), plantilla)
# la letra va embebida (sin Google Fonts): League Spartan, SIL OFL
fuente = base64.b64encode((RECURSOS / 'league-spartan-variable.woff2').read_bytes()).decode()
assert pagina.count('__FUENTE__') == 1
pagina = pagina.replace('__FUENTE__', fuente)
# la versión que se ve en Ajustes: se sube a mano en cada PR que cambia la app
VERSION_APP = '1.1'
assert pagina.count('__VERSION__') == 1
pagina = pagina.replace('__VERSION__', VERSION_APP)

SALIDA.mkdir(exist_ok=True)
(SALIDA / 'index.html').write_text(pagina)
shutil.copy(CODIGO / 'sw.js', SALIDA / 'sw.js')
# los íconos llevan el nombre en el archivo: si cambian, cambia el nombre, así Safari (que guarda los íconos por nombre) baja el nuevo
for f in ('str3ak-180.png', 'str3ak-192.png', 'str3ak-512.png', 'OFL-league-spartan.txt'):
    shutil.copy(RECURSOS / f, SALIDA / f)

# start_url y scope no se cambian nunca (cambiarlos rompe la app instalada)
manifest = {
    'name': 'str3ak', 'short_name': 'str3ak', 'lang': 'es-AR',
    'description': 'Ordena el día en la casa: te dice qué hacer y cuándo.',
    'start_url': './', 'scope': './', 'display': 'standalone',
    'background_color': '#000000', 'theme_color': '#000000',
    'icons': [
        {'src': 'str3ak-180.png', 'sizes': '180x180', 'type': 'image/png'},
        {'src': 'str3ak-192.png', 'sizes': '192x192', 'type': 'image/png'},
        {'src': 'str3ak-512.png', 'sizes': '512x512', 'type': 'image/png'},
    ],
}
(SALIDA / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

print('index.html', len(pagina), 'bytes')
