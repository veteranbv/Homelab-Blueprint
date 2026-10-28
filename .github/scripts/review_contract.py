# Vendored copy of the shared exact-version review evaluator. Do not
# edit here; change it at its source and re-vendor.
"""Exact-version Codex code+security review qualification.

One evaluator shared by the maintainer's review CLI and the required `review-gate`
Actions job, which loads this file by path from trusted base-branch code. It is
therefore standard-library only; `test_review_contract.py` enforces that.

A PR qualifies only when all of these hold for the live head:

* open, ready-for-review lifecycle, complete paginated evidence;
* a present, unedited request from the exact repository owner targeting the
  full head SHA (the generated marker's head, or the only commit a hand-typed
  request names; prose mentions never authorize another target), created
  after the last lifecycle reset (ready, reopen, force-push, base change), so
  an older generation cannot qualify a force-push back;
* code review: the bot's typed `codex-review-state:v1` summary reports
  `completed` on the full head with no unresolved findings, its table row
  agrees and completed after that request, and an unedited, immutable receipt
  of the same kind and commit arrived after the request;
* security review is advisory: it is never required or awaited, but unresolved
  findings it reports on the current head block;
* zero unresolved review threads from any author.

Reactions, request echoes, clean prose, response counts and the summary's
mutable edit time are never evidence. Unknown schema versions, statuses or
contradictory evidence block. Reasons are stable machine-readable codes.
"""

from __future__ import annotations

import json
import re
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Literal, TypedDict, cast

SCHEMA_VERSION = 1
BOT_LOGIN = "chatgpt-codex-connector[bot]"
Kind = Literal["code_review", "security_review"]
KINDS: tuple[Kind, ...] = ("code_review", "security_review")
# Code review is the hard gate. Security review is advisory (owner decision
# 2026-10-27): never required or awaited, but unresolved findings it reports on
# the current head block until addressed, like any other finding.
REQUIRED_KINDS: tuple[Kind, ...] = ("code_review",)

# Receipts are posted a second or two before the summary row records completion.
RECEIPT_SKEW = timedelta(seconds=120)

_SHA_RE = re.compile(r"\b[0-9a-f]{40}\b")
_REQUEST_RE = re.compile(r"\A\s*@codex[ \t]+(security[ \t]+)?review(?=\s|\Z)", re.IGNORECASE)
_REQUEST_MARKER_RE = re.compile(r"<!-- homelab-review-request:v1 (\{[^\n]*?\}) -->")
_SUMMARY_MARKER = "<!-- codex-pull-request-review-summary -->"
_STATE_RE = re.compile(r"<!-- codex-review-state:(v\d+) (\{[^\n]*?\}) -->")
_RECEIPT_MARKER = "<!-- codex-review-receipt:v1 -->"
_RECEIPT_ANY_VERSION_RE = re.compile(r"<!-- codex-review-receipt:(v\d+) -->")
_REVIEWED_COMMIT_RE = re.compile(r"\*\*Reviewed commit:\*\*\s*`([0-9a-f]{10,40})`")
_ROW_RE = re.compile(
    r"^\|[^|]*\*\*(Code Review|Security Review)\*\*\s*\|(?P<status>[^|]*)\|"
    r"\s*`(?P<sha>[0-9a-f]{7,40})`\s*\|",
    re.MULTILINE,
)
_ROW_TIME_RE = re.compile(r'<relative-time datetime="([^"]+)">')
_FAILURE_RE = re.compile(
    r"Codex Review: Something went wrong|usage limits have been reached", re.IGNORECASE
)
# Owner rule: no AI attribution anywhere, and only the owner's identity pushes.
_AI_TOOLS = r"(claude|anthropic|codex|openai|chatgpt|copilot|cursor|gemini)"
ATTRIBUTION_RE = re.compile(
    rf"^\s*(co-authored-by:.*{_AI_TOOLS}.*|.*generated (with|by) \[?{_AI_TOOLS}.*)$",
    re.IGNORECASE,
)
_BOT_EMAIL_RE = re.compile(r"\[bot\]@users\.noreply\.github\.com$", re.IGNORECASE)
ALLOWED_BOT_COMMITTERS = ("dependabot[bot]",)
_ROW_KIND: dict[str, Kind] = {"Code Review": "code_review", "Security Review": "security_review"}
_STATUSES = {"completed", "running"}
LIFECYCLE_EVENTS = {
    "ReadyForReviewEvent",
    "ReopenedEvent",
    "ConvertToDraftEvent",
    "HeadRefForcePushedEvent",
    "BaseRefChangedEvent",
    "BaseRefForcePushedEvent",
    "AutomaticBaseChangeSucceededEvent",
}


