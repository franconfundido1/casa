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
- ¿Respeta `docs/diseno.md`? ¿Algo se ve hecho a mano (ícono de otra familia, botón propio, algo que aparece de golpe, una caja que no flota con sombra)?
- ¿La misma información aparece en más de 1 lugar de la pantalla? Que aparezca en 1 solo.
- ¿Algún texto se contradice con otro o sobreexplica? Textos cortos.
- ¿Alguna conclusión sale de pocos datos (1 día, 1 vez)?
- ¿Las fechas se calculan en días locales (Argentina, UTC−3) y no en UTC? Probar cerca de la medianoche.

### Formato de los reportes

Corto, en 3 partes:

1. **Qué cambió** (con lo que decidí, en 1 línea, solo si hace falta).
2. **Pruebas:** los números de cada suite.
3. **Preguntas.**

Capturas solo si cambió algo que se ve o si las pido. Capturas a 390×844 (iPhone). Si cambió algo que se ve, decir qué mirar en el iPhone.

### Gastar menos

- Mientras programás, corré solo las pruebas de lo que tocaste. El set completo, 1 sola vez al final, antes de reportar.
- No vuelvas a leer un archivo que ya leíste en la misma sesión si no cambió.

## Diseño

**El diseño se define antes de programar, comparando con apps reales, no desde principios abstractos.** Ningún PR de código hasta que estén aprobados `docs/diseno.md` (el sistema) y los bocetos de las pantallas principales en `bocetos/`. Lo nuevo se bocetea antes con ese sistema.

Las reglas:

1. **Referencias reales:** Recordatorios de Apple, Things 3, Todoist y Streaks. Lo que las hace sentir app está anotado en `docs/referencias.md`, con las capturas del usuario. Ante una duda de diseño, se mira cómo lo resuelven ellas.
2. **Lo visual sale de la app de hábitos** (`docs/referencias/habitos-*.png`), dada vuelta a modo oscuro: blanco lleno sobre negro. Si choca con Apple, en lo visual manda la de hábitos. De Apple quedan solo:
   - Zonas seguras: `env(safe-area-inset-*)` para la isla y la barra de inicio.
   - Hojas que suben desde abajo; se cierran con un botón o tocando afuera. Cerrarlas arrastrando, solo si queda igual que en iOS.
   - Barra de pestañas fija abajo, con 3 pestañas (ícono y etiqueta): **Hoy, Tareas y Ajustes**. Nunca pestañas de relleno.
   - Todo lo de «se siente app» (regla 4).
   - Letra: League Spartan (embebida, SIL OFL) para todo. En el entorno de pruebas (Linux) las capturas de Playwright **no sirven para aprobar diseño**; lo que vale es lo que el usuario ve en su iPhone.
3. **1 sola familia de íconos, embebida: Phosphor** (MIT), relleno donde importa (la pestaña elegida) y contorno en lo chico. Nada de emojis ni íconos de otra familia. Los SF Symbols no se usan (su licencia no lo permite en una web).
4. **Se siente app, no web:**
   - Transiciones cortas entre pantallas (unos 200 a 300 ms); con `prefers-reduced-motion`, sin animación.
   - Sin selección de texto al mantener apretado (salvo en los campos de texto), sin resaltado al tocar (`-webkit-tap-highlight-color: transparent`), sin menú de enlace al mantener apretado.
   - Sin «arrastrar para recargar» ni rebote de la página: la barra de pestañas y la de arriba quedan quietas, solo se mueve el contenido (`overscroll-behavior: none`).
   - Nada aparece de golpe: lo que entra o cambia, entra con una transición corta.
   - Toques de 44 px como mínimo; botones con los componentes de `docs/diseno.md`, no hechos a mano.
5. **Sombra solo en lo que flota** (hojas, menús). El resto plano: la jerarquía sale del tamaño y del color, no de cajas.
6. **Sistema de diseño escrito** en `docs/diseno.md`: colores con 1 trabajo cada uno, escala de tamaños (variables CSS, sin valores sueltos), componentes. Bocetos aprobados en `bocetos/`.
7. **Identidad propia y sobria.** Nada de combinaciones «premium» genéricas (degradés, violeta con negro, vidrio por todos lados). No copiar la identidad de Akordia.

Además:

- **Solo modo oscuro** (decidido): no hay modo claro ni se sigue el modo del sistema. Fondo negro como Recordatorios.
- iPhone en vertical, 390×844 de referencia; se usa con 1 mano, de pasada: lo importante en la mitad de abajo, poco texto, estados inequívocos (toca, hecha, salteada, a medias, esperando).
- Flujo lineal, pocos botones visibles. Lo que se usa poco va en un menú «⋯».

