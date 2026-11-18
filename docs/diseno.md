# Sistema de diseño

Solo modo oscuro, en blanco, negro y grises. Cada decisión dice de qué referencia sale (`docs/referencias.md`). Los valores viven como variables CSS en `bocetos/sistema.css`; el código de la app los copia de ahí (no hay valores sueltos).

Los valores en px son puntos de iOS (390×844 de referencia). Lo que vale es cómo se ve en el iPhone, instalado desde Safari: las capturas de Linux no tienen la letra de Apple.

## Colores: sin acento

Hábitos: casi monocromo, y se entiende igual. Lo que toca se marca con **blanco y tamaño**, no con un color. Cada gris tiene 1 trabajo.

| Variable | Valor | Trabajo | De dónde sale |
|---|---|---|---|
| `--fondo` | `#000000` | Fondo de todas las pantallas; las listas van directo encima | Recordatorios: negro puro |
| `--flotante` | `#1C1C1E` | Hoja y barra de pestañas (sólida) | Recordatorios: la hoja de detalle |
| `--superficie` | `#2C2C2E` | Grupos con caja, **solo dentro de la hoja** | Recordatorios: los grupos de la hoja de detalle |
| `--relleno` | `rgba(118,118,128,.24)` | Fondo de controles: selector, − y +, ×, botón apagado | iOS (`tertiarySystemFill`) |
| `--marca-selector` | `#636366` | La opción elegida del selector | iOS: control segmentado oscuro |
| `--separador` | `rgba(84,84,88,.65)` | Líneas finas entre filas | iOS (`separator`) |
| `--texto` | `#FFFFFF` | Nombres, títulos, lo que toca, la pestaña elegida | Todas |
| `--texto-2` | `rgba(235,235,245,.6)` | La línea gris, encabezados, notas, pestañas no elegidas, salteada | Recordatorios: la línea gris de datos |
| `--texto-3` | `rgba(235,235,245,.3)` | Lo apagado: lo que no toca, botón desactivado | Hábitos: «Crear hábito» apagado |
| `--principal` / `--sobre-principal` | `#FFFFFF` / `#000000` | Botón principal: blanco con letra negra | Hábitos: el botón negro sobre blanco, invertido |
| `--borrar` | `#FF453A` | **Única excepción de color:** solo «Borrar tarea» | iOS: rojo = destructivo |

Sin degradés, sin desenfoque ni transparencias (en el iPhone la barra se teñía del color de lo que tenía atrás).

## Estados de una tarea

El círculo de la izquierda dice el estado con **relleno e ícono, no con color** (Hábitos: círculos llenos o vacíos).

| Estado | Círculo | Nombre |
|---|---|---|
| Toca | Contorno blanco | Blanco |
| No toca todavía | Contorno gris apagado (`--texto-3`) | Gris |
| Hecha | Lleno blanco con ✓ negro | Gris |
| A medias | Contorno blanco, lleno por la mitad | Blanco |
| Salteada | Lleno gris (`--texto-2`) con flecha → negra | Gris |
| Esperando | Contorno gris punteado con reloj gris | Gris; la línea dice desde qué hora |

Círculo de 24 px con zona de toque de 44 px; el ícono de adentro, de 16 px en `bold` para que se vea (con trazo fino parecía un círculo roto). En la tarea en curso, el mismo círculo a 112 px.

## Identidad: minimalismo propio

Modelo: Hábitos (`habitos-*.png`). Blanco, negro y grises, y 2 cosas propias que la hacen reconocible sin agregar color:

- **Una letra propia solo para lo grande:** los títulos, el número de «Tengo X min» y el nombre de la tarea en curso. Todo lo demás, con la letra del sistema.
- **El círculo como firma:** el mismo círculo es el estado de cada tarea, la acción grande de la tarea en curso y el ícono de la app: el círculo lleno de «hecha», blanco sobre negro, sin texto (`bocetos/icono-180.png`).

## Letra

- **Texto:** `-apple-system` (SF Pro en el iPhone).
- **Lo grande: League Spartan 700** (SIL OFL), embebida (archivo `woff2` en la página, sin Google Fonts). Geométrica: la «o» es un círculo, como la firma. Elegida en el iPhone entre 3 opciones (Young Serif y Comfortaa quedaron afuera). Nada de Jost (es la de Akordia) ni de las letras de todas las apps hechas con IA (Inter, Space Grotesk y parecidas).

Escala (Dynamic Type de iOS en tamaño por defecto, salvo lo grande):

