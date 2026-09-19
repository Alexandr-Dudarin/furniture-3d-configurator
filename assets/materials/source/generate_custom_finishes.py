"""Generate original, tileable PBR texture sets used by the configurator.

The oak variants are derived colorways of the registered CC0 oak source. The
stone finishes are original procedural artwork inspired by broad material
categories, not copies of third-party reference images. The generated gold
veins are a decorative printed/coated pattern and intentionally remain
non-metallic in the runtime material.

Optional source-generation dependencies (not runtime dependencies):

    python -m pip install numpy pillow scipy
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter


SIZE = 2048
PUBLIC_ROOT = Path(__file__).resolve().parents[3] / "public" / "materials"
PREVIEW_ROOT = Path(__file__).resolve().parent / "previews"


@dataclass(frozen=True)
class FinishPreview:
    finish_id: str
    label: str
    category: str


def normalize(values: np.ndarray) -> np.ndarray:
    minimum = float(values.min())
    maximum = float(values.max())
    return (values - minimum) / max(maximum - minimum, 1e-8)


def wrapped_noise(seed: int, sigma: float, size: int = SIZE) -> np.ndarray:
    generator = np.random.default_rng(seed)
    noise = generator.normal(size=(size, size)).astype(np.float32)
    return normalize(gaussian_filter(noise, sigma=sigma, mode="wrap"))


def mix(a: np.ndarray, b: np.ndarray, factor: np.ndarray) -> np.ndarray:
    if factor.ndim == 2:
        factor = factor[..., None]
    return a * (1.0 - factor) + b * factor


def save_rgb(path: Path, values: np.ndarray, quality: int = 90) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pixels = np.clip(values * 255.0, 0, 255).astype(np.uint8)
    Image.fromarray(pixels, mode="RGB").save(
        path,
        format="JPEG",
        quality=quality,
        optimize=True,
        progressive=True,
    )


def save_gray(path: Path, values: np.ndarray, quality: int = 90) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pixels = np.clip(values * 255.0, 0, 255).astype(np.uint8)
    Image.fromarray(pixels, mode="L").save(
        path,
        format="JPEG",
        quality=quality,
        optimize=True,
        progressive=True,
    )


def normal_from_height(height: np.ndarray, strength: float) -> np.ndarray:
    dx = (np.roll(height, -1, axis=1) - np.roll(height, 1, axis=1)) * strength
    dy = (np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)) * strength
    normal = np.dstack((-dx, -dy, np.ones_like(height)))
    normal /= np.linalg.norm(normal, axis=2, keepdims=True)
    return normal * 0.5 + 0.5


def validate_repeat_edges(directory: Path) -> None:
    """Reject a generated map whose wrapped boundary is visibly discontinuous."""

    for filename in ("base-color.jpg", "roughness.jpg", "normal-gl.jpg"):
        pixels = np.asarray(
            Image.open(directory / filename).convert("RGB"),
            dtype=np.float32,
        ) / 255.0
        adjacent_x = float(np.abs(pixels[:, 1:] - pixels[:, :-1]).mean())
        adjacent_y = float(np.abs(pixels[1:] - pixels[:-1]).mean())
        seam_x = float(np.abs(pixels[:, 0] - pixels[:, -1]).mean())
        seam_y = float(np.abs(pixels[0] - pixels[-1]).mean())

        if seam_x > max(adjacent_x * 3.0, 0.018):
            raise ValueError(
                f"{directory.name}/{filename}: horizontal repeat seam "
                f"{seam_x:.4f} exceeds local variation {adjacent_x:.4f}"
            )

        if seam_y > max(adjacent_y * 3.0, 0.018):
            raise ValueError(
                f"{directory.name}/{filename}: vertical repeat seam "
                f"{seam_y:.4f} exceeds local variation {adjacent_y:.4f}"
            )


def write_set(
    category: str,
    finish_id: str,
    color: np.ndarray,
    roughness: np.ndarray,
    height: np.ndarray,
    normal_strength: float,
) -> FinishPreview:
    destination = PUBLIC_ROOT / category / finish_id
    save_rgb(destination / "base-color.jpg", color)
    save_gray(destination / "roughness.jpg", roughness)
    save_rgb(
        destination / "normal-gl.jpg",
        normal_from_height(height, normal_strength),
        quality=92,
    )
    return FinishPreview(finish_id, finish_id, category)


def generate_wood(
    finish_id: str,
    label: str,
    base_color: tuple[float, float, float],
    dark_color: tuple[float, float, float],
    roughness_base: float,
) -> FinishPreview:
    source = PUBLIC_ROOT / "wood" / "oak-natural"
    source_color = (
        np.asarray(Image.open(source / "base-color.jpg").convert("RGB"), dtype=np.float32)
        / 255.0
    )
    luminance = (
        source_color[..., 0] * 0.2126
        + source_color[..., 1] * 0.7152
        + source_color[..., 2] * 0.0722
    )
    low, high = np.percentile(luminance, (2.0, 98.0))
    grain = np.clip((luminance - low) / max(high - low, 1e-8), 0.0, 1.0)
    grain = np.power(grain, 0.92)

    light = np.asarray(base_color, dtype=np.float32)
    dark = np.asarray(dark_color, dtype=np.float32)
    color = mix(dark, light, 0.12 + grain * 0.88)

    source_roughness = np.asarray(
        Image.open(source / "roughness.jpg").convert("L"),
        dtype=np.float32,
    ) / 255.0
    roughness = np.clip(
        roughness_base + (source_roughness - 0.5) * 0.32,
        0.32,
        0.84,
    )
    normal = np.asarray(
        Image.open(source / "normal-gl.jpg").convert("RGB"),
        dtype=np.float32,
    ) / 255.0

    destination = PUBLIC_ROOT / "wood" / finish_id
    save_rgb(destination / "base-color.jpg", color)
    save_gray(destination / "roughness.jpg", roughness)
    save_rgb(destination / "normal-gl.jpg", normal, quality=92)
    return FinishPreview(finish_id, label, "wood")


def marble_fields(seed: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    y, x = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)
    u = x / SIZE
    v = y / SIZE
    broad = wrapped_noise(seed, 92.0)
    medium = wrapped_noise(seed + 1, 27.0)
    fine = wrapped_noise(seed + 2, 5.0)

    phase = 2.0 * np.pi * (
        1.0 * u
        + 2.0 * v
        + 1.2 * (broad - 0.5)
        + 0.32 * (medium - 0.5)
    )
    branch_phase = 2.0 * np.pi * (
        3.0 * u
        - 1.0 * v
        + 1.05 * (broad - 0.5)
        - 0.2 * (fine - 0.5)
    )
    primary = np.exp(-np.abs(np.sin(phase)) * 18.0)
    branches = np.exp(-np.abs(np.sin(branch_phase)) * 30.0)
    gold = np.clip(primary * 0.94 + branches * 0.48 - 0.08, 0.0, 1.0)
    # Keep every component periodic over exactly one texture tile.  The old
    # half-frequency term (``sin(phase * 0.5)``) changed sign at one horizontal
    # boundary.  RepeatWrapping therefore exposed the boundary as a darker
    # rectangular band as soon as a tabletop grew beyond its base size.
    soft = normalize(
        0.58 * broad
        + 0.28 * medium
        + 0.14 * (0.5 + 0.5 * np.sin(phase))
    )
    return gold, soft, fine


def generate_marble(
    finish_id: str,
    label: str,
    mode: str,
    seed: int,
) -> FinishPreview:
    gold, soft, fine = marble_fields(seed)
    gold_color = np.asarray([0.73, 0.45, 0.09], dtype=np.float32)
    gold_highlight = np.asarray([0.94, 0.72, 0.22], dtype=np.float32)
    gold_tone = mix(gold_color, gold_highlight, fine)

    if mode == "white":
        pale = np.asarray([0.94, 0.935, 0.90], dtype=np.float32)
        cool = np.asarray([0.68, 0.70, 0.70], dtype=np.float32)
        # Marble may have local clouds, but not a broad baked-in lighting
        # gradient.  Keeping the tonal modulation restrained prevents each
        # repeated tile from reading as a separate light/dark slab.
        color = mix(pale, cool, np.power(soft, 2.8) * 0.18)
        color = mix(color, gold_tone, np.power(gold, 0.72) * 0.92)
        roughness_base = 0.48
    elif mode == "black":
        black = np.asarray([0.018, 0.021, 0.024], dtype=np.float32)
        graphite = np.asarray([0.17, 0.18, 0.19], dtype=np.float32)
        color = mix(black, graphite, np.power(soft, 1.8) * 0.34)
        color = mix(color, gold_tone, np.power(gold, 0.68) * 0.96)
        roughness_base = 0.4
    elif mode == "duo":
        region = gaussian_filter(soft, sigma=30.0, mode="wrap")
        transition = np.clip((region - 0.39) / 0.25, 0.0, 1.0)
        white = np.asarray([0.91, 0.90, 0.86], dtype=np.float32)
        black = np.asarray([0.025, 0.028, 0.032], dtype=np.float32)
        color = mix(black, white, transition)
        color *= (0.91 + 0.14 * fine)[..., None]
        boundary = np.exp(-np.abs(region - 0.5) * 45.0)
        gold = np.clip(gold * 0.65 + boundary * 0.92, 0.0, 1.0)
        color = mix(color, gold_tone, np.power(gold, 0.7) * 0.96)
        roughness_base = 0.44
    else:
        raise ValueError(f"Unknown marble mode: {mode}")

    height = normalize(soft * 0.22 + gold * 0.13 + fine * 0.04)
    roughness = np.clip(
        roughness_base
        + (soft - 0.5) * 0.08
        - gold * 0.11,
        0.26,
        0.62,
    )
    preview = write_set(
        "stone",
        finish_id,
        color,
        roughness,
        height,
        normal_strength=3.8,
    )
    validate_repeat_edges(
        PUBLIC_ROOT / "stone" / finish_id,
    )
    return FinishPreview(preview.finish_id, label, preview.category)


def generate_terrazzo() -> FinishPreview:
    seed = 407
    generator = np.random.default_rng(seed)
    base = np.asarray([0.73, 0.70, 0.65], dtype=np.float32)
    color = np.ones((SIZE, SIZE, 3), dtype=np.float32) * base
    color *= (0.96 + wrapped_noise(seed, 34.0) * 0.08)[..., None]

    color_image = Image.fromarray(
        np.clip(color * 255.0, 0, 255).astype(np.uint8),
        mode="RGB",
    )
    color_draw = ImageDraw.Draw(color_image)
    chip_mask_image = Image.new("L", (SIZE, SIZE), 0)
    chip_mask_draw = ImageDraw.Draw(chip_mask_image)
    palette = [
        (0.16, 0.17, 0.18),
        (0.87, 0.84, 0.77),
        (0.44, 0.39, 0.34),
        (0.63, 0.57, 0.48),
        (0.28, 0.31, 0.30),
    ]

    for _ in range(420):
        cx = int(generator.integers(0, SIZE))
        cy = int(generator.integers(0, SIZE))
        rx = int(generator.integers(5, 30))
        ry = int(generator.integers(4, 24))
        chip_color = palette[int(generator.integers(0, len(palette)))]
        chip_rgb = tuple(int(channel * 255) for channel in chip_color)

        for shift_x in (-SIZE, 0, SIZE):
            for shift_y in (-SIZE, 0, SIZE):
                bounds = (
                    cx - rx + shift_x,
                    cy - ry + shift_y,
                    cx + rx + shift_x,
                    cy + ry + shift_y,
                )
                color_draw.ellipse(bounds, fill=chip_rgb)
                chip_mask_draw.ellipse(bounds, fill=255)

    color = np.asarray(color_image, dtype=np.float32) / 255.0
    chip_mask = np.asarray(chip_mask_image, dtype=np.float32) / 255.0
    fine = wrapped_noise(seed + 1, 2.5)
    height = normalize(fine * 0.18 + chip_mask * 0.06)
    roughness = np.clip(0.61 + (fine - 0.5) * 0.1 - chip_mask * 0.07, 0.42, 0.75)
    preview = write_set(
        "stone",
        "terrazzo-neutral",
        color,
        roughness,
        height,
        normal_strength=3.2,
    )
    return FinishPreview(preview.finish_id, "Нейтральное терраццо", preview.category)


def create_contact_sheet(previews: list[FinishPreview]) -> None:
    PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    tile_width = 520
    tile_height = 300
    columns = 2
    rows = (len(previews) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * tile_width, rows * tile_height), "#17191c")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            size=19,
        )
    except OSError:
        font = ImageFont.load_default(size=19)

    for index, preview in enumerate(previews):
        row, column = divmod(index, columns)
        source = PUBLIC_ROOT / preview.category / preview.finish_id / "base-color.jpg"
        texture = Image.open(source).convert("RGB")
        texture.thumbnail((tile_width - 28, tile_height - 60))
        left = column * tile_width + 14
        top = row * tile_height + 14
        sheet.paste(texture, (left, top))
        draw.text(
            (left, tile_height * row + tile_height - 36),
            preview.label,
            fill="#f2f2ef",
            font=font,
        )

    sheet.save(
        PREVIEW_ROOT / "custom-finishes-contact-sheet.jpg",
        format="JPEG",
        quality=91,
        optimize=True,
        progressive=True,
    )


def main() -> None:
    previews = [
        generate_wood(
            "oak-grey",
            "Серый дуб",
            (0.60, 0.59, 0.56),
            (0.29, 0.30, 0.30),
            roughness_base=0.55,
        ),
        generate_wood(
            "oak-silver",
            "Светлый серебристый дуб",
            (0.86, 0.84, 0.78),
            (0.56, 0.55, 0.52),
            roughness_base=0.52,
        ),
        generate_wood(
            "oak-black",
            "Чёрный дуб",
            (0.20, 0.19, 0.18),
            (0.035, 0.038, 0.04),
            roughness_base=0.48,
        ),
        generate_marble(
            "marble-white-gold",
            "Белый мрамор с золотым рисунком",
            mode="white",
            seed=211,
        ),
        generate_marble(
            "marble-black-gold",
            "Чёрный мрамор с золотым рисунком",
            mode="black",
            seed=257,
        ),
        generate_marble(
            "marble-duo-gold",
            "Контрастный мрамор с золотым рисунком",
            mode="duo",
            seed=293,
        ),
        generate_terrazzo(),
    ]
    create_contact_sheet(previews)


if __name__ == "__main__":
    main()
