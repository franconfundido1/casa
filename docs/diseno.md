# Sistema de diseño

**Modelo: la app de hábitos** (`docs/referencias/habitos-*.png`), **dada vuelta a modo oscuro**: blanco lleno sobre negro. Cuando choca con Apple, en lo visual manda la de hábitos. De Apple quedan solo las zonas seguras, las hojas que suben desde abajo, la barra de pestañas abajo y todo lo de «se siente app».

Los valores viven como variables CSS en `bocetos/sistema.css`; el código de la app los copia de ahí (no hay valores sueltos). Los px son puntos de iOS (390×844 de referencia). Lo que vale es cómo se ve en el iPhone, instalado desde Safari.

## Identidad

- **Contraste total.** Lo elegido es **blanco lleno con letra negra** (el «20» de «tengo», «Cada», la pestaña elegida, el botón principal, el «+»). Lo no elegido es **solo contorno fino gris o texto gris**. Sin pastillas ni cajas grises de relleno.
- **Formas llenas y grandes:** círculos de estado grandes y gruesos, opciones en círculos, íconos rellenos donde importan.
- **League Spartan para todo** (no solo los títulos). Títulos en minúscula, como «hábitos»: «hoy», «tareas».
- **El círculo como firma:** el mismo círculo es el estado de cada tarea, la acción grande de la tarea en curso, el círculo de arriba de la hoja y el ícono de la app (el círculo lleno de «hecha», blanco sobre negro, sin texto: `bocetos/icono-180.png`).
- **Mucho aire:** pocas cosas por pantalla, filas altas, márgenes de 20 px.

## Colores

| Variable | Valor | Trabajo |
|---|---|---|
| `--fondo` | `#000000` | Fondo de todo, también de la hoja y de la barra de pestañas; la letra sobre lo blanco lleno |
| `--texto` | `#FFFFFF` | Texto, lo elegido (lleno), lo que toca (contorno) |
| `--texto-2` | `#8E8E93` | Texto gris (línea de la fila, encabezados, notas), lo no elegido, el lleno de «salteada» |
| `--texto-3` | `#48484A` | Lo apagado: un − o + en el tope, el texto de ejemplo |
| `--linea` | `#3A3A3C` | Contornos finos de lo no elegido, separadores, borde de la hoja, lo que no toca |
| `--borrar` | `#FF453A` | **Única excepción de color:** solo «Borrar tarea» (el rojo de iOS) |
| `--velo` | `rgba(44,44,46,.6)` | Lo de atrás de una hoja abierta (como el gris de la de hábitos, dado vuelta) |

Sin degradés, sin desenfoque, sin transparencias, sin sombras (sobre negro no se ven; lo que flota se separa con el borde fino `--linea`).

## Estados de una tarea

Se distinguen por **relleno e ícono**, no por color. Círculo de 30 px con trazo de 2 px, dentro de 44 px de toque.

| Estado | Círculo | Nombre |
|---|---|---|
| Toca | Contorno blanco | Blanco |
| No toca todavía | Contorno gris fino (`--linea`) | Gris |
| Hecha | Lleno blanco con ✓ negro | Gris |
| A medias | Contorno blanco, lleno blanco por la mitad | Blanco |
| Salteada | Lleno gris (`--texto-2`) con flecha → negra | Gris |
| Esperando | Contorno gris punteado con reloj gris | Gris; la línea dice desde qué hora |

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
| `--letra-seccion` | 15 / 20 | 400 | Encabezado de sección, en minúscula y gris («las 3 de hoy», como el «nov» de hábitos) |
| `--letra-nota` | 14 / 18 | 400 | Notas, la unidad debajo de un número |
| `--letra-pestana` | 12 / 14 | 500 | Etiqueta de la pestaña |

Números con cifras siempre, y `tabular-nums` en minutos y horas.

## Menos texto

- 1 sola línea gris por fila, corta. En Tareas: «cada 3 días · 10 min». En Hoy: solo «10 min» (lo que espera: «desde las 19:30»).
- Cada dato en 1 solo lugar: el «20» de «tengo» está solo en su círculo elegido.
- Una nota solo cuando hace falta: «No entra ninguna. La más corta: Barrer, 10 min.»; en la hoja, la nota de la frecuencia solo con «Entre».

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
| Cerrar / Agregar | `x` / `plus` (bold) |
| Contador | `minus` / `plus` (bold) |
| Hecha / Salteada / Esperando | `check` (bold) / `arrow-right` (bold) / `clock` |
| Encabezados de la hoja y de «tengo» | `repeat` (frecuencia), `timer` (minutos) |

