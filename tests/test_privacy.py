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
            (root / "guide.md").write_text(
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


if __name__ == "__main__":
    unittest.main()
