import { describe, expect, it } from 'vitest'
import { outcomes, recommendBlueprint } from './blueprint-data'

describe('blueprint recommendations', () => {
  it('keeps a one-host household path simple', () => {
    const result = recommendBlueprint({
      outcome: 'household',
      workload: 'one-host',
      irreplaceableData: true,
    })

    expect(result.foundation).toBe('Linux + Docker Compose')
    expect(result.sequence).toContain('Create an encrypted copy on another failure domain, then restore it.')
    expect(result.caution).toContain('measured limit')
  })

  it('keeps AI outside the core dependency chain', () => {
    const result = recommendBlueprint({
      outcome: 'ai',
      workload: 'mixed',
      irreplaceableData: false,
    })

    expect(result.foundation).toContain('Proxmox VE')
    expect(result.sequence.at(-1)).toContain('read-only')
    expect(result.caution).toContain('DNS')
  })

  it('warns that a cluster needs a named reason', () => {
    const result = recommendBlueprint({
      outcome: 'learn',
      workload: 'cluster',
      irreplaceableData: false,
    })

    expect(result.foundation).toContain('K3s')
    expect(result.caution).toContain('explicit scheduling')
  })
})

describe('editorial data', () => {
  it('offers four distinct outcomes', () => {
    expect(outcomes.map((outcome) => outcome.id)).toEqual([
      'learn',
      'household',
      'infrastructure',
      'ai',
    ])
  })

})
