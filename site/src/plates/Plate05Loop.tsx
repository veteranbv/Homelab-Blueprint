import { AUDIT_LEDGER_COLUMNS, FIELD_NOTE_LINES, PIPELINE_STEPS, PLATES, TOOL_CARDS } from './models'
import { PLATE_WIDTH, SAFE_LEFT, SAFE_RIGHT, plateTokens } from './plate-shell'
import { PlateShell } from './PlateShell'
import type { FailureId, Theme } from './types'

interface Plate05Props {
  theme: Theme
  failure: FailureId
  reducedMotion: boolean
}

const PLATE = PLATES[4]

const NOTE = { x: SAFE_LEFT, y: 152, w: SAFE_RIGHT - SAFE_LEFT, h: 84 }
const CARDS = { x: SAFE_LEFT, y: 268, w: 336, cardH: 84, gap: 12 }
const PIPELINE = {
  boxW: 156,
  boxH: 74,
  topY: 274,
  bottomY: 620,
  colXs: [416, 604, 792],
}
const LEDGER = { x: 1000, y: 268, w: SAFE_RIGHT - 1000, h: 580 }
const RISK_TOKEN: Record<string, string> = {
  read: 'READ',
  reversible: 'REVERSIBLE',
  destructive: 'DESTRUCTIVE',
  physical: 'PHYSICAL',
}
const TOOL_SUMMARIES: Record<string, string> = {
  'svc.status': 'ask a service how it is doing',
  'svc.logs.tail': 'read recent lines from one service log',
  'svc.restart': 'restart one service with a preview',
  'backup.verify': 'ask the repo to prove a snapshot restores',
  'net.route.add': 'add one documented route with approval',
}

interface PipelineBox {
  key: string
  x: number
  y: number
  label: string
  step: string
}

function pipelineBoxes(): PipelineBox[] {
  const [observe, reconcile, preview, constrain, verify, record] = PIPELINE_STEPS
  return [
    { key: observe.key, x: PIPELINE.colXs[0], y: PIPELINE.topY, label: observe.label, step: '01' },
    { key: reconcile.key, x: PIPELINE.colXs[1], y: PIPELINE.topY, label: reconcile.label, step: '02' },
    { key: preview.key, x: PIPELINE.colXs[2], y: PIPELINE.topY, label: preview.label, step: '03' },
    { key: constrain.key, x: PIPELINE.colXs[2], y: PIPELINE.bottomY, label: constrain.label, step: '04' },
    { key: verify.key, x: PIPELINE.colXs[1], y: PIPELINE.bottomY, label: verify.label, step: '05' },
    { key: record.key, x: PIPELINE.colXs[0], y: PIPELINE.bottomY, label: record.label, step: '06' },
  ]
}