class Comment(TypedDict):
    id: int
    author: str  # REST form: bots carry the `[bot]` suffix
    author_type: str  # GraphQL __typename: User | Bot | ...
    created_at: str
    edited: bool
    body: str


class Review(Comment):
    state: str
    commit_sha: str


class CommitInfo(TypedDict):
    sha: str
    message: str
    author_email: str
    committer_email: str


class LifecycleEvent(TypedDict):
    type: str
    created_at: str


class Snapshot(TypedDict):
    """Normalized live PR evidence. `complete` is False if any page was missing."""

    repository: str
    owner: str
    owner_type: str
    number: int
    state: str
    draft: bool
    head_sha: str
    base_ref: str
    base_sha: str
    comments: list[Comment]
    reviews: list[Review]
    unresolved_threads: int
    lifecycle_events: list[LifecycleEvent]
    title: str
    body: str
    commits: list[CommitInfo]
    complete: bool
    incomplete_reasons: list[str]


@dataclass
class KindResult:
    state: str = "not_requested"
    commit_sha: str | None = None
    completed_at: str | None = None
    receipt_id: int | None = None
    reasons: list[str] = field(default_factory=list)

    def to_json(self) -> dict[str, object]:
        return {
            "state": self.state,
            "commit_sha": self.commit_sha,
            "completed_at": self.completed_at,
            "receipt_id": self.receipt_id,
            "reasons": self.reasons,
        }


@dataclass
class Verdict:
    qualified: bool
    head_sha: str
    base_sha: str
    epoch: str | None
    requests: dict[str, dict[str, object] | None]
    kinds: dict[str, KindResult]
    reasons: list[str]
    evidence_time: str | None

    def to_json(self) -> dict[str, object]:
        return {
            "schema_version": SCHEMA_VERSION,
            "qualified": self.qualified,
            "head_sha": self.head_sha,
            "base_sha": self.base_sha,
            "lifecycle_epoch": self.epoch,
            "requests": self.requests,
            "kinds": {kind: result.to_json() for kind, result in self.kinds.items()},
            "reasons": self.reasons,
            "evidence_time": self.evidence_time,
        }


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None


def format_time(value: datetime | None) -> str | None:
    return value.isoformat().replace("+00:00", "Z") if value else None


def request_body(head_sha: str, base_ref: str, base_sha: str) -> str:
    """The exact owner request the maintainer's review CLI posts.

    The first line is the bare `@codex review <head>` command, so repositories
    still on the retired polling gate (which matches only that line) recognize
    it during migration.
    """
    marker = json.dumps(
        {"head_sha": head_sha, "base_ref": base_ref, "base_sha": base_sha},
        sort_keys=True,
        separators=(",", ":"),
    )
    return (
        f"@codex review {head_sha}\n\nAgainst `{base_ref}` at `{base_sha}`.\n\n"
        f"<!-- homelab-review-request:v1 {marker} -->"
    )


def _request_kinds(body: str) -> tuple[Kind, ...]:
    match = _REQUEST_RE.match(body)
    if not match:
        return ()
    # Either command authorizes a generation for both kinds. Observed on this
    # account, `@codex security review` starts an ordinary code review; security
    # review runs only through the owner's "whenever code review runs" setting.
    # Each kind still needs its own typed completion and receipt.
    return KINDS


