import { PLATES, RECOVERY_STAGES } from './models'
import { PLATE_WIDTH, SAFE_LEFT, SAFE_RIGHT, plateTokens } from './plate-shell'
import { PlateShell } from './PlateShell'
import type { FailureId, Theme } from './types'

interface Plate04Props {
  theme: Theme
  failure: FailureId
  reducedMotion: boolean
}

const PLATE = PLATES[3]

const TIMELINE = { x: 120, top: 190, bottom: 770 }
const TABS = { x: 180, w: 940, first: 180, step: 118, height: 106 }
const NOTES = { x: 1180, w: SAFE_RIGHT - 1180 }

interface MarginNote {
  y: number
  label: string
  text: string
}

const NOTE_TEMPLATE: readonly { label: string; text: string }[] = [
  {
    label: 'ON LIVE DATA',
    text: 'The application owns this. Every step below survives it.',
  },
  {
    label: 'ON EXPORT',
    text: 'The application must be quiet, not writing, when the export runs.',
  },
  {
    label: 'ON REPOSITORY',
    text: 'The repository credential is not the application credential.',
  },
  {
    label: 'ON OFF-SITE',
    text: 'The copy is worth what it can be restored from, not what it holds.',
  },
  {
    label: 'ON PROVEN',
    text: 'A restore record on a clean target is the only proof that stands.',
  },
]

function noteAt(index: number): MarginNote {
  const template = NOTE_TEMPLATE[index]
  return {
    y: TABS.first + index * TABS.step + TABS.height / 2,
    label: template.label,
    text: template.text,
  }
}