| Variable | Tamaño / alto de línea | Letra | Uso |
|---|---|---|---|
| `--letra-enorme` | 42 / 1,1 | League Spartan | Nombre de la tarea en curso; los minutos de «Tengo X min» |
| `--letra-titulo-grande` | 36 / 1,15 | League Spartan | Título de la pestaña («Hoy», «Tareas») |
| `--letra-titulo` | 28 / 1,2 | League Spartan | «Listo por ahora» |
| `--letra-titulo-2` | 22 / 28 | sistema, bold | Nombre en la hoja de editar; minutos de la tarea en curso (regular) |
| `--letra-encabezado` | 17 / 22 | sistema, semibold | Botones, título de la hoja |
| `--letra-seccion` | 13 / 18 | sistema, semibold | Encabezado de sección («Las 3 de hoy», «Tocan»): chico y gris, como en iOS |
| `--letra-cuerpo` | 17 / 22 | sistema | Nombre de la tarea en la fila |
| `--letra-secundaria` | 15 / 20 | sistema | La línea gris de la fila; botones de texto |
| `--letra-nota` | 13 / 18 | sistema | Notas, fecha arriba del título |
| `--letra-pestana` | 11 / 13 | sistema, medium | Etiqueta de la pestaña |

Números con cifras siempre, y `tabular-nums` en minutos y horas (no bailan al cambiar).

## Menos texto

- 1 sola línea gris por fila, corta. En Tareas: «cada 3 días · 10 min». En Hoy: solo «10 min» (lo que espera: «desde las 19:30», porque la hora es lo único que importa ahí).
- Nada que el círculo ya diga («hace 5 días», «Entran 2 tareas», «A medias: mañana va primero»: afuera).
- Una nota solo cuando hay que decidir algo: «No entra ninguna. La más corta: Barrer, 10 min.»

## Espacios y medidas

| Variable | Valor | Uso |
|---|---|---|
| `--esp-1` … `--esp-8` | 4, 8, 12, 16, 20, 24, 32, 40 | Única escala de márgenes y separaciones |
| `--margen` | 16 | Margen de los costados |
| `--toque` | 44 | Mínimo de cualquier cosa que se toca (HIG) |
| `--alto-boton` | 50 | Botón principal |
| `--alto-fila` | 52 | Fila de 1 línea; la de 2 líneas crece sola |
| `--circulo` / `--circulo-grande` | 24 / 112 | Círculo de estado en la fila / en la tarea en curso |
| `--radio-grupo` | 20 | Grupos de la hoja |
| `--radio-hoja` | 38 | Esquinas de arriba de la hoja (iOS 26) |
| `--radio-capsula` | 999 | Botones, barra de pestañas, selector |

## Sombra

Solo en la hoja (lo único que flota): `--sombra-flota` más un borde de 0,5 px `--borde-flota`. Sobre negro la sombra sola no se ve; el borde fino es lo que usa Recordatorios. Todo lo demás, plano.

## Íconos

1 sola familia: **Phosphor** 2.1.1 (MIT), embebida como `<symbol>` (en los bocetos, `bocetos/iconos.svg`; en la app, dentro del HTML). Contorno (`regular`) en general; relleno (`fill`) solo en la pestaña elegida; `bold` para el ✓ y la flecha dentro de los círculos de estado. 24 px en barras y filas, 28 px en la barra de pestañas.

| Para | Ícono |
|---|---|
| Hoy / Tareas / Ajustes | `sun` / `list-checks` / `gear-six` |
| Cerrar / Guardar | `x` / `check` (bold) |
| Agregar | `plus` |
| Contador | `minus` / `plus` |
| Salteada / Esperando | `arrow-right` (bold) / `clock` |

Nada de emojis ni SF Symbols.

## Componentes

### Pantalla y barra de pestañas

- La pantalla, lo fijo de abajo (en Hoy, «Tengo X min») y la barra **se reparten el alto**: cada uno en su lugar, y solo la lista se desplaza. Nada queda nunca debajo de la barra.
- Sin barra de desplazamiento fija a la derecha (`scrollbar-width: none`).
- Barra de Todoist (iOS 26): cápsula a `--esp-5` de los costados, **pegada a la barra de inicio**: la zona segura se cuenta 1 sola vez (queda a unos 20 px del borde, `env(safe-area-inset-bottom)` menos 14 px). **Fondo sólido** `--flotante`, sin desenfoque ni sombra.
- 3 pestañas con ícono y etiqueta abajo (Hábitos sin etiqueta: hay que adivinar). La elegida: ícono relleno, todo en blanco. Las otras: contorno, en gris. Sin cápsula resaltada.
- Cambiar de pestaña: el contenido aparece con un fundido de 200 ms.

### Título de la pantalla

Recordatorios: título grande a la izquierda, en la letra propia, con la fecha en gris chico arriba solo en Hoy. Si la pantalla no tiene botones arriba (Hoy), el título sube hasta la zona segura más `--esp-2`; si tiene (Tareas), va debajo de la barra de 44 px.

### Botones de arriba

Recordatorios: a la derecha, en un círculo `--relleno` de 44 px. Con 2 o más, juntos en 1 cápsula. Hoy: ninguno. Tareas: «+».

### Lista y fila de tarea

Recordatorios (`recordatorios-lista.png`): **sin cajas**.

- Encabezado de sección chico y discreto, como en iOS: `--letra-seccion` y `--texto-2` («Las 3 de hoy», «Tocan»). El único texto grande es el título.
- Fila directo sobre el negro: círculo de estado, nombre (`--letra-cuerpo`) y 1 línea gris corta.
- Separador fino que **empieza después del círculo** y termina en el margen.
- En Tareas: tocar el círculo marca hecha; tocar la fila abre la hoja. Al tocar, la fila se aclara 100 ms, sin el resaltado del navegador.