def _marker(body: str) -> dict[str, str] | None:
    """The generated request's structured head/base, or None when absent or malformed."""
    match = _REQUEST_MARKER_RE.search(body)
    if not match:
        return None
    try:
        marker = json.loads(match.group(1))
    except json.JSONDecodeError:
        return None
    if not isinstance(marker, dict):
        return None
    head, base = marker.get("head_sha"), marker.get("base_sha")
    if not all(isinstance(sha, str) and re.fullmatch(r"[0-9a-f]{40}", sha) for sha in (head, base)):
        return None
    return {"head_sha": cast(str, head), "base_sha": cast(str, base)}


def _request_head(body: str) -> str | None:
    """The one head a request targets, or None when it names none or several.

    A generated request names its head in the marker and may mention only that
    head and its base. A hand-typed request must name exactly one full commit,
    so prose mentioning the current head never authorizes a different target.
    """
    named = set(_SHA_RE.findall(body))
    if _REQUEST_MARKER_RE.search(body):
        marker = _marker(body)
        if marker is None or not named <= {marker["head_sha"], marker["base_sha"]}:
            return None
        return marker["head_sha"]
    return named.pop() if len(named) == 1 else None


def _request_base(body: str) -> str | None:
    marker = _marker(body)
    return marker["base_sha"] if marker else None


def _is_bot(comment: Comment) -> bool:
    return comment["author"] == BOT_LOGIN and comment["author_type"] == "Bot"


def _receipt_kind(body: str) -> Kind | None:
    """Kind of an immutable receipt, or None when not exactly one kind."""
    if _RECEIPT_MARKER not in body:
        return None
    security = "Codex Security Review" in body
    code = "### 💡 Codex Review" in body or re.search(r"^Codex Review:", body, re.M) is not None
    if security == code:
        return None
    return "security_review" if security else "code_review"


def _lifecycle_epoch(snapshot: Snapshot) -> datetime | None:
    times = [
        parse_time(event["created_at"])
        for event in snapshot["lifecycle_events"]
        if event["type"] in LIFECYCLE_EVENTS
    ]
    known = [time for time in times if time is not None]
    return max(known) if known else None


@dataclass
class _Summary:
    state: dict[str, object]
    rows: dict[Kind, tuple[str, str, datetime | None]]


def _parse_summary(snapshot: Snapshot, reasons: list[str]) -> _Summary | None:
    summaries = [
        c for c in snapshot["comments"] if _is_bot(c) and c["body"].startswith(_SUMMARY_MARKER)
    ]
    if not summaries:
        return None
    if len(summaries) > 1:
        reasons.append("summary_ambiguous")
        return None
    body = summaries[0]["body"]
    states = _STATE_RE.findall(body)
    if len(states) != 1:
        reasons.append("summary_state_missing" if not states else "summary_state_ambiguous")
        return None
    version, payload = states[0]
    if version != "v1":
        reasons.append("summary_state_unknown_version")
        return None
    try:
        state = json.loads(payload)
    except json.JSONDecodeError:
        reasons.append("summary_state_malformed")
        return None
    if not isinstance(state, dict):
        reasons.append("summary_state_malformed")
        return None
    rows: dict[Kind, tuple[str, str, datetime | None]] = {}
    for match in _ROW_RE.finditer(body):
        kind = _ROW_KIND[match.group(1)]
        if kind in rows:
            reasons.append("summary_rows_ambiguous")
            return None
        status_cell = match.group("status")
        times = _ROW_TIME_RE.findall(status_cell)
        status = "completed" if "**Completed**" in status_cell else "other"
        rows[kind] = (status, match.group("sha"), parse_time(times[0]) if len(times) == 1 else None)
    return _Summary(state=cast(dict[str, object], state), rows=rows)


def _latest_request(
    snapshot: Snapshot, kind: Kind, epoch: datetime | None
) -> tuple[Comment, datetime] | None:
    latest: tuple[Comment, datetime] | None = None
    for comment in snapshot["comments"]:
        if comment["author"] != snapshot["owner"] or comment["author_type"] != "User":
            continue
        if kind not in _request_kinds(comment["body"]):
            continue
        if _request_head(comment["body"]) != snapshot["head_sha"]:
            continue
        created = parse_time(comment["created_at"])
        if created is None or (epoch is not None and created <= epoch):
            continue
        if latest is None or created > latest[1]:
            latest = (comment, created)
    return latest


