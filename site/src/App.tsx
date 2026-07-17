import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  documentUrl,
  journey,
  outcomes,
  recommendBlueprint,
  repositoryUrl,
  type BlueprintChoice,
  type OutcomeId,
} from './blueprint-data'
import { PlateStage } from './plates/PlateStage'

type Theme = 'light' | 'dark'

function readInitialTheme(): Theme {
  const stored = window.localStorage.getItem('blueprint-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function isOutcomeId(value: string | null): value is OutcomeId {
  return outcomes.some((candidate) => candidate.id === value)
}

function readInitialChoice(): BlueprintChoice {
  const params = new URLSearchParams(window.location.search)
  const outcome = params.get('goal')
  const workload = params.get('workload')
  return {
    outcome: isOutcomeId(outcome) ? outcome : 'household',
    workload: workload === 'mixed' || workload === 'cluster' ? workload : 'one-host',
    irreplaceableData: params.get('data') !== 'disposable',
  }
}

function Arrow() {
  return <span aria-hidden="true">→</span>
}

function SiteHeader({ theme, onThemeChange }: { theme: Theme; onThemeChange: () => void }) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Homelab Blueprint home">
        <span className="wordmark-mark" aria-hidden="true">HB</span>
        <span>Homelab Blueprint</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#plate-stage-title">Plates</a>
        <a href="#build">Build yours</a>
        <a href="#roadmap">Roadmap</a>
        <a href="#field-note">Field note</a>
        <button
          className="theme-toggle"
          type="button"
          onClick={onThemeChange}
          aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <a className="header-source" href={repositoryUrl}>Source <Arrow /></a>
      </nav>
    </header>
  )
}

