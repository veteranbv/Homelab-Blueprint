---
title: Build security into the design
description: Give identity, secrets, patches, and emergency access clear owners and recovery paths.
order: 6
phase: Trust
decision: What needs protection, and how is access recovered?
deliverable: A threat model, identity plan, and break-glass path.
gate: Secrets, patches, and recovery access have owners.
---

# Build security into the design

Homelab security is mostly disciplined identity, patching, network boundaries,
and recovery. Buying a large security stack does not compensate for weak basics.

## Identity

Authentik is the default SSO platform when several applications support OIDC,
SAML, LDAP, or proxy integration. Prefer application-native OIDC authorization
code flow with PKCE. Authelia is a lighter alternative for forward-auth and
straightforward OIDC needs.

Keycloak, ZITADEL, and similar platforms are worthwhile learning or advanced
multitenant choices, but usually excessive for a small household.

Proxy authentication protects only traffic that passes through the proxy.
Require phishing-resistant MFA or passkeys for privileged and remote access
where supported. Protect offline recovery codes or a break-glass identity and
test lockout recovery. Preserve an independent recovery path for the identity
service itself; central SSO without those controls can widen the blast radius.

## Secrets

Use a mature secrets manager with least-privilege machine identities and runtime
injection. For secret-bearing Git configuration, SOPS with age is a practical
default. Do not commit plaintext secrets, generated environment files, or
recovery credentials.

Vault or OpenBao earns its operational cost for PKI or dynamic credentials, not
for a handful of static passwords. Infisical is a strong middle path when
runtime identity, rotation, and audit justify another service.

Document how to recover the secrets system without depending on the secrets
system.

## Patch and supply-chain policy

- Apply operating-system security updates automatically with an explicit reboot
  policy.
- Update fleets in canary waves; halt when health checks fail.
- Pin third-party GitHub Actions to full commit SHAs.
- Pin critical container deployments to reviewed versions or digests.
- Inspect community scripts before execution. Avoid `curl | sh` as an operating
  model.
- Use Dependabot for simple GitHub-native repositories and Renovate when grouped
  updates or custom ecosystems justify it.
- Keep a rollback or restore path for consequential upgrades.

CrowdSec can add useful behavior-based blocking at a public edge when paired
with a remediation component. Wazuh is a serious SIEM/XDR learning platform,
not a beginner security checkbox.

## Threat model in one page

Write down what you protect, from whom, and what failure costs. For most homes:

- private photos and documents need confidentiality and recovery;
- household services need reasonable availability;
- administrative access needs strong authentication and private reachability;
- IoT devices need containment; and
- public applications need patching, logs, rate limits, and a narrow blast
  radius.

## Primary references

- [Authentik documentation](https://docs.goauthentik.io/)
- [SOPS documentation](https://getsops.io/docs/)
- [GitHub Actions security hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [CISA Secure by Design](https://www.cisa.gov/securebydesign)

Next: [Choose services that create value](07-services.md).