def _receipt(snapshot: Snapshot, kind: Kind, after: datetime, until: datetime) -> Comment | None:
    """Latest unedited bot receipt of exactly `kind` for the head in (after, until]."""
    head = snapshot["head_sha"]
    candidates: list[Comment] = []
    for comment in snapshot["comments"]:
        reviewed = _REVIEWED_COMMIT_RE.findall(comment["body"])
        if len(reviewed) == 1 and head.startswith(reviewed[0]):
            candidates.append(comment)
    for review in snapshot["reviews"]:
        if review["state"] != "DISMISSED" and review["commit_sha"] == head:
            candidates.append(review)
    matches: list[tuple[datetime, Comment]] = []
    for item in candidates:
        created = parse_time(item["created_at"])
        if (
            _is_bot(item)
            and not item["edited"]
            and not _FAILURE_RE.search(item["body"])
            and _receipt_kind(item["body"]) == kind
            and created is not None
            and after < created <= until
        ):
            matches.append((created, item))
    return max(matches, key=lambda match: match[0])[1] if matches else None


def _failures(snapshot: Snapshot, after: datetime) -> list[datetime]:
    """Bot failure replies (untyped: they apply to every kind) after `after`."""
    times = [
        parse_time(c["created_at"])
        for c in snapshot["comments"]
        if _is_bot(c) and _FAILURE_RE.search(c["body"])
    ]
    return sorted(t for t in times if t is not None and t > after)


def _evaluate_kind(
    snapshot: Snapshot,
    kind: Kind,
    epoch: datetime | None,
    summary: _Summary | None,
) -> tuple[KindResult, datetime | None]:
    result = KindResult()
    request = _latest_request(snapshot, kind, epoch)
    if request is None:
        result.reasons.append("request_missing")
        return result, None
    requested_at = request[1]
    result.state = "requested"
    if summary is None:
        result.reasons.append("summary_missing")
        return result, None
    entry = summary.state.get(kind)
    if not isinstance(entry, dict):
        result.state = "blocked"
        result.reasons.append("summary_kind_missing")
        return result, None
    status, sha = entry.get("status"), entry.get("commit_sha")
    unresolved = entry.get("has_unresolved_findings")
    if status not in _STATUSES or not isinstance(sha, str):
        result.state = "blocked"
        result.reasons.append("summary_kind_unknown")
        return result, None
    result.commit_sha = sha
    if sha != snapshot["head_sha"]:
        result.state = "stale"
        result.reasons.append("summary_other_commit")
        return result, None
    if status == "running":
        result.state = "running"
        return result, None
    row = summary.rows.get(kind)
    if row is None or row[0] != "completed" or not sha.startswith(row[1]) or row[2] is None:
        result.state = "blocked"
        result.reasons.append("summary_row_contradicts_state")
        return result, None
    completed_at = row[2]
    result.completed_at = format_time(completed_at)
    if completed_at <= requested_at:
        result.state = "stale"
        result.reasons.append("completed_before_request")
        return result, None
    if unresolved is not False:
        result.state = "findings"
        result.reasons.append("unresolved_findings")
        return result, None
    receipt = _receipt(snapshot, kind, requested_at, completed_at + RECEIPT_SKEW)
    if receipt is None:
        result.state = "blocked"
        result.reasons.append("receipt_missing")
        return result, None
    receipt_at = parse_time(receipt["created_at"])
    if any(
        receipt_at is None or failure >= receipt_at for failure in _failures(snapshot, requested_at)
    ):
        result.state = "error"
        result.reasons.append("review_error_reported")
        return result, None
    result.state = "completed"
    result.receipt_id = receipt["id"]
    # Freshness must cover the receipt that made this kind qualify, which can
    # follow the summary's completion time by up to RECEIPT_SKEW.
    return result, max(completed_at, receipt_at) if receipt_at else completed_at


def has_attribution(text: str) -> bool:
    return any(ATTRIBUTION_RE.match(line) for line in text.splitlines())