function BlueprintBuilder() {
  const [choice, setChoice] = useState<BlueprintChoice>(readInitialChoice)
  const [copied, setCopied] = useState(false)
  const recommendation = useMemo(() => recommendBlueprint(choice), [choice])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('goal', choice.outcome)
    params.set('workload', choice.workload)
    params.set('data', choice.irreplaceableData ? 'valuable' : 'disposable')
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}#build`,
    )
    window.localStorage.setItem('blueprint-choice', JSON.stringify(choice))
  }, [choice])

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="builder" id="build" aria-labelledby="builder-title">
      <div className="section-intro">
        <p className="eyebrow">Make the blueprint yours</p>
        <h2 id="builder-title">Three choices cut through most homelab noise.</h2>
        <p>
          This does not pretend to know your rack. It gives you a sensible first sequence and the point
          where more complexity becomes justified.
        </p>
      </div>

      <form className="builder-form">
        <fieldset>
          <legend>1. What are you trying to get?</legend>
          <div className="outcome-options">
            {outcomes.map((outcome) => (
              <label
                key={outcome.id}
                className={choice.outcome === outcome.id ? 'is-selected' : ''}
              >
                <input
                  type="radio"
                  name="outcome"
                  value={outcome.id}
                  checked={choice.outcome === outcome.id}
                  onChange={() =>
                    setChoice((current) => ({ ...current, outcome: outcome.id }))
                  }
                />
                <span>{outcome.eyebrow}</span>
                <strong>{outcome.title}</strong>
                <small>{outcome.promise}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="choice-row">
          <fieldset>
            <legend>2. What must the platform do?</legend>
            <label>
              <input
                type="radio"
                name="workload"
                checked={choice.workload === 'one-host'}
                onChange={() =>
                  setChoice((current) => ({ ...current, workload: 'one-host' }))
                }
              />
              Containers on one host
            </label>
            <label>
              <input
                type="radio"
                name="workload"
                checked={choice.workload === 'mixed'}
                onChange={() =>
                  setChoice((current) => ({ ...current, workload: 'mixed' }))
                }
              />
              Mixed VMs, passthrough, or isolation
            </label>
            <label>
              <input
                type="radio"
                name="workload"
                checked={choice.workload === 'cluster'}
                onChange={() =>
                  setChoice((current) => ({ ...current, workload: 'cluster' }))
                }
              />
              Explicit multi-node or Kubernetes goal
            </label>
          </fieldset>
          <fieldset>
            <legend>3. Can the data be recreated?</legend>
            <label>
              <input
                type="radio"
                name="data"
                checked={choice.irreplaceableData}
                onChange={() =>
                  setChoice((current) => ({ ...current, irreplaceableData: true }))
                }
              />
              No. Recovery is part of day one.
            </label>
            <label>
              <input
                type="radio"
                name="data"
                checked={!choice.irreplaceableData}
                onChange={() =>
                  setChoice((current) => ({ ...current, irreplaceableData: false }))
                }
              />
              Yes. Document how to rebuild it.
            </label>
          </fieldset>
        </div>
      </form>

      <div className="recommendation">
        <div className="recommendation-lead">
          <p className="eyebrow">Your starting architecture</p>
          <h3>{recommendation.foundation}</h3>
          <p>{recommendation.caution}</p>
          <button type="button" onClick={() => void copyLink()}>
            {copied ? 'Link copied' : 'Copy this blueprint'}
          </button>
        </div>
        <ol>
          {recommendation.sequence.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Roadmap() {
  return (
    <section className="roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="section-intro">
        <p className="eyebrow">The build order</p>
        <h2 id="roadmap-title">Every chapter ends with evidence.</h2>
        <p>Read in order for a first build. Come back to one step when the lab gives you a reason.</p>
      </div>
      <div className="roadmap-list">
        {journey.map((step) => (
          <a key={step.number} href={documentUrl(step.document)} className="roadmap-step">
            <span className="roadmap-number">{step.number}</span>
            <span className="roadmap-phase">{step.phase}</span>
            <span className="roadmap-main">
              <strong>{step.title}</strong>
              <small>{step.decision}</small>
            </span>
            <span className="roadmap-proof">
              <span>Leave with</span>
              {step.deliverable}
            </span>
            <span className="roadmap-arrow" aria-hidden="true">→</span>
          </a>
        ))}
      </div>
    </section>
  )
}

function AgenticNote() {
  return (
    <section className="agentic" id="field-note" aria-labelledby="agentic-title">
      <div className="agentic-copy">
        <p className="eyebrow">A field note from the operator</p>
        <h2 id="agentic-title">The agent came last.</h2>
        <p>
          I did not start by giving a model shell access. I made the lab legible first: inventory, structured
          commands, dry runs, health gates, and recovery paths. Routine work got faster. Failures got easier to
          explain. The agent could use the same guarded operations I already trusted.
        </p>
        <a href={documentUrl('docs/10-ai-agentic.md')}>
          Read the agentic operations guide <Arrow />
        </a>
      </div>
      <ul className="agentic-signals">
        <li>
          <strong>Machine-readable operations first.</strong> A JSON-first CLI is useful long before AI enters.
        </li>
        <li>
          <strong>Preview, approve, verify.</strong> The three moves that separate a proposal from a change.
        </li>
        <li>
          <strong>Autonomy is a budget.</strong> Every loop has a scope, iteration cap, and human stop.
        </li>
      </ul>
    </section>
  )
}

function App() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('blueprint-theme', theme)
  }, [theme])

  const changeTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  )

  return (
    <>
      <SiteHeader theme={theme} onThemeChange={changeTheme} />
      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Homelab Blueprint · 2026 edition</p>
            <h1>
              A working <em>drawing set</em><br />for the useful home lab.
            </h1>
            <p className="hero-deck">
              Five plates cover the whole design: the question sheet, one useful host, trust boundaries, the
              recovery chain, and the loop that lets a person or an agent operate the lab without surprises.
            </p>
            <div className="hero-actions">
              <a href="#plate-stage-title">Open the plates</a>
              <a href="#build">Build your starting sequence</a>
            </div>
          </div>
          <div className="hero-aside">
            <p>One maintained host.</p>
            <p>One service someone uses.</p>
            <p>One restore that worked.</p>
            <span>That is already a real homelab.</span>
          </div>
        </section>

        <PlateStage theme={theme} />
        <BlueprintBuilder />
        <Roadmap />
        <AgenticNote />

        <section className="closing">
          <p className="eyebrow">Keep the decisions current</p>
          <h2>The tools will change. The questions hold up.</h2>
          <p>
            The recommendation registry tracks project health and review dates. The research notes explain
            the evidence behind each default.
          </p>
          <div>
            <a href={`${repositoryUrl}/blob/master/recommendations.toml`}>
              Browse recommendations <Arrow />
            </a>
            <a href={documentUrl('docs/research-notes.md')}>
              Read the research notes <Arrow />
            </a>
          </div>
        </section>
      </main>
      <footer>
        <span>Homelab Blueprint</span>
        <p>Prose and visuals: CC BY 4.0. Tooling: MIT.</p>
        <a href={repositoryUrl}>GitHub <Arrow /></a>
      </footer>
    </>
  )
}

export default App
