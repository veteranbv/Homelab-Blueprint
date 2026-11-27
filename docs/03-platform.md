---
title: Choose the platform
description: Pick Linux, Proxmox, or Kubernetes only when the added layer solves a real requirement.
order: 3
phase: Foundation
decision: Linux with Compose, Proxmox, or K3s?
deliverable: A short platform decision record.
gate: The added layer solves a requirement you actually have.
---

# Choose the platform

Use the least complex platform that satisfies the goal.

## The default decision

### One Linux host plus Docker Compose

Start here for a small service collection. Debian or Ubuntu LTS, Docker Engine,
and current `docker compose` are understandable, portable, and well documented.
Keep Compose files in Git and persistent data outside the repository.

Do not begin new instructions with the legacy standalone `docker-compose` v1
binary. Docker no longer supports it.

### Proxmox VE

Choose Proxmox when you need multiple operating systems, stronger workload
isolation, virtual networks, PCIe/GPU passthrough, VM lifecycle management,
clustering, or native integration with Proxmox Backup Server.

A maintainable pattern is one or more Debian VMs running Compose. Use LXC when
you understand its shared-kernel security and device-mapping tradeoffs, not just
because it is lighter.

Give every VM a named CPU model. The web UI defaults to `x86-64-v2-AES`, but
the backend default for VMs created through the API or older tooling is still
`kvm64`, which lacks newer instructions such as AVX2 that some current software
expects. Use `x86-64-v3` when every node supports it. Use `host` only for a VM
that will never live-migrate, or on nodes with identical CPUs and microcode.

### Kubernetes

Kubernetes is justified when the learning objective is Kubernetes, workloads
need rescheduling across nodes, or declarative multi-node operations solve a real
problem. K3s is the default homelab distribution: conformant, compact, and
packaged with sensible components.

Kubernetes does not remove storage, networking, backup, or upgrade work. It
makes those concerns explicit and distributed.

Talos Linux is the advanced immutable-node path for operators who want an
API-managed Kubernetes operating system. It is not a general-purpose Linux
server.

## Run the container engine deliberately

- Enable `live-restore` so containers keep running while the daemon restarts.
  It covers patch releases only. A `YY.MM` engine upgrade can leave the daemon
  unable to reattach to running containers, so plan those upgrades as container
  restarts.
- Set log rotation. The `json-file` driver keeps logs without limit unless
  `max-size` is set, and `max-file` only applies once it is.
- Make restart-on-unhealthy helpers opt-in per container. Leave them off
  containers whose health depends on network storage or an outside service; a
  restart loop turns a stall into an outage.

### Management UIs and the Docker socket

Portainer, Dockge, Arcane and similar web UIs are conveniences for viewing and
editing Compose stacks in place. Keep the Compose files in Git as the record,
and do not let the UI become a second source of truth or a second image
updater: if another tool already updates images, turn the UI's own updater off.
Anything holding the Docker socket controls the host, and Docker's own guidance
is that only trusted users should control the daemon.

Treat a major release that rewrites the UI's database as a reviewed upgrade
with a restore point taken first. Arcane 3.0, for example, moved to a new
migration baseline and removed its polling agent, legacy image tags and
configuration fallbacks; rolling back
from a change like that means restoring data, not pulling an older tag.

### Getting Compose changes onto hosts

There are two workable patterns. In a host-first workflow, changes are made on
the host and mirrored back to Git, and a drift check proves the mirror matches.
In a pull-based GitOps workflow, an agent on each host pulls from Git and
applies. GitOps needs a read-only credential to the repository on every host,
should show a diff before applying, and should leave secrets in host-side
environment files rather than Git. Pick one per stack and say which in the
repository; an automated version bump merged into a mirror-only file changes
Git and not the host.

## Meaningful alternatives

- **Incus:** system containers and VMs for low-overhead, VM-like Linux
  environments. It complements rather than replaces application containers.
- **XCP-ng with Xen Orchestra:** a strong VM-first appliance and integrated
  backup experience for people who prefer the Xen ecosystem.
- **Unraid applications:** convenient when the storage appliance and application
  host are intentionally combined and the operator accepts the shared failure
  domain.

## Keep roles clear

The hypervisor owns virtual machines. The guest OS owns its updates. Compose or
Kubernetes owns application deployment. The storage system owns data integrity.
The backup system owns recoverable copies. Blurring all five into one interface
may feel convenient until recovery day.

## Primary references

- [Docker Compose production guidance](https://docs.docker.com/compose/how-tos/production/)
- [Docker live restore](https://docs.docker.com/engine/daemon/live-restore/)
- [Docker json-file logging driver](https://docs.docker.com/engine/logging/drivers/json-file/)
- [Docker daemon attack surface](https://docs.docker.com/engine/security/#docker-daemon-attack-surface)
- [Arcane 3.0.0 release notes](https://github.com/getarcaneapp/arcane/releases/tag/v3.0.0)
- [Proxmox VE CPU type guidance](https://pve.proxmox.com/pve-docs/chapter-qm.html#qm_cpu)
- [Proxmox VE documentation](https://pve.proxmox.com/pve-docs/)
- [K3s documentation](https://docs.k3s.io/)
- [Talos Linux documentation](https://docs.siderolabs.com/talos/)
- [Incus documentation](https://linuxcontainers.org/incus/docs/main/)

Next: [Design networking and access](04-networking.md).