def _identity_violations(snapshot: Snapshot) -> list[str]:
    """AI attribution or app/bot authorship anywhere that can reach main."""
    reasons: list[str] = []
    if has_attribution(snapshot["title"]) or has_attribution(snapshot["body"]):
        reasons.append("ai_attribution_in_description")
    for commit in snapshot["commits"]:
        short = commit["sha"][:7]
        if has_attribution(commit["message"]):
            reasons.append(f"ai_attribution_in_commit:{short}")
        for email in (commit["author_email"], commit["committer_email"]):
            if _BOT_EMAIL_RE.search(email) and not any(
                allowed in email.lower() for allowed in ALLOWED_BOT_COMMITTERS
            ):
                reasons.append(f"non_owner_commit:{short}")
                break
    return reasons


def _head_findings(snapshot: Snapshot, summary: _Summary | None, kind: Kind) -> bool:
    """Whether the typed summary reports unresolved findings of `kind` on the head."""
    entry = summary.state.get(kind) if summary else None
    return (
        isinstance(entry, dict)
        and entry.get("commit_sha") == snapshot["head_sha"]
        and entry.get("has_unresolved_findings") is True
    )


def evaluate(snapshot: Snapshot) -> Verdict:
    reasons: list[str] = []
    if not snapshot["complete"]:
        reasons.append("evidence_incomplete")
    if snapshot["state"] != "OPEN":
        reasons.append("pull_request_not_open")
    if snapshot["draft"]:
        reasons.append("pull_request_draft")
    if snapshot["owner_type"] != "User":
        reasons.append("owner_not_user")
    if snapshot["unresolved_threads"]:
        reasons.append("unresolved_threads")
    reasons.extend(_identity_violations(snapshot))
    epoch = _lifecycle_epoch(snapshot)
    for comment in snapshot["comments"]:
        # An edited current-generation request makes its authorization ambiguous.
        created = parse_time(comment["created_at"])
        if (
            comment["edited"]
            and (epoch is None or (created is not None and created > epoch))
            and comment["author"] == snapshot["owner"]
            and _request_kinds(comment["body"])
            and snapshot["head_sha"] in _SHA_RE.findall(comment["body"])  # any claim on this head
        ):
            reasons.append("request_edited")
            break
    if any(
        _RECEIPT_ANY_VERSION_RE.search(c["body"]) and _RECEIPT_MARKER not in c["body"]
        for c in [*snapshot["comments"], *snapshot["reviews"]]
        if _is_bot(c)
    ):
        reasons.append("receipt_unknown_version")

    summary = _parse_summary(snapshot, reasons)
    kinds: dict[str, KindResult] = {}
    completions: list[datetime] = []
    required_complete = True
    for kind in KINDS:
        result, completed = _evaluate_kind(snapshot, kind, epoch, summary)
        kinds[kind] = result
        if kind in REQUIRED_KINDS:
            if completed is None:
                required_complete = False
                reasons.extend(f"{kind}:{reason}" for reason in result.reasons or [result.state])
            else:
                completions.append(completed)
        elif result.state == "findings" or _head_findings(snapshot, summary, kind):
            # Advisory kinds never gate on completion, but findings they report
            # for this head block even when a newer request superseded them.
            reasons.append(f"{kind}:unresolved_findings")
        elif completed is not None:
            completions.append(completed)  # the gate must also be newer than these

    requests: dict[str, dict[str, object] | None] = {}
    for kind in KINDS:
        latest = _latest_request(snapshot, kind, epoch)
        requests[kind] = (
            {
                "id": latest[0]["id"],
                "created_at": latest[0]["created_at"],
                "base_sha": _request_base(latest[0]["body"]),
            }
            if latest
            else None
        )
    unique = list(dict.fromkeys(reasons))
    return Verdict(
        qualified=not unique,
        head_sha=snapshot["head_sha"],
        base_sha=snapshot["base_sha"],
        epoch=format_time(epoch),
        requests=requests,
        kinds=kinds,
        reasons=unique,
        evidence_time=format_time(max(completions)) if required_complete and completions else None,
    )


# --------------------------------------------------------------------------
# Live collection through an injected `gh`-style JSON runner.

