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

## Diagrams

Diagram sources live in `diagrams/`; generated light and dark SVGs live in
`docs/images/`.

```bash
python3 scripts/render_diagrams.py
python3 scripts/render_diagrams.py --png
python3 scripts/render_diagrams.py --check
```

The README uses PNGs so typography is stable across GitHub renderers; the SVGs
remain the accessible vector artifacts. PNG rendering uses macOS `sips` or the
optional `cairosvg` package. A hash manifest makes CI reject stale pairs.

Diagrams must show useful relationships: direction, trust, responsibility,
failure domains, or a decision path. Decorative generated art is not a
substitute for technical information.

## Validation

```bash
python3 -m unittest discover -s tests
python3 scripts/render_diagrams.py --check
python3 scripts/audit_recommendations.py --offline
python3 scripts/check_links.py
python3 scripts/check_privacy.py
```

Run `python3 scripts/audit_recommendations.py` with network access before
requesting a recommendation change. Run `python3 scripts/check_links.py
--external` when adding or changing citations.
