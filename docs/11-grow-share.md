# Grow, experiment, and share responsibly

Expansion should buy a capability: more memory, a new failure domain, faster
recovery, quieter operation, lower power, or a specific learning environment.

## Before adding a node

Ask:

- Which workload cannot fit or isolate cleanly today?
- Does another node improve availability, or merely distribute complexity?
- Where will its backups live?
- How will it be patched, monitored, and powered down?
- Can the network and storage support migration or failover?
- What happens when I am unavailable?

Retire services too. Every application consumes patching time, backup capacity,
credentials, monitoring attention, and attack surface.

## Learn with controlled failure

Create an experimental zone where breaking things is expected. Practice:

- restoring a VM and an application database;
- replacing a failed disk;
- losing one resolver;
- rotating a credential;
- rebuilding a host from configuration;
- recovering after a bad update; and
- shutting down cleanly on UPS power.

Write down what surprised you while the evidence is fresh.

## Share the lesson, not the attack map

Public diagrams should use roles and semantic zones. Remove hostnames, domains,
addresses, VLAN IDs, MAC addresses, usernames, secret paths, physical locations,
firewall rule names, and recovery routes. Redact screenshots at the source;
blurred text can still leak context.

Link official documentation and date recommendations. Distinguish what you run
from what you recommend. Explain the tradeoff that made the choice right for
you.

## Keep the blueprint current

Automated checks can find broken links, archived repositories, and overdue
reviews. They cannot decide whether a stable project still solves the problem.
That remains a human review.

This guide uses monthly metadata checks and a quarterly review reminder. The
review date is evidence of work completed, not a badge that updates itself.

Return to the [Homelab Blueprint](../README.md).
