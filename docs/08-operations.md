---
title: Operate what you install
description: Detect failure, understand its cause, and preserve a practical recovery path.
order: 8
phase: Operations
decision: How will failure be detected and handled?
deliverable: Minimum monitoring, maintenance, alerting, and power plans.
gate: Silence means healthy, not merely unobserved.
---

# Operate what you install

If a service matters, know when it fails, why it failed, and how to recover it.

## Build observability in layers

1. **Reachability:** Uptime Kuma for an approachable start, or Gatus when
   config-as-code is the priority.
2. **Jobs:** dead-man heartbeats for backups, renewals, syncs, and scheduled
   maintenance.
3. **Systems:** Beszel for lightweight host and container metrics.
4. **Patches:** which hosts have pending updates or need a reboot. Without
   this, a stuck or failing updater goes unnoticed.
5. **Logs:** local service logs first; centralized Loki with Grafana Alloy when
   cross-host search and retention solve a real problem.
6. **Traces:** OpenTelemetry only after distributed request paths create a
   question metrics and logs cannot answer.

Promtail reached end of life; use Grafana Alloy for that collection path.
Dozzle is useful for live container troubleshooting, not durable log retention
or audit. When you do centralize container logs, admit stacks one at a time
after checking that the app does not write secrets to its output. For syslog
between hosts, prefer TLS transport (RFC 5425) to plain UDP, and check that
messages actually arrive; an open port does not prove delivery.

Upgrade monitoring agents and their hub together. Since Beszel 0.19.0, agents
verify the hub's HTTPS certificate and need `CA_CERT_FILE` for a private CA.
Uptime Kuma 3.0 is in beta as of late November 2026 and moves authentication
and API keys to a new library; retest anything that logs in to Kuma by script
on a copy of its database before upgrading.

## Alert the symptom and the cause

An alert should say what failed, when it began, what depends on it, and where to
start. Test notification delivery. Run at least one critical check outside the
primary failure domain so a total local outage can still be seen.

Watch the watcher. Send a dead-man heartbeat from the monitor to a check hosted
somewhere else, or run a second small monitor in another failure domain that
probes the first. Otherwise one host failure silences every alert at once, and
silence reads as healthy. For push (heartbeat) monitors, make the expected
interval longer than the producer's period plus its run time, or the monitor
will flap.

## Maintenance loop

- inventory current versions and ownership;
- create or verify a recovery point;
- update one canary;
- run pre/post smoke checks;
- stop on regression;
- continue in small waves; and
- prove convergence at the end.

Automatic updates without reboot policy, health gates, and failure handling are
not fleet management.

## Power is architecture

UPS-protect storage, networking, DNS, and the control plane. For shared UPS
systems, Network UPS Tools can coordinate secondaries shutting down before the
attached controller. Model power dependency separately from physical rack
placement.

Test a simulated shutdown, one controlled outage, and startup recovery. A plan
that has never reached powered-off hardware is still a hypothesis.

## Primary references

- [Uptime Kuma repository](https://github.com/louislam/uptime-kuma)
- [Uptime Kuma releases](https://github.com/louislam/uptime-kuma/releases)
- [Gatus documentation](https://gatus.io/)
- [Beszel 0.19.0 release notes](https://github.com/henrygd/beszel/releases/tag/v0.19.0)
- [Dozzle documentation](https://dozzle.dev/)
- [Grafana Loki documentation](https://grafana.com/docs/loki/latest/)
- [RFC 5425: TLS transport mapping for syslog](https://www.rfc-editor.org/rfc/rfc5425)
- [Beszel documentation](https://beszel.dev/guide/what-is-beszel)
- [Grafana Alloy documentation](https://grafana.com/docs/alloy/latest/)
- [Loki release notes documenting Promtail removal](https://grafana.com/docs/loki/latest/release-notes/v3-7/)
- [Network UPS Tools documentation](https://networkupstools.org/documentation.html)

Next: [Build a control plane](09-automation.md).
