// Ajustes › copia de seguridad: bajar todo el estado a un .json y volver a cargarlo.
// En el iPhone, «Bajar copia» abre el menú de compartir (desde ahí, «Guardar en Archivos»); si no se puede, baja el archivo.
// En la app de Android (Capacitor) no andan ni el compartir ni las descargas de la web: la copia se guarda en la carpeta Documentos
// y después se abre el menú de compartir de Android (para mandarla a Drive), con los complementos de Capacitor.

const notaCopia = document.getElementById('nota-copia');
const hojaCopia = document.getElementById('hoja-copia');
const textoCopia = document.getElementById('texto-copia');
const reemplazarBtn = document.getElementById('reemplazar');
const archivoCopia = document.getElementById('archivo-copia');
let copiaLeida = null;

function avisarCopia(texto) {
  notaCopia.textContent = texto;
  notaCopia.classList.remove('cambia'); void notaCopia.offsetWidth; notaCopia.classList.add('cambia');
}

document.getElementById('bajar-copia').onclick = async () => {
  const ahora = new Date();
  const dia = diaLocal(ahora);
  const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  const texto = armarCopia(estado, dia, hora);
  const archivos = window.Capacitor && Capacitor.isNativePlatform() && Capacitor.Plugins.Filesystem;
  if (archivos) {
    // si ya hay una copia de hoy que no hizo esta instalación, Android no deja pisarla: va con la hora en el nombre
    for (const nombre of [nombreCopia(dia), nombreCopia(dia).replace('.json', '-' + hora.replace(':', '') + '.json')]) {
      try {
        const { uri } = await archivos.writeFile({ path: nombre, data: texto, directory: 'DOCUMENTS', encoding: 'utf8' });
        avisarCopia('Copia guardada en Documentos: ' + nombre);
        try { await Capacitor.Plugins.Share.share({ files: [uri] }); } catch (e) { /* cerraste el menú: igual quedó en Documentos */ }
        return;
      } catch (e) { /* probar con el otro nombre */ }
    }
    return avisarCopia('No se pudo guardar la copia.');
  }
  const archivo = new File([texto], nombreCopia(dia), { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo] });
      avisarCopia('Copia lista.');
    } catch (e) { /* cerraste el menú sin elegir: no pasa nada */ }
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(archivo);
  a.download = archivo.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  avisarCopia('Copia bajada: ' + archivo.name);
};

document.getElementById('cargar-copia').onclick = () => archivoCopia.click();

// Leer el archivo y pedir confirmación antes de reemplazar
archivoCopia.addEventListener('change', async () => {
  const f = archivoCopia.files[0];
  archivoCopia.value = '';
  if (!f) return;
  const r = leerCopia(await f.text());
  copiaLeida = r.ok ? r.estado : null;
  if (r.ok) {
    const de = r.resumen.dia ? `Copia del ${fechaLarga(r.resumen.dia)}` : 'Copia';
    textoCopia.textContent = `${de}: ${r.resumen.tareas} tareas y ${r.resumen.hechas} hechas.`;
  } else {
    textoCopia.textContent = r.error;
  }
  reemplazarBtn.hidden = !r.ok;
  hojaCopia.classList.add('abierta');
});

function cerrarHojaCopia() { hojaCopia.classList.remove('abierta'); copiaLeida = null; }
document.getElementById('cerrar-copia').onclick = cerrarHojaCopia;
document.getElementById('velo-copia').onclick = cerrarHojaCopia;

reemplazarBtn.onclick = () => {
  if (!copiaLeida) return;
  estado = copiaLeida;
  prepararDia();
  guardarDatos();
  pintarTodo();
  cerrarHojaCopia();
  avisarCopia('Copia cargada.');
};
