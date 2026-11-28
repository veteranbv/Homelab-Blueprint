---
title: Design networking and access
description: Turn trust and failure boundaries into zones with named, documented flows.
order: 4
phase: Boundaries
decision: Who may talk to what?
deliverable: Semantic zones and a map of allowed flows.
gate: Administration remains private and exceptions are explicit.
---

# Design networking and access

Segmentation should express trust and failure boundaries, not produce an
impressive VLAN count.

<picture>
  <img src="images/plate-03.png" alt="Plate 03, a top-down plan view of three rooms. Edge on the left has a thin wall and contains a TLS terminator and a remote-access mesh. Private core in the middle has a thick wall and contains compute, identity, and network. Data on the right has a thick wall with a lock on its door and contains a storage pool. An AI annex with a dashed wall sits beside the core. Door labels name the exact allowed flow at each opening." width="900">
</picture>

## Start with semantic zones

- **Trusted clients:** ordinary household computers and phones.
- **Services:** application hosts that accept defined client traffic.
- **Management:** hypervisors, switches, storage administration, and monitoring.
- **IoT and media:** devices that need limited local access and often broad
  internet access.
- **Guest/untrusted:** internet access without private-network reachability.
- **DMZ:** optional, for deliberately public services isolated from management.

Default-deny new flows between zones, then permit documented dependencies and
stateful return traffic. Keep management planes reachable only from the
management zone or a private VPN.

## DNS and DHCP

Pi-hole is the approachable default for network-wide blocking. Technitium is the
stronger default when you need authoritative internal zones, recursion, APIs,
policies, or clustering. AdGuard Home is a good turnkey alternative.

Run two resolvers on independent failure domains. Avoid a dependency loop where
each resolver, container runtime, identity service, and dashboard requires the
other resolver to start.

## Ingress

Caddy is the default for a small home because its configuration is compact and
automatic HTTPS is built in. Traefik earns its extra moving parts in dynamic
Docker or Kubernetes environments. Nginx Proxy Manager remains a reasonable
UI-first entry point when its database and configuration are backed up.

Caddy also works as a small host-local TLS gateway for an app that has no
native TLS: the app listens on loopback only and Caddy serves the certificate.
With `admin off`, every Caddy config change needs a full restart. An admin
endpoint on a Unix socket keeps graceful reloads possible while file
permissions control who can use it.

Traefik does not rotate its access log file. Rotate it externally and send
`USR1` so Traefik reopens the file, or log to stdout and let the container log
driver rotate it. An unrotated access log on the edge proxy will eventually
fill its disk.

If you own a public domain, publish a CAA record that names the one
certificate authority you use. Other CAs must then refuse to issue for the
domain, which cuts off unintended issuance while your DNS stays trusted. It
does not stop someone who can edit your DNS: they can change or remove the CAA
record too ([RFC 8659 section 5.4](https://www.rfc-editor.org/rfc/rfc8659.html#section-5.4)).
Protect the DNS account itself with MFA and narrowly scoped API tokens. Let's
Encrypt checks CAA before every issuance and fails if the lookup fails, so
confirm the record before a renewal is due.

Keep administrative services private even when a reverse proxy can publish
them. A valid certificate does not make an admin panel safe for the internet.

## Remote access

Tailscale is the default because it makes a WireGuard-based private network
approachable and adds policy controls. Test grants and preserve recovery access.
Plain WireGuard is excellent for a small static peer set, including
encrypting storage or backup traffic between fixed hosts on the LAN. Headscale is for
people who explicitly want to operate the coordination plane too.

Do not forward raw SSH, RDP, hypervisor, NAS, or router administration ports.

## Discovery protocols

Some household devices rely on multicast DNS or broadcast discovery. Relay it
narrowly between the exact zones that need it. Do not flatten segmentation just
to make discovery work.

## Primary references

- [NIST SP 800-207: Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)
- [Pi-hole documentation](https://docs.pi-hole.net/)
- [Technitium DNS Server documentation](https://technitium.com/dns/)
- [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https)
- [Caddy global options: admin endpoint](https://caddyserver.com/docs/caddyfile/options)
- [Traefik logs and access logs](https://doc.traefik.io/traefik/reference/install-configuration/observability/logs-and-accesslogs/)
- [Let's Encrypt: CAA](https://letsencrypt.org/docs/caa/)
- [WireGuard](https://www.wireguard.com/)
- [Tailscale access-control policies](https://tailscale.com/docs/features/access-control/acls)

Next: [Protect storage and prove recovery](05-storage-backup.md).
