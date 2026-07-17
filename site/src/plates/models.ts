import type { FailureCopy, PlateManifestEntry } from './types'

export const PLATES: readonly PlateManifestEntry[] = [
  {
    id: 'plate-01',
    number: '01',
    name: 'The question sheet',
    eyebrow: 'Start with the outcome',
    teachingPoint:
      'A homelab follows from three answers. Everything downstream is a consequence of them.',
    a11yDescription:
      'A drafting sheet titled The question sheet. It shows three pencilled questions on a card: who is this actually for, what data cannot be recreated, and what must keep working when you are away. To the right, a layer stack lists four destinations. Each destination has a tick box and the condition that adds it: learn, create value, add resilience, add bounded automation. A footer reminds the reader to stop at the destination that solves the problem.',
    chapters: ['docs/01-plan.md'],
    mobileNotes: [
      { label: 'WHO IS THIS FOR', text: 'Name a person, not a persona. The service level is set by who notices when it breaks.' },
      { label: 'WHAT CANNOT BE RECREATED', text: 'Name the folder or the record. Recovery, not storage, is where that data survives.' },
      { label: 'WHAT MUST KEEP WORKING', text: 'Name the hour, not the aspiration. That list is the local-first side of the design.' },
      { label: 'CHOOSE ONE DESTINATION', text: 'Learn, create value, add resilience, or add bounded automation. Stop at the one that solves your problem.' },
      { label: 'COMPLEXITY IS A COST', text: 'Every added layer earns its place. A quieter design that recovers is more mature than a louder one that does not.' },
    ],
  },
  {
    id: 'plate-02',
    number: '02',
    name: 'One useful host',
    eyebrow: 'Foundation',
    teachingPoint:
      'One box, one service, one owner. One backup on another failure domain. One restore that has worked. One alert path that reaches you.',
    a11yDescription:
      'An elevation of a small maintainable service host on a shelf. Above the host, a stick figure labelled tenant represents the person the service is for. To the right of the host, a dashed line crosses a failure-domain boundary and ends at a network-attached storage elevation with two disk slots. Under everything, a restore ledger shows the invariant shape of a restore record: date, source, target, checksum result, and elapsed time. The ledger is marked example record synthetic. Right-margin annotations name the meaning of each element.',
    chapters: ['docs/02-hardware.md', 'docs/03-platform.md'],
    mobileNotes: [
      { label: 'ONE SVC HOST', text: 'One box, one owner, one patch cadence. The green LED means reachable, not healthy.' },
      { label: 'A NAS ACROSS THE BOUNDARY', text: 'Different circuit, different building. A mirrored pool is availability, not the backup.' },
      { label: 'ONE COPY THAT LIVES ELSEWHERE', text: 'The backup goes to the NAS. The copy that survives disaster lives on another failure domain again.' },
      { label: 'ONE ALERT PATH', text: 'The alert path lives outside the host it watches. Silence means healthy, not merely unobserved.' },
      { label: 'A DATED RESTORE RECORD', text: 'Date, source, target, checksum, elapsed. A restore record is proof. A backup job status is not.' },
    ],
  },
  {
    id: 'plate-03',
    number: '03',
    name: 'Trust boundaries',
    eyebrow: 'Boundaries',
    teachingPoint:
      'Trust boundaries are physical, not conceptual. A boundary is a wall with named doors. Deny cross-zone by default. Allow only documented flows.',
    a11yDescription:
      'A top-down plan of three rooms. Edge on the left has a thin wall and contains a TLS terminator and a remote-access mesh. Private core in the middle has a thick wall and contains compute, identity, and network. Data on the right has a thick wall with a lock on its door and contains a storage pool. An optional AI annex with a dashed wall sits beside the core. Door labels name the allowed flow at each opening. A bottom stripe states the default policy: deny cross-zone, allow named dependencies, log denies with consequence.',
    chapters: ['docs/04-networking.md', 'docs/06-security.md'],
    mobileNotes: [
      { label: 'EDGE, THIN WALL', text: 'The TLS terminator publishes, it never authorizes. The remote-access mesh exposes no admin ports to the internet.' },
      { label: 'PRIVATE CORE, THICK WALL', text: 'Compute, identity, and network sit here. Two resolvers on independent domains so neither is a single point of failure.' },
      { label: 'DATA, THICK WALL AND A LOCK', text: 'Storage pool with a documented CIDR and service accounts only. No shared credential with the application.' },
      { label: 'AI ANNEX, DASHED WALL', text: 'Optional. Unix socket into core, read-only. Unplug it and household services keep working.' },
      { label: 'DEFAULT POLICY', text: 'Deny cross-zone. Allow named dependencies. Log denies with consequence. Keep the management plane inside core.' },
    ],
  },
  {
    id: 'plate-04',
    number: '04',
    name: 'Recovery chain',
    eyebrow: 'Data protection',
    teachingPoint:
      'A backup is a claim. A restore is evidence. Each stage crosses a failure boundary, keeps its own credentials, and leaves a dated record.',
    a11yDescription:
      'A vertical stack of five filing tabs that shows the recovery chain from live application data through native export, encrypted repository, off-site copy, and canary restore, ending with a proven stamp. Each tab lists the invariant fields of an evidence record: what the stage holds, where its credential lives, and what verifies the transition to the next tab. The stack is marked example record synthetic. A left rule shows elapsed-time positions between stages. Margin notes name why each stage exists.',
    chapters: ['docs/05-storage-backup.md'],
    mobileNotes: [
      { label: 'LIVE APPLICATION DATA', text: 'The application owns this. Every step below has to survive it.' },
      { label: 'NATIVE EXPORT', text: 'A portable file the application can reload. The export runs with the application quiet.' },
      { label: 'ENCRYPTED REPOSITORY', text: 'Versioned snapshots with a freshness heartbeat. The backup credential is not the application credential.' },
      { label: 'OFF-SITE OR OFFLINE COPY', text: 'An independent copy that survives a local disaster. The off-site identity cannot reach the primary.' },
      { label: 'PROVEN RESTORE', text: 'A dated record on a clean canary target. Checksum match plus a smoke test the application defines.' },
    ],
  },
  {
    id: 'plate-05',
    number: '05',
    name: 'The loop, field note',
    eyebrow: 'Bounded automation',
    teachingPoint:
      'The agent came last. It uses the same typed operations a person already trusts. Policy decides. Live verification closes the record.',
    a11yDescription:
      'A workshop bench diagram. On the left, a stack of typed tool cards lists the name, input, preview mode, and risk class of the operations an agent may propose. In the middle, a rectangular pipeline runs from observe to reconcile, preview, constrain, verify, and record. A policy gate diamond sits in the middle of the pipeline, stamped human or policy. On the right, a ruled ledger page shows the invariant columns of an audit record: timestamp, operation class, target class, preview delta, decision, and verification. The ledger is marked example record synthetic. A first-person field note runs above.',
    chapters: ['docs/09-automation.md', 'docs/10-ai-agentic.md'],
    mobileNotes: [
      { label: 'FIELD NOTE', text: 'I did not give a model shell access on day one. I gave it read-only observation, then the same typed operations I already trusted.' },
      { label: 'TYPED TOOLS', text: 'Each tool has a name, a small input, a preview mode, and a risk class. Read, reversible, destructive, or physical.' },
      { label: 'THE LOOP', text: 'Observe, reconcile, preview, constrain, verify, record. Read broad, change narrow, then close the record on the live outcome.' },
      { label: 'POLICY GATE', text: 'A human or a policy decides what runs. Sensitive changes go through the same gate whether the model or a person proposes them.' },
      { label: 'AUDIT LEDGER', text: 'Timestamp, operation, target class, preview delta, decision, verification. A role and a count, never a hostname.' },
    ],
  },
] as const