## Estructura del repo

Igual que en Akordia, que funcionó:

- `codigo/reglas/`: reglas puras, sin DOM ni fecha del sistema (`fechas.js`, `estado.js` con las migraciones, `tareas.js` con los vencimientos, `hoy.js` con las 3 de hoy y «Tengo X minutos»; después la ropa), con pruebas en `codigo/tests/`. Cada archivo termina con `module.exports` para las pruebas y va igual en la página.
- `codigo/pagina/`: la página. `plantilla.html` es el esqueleto: cada línea `<!-- incluir: ruta -->` (ruta desde `codigo/`) se reemplaza por ese archivo, en ese orden. `estilos/` (`base.css`: variables y «se siente app»; `componentes.css`), `pantallas/` (cabecera, hoy, tareas, ajustes, pestañas) y `logica/` (datos, navegación, tareas, hoy, inicio). Un archivo nuevo se suma a la plantilla (`build.py` avisa si sobra alguno).
- `codigo/recursos/`: la letra (League Spartan, `woff2`, va embebida en base64), los íconos de Phosphor (`iconos.svg`) y los íconos de la app (círculo lleno, 180, 192 y 512 px).
- `codigo/sw.js`: el service worker (primero la red; sin red, el caché `casa-v1`).
- `codigo/build.py`: junta todo en 1 solo HTML en `salida/` (solo necesita `python3`).
- `salida/`: lo que se publica (`index.html`, `sw.js`, `manifest.json`, íconos y la licencia de la letra). Se commitea compilado.
- `bocetos/`: los bocetos aprobados (HTML que se abre en el iPhone).
- `docs/`: el detalle (abajo).

## Compilar, probar y publicar

- Compilar: `python3 codigo/build.py` (actualiza `salida/`; commitear `salida/` junto con el código).
- Reglas: `node --test codigo/tests/*.test.js` (sin dependencias; con Node 22 hay que pasar los archivos, no la carpeta). Las de fechas corren con la zona de Argentina.
- Página: `python3 codigo/build.py && timeout 120 node codigo/test_pagina.js`. Sirve `salida/` y la abre a 390×844 táctil: carga, «se siente app», cambio de pestaña, datos, instalable y recarga sin red con el service worker. Usa WebKit si está; si no, Chromium, y el reporte avisa que falta probar en el iPhone de verdad (Playwright ya está en el entorno; no correr `playwright install`).
- Lo que no se puede probar acá (instalar desde Safari, modo avión en el iPhone, el ícono) se lista en el reporte para que lo pruebe el usuario.
- Resultado esperado (único lugar donde está; actualizarlo cuando cambie):

  | Suite | Pasan |
  |---|---|
  | reglas (`node --test`) | 51 |
  | página (`test_pagina.js`) | 73 |

- Publicar: solo con el workflow «Publicar en Neocities» (`.github/workflows/publicar.yml`), que corre al fusionar en main y sube `salida/` a la raíz de franketf2.neocities.org y `bocetos/` a `/bocetos/`. Nada se sube a mano.

## Reglas de datos

- Los datos viven en el dispositivo: **cualquier cambio en la forma de guardarlos necesita una migración** (el estado tiene un número de versión; `cargar()` migra de una versión a la siguiente). Un campo nuevo opcional puede ir sin migración si `cargar()` lo limpia cuando no es válido.
- **Nombres internos que no se renombran nunca** (cambiarlos rompe datos o la app instalada): `index.html`, `sw.js`, `start_url` y `scope` del manifest, la clave `casa-v1`, el caché del service worker y `app: 'casa'` en la copia. Por eso son neutros desde el día 1 (en Akordia quedó «atril-p45» para siempre).
- Las fechas se guardan como día local `AAAA-MM-DD`; las horas, como hora local. Nunca calcular «días que pasaron» con milisegundos en UTC.
- El historial es aditivo: no se borra lo que el usuario hizo.
- En el iPhone, los datos de la app instalada son distintos de los de Safari: si se instala de nuevo, arranca vacía. Por eso la copia de seguridad está desde el principio.

## Índice de `docs/`

- `vision.md`: para qué existe la app, principios, reglas de decisión, versión 1, versión 2 y plan de PRs. Leelo antes de proponer una feature.
- `referencias.md`: lo que hace sentir app a Recordatorios, Things 3, Todoist y Streaks (con las capturas). Si tocás algo que se ve.
- `diseno.md`: el sistema de diseño (colores, escala, componentes). Si tocás cualquier estilo.
- `pendientes.md`: lo anotado para después (se crea cuando haga falta).
