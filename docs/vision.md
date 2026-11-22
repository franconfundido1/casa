# Hacia dónde va Akordia para la casa

Para qué existe: me cuesta el orden y la organización del día (tareas de la casa, comida, súper). Lo que pesa no es hacer las cosas, es **decidir qué hacer y cuándo**. La app decide por mí.

La app ideal: la abro, le digo cuánto tiempo tengo, y me dice qué hacer, de a 1 cosa. A la mañana me da 3 cosas para el día, no 20. Se acuerda de cuándo hice cada cosa, sabe qué está más atrasado y encadena lo que va encadenado (la ropa). Yo solo marco lo que hice.

## Principios

- Reglas claras, sin IA ni servidor, y que funcione sin internet.
- Decide la app: nunca me muestra una lista de 20 cosas para que elija yo.
- Frecuencias, no fechas: «cada 3 días», no «el jueves».
- Poco por vez: 1 tarea en pantalla, 3 cosas por día.
- Saltear no es fallar: salteo y la app se reacomoda, sin culpa ni rachas rotas.
- Los números (frecuencias, minutos, demoras) los ajusto yo y se revisan con el uso real.
- Mis datos viven en la tablet y no se pierden (copia de seguridad).
- Se usa en la tablet Android (Galaxy Tab S10 FE+), siempre en horizontal, apoyada en un soporte: la miro de lejos, de pasada.
- Es una app nativa de Android (Capacitor) que se instala desde los Releases del repo, sin Play Store ni cuenta de Apple.
- Solo modo oscuro.
- Se ve y se siente como una app desde el día 1: el diseño se define antes de programar, comparando con apps reales.

## Las tareas de arranque

Cada tarea tiene un nombre, cuántos minutos lleva y cada cuántos días toca (un mínimo y un máximo). Las ajusto yo.

| Tarea | Frecuencia | Cada (días) | Minutos |
|---|---|---|---|
| Hacer la cama | todos los días | 1 | 3 |
| Lavar los platos | todos los días | 1 | 10 |
| Ordenar la ropa | cada 2 días | 2 | 10 |
| Barrer | cada 3 días | 3 | 10 |
| Verdulería | cada 3 o 4 días | 3 a 4 | 20 |
| Lavar la ropa | 2 veces por semana | 3 a 4 | 5 (meter) |
| Pasar el trapo | semanal | 7 | 20 |
| Limpiar el baño | semanal | 7 | 20 |
| Súper | semanal | 7 | 60 |

«2 veces por semana» se guarda como «cada 3 a 4 días»: así todas las frecuencias son 1 sola cosa.

## Cómo decide (reglas de la versión 1)

Provisorias: se revisan con el uso.

- **Días desde la última vez:** días locales entre hoy y la última vez que la hice. Si nunca la hice, toca hoy.
- **Toca:** cuando pasaron al menos el mínimo de días. **Atrasada:** cuando pasaron más que el máximo.
- **Qué tan vencida está:** días desde la última vez dividido el máximo. Así 1 día de atraso en algo diario pesa más que 1 día de atraso en algo semanal. Primero lo más vencido; si empatan, la más corta.
- **«Tengo X minutos»:** recorre las tareas que tocan (primero las de 1 vez para hoy, después las 3 de hoy y después de la más vencida a la menos) y se queda con las que entran en el tiempo. La lista de «hoy» sigue a los minutos: muestra justo eso, en ese orden; lo que no entra no se muestra. «Empezar» me las da de a 1. Los minutos en los que no entra ninguna van apagados.
- **La última vez a mano:** en la hoja de cada tarea se puede cargar cuándo se hizo por última vez (hoy, ayer, hace N días o nunca). Queda en el historial; cuenta esa fecha y lo que se haga después.
- **Al terminar cada tarea:**
  - **Hecha:** la última vez pasa a ser hoy.
  - **Salteada:** no me la vuelve a ofrecer hoy; mañana sigue igual de vencida (o más).
  - **A medias:** queda anotada, no reinicia la cuenta y mañana es lo primero que me ofrece (ese día no me la vuelve a ofrecer).
- **La mañana:** la 1.ª vez que abro la app en el día, elige las 3 más vencidas que tocan. Si después cambio «última vez» de una tarea y todavía no hice nada con esas 3 (ni hecha, ni a medias, ni salteada), se vuelven a elegir. Si las 3 tienen lugar libre (eran menos de 3, o se borró alguna) y aparece algo que toca, se completan; Son «las 3 de hoy»: van primero entre las repetitivas, pero no se marcan ni tienen título en la pantalla. El día está cumplido con esas 3, aunque haga más.
- **La ropa como cadena:** lavar la ropa son 3 pasos.
  1. **Meter** (5 min): cuando toca, como cualquier tarea.
  2. **Colgar:** desde 1 hora y media después de meterla. Cuando está lista, va antes que todo (la ropa mojada no espera).
  3. **Guardar:** desde el día siguiente a colgarla.
  - Mientras la cadena está abierta, no me ofrece meter otra tanda.

## Versión 1

1. Tareas con frecuencia y minutos, que ajusto yo (agregar, editar, borrar).
2. «Tengo X minutos», de a 1 tarea, con hecha, salteada o a medias.
3. La mañana: 3 cosas para el día.
4. La ropa como cadena.
5. Copia de seguridad: bajar y volver a cargar mis datos.
6. **Tareas de 1 sola vez** (después de «hoy»). La idea: abrir la app y ver todo lo del día en 1 solo lugar, no solo lo de la casa.
   - En la hoja, la opción «1 vez» con fecha (hoy, mañana o elegir día) y minutos (10 por defecto).
   - Anotar rápido: el «+» de «hoy» abre la hoja en «1 vez · hoy» con el teclado en el nombre; «Listo» guarda (2 toques).
   - Ese día aparece en «hoy», primero (antes que las repetitivas), y entra primero en «Tengo X minutos».
   - Si no se hace, pasa al día siguiente marcada como atrasada, bien visible.
   - Hecha, desaparece de las listas y queda en el historial. En «tareas», las futuras van en «próximas», con la fecha.

