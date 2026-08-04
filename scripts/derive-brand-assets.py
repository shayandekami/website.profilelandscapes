from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


SOURCE = Path(r"C:\Users\James\OneDrive - Profile Landscapes (1)\PLRGB.png")
PUBLIC = Path(r"C:\Apps\profilelandscapes\public")
FOOTER_OUT = PUBLIC / "assets" / "footer-brand-mark.png"
FAVICON_OUT = PUBLIC / "favicon-brand.png"
HEADER_LOCKUP_OUT = PUBLIC / "assets" / "header-brand-lockup-v2.png"
FOOTER_LOCKUP_OUT = PUBLIC / "assets" / "footer-brand-lockup-v2.png"


def extract_emblem(source: Image.Image) -> Image.Image:
    # The supplied artwork places the pictorial mark above the wordmark.
    emblem = source.crop((10, 15, 211, 235)).convert("RGBA")
    pixels = emblem.load()
    width, height = emblem.size
    background = pixels[4, 4][:3]
    visited = set()
    queue = deque()

    def is_background(x: int, y: int) -> bool:
        r, g, b, _ = pixels[x, y]
        return (
            abs(r - background[0]) <= 30
            and abs(g - background[1]) <= 30
            and abs(b - background[2]) <= 30
        )

    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or not (0 <= x < width and 0 <= y < height):
            continue
        visited.add((x, y))
        if not is_background(x, y):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))

    alpha = emblem.getchannel("A")
    bounds = alpha.getbbox()
    if bounds is None:
        raise RuntimeError("Could not locate the logo emblem")
    return emblem.crop(bounds)


def contain(image: Image.Image, size: int, padding: int) -> Image.Image:
    max_side = size - 2 * padding
    scale = min(max_side / image.width, max_side / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(
        resized, ((size - resized.width) // 2, (size - resized.height) // 2)
    )
    return canvas


def extract_wordmark(source: Image.Image) -> Image.Image:
    # Preserve the lettering from the supplied master exactly; do not recreate it
    # with a substitute typeface.
    wordmark = source.crop((24, 232, 222, 330)).convert("RGBA")
    pixels = wordmark.load()
    width, height = wordmark.size
    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            darkness = 255 - min(r, g, b)
            # Build a clean alpha edge from the neutral artwork background.
            alpha = max(0, min(255, round((darkness - 16) * 1.32)))
            pixels[x, y] = (31, 38, 40, alpha)
    bounds = wordmark.getchannel("A").getbbox()
    if bounds is None:
        raise RuntimeError("Could not locate the logo wordmark")
    return wordmark.crop(bounds)


def make_horizontal_lockup(emblem: Image.Image, wordmark: Image.Image, colour: tuple[int, int, int]) -> Image.Image:
    canvas = Image.new("RGBA", (1200, 320), (0, 0, 0, 0))
    emblem_height = 276
    emblem_width = round(emblem.width * emblem_height / emblem.height)
    emblem_large = emblem.resize((emblem_width, emblem_height), Image.Resampling.LANCZOS)

    wordmark_height = 198
    wordmark_width = round(wordmark.width * wordmark_height / wordmark.height)
    wordmark_large = wordmark.resize((wordmark_width, wordmark_height), Image.Resampling.LANCZOS)
    alpha = wordmark_large.getchannel("A")
    wordmark_large = Image.new("RGBA", wordmark_large.size, (*colour, 255))
    wordmark_large.putalpha(alpha)

    gap = 38
    total_width = emblem_width + gap + wordmark_width
    start_x = (canvas.width - total_width) // 2
    canvas.alpha_composite(emblem_large, (start_x, (canvas.height - emblem_height) // 2))
    canvas.alpha_composite(
        wordmark_large,
        (start_x + emblem_width + gap, (canvas.height - wordmark_height) // 2),
    )
    bounds = canvas.getchannel("A").getbbox()
    if bounds is None:
        raise RuntimeError("Could not compose brand lockup")
    return canvas.crop(bounds)


source = Image.open(SOURCE).convert("RGBA")
emblem = extract_emblem(source)
wordmark = extract_wordmark(source)

footer = contain(emblem, 512, 22)
footer.save(FOOTER_OUT, optimize=True)

favicon = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
mask = Image.new("L", favicon.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((8, 8, 503, 503), radius=76, fill=255)
field = Image.new("RGBA", favicon.size, (247, 246, 244, 255))
favicon.alpha_composite(Image.composite(field, favicon, mask))
favicon.alpha_composite(contain(emblem, 512, 54))
favicon.save(FAVICON_OUT, optimize=True)

make_horizontal_lockup(emblem, wordmark, (31, 38, 40)).save(HEADER_LOCKUP_OUT, optimize=True)
make_horizontal_lockup(emblem, wordmark, (255, 255, 255)).save(FOOTER_LOCKUP_OUT, optimize=True)

print(f"Wrote {FOOTER_OUT}")
print(f"Wrote {FAVICON_OUT}")
print(f"Wrote {HEADER_LOCKUP_OUT}")
print(f"Wrote {FOOTER_LOCKUP_OUT}")
