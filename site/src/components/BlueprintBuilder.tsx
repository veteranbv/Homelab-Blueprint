import { useMemo, useState } from 'react'
import {
  outcomes,
  recommendBlueprint,
  type BlueprintChoice,
  type OutcomeId,
} from '../blueprint-data'

function isOutcomeId(value: string | null): value is OutcomeId {
  return outcomes.some((candidate) => candidate.id === value)
}

function readInitialChoice(): BlueprintChoice {
  if (typeof window === 'undefined') {
    return { outcome: 'household', workload: 'one-host', irreplaceableData: true }
  }
  const params = new URLSearchParams(window.location.search)
  const outcome = params.get('goal')
  const workload = params.get('workload')
  return {
    outcome: isOutcomeId(outcome) ? outcome : 'household',
    workload: workload === 'mixed' || workload === 'cluster' ? workload : 'one-host',
    irreplaceableData: params.get('data') !== 'disposable',
  }
}

export function BlueprintBuilder() {
  const [choice, setChoice] = useState<BlueprintChoice>(readInitialChoice)
  const [copied, setCopied] = useState(false)
  const recommendation = useMemo(() => recommendBlueprint(choice), [choice])

  const updateChoice = (nextChoice: BlueprintChoice) => {
    const params = new URLSearchParams()
    params.set('goal', nextChoice.outcome)
    params.set('workload', nextChoice.workload)
    params.set('data', nextChoice.irreplaceableData ? 'valuable' : 'disposable')
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    setChoice(nextChoice)
  }

  const copyMarkdown = async () => {
    const markdown = [
      `## ${recommendation.foundation}`,
      '',
      recommendation.caution,
      '',
      ...recommendation.sequence.map((step, index) => `${index + 1}. ${step}`),
      '',
      `Blueprint: ${window.location.href}`,
    ].join('\n')
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="builder-console">
      <div className="builder-questions">
        <fieldset>
          <legend><span>01</span> What outcome justifies this lab?</legend>
          <div className="outcome-options">
            {outcomes.map((outcome) => (
              <label key={outcome.id} className={choice.outcome === outcome.id ? 'is-selected' : ''}>
                <input
                  type="radio"
                  name="outcome"
                  value={outcome.id}
                  checked={choice.outcome === outcome.id}
                  onChange={() => updateChoice({ ...choice, outcome: outcome.id })}
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
            <legend><span>02</span> What must the platform do?</legend>
            {[
              ['one-host', 'Containers on one host'],
              ['mixed', 'Mixed VMs, passthrough, or isolation'],
              ['cluster', 'An explicit multi-node or Kubernetes goal'],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="workload"
                  checked={choice.workload === value}
                  onChange={() => updateChoice({ ...choice, workload: value as BlueprintChoice['workload'] })}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend><span>03</span> Can the data be recreated?</legend>
            <label>
              <input
                type="radio"
                name="data"
                checked={choice.irreplaceableData}
                onChange={() => updateChoice({ ...choice, irreplaceableData: true })}
              />
              No. Recovery is part of day one.
            </label>
            <label>
              <input
                type="radio"
                name="data"
                checked={!choice.irreplaceableData}
                onChange={() => updateChoice({ ...choice, irreplaceableData: false })}
              />
              Yes. Document how to rebuild it.
            </label>
          </fieldset>
        </div>
      </div>

      <section className="recommendation" aria-live="polite">
        <div className="recommendation-lead">
          <p className="eyebrow">Your starting architecture</p>
          <h2>{recommendation.foundation}</h2>
          <p>{recommendation.caution}</p>
          <button type="button" onClick={() => void copyMarkdown()}>
            {copied ? 'Copied as Markdown' : 'Copy as Markdown'}
          </button>
        </div>
        <ol>
          {recommendation.sequence.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>
    </div>
  )
}