Avisos: en la versión 1 la app **no avisa sola**. Cuando la abro, me muestra lo que está esperando («Colgar la ropa: desde las 19:30»). Con la app de Android ya se puede: va en el PR de notificaciones (abajo, «Android»).

## Versión 2

- Comidas de la semana → lista del súper.

## Después de usarla 1 o 2 semanas

Un estímulo visual que **recompensa y nunca reta**. Ya está: el círculo que se llena con un salto al completar y el momento de «día cumplido» (`docs/diseno.md` › Transiciones). Falta (no hacerlo todavía):

- El círculo se llena con una animación al marcar hecha.
- Un momento de «día cumplido» al terminar las 3 de hoy.
- Una racha de «la casa al día»: días seguidos sin tareas atrasadas. No se corta por saltear y se muestra solo en positivo.
- El calendario de círculos en la hoja de cada tarea (como los días de la app de hábitos).
- Nunca caritas tristes ni «perdiste la racha». Sin puntos ni niveles.

## Fuera de la app (decidido)

- IA dentro de la app y servidor propio.
- Compartir la casa con otra persona (por ahora es solo para mí).
- Reescribirla en React u otro framework.

## Dónde se publica (decidido)

- **La app de la tablet:** el APK firmado que compila el workflow «App de Android» (`.github/workflows/android.yml`) y sube a los Releases del repo. Se instala y se actualiza bajándolo desde la tablet (`docs/android.md`).
- **La versión web** (para probar rápido) va en la raíz de **franketf2.neocities.org**, un sitio aparte de Akordia (otro origen: no comparten datos del navegador ni service worker). Los bocetos, en `/bocetos/`.
- Se publica solo con el workflow «Publicar en Neocities» (`.github/workflows/publicar.yml`), desde main, con el secreto `NEOCITIES_API_KEY`. Nada se sube a mano.

## Preguntas abiertas

- Colgar y guardar la ropa: ¿cuántos minutos lleva cada uno? (Arranco con 10 y 5.) ¿«Guardar la ropa» es lo mismo que «Ordenar la ropa» o son tareas distintas?
- Si me sobra tiempo y no toca nada, ¿adelanta tareas que tocan pronto o me deja libre?
- ¿El día arranca a las 0:00 o más tarde (por ejemplo, a las 5:00, para que lo que hago a la 1:00 cuente para el día anterior)?

## Plan de PRs

**Antes del código (sin programar):**

- A. **Referencias:** capturas de Recordatorios, Things 3, Todoist y Streaks (lista principal, una tarea abierta, la barra de pestañas y los ajustes), con 1 línea de qué gusta y qué no. Se anota en `docs/referencias.md` qué las hace sentir app.
- B. **Sistema de diseño:** `docs/diseno.md` (colores con 1 trabajo cada uno, escala, componentes, íconos Phosphor, transiciones).
- C. **Bocetos** de las pantallas principales (Hoy con «Tengo X minutos», la tarea en curso, Tareas, editar una tarea en una hoja), en HTML, aprobados en el iPhone.

**Código:**

1. **Esqueleto:** build, página vacía instalable (manifest, service worker, íconos provisorios), estado con versión y migraciones, y las pruebas andando. Lo pruebo en el iPhone: instalarla desde Safari y abrirla en modo avión.
2. **Tareas:** las 9 de arranque cargadas, editar frecuencia y minutos, y las reglas de vencimiento con pruebas.
3. **Copia de seguridad:** bajar y cargar mis datos (antes de usarla en serio).
4. **«Tengo X minutos»:** de a 1, con hecha, salteada y a medias.
5. **Usarla 1 o 2 semanas** antes de seguir, y ajustar los números con lo que pasó.
6. **La mañana:** las 3 de hoy.
7. **La ropa como cadena.**

## Android (cambio de plan)

El iPhone queda de lado (no pago la cuenta de Apple). La app pasa a la tablet Android, en horizontal, como app nativa con Capacitor, reusando todo: reglas, datos, diseño y piezas. 1 PR por vez:

1. **La app de Android:** Capacitor con el `index.html` de siempre adentro, sin cambiar reglas ni diseño. El workflow compila el APK firmado y lo sube como Release. `docs/android.md`: instalar, actualizar y pasar los datos del iPhone. La web en Neocities sigue andando.
2. **Diseño para la tablet en horizontal:** primero bocetos en `bocetos/tablet/` (pestañas en una columna fina a la izquierda; «hoy» en 2 partes: la lista a la izquierda y los minutos y «Empezar» grandes a la derecha, que al empezar pasa a ser la tarea en curso con el círculo grande; «tareas» con la hoja de editar; letra más grande). Cuando estén aprobados, el código, con la app bloqueada en horizontal, y `docs/diseno.md` con lo de tablet.
3. **Notificaciones locales, sin servidor:** 1 aviso por día a la hora que elija en Ajustes con lo que toca hoy («barrer, súper y 1 más»), que al tocarlo abre «hoy»; avisos de las tareas de 1 vez con hora. El permiso de Android se pide la 1.ª vez que se activan.