export function Plate04Recovery({ theme, failure, reducedMotion }: Plate04Props) {
  const tokens = plateTokens()
  const internetBroken = failure === 'internet'
  const storageBroken = failure === 'storage'

  return (
    <PlateShell plate={PLATE} theme={theme} failure={failure} reducedMotion={reducedMotion}>
      {/* Timeline axis */}
      <g>
        <line x1={TIMELINE.x} y1={TIMELINE.top} x2={TIMELINE.x} y2={TIMELINE.bottom} className="plate-stroke w1" />
        <text x={TIMELINE.x} y={TIMELINE.top - 14} textAnchor="middle" className="t-label-soft">
          EARLIER
        </text>
        <text x={TIMELINE.x} y={TIMELINE.bottom + 22} textAnchor="middle" className="t-label-soft">
          LATER
        </text>
        {RECOVERY_STAGES.map((_, index) => {
          const y = TABS.first + index * TABS.step + TABS.height / 2
          return (
            <g key={index}>
              <line x1={TIMELINE.x - 10} y1={y} x2={TIMELINE.x + 10} y2={y} className="plate-stroke w15" />
              <text x={TIMELINE.x - 20} y={y + 4} textAnchor="end" className="t-mono-small">
                {`t${index + 1}`}
              </text>
            </g>
          )
        })}
      </g>

      {/* Filing tabs, stacked */}
      {RECOVERY_STAGES.map((stage, index) => {
        const tabY = TABS.first + index * TABS.step
        const tabX = TABS.x
        const tabW = TABS.w
        const isProven = index === RECOVERY_STAGES.length - 1
        const stageBroken =
          (stage.id === 'live' && storageBroken) || (stage.id === 'offsite' && internetBroken)
        return (
          <g key={stage.id} className={`fade-in d-${Math.min(index + 1, 5)}`}>
            <rect
              x={tabX}
              y={tabY}
              width={tabW}
              height={TABS.height}
              className={
                stageBroken
                  ? 'plate-stroke-warn w25 plate-fill-elevated'
                  : 'plate-stroke w15 plate-fill-elevated'
              }
            />
            {/* Tab step corner */}
            <path
              d={`M ${tabX + tabW - 84} ${tabY} L ${tabX + tabW - 64} ${tabY - 20} L ${tabX + tabW} ${tabY - 20} L ${tabX + tabW} ${tabY} Z`}
              className={stageBroken ? 'plate-stroke-warn w15 plate-fill-elevated' : 'plate-stroke w15 plate-fill-elevated'}
            />
            <text x={tabX + tabW - 42} y={tabY - 5} textAnchor="middle" className="t-mono-small">
              {stage.step}
            </text>

            {/* Row content */}
            <text x={tabX + 20} y={tabY + 30} className="t-label">
              {stage.title}
            </text>
            <text x={tabX + 20} y={tabY + 56} className="t-body">
              <tspan className="t-label-soft">HOLDS </tspan>
              <tspan>{stage.contains}</tspan>
            </text>
            <text x={tabX + 20} y={tabY + 76} className="t-body">
              <tspan className="t-label-soft">CREDENTIAL </tspan>
              <tspan>{stage.credential}</tspan>
            </text>
            <text x={tabX + 20} y={tabY + 96} className="t-body">
              <tspan className="t-label-soft">VERIFIED BY </tspan>
              <tspan>{stage.verifies}</tspan>
            </text>

            {/* Downward transition text between tabs */}
            {index < RECOVERY_STAGES.length - 1 && (
              <text
                x={tabX + 20}
                y={tabY + TABS.height + (TABS.step - TABS.height) / 2 + 4}
                className="t-mono-small"
              >
                {`↓  ${stage.transitionTo}`}
              </text>
            )}

            {isProven && (
              <g
                className="failure-stamp"
                transform={`translate(${tabX + tabW - 130} ${tabY + TABS.height / 2}) rotate(-4)`}
              >
                <rect x={-84} y={-20} width={168} height={40} fill="none" className="plate-stroke-verify w25" />
                <text y={6} textAnchor="middle" className="t-stamp plate-verify" fill={tokens.verify}>
                  PROVEN, DATED
                </text>
              </g>
            )}

            {stageBroken && (
              <g className="failure-stamp">
                <line
                  x1={tabX + 16}
                  y1={tabY + 16}
                  x2={tabX + tabW - 100}
                  y2={tabY + TABS.height - 16}
                  className="plate-stroke-warn w25"
                />
                <text
                  x={tabX + tabW - 100}
                  y={tabY + TABS.height - 16}
                  textAnchor="end"
                  className="t-stamp plate-warn"
                  fill={tokens.warn}
                >
                  {stage.id === 'live' ? 'POOL DEGRADED' : 'SHIPMENT PAUSED'}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Margin notes on the right, fully inside the sheet */}
      <g>
        <line x1={NOTES.x - 16} y1={TIMELINE.top} x2={NOTES.x - 16} y2={TIMELINE.bottom} className="plate-stroke-hairline w05" />
        <text x={NOTES.x} y={TIMELINE.top - 14} className="t-label-soft">
          FIELD ANNOTATIONS
        </text>
        {NOTE_TEMPLATE.map((_, index) => {
          const note = noteAt(index)
          const wrapped = wrap(note.text, 26)
          return (
            <g key={index} className={`fade-in d-${Math.min(index + 1, 5)}`}>
              <text x={NOTES.x} y={note.y - 22} className="t-label-soft">
                {note.label}
              </text>
              {wrapped.map((line, lineIndex) => (
                <text
                  key={lineIndex}
                  x={NOTES.x}
                  y={note.y - 2 + lineIndex * 18}
                  className="t-callout"
                >
                  {line}
                </text>
              ))}
              <line x1={NOTES.x} y1={note.y + TABS.step / 2 - 12} x2={NOTES.x + NOTES.w - 8} y2={note.y + TABS.step / 2 - 12} className="plate-stroke-hairline w05" />
            </g>
          )
        })}
      </g>

      {/* Example record footer */}
      <g>
        <rect
          x={SAFE_LEFT}
          y={796}
          width={PLATE_WIDTH - SAFE_LEFT * 2}
          height={148}
          className="plate-stroke w15 plate-fill-elevated"
        />
        <text x={SAFE_LEFT + 20} y={824} className="t-label">
          A RESTORE RECORD LOOKS LIKE THIS
        </text>
        <text
          x={PLATE_WIDTH - SAFE_LEFT - 20}
          y={824}
          textAnchor="end"
          className="t-stamp plate-warn"
          fill={tokens.warn}
        >
          EXAMPLE RECORD, SYNTHETIC
        </text>
        <line x1={SAFE_LEFT + 20} y1={836} x2={PLATE_WIDTH - SAFE_LEFT - 20} y2={836} className="plate-stroke-hairline w05" />
        <text x={SAFE_LEFT + 20} y={866} className="t-mono">
          date=YYYY-MM-DD    source=SVC HOST    target=CANARY HOST    bytes=NNN GiB
        </text>
        <text x={SAFE_LEFT + 20} y={890} className="t-mono">
          checksum=match    elapsed=HH:MM:SS    note=free-text field the operator fills in
        </text>
        <text x={SAFE_LEFT + 20} y={920} className="t-body-soft">
          Real records replace the placeholders. Values that would identify the lab stay out of public evidence.
        </text>
      </g>

      {/* Failure banner sits above the tab stack, below the title block */}
      {(internetBroken || storageBroken) && (
        <g className="fade-in">
          <rect
            x={SAFE_LEFT}
            y={124}
            width={PLATE_WIDTH - SAFE_LEFT * 2}
            height={30}
            fill="none"
            className="plate-stroke-warn w1"
          />
          <text x={SAFE_LEFT + 16} y={144} className="t-stamp plate-warn" fill={tokens.warn}>
            {internetBroken
              ? 'UPLINK DOWN. Shipment paused. The last PROVEN record still stands.'
              : 'LIVE POOL DEGRADED. Restore from the repository, not from the pool.'}
          </text>
        </g>
      )}
    </PlateShell>
  )
}

function wrap(text: string, maxCharsPerLine: number): string[] {
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