GhRunner = Callable[[list[str]], object]

_CONNECTIONS: dict[str, tuple[str, str]] = {
    "comments": (
        "",
        "databaseId createdAt lastEditedAt body author { __typename login }",
    ),
    "reviews": (
        "",
        "databaseId state submittedAt lastEditedAt body commit { oid } author { __typename login }",
    ),
    "reviewThreads": ("", "isResolved"),
    "commits": ("", "commit { oid message author { email } committer { email } }"),
    "timelineItems": (
        ", itemTypes: [READY_FOR_REVIEW_EVENT, REOPENED_EVENT, CONVERT_TO_DRAFT_EVENT, "
        "HEAD_REF_FORCE_PUSHED_EVENT, BASE_REF_CHANGED_EVENT, BASE_REF_FORCE_PUSHED_EVENT, "
        "AUTOMATIC_BASE_CHANGE_SUCCEEDED_EVENT]",
        "__typename "
        + " ".join(f"... on {name} {{ createdAt }}" for name in sorted(LIFECYCLE_EVENTS)),
    ),
}


def _connection(key: str, *, after: bool) -> str:
    args, nodes = _CONNECTIONS[key]
    cursor = ", after: $after" if after else ""
    return (
        f"{key}(first: 100{cursor}{args}) "
        f"{{ pageInfo {{ hasNextPage endCursor }} nodes {{ {nodes} }} }}"
    )


_PR_FIELDS = "state isDraft headRefOid baseRefName baseRefOid"
_FIRST_QUERY = (
    "query($owner: String!, $repo: String!, $pr: Int!) { repository(owner: $owner, "
    "name: $repo) { owner { __typename login } pullRequest(number: $pr) { "
    f"{_PR_FIELDS} title body "
    + " ".join(_connection(key, after=False) for key in _CONNECTIONS)
    + " } } }"
)


def _page_query(key: str) -> str:
    return (
        "query($owner: String!, $repo: String!, $pr: Int!, $after: String!) { "
        "repository(owner: $owner, name: $repo) { pullRequest(number: $pr) { "
        f"{_PR_FIELDS} {_connection(key, after=True)} }} }} }}"
    )


class EvidenceError(Exception):
    """Live evidence could not be collected consistently."""


JsonDict = dict[str, object]


def _obj(value: object) -> JsonDict:
    return cast(JsonDict, value) if isinstance(value, dict) else {}


def _nodes(connection: object, key: str, incomplete: list[str]) -> list[JsonDict]:
    """Connection nodes; anything missing, null or malformed marks evidence incomplete."""
    if not isinstance(connection, dict):
        incomplete.append(f"{key}_missing")
        return []
    nodes = connection.get("nodes")
    if not isinstance(nodes, list) or not isinstance(connection.get("pageInfo"), dict):
        incomplete.append(f"{key}_malformed")
        return []
    if any(not isinstance(node, dict) for node in nodes):
        incomplete.append(f"{key}_null_node")
    return [cast(JsonDict, node) for node in nodes if isinstance(node, dict)]


def _graphql(gh: GhRunner, repo: str, number: int, query: str, after: str | None) -> JsonDict:
    owner, _, name = repo.partition("/")
    args = ["api", "graphql", "-f", f"query={query}", "-F", f"owner={owner}"]
    args += ["-F", f"repo={name}", "-F", f"pr={number}"]
    if after is not None:
        args += ["-f", f"after={after}"]
    repository = _obj(_obj(_obj(gh(args)).get("data")).get("repository"))
    if not _obj(repository.get("pullRequest")):
        raise EvidenceError(f"PR #{number} not found in {repo}")
    return repository


def _identity(pull: JsonDict) -> tuple[object, ...]:
    return tuple(pull.get(key) for key in _PR_FIELDS.split())


def _comment(node: JsonDict) -> Comment:
    author = _obj(node.get("author"))
    login = str(author.get("login") or "")
    author_type = str(author.get("__typename") or "")
    identifier = node.get("databaseId")
    return Comment(
        id=identifier if isinstance(identifier, int) else 0,
        author=f"{login}[bot]" if author_type == "Bot" else login,
        author_type=author_type,
        created_at=str(node.get("createdAt") or node.get("submittedAt") or ""),
        edited=node.get("lastEditedAt") is not None,
        body=str(node.get("body") or ""),
    )