Nada de emojis ni SF Symbols.

## Componentes

### Pantalla y barra de pestañas

- La pantalla, lo fijo de abajo (en Hoy, «tengo») y la barra **se reparten el alto**: solo la lista se desplaza; nada queda debajo de otra cosa. Sin barra de desplazamiento.
- Barra **plana** como la de hábitos: negra, a lo ancho, con una línea fina arriba, **pegada a la barra de inicio** (la zona segura se cuenta 1 sola vez). 3 pestañas con ícono y etiqueta abajo. La elegida, **cápsula blanca llena** con ícono relleno y letra negra; las otras, en gris, sin fondo.

### Título

Como «hábitos»: en minúscula, grande, a la izquierda; los botones de la pantalla a la derecha, en la misma línea (en Tareas, el «+» como círculo blanco lleno). En Hoy, la fecha en gris chico debajo. El título arranca en la zona segura más `--esp-4`.

### Lista y fila

- Encabezado de sección chico, gris y en minúscula.
- Fila directo sobre el negro, de 68 px: círculo de estado, nombre y 1 línea gris corta. Separador fino que empieza después del círculo. Sin cajas.
- En Tareas: tocar el círculo marca hecha; tocar la fila abre la hoja. Al tocar, la fila se aclara 100 ms.

### Botón redondo

44 px. De contorno fino (el «×» de la hoja) o **lleno blanco** si es la acción (el «+» de Tareas).

### Elegir 1 opción

- **Pastillas** (2 opciones, como Diario / objetivo semanal): la elegida, blanca llena con letra negra; la otra, contorno fino gris. En la hoja: «Cada» / «Entre».
- **Círculos** (varias opciones cortas, como los días de la semana de hábitos): en «tengo», 5, 10, 20, 30 y 60, en círculos de 56 px. El elegido, blanco lleno.

### Contador

Como «1 vez al día» de hábitos: «−» en un círculo de contorno, el número grande en el medio con la unidad debajo en gris, «+» en un círculo **blanco lleno**. En el tope, el botón que no sirve queda apagado (contorno y ícono en gris oscuro). El número cambia con un fundido corto.

### Botones

- **Principal:** cápsula de 56 px a lo ancho, **blanca con letra negra**. 1 por pantalla, abajo. **Apagado: solo contorno fino y letra gris**, como «Crear hábito».
- **De texto:** la palabra sola, en gris, con 44 px de toque, para lo secundario («A medias», «Saltear»). En rojo, «Borrar tarea».

### Hoja

- Sube desde abajo (300 ms); lo de atrás queda velado en gris. Negra, con las esquinas de arriba redondeadas y el borde fino. Se cierra con el «×» (arriba a la derecha, como en hábitos) o tocando afuera.
- **Hoja de tarea, como «nuevo hábito»:** arriba al centro el círculo grande lleno con ✓ (la firma); el nombre centrado, grande, con una rayita abajo; «frecuencia» con las pastillas «Cada» / «Entre» y sus contadores (1 con «Cada»; «desde» y «hasta» con «Entre», y solo ahí la nota); «lleva» con el contador de minutos. Abajo, fijo, **«Guardar»** grande, apagado hasta que cambie algo; debajo, «Borrar tarea» en rojo (solo al editar).

### Tarea en curso

En una hoja, de a 1, todo centrado: el nombre enorme, los minutos en gris, y **el círculo de 120 px para tocar = hecha** (se llena de blanco con ✓), con «hecha» en gris debajo. «A medias» y «Saltear», botones de texto abajo. Arriba a la izquierda, «1 de 2» en gris. Al terminar: «listo por ahora», las filas con su estado y «Cerrar».

### «Tengo X minutos»

**Fijo, siempre visible, arriba de la barra de pestañas**, con una línea fina arriba; la lista se desplaza por encima. Una línea gris chica («tengo» a la izquierda, «minutos» a la derecha), los 5 círculos de opciones y «Empezar».

### Transiciones

| Qué | Cómo | Duración |
|---|---|---|
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
