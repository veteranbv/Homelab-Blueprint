# Contributing

Contributions should help a reader make a better decision. Adding another tool
name without evidence or selection guidance does not meet that bar.

## Recommendation evidence

A new default or alternative needs:

1. an official homepage or documentation source;
2. a current project-health check, including archive status and recent human
   maintenance (the automated push-date threshold is only an early warning);
3. a clear use case and audience tier;
4. tradeoffs against the existing default; and
5. practitioner evidence that describes a real workflow, not promotion.

Do not remove a stable or feature-complete project solely because its commit
frequency is low. Do remove or reclassify projects when they are archived,
unsupported, misleadingly named, unsafe for the documented use, or superseded
by an official successor.

Update `last_reviewed` in `recommendations.toml` only after a human completes
the review.

## Writing

Write for someone standing next to you at the rack. Be concrete. Name the
default, explain why, and stop. Avoid marketing language, generic AI prose, and
enterprise ceremony that does not solve a home-scale problem.

Personal experience is welcome when it teaches a transferable lesson. Remove
names, usernames, domains, addresses, VLAN identifiers, MAC addresses, device
identities, physical locations, secret-manager paths, and recovery routes.
The automated privacy scan is defense in depth, not proof of anonymization.
Set `BLUEPRINT_PRIVATE_TERMS` to a comma-separated owner denylist in trusted
local or private CI environments; never commit that denylist.

## Plates

Every visual in this repository is one of five architect-style plates.
Sources live under `site/src/plates/`. Each plate is a React component that
reads a small typed model from `site/src/plates/models.ts`. The same source
renders in the interactive site and in the deterministic build that produces
the README images.

```bash
npm run render:plates          # write light and dark SVGs and PNGs
npm run render:plates:check    # verify the working tree matches the source
```

The renderer uses the already-installed Playwright Chromium to rasterize each
SVG. Output goes to `docs/images/plate-0N.svg`, `docs/images/plate-0N-dark.svg`,
and matching PNGs. A SHA-256 manifest at `docs/images/render-manifest.json`
makes CI reject stale pairs.

Plates must carry useful information: direction, trust, responsibility,
failure domains, decision paths, or evidence shapes. Decorative art is not a
substitute for technical information. No plate ever contains a real hostname,
address, personal name, or any value that would only be true of a specific
homelab. Where a concrete record teaches the shape of evidence, mark the whole
element `EXAMPLE RECORD, SYNTHETIC` and use placeholders or RFC documentation
ranges only. See [`docs/visual-replacement-ledger.md`](docs/visual-replacement-ledger.md)
for the full retirement history and the invariants the ledger enforces.

## Validation

```bash
npm run lint
npm run test
npm run test:e2e
npm run render:plates:check
python3 -m unittest discover -s tests
python3 scripts/audit_recommendations.py --offline
python3 scripts/check_links.py
python3 scripts/check_privacy.py
```

Run `python3 scripts/audit_recommendations.py` with network access before
requesting a recommendation change. Run `python3 scripts/check_links.py
--external` when adding or changing citations.
