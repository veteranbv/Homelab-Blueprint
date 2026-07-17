import { PLATES, RESTORE_LEDGER_COLUMNS } from './models'
import { PLATE_WIDTH, SAFE_LEFT, SAFE_RIGHT, plateTokens } from './plate-shell'
import { PlateShell } from './PlateShell'
import type { FailureId, Theme } from './types'

interface Plate02Props {
  theme: Theme
  failure: FailureId
  reducedMotion: boolean
}

const PLATE = PLATES[1]

const ELEVATION_TOP = 210
const ELEVATION_BOTTOM = 690
const HOST = { x: 180, y: 300, w: 220, h: 330 }
const NAS = { x: 620, y: 300, w: 180, h: 330 }
const FAILURE_BOUNDARY_X = 520
const SHELF_Y = HOST.y + HOST.h
const LANE = { x: 900, y: 220, w: SAFE_RIGHT - 900, rowH: 96, rows: 5 }
const LEDGER = { x: SAFE_LEFT, y: 736, w: PLATE_WIDTH - SAFE_LEFT * 2, h: 216 }

interface Anchor {
  n: number
  targetX: number
  targetY: number
  label: string
  note: string
}

const ANCHORS: Anchor[] = [
  {
    n: 1,
    targetX: HOST.x + HOST.w - 4,
    targetY: HOST.y - 4,
    label: 'HEALTH INDICATOR',
    note: 'Green is reachable, not healthy.',
  },
  {
    n: 2,
    targetX: HOST.x - 4,
    targetY: HOST.y - 4,
    label: 'FAN AND POWER',
    note: 'This runs every hour. Idle draw is a choice.',
  },
  {
    n: 3,
    targetX: HOST.x - 4,
    targetY: SHELF_Y + 12,
    label: 'ONE OWNER, ONE SHELF',
    note: 'One documented recovery procedure.',
  },
  {
    n: 4,
    targetX: (HOST.x + HOST.w + NAS.x) / 2,
    targetY: HOST.y + 110,
    label: 'ACROSS THE BOUNDARY',
    note: 'Different circuit, different building.',
  },
  {
    n: 5,
    targetX: NAS.x + NAS.w + 4,
    targetY: SHELF_Y + 12,
    label: 'A POOL, NOT A BACKUP',
    note: 'A mirror is availability. The backup lives elsewhere.',
  },
]

interface AnchorMarkProps {
  cx: number
  cy: number
  n: number
}

function AnchorMark({ cx, cy, n }: AnchorMarkProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} className="plate-stroke w15 plate-fill-elevated" />
      <text x={cx} y={cy + 4} textAnchor="middle" className="t-anchor">
        {n}
      </text>
    </g>
  )
}

