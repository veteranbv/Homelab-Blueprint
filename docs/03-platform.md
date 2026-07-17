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
binary. Docker keeps it only for backward compatibility.

### Proxmox VE

Choose Proxmox when you need multiple operating systems, stronger workload
isolation, virtual networks, PCIe/GPU passthrough, VM lifecycle management,
clustering, or native integration with Proxmox Backup Server.

A maintainable pattern is one or more Debian VMs running Compose. Use LXC when
you understand its shared-kernel security and device-mapping tradeoffs, not just
because it is lighter.

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
- [Proxmox VE documentation](https://pve.proxmox.com/pve-docs/)
- [K3s documentation](https://docs.k3s.io/)
- [Talos Linux documentation](https://www.talos.dev/)
- [Incus documentation](https://linuxcontainers.org/incus/docs/main/)

Next: [Design networking and access](04-networking.md).