export const FAILURES: readonly FailureCopy[] = [
  {
    id: 'host',
    label: 'Primary host',
    lesson:
      'The service stops. The alert path keeps working because it lives outside this host. The last restore record still stands.',
    applicablePlates: ['plate-02'],
  },
  {
    id: 'internet',
    label: 'Internet uplink',
    lesson:
      'Local services keep serving. Remote access and off-site shipment pause. The most recent proven restore is still proof of readiness.',
    applicablePlates: ['plate-03', 'plate-04'],
  },
  {
    id: 'storage',
    label: 'Primary storage',
    lesson:
      'Live application data becomes unavailable. The encrypted repository and off-site copy remain. Snapshots are rollback, not backup.',
    applicablePlates: ['plate-02', 'plate-04'],
  },
  {
    id: 'identity',
    label: 'Identity provider',
    lesson:
      'Normal sign-in fails. The sealed break-glass credential preserves administrator access to the systems that recover identity.',
    applicablePlates: ['plate-03', 'plate-05'],
  },
  {
    id: 'inference',
    label: 'AI inference',
    lesson:
      'The loop still runs. The person proposes now. Policy, previews, and evidence do not depend on the model being available.',
    applicablePlates: ['plate-05'],
  },
] as const

export interface RestoreLedgerColumn {
  key: string
  label: string
  example: string
}

