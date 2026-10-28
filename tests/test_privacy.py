from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from scripts.check_privacy import scan


class PrivacyTests(unittest.TestCase):
    def test_sensitive_identifiers_are_reported(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            private_ip = ".".join(("203", "0", "113", "42"))
            email = "owner" + "@" + "example.test"
            (root / "App.tsx").write_text(
                f"host={private_ip}\ncontact={email}\nprivate-codename\n",
                encoding="utf-8",
            )
            errors = scan(root, ["private-codename"])
        self.assertTrue(any("literal IP address" in error for error in errors))
        self.assertTrue(any("email address" in error for error in errors))
        self.assertTrue(any("configured private term" in error for error in errors))

    def test_public_prose_is_allowed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "guide.md").write_text(
                "Use inventory, narrow tools, and tested recovery.\n",
                encoding="utf-8",
            )
            self.assertEqual([], scan(root, []))

    def test_local_dev_addresses_and_css_pseudo_elements_are_allowed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            loopback = ".".join(("127", "0", "0", "1"))
            pseudo_element = ":" + ":before"
            (root / "playwright.config.ts").write_text(
                f"export const baseURL = 'http://{loopback}:4173'\n",
                encoding="utf-8",
            )
            (root / "styles.css").write_text(
                f".label{pseudo_element} {{ content: 'step'; }}\n",
                encoding="utf-8",
            )
            self.assertEqual([], scan(root, []))

    def test_compressed_ipv6_and_unquoted_secrets_are_reported(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            compressed_ipv6 = "fd00" + ":" + ":" + "1"
            secret_assignment = "password=" + "correcthorsebatterystaple"
            (root / "config.txt").write_text(
                f"host={compressed_ipv6}\n{secret_assignment}\n",
                encoding="utf-8",
            )
            errors = scan(root, [])
        self.assertTrue(any("literal IP address" in error for error in errors))
        self.assertTrue(any("assigned secret" in error for error in errors))

    def test_vendored_review_fixtures_relax_only_the_email_check(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            fixture = root / ".github/scripts/fixtures/codex_review/synthetic_review.json"
            fixture.parent.mkdir(parents=True)
            email = "1+example-owner" + "@" + "users.noreply.github.com"
            private_ip = ".".join(("203", "0", "113", "42"))
            fixture.write_text(
                f'{{"author_email": "{email}", "host": "{private_ip}", "note": "private-codename"}}\n',
                encoding="utf-8",
            )
            (root / "elsewhere.json").write_text(f'{{"author_email": "{email}"}}\n', encoding="utf-8")
            errors = scan(root, ["private-codename"])
        fixture_errors = [error for error in errors if error.startswith(".github/")]
        self.assertFalse(any("email address" in error for error in fixture_errors))
        self.assertTrue(any("literal IP address" in error for error in fixture_errors))
        self.assertTrue(any("configured private term" in error for error in fixture_errors))
        self.assertTrue(any(error.startswith("elsewhere.json") and "email address" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
