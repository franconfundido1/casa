# Akordia para la casa

Lo que hace falta para cualquier tarea. El detalle va en `docs/` (índice abajo): leé solo el archivo del tema que vas a tocar.

## Qué es

- App personal para ordenar el día en la casa: tareas, ropa, comida y súper. **La app decide qué hacer y cuándo**; el usuario solo dice cuánto tiempo tiene y marca lo que hizo.
- Se usa en un **iPhone, en vertical, instalada desde Safari** («Agregar a inicio»). No en la tablet ni en Chrome.
- 1 solo archivo HTML, sin servidor. Funciona sin internet (service worker).
- Los datos viven en el dispositivo (localStorage, clave `casa-v1`), con copia de seguridad para bajar y volver a cargar.
- Es un proyecto aparte de Akordia (la app de piano, repo `atril`): no comparten código, datos ni sitio.
- **Antes de proponer una feature, leé `docs/vision.md`.**

## Reglas de trabajo

- Responder siempre en español rioplatense (voseo). Números con cifras, nunca con letras (también en la app).
- 1 PR por vez, chico, con sus pruebas. No pushear ni abrir un PR sin el OK del usuario. Él fusiona los PR; no hace falta vigilarlos.
- Sin IA ni servidor: reglas claras, escritas y probadas, que funcionen sin internet. Si una regla no se puede explicar en 1 o 2 líneas, está mal.
- Las reglas de decisión (qué toca, en qué orden, qué entra en X minutos) son funciones puras, sin DOM ni fecha del sistema: reciben «hoy» y «ahora» como parámetro. Así se prueban.
- Los números de las reglas (umbrales, minutos, demoras) son provisorios: se revisan con el uso real, no se dan por buenos.
- Nada que el usuario no vaya a usar esta semana. Si una idea es para más adelante, va a `docs/pendientes.md`, no al código.

### Antes de mandar un resultado

Chequear siempre:

- ¿Se entiende en 2 segundos qué hacer ahora? 1 tarea por vez, 1 botón principal.
- ¿Se usa con 1 mano y el pulgar? Toques de 44 px como mínimo, lo importante en la mitad de abajo.
- ¿La misma información aparece en más de 1 lugar de la pantalla? Que aparezca en 1 solo.
- ¿Algún texto se contradice con otro o sobreexplica? Textos cortos.
- ¿Alguna conclusión sale de pocos datos (1 día, 1 vez)?
- ¿Las fechas se calculan en días locales (Argentina, UTC−3) y no en UTC? Probar cerca de la medianoche.

### Formato de los reportes

Corto, en 3 partes:

1. **Qué cambió** (con lo que decidí, en 1 línea, solo si hace falta).
2. **Pruebas:** los números de cada suite.
3. **Preguntas.**

Capturas solo si cambió algo que se ve o si las pido. Capturas a 390×844 (iPhone).

### Gastar menos

- Mientras programás, corré solo las pruebas de lo que tocaste. El set completo, 1 sola vez al final, antes de reportar.
- No vuelvas a leer un archivo que ya leíste en la misma sesión si no cambió.

## Diseño

- iPhone en vertical, 390×844 de referencia; respetar las zonas seguras (`env(safe-area-inset-*)`) y la barra de inicio.
- Se mira de pasada, con las manos ocupadas: letra grande, poco texto, estados inequívocos (toca, hecha, salteada, a medias, esperando).
- Flujo lineal, pocos botones visibles. Lo que se usa poco va en un menú «⋯».
- Fuentes embebidas en la página (sin Google Fonts, porque tiene que andar sin internet). Nada de fuentes genéricas que hagan parecer la app «hecha con IA».
- La identidad visual (colores, tipografía) se decide después de usarla un tiempo; hasta entonces, sobria y con la escala en variables CSS (sin valores sueltos), para cambiarla en 1 solo lugar.
- No copiar la identidad de Akordia: es otra app, en otro dispositivo.

## Estructura del repo

Se arma en el PR 1. La idea (igual que en Akordia, que funcionó):

- `codigo/reglas/`: reglas puras (vencimientos, «Tengo X minutos», la mañana, la ropa), con pruebas en `codigo/tests/`.
- `codigo/pagina/`: la página. `plantilla.html` es el esqueleto: cada línea `<!-- incluir: ruta -->` se reemplaza por ese archivo, en ese orden. `estilos/`, `pantallas/` y `logica/`.
- `codigo/build.py`: junta todo en 1 solo HTML en `salida/` (solo necesita `python3`).
- `salida/`: lo que se publica (`index.html`, `sw.js`, manifest e íconos). Se commitea compilado.
- `docs/`: el detalle (abajo).

## Compilar, probar y publicar

Se completa en el PR 1, con los comandos exactos y la tabla de resultados esperados (único lugar donde está; actualizarla cuando cambie). La idea:

- Reglas: `node --test codigo/tests/` (sin dependencias).
- Página: Playwright con viewport de iPhone (390×844, `isMobile`, `hasTouch`). Si en el entorno está WebKit, usarlo; si no, Chromium, y avisar en el reporte que falta probar en el iPhone de verdad.
- Sin internet: la prueba de la PWA abre la app, corta la red y recarga.
- Lo que no se puede probar acá (instalar desde Safari, modo avión en el iPhone) se lista en el reporte para que lo pruebe el usuario.

## Reglas de datos

- Los datos viven en el dispositivo: **cualquier cambio en la forma de guardarlos necesita una migración** (el estado tiene un número de versión; `cargar()` migra de una versión a la siguiente). Un campo nuevo opcional puede ir sin migración si `cargar()` lo limpia cuando no es válido.
- **Nombres internos que no se renombran nunca** (cambiarlos rompe datos o la app instalada): `index.html`, `sw.js`, `start_url` y `scope` del manifest, la clave `casa-v1`, el caché del service worker y `app: 'casa'` en la copia. Por eso son neutros desde el día 1 (en Akordia quedó «atril-p45» para siempre).
- Las fechas se guardan como día local `AAAA-MM-DD`; las horas, como hora local. Nunca calcular «días que pasaron» con milisegundos en UTC.
- El historial es aditivo: no se borra lo que el usuario hizo.
- En el iPhone, los datos de la app instalada son distintos de los de Safari: si se instala de nuevo, arranca vacía. Por eso la copia de seguridad está desde el principio.

## Índice de `docs/`

- `vision.md`: para qué existe la app, principios, reglas de decisión, versión 1, versión 2 y plan de PRs. Leelo antes de proponer una feature.
- `pendientes.md`: lo anotado para después (se crea cuando haga falta).
