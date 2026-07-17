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
    start: 'A hypervisor, authoritative inventory, configuration management, and recovery evidence.',
    next: 'Add clusters, segments, or Kubernetes for a named capability, never for decoration.',
  },
  {
    id: 'ai',
    eyebrow: '04 · Add bounded automation',
    title: 'Give an agent guardrails',
    promise: 'Turn structured operations into bounded tools an agent can use, inspect, and prove.',
    start: 'A separate inference plane and read-only tools with typed, limited output.',
    next: 'Add previews, approval gates, narrow execution, verification, and bounded loops.',
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
