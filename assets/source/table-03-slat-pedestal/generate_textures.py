"""Generate deterministic preview PBR textures for table-03-slat-pedestal."""

from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter


SIZE = 512
OUTPUT_DIR = Path(__file__).resolve().parent / "textures"
RANDOM = random.Random(303)


def build_height_field():
    image = Image.new("L", (SIZE, SIZE))
    pixels = image.load()

    for y in range(SIZE):
        broad = math.sin(y / 18.0) * 15 + math.sin(y / 47.0) * 10
        for x in range(SIZE):
            fine = math.sin((y + math.sin(x / 58.0) * 14) / 4.7) * 6
            noise = RANDOM.uniform(-3.5, 3.5)
            pixels[x, y] = int(max(0, min(255, 128 + broad + fine + noise)))

    return image.filter(ImageFilter.GaussianBlur(0.8))


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
            nx = (left - right) / 255.0 * 1.8
            ny = (down - up) / 255.0 * 1.8
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
    height = build_height_field()

    albedo = Image.new("RGB", (SIZE, SIZE))
    height_pixels = height.load()
    albedo_pixels = albedo.load()

    for y in range(SIZE):
        for x in range(SIZE):
            value = height_pixels[x, y] - 128
            albedo_pixels[x, y] = (
                max(0, min(255, 170 + value)),
                max(0, min(255, 119 + int(value * 0.72))),
                max(0, min(255, 68 + int(value * 0.45))),
            )

    draw = ImageDraw.Draw(albedo, "RGBA")
    for _ in range(16):
        y = RANDOM.randrange(SIZE)
        draw.line(
            [(0, y), (SIZE, y + RANDOM.randint(-12, 12))],
            fill=(70, 35, 12, RANDOM.randint(18, 40)),
            width=RANDOM.randint(1, 3),
        )

    metallic_roughness = Image.new("RGB", (SIZE, SIZE), (0, 185, 0))

    albedo.save(OUTPUT_DIR / "oak-albedo.png", optimize=True)
    height_to_normal(height).save(OUTPUT_DIR / "oak-normal.png", optimize=True)
    metallic_roughness.save(
        OUTPUT_DIR / "oak-metallic-roughness.png",
        optimize=True,
    )


if __name__ == "__main__":
    main()
