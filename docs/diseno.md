# Sistema de diseño

**Modelo: la app de hábitos** (`docs/referencias/habitos-*.png`), **dada vuelta a modo oscuro**: blanco lleno sobre negro. Cuando choca con Apple, en lo visual manda la de hábitos. De Apple quedan solo las zonas seguras, las hojas que suben desde abajo, la barra de pestañas abajo y todo lo de «se siente app».

Los valores viven como variables CSS en `bocetos/sistema.css`; el código de la app los copia de ahí (no hay valores sueltos). Los px son puntos de iOS (390×844 de referencia). Lo que vale es cómo se ve en el iPhone, instalado desde Safari.

## Identidad

- **Contraste total.** Lo elegido es **blanco lleno con letra negra** (el «20» de los minutos, «Cada», la pestaña elegida, el botón principal). Lo no elegido es **solo contorno fino gris o texto gris**. Sin pastillas ni cajas grises de relleno.
- **Formas llenas y grandes:** círculos de estado grandes y gruesos, opciones en círculos, íconos rellenos donde importan.
- **League Spartan para todo** (no solo los títulos). Títulos en minúscula, como «hábitos»: «hoy», «tareas».
- **El círculo como firma:** el mismo círculo es el estado de cada tarea, la acción grande de la tarea en curso, el círculo de arriba de la hoja y el ícono de la app, **str3ak**: los 3 estados del círculo en fila (aro de «toca», mitad de «a medias» y lleno de «hecha»), blanco sobre negro, sin texto (`codigo/recursos/str3ak-180.png`; el nombre del archivo cambia si cambia el ícono, porque Safari guarda los íconos por nombre; elegido entre las 3 opciones de `bocetos/logos.html`).
- **Mucho aire:** pocas cosas por pantalla, filas altas, márgenes de 20 px.

## Colores

| Variable | Valor | Trabajo |
|---|---|---|
| `--fondo` | `#000000` | Fondo de todo, también de la hoja y de la barra de pestañas; la letra sobre lo blanco lleno |
| `--texto` | `#FFFFFF` | Texto, lo elegido (lleno), lo que toca (contorno) |
| `--texto-2` | `#8E8E93` | Texto gris (línea de la fila, encabezados, notas), lo no elegido, la flecha de «salteada» |
| `--texto-3` | `#48484A` | Lo apagado: un − o + en el tope, el texto de ejemplo |
| `--linea` | `#3A3A3C` | Contornos finos de lo no elegido, separadores, la línea bajo el título, borde de la hoja |
| `--gris-lleno` | `#2C2C2E` | Círculo sin hacer (como los días sin hacer de hábitos) y el «×» de la hoja |
| `--borrar` | `#FF453A` | **Única excepción de color:** solo «Borrar» (el rojo de iOS) |
| `--velo` | `rgba(44,44,46,.6)` | Lo de atrás de una hoja abierta (como el gris de la de hábitos, dado vuelta) |

Sin degradés, sin desenfoque, sin transparencias, sin sombras (sobre negro no se ven; lo que flota se separa con el borde fino `--linea`).

## Estados de una tarea

Como los días de hábitos: lo sin hacer es un **círculo gris oscuro lleno**, lo hecho **blanco lleno**, y lo de hoy lleva **aro**. **Lo único que brilla es el blanco:** toca (el aro), hecha y a medias; lo demás queda en grises. Se distinguen por relleno, aro e ícono, no por color. Círculo de 30 px con trazo de 2 px, dentro de 44 px de toque.

| Estado | Círculo | Nombre |
|---|---|---|
| Toca | Gris oscuro lleno con aro blanco | Blanco |
| No toca todavía | Gris oscuro lleno, sin aro ni ícono | Gris |
| Hecha | Blanco lleno con ✓ negro | Gris |
| A medias | Aro blanco, mitad blanca y mitad gris oscuro | Blanco |
| Salteada | Gris oscuro lleno, como «no toca», con la flecha → en gris claro (`--texto-2`) | Gris |
| Esperando | Sin relleno, aro gris punteado y reloj gris claro | Gris; la línea dice desde qué hora |

