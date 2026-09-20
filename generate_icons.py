"""Genera icon-192.png e icon-512.png para la PWA (target/anillo cian sobre teal)."""
from PIL import Image, ImageDraw

def make(size, path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # fondo redondeado indigo profundo
    r = int(size * 0.22)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=(20, 18, 42, 255))
    cx = cy = size / 2
    teal = (109, 94, 214, 255)     # indigo
    cyan = (139, 124, 255, 255)    # violeta acento
    white = (216, 209, 255, 255)   # lavanda claro
    # anillos concéntricos (diana = "norte")
    def ring(frac, color, w):
        rr = size * frac
        wpx = max(2, int(size * w))
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=color, width=wpx)
    ring(0.34, teal, 0.055)
    ring(0.24, cyan, 0.055)
    ring(0.13, white, 0.055)
    # centro
    dot = size * 0.045
    d.ellipse([cx - dot, cy - dot, cx + dot, cy + dot], fill=cyan)
    img.save(path)
    print("ok", path)

make(192, "icon-192.png")
make(512, "icon-512.png")
