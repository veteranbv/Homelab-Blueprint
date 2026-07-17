import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PLATES } from './models'
import { Plate01Questions } from './Plate01Questions'
import { Plate02OneHost } from './Plate02OneHost'
import { Plate03Boundaries } from './Plate03Boundaries'
import { Plate04Recovery } from './Plate04Recovery'
import { Plate05Loop } from './Plate05Loop'
import type { PlateId, Theme } from './types'

interface PlateProps {
  theme: Theme
  failure: 'none'
  reducedMotion: boolean
}

const COMPONENTS: Record<PlateId, ComponentType<PlateProps>> = {
  'plate-01': Plate01Questions,
  'plate-02': Plate02OneHost,
  'plate-03': Plate03Boundaries,
  'plate-04': Plate04Recovery,
  'plate-05': Plate05Loop,
}

export interface RenderedPlate {
  id: PlateId
  theme: Theme
  svg: string
}

export function renderAll(): RenderedPlate[] {
  const results: RenderedPlate[] = []
  for (const plate of PLATES) {
    const Component = COMPONENTS[plate.id]
    for (const theme of ['light', 'dark'] as const) {
      const element = createElement(Component, { theme, failure: 'none', reducedMotion: true })
      const svg = renderToStaticMarkup(element)
      results.push({ id: plate.id, theme, svg })
    }
  }
  return results
}