Lo que no toca, lo salteado y lo que espera no se confunden: el primero no tiene ícono, el segundo tiene la flecha gris y el tercero es hueco y punteado, con reloj.

En la tarea en curso, el mismo círculo a 120 px con trazo de 3 px.

## Letra

**League Spartan** (SIL OFL), embebida: 1 archivo variable con todos los pesos (`bocetos/fuentes/league-spartan-variable.woff2`), sin Google Fonts. Para todo el texto. La de hábitos usa una geométrica parecida; ésta tiene la «o» redonda, como la firma. Nada de Jost (es la de Akordia) ni de las letras de todas las apps hechas con IA (Inter, Space Grotesk y parecidas).

| Variable | Tamaño / alto | Peso | Uso |
|---|---|---|---|
| `--letra-enorme` | 44 / 1,1 | 700 | Nombre de la tarea en curso |
| `--letra-titulo-grande` | 40 / 1,1 | 700 | Título de la pantalla, en minúscula |
| `--letra-titulo` | 30 / 1,15 | 700 | Nombre en la hoja; «listo por ahora» |
| `--letra-numero` | 36 / 1 | 600 | El número de los contadores |
| `--letra-encabezado` | 18 / 24 | 600 | Botones, pastillas, opciones |
| `--letra-cuerpo` | 18 / 24 | 500 | Nombre de la tarea en la fila |
| `--letra-secundaria` | 16 / 20 | 400 | La línea gris de la fila; botones de texto |
| `--letra-seccion` | 15 / 20 | 400 | Texto gris chico (la fecha debajo de «hoy», como el «nov» de hábitos) |
| `--letra-nota` | 14 / 18 | 400 | Notas, la unidad debajo de un número |
| `--letra-pestana` | 12 / 14 | 500 | Etiqueta de la pestaña |

Números con cifras siempre, y `tabular-nums` en minutos y horas.

## Menos texto

- 1 sola línea gris por fila, corta. En Tareas: «cada 3 días · 10 min». En Hoy: solo «10 min» (lo que espera: «desde las 19:30»).
- Cada dato en 1 solo lugar: el «20» de los minutos está solo en su círculo elegido.
- **Si un ícono, la forma o el comportamiento lo explica, no se escribe** (regla 8 de `CLAUDE.md`). Nada de títulos de sección, etiquetas ni frases que repitan lo que ya se ve. Por eso no hay «tengo», «las 3 de hoy», «para hoy», «tocan», «frecuencia», «lleva», «última vez», «elegir ícono», «tus datos» ni la nota de «Entre»: lo dicen el reloj, el orden, el círculo, los íconos y los contadores.

## Espacios y medidas

| Variable | Valor | Uso |
|---|---|---|
| `--esp-1` … `--esp-8` | 4, 8, 12, 16, 20, 24, 32, 40 | Única escala de separaciones |
| `--margen` | 20 | Margen de los costados |
| `--toque` | 44 | Mínimo de cualquier cosa que se toca |
| `--alto-boton` | 56 | Botón principal |
| `--alto-pastilla` | 48 | Pastillas («Cada», «Entre») |
| `--alto-fila` | 68 | Fila de tarea |
| `--circulo` / `--circulo-opcion` / `--circulo-grande` | 30 / 56 / 120 | Estado en la fila / opción de minutos / tarea en curso |
| `--trazo` / `--trazo-estado` | 1 / 2 | Contorno fino / contorno del círculo de estado |
| `--radio-hoja` | 38 | Esquinas de arriba de la hoja |
| `--radio-capsula` | 999 | Botones, pastillas, pestaña elegida |

## Íconos

1 sola familia: **Phosphor** 2.1.1 (MIT), embebida como `<symbol>` (`bocetos/iconos.svg`). Rellenos (`fill`) donde importan (la pestaña elegida); `bold` para lo que va dentro de círculos llenos (✓, flecha, ×, +, −); contorno (`regular`) para las pestañas no elegidas y los íconos chicos de encabezado.

