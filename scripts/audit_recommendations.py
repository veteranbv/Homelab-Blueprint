#!/usr/bin/env python3
"""Validate recommendation metadata and optionally check live project health."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import tomllib
import urllib.error
import urllib.request
from pathlib import Path
from typing import TypedDict, cast


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "recommendations.toml"
CLASSIFICATIONS = {"default", "alternative", "specialist"}
TIERS = {"starter", "intermediate", "advanced"}


class Project(TypedDict, total=False):
    id: str
    name: str
    category: str
    homepage: str
    github: str
    classification: str
    tier: str
    last_reviewed: dt.date
    activity_exempt: bool


def load_registry(path: Path = REGISTRY) -> list[Project]:
    with path.open("rb") as handle:
        data = tomllib.load(handle)
    if data.get("schema_version") != 1:
        raise ValueError("schema_version must be 1")
    projects = data.get("project")
    if not isinstance(projects, list) or not projects:
        raise ValueError("registry must contain at least one [[project]]")
    return cast(list[Project], projects)


def validate(projects: list[Project], today: dt.date, max_age_days: int) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    required = {"id", "name", "category", "homepage", "classification", "tier", "last_reviewed"}
    for index, project in enumerate(projects, start=1):
        missing = sorted(required - project.keys())
        label = project.get("id", f"entry-{index}")
        if missing:
            errors.append(f"{label}: missing {', '.join(missing)}")
            continue
        project_id = project["id"]
        if project_id in seen:
            errors.append(f"{project_id}: duplicate id")
        seen.add(project_id)
        if project["classification"] not in CLASSIFICATIONS:
            errors.append(f"{project_id}: invalid classification")
        if project["tier"] not in TIERS:
            errors.append(f"{project_id}: invalid tier")
        if not str(project["homepage"]).startswith("https://"):
            errors.append(f"{project_id}: homepage must use https")
        reviewed = project["last_reviewed"]
        if not isinstance(reviewed, dt.date):
            errors.append(f"{project_id}: last_reviewed must be a TOML date")
        elif reviewed > today:
            errors.append(f"{project_id}: last_reviewed is in the future")
        elif (today - reviewed).days > max_age_days:
            errors.append(f"{project_id}: review is {(today - reviewed).days} days old")
        github = project.get("github")
        if github and (github.count("/") != 1 or github.startswith("http")):
            errors.append(f"{project_id}: github must be owner/repository")
    return errors


def request_json(url: str) -> dict[str, object]:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "homelab-blueprint-audit"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=15) as response:
        return cast(dict[str, object], json.load(response))


def check_url(url: str) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "homelab-blueprint-audit"})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status >= 400:
                raise ValueError(f"HTTP {response.status}")
    except urllib.error.HTTPError as exc:
        # Authentication and bot-protection responses still prove that the
        # configured host exists. Other client/server errors remain failures.
        if exc.code not in {401, 403}:
            raise


def audit_live(projects: list[Project], today: dt.date, max_activity_age_days: int) -> list[str]:
    errors: list[str] = []
    for project in projects:
        project_id = project["id"]
        try:
            check_url(project["homepage"])
        except (OSError, ValueError, urllib.error.URLError) as exc:
            errors.append(f"{project_id}: homepage check failed: {exc}")
        github = project.get("github")
        if not github:
            continue
        try:
            metadata = request_json(f"https://api.github.com/repos/{github}")
        except (OSError, ValueError, urllib.error.URLError) as exc:
            errors.append(f"{project_id}: GitHub check failed: {exc}")
            continue
        if metadata.get("archived") is True:
            errors.append(f"{project_id}: GitHub repository is archived")
        if metadata.get("disabled") is True:
            errors.append(f"{project_id}: GitHub repository is disabled")
        pushed_at = metadata.get("pushed_at")
        if not project.get("activity_exempt"):
            if not isinstance(pushed_at, str):
                errors.append(f"{project_id}: GitHub activity date is unavailable")
            else:
                pushed_on = dt.datetime.fromisoformat(pushed_at.replace("Z", "+00:00")).date()
                age = (today - pushed_on).days
                if age > max_activity_age_days:
                    errors.append(f"{project_id}: last GitHub push is {age} days old")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true", help="validate metadata without network calls")
    parser.add_argument("--max-age-days", type=int, default=120)
    parser.add_argument("--max-activity-age-days", type=int, default=365)
    args = parser.parse_args()
    today = dt.date.today()
    try:
        projects = load_registry()
        errors = validate(projects, today, args.max_age_days)
        if not args.offline:
            errors.extend(audit_live(projects, today, args.max_activity_age_days))
    except (OSError, ValueError, tomllib.TOMLDecodeError) as exc:
        print(f"registry error: {exc}", file=sys.stderr)
        return 1
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    mode = "metadata" if args.offline else "metadata and live health"
    print(f"Validated {len(projects)} recommendations ({mode}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
