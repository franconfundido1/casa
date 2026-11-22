"""Arma los íconos de la app de Android desde codigo/recursos/str3ak-512.png. Necesita Pillow (pip install pillow).

Se corre a mano solo si cambia el ícono; los PNG que arma se commitean en android/.
"""
import pathlib
from PIL import Image

CODIGO = pathlib.Path(__file__).resolve().parent
RES = CODIGO.parent / 'android' / 'app' / 'src' / 'main' / 'res'
ORIGEN = Image.open(CODIGO / 'recursos' / 'str3ak-512.png').convert('RGB')
DENSIDADES = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
# en el ícono adaptable (108 dp), Android recorta con formas distintas: los 3 círculos ocupan el 72 % del PNG,
# así que el PNG va al 80 % para que queden adentro de la zona segura (el círculo de 66 dp del centro)
ESCALA_ADAPTABLE = 0.8


def centrado(lado, escala, fondo):
    lienzo = Image.new(fondo.mode, (lado, lado), 0)
    chico = round(lado * escala)
    lienzo.paste(fondo.resize((chico, chico), Image.LANCZOS), ((lado - chico) // 2,) * 2)
    return lienzo


for nombre, d in DENSIDADES.items():
    carpeta = RES / ('mipmap-' + nombre)
    viejo = round(48 * d)  # el ícono de siempre (Android < 8)
    ORIGEN.resize((viejo, viejo), Image.LANCZOS).save(carpeta / 'ic_launcher.png')
    ORIGEN.resize((viejo, viejo), Image.LANCZOS).save(carpeta / 'ic_launcher_round.png')
    lado = round(108 * d)
    centrado(lado, ESCALA_ADAPTABLE, ORIGEN).save(carpeta / 'ic_launcher_foreground.png')
    # el de 1 color (íconos temáticos de Android 13+): lo blanco queda, lo negro se vuelve transparente
    mono = Image.merge('LA', (Image.new('L', ORIGEN.size, 255), ORIGEN.convert('L')))
    centrado(lado, ESCALA_ADAPTABLE, mono).save(carpeta / 'ic_launcher_monochrome.png')
print('íconos de Android listos en', RES)