### Hoja

Recordatorios (detalle) y Hábitos (nuevo):

- Sube desde abajo (300 ms, `--curva-ios`); lo de atrás se oscurece. Esquinas de arriba `--radio-hoja`. Casi a pantalla completa.
- Arriba: «×» en un círculo a la izquierda, título chico al centro, «✓» en un círculo a la derecha: **blanco con ✓ negro** cuando se puede guardar; `--relleno` con ✓ apagado mientras no hay nada para guardar.
- Se cierra con «×» o tocando afuera. No se arrastra para cerrar.
- Adentro, **grupos con caja** (`--superficie`), con encabezado arriba y nota gris debajo. Tiene que entrar en 1 pantalla.

### Tarea en curso

Va en una hoja, de a 1 tarea, sin espacio vacío arriba: el contenido está centrado en la hoja.

- El nombre **enorme y centrado**, en la letra propia; los minutos abajo en gris.
- **1 acción principal grande:** un círculo de 112 px para tocar = hecha (se llena de blanco con ✓). Debajo, en gris chico, «Hecha».
- «A medias» y «Saltear» como **botones de texto** chicos, abajo de todo. Al tocarlos, el círculo grande muestra ese estado.
- Después de marcar, la tarea sale a la izquierda y entra la siguiente. Al final: «Listo por ahora», las filas con su estado y «Cerrar».

### «Tengo X minutos»

Un control de iOS, no un formulario: «Tengo» en gris chico, los minutos como **número grande** en la letra propia, y abajo un **selector** con las opciones rápidas 5, 10, 20, 30 y 60. Después, «Empezar». **Fijo, siempre visible, arriba de la barra de pestañas**, con un separador fino arriba; la lista se desplaza por encima.

### Contador − y +

Solo en la hoja (Hábitos): nombre de la fila a la izquierda («Minutos») y a la derecha −, número y +, en círculos de 36 px de dibujo dentro de 44 px de toque. Pasos de 5 en minutos y de 1 en días. En el tope, el botón que no sirve queda apagado. El número cambia con un fundido corto.

### Selector

Hábitos (Diario / objetivo semanal), con la forma del control segmentado de iOS: cápsula `--relleno` de 44 px de alto, la opción elegida en una cápsula `--marca-selector` que se desliza (200 ms). En Hoy: 5, 10, 20, 30, 60. En la hoja: «Cada» / «Entre».

### Botones

- **Principal:** cápsula de 50 px a lo ancho, **blanca con letra negra**. 1 por pantalla, en la mitad de abajo. Apagado: `--relleno` con letra `--texto-3`, no responde.
- **De texto:** solo la palabra, en gris semibold de 15 px, con 44 px de toque. Para lo secundario («A medias», «Saltear»).
- **Borrar:** fila centrada en rojo, sola en su grupo, al final de la hoja.

### Menú «⋯»

Ninguna pantalla lo usa por ahora (en Tareas no había nada poco usado que poner). Cuando haga falta: el de Recordatorios, que sale del botón y crece desde ahí (200 ms), `--flotante` con sombra y borde fino, filas de 44 px con ícono y texto.

### Transiciones

| Qué | Cómo | Duración |
|---|---|---|
| Hoja | Sube desde abajo; fondo se oscurece | 300 ms, `--curva-ios` (`cubic-bezier(.32,.72,0,1)`) |
| Cambio de pestaña | Fundido del contenido | 200 ms |
| Siguiente tarea | La actual sale a la izquierda, la nueva entra desde la derecha | 250 ms |
| Cambio de estado del círculo | Se llena con un leve rebote (escala 1 → 1,15 → 1) | 250 ms |
| Selector | La marca se desliza | 200 ms |
| Número que cambia | Fundido | 150 ms |

Con `prefers-reduced-motion`: sin animación, todo cambia al instante.

### Que se sienta app

En `sistema.css`, para todo: `-webkit-tap-highlight-color: transparent`, `user-select: none` y `-webkit-touch-callout: none` (salvo campos de texto), `overscroll-behavior: none`. La página no se mueve: solo se desplaza el contenido; la barra de pestañas queda quieta. Zonas seguras con `env(safe-area-inset-*)`.

## Pantallas (bocetos)

En `bocetos/`, con datos de `vision.md` (miércoles 18 de noviembre, 18:40). Se publican en https://franketf2.neocities.org/bocetos/ con el workflow «Publicar en Neocities».

- `hoy.html`: las 3 de hoy, lo que espera (colgar la ropa) y «Tengo X minutos» abajo.
- `hoy.html#curso`: la tarea en curso.
- `tareas.html`: las 9 tareas en 3 secciones (Tocan, Más adelante, Hechas hoy).
- `tareas.html#editar`: la hoja de editar (Verdulería).
- `index.html`: la portada: los links, el ícono y la muestra de estados y colores. En los bocetos, la pestaña Ajustes lleva acá.
