# Sistema de diseño

Solo modo oscuro. Cada decisión dice de qué referencia sale (`docs/referencias.md`). Los valores viven como variables CSS en `bocetos/sistema.css`; el código de la app los copia de ahí (no hay valores sueltos).

Los valores en px son puntos de iOS (390×844 de referencia). Lo que vale es cómo se ve en el iPhone: las capturas de Linux no tienen la letra de Apple.

## Colores: 1 trabajo cada uno

| Variable | Valor | Trabajo | De dónde sale |
|---|---|---|---|
| `--fondo` | `#000000` | Fondo de todas las pantallas | Recordatorios: negro puro en modo oscuro |
| `--superficie` | `#1C1C1E` | Grupos de filas (listas) | Recordatorios y Todoist: bloques gris muy oscuro, sin sombra |
| `--flotante` | `#2C2C2E` | Lo que flota: hojas, menú, cápsulas, barra de pestañas | Recordatorios: la hoja y el menú son 1 tono más claros que los grupos |
| `--relleno` | `rgba(118,118,128,.24)` | Fondo de controles: contador, selector, botones secundarios | iOS (`tertiarySystemFill`) |
| `--separador` | `rgba(84,84,88,.65)` | Líneas finas entre filas | iOS (`separator`) |
| `--texto` | `#FFFFFF` | Nombres de tareas, títulos | Todas |
| `--texto-2` | `rgba(235,235,245,.6)` | La línea gris de la fila, encabezados de grupo, notas | Recordatorios: la línea gris de datos |
| `--texto-3` | `rgba(235,235,245,.3)` | Lo apagado: botón desactivado, texto de ejemplo | Hábitos: «Crear hábito» apagado |
| `--acento` | `#F5B83D` | **Lo que toca**: la tarea que sigue, la pestaña elegida, el botón principal, el ✓ de guardar | Todoist: 1 solo acento para «acá». Ámbar propio (no el coral de Todoist ni el naranja de Recordatorios) |
| `--sobre-acento` | `#000000` | Texto e íconos sobre el acento | Contraste: ámbar con negro se lee mejor que con blanco |
| `--hecha` | `#30D158` | Estado hecha | iOS: verde = listo (interruptores de Recordatorios) |
| `--a-medias` | `#0A84FF` | Estado a medias | iOS (`systemBlue`): «en proceso», distinto del ámbar y del verde |
| `--borrar` | `#FF453A` | Solo «Borrar tarea» | iOS: rojo = destructivo |

Salteada y esperando **no tienen color propio**: van en `--texto-2`, porque saltear no es fallar (`vision.md`) y esperar no es una tarea para hacer. Se distinguen por el ícono.

Sin degradés, sin violeta, sin vidrio por todos lados (`referencias.md`, «Lo que no»). El único desenfoque está en la barra de pestañas y en el menú, que flotan sobre el contenido.

## Estados de una tarea

El estado se dice con el círculo de la izquierda, no con palabras (Hábitos y Recordatorios).

| Estado | Círculo | Nombre |
|---|---|---|
| Toca | Vacío, borde `--acento` | `--texto` |
| No toca todavía | Vacío, borde `--texto-3` | `--texto` |
| Hecha | Relleno `--hecha`, ✓ negro | `--texto-2` |
| Salteada | Borde `--texto-3`, flecha → gris | `--texto-2` |
| A medias | Mitad izquierda rellena `--a-medias` | `--texto` |
| Esperando | Borde punteado `--texto-3`, reloj gris | `--texto-2`, la línea dice desde qué hora |

Círculo de 24 px, con zona de toque de 44 px (Recordatorios: el círculo es del tamaño de un dedo).

## Letra

`-apple-system` (SF Pro en el iPhone). Escala de iOS (Dynamic Type, tamaño por defecto):

| Variable | Tamaño / alto de línea | Peso | Uso |
|---|---|---|---|
| `--letra-titulo-grande` | 34 / 41 | bold | Título de la pestaña («Hoy», «Tareas») |
| `--letra-titulo` | 28 / 34 | bold | Nombre de la tarea en curso; número del contador grande |
| `--letra-titulo-2` | 22 / 28 | bold | Nombre en la hoja de editar |
| `--letra-encabezado` | 17 / 22 | semibold | Encabezado de grupo, botones, título de la hoja |
| `--letra-cuerpo` | 17 / 22 | regular | Nombre de la tarea en la fila |
| `--letra-secundaria` | 15 / 20 | regular | La línea gris de la fila |
| `--letra-nota` | 13 / 18 | regular | Nota debajo de un grupo, fecha arriba del título |
| `--letra-pestana` | 11 / 13 | medium | Etiqueta de la pestaña |

