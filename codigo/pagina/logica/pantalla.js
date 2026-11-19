// Instalada en el iPhone, la app ocupa la pantalla entera, hasta la barra de inicio.
// Si el iPhone le da un alto menor (que ya deja afuera la barra de inicio), la zona segura se contaría 2 veces
// y quedaría una franja negra abajo: en ese caso el cuerpo toma el alto de la pantalla.
function ajustarAlto() {
  const instalada = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const raiz = document.documentElement;
  const altoPantalla = Math.max(screen.width, screen.height);
  if (instalada && innerHeight > innerWidth && innerHeight < altoPantalla - 1) {
    raiz.style.setProperty('--alto-app', altoPantalla + 'px');
    raiz.classList.add('alto-pantalla');
  } else {
    raiz.classList.remove('alto-pantalla');
  }
}
ajustarAlto();
addEventListener('resize', ajustarAlto);
