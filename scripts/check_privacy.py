#!/usr/bin/env python3
"""Reject common private-infrastructure identifiers in public content."""

from __future__ import annotations

import ipaddress
import os
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {".md", ".toml", ".json", ".svg", ".yml", ".yaml", ".py", ".sh", ".txt"}
SKIP_DIRECTORIES = {"node_modules", "dist", "playwright-report", "test-results", "__pycache__", ".git"}
PATTERNS = {
    "local user path": re.compile(r"/Users/[A-Za-z0-9._-]+/"),
    "1Password reference": re.compile(r"op://"),
    "MAC address": re.compile(r"\b(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}\b"),
    "private 10/8 address": re.compile(r"\b10(?:\.\d{1,3}){3}\b"),
    "private 172.16/12 address": re.compile(r"\b172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}\b"),
    "private 192.168/16 address": re.compile(r"\b192\.168(?:\.\d{1,3}){2}\b"),
    "email address": re.compile(r"(?<!/)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE),
    "local hostname": re.compile(r"\b[A-Za-z0-9][A-Za-z0-9.-]*\.(?:local|lan|home\.arpa)\b", re.IGNORECASE),
    "VLAN identifier": re.compile(r"\bVLAN\s*[-:#]?\s*\d{1,4}\b", re.IGNORECASE),
    "assigned secret": re.compile(
        r"\b(?:password|passwd|token|api[_-]?key|secret)\s*[:=]\s*"
        r"(?:[\"'][A-Za-z0-9_./+=-]{12,}[\"']|(?:gh[pousr]_|sk-|xox[baprs]-)[A-Za-z0-9_-]{8,}"
        r"|[A-Za-z0-9_+=/-]{16,})",
        re.IGNORECASE,
    ),
}
IPV4 = re.compile(r"(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])")
IPV6 = re.compile(r"(?<![0-9A-Fa-f:])(?=[0-9A-Fa-f:]*:)[0-9A-Fa-f:]{2,}(?![0-9A-Fa-f:])")
SKIP_FILES = {Path(__file__).resolve()}


def configured_terms() -> list[str]:
    raw = os.environ.get("BLUEPRINT_PRIVATE_TERMS", "")
    return [term.strip() for term in raw.split(",") if len(term.strip()) >= 4]


def scan(root: Path = ROOT, private_terms: list[str] | None = None) -> list[str]:
    errors: list[str] = []
    terms = configured_terms() if private_terms is None else private_terms
    for path in sorted(root.rglob("*")):
        if (
            not path.is_file()
            or path.suffix not in TEXT_SUFFIXES
            or any(part in SKIP_DIRECTORIES for part in path.parts)
            or path.resolve() in SKIP_FILES
        ):
            continue
        text = path.read_text(encoding="utf-8")
        for label, pattern in PATTERNS.items():
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                errors.append(f"{path.relative_to(root)}:{line}: {label}")
        for pattern in (IPV4, IPV6):
            for match in pattern.finditer(text):
                try:
                    ipaddress.ip_address(match.group())
                except ValueError:
                    continue
                line = text.count("\n", 0, match.start()) + 1
                errors.append(f"{path.relative_to(root)}:{line}: literal IP address")
        lowered = text.casefold()
        for term in terms:
            index = lowered.find(term.casefold())
            if index >= 0:
                line = text.count("\n", 0, index) + 1
                errors.append(f"{path.relative_to(root)}:{line}: configured private term")
    return errors


def main() -> int:
    errors = scan()
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print("No configured private-infrastructure patterns found (defense-in-depth scan).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