| Para | Ícono |
|---|---|
| Hoy / Tareas / Ajustes | `sun` / `list-checks` / `gear-six` (relleno en la elegida) |
| Cerrar / Agregar | `x` (bold) / `plus-circle` (contorno) |
| Contador | `minus` / `plus` (bold) |
| Hecha / Salteada / Esperando | `check` (bold) / `arrow-right` (bold) / `clock` |
| Bloques de la hoja (solos, sin texto) | `repeat` (frecuencia), `timer` (minutos), `clock-counter-clockwise` (última vez: el reloj con la flecha para atrás) |

### Ícono de cada tarea

Como en hábitos (`habitos-hoja-nuevo.png`, `habitos-iconos.png`): cada tarea tiene 1 ícono de Phosphor **relleno**, elegido de una lista corta de 16 de la casa. Se ve en la tarea en curso (grande, adentro del círculo), en la hoja de tarea y **en las listas (Hoy y Tareas), adentro del círculo de estado**: chico (55 % del círculo) y del color del aro, blanco si toca y gris si no. Así hay 1 sola cosa por fila. Hecha, salteada y a medias lo cambian por el ✓, la flecha o la mitad (y esperando, cuando llegue la ropa, por el reloj).

| Ícono | Nombre en la lista | Tarea de arranque |
|---|---|---|
| `check-circle` | Tarea | (la tarea nueva, hasta que elijas otro) |
| `broom` | Escoba | Barrer |
| `bowl-food` | Platos | Lavar los platos |
| `bed` | Cama | Hacer la cama |
| `t-shirt` | Remera | Ordenar la ropa |
| `washing-machine` | Lavarropas | Lavar la ropa |
| `coat-hanger` | Percha | (colgar la ropa) |
| `carrot` | Verdura | Verdulería |
| `shopping-cart` | Carrito | Súper |
| `bathtub` | Bañera | Limpiar el baño |
| `toilet` | Inodoro | |
| `drop` | Gota | Pasar el trapo |
| `spray-bottle` | Rociador | |
| `trash` | Basura | |
| `cooking-pot` | Olla | |
| `plant` | Planta | |

Nada de emojis ni SF Symbols.

## Componentes

### Pantalla y barra de pestañas

- La pantalla, lo fijo de abajo (en Hoy, los minutos y «Empezar») y la barra **se reparten el alto**: solo la lista se desplaza; nada queda debajo de otra cosa. Sin barra de desplazamiento.
- Barra **plana** como la de hábitos: negra, a lo ancho, con una línea fina arriba, **pegada a la barra de inicio** (la zona segura se cuenta 1 sola vez). **Instalada** (`display-mode: standalone`), el iPhone (iOS 26) ya termina la pantalla de la app arriba de la barra de inicio: ahí lo fijo abajo (la barra, las hojas, «Empezar») no suma la zona segura de abajo, porque se contaría 2 veces y quedaría una franja negra. En Safari, sí la suma. 3 pestañas con ícono y etiqueta abajo. La elegida, **cápsula blanca llena** con ícono relleno y letra negra; las otras, en gris, sin fondo.

### Título

Como «hábitos»: una **cabecera fija** con el título en minúscula, grande, a la izquierda, y los botones de la pantalla a la derecha, en la misma línea; abajo, una **línea fina a lo ancho** (`--linea`) que la separa de la lista, que se desplaza por debajo. En Hoy, la fecha en gris chico debajo del título. El título arranca en la zona segura más `--esp-5`.

### Lista y fila