export function Plate05Loop({ theme, failure, reducedMotion }: Plate05Props) {
  const tokens = plateTokens()
  const inferenceDown = failure === 'inference'
  const identityDown = failure === 'identity'
  const boxes = pipelineBoxes()
  const pipelineMidY = (PIPELINE.topY + PIPELINE.boxH + PIPELINE.bottomY) / 2

  return (
    <PlateShell plate={PLATE} theme={theme} failure={failure} reducedMotion={reducedMotion}>
      {/* Field note */}
      <g>
        <text x={NOTE.x} y={NOTE.y - 8} className="t-label-soft">
          FIELD NOTE
        </text>
        <line x1={NOTE.x} y1={NOTE.y - 2} x2={NOTE.x + 40} y2={NOTE.y - 2} className="plate-stroke w15" />
        {FIELD_NOTE_LINES.map((line, index) => (
          <text
            key={index}
            x={NOTE.x}
            y={NOTE.y + 22 + index * 24}
            className="t-teaching"
          >
            {line}
          </text>
        ))}
        <text
          x={NOTE.x + NOTE.w}
          y={NOTE.y + 22}
          textAnchor="end"
          className="t-mono-small"
        >
          THE OWNER, 2026 REVIEW
        </text>
      </g>

      {/* Left column: typed tool cards */}
      <g>
        <text x={CARDS.x} y={CARDS.y - 14} className="t-label-soft">
          TYPED TOOLS
        </text>
        <text x={CARDS.x + CARDS.w} y={CARDS.y - 14} textAnchor="end" className="t-mono-small">
          RISK-CLASSIFIED
        </text>
        {TOOL_CARDS.map((card, index) => {
          const y = CARDS.y + index * (CARDS.cardH + CARDS.gap)
          const sealed = identityDown && card.risk !== 'read'
          return (
            <g key={card.name} className={`fade-in d-${Math.min(index + 1, 5)}`}>
              <rect
                x={CARDS.x}
                y={y}
                width={CARDS.w}
                height={CARDS.cardH}
                className={sealed ? 'plate-stroke-hairline w05 plate-fill-tint' : 'plate-stroke w15 plate-fill-elevated'}
              />
              <text x={CARDS.x + 16} y={y + 26} className="t-mono">
                {card.name}
              </text>
              <text x={CARDS.x + CARDS.w - 16} y={y + 26} textAnchor="end" className="t-mono-small">
                {RISK_TOKEN[card.risk]}
              </text>
              <line
                x1={CARDS.x + 16}
                y1={y + 38}
                x2={CARDS.x + CARDS.w - 16}
                y2={y + 38}
                className="plate-stroke-hairline w05"
              />
              <text x={CARDS.x + 16} y={y + 58} className="t-body-soft">
                {TOOL_SUMMARIES[card.name]}
              </text>
              <text x={CARDS.x + 16} y={y + 74} className="t-body-soft">
                <tspan className="t-label-soft">preview </tspan>
                <tspan>{card.preview}</tspan>
              </text>
              {sealed && (
                <g className="failure-stamp" transform={`translate(${CARDS.x + CARDS.w - 62} ${y + 62}) rotate(-10)`}>
                  <rect x={-36} y={-14} width={72} height={22} className="plate-stroke-warn w15 plate-fill-paper" />
                  <text x={0} y={2} textAnchor="middle" className="t-stamp plate-warn" fill={tokens.warn}>
                    SEALED
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </g>

      {/* Pipeline column */}
      <g>
        <text x={PIPELINE.colXs[0]} y={PIPELINE.topY - 22} className="t-label-soft">
          THE LOOP
        </text>
        <text x={PIPELINE.colXs[2] + PIPELINE.boxW} y={PIPELINE.topY - 22} textAnchor="end" className="t-mono-small">
          READ BROAD, CHANGE NARROW
        </text>

        {boxes.map((box) => (
          <g key={box.key}>
            <rect
              x={box.x}
              y={box.y}
              width={PIPELINE.boxW}
              height={PIPELINE.boxH}
              className="plate-stroke w25 plate-fill-elevated"
            />
            <text x={box.x + 12} y={box.y + 20} className="t-mono-small">
              {box.step}
            </text>
            <text x={box.x + PIPELINE.boxW / 2} y={box.y + PIPELINE.boxH / 2 + 8} textAnchor="middle" className="t-label">
              {box.label}
            </text>
          </g>
        ))}

        {/* Arrows top-row left-to-right */}
        {[0, 1].map((i) => {
          const from = PIPELINE.colXs[i] + PIPELINE.boxW
          const to = PIPELINE.colXs[i + 1]
          const y = PIPELINE.topY + PIPELINE.boxH / 2
          return (
            <g key={`top-arrow-${i}`}>
              <line x1={from} y1={y} x2={to - 8} y2={y} className="plate-stroke w1" />
              <polygon points={`${to - 10},${y - 5} ${to},${y} ${to - 10},${y + 5}`} className="plate-ink" />
            </g>
          )
        })}
        {/* Right-side down arrow: PREVIEW -> CONSTRAIN */}
        <g>
          <line
            x1={PIPELINE.colXs[2] + PIPELINE.boxW / 2}
            y1={PIPELINE.topY + PIPELINE.boxH}
            x2={PIPELINE.colXs[2] + PIPELINE.boxW / 2}
            y2={PIPELINE.bottomY - 8}
            className="plate-stroke w1"
          />
          <polygon
            points={`${PIPELINE.colXs[2] + PIPELINE.boxW / 2 - 5},${PIPELINE.bottomY - 10} ${PIPELINE.colXs[2] + PIPELINE.boxW / 2},${PIPELINE.bottomY} ${PIPELINE.colXs[2] + PIPELINE.boxW / 2 + 5},${PIPELINE.bottomY - 10}`}
            className="plate-ink"
          />
        </g>
        {/* Bottom row right-to-left arrows */}
        {[2, 1].map((i, idx) => {
          const from = PIPELINE.colXs[i]
          const to = PIPELINE.colXs[i - 1] + PIPELINE.boxW
          const y = PIPELINE.bottomY + PIPELINE.boxH / 2
          return (
            <g key={`bot-arrow-${idx}`}>
              <line x1={from} y1={y} x2={to + 8} y2={y} className="plate-stroke w1" />
              <polygon points={`${to + 10},${y - 5} ${to},${y} ${to + 10},${y + 5}`} className="plate-ink" />
            </g>
          )
        })}
        {/* Left-side loop back */}
        <g>
          <line
            x1={PIPELINE.colXs[0] + PIPELINE.boxW / 2}
            y1={PIPELINE.bottomY}
            x2={PIPELINE.colXs[0] + PIPELINE.boxW / 2}
            y2={PIPELINE.topY + PIPELINE.boxH + 8}
            className="plate-stroke w1"
          />
          <polygon
            points={`${PIPELINE.colXs[0] + PIPELINE.boxW / 2 - 5},${PIPELINE.topY + PIPELINE.boxH + 10} ${PIPELINE.colXs[0] + PIPELINE.boxW / 2},${PIPELINE.topY + PIPELINE.boxH} ${PIPELINE.colXs[0] + PIPELINE.boxW / 2 + 5},${PIPELINE.topY + PIPELINE.boxH + 10}`}
            className="plate-ink"
          />
        </g>

        {/* Policy gate diamond in the middle */}
        <g transform={`translate(${PIPELINE.colXs[1] + PIPELINE.boxW / 2} ${pipelineMidY})`}>
          <path
            d="M 0 -70 L 96 0 L 0 70 L -96 0 Z"
            className={identityDown ? 'plate-stroke-warn w4 plate-fill-elevated' : 'plate-stroke w25 plate-fill-elevated'}
          />
          <text y={-8} textAnchor="middle" className="t-label">
            POLICY GATE
          </text>
          <text y={16} textAnchor="middle" className="t-mono-small">
            HUMAN or POLICY
          </text>
          <text y={36} textAnchor="middle" className="t-body-soft">
            decides what runs
          </text>
          {identityDown && (
            <g className="failure-stamp" transform="translate(0 60) rotate(-6)">
              <rect x={-56} y={-14} width={112} height={22} className="plate-stroke-warn w15 plate-fill-paper" />
              <text y={2} textAnchor="middle" className="t-stamp plate-warn" fill={tokens.warn}>
                BREAK-GLASS
              </text>
            </g>
          )}
        </g>

        {/* Small legend below the pipeline */}
        <g>
          <text x={PIPELINE.colXs[0]} y={PIPELINE.bottomY + PIPELINE.boxH + 44} className="t-label-soft">
            EACH STEP, ONE JOB
          </text>
          <line
            x1={PIPELINE.colXs[0]}
            y1={PIPELINE.bottomY + PIPELINE.boxH + 54}
            x2={PIPELINE.colXs[2] + PIPELINE.boxW}
            y2={PIPELINE.bottomY + PIPELINE.boxH + 54}
            className="plate-stroke-hairline w05"
          />
          {PIPELINE_STEPS.map((step, index) => {
            const row = Math.floor(index / 2)
            const col = index % 2
            const x = PIPELINE.colXs[0] + col * 300
            const y = PIPELINE.bottomY + PIPELINE.boxH + 78 + row * 44
            return (
              <g key={step.key}>
                <text x={x} y={y} className="t-mono-small">
                  {`0${index + 1}  ${step.label}`}
                </text>
                <text x={x} y={y + 18} className="t-body-soft">
                  {step.note}
                </text>
              </g>
            )
          })}
        </g>

        {inferenceDown && (
          <g className="fade-in" transform={`translate(${boxes[0].x + PIPELINE.boxW / 2} ${boxes[0].y - 24})`}>
            <text textAnchor="middle" className="t-stamp plate-warn" fill={tokens.warn}>
              HUMAN OBSERVES
            </text>
          </g>
        )}
      </g>

      {/* Audit ledger on the right */}
      <g>
        <text x={LEDGER.x} y={LEDGER.y - 14} className="t-label-soft">
          AUDIT LEDGER
        </text>
        <text
          x={LEDGER.x + LEDGER.w}
          y={LEDGER.y - 14}
          textAnchor="end"
          className="t-stamp plate-warn"
          fill={tokens.warn}
        >
          EXAMPLE RECORD, SYNTHETIC
        </text>
        <rect
          x={LEDGER.x}
          y={LEDGER.y}
          width={LEDGER.w}
          height={LEDGER.h}
          className="plate-stroke w15 plate-fill-elevated"
        />
        <line
          x1={LEDGER.x + 20}
          y1={LEDGER.y + 40}
          x2={LEDGER.x + LEDGER.w - 20}
          y2={LEDGER.y + 40}
          className="plate-stroke-hairline w05"
        />
        <text x={LEDGER.x + 20} y={LEDGER.y + 28} className="t-label">
          COLUMNS OF THE RECORD
        </text>
        {AUDIT_LEDGER_COLUMNS.map((column, index) => {
          const y = LEDGER.y + 62 + index * 82
          return (
            <g key={column.key} className={`fade-in d-${Math.min(index + 1, 5)}`}>
              <text x={LEDGER.x + 20} y={y + 12} className="t-label-soft">
                {column.label}
              </text>
              <text x={LEDGER.x + 20} y={y + 34} className="t-mono">
                {column.example}
              </text>
              <text x={LEDGER.x + 20} y={y + 54} className="t-body-soft">
                {columnCommentary(column.key)}
              </text>
              <line
                x1={LEDGER.x + 20}
                y1={y + 68}
                x2={LEDGER.x + LEDGER.w - 20}
                y2={y + 68}
                className="plate-stroke-hairline w05"
              />
            </g>
          )
        })}

        <g>
          <text x={LEDGER.x + 20} y={LEDGER.y + LEDGER.h - 32} className="t-mono">
            next record ready
          </text>
          <rect
            x={LEDGER.x + 176}
            y={LEDGER.y + LEDGER.h - 44}
            width={8}
            height={14}
            className="cursor plate-ink"
          />
        </g>
      </g>

      {/* Bottom summary or failure banner */}
      <g>
        {inferenceDown ? (
          <text
            x={PLATE_WIDTH / 2}
            y={936}
            textAnchor="middle"
            className="t-stamp plate-warn"
            fill={tokens.warn}
          >
            INFERENCE DOWN. The loop still runs. The person proposes now.
          </text>
        ) : (
          <text x={PLATE_WIDTH / 2} y={936} textAnchor="middle" className="t-footer">
            Models propose. Policy decides. Typed tools constrain. Verified live state closes the record.
          </text>
        )}
      </g>
    </PlateShell>
  )
}

function columnCommentary(key: string): string {
  switch (key) {
    case 'ts':
      return 'A time a person can find, not just an id.'
    case 'op':
      return 'The name of the typed tool, not free text.'
    case 'target':
      return 'A role and count, never a hostname.'
    case 'delta':
      return 'The exact change the preview promised.'
    case 'decision':
      return 'Who or which policy said yes, and why.'
    case 'verify':
      return 'The smoke test that closed the record.'
    default:
      return ''
  }
}
