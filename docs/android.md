# str3ak en Android

La app de la tablet (Galaxy Tab S10 FE+) es la misma página (`salida/index.html`) adentro de una app nativa hecha con Capacitor. No pasa por Play Store: el APK lo compila GitHub y se baja de los Releases del repo.

- Proyecto: `android/` (lo arma Capacitor; `capacitor.config.json` y `package.json` en la raíz).
- Nombre interno: `io.neocities.franketf2.casa`. **No se cambia nunca**: con otro nombre, Android la toma como otra app (sin tus datos).
- Versión: `VERSION_APP` de `codigo/build.py` (la de Ajustes). «1.2» pasa a ser la versión 10200 de Android. Tiene que subir en cada cambio: Android no instala una versión más vieja encima.
- Workflow: «App de Android» (`.github/workflows/android.yml`). Corre al fusionar en main algo que cambie la app y crea el Release `v1.2` con `str3ak.apk`.
- Datos: los de la app de Android son distintos de los de Chrome o de la web en Neocities. Se pasan con la copia de seguridad.
- La copia de seguridad, en la app, se guarda en la carpeta **Documentos** de la tablet (Mis archivos › Almacenamiento interno › Documents).
- La versión web en Neocities sigue andando igual, para probar rápido.

## 1. La clave de firma (1 sola vez)

Android solo deja actualizar una app si la versión nueva está firmada con la misma clave. Se genera 1 vez y se guarda en los secretos del repo.

> **Guardá una copia de la clave (`str3ak.jks`) y de la contraseña fuera de GitHub** (en Drive o en un gestor de contraseñas). GitHub no deja volver a ver un secreto. Si la perdés, la próxima versión no se puede instalar encima: hay que desinstalar la app, y al desinstalar se borran los datos (bajá una copia antes).

Hace falta `keytool`, que viene con Java. Si no tenés una compu con Java, sirve **Google Cloud Shell** (shell.cloud.google.com, gratis, se abre desde el navegador de la tablet y ya trae `keytool`).

1. Generar la clave (pide una contraseña: elegí una larga y anotala; la usa 2 veces):

   ```
   keytool -genkeypair -keystore str3ak.jks -alias str3ak -keyalg RSA -keysize 4096 -validity 36500 -dname "CN=str3ak"
   ```

2. Pasarla a texto (base64), para poder pegarla como secreto:

   - Linux o Cloud Shell: `base64 -w0 str3ak.jks > str3ak.txt`
   - Mac: `base64 -i str3ak.jks -o str3ak.txt`
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("str3ak.jks")) > str3ak.txt`

3. En GitHub: el repo › Settings › Secrets and variables › Actions › New repository secret. Crear 3:

   | Nombre | Valor |
   |---|---|
   | `ANDROID_CLAVE` | todo el contenido de `str3ak.txt` |
   | `ANDROID_CLAVE_CONTRASENA` | la contraseña del paso 1 |
   | `ANDROID_CLAVE_ALIAS` | `str3ak` |

4. Guardar `str3ak.jks` y la contraseña en un lugar seguro (ver arriba) y borrar `str3ak.txt`. En Cloud Shell, bajá el `.jks` antes de cerrar (⋮ › Download).

5. Para la 1.ª versión: Actions › «App de Android» › Run workflow (rama main). Tarda unos 5 minutos y queda en Releases.

## 2. Instalarla en la tablet

1. En la tablet, abrí en Chrome (o Samsung Internet):
   `https://github.com/franconfundido1/casa/releases/latest/download/str3ak.apk`
   Siempre baja la última versión: conviene guardarlo como favorito.
2. Cuando termina de bajar, tocá el aviso de la descarga (o abrí Mis archivos › Descargas › `str3ak.apk`).
3. La 1.ª vez, Android avisa que no permite instalar apps desconocidas de esa fuente: tocá **Ajustes** y activá **Permitir desde esta fuente** para Chrome (o para Mis archivos, según desde dónde lo abriste). Volvé atrás.
   - Si no aparece el aviso: Ajustes › Aplicaciones › ⋮ › Acceso especial › Instalar aplicaciones desconocidas › Chrome › Permitir.
4. Tocá **Instalar**. Si Play Protect avisa que no conoce la app, tocá **Más detalles › Instalar de todas formas**.
5. Abrí str3ak desde el cajón de apps. Arranca vacía (con las 9 tareas de arranque): seguí con el paso 4 para traer tus datos.

Si querés, después apagá el permiso del paso 3: para actualizar se vuelve a pedir.

## 3. Actualizarla

1. Cuando se fusiona un PR que cambia la app, el workflow crea un Release nuevo (`v1.3`, etc.). Lo ves en el repo › Releases, o en Actions.
2. En la tablet, abrí el mismo enlace del paso 2 y abrí el archivo bajado.
3. Android dice **Actualizar** (no «Instalar»): tocalo. Los datos se quedan.
4. En str3ak › Ajustes, abajo de todo, tiene que decir la versión nueva.

Si dice «Instalar» en lugar de «Actualizar», o «La app no se instaló», **no desinstales**: es que la clave no coincide o la versión no subió. Avisame.

## 4. Pasar tus datos del iPhone a la tablet

1. En el iPhone, abrí str3ak **instalada** (la del ícono de inicio, no Safari: tienen datos distintos).
2. Ajustes › **Bajar copia**. Se abre el menú de compartir: mandátela a vos mismo (por mail o WhatsApp) o guardala en Google Drive. El archivo se llama `str3ak-copia-AAAA-MM-DD.json`.
3. En la tablet, bajá ese archivo (desde el mail, WhatsApp o Drive) para que quede en la tablet.
4. Abrí str3ak › Ajustes › **Cargar copia** y elegí el archivo.
5. Muestra un resumen (cuántas tareas, de qué día es la copia): tocá **Reemplazar**.
6. Mirá en «tareas» que estén las tuyas, con su última vez.

Desde ahí, la que vale es la tablet: lo que marques en el iPhone ya no pasa solo a la tablet.

## Lo que no se puede probar en la compu

- Instalar el APK y actualizarlo encima (que diga «Actualizar» y no se pierdan los datos).
- Que la barra de estado y la de navegación de Android no tapen nada (arriba y abajo).
- Que «Bajar copia» deje el archivo en Documentos y «Cargar copia» lo encuentre.
- El ícono en el cajón de apps (también con los íconos temáticos de 1 color, si los usás).
- Abrirla en modo avión: tiene que andar igual (la página va adentro de la app).
