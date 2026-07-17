from __future__ import annotations

import unittest
import urllib.error
from unittest.mock import patch

from scripts.check_links import check_external_url, targets


class LinkTests(unittest.TestCase):
    def test_targets_include_markdown_and_picture_sources(self) -> None:
        text = '[Guide](docs/guide.md)\n<img src="images/diagram.png">\n'
        self.assertEqual(["docs/guide.md", "images/diagram.png"], targets(text))

    def test_bot_protection_counts_as_reachable(self) -> None:
        error = urllib.error.HTTPError("https://example.test", 403, "Forbidden", {}, None)
        with patch("urllib.request.urlopen", side_effect=error):
            self.assertIsNone(check_external_url("https://example.test"))

    def test_missing_external_page_is_reported(self) -> None:
        error = urllib.error.HTTPError("https://example.test", 404, "Not Found", {}, None)
        with patch("urllib.request.urlopen", side_effect=error):
            self.assertIn("HTTP 404", check_external_url("https://example.test") or "")


if __name__ == "__main__":
    unittest.main()