export function Plate02OneHost({ theme, failure, reducedMotion }: Plate02Props) {
  const tokens = plateTokens()
  const hostFailed = failure === 'host'
  const storageFailed = failure === 'storage'

  return (
    <PlateShell plate={PLATE} theme={theme} failure={failure} reducedMotion={reducedMotion}>
      {/* Failure-domain boundary */}
      <g>
        <line
          x1={FAILURE_BOUNDARY_X}
          y1={ELEVATION_TOP}
          x2={FAILURE_BOUNDARY_X}
          y2={ELEVATION_BOTTOM}
          className="plate-stroke-hairline w1"
          strokeDasharray="6 8"
        />
        <text x={FAILURE_BOUNDARY_X - 12} y={ELEVATION_TOP - 6} textAnchor="end" className="t-mono-small">
          FAILURE DOMAIN A
        </text>
        <text x={FAILURE_BOUNDARY_X + 12} y={ELEVATION_TOP - 6} className="t-mono-small">
          FAILURE DOMAIN B
        </text>
      </g>

      {/* Stick tenant */}
      <g>
        <circle cx={HOST.x + HOST.w / 2} cy={230} r={16} className="plate-stroke w15" fill="none" />
        <path
          d={`M ${HOST.x + HOST.w / 2 - 24} 282 C ${HOST.x + HOST.w / 2 - 20} 254 ${HOST.x + HOST.w / 2 + 20} 254 ${HOST.x + HOST.w / 2 + 24} 282`}
          className="plate-stroke w15"
        />
        <text x={HOST.x + HOST.w / 2 + 40} y={252} className="t-label-soft">
          TENANT
        </text>
        <text x={HOST.x + HOST.w / 2 + 40} y={268} className="t-mono-small">
          THE PERSON THE SERVICE IS FOR
        </text>
      </g>

      {/* Host elevation */}
      <g>
        {/* Shelf */}
        <line
          x1={HOST.x - 30}
          y1={SHELF_Y}
          x2={HOST.x + HOST.w + 30}
          y2={SHELF_Y}
          className="plate-stroke w25"
        />

        <rect
          x={HOST.x}
          y={HOST.y}
          width={HOST.w}
          height={HOST.h}
          className="plate-stroke w25 plate-fill-elevated"
        />
        {/* Fan grille (light concentric arcs, not a dark dot cluster) */}
        <g>
          <circle
            cx={HOST.x + 44}
            cy={HOST.y + 44}
            r={26}
            className="plate-stroke-hairline w1"
          />
          <circle
            cx={HOST.x + 44}
            cy={HOST.y + 44}
            r={17}
            className="plate-stroke-hairline w05"
          />
          <circle
            cx={HOST.x + 44}
            cy={HOST.y + 44}
            r={4}
            className="plate-stroke w1 plate-fill-tint"
          />
          {/* four blade indicators */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * Math.PI) / 2 + Math.PI / 4
            const x1 = HOST.x + 44 + Math.cos(angle) * 6
            const y1 = HOST.y + 44 + Math.sin(angle) * 6
            const x2 = HOST.x + 44 + Math.cos(angle) * 24
            const y2 = HOST.y + 44 + Math.sin(angle) * 24
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="plate-stroke-hairline w05"
              />
            )
          })}
        </g>
        {/* Bezel divider */}
        <line
          x1={HOST.x + 20}
          y1={HOST.y + 132}
          x2={HOST.x + HOST.w - 20}
          y2={HOST.y + 132}
          className="plate-stroke-hairline w05"
        />
        {/* Screen area (subtle rectangle for a service surface) */}
        <rect
          x={HOST.x + 24}
          y={HOST.y + 152}
          width={HOST.w - 48}
          height={110}
          className="plate-stroke-hairline w1 plate-fill-tint"
        />
        <line x1={HOST.x + 36} y1={HOST.y + 174} x2={HOST.x + HOST.w - 36} y2={HOST.y + 174} className="plate-stroke-hairline w05" />
        <line x1={HOST.x + 36} y1={HOST.y + 194} x2={HOST.x + HOST.w - 60} y2={HOST.y + 194} className="plate-stroke-hairline w05" />
        <line x1={HOST.x + 36} y1={HOST.y + 214} x2={HOST.x + HOST.w - 80} y2={HOST.y + 214} className="plate-stroke-hairline w05" />
        <line x1={HOST.x + 36} y1={HOST.y + 234} x2={HOST.x + HOST.w - 50} y2={HOST.y + 234} className="plate-stroke-hairline w05" />
        <text
          x={HOST.x + HOST.w - 24}
          y={HOST.y + 148}
          textAnchor="end"
          className="t-mono-small"
        >
          ONE FLAGSHIP SERVICE
        </text>
        {/* Status LED */}
        <circle
          cx={HOST.x + HOST.w - 22}
          cy={HOST.y + 22}
          r={5}
          fill={hostFailed ? tokens.warn : tokens.verify}
        />
        {/* Ports row */}
        <g>
          <rect x={HOST.x + 20} y={HOST.y + HOST.h - 38} width={44} height={16} className="plate-stroke-hairline w1 plate-fill-tint" />
          <rect x={HOST.x + 76} y={HOST.y + HOST.h - 38} width={30} height={16} className="plate-stroke-hairline w1 plate-fill-tint" />
          <circle cx={HOST.x + HOST.w - 28} cy={HOST.y + HOST.h - 30} r={6} className="plate-stroke-hairline w1 plate-fill-tint" />
        </g>
        <text x={HOST.x + HOST.w / 2} y={SHELF_Y + 24} textAnchor="middle" className="t-label">
          SVC HOST
        </text>
        <text x={HOST.x + HOST.w / 2} y={SHELF_Y + 42} textAnchor="middle" className="t-mono-small">
          ONE OWNER, ONE PATCH CADENCE
        </text>

        {hostFailed && (
          <g className="failure-stamp">
            <line x1={HOST.x + 16} y1={HOST.y + 16} x2={HOST.x + HOST.w - 16} y2={HOST.y + HOST.h - 16} className="plate-stroke-warn w4" />
            <line x1={HOST.x + HOST.w - 16} y1={HOST.y + 16} x2={HOST.x + 16} y2={HOST.y + HOST.h - 16} className="plate-stroke-warn w4" />
          </g>
        )}
      </g>

      {/* Backup link across the failure boundary (dashed, no interference) */}
      <g>
        <path
          d={`M ${HOST.x + HOST.w} ${HOST.y + 140} C ${HOST.x + HOST.w + 60} ${HOST.y + 140}, ${NAS.x - 60} ${NAS.y + 60}, ${NAS.x} ${NAS.y + 60}`}
          className="plate-stroke w15"
          fill="none"
          strokeDasharray="6 8"
        />
        <polygon
          points={`${NAS.x - 2},${NAS.y + 56} ${NAS.x + 10},${NAS.y + 60} ${NAS.x - 2},${NAS.y + 64}`}
          className="plate-ink"
        />
      </g>

      {/* NAS elevation */}
      <g>
        <line
          x1={NAS.x - 30}
          y1={NAS.y + NAS.h}
          x2={NAS.x + NAS.w + 30}
          y2={NAS.y + NAS.h}
          className="plate-stroke w25"
        />
        <rect
          x={NAS.x}
          y={NAS.y}
          width={NAS.w}
          height={NAS.h}
          className="plate-stroke w25 plate-fill-elevated"
        />
        {[0, 1].map((slot) => (
          <g key={slot}>
            <rect
              x={NAS.x + 20}
              y={NAS.y + 40 + slot * 76}
              width={NAS.w - 40}
              height={54}
              className="plate-stroke-hairline w1 plate-fill-tint"
            />
            <text x={NAS.x + 32} y={NAS.y + 68 + slot * 76} className="t-mono-small">
              {`DISK ${slot + 1}`}
            </text>
            <circle
              cx={NAS.x + NAS.w - 34}
              cy={NAS.y + 60 + slot * 76}
              r={5}
              fill={storageFailed ? tokens.warn : tokens.verify}
            />
          </g>
        ))}
        <rect
          x={NAS.x + 20}
          y={NAS.y + 210}
          width={NAS.w - 40}
          height={110}
          className="plate-stroke-hairline w1 plate-fill-tint"
        />
        <text x={NAS.x + NAS.w / 2} y={NAS.y + 236} textAnchor="middle" className="t-label-soft">
          MIRRORED POOL
        </text>
        <text x={NAS.x + NAS.w / 2} y={NAS.y + 258} textAnchor="middle" className="t-mono-small">
          SCRUB SCHEDULED
        </text>
        <text x={NAS.x + NAS.w / 2} y={NAS.y + 280} textAnchor="middle" className="t-mono-small">
          POOL IS AVAILABILITY
        </text>
        <text x={NAS.x + NAS.w / 2} y={NAS.y + 300} textAnchor="middle" className="t-mono-small">
          NOT A BACKUP
        </text>

        <text x={NAS.x + NAS.w / 2} y={NAS.y + NAS.h + 24} textAnchor="middle" className="t-label">
          NAS
        </text>
        <text x={NAS.x + NAS.w / 2} y={NAS.y + NAS.h + 42} textAnchor="middle" className="t-mono-small">
          SEPARATE POWER, SEPARATE OWNER
        </text>

        {storageFailed && (
          <g className="failure-stamp">
            <line x1={NAS.x + 16} y1={NAS.y + 16} x2={NAS.x + NAS.w - 16} y2={NAS.y + NAS.h - 16} className="plate-stroke-warn w4" />
            <line x1={NAS.x + NAS.w - 16} y1={NAS.y + 16} x2={NAS.x + 16} y2={NAS.y + NAS.h - 16} className="plate-stroke-warn w4" />
          </g>
        )}
      </g>

      {/* Anchor marks on objects */}
      {ANCHORS.map((anchor) => (
        <AnchorMark key={anchor.n} cx={anchor.targetX} cy={anchor.targetY} n={anchor.n} />
      ))}

      {/* Annotation lane on the right, fully inside the sheet */}
      <g>
        <line
          x1={LANE.x - 12}
          y1={LANE.y}
          x2={LANE.x - 12}
          y2={LANE.y + LANE.rowH * LANE.rows}
          className="plate-stroke-hairline w05"
        />
        <text x={LANE.x} y={LANE.y - 12} className="t-label-soft">
          FIELD ANNOTATIONS
        </text>
        {ANCHORS.map((anchor, index) => {
          const rowY = LANE.y + index * LANE.rowH
          return (
            <g key={anchor.n} className={`fade-in d-${Math.min(index + 1, 5)}`}>
              <circle cx={LANE.x + 12} cy={rowY + 16} r={11} className="plate-stroke w15 plate-fill-elevated" />
              <text x={LANE.x + 12} y={rowY + 20} textAnchor="middle" className="t-anchor">
                {anchor.n}
              </text>
              <text x={LANE.x + 34} y={rowY + 12} className="t-label">
                {anchor.label}
              </text>
              <text x={LANE.x + 34} y={rowY + 34} className="t-callout">
                {anchor.note}
              </text>
              <line
                x1={LANE.x - 12}
                y1={rowY + LANE.rowH - 12}
                x2={LANE.x + LANE.w - 16}
                y2={rowY + LANE.rowH - 12}
                className="plate-stroke-hairline w05"
              />
            </g>
          )
        })}
      </g>

      {/* Restore ledger */}
      <g>
        <rect
          x={LEDGER.x}
          y={LEDGER.y}
          width={LEDGER.w}
          height={LEDGER.h}
          className="plate-stroke w15 plate-fill-elevated"
        />
        <line
          x1={LEDGER.x}
          y1={LEDGER.y + 42}
          x2={LEDGER.x + LEDGER.w}
          y2={LEDGER.y + 42}
          className="plate-stroke-hairline w05"
        />
        <text x={LEDGER.x + 20} y={LEDGER.y + 28} className="t-label">
          RESTORE RECORD
        </text>
        <text x={LEDGER.x + 200} y={LEDGER.y + 28} className="t-body-soft">
          A restore record is proof. A backup job status is not.
        </text>
        <text
          x={LEDGER.x + LEDGER.w - 20}
          y={LEDGER.y + 28}
          textAnchor="end"
          className="t-stamp plate-warn"
          fill={tokens.warn}
        >
          EXAMPLE RECORD, SYNTHETIC
        </text>
        {RESTORE_LEDGER_COLUMNS.map((column, index) => {
          const columnCount = RESTORE_LEDGER_COLUMNS.length
          const columnWidth = (LEDGER.w - 40) / columnCount
          const x = LEDGER.x + 20 + index * columnWidth
          const captionLines = wrapCaption(columnHelp(column.key), 28)
          return (
            <g key={column.key}>
              <text x={x} y={LEDGER.y + 72} className="t-label-soft">
                {column.label}
              </text>
              <text x={x} y={LEDGER.y + 102} className="t-mono">
                {column.example}
              </text>
              <line
                x1={x - 6}
                y1={LEDGER.y + 118}
                x2={x + columnWidth - 20}
                y2={LEDGER.y + 118}
                className="plate-stroke-hairline w05"
              />
              {captionLines.map((line, lineIndex) => (
                <text
                  key={lineIndex}
                  x={x}
                  y={LEDGER.y + 140 + lineIndex * 18}
                  className="t-body-soft"
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })}
      </g>

      {/* Failure banner sits above the elevation, below the title block */}
      {(hostFailed || storageFailed) && (
        <g className="fade-in">
          <rect
            x={SAFE_LEFT}
            y={128}
            width={PLATE_WIDTH - SAFE_LEFT * 2}
            height={30}
            fill="none"
            className="plate-stroke-warn w1"
          />
          <text x={SAFE_LEFT + 16} y={148} className="t-stamp plate-warn" fill={tokens.warn}>
            {hostFailed
              ? 'SVC HOST DOWN. Alert path lives outside this host. Last proven restore still stands.'
              : 'STORAGE POOL DEGRADED. Restore from the copy, not from the pool.'}
          </text>
        </g>
      )}
    </PlateShell>
  )
}

function columnHelp(key: string): string {
  switch (key) {
    case 'date':
      return 'A date the person can find, not just a job id.'
    case 'source':
      return 'What was restored, by role.'
    case 'target':
      return 'Somewhere other than the source.'
    case 'checksum':
      return 'A verified match, not a job status.'
    case 'duration':
      return 'Real elapsed time on the day.'
    default:
      return ''
  }
}

function wrapCaption(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (current.length + word.length + 1 > maxCharsPerLine) {
      if (current) lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  return lines
}