Números con cifras siempre, y `font-variant-numeric: tabular-nums` en contadores y horas (no bailan al cambiar).

## Espacios y medidas

| Variable | Valor | Uso |
|---|---|---|
| `--esp-1` … `--esp-8` | 4, 8, 12, 16, 20, 24, 32, 40 | Única escala de márgenes y separaciones |
| `--margen` | 16 | Margen de los costados (iOS, listas agrupadas) |
| `--toque` | 44 | Mínimo de cualquier cosa que se toca (HIG) |
| `--alto-boton` | 50 | Botón principal |
| `--alto-fila` | 52 | Fila de 1 línea; la de 2 líneas crece sola |
| `--radio-grupo` | 20 | Grupos de filas (Recordatorios, iOS 26) |
| `--radio-menu` | 26 | Menú «⋯» |
| `--radio-hoja` | 38 | Esquinas de arriba de la hoja (iOS 26) |
| `--radio-capsula` | 999 | Botones, cápsulas, barra de pestañas, selector |

## Sombra

Solo en lo que flota (hojas, menú, barra de pestañas, cápsula de arriba): `--sombra-flota` (`0 10px 40px rgba(0,0,0,.6)`) más un borde de 0,5 px `--borde-flota` (`rgba(255,255,255,.08)`). Sobre negro la sombra sola no se ve; el borde fino es lo que usa Recordatorios en el menú. Grupos de filas: planos.

## Íconos

1 sola familia: **Phosphor** 2.1.1 (MIT), embebida como `<symbol>` (en los bocetos, `bocetos/iconos.svg`; en la app, dentro del HTML). Contorno (`regular`) en general; relleno (`fill`) solo en la pestaña elegida; `bold` solo para el ✓ y la flecha adentro de los círculos de estado (con trazo fino no se ven a 14 px). Tamaño: 24 px en barras y filas, 28 px en la barra de pestañas.

| Para | Ícono |
|---|---|
| Hoy / Tareas / Ajustes | `sun` / `list-checks` / `gear-six` |
| Cerrar / Guardar | `x` / `check` (bold) |
| Agregar / Menú | `plus` / `dots-three` |
| Contador | `minus` / `plus` |
| Salteada / Esperando | `arrow-right` (bold) / `clock` |
| Menú «⋯» | `sort-ascending`, `arrow-counter-clockwise`, `caret-right` |
| Borrar | `trash` |

Nada de emojis ni SF Symbols.

## Componentes

### Barra de pestañas

De Todoist (iOS 26): cápsula flotante abajo, a `--esp-5` de los costados y sobre la barra de inicio (`env(safe-area-inset-bottom)`). Fondo `--flotante` al 80 % con desenfoque, sombra de lo que flota. 3 pestañas con ícono **y** etiqueta (Hábitos sin etiqueta: hay que adivinar). La elegida: ícono relleno y etiqueta en `--acento`, sobre una cápsula interna más clara (`--relleno`). Cambiar de pestaña: el contenido aparece con un fundido de 200 ms.

### Título de la pantalla

Recordatorios: título grande en negrita a la izquierda (`--letra-titulo-grande`), con la fecha en gris chico arriba solo en Hoy.

### Cápsula de botones arriba

Recordatorios y Todoist: los botones de arriba a la derecha van juntos en 1 cápsula `--flotante` de 44 px de alto, 1 ícono de 24 px por botón, cada uno de 44×44. Con 1 solo botón es un círculo. En Tareas: «+» y «⋯». Hoy no tiene: no hay nada poco usado ahí.

### Grupo y fila de tarea

Recordatorios (la fila) dentro de los grupos de Todoist (el bloque):

- Grupo: `--superficie`, `--radio-grupo`, a `--margen` de los costados. Encabezado arriba en `--letra-encabezado` y `--texto-2`, fuera del bloque. Nota gris chica **debajo** del grupo si hace falta explicar algo.
- Fila: círculo de estado, nombre (`--letra-cuerpo`) y **1 línea gris** (`--letra-secundaria`, `--texto-2`): «Cada 3 días · 10 min · hace 5 días». Lo que no toca dice cuándo toca («en 2 días»); lo que espera, desde qué hora.
- Separador fino que **empieza después del círculo** (Todoist), no en el borde. Sin separador después de la última fila.
- Tocar el círculo marca hecha; tocar la fila abre la hoja de editar. Al tocar, la fila se oscurece 100 ms (como iOS), sin el resaltado azul del navegador.

