# Project instructions

Contribution, writing and plate standards are in
[CONTRIBUTING.md](CONTRIBUTING.md); run its validation commands before every
pull request.

## Pull requests and review

Finish and test a coherent change locally, then run a local code and security
review before asking for remote review. The owner requests Codex review for
the exact pushed head. Address every finding on the same pull request and
resolve its thread; after three rounds that still find substantive issues,
stop and reconsider the change. Required checks on `master` are `validate`
and `review-gate`; `review-gate` runs only base-branch code with a read-only
token. Pull requests from forks run on GitHub-hosted runners with no secrets,
and first-time contributors' runs wait for owner approval. Deployment runs only
from `master`. No AI attribution in commits, titles, or descriptions, and
commits come from a person's identity, not an app or bot account (Dependabot
excepted); `review-gate` rejects both.

### Review guidelines

Reviewers (Codex, Claude Code, humans) apply these to every pull request.

- Failure here means: private identifiers (names, hostnames, addresses,
  device identities, secret-manager paths, recovery routes) in committed
  content or plates; recommendations without the evidence CONTRIBUTING.md
  requires, or `last_reviewed` changed without a human review; committed
  plates drifting from their source or render manifest; workflows that run
  pull request code with secrets, write tokens or `pull_request_target`, or
  deploy from anything but `master`; unpinned actions. Prioritize these.
- Report only issues the change introduces or makes worse; mark pre-existing
  problems as pre-existing.
- Every finding needs file:line evidence and a concrete failure scenario.
- At most three nitpicks per review; skip what ESLint and TypeScript enforce.
- Skip `package-lock.json` and generated plate images beyond their manifest
  check. Always check fixtures and examples for real identities or
  credentials.
- Start the summary with the number of findings; say plainly when nothing
  needs fixing.
