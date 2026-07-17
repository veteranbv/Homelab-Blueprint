export const repositoryUrl = 'https://github.com/veteranbv/Homelab-Blueprint'

export type OutcomeId = 'learn' | 'household' | 'infrastructure' | 'ai'

export interface Outcome {
  id: OutcomeId
  eyebrow: string
  title: string
  promise: string
  start: string
  next: string
}

export const outcomes: readonly Outcome[] = [
  {
    id: 'learn',
    eyebrow: '01 · Learn',
    title: 'Make the invisible visible',
    promise:
      'Learn Linux, networks, containers, and recovery without turning the house into a test environment.',
    start: 'An existing computer, one Linux install, and one service you care about.',
    next: 'Add Compose, monitoring, and virtualization only when the lesson needs them.',
  },
  {
    id: 'household',
    eyebrow: '02 · Create value',
    title: 'Run something worth keeping',
    promise:
      'Give the household a service that works quietly and can be restored when the hardware does not.',
    start: 'One maintainable host, private remote access, backups, and a tested restore.',
    next: 'Separate storage and compute when the cost of one failure becomes real.',
  },
  {
    id: 'infrastructure',
    eyebrow: '03 · Build depth',
    title: 'Practice serious operations',
    promise:
      'Use the lab to learn isolation, desired state, observability, and safe change on real systems.',
    start:
      'A hypervisor, authoritative inventory, configuration management, and recovery evidence.',
    next: 'Add clusters, segments, or Kubernetes for a named capability, never for decoration.',
  },
  {
    id: 'ai',
    eyebrow: '04 · Add bounded automation',
    title: 'Give an agent guardrails',
    promise:
      'Turn structured operations into bounded tools an agent can use, inspect, and prove.',
    start: 'A separate inference plane and read-only tools with typed, limited output.',
    next: 'Add previews, approval gates, narrow execution, verification, and bounded loops.',
  },
] as const

export interface JourneyStep {
  number: string
  phase: string
  title: string
  decision: string
  deliverable: string
  gate: string
  document: string
}

export const journey: readonly JourneyStep[] = [
  {
    number: '01',
    phase: 'Intent',
    title: 'Plan before you buy',
    decision: 'What outcome justifies this lab?',
    deliverable: 'A first workload, constraints, and a recovery target.',
    gate: 'You can name who benefits and what working means.',
    document: 'docs/01-plan.md',
  },
  {
    number: '02',
    phase: 'Foundation',
    title: 'Choose hardware by role',
    decision: 'What role can existing hardware not fill?',
    deliverable: 'A role-based hardware plan and an idle-power budget.',
    gate: 'A purchase buys a named capability.',
    document: 'docs/02-hardware.md',
  },
  {
    number: '03',
    phase: 'Foundation',
    title: 'Choose the platform',
    decision: 'Linux with Compose, Proxmox, or K3s?',
    deliverable: 'A short platform decision record.',
    gate: 'The added layer solves a requirement you actually have.',
    document: 'docs/03-platform.md',
  },
  {
    number: '04',
    phase: 'Boundaries',
    title: 'Design the network',
    decision: 'Who may talk to what?',
    deliverable: 'Semantic zones and a map of allowed flows.',
    gate: 'Administration remains private and exceptions are explicit.',
    document: 'docs/04-networking.md',
  },
  {
    number: '05',
    phase: 'Trust',
    title: 'Protect data',
    decision: 'How does valuable data survive each failure domain?',
    deliverable: 'A recovery chain and a dated restore-test record.',
    gate: 'A restore has worked somewhere other than the source.',
    document: 'docs/05-storage-backup.md',
  },
  {
    number: '06',
    phase: 'Trust',
    title: 'Build in security',
    decision: 'What needs protection, and how is access recovered?',
    deliverable: 'A threat model, identity plan, and break-glass path.',
    gate: 'Secrets, patches, and recovery access have owners.',
    document: 'docs/06-security.md',
  },
  {
    number: '07',
    phase: 'Value',
    title: 'Choose useful services',
    decision: 'What improves life outside the dashboard?',
    deliverable: 'One service contract: users, data, exposure, backup, owner.',
    gate: 'The service earns more value than it costs to maintain.',
    document: 'docs/07-services.md',
  },
  {
    number: '08',
    phase: 'Operations',
    title: 'Operate what you install',
    decision: 'How will failure be detected and handled?',
    deliverable: 'Minimum monitoring, maintenance, alerting, and power plans.',
    gate: 'Silence means healthy, not merely unobserved.',
    document: 'docs/08-operations.md',
  },
  {
    number: '09',
    phase: 'Automation',
    title: 'Build a control plane',
    decision: 'Which repeated work deserves automation?',
    deliverable: 'Inventory, desired state, preview, execution, and evidence.',
    gate: 'Automation can explain what it will change and prove what it did.',
    document: 'docs/09-automation.md',
  },
  {
    number: '10',
    phase: 'Automation',
    title: 'Add bounded automation',
    decision: 'Which operations should an agent assist?',
    deliverable: 'A tool risk policy and one safe agent workflow.',
    gate: 'The model proposes. Policy and typed tools constrain.',
    document: 'docs/10-ai-agentic.md',
  },
  {
    number: '11',
    phase: 'Stewardship',
    title: 'Grow and share responsibly',
    decision: 'Has expansion earned its cost?',
    deliverable: 'An expansion gate and a public-sharing redaction check.',
    gate: 'No private identifiers or recovery routes leave the lab.',
    document: 'docs/11-grow-share.md',
  },
] as const

export interface BlueprintChoice {
  outcome: OutcomeId
  workload: 'one-host' | 'mixed' | 'cluster'
  irreplaceableData: boolean
}

export interface BlueprintRecommendation {
  foundation: string
  sequence: readonly string[]
  caution: string
}

export function recommendBlueprint(choice: BlueprintChoice): BlueprintRecommendation {
  const foundation =
    choice.workload === 'one-host'
      ? 'Linux + Docker Compose'
      : choice.workload === 'mixed'
        ? 'Proxmox VE + small Linux guests'
        : 'K3s on deliberately separate nodes'

  const sequence = [
    'Define one useful workload and its owner.',
    `Build the smallest foundation: ${foundation}.`,
    choice.irreplaceableData
      ? 'Create an encrypted copy on another failure domain, then restore it.'
      : 'Document what is disposable and how it will be rebuilt.',
    'Add reachability, host health, job heartbeats, and an alert path.',
    choice.outcome === 'ai'
      ? 'Expose one read-only operation to an agent before any mutating tool.'
      : 'Run it for a month before adding another layer.',
  ]

  const caution =
    choice.workload === 'cluster'
      ? 'A cluster is justified only by an explicit scheduling, availability, or Kubernetes learning goal.'
      : choice.outcome === 'ai'
        ? 'Keep inference outside the dependency chain for DNS, storage, backups, and administration.'
        : 'Do not buy another machine until the current one has a measured limit.'

  return { foundation, sequence, caution }
}

export function documentUrl(document: string): string {
  return `${repositoryUrl}/blob/master/${document}`
}
