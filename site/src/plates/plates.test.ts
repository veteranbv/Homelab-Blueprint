import { describe, expect, it } from 'vitest'
import { AUDIT_LEDGER_COLUMNS, FAILURES, PLATES, RECOVERY_STAGES } from './models'
import { renderAll } from './render-entry'

describe('plate models', () => {
  it('carries five plates in order', () => {
    expect(PLATES.map((p) => p.id)).toEqual([
      'plate-01',
      'plate-02',
      'plate-03',
      'plate-04',
      'plate-05',
    ])
  })

  it('lists every failure with at least one plate it applies to', () => {
    for (const failure of FAILURES) {
      expect(failure.applicablePlates.length).toBeGreaterThan(0)
      for (const plateId of failure.applicablePlates) {
        expect(PLATES.some((p) => p.id === plateId)).toBe(true)
      }
    }
  })

  it('describes the recovery chain in the documented order', () => {
    expect(RECOVERY_STAGES.map((stage) => stage.id)).toEqual([
      'live',
      'export',
      'repository',
      'offsite',
      'proven',
    ])
  })

  it('lists the audit ledger columns with placeholder examples', () => {
    for (const column of AUDIT_LEDGER_COLUMNS) {
      expect(column.example).toBeTruthy()
    }
  })

  it('carries mobile notes on every plate so the mobile reader has content', () => {
    for (const plate of PLATES) {
      expect(plate.mobileNotes.length, `${plate.id} needs mobile notes`).toBeGreaterThanOrEqual(3)
      expect(plate.mobileNotes.length, `${plate.id} should have at most five mobile notes`).toBeLessThanOrEqual(5)
      for (const note of plate.mobileNotes) {
        expect(note.label, `${plate.id} note label is empty`).toBeTruthy()
        expect(note.text.length, `${plate.id} note text is empty`).toBeGreaterThan(0)
      }
    }
  })
})

describe('plate SSR', () => {
  const rendered = renderAll()

  it('produces one artifact per plate per theme', () => {
    expect(rendered).toHaveLength(PLATES.length * 2)
  })

  for (const plate of PLATES) {
    for (const theme of ['light', 'dark'] as const) {
      it(`renders ${plate.id} for the ${theme} theme`, () => {
        const artifact = rendered.find((r) => r.id === plate.id && r.theme === theme)
        if (!artifact) throw new Error(`${plate.id}/${theme} missing from renderAll output`)
        const svg = artifact.svg
        expect(svg).toContain('<svg')
        expect(svg).toContain('viewBox="0 0 1600 1000"')
        expect(svg).toContain(`data-plate="${plate.id}"`)
        expect(svg).toContain(`data-theme="${theme}"`)
        expect(svg).toContain(`Plate ${plate.number}`)
      })
    }
  }

  it('marks example records on the plates that carry them', () => {
    const carriesRecord = new Set(['plate-02', 'plate-04', 'plate-05'])
    for (const artifact of rendered) {
      if (!carriesRecord.has(artifact.id)) continue
      expect(
        artifact.svg.includes('EXAMPLE RECORD, SYNTHETIC'),
        `${artifact.id}/${artifact.theme} carries an example record but does not mark it synthetic`,
      ).toBe(true)
    }
  })

  it('never leaks an IP address literal', () => {
    const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g
    for (const artifact of rendered) {
      const matches = artifact.svg.match(ipPattern) ?? []
      expect(
        matches,
        `${artifact.id}/${artifact.theme} contained IP literals: ${matches.join(', ')}`,
      ).toEqual([])
    }
  })
})
