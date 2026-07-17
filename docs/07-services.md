---
title: Choose services that create value
description: Run fewer services, assign ownership, and keep only what earns its operating cost.
order: 7
phase: Value
decision: What improves life outside the dashboard?
deliverable: One service contract covering users, data, exposure, backup, and ownership.
gate: The service earns more value than it costs to maintain.
---

# Choose services that create value

Install fewer things and use them. A valuable service survives updates, gets
backed up, and improves life outside the dashboard.

## High-value defaults

| Need | Default | Choose an alternative when… |
| --- | --- | --- |
| Photos | Immich | You want a commercial appliance workflow; always retain independent originals |
| Documents | Paperless-ngx | You need only file shares, not OCR and document workflows |
| Home automation | Home Assistant | openHAB’s technology-neutral model fits you better |
| Media | Jellyfin | Plex client polish and family simplicity outweigh account/subscription dependence |
| Music | Navidrome | A full media suite already meets the need |
| Audiobooks | Audiobookshelf | Your existing ecosystem handles books and podcasts well |
| Files/groupware | Nextcloud | SMB, NFS, or Syncthing solves the narrower problem more simply |
| Budgeting | Actual Budget | You need a hosted financial service or institution-specific integrations |
| Recipes | Mealie | A simple shared document is enough |
| Bookmarks | Linkwarden | Readeck’s lean reading-first workflow is the real need |
| RSS | FreshRSS | A hosted reader removes maintenance you do not value |
| PDF tools | Stirling-PDF | Local desktop tools already solve the workflow |

Immich reached a stable major release, but that does not turn it into the only
copy of your photos. Paperless-ngx being largely feature-complete is a strength,
not evidence of abandonment.

## Media ecosystem

Jellyfin is the open-source default with free hardware transcoding. Plex remains
excellent when broad client support and household polish matter, but remote
personal-media playback policies have changed and should be checked before
buying around it. Emby is the commercial middle ground.

Seerr is the current unified request-management path. Sonarr, Radarr, Prowlarr,
and Bazarr can organize legally obtained libraries. qBittorrent and SABnzbd are
the common transfer clients. If using NZBGet, choose the active continuation,
not the archived original repository.

## Automation

n8n is the broad workflow-automation default. Node-RED is especially good for
device and event flows. Activepieces is a simpler alternative. Keep household-
critical automations local-first and define what happens when the internet or AI
provider is unavailable.

## Dashboards

Homepage is the config-as-code default. Homarr is the UI-first, multi-user
alternative. Dashy offers deep visual customization. Heimdall remains a simple
launcher.

A dashboard is navigation and context. It is not monitoring. A green tile does
not prove that a backup can restore or that an alert can reach you.

## Password managers

Vaultwarden can be a good project for an operator prepared to own a security-
critical service. Hosted Bitwarden or 1Password is a better recommendation for
most people than implying self-hosting is automatically safer.

## Primary references

- [Home Assistant documentation](https://www.home-assistant.io/docs/)
- [Jellyfin documentation](https://jellyfin.org/docs/)
- [Immich 2.0 stable release](https://immich.app/blog/v2.0.0-release)
- [Paperless-ngx documentation](https://docs.paperless-ngx.com/)
- [Plex remote-playback policy update](https://www.plex.tv/blog/important-2025-plex-updates/)
- [Seerr repository](https://github.com/seerr-team/seerr)
- [Active NZBGet continuation](https://github.com/NZBGetCom/nzbget)
- [Homepage documentation](https://gethomepage.dev/)

Next: [Operate what you install](08-operations.md).
