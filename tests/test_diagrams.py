from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path

from scripts.render_diagrams import ROOT, THEMES, load_sources, output_path_for, render


class DiagramTests(unittest.TestCase):
    def test_all_sources_render_both_themes(self) -> None:
        for path, source in load_sources():
            with self.subTest(source=path.name):
                light = render(source, "light")
                dark = render(source, "dark")
                self.assertIn('role="img"', light)
                self.assertIn("<title", light)
                self.assertIn("<desc", light)
                self.assertNotEqual(light, dark)
                for node in source["nodes"]:
                    self.assertIn(str(node["title"]), light)
                    self.assertIn(str(node["title"]), dark)

    def test_sources_have_unique_ids(self) -> None:
        ids = [source["id"] for _, source in load_sources()]
        self.assertEqual(len(ids), len(set(ids)))

    def test_sources_are_valid_json(self) -> None:
        for path in (ROOT / "diagrams").glob("*.json"):
            with self.subTest(source=path.name):
                json.loads(path.read_text(encoding="utf-8"))

    def test_theme_contract_is_complete(self) -> None:
        self.assertEqual(THEMES["light"].keys(), THEMES["dark"].keys())

    def test_nodes_and_text_baselines_stay_inside_canvas(self) -> None:
        for path, source in load_sources():
            for node in source["nodes"]:
                with self.subTest(source=path.name, node=node["id"]):
                    self.assertGreaterEqual(node["x"], 0)
                    self.assertGreaterEqual(node["y"], 130)
                    self.assertLessEqual(node["x"] + node["width"], source["width"])
                    self.assertLessEqual(node["y"] + node["height"], source["height"])
                    lines = node.get("lines", [])
                    if lines:
                        first_line = 55 if node.get("style") == "section" else 76
                        line_height = 30 if node.get("style") == "section" else 28
                        final_baseline = node["y"] + first_line + (len(lines) - 1) * line_height
                        self.assertLessEqual(final_baseline, node["y"] + node["height"] - 12)

    def test_diagram_id_rejects_path_traversal(self) -> None:
        source = dict(load_sources()[0][1])
        source["id"] = "../outside"
        with self.assertRaises(ValueError):
            output_path_for(source, "light")

    def test_diagram_id_rejects_svg_injection(self) -> None:
        source = dict(load_sources()[0][1])
        source["id"] = 'diagram\" onload=\"alert-1'
        with self.assertRaises(ValueError):
            render(source, "light")

    def test_arrow_coordinates_reject_svg_injection(self) -> None:
        source = dict(load_sources()[0][1])
        source["arrows"] = [{"points": [['0" onload="alert-1', 0], [10, 10]]}]
        with self.assertRaises(ValueError):
            render(source, "light")

    def test_arrow_label_coordinates_reject_svg_injection(self) -> None:
        source = dict(load_sources()[0][1])
        source["arrows"] = [
            {
                "points": [[0, 0], [10, 10]],
                "label": "unsafe",
                "label_at": ['0" onload="alert-1', 0],
            }
        ]
        with self.assertRaises(ValueError):
            render(source, "light")

    def test_check_reports_missing_svg_without_traceback(self) -> None:
        source = load_sources()[0][1]
        output = output_path_for(source, "light")
        original = output.read_bytes()
        output.unlink()
        try:
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts" / "render_diagrams.py"), "--check"],
                capture_output=True,
                text=True,
                check=False,
            )
        finally:
            output.write_bytes(original)
        self.assertNotEqual(0, result.returncode)
        self.assertIn(str(output.relative_to(ROOT)), result.stderr)
        self.assertNotIn("Traceback", result.stderr)

    def test_check_rejects_artifact_without_source(self) -> None:
        orphan = ROOT / "docs" / "images" / "orphan-test.svg"
        orphan.write_text("<svg/>\n", encoding="utf-8")
        try:
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts" / "render_diagrams.py"), "--check"],
                capture_output=True,
                text=True,
                check=False,
            )
        finally:
            orphan.unlink()
        self.assertNotEqual(0, result.returncode)
        self.assertIn("no diagram source", result.stderr)


if __name__ == "__main__":
    unittest.main()
