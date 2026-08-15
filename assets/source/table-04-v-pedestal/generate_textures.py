"""Generate deterministic preview PBR textures for table-04-v-pedestal."""

from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter


SIZE = 512
OUTPUT_DIR = Path(__file__).resolve().parent / "textures"
RANDOM = random.Random(404)


def height_to_normal(height):
    source = height.load()
    normal = Image.new("RGB", height.size)
    target = normal.load()

    for y in range(SIZE):
        for x in range(SIZE):
            left = source[max(0, x - 1), y]
            right = source[min(SIZE - 1, x + 1), y]
            down = source[x, max(0, y - 1)]
            up = source[x, min(SIZE - 1, y + 1)]
            nx = (left - right) / 255.0
            ny = (down - up) / 255.0
            nz = 1.0
            length = math.sqrt(nx * nx + ny * ny + nz * nz)
            target[x, y] = (
                int((nx / length * 0.5 + 0.5) * 255),
                int((ny / length * 0.5 + 0.5) * 255),
                int((nz / length * 0.5 + 0.5) * 255),
            )

    return normal


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    albedo = Image.new("RGB", (SIZE, SIZE), (12, 13, 16))
    height = Image.new("L", (SIZE, SIZE), 128)
    albedo_draw = ImageDraw.Draw(albedo, "RGBA")
    height_draw = ImageDraw.Draw(height)

    for _ in range(18):
        points = []
        start_y = RANDOM.randint(-100, SIZE + 100)
        amplitude = RANDOM.randint(20, 70)
        phase = RANDOM.random() * math.pi * 2

        for x in range(-40, SIZE + 41, 12):
            y = start_y + math.sin(x / 70.0 + phase) * amplitude + x * RANDOM.uniform(-0.08, 0.08)
            points.append((x, y))

        width = RANDOM.randint(1, 4)
        shade = RANDOM.randint(125, 220)
        albedo_draw.line(points, fill=(shade, shade, shade + 5, RANDOM.randint(80, 170)), width=width)
        height_draw.line(points, fill=145 + width * 7, width=width)

    albedo = albedo.filter(ImageFilter.GaussianBlur(0.45))
    height = height.filter(ImageFilter.GaussianBlur(1.0))
    metallic_roughness = Image.new("RGB", (SIZE, SIZE), (0, 78, 0))

    albedo.save(OUTPUT_DIR / "black-marble-albedo.png", optimize=True)
    height_to_normal(height).save(OUTPUT_DIR / "black-marble-normal.png", optimize=True)
    metallic_roughness.save(
        OUTPUT_DIR / "black-marble-metallic-roughness.png",
        optimize=True,
    )


if __name__ == "__main__":
    main()
