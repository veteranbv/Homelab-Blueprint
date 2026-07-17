import { PLATES } from '../plates/models'
import type { PlateId } from '../plates/types'

const slugs: Record<PlateId, string> = {
  'plate-01': '01-question-sheet',
  'plate-02': '02-one-useful-host',
  'plate-03': '03-trust-boundaries',
  'plate-04': '04-recovery-chain',
  'plate-05': '05-bounded-automation',
}

export function plateSlug(id: PlateId): string {
  return slugs[id]
}

export function plateFromSlug(slug: string) {
  return PLATES.find((plate) => slugs[plate.id] === slug)
}
