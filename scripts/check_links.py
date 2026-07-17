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
MARKDOWN_LINK = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
HTML_SOURCE = re.compile(r"(?:src|srcset)=\"([^\"]+)\"")


def targets(text: str) -> list[str]:
    return MARKDOWN_LINK.findall(text) + HTML_SOURCE.findall(text)


def check() -> list[str]:
    errors: list[str] = []
    for markdown in sorted(ROOT.rglob("*.md")):
        if ".git" in markdown.parts:
            continue
        for raw_target in targets(markdown.read_text(encoding="utf-8")):
            target = raw_target.split()[0]
            parsed = urlsplit(target)
            if parsed.scheme or target.startswith("#") or target.startswith("mailto:"):
                continue
            local = unquote(parsed.path)
            resolved = ROOT / local.lstrip("/") if local.startswith("/") else markdown.parent / local
            if not resolved.exists():
                errors.append(f"{markdown.relative_to(ROOT)}: missing {target}")
    return errors


def external_urls() -> list[str]:
    urls: set[str] = set()
    for markdown in sorted(ROOT.rglob("*.md")):
        if ".git" in markdown.parts:
            continue
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


def check_external() -> list[str]:
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = executor.map(check_external_url, external_urls())
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