def collect(gh: GhRunner, repo: str, number: int) -> Snapshot:
    """Read all evidence, fail closed on head/base/lifecycle movement mid-read."""
    repository = _graphql(gh, repo, number, _FIRST_QUERY, None)
    pull = _obj(repository.get("pullRequest"))
    identity = _identity(pull)
    incomplete: list[str] = []
    nodes: dict[str, list[JsonDict]] = {}
    if pull.get("state") not in {"OPEN", "CLOSED", "MERGED"} or not isinstance(
        pull.get("isDraft"), bool
    ):
        incomplete.append("pull_request_state_malformed")
    for key in _CONNECTIONS:
        connection = pull.get(key)
        collected = _nodes(connection, key, incomplete)
        page = _obj(_obj(connection).get("pageInfo"))
        while page.get("hasNextPage"):
            cursor = page.get("endCursor")
            if not isinstance(cursor, str) or not cursor:
                incomplete.append(f"{key}_cursor_missing")
                break
            later = _obj(_graphql(gh, repo, number, _page_query(key), cursor).get("pullRequest"))
            if _identity(later) != identity:
                raise EvidenceError(f"PR #{number} changed while reading {key}")
            more = later.get(key)
            collected += _nodes(more, key, incomplete)
            page = _obj(_obj(more).get("pageInfo"))
        nodes[key] = collected
    owner = _obj(repository.get("owner"))
    reviews = [
        Review(
            **_comment(node),
            state=str(node.get("state") or ""),
            commit_sha=str(_obj(node.get("commit")).get("oid") or ""),
        )
        for node in nodes["reviews"]
    ]
    return Snapshot(
        repository=repo,
        owner=str(owner.get("login") or ""),
        owner_type=str(owner.get("__typename") or ""),
        number=number,
        state=str(pull.get("state") or ""),
        draft=pull.get("isDraft") is True,
        head_sha=str(pull.get("headRefOid") or ""),
        base_ref=str(pull.get("baseRefName") or ""),
        base_sha=str(pull.get("baseRefOid") or ""),
        comments=[_comment(node) for node in nodes["comments"]],
        reviews=reviews,
        unresolved_threads=sum(
            1 for n in nodes["reviewThreads"] if n.get("isResolved") is not True
        ),
        title=str(pull.get("title") or ""),
        body=str(pull.get("body") or ""),
        commits=[
            CommitInfo(
                sha=str(_obj(n.get("commit")).get("oid") or ""),
                message=str(_obj(n.get("commit")).get("message") or ""),
                author_email=str(_obj(_obj(n.get("commit")).get("author")).get("email") or ""),
                committer_email=str(
                    _obj(_obj(n.get("commit")).get("committer")).get("email") or ""
                ),
            )
            for n in nodes["commits"]
        ],
        lifecycle_events=[
            LifecycleEvent(type=str(n.get("__typename")), created_at=str(n.get("createdAt") or ""))
            for n in nodes["timelineItems"]
        ],
        complete=not incomplete,
        incomplete_reasons=incomplete,
    )


def summarize(verdict: Verdict) -> Iterable[str]:
    """Markdown lines for a job summary."""
    state = "qualified" if verdict.qualified else "blocked"
    yield f"## Review qualification: **{state}**"
    yield ""
    yield f"Head `{verdict.head_sha}`; lifecycle epoch `{verdict.epoch or 'none'}`."
    yield ""
    yield "| Review | State | Commit | Completed | Receipt |"
    yield "| --- | --- | --- | --- | --- |"
    for kind, result in verdict.kinds.items():
        yield (
            f"| {kind} | {result.state} | `{(result.commit_sha or '-')[:12]}` | "
            f"{result.completed_at or '-'} | {result.receipt_id or '-'} |"
        )
    if verdict.reasons:
        yield ""
        yield "Blocking reasons: " + ", ".join(f"`{reason}`" for reason in verdict.reasons)
