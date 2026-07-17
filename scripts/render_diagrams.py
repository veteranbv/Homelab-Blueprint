#!/usr/bin/env python3
"""Render deterministic light and dark SVG architecture diagrams."""

from __future__ import annotations

import argparse
import hashlib
import html
import importlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import TypedDict, cast


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "diagrams"
OUTPUT_DIR = ROOT / "docs" / "images"
MANIFEST = OUTPUT_DIR / "render-manifest.json"
SLUG_PATTERN = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")


class Theme(TypedDict):
    background: str
    surface: str
    surface_muted: str
    border: str
    text: str
    muted: str
    blue: str
    green: str
    pink: str
    amber: str
    red: str


THEMES: dict[str, Theme] = {
    "light": {
        "background": "#ffffff",
        "surface": "#f6f8fa",
        "surface_muted": "#eef2f6",
        "border": "#d0d7de",
        "text": "#1f2328",
        "muted": "#59636e",
        "blue": "#0969da",
        "green": "#1a7f37",
        "pink": "#bf3989",
        "amber": "#9a6700",
        "red": "#cf222e",
    },
    "dark": {
        "background": "#0d1117",
        "surface": "#161b22",
        "surface_muted": "#1c2128",
        "border": "#30363d",
        "text": "#e6edf3",
        "muted": "#9198a1",
        "blue": "#58a6ff",
        "green": "#3fb950",
        "pink": "#f778ba",
        "amber": "#d29922",
        "red": "#ff7b72",
    },
}


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def color(theme: Theme, tone: str) -> str:
    if tone not in theme:
        raise ValueError(f"Unknown tone: {tone}")
    return cast(str, theme[tone])


def validate_id(value: object) -> str:
    diagram_id = str(value)
    if not SLUG_PATTERN.fullmatch(diagram_id):
        raise ValueError("Diagram id must be a lowercase hyphenated slug")
    return diagram_id


def output_path_for(source: dict[str, object], theme_name: str) -> Path:
    diagram_id = validate_id(source["id"])
    suffix = "-dark" if theme_name == "dark" else ""
    output_path = (OUTPUT_DIR / f"{diagram_id}{suffix}.svg").resolve()
    if output_path.parent != OUTPUT_DIR.resolve():
        raise ValueError("Diagram output must remain inside docs/images")
    return output_path


def render_node(node: dict[str, object], theme: Theme) -> list[str]:
    x = int(node["x"])
    y = int(node["y"])
    width = int(node["width"])
    height = int(node["height"])
    style = str(node.get("style", "card"))
    tone = str(node.get("tone", "blue"))
    accent = color(theme, tone)
    if style == "section":
        parts = [f'<g id="{esc(node["id"])}">']
        parts.append(f'<circle cx="{x + 5}" cy="{y + 8}" r="5" fill="{accent}"/>')
        parts.append(
            f'<text x="{x + 22}" y="{y + 15}" class="title" fill="{theme["text"]}">'
            f'{esc(node["title"])}</text>'
        )
        for index, line in enumerate(cast(list[str], node.get("lines", []))):
            parts.append(
                f'<text x="{x + 22}" y="{y + 55 + index * 30}" class="body" '
                f'fill="{theme["muted"]}">{esc(line)}</text>'
            )
        parts.append("</g>")
        return parts
    fill = theme["surface_muted"] if style == "group" else theme["surface"]
    dash = ' stroke-dasharray="9 8"' if style == "group" else ""
    stroke = theme["red"] if style == "warning" else theme["border"]
    parts = [
        f'<g id="{esc(node["id"])}">',
        f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="16" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="2"{dash}/>',
        f'<rect x="{x}" y="{y}" width="6" height="{height}" rx="3" fill="{accent}"/>',
    ]
    badge = node.get("badge")
    if badge:
        badge_width = max(82, len(str(badge)) * 9 + 24)
        badge_x = x + width - badge_width - 22
        parts.extend(
            [
                f'<rect x="{badge_x}" y="{y + 20}" width="{badge_width}" height="30" rx="15" '
                f'fill="{theme["background"]}" stroke="{theme["border"]}"/>',
                f'<text x="{badge_x + badge_width / 2}" y="{y + 41}" text-anchor="middle" '
                f'class="badge" fill="{accent}">{esc(badge)}</text>',
            ]
        )
    parts.append(
        f'<text x="{x + 28}" y="{y + 42}" class="title" fill="{theme["text"]}">'
        f'{esc(node["title"])}</text>'
    )
    for index, line in enumerate(cast(list[str], node.get("lines", []))):
        parts.append(
            f'<text x="{x + 28}" y="{y + 76 + index * 28}" class="body" '
            f'fill="{theme["muted"]}">{esc(line)}</text>'
        )
    parts.append("</g>")
    return parts