### Hoja

Recordatorios (detalle) y Hábitos (nuevo):

- Sube desde abajo (300 ms, `--curva-ios`); lo de atrás se oscurece (`rgba(0,0,0,.5)`). Esquinas de arriba `--radio-hoja`. Casi a pantalla completa: arriba deja ver el borde de la pantalla de atrás.
- Arriba: **«×» en un círculo** `--relleno` a la izquierda, título chico al centro (`--letra-encabezado`), **«✓» en un círculo** a la derecha: `--acento` con ✓ negro cuando se puede guardar; `--relleno` con ✓ en `--texto-3` mientras no (Hábitos: el botón apagado hasta que el formulario está completo).
- Se cierra con «×» o tocando afuera. No se arrastra para cerrar (no queda igual que en iOS).
- Adentro, grupos con encabezado y nota debajo, como las listas. Tiene que entrar en 1 pantalla (lo que no de Recordatorios).

### Menú «⋯»

Recordatorios: sale del botón «⋯» y crece desde ahí (200 ms, de 90 % a 100 % y de transparente a opaco). Flota: `--flotante` con desenfoque, `--radio-menu`, sombra y borde fino. Filas de 44 px como mínimo: ícono a la izquierda y texto; el valor elegido en gris debajo («Ordenar por / Más vencida»); «›» si abre otra cosa; línea fina entre grupos. Se cierra tocando afuera o eligiendo algo. Es un menú, no una hoja.

### Contador − y +

Hábitos: − y + en círculos `--relleno` de 44 px, el número en el medio y la unidad debajo en gris. 2 tamaños:

- **Grande** (Hoy, «Tengo X minutos»): número en `--letra-titulo`, unidad debajo.
- **En fila** (hoja): nombre de la fila a la izquierda («Minutos») y a la derecha −, número y + (círculos de 36 px de dibujo dentro de 44 px de toque).

Pasos de 5 en minutos y de 1 en días. En el tope, el botón que no sirve queda en `--texto-3` y no responde. El número cambia con un fundido corto.

### Selector

Hábitos (Diario / objetivo semanal), con la forma del control segmentado de iOS 26: cápsula `--relleno` de 44 px de alto, la opción elegida en una cápsula `--flotante` más clara que se desliza (200 ms). 2 o 3 opciones como máximo. En la hoja: «Cada» / «Entre».

### Botón principal

Hábitos («Crear hábito») con el estilo de botón de iOS 26: cápsula de 50 px, a lo ancho menos los márgenes, `--acento` con texto `--sobre-acento` en `--letra-encabezado`. 1 por pantalla, siempre en la mitad de abajo. Apagado: `--relleno` con texto `--texto-3`, no responde.

Botón secundario: igual de alto, `--relleno` con texto `--texto`. Van lado a lado si son 2 (en la tarea en curso: «A medias» y «Saltear»).

### Transiciones

| Qué | Cómo | Duración |
|---|---|---|
| Hoja | Sube desde abajo; fondo se oscurece | 300 ms, `--curva-ios` (`cubic-bezier(.32,.72,0,1)`) |
| Menú «⋯» | Crece desde el botón y aparece | 200 ms |
| Cambio de pestaña | Fundido del contenido | 200 ms |
| Siguiente tarea | La actual sale a la izquierda, la nueva entra desde la derecha | 250 ms |
| Cambio de estado del círculo | Se rellena con un leve rebote (escala 1 → 1,15 → 1) | 250 ms |
| Número del contador | Fundido | 150 ms |

Con `prefers-reduced-motion`: sin animación, todo cambia al instante.

### Que se sienta app

En `sistema.css`, para todo: `-webkit-tap-highlight-color: transparent`, `user-select: none` y `-webkit-touch-callout: none` (salvo campos de texto), `overscroll-behavior: none`. La página no se mueve: solo se desplaza el contenido; la barra de pestañas queda quieta. Zonas seguras con `env(safe-area-inset-*)`.

## Pantallas (bocetos)

En `bocetos/`, con datos de `vision.md` (miércoles 18 de noviembre, 18:40):

- `hoy.html`: las 3 de hoy, lo que espera (colgar la ropa) y «Tengo X minutos» abajo.
- `hoy.html#curso`: la tarea en curso, de a 1, con hecha, a medias y saltear.
- `tareas.html`: las 9 tareas en 3 grupos (Tocan, Más adelante, Hechas hoy), con el menú «⋯».
- `tareas.html#editar`: la hoja de editar (Verdulería).
- `index.html`: los links y la muestra de colores y estados.