export const RESTORE_LEDGER_COLUMNS: readonly RestoreLedgerColumn[] = [
  { key: 'date', label: 'DATE', example: 'YYYY-MM-DD' },
  { key: 'source', label: 'SOURCE', example: 'SVC HOST' },
  { key: 'target', label: 'RESTORED ON', example: 'CANARY HOST' },
  { key: 'checksum', label: 'CHECKSUM', example: 'sha256: match' },
  { key: 'duration', label: 'ELAPSED', example: 'HH:MM:SS' },
]

export interface RecoveryStage {
  id: string
  step: string
  title: string
  contains: string
  credential: string
  verifies: string
  transitionTo: string
}

export const RECOVERY_STAGES: readonly RecoveryStage[] = [
  {
    id: 'live',
    step: '01',
    title: 'LIVE APPLICATION DATA',
    contains: 'the working state a person or service depends on today',
    credential: 'the application runtime identity',
    verifies: 'reachability of the service that owns the data',
    transitionTo: 'application-consistent export, ordered by dependency',
  },
  {
    id: 'export',
    step: '02',
    title: 'NATIVE EXPORT',
    contains: 'a portable file the application can reload',
    credential: 'the export tool identity, distinct from the runtime',
    verifies: 'file size, row count, or manifest matches expectation',
    transitionTo: 'write to an encrypted repository with versioned snapshots',
  },
  {
    id: 'repository',
    step: '03',
    title: 'ENCRYPTED REPOSITORY',
    contains: 'deduplicated, versioned snapshots and a freshness heartbeat',
    credential: 'the backup tool identity, held separately from application secrets',
    verifies: 'the last snapshot is fresh and its checksum is intact',
    transitionTo: 'ship a copy to a separate failure domain',
  },
  {
    id: 'offsite',
    step: '04',
    title: 'OFF-SITE OR OFFLINE COPY',
    contains: 'an independent copy that survives a local disaster',
    credential: 'the off-site identity, unable to reach the primary',
    verifies: 'the copy list matches the origin and cannot be silently deleted',
    transitionTo: 'restore a canary somewhere other than the source',
  },
  {
    id: 'proven',
    step: '05',
    title: 'PROVEN RESTORE',
    contains: 'a dated record of a real restore on a clean target',
    credential: 'a canary identity that never touches production',
    verifies: 'checksum match and a smoke test the application defines',
    transitionTo: 'record the result for the next planning pass',
  },
]

export interface ToolCard {
  name: string
  input: string
  preview: 'always' | 'required' | 'n/a'
  risk: 'read' | 'reversible' | 'destructive' | 'physical'
}

export const TOOL_CARDS: readonly ToolCard[] = [
  { name: 'svc.status', input: '{svc: SvcRole}', preview: 'n/a', risk: 'read' },
  { name: 'svc.logs.tail', input: '{svc: SvcRole, lines: N}', preview: 'n/a', risk: 'read' },
  { name: 'svc.restart', input: '{svc: SvcRole}', preview: 'required', risk: 'reversible' },
  { name: 'backup.verify', input: '{repo: RepoRole}', preview: 'always', risk: 'reversible' },
  { name: 'net.route.add', input: '{zone: ZoneRole, cidr, port}', preview: 'always', risk: 'destructive' },
]

export interface LedgerColumn {
  key: string
  label: string
  example: string
}

export const AUDIT_LEDGER_COLUMNS: readonly LedgerColumn[] = [
  { key: 'ts', label: 'TIMESTAMP', example: 'YYYY-MM-DD HH:MM:SS' },
  { key: 'op', label: 'OPERATION', example: 'svc.restart' },
  { key: 'target', label: 'TARGET CLASS', example: 'WEB TIER, 1 OF 3' },
  { key: 'delta', label: 'PREVIEW DELTA', example: '+1 unit, 0 config drift' },
  { key: 'decision', label: 'DECISION', example: 'HUMAN or POLICY id' },
  { key: 'verify', label: 'VERIFICATION', example: 'smoke: pass' },
]