- Sin títulos de sección: los grupos (en Tareas: para hoy, tocan, más adelante, próximas, hechas hoy) se separan con aire, y el círculo (aro, gris, ✓) y la línea (la fecha, el atraso) dicen qué es cada uno.
- Fila directo sobre el negro, de 68 px: círculo de estado (con el ícono de la tarea adentro), nombre y 1 línea gris corta. Separador fino que empieza después del círculo. Sin cajas.
- En Tareas: tocar el círculo marca hecha; tocar la fila abre la hoja. Al tocar, la fila se aclara 100 ms.

### Botones de ícono

- **Ícono suelto** (el «+» de Tareas, como el ⊕ de hábitos): `plus-circle` de contorno, de 32 px, sin fondo, con 44 px de toque aunque no se vea.
- **Botón redondo** (el «×» de la hoja, como en hábitos): círculo de 44 px gris oscuro lleno (`--gris-lleno`) con borde fino.

### Elegir 1 opción

- **Pastillas** (2 opciones, como Diario / objetivo semanal): la elegida, blanca llena con letra negra; la otra, contorno fino gris. En la hoja: «Cada» / «Entre».
- **Círculos** (varias opciones cortas, como los días de la semana de hábitos): en Hoy, los minutos 5, 10, 20, 30 y 60, en círculos de 56 px. El elegido, blanco lleno.

### Contador

Como «1 vez al día» de hábitos: «−» en un círculo de contorno, el número grande en el medio con la unidad debajo en gris, «+» en un círculo **blanco lleno**. En el tope, el botón que no sirve queda apagado (contorno y ícono en gris oscuro). El número cambia con un fundido corto.

### Botones

- **Principal:** cápsula de 56 px a lo ancho, **blanca con letra negra**. 1 por pantalla, abajo. **Apagado: solo contorno fino y letra gris**, como «Crear hábito».
- **De texto:** la palabra sola, en gris, con 44 px de toque, para lo secundario («A medias», «Saltear»). En rojo, «Borrar».

### Hoja

- Sube desde abajo (300 ms); lo de atrás queda velado en gris. Negra, con las esquinas de arriba redondeadas y el borde fino. Se cierra con el «×» (arriba a la derecha, como en hábitos) o tocando afuera.
- **Hoja de tarea, como «nuevo hábito»:** arriba al centro, el círculo grande blanco lleno con **el ícono de la tarea** en negro y un lápiz chico en el borde. Al tocarlo se abre encima **otra hoja**, sin título: los 16 íconos en una grilla de 4, sin nombre (el ícono se explica solo); el elegido, con un borde blanco (como en hábitos). Tocar uno lo elige y cierra esa hoja. Después, el nombre centrado, grande, con una rayita abajo; el ícono de repetir (sin texto) con las pastillas «Cada» / «Entre» / «1 vez» y sus contadores (con «1 vez», en vez de contadores, las pastillas «Hoy» / «Mañana» / «Elegir»; «Elegir» abre el calendario del iPhone y muestra el día elegido, «vie 21», y no hay «última vez») (1 con «Cada»; «desde» y «hasta» con «Entre»); el reloj con el contador de minutos; el reloj con la flecha para atrás (`clock-counter-clockwise`) de «última vez» con un contador que va de «nunca» a «hoy», «ayer» y «N días atrás» (cargarla suma una entrada al historial con esa fecha; sirve para poner al día las de arranque el primer día). Abajo, fijo, **«Guardar»** grande, apagado hasta que cambie algo; debajo, «Borrar» en rojo (solo al editar), que pide 2 toques: el 1.º cambia el texto a «¿Borrar?» y, si no se toca otra vez en 3 segundos, vuelve. Los minutos van de a 1 hasta 10, de a 5 hasta 60 y después 75, 90, 120, 150 y 180.

### Tarea en curso

En una hoja, de a 1, todo centrado: el nombre enorme, los minutos en gris, y **el círculo de 120 px para tocar = hecha**: gris oscuro con aro blanco y **el ícono de la tarea grande y blanco adentro**; al tocarlo, el ícono deja lugar al ✓ y el círculo se llena de blanco (con «A medias», a la mitad; con «Saltear», la flecha gris). «A medias» y «Saltear», botones de texto abajo. Arriba a la izquierda, «1 de 2» en gris. Al terminar: «listo por ahora», las filas con su estado y «Cerrar».

