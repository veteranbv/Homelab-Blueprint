# Operate what you install

If a service matters, know when it fails, why it failed, and how to recover it.

## Build observability in layers

1. **Reachability:** Uptime Kuma for an approachable start, or Gatus when
   config-as-code is the priority.
2. **Jobs:** dead-man heartbeats for backups, renewals, syncs, and scheduled
   maintenance.
3. **Systems:** Beszel for lightweight host and container metrics.
4. **Logs:** local service logs first; centralized Loki with Grafana Alloy when
   cross-host search and retention solve a real problem.
5. **Traces:** OpenTelemetry only after distributed request paths create a
   question metrics and logs cannot answer.

Promtail reached end of life; use Grafana Alloy for that collection path.
Dozzle is useful for live container troubleshooting, not durable log retention
or audit.

## Alert the symptom and the cause

An alert should say what failed, when it began, what depends on it, and where to
start. Test notification delivery. Run at least one critical check outside the
primary failure domain so a total local outage can still be seen.

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
- [Beszel documentation](https://beszel.dev/guide/what-is-beszel)
- [Grafana Alloy documentation](https://grafana.com/docs/alloy/latest/)
- [Loki release notes documenting Promtail removal](https://grafana.com/docs/loki/latest/release-notes/v3-7/)
- [Network UPS Tools documentation](https://networkupstools.org/documentation.html)

Next: [Build a control plane](09-automation.md).