def render_group(group: dict[str, object], theme: Theme) -> list[str]:
    x = int(group["x"])
    y = int(group["y"])
    width = int(group["width"])
    height = int(group["height"])
    tone = str(group.get("tone", "blue"))
    accent = color(theme, tone)
    dashed = ' stroke-dasharray="10 8"' if group.get("style") == "dashed" else ""
    parts = [
        f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="14" '
        f'fill="{theme["background"]}" stroke="{theme["border"]}" stroke-width="2"{dashed}/>'
    ]
    title = group.get("title")
    if title:
        header_height = int(group.get("header_height", 86))
        parts.extend(
            [
                f'<path d="M {x + 1} {y + header_height} V {y + 14} Q {x + 1} {y + 1} '
                f'{x + 14} {y + 1} H {x + width - 14} Q {x + width - 1} {y + 1} '
                f'{x + width - 1} {y + 14} V {y + header_height} Z" fill="{theme["surface"]}"/>',
                f'<line x1="{x}" y1="{y + header_height}" x2="{x + width}" '
                f'y2="{y + header_height}" stroke="{theme["border"]}"/>',
                f'<circle cx="{x + 34}" cy="{y + 32}" r="7" fill="{accent}"/>',
                f'<text x="{x + 56}" y="{y + 40}" class="group-title" '
                f'fill="{theme["text"]}">{esc(title)}</text>',
            ]
        )
        subtitle = group.get("subtitle")
        if subtitle:
            parts.append(
                f'<text x="{x + 56}" y="{y + 68}" class="small" '
                f'fill="{theme["muted"]}">{esc(subtitle)}</text>'
            )
        badge = group.get("badge")
        if badge:
            badge_width = max(92, len(str(badge)) * 9 + 26)
            badge_x = x + width - badge_width - 24
            parts.extend(
                [
                    f'<rect x="{badge_x}" y="{y + 23}" width="{badge_width}" height="32" '
                    f'rx="16" fill="{theme["background"]}" stroke="{theme["border"]}"/>',
                    f'<text x="{badge_x + badge_width / 2}" y="{y + 45}" text-anchor="middle" '
                    f'class="badge" fill="{accent}">{esc(badge)}</text>',
                ]
            )
    return parts


def render_separator(separator: dict[str, object], theme: Theme) -> str:
    return (
        f'<line x1="{int(separator["x1"])}" y1="{int(separator["y1"])}" '
        f'x2="{int(separator["x2"])}" y2="{int(separator["y2"])}" '
        f'stroke="{theme["border"]}" stroke-width="1"/>'
    )


def render_arrow(arrow: dict[str, object], theme: Theme) -> list[str]:
    points = cast(list[list[int]], arrow["points"])
    if len(points) < 2:
        raise ValueError("Arrow needs at least two points")
    path = "M " + " L ".join(f"{x} {y}" for x, y in points)
    tone = str(arrow.get("tone", "green"))
    stroke = color(theme, tone)
    parts = [
        f'<path d="{path}" fill="none" stroke="{stroke}" stroke-width="2.5" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
    ]
    previous_x, previous_y = points[-2]
    tip_x, tip_y = points[-1]
    if abs(tip_x - previous_x) >= abs(tip_y - previous_y):
        direction = 1 if tip_x > previous_x else -1
        triangle = f"{tip_x},{tip_y} {tip_x - 10 * direction},{tip_y - 6} {tip_x - 10 * direction},{tip_y + 6}"
    else:
        direction = 1 if tip_y > previous_y else -1
        triangle = f"{tip_x},{tip_y} {tip_x - 6},{tip_y - 10 * direction} {tip_x + 6},{tip_y - 10 * direction}"
    parts.append(f'<polygon points="{triangle}" fill="{stroke}"/>')
    label = arrow.get("label")
    label_at = arrow.get("label_at")
    if label and label_at:
        label_x, label_y = cast(list[int], label_at)
        parts.append(
            f'<text x="{label_x}" y="{label_y}" text-anchor="middle" class="label" '
            f'fill="{color(theme, tone)}">{esc(label)}</text>'
        )
    return parts


