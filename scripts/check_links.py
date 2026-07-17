#!/usr/bin/env python3
"""Check repository-local Markdown and HTML image links."""

from __future__ import annotations

import argparse
import concurrent.futures
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRECTORIES = {".git", "dist", "node_modules", "playwright-report", "test-results"}
MARKDOWN_LINK = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
HTML_SRC = re.compile(r"\bsrc=\"([^\"]+)\"")
HTML_SRCSET = re.compile(r"\bsrcset=\"([^\"]+)\"")


def targets(text: str) -> list[str]:
    srcset_targets = [
        candidate.strip().split()[0]
        for srcset in HTML_SRCSET.findall(text)
        for candidate in srcset.split(",")
        if candidate.strip()
    ]
    return MARKDOWN_LINK.findall(text) + HTML_SRC.findall(text) + srcset_targets


def markdown_files(root: Path = ROOT) -> list[Path]:
    return [
        path
        for path in sorted(root.rglob("*.md"))
        if not any(part in SKIP_DIRECTORIES for part in path.parts)
    ]


def check(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    for markdown in markdown_files(root):
        for raw_target in targets(markdown.read_text(encoding="utf-8")):
            target = raw_target.split()[0]
            parsed = urlsplit(target)
            if parsed.scheme or target.startswith("#") or target.startswith("mailto:"):
                continue
            local = unquote(parsed.path)
            resolved = root / local.lstrip("/") if local.startswith("/") else markdown.parent / local
            if not resolved.exists():
                errors.append(f"{markdown.relative_to(root)}: missing {target}")
    return errors


def external_urls(root: Path = ROOT) -> list[str]:
    urls: set[str] = set()
    for markdown in markdown_files(root):
        for target in targets(markdown.read_text(encoding="utf-8")):
            parsed = urlsplit(target.split()[0])
            if parsed.scheme in {"http", "https"}:
                urls.add(parsed._replace(fragment="").geturl())
    return sorted(urls)


def check_external_url(url: str) -> str | None:
    request = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "homelab-blueprint-link-audit"},
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            if response.status >= 400:
                return f"{url}: HTTP {response.status}"
    except urllib.error.HTTPError as exc:
        if exc.code in {401, 403, 405, 429}:
            return None
        return f"{url}: HTTP {exc.code}"
    except (OSError, urllib.error.URLError) as exc:
        return f"{url}: {exc}"
    return None


def check_external(root: Path = ROOT) -> list[str]:
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = executor.map(check_external_url, external_urls(root))
    return sorted(result for result in results if result is not None)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--external", action="store_true", help="also check external citations")
    args = parser.parse_args()
    errors = check()
    if args.external:
        errors.extend(check_external())
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    scope = "local and external" if args.external else "repository-local"
    print(f"All {scope} links resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
