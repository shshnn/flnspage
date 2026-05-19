"""Remove near-uniform background from logo PNG (soft edge)."""
from pathlib import Path

from PIL import Image


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "assets" / "logo-en.png"
    dst = root / "assets" / "logo-en-nukki.png"
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    pts = [
        (0, 0),
        (w - 1, 0),
        (0, h - 1),
        (w - 1, h - 1),
        (2, 2),
        (w - 3, 2),
        (2, h - 3),
        (w - 3, h - 3),
    ]
    rs, gs, bs = [], [], []
    for x, y in pts:
        r, g, b, _ = px[x, y]
        rs.append(r)
        gs.append(g)
        bs.append(b)
    br = sum(rs) / len(rs)
    bg = sum(gs) / len(gs)
    bb = sum(bs) / len(bs)

    def dist(rgb: tuple[int, int, int]) -> float:
        r, g, b = rgb
        return ((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2) ** 0.5

    hard = 28.0
    soft = 55.0

    for y in range(h):
        for x in range(w):
            r, g, b, a0 = px[x, y]
            d = dist((r, g, b))
            if d <= hard:
                px[x, y] = (r, g, b, 0)
            elif d >= soft:
                continue
            else:
                t = (d - hard) / (soft - hard)
                alpha = int(round(255 * t))
                alpha = max(0, min(255, alpha))
                px[x, y] = (r, g, b, min(a0, alpha))

    im.save(dst, optimize=True)
    print("OK", dst, dst.stat().st_size)


if __name__ == "__main__":
    main()