export interface AllowedFlow {
  from: string
  to: string
  spec: string
  note?: string
}

export const ALLOWED_FLOWS: readonly AllowedFlow[] = [
  { from: 'PUBLIC', to: 'EDGE', spec: '443/tcp HTTPS only, TLS SNI required' },
  { from: 'EDGE', to: 'CORE', spec: 'documented service ports', note: 'stateful return traffic only' },
  { from: 'CORE', to: 'DATA', spec: 'documented CIDR, service accounts only', note: 'no shared credential with the application' },
  { from: 'CORE', to: 'ANNEX (AI)', spec: 'unix socket, read-only' },
]

export const QUESTIONS: readonly {
  id: string
  question: string
  hint: string
  consequence: string
}[] = [
  {
    id: 'audience',
    question: 'Who is this actually for?',
    hint: 'Name a person, not a persona.',
    consequence: 'The service level is set by who notices when it breaks.',
  },
  {
    id: 'irreplaceable',
    question: 'What data cannot be recreated?',
    hint: 'Name the folder or the record.',
    consequence: 'Recovery, not storage, is where that data survives.',
  },
  {
    id: 'availability',
    question: 'What must keep working when you are away?',
    hint: 'Name the hour, not the aspiration.',
    consequence: 'That list is the local-first side of the design.',
  },
]

export interface Destination {
  id: string
  label: string
  addWhen: string
}

export const DESTINATIONS: readonly Destination[] = [
  { id: 'learn', label: 'LEARN', addWhen: 'When you can name the first workload and its owner.' },
  { id: 'value', label: 'CREATE VALUE', addWhen: 'When someone else depends on the service you keep.' },
  { id: 'resilience', label: 'ADD RESILIENCE', addWhen: 'When downtime has a cost you can name.' },
  { id: 'automation', label: 'ADD BOUNDED AUTOMATION', addWhen: 'When the operating loop is provable and the change surface is narrow.' },
]

export interface PipelineStep {
  key: string
  label: string
  note: string
}

export const PIPELINE_STEPS: readonly PipelineStep[] = [
  { key: 'observe', label: 'OBSERVE', note: 'read authoritative and live sources' },
  { key: 'reconcile', label: 'RECONCILE', note: 'name the difference between them' },
  { key: 'preview', label: 'PREVIEW', note: 'return the exact proposed change' },
  { key: 'constrain', label: 'CONSTRAIN', note: 'policy and typed tools decide' },
  { key: 'verify', label: 'VERIFY', note: 'prove the live outcome' },
  { key: 'record', label: 'RECORD', note: 'write the durable evidence' },
]

export interface RecommendationSource {
  chapter: string
  claim: string
}

export const RECOMMENDATION_SOURCES: readonly RecommendationSource[] = [
  { chapter: 'docs/01-plan.md', claim: 'Write the first three outcomes. Constraint list.' },
  { chapter: 'docs/02-hardware.md', claim: 'Buy for role. Do not place the only backup inside the same chassis, pool, account, or power domain as the source.' },
  { chapter: 'docs/04-networking.md', claim: 'Semantic zones and default-deny between them.' },
  { chapter: 'docs/05-storage-backup.md', claim: '3-2-1-1-0 targets. RAID is availability, not backup.' },
  { chapter: 'docs/06-security.md', claim: 'Preserve an independent recovery path for the identity service.' },
  { chapter: 'docs/08-operations.md', claim: 'Run at least one critical check outside the primary failure domain.' },
  { chapter: 'docs/09-automation.md', claim: 'Preview, approval, verification for mutations. Machine-readable operations.' },
  { chapter: 'docs/10-ai-agentic.md', claim: 'Bound every objective with scope, iteration, cost, durable state, and a human stop condition.' },
]

export const FIELD_NOTE_LINES: readonly string[] = [
  'I did not give a model shell access on day one.',
  'I gave it read-only observation, then the same typed operations I already trusted.',
  'The ledger below is the shape of that trust, not a record of any real system.',
]
