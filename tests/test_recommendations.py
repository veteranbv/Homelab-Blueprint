from __future__ import annotations

import datetime as dt
import io
import unittest
import urllib.error
from contextlib import redirect_stderr
from unittest.mock import patch

from scripts.audit_recommendations import audit_live, check_url, load_registry, main, validate


class RecommendationTests(unittest.TestCase):
    def test_registry_is_valid_at_review_date(self) -> None:
        errors = validate(load_registry(), dt.date(2026, 7, 16), 120)
        self.assertEqual([], errors)

    def test_duplicate_ids_are_rejected(self) -> None:
        project = load_registry()[0]
        errors = validate([project, project], dt.date(2026, 7, 16), 120)
        self.assertTrue(any("duplicate id" in error for error in errors))

    def test_stale_review_is_rejected(self) -> None:
        project = dict(load_registry()[0])
        project["last_reviewed"] = dt.date(2025, 1, 1)
        errors = validate([project], dt.date(2026, 7, 16), 120)
        self.assertTrue(any("days old" in error for error in errors))

    def test_bot_protection_still_counts_as_reachable(self) -> None:
        error = urllib.error.HTTPError("https://example.test", 403, "Forbidden", {}, None)
        with patch("urllib.request.urlopen", side_effect=error):
            check_url("https://example.test")

    def test_missing_homepage_is_rejected(self) -> None:
        error = urllib.error.HTTPError("https://example.test", 404, "Not Found", {}, None)
        with patch("urllib.request.urlopen", side_effect=error):
            with self.assertRaises(urllib.error.HTTPError):
                check_url("https://example.test")

    @patch("scripts.audit_recommendations.check_url")
    @patch("scripts.audit_recommendations.request_json")
    def test_stale_repository_activity_is_rejected(self, request_json, _check_url) -> None:
        project = dict(load_registry()[0])
        request_json.return_value = {
            "archived": False,
            "disabled": False,
            "pushed_at": "2024-01-01T00:00:00Z",
        }
        errors = audit_live([project], dt.date(2026, 7, 16), 365)
        self.assertTrue(any("last GitHub push" in error for error in errors))

    @patch("scripts.audit_recommendations.audit_live")
    @patch("scripts.audit_recommendations.load_registry")
    def test_metadata_errors_skip_live_audit(self, load_registry_mock, audit_live_mock) -> None:
        load_registry_mock.return_value = [{"name": "Incomplete"}]
        with patch("sys.argv", ["audit_recommendations.py"]):
            with redirect_stderr(io.StringIO()):
                self.assertEqual(1, main())
        audit_live_mock.assert_not_called()


if __name__ == "__main__":
    unittest.main()
