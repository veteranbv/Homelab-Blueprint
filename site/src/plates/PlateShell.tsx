import { type ReactNode } from 'react'
import {
  PLATE_HEIGHT,
  PLATE_WIDTH,
  REVISION_STAMP,
  SHEET_MARGIN,
  TITLE_BLOCK_HEIGHT,
  plateStyleBlock,
  plateTokens,
} from './plate-shell'
import type { FailureId, PlateManifestEntry, Theme } from './types'

export interface PlateShellProps {
  plate: PlateManifestEntry
  theme: Theme
  failure: FailureId
  reducedMotion: boolean
  children: ReactNode
  showRevisionStamp?: boolean
}

export function PlateShell({
  plate,
  theme,
  failure,
  reducedMotion,
  children,
  showRevisionStamp = true,
}: PlateShellProps) {
  const filterId = `ink-${plate.id}`
  const gridId = `grid-${plate.id}`
  const titleId = `title-${plate.id}`
  const descId = `desc-${plate.id}`
  const t = plateTokens(theme)
  const revisionWidth = 168
  const revisionX = PLATE_WIDTH - SHEET_MARGIN - revisionWidth
  return (
    <svg
      className="plate-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${PLATE_WIDTH} ${PLATE_HEIGHT}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      data-plate={plate.id}
      data-theme={theme}
      data-failure={failure}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>{`Plate ${plate.number}, ${plate.name}`}</title>
      <desc id={descId}>{`${plate.teachingPoint} ${plate.a11yDescription}`}</desc>
      <defs>
        <style dangerouslySetInnerHTML={{ __html: plateStyleBlock(theme, reducedMotion) }} />
        <filter id={filterId} x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="1" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="0.45" />
        </filter>
        <pattern id={gridId} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" stroke={t.hairline} strokeOpacity="0.22" strokeWidth="0.5" fill="none" />
        </pattern>
      </defs>

      <rect width={PLATE_WIDTH} height={PLATE_HEIGHT} className="plate-paper" />
      <rect
        x={SHEET_MARGIN}
        y={SHEET_MARGIN}
        width={PLATE_WIDTH - SHEET_MARGIN * 2}
        height={PLATE_HEIGHT - SHEET_MARGIN * 2}
        fill={`url(#${gridId})`}
      />

      <g className="title-block">
        <line
          x1={SHEET_MARGIN}
          y1={TITLE_BLOCK_HEIGHT}
          x2={PLATE_WIDTH - SHEET_MARGIN}
          y2={TITLE_BLOCK_HEIGHT}
          className="plate-stroke w1"
        />
        <text x={SHEET_MARGIN} y={74} className="t-plate-number">
          {`PLATE ${plate.number}`}
        </text>
        <text x={SHEET_MARGIN} y={96} className="t-plate-name">
          {plate.eyebrow}
        </text>
        <text
          x={PLATE_WIDTH - SHEET_MARGIN}
          y={74}
          textAnchor="end"
          className="t-plate-title"
        >
          {plate.name}
        </text>
        {showRevisionStamp && (
          <g>
            <rect
              x={revisionX}
              y={82}
              width={revisionWidth}
              height={22}
              fill="none"
              className="plate-stroke-soft w1"
            />
            <text
              x={revisionX + revisionWidth / 2}
              y={98}
              textAnchor="middle"
              className="t-revision"
            >
              {REVISION_STAMP}
            </text>
          </g>
        )}
      </g>

      <g filter={`url(#${filterId})`} className="plate-body">
        {children}
      </g>
    </svg>
  )
}
