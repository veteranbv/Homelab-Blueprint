"""Short exact-version review verdict for the required `review-gate` check.

Runs from a checkout of the PR's BASE commit, never PR content, and reads only
live GitHub metadata with a read-only token. It never waits for a model: the
verdict is computed once from current evidence and the job ends. Late review
events are reconciled by re-running this job in place (the maintainer's `pr recheck`).

Standard-library only, executed with `python3 -I` beside the trusted
`review_contract.py`.
"""

from __future__ import annotations

import importlib.util
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from types import ModuleType

# Vendored; the contract sits beside this script.
CONTRACT = Path(__file__).with_name("review_contract.py")
ATTEMPTS = 3


def _load_contract() -> ModuleType:
    spec = importlib.util.spec_from_file_location("review_contract", CONTRACT)
    if spec is None or spec.loader is None:
        raise SystemExit(f"::error::Trusted evaluator missing at {CONTRACT}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module  # dataclasses resolve annotations via sys.modules
    spec.loader.exec_module(module)
    return module


def gh(args: list[str]) -> object:
    """`gh` JSON call with a short, bounded retry for transient API failures."""
    for attempt in range(1, ATTEMPTS + 1):
        result = subprocess.run(["gh", *args], capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            return json.loads(result.stdout)
        if attempt == ATTEMPTS:
            raise RuntimeError(f"gh {args[:2]} failed: {result.stderr.strip()[:500]}")
        time.sleep(5 * attempt)
    raise AssertionError("unreachable")


def main() -> int:
    contract = _load_contract()
    repo = os.environ["GITHUB_REPOSITORY"]
    number = int(os.environ["PR_NUMBER"])
    event_head = os.environ["PR_HEAD_SHA"]
    try:
        snapshot = contract.collect(gh, repo, number)
    except (contract.EvidenceError, RuntimeError, ValueError) as exc:
        print(f"::error::Review evidence unavailable: {exc}")
        return 1
    if snapshot["head_sha"] != event_head:
        print(f"::error::Superseded: PR head is {snapshot['head_sha']}, run is for {event_head}")
        return 1
    verdict = contract.evaluate(snapshot)
    print(json.dumps(verdict.to_json(), indent=2, sort_keys=True))
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write("\n".join(contract.summarize(verdict)) + "\n")
    if not verdict.qualified:
        print("::error::Not qualified: " + ", ".join(verdict.reasons))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
