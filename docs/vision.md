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
- Mis datos viven en el celu y no se pierden (copia de seguridad).
- Se usa en el iPhone, con 1 mano, de pasada.
- Se ve y se siente como una app de iPhone desde el día 1: el diseño se define antes de programar, comparando con apps reales.

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
- **«Tengo X minutos»:** recorre las tareas que tocan, de la más vencida a la menos, y se queda con las que entran en el tiempo. Me las da de a 1. Si no entra ninguna, me dice cuál es la más corta que toca y cuánto lleva.
- **Al terminar cada tarea:**
  - **Hecha:** la última vez pasa a ser hoy.
  - **Salteada:** no me la vuelve a ofrecer hoy; mañana sigue igual de vencida (o más).
  - **A medias:** queda anotada, no reinicia la cuenta y mañana es lo primero que me ofrece.
- **La mañana:** la 1.ª vez que abro la app en el día, elige las 3 más vencidas que tocan. Son «las 3 de hoy»: «Tengo X minutos» las ofrece antes que el resto. El día está cumplido con esas 3, aunque haga más.
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

Avisos: en la versión 1 la app **no avisa sola** (en el iPhone, una app web sin servidor no puede mandar notificaciones con la app cerrada). Cuando la abro, me muestra lo que está esperando («Colgar la ropa: desde las 19:30»).

## Versión 2

- Comidas de la semana → lista del súper.
- Avisos delegados en Google Calendar (por ejemplo, «colgar la ropa» 1 hora y media después de meterla).

## Fuera de la app (decidido)

- IA dentro de la app y servidor propio.
- Rachas, puntos o premios: no es un juego.
- Compartir la casa con otra persona (por ahora es solo para mí).
- Reescribirla en React u otro framework.

## Preguntas abiertas

- Colgar y guardar la ropa: ¿cuántos minutos lleva cada uno? (Arranco con 10 y 5.) ¿«Guardar la ropa» es lo mismo que «Ordenar la ropa» o son tareas distintas?
- Si me sobra tiempo y no toca nada, ¿adelanta tareas que tocan pronto o me deja libre?
- ¿Dónde se publica? Tiene que ser un sitio aparte de Akordia (otro origen): si va en una carpeta del sitio de Akordia, comparten datos del navegador y el service worker de Akordia puede tomar esta app. Opciones: un sitio nuevo en Neocities o GitHub Pages (con el repo privado, Pages necesita un plan pago).
- ¿Modo oscuro desde el día 1 (siguiendo el del iPhone) o solo claro?
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
