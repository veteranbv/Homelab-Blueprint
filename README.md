# Homelab Blueprint

An opinionated, evidence-backed path from one useful home server to a resilient,
AI-capable homelab.

This is a guide to making decisions, not a catalog of everything you could
install. Start with a problem worth solving. Add the smallest system that solves
it. Earn every extra layer through a real need: isolation, recovery, scale,
learning, or household value.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/choose-your-path-dark.png">
  <img src="docs/images/choose-your-path.png" alt="Four progressive homelab paths: learn on existing hardware, run useful services, add resilience, and add bounded local AI operations." width="900">
</picture>

## Start here

Choose the path closest to your actual goal:

| Goal | Start with | Add next only when needed |
| --- | --- | --- |
| Learn Linux and networking | An existing PC or small mini PC running Debian or Ubuntu | Docker Compose, monitoring, then virtualization |
| Run useful household services | One maintainable host, Compose, backups, and remote access | Separate storage and compute when failures become expensive |
| Build a serious infrastructure lab | Proxmox VE, source-of-truth inventory, configuration management, and tested recovery | Clustering, segmented networks, and Kubernetes for a defined learning goal |
| Explore local AI and agents | A separate inference host or workstation plus a narrow API boundary | Tool access, approval gates, audit evidence, and bounded autonomous loops |

If you are buying hardware before you can name the first workload and its
recovery plan, pause. The best first homelab is usually the computer you already
own.

## The roadmap

1. [Set goals, constraints, and a budget](docs/01-plan.md)
2. [Choose hardware by role](docs/02-hardware.md)
3. [Choose a platform](docs/03-platform.md)
4. [Design the network and access model](docs/04-networking.md)
5. [Protect storage and prove recovery](docs/05-storage-backup.md)
6. [Build identity, secrets, and patching into the design](docs/06-security.md)
7. [Pick services that create real value](docs/07-services.md)
8. [Operate what you install](docs/08-operations.md)
9. [Move from manual work to a control plane](docs/09-automation.md)
10. [Add local AI and an agentic operations harness](docs/10-ai-agentic.md)
11. [Grow, experiment, and share responsibly](docs/11-grow-share.md)

## A reference architecture, not a shopping list

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/maturity-tiers-dark.png">
  <img src="docs/images/maturity-tiers.png" alt="Homelab maturity tiers showing a progression from one useful host to separated storage and compute, resilient operations, and an optional AI workload plane." width="900">
</picture>

The tiers are cumulative capabilities, not status levels. A quiet single server
with reliable backups is better than a rack whose owner cannot restore it.

## Defaults that hold up

- **Applications:** Docker Engine with current `docker compose` on one Linux host.
- **Mixed workloads:** Proxmox VE when virtual machines, passthrough, snapshots,
  or isolation earn the hypervisor layer.
- **Kubernetes:** K3s when learning or multi-node scheduling is the stated goal,
  not as the default way to run five containers.
- **Storage:** OpenZFS through TrueNAS Community Edition or a deliberately
  managed host when data integrity matters.
- **Recovery:** native application exports, encrypted repository backups, a
  separate off-site or offline copy, and tested restores.
- **Remote access:** a private WireGuard-based overlay such as Tailscale before
  exposing administrative ports.
- **Observability:** reachability, host metrics, job heartbeats, and alerts before
  adopting a large telemetry stack.
- **Local AI:** choose hardware by usable accelerator memory and workload, then
  keep inference separate from household-critical infrastructure where practical.

The [reviewed recommendations registry](recommendations.toml) records 26 core
infrastructure and flagship-service choices, their roles, project locations,
and last-reviewed dates. Individual guides cite the primary evidence behind
additional specialist choices. Automated checks catch obvious drift; humans
still make recommendation decisions.

## What changed since the original blueprint

The first version was written in 2023 while I was building my own lab. The
goals-first journey still holds. The long product lists and decorative AI images
did not.

This rebuild replaces them with:

- decision frameworks instead of name dumps;
- current project-health and community evidence;
- architecture diagrams with editable, deterministic sources;
- recovery, power, and operations as first-class design work;
- local AI and agentic operations with explicit safety boundaries; and
- short field notes from a real homelab, stripped of private topology and
  household details.

## How recommendations are made

Official documentation and release history establish what a project is and
whether it is supported. Practitioner evidence establishes how it behaves in
real homelabs. Popularity helps discover candidates, but it is never enough by
itself.

Every recommendation is checked for maintenance state, license, documentation,
upgrade and export paths, operational cost, security posture, and fit for the
reader's goal. The dated [research notes](docs/research-notes.md) show the
review method and representative practitioner evidence. See
[Contributing](CONTRIBUTING.md) for the full standard.

## License

Prose and visual assets are licensed under
[CC BY 4.0](LICENSE). Repository tooling is licensed under
[MIT](LICENSE-CODE).