def render(source: dict[str, object], theme_name: str) -> str:
    theme = THEMES[theme_name]
    validate_id(source["id"])
    width = int(source["width"])
    height = int(source["height"])
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" '
        f'viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
        f'<title id="title">{esc(source["title"])}</title>',
        f'<desc id="desc">{esc(source["description"])}</desc>',
        "<defs>",
        "<style>",
        ".eyebrow{font-family:Arial,'Helvetica Neue',sans-serif;font-size:18px;font-weight:700;letter-spacing:2px}",
        ".heading{font-family:Arial,'Helvetica Neue',sans-serif;font-size:34px;font-weight:700}",
        ".group-title{font-family:Arial,'Helvetica Neue',sans-serif;font-size:25px;font-weight:700}",
        ".title{font-family:Arial,'Helvetica Neue',sans-serif;font-size:22px;font-weight:700}",
        ".body{font-family:Arial,'Helvetica Neue',sans-serif;font-size:18px;font-weight:400}",
        ".small{font-family:Arial,'Helvetica Neue',sans-serif;font-size:17px;font-weight:400}",
        ".label{font-family:Menlo,Consolas,monospace;font-size:15px;font-weight:700;letter-spacing:.5px}",
        ".badge{font-family:Menlo,Consolas,monospace;font-size:14px;font-weight:700;letter-spacing:.8px}",
        "</style>",
    ]
    parts.extend(
        [
            "</defs>",
            f'<rect width="{width}" height="{height}" fill="{theme["background"]}"/>',
            f'<text x="52" y="54" class="eyebrow" fill="{theme["blue"]}">{esc(source["eyebrow"])}</text>',
            f'<text x="52" y="98" class="heading" fill="{theme["text"]}">{esc(source["heading"])}</text>',
            f'<line x1="52" y1="126" x2="{width - 52}" y2="126" stroke="{theme["border"]}"/>',
        ]
    )
    for group in cast(list[dict[str, object]], source.get("groups", [])):
        parts.extend(render_group(group, theme))
    for separator in cast(list[dict[str, object]], source.get("separators", [])):
        parts.append(render_separator(separator, theme))
    for node in cast(list[dict[str, object]], source["nodes"]):
        parts.extend(render_node(node, theme))
    for arrow in cast(list[dict[str, object]], source.get("arrows", [])):
        parts.extend(render_arrow(arrow, theme))
    footer = source.get("footer")
    if footer:
        parts.append(
            f'<text x="{width / 2}" y="{height - 24}" text-anchor="middle" class="body" '
            f'fill="{theme["muted"]}">{esc(footer)}</text>'
        )
    parts.append("</svg>")
    return "\n".join(parts) + "\n"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rasterize(svg_path: Path, png_path: Path) -> None:
    sips = shutil.which("sips")
    if sips:
        subprocess.run(
            [sips, "-s", "format", "png", str(svg_path), "--out", str(png_path)],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        return
    try:
        cairosvg = importlib.import_module("cairosvg")
    except ImportError as exc:
        raise RuntimeError("PNG rendering requires macOS sips or the optional cairosvg package") from exc
    cairosvg.svg2png(url=str(svg_path), write_to=str(png_path))


def load_sources() -> list[tuple[Path, dict[str, object]]]:
    sources: list[tuple[Path, dict[str, object]]] = []
    for path in sorted(SOURCE_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        required = {"id", "title", "description", "width", "height", "eyebrow", "heading", "nodes"}
        missing = sorted(required - data.keys())
        if missing:
            raise ValueError(f"{path.name}: missing {', '.join(missing)}")
        validate_id(data["id"])
        sources.append((path, data))
    if not sources:
        raise ValueError("No diagram sources found")
    return sources


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if generated SVGs differ")
    parser.add_argument("--png", action="store_true", help="also render stable PNGs and update their manifest")
    args = parser.parse_args()
    if args.check and args.png:
        parser.error("--check and --png cannot be combined")
    failures: list[str] = []
    rendered: dict[str, dict[str, str]] = {}
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source_path, source in load_sources():
        for theme in THEMES:
            output_path = output_path_for(source, theme)
            expected = render(source, theme)
            if args.check:
                if not output_path.exists() or output_path.read_text(encoding="utf-8") != expected:
                    failures.append(str(output_path.relative_to(ROOT)))
            else:
                output_path.write_text(expected, encoding="utf-8")
                print(output_path.relative_to(ROOT))
                if args.png:
                    png_path = output_path.with_suffix(".png")
                    rasterize(output_path, png_path)
                    rendered[str(output_path.relative_to(ROOT))] = {
                        "svg_sha256": digest(output_path),
                        "png": str(png_path.relative_to(ROOT)),
                        "png_sha256": digest(png_path),
                    }
    if args.png:
        MANIFEST.write_text(json.dumps(rendered, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(MANIFEST.relative_to(ROOT))
    if args.check:
        try:
            manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            failures.append(f"{MANIFEST.relative_to(ROOT)} ({exc})")
            manifest = {}
        for output in sorted(OUTPUT_DIR.glob("*.svg")):
            key = str(output.relative_to(ROOT))
            entry = manifest.get(key, {})
            png_value = entry.get("png")
            png_path = ROOT / png_value if isinstance(png_value, str) else Path()
            if entry.get("svg_sha256") != digest(output):
                failures.append(f"{key} (manifest mismatch)")
            if not png_path.is_file() or entry.get("png_sha256") != digest(png_path):
                failures.append(f"{key} (PNG missing or stale)")
    if failures:
        print("Generated diagrams are stale:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