### Hoy

**La lista sigue a los minutos:** muestra todo lo que entra en el tiempo elegido, en el orden en que se va a ofrecer, sin títulos. Primero las de 1 vez (las atrasadas con «de ayer» o «hace N días» en blanco y negrita dentro de la línea gris, para que se vea sin color), después las 3 de hoy (sin marcarlas: cuentan por dentro para el día cumplido) y después lo más vencido. Lo que no entra no se muestra; lo hecho, salteado o a medias de hoy, tampoco. Al cambiar los minutos, la lista cambia con un fundido: eso explica qué son los círculos. El «+» de la cabecera anota rápido una de 1 vez para hoy.

### Minutos y «Empezar»

**Fijo, siempre visible, arriba de la barra de pestañas**, con una línea fina arriba; la lista se desplaza por encima. Los 5 círculos de minutos y «Empezar», sin texto arriba. Los minutos en los que no entra ninguna tarea van apagados (gris oscuro, no se pueden elegir): no hace falta ningún mensaje.

### Ajustes › abajo de todo

El logo chico (`#logo`, los 3 círculos), «str3ak» y la versión en gris (`VERSION_APP` de `codigo/build.py`).

### Ajustes › copia de seguridad

2 filas que son botones, sin título arriba, con el ícono a la derecha (`download-simple`, `upload-simple`): «Bajar copia» abre el menú de compartir del iPhone (desde ahí, «Guardar en Archivos»; si el navegador no puede compartir archivos, baja el `.json`). «Cargar copia» abre Archivos; antes de reemplazar, una hoja chica sin título dice de qué día es la copia y cuántas tareas tiene, con «Reemplazar mis datos». Si el archivo no sirve, la hoja lo dice y no ofrece reemplazar.

### Transiciones

| Qué | Cómo | Duración |
|---|---|---|
| Entrada (al abrir la app) | Los 3 círculos del logo crecen de a 1 (toca, a medias, hecha); después el logo crece un poco y todo se desvanece, y queda «hoy» debajo. No tapa los toques | 700 ms en total: cada círculo 220 ms con `--curva-ios`, 80 ms entre uno y otro; salida 220 ms `ease-in` desde los 480 ms |
| Hoja | Sube desde abajo; lo de atrás se vela | 300 ms, `--curva-ios` (`cubic-bezier(.32,.72,0,1)`) |
| Cambio de pestaña | Fundido del contenido | 200 ms |
| Siguiente tarea | La actual sale a la izquierda, la nueva entra desde la derecha | 250 ms |
| Cambio de estado del círculo | Se llena con un leve rebote | 250 ms |
| Elegir una opción | Se llena de blanco | 200 ms |
| Número que cambia | Fundido | 150 ms |

Con `prefers-reduced-motion`: sin animación.

### Que se sienta app (de Apple)

`-webkit-tap-highlight-color: transparent`, `user-select: none` y `-webkit-touch-callout: none` (salvo campos de texto), `overscroll-behavior: none`. La página no se mueve: solo se desplaza el contenido. Zonas seguras con `env(safe-area-inset-*)`.

## Pantallas (bocetos)

En `bocetos/`, con datos de `vision.md` (miércoles 18 de noviembre, 18:40). Se publican en https://franketf2.neocities.org/bocetos/ con el workflow «Publicar en Neocities» al fusionar.

- `hoy.html`: las 3 de hoy, lo que espera (colgar la ropa) y «tengo» fijo abajo.
- `hoy.html#curso`: la tarea en curso.
- `tareas.html`: las 9 tareas en 3 secciones (tocan, más adelante, hechas hoy).
- `tareas.html#editar`: la hoja de tarea (Verdulería).
- `index.html`: la portada: los links, el ícono y la muestra de estados y colores. En los bocetos, la pestaña Ajustes lleva acá.
