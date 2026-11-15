"""Recorta fotografias reais; não gera nem decodifica QR codes.
Uso: python scripts/prepare-huawei-targets.py DIRETORIO_DAS_FOTOS
Requer Pillow. Cópias documentais preservadas sem processamento.
"""
from pathlib import Path
import shutil
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
# Cantos medidos nas fotos: superior esquerdo, inferior esquerdo,
# inferior direito, superior direito (Pillow QUAD). Margem da etiqueta incluída.
TARGETS = {
    'start-huawei': ('WhatsApp Image 2026-11-15 at 18.36.40.jpeg', (640, 520, 653, 833, 963, 818, 945, 503)),
    'SF01001A': ('WhatsApp Image 2026-11-15 at 18.36.40 (1).jpeg', (337, 614, 375, 996, 762, 991, 771, 600)),
    'SF01014A': ('WhatsApp Image 2026-11-15 at 18.36.41 (1).jpeg', (497, 638, 502, 1028, 899, 1045, 930, 651)),
    'SF01009B': ('WhatsApp Image 2026-11-15 at 18.36.40 (3).jpeg', (345, 669, 382, 1066, 800, 1097, 819, 680)),
    'SF01012B': ('WhatsApp Image 2026-11-15 at 18.36.40 (2).jpeg', (379, 570, 387, 1066, 874, 1092, 922, 587)),
}
assets = ROOT / 'assets/markers/huawei'
docs = ROOT / 'docs/images/huawei'
assets.mkdir(parents=True, exist_ok=True)
docs.mkdir(parents=True, exist_ok=True)
for name, (filename, corners) in TARGETS.items():
    shutil.copyfile(SOURCE / filename, docs / (name + '.jpg'))
    with Image.open(SOURCE / filename) as image:
        image.convert('RGB').transform((512, 512), Image.Transform.QUAD, corners,
                                       Image.Resampling.BICUBIC).save(assets / (name + '.png'))
shutil.copyfile(SOURCE / 'WhatsApp Image 2026-11-15 at 18.36.41 (2).jpeg', docs / 'ambiente-huawei.jpg')
shutil.copyfile(SOURCE / 'image(20261115-215239).png', docs / 'layout-huawei.png')
