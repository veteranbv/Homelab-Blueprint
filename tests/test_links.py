from __future__ import annotations

import unittest
import urllib.error
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from scripts.check_links import check, check_external_url, targets


class LinkTests(unittest.TestCase):
    def test_targets_include_markdown_and_picture_sources(self) -> None:
        text = (
            '[Guide](docs/guide.md)\n<img src="images/diagram.png" '
            'srcset="images/diagram.png 1x, images/diagram@2x.png 2x">\n'
        )
        self.assertEqual(
            ["docs/guide.md", "images/diagram.png", "images/diagram.png", "images/diagram@2x.png"],
            targets(text),
        )

    def test_bot_protection_counts_as_reachable(self) -> None:
        error = urllib.error.HTTPError("https://example.test", 403, "Forbidden", {}, None)
        with patch("urllib.request.urlopen", side_effect=error):
            self.assertIsNone(check_external_url("https://example.test"))

    def test_missing_external_page_is_reported(self) -> None:
        error = urllib.error.HTTPError("https://example.test", 404, "Not Found", {}, None)
        with patch("urllib.request.urlopen", side_effect=error):
            self.assertIn("HTTP 404", check_external_url("https://example.test") or "")

    def test_generated_and_dependency_trees_are_skipped(self) -> None:
        with TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "README.md").write_text("[guide](guide.md)\n", encoding="utf-8")
            (root / "guide.md").write_text("# Guide\n", encoding="utf-8")
            dependency = root / "node_modules" / "package"
            dependency.mkdir(parents=True)
            (dependency / "README.md").write_text("[missing](missing.md)\n", encoding="utf-8")

            self.assertEqual([], check(root))


if __name__ == "__main__":
    unittest.main()
