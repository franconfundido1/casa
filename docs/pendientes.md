# Pendientes

Lo anotado para más adelante. No va al código hasta que haga falta.

- **Revisar cuando Apple arregle el espacio de abajo en las apps instaladas.** En iOS 26, una app instalada desde Safari termina su pantalla arriba de la barra de inicio y deja ese espacio reservado abajo. Por eso, instalada, lo fijo abajo no suma la zona segura (`@media (display-mode: standalone)` pone `--abajo` en 0, en `codigo/pagina/estilos/base.css`). Si una versión de iOS lo cambia, sacar esa regla y probar en el iPhone que la barra quede pegada abajo, sin cortarse.

Para después de que ande «hoy» («Tengo X minutos»):

- **Aviso para instalarla:** que aparezca solo en Safari sin instalar (no en la app instalada), con los pasos para agregarla a inicio (Compartir › Agregar a inicio). Recordar que los datos de Safari y los de la app instalada son distintos.
- **Un logo de verdad para el ícono, con el nombre nuevo «str3ak»:** las 3 opciones están en `bocetos/logos.html` (cada una en su página, `bocetos/logo-1.html` a `logo-3.html`, para agregarla a inicio y verla junto a las otras apps). Cuando se elija, va en el mismo PR que el cambio de nombre en la app (manifest, `<title>` y `apple-mobile-web-app-title`), así se reinstala 1 sola vez. Los nombres internos (`casa-v1`, `index.html`, `app: 'casa'`, el caché) no cambian.
