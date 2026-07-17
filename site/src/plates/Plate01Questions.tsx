import { DESTINATIONS, PLATES, QUESTIONS } from './models'
import { PlateShell } from './PlateShell'
import type { FailureId, Theme } from './types'

// Plate 01 does not need shell constants beyond what PlateShell already draws.

interface Plate01Props {
  theme: Theme
  failure: FailureId
  reducedMotion: boolean
}

const PLATE = PLATES[0]

const CARD_X = 96
const CARD_Y = 168
const CARD_W = 720
const CARD_H = 656
const CARD_ROTATION = -1.2

const STACK_X = 896
const STACK_Y = 168
const STACK_W = 616
const STACK_ROW_H = 148

export function Plate01Questions({ theme, failure, reducedMotion }: Plate01Props) {
  return (
    <PlateShell plate={PLATE} theme={theme} failure={failure} reducedMotion={reducedMotion}>
      <g transform={`translate(${CARD_X + CARD_W / 2} ${CARD_Y + CARD_H / 2}) rotate(${CARD_ROTATION}) translate(${-(CARD_X + CARD_W / 2)} ${-(CARD_Y + CARD_H / 2)})`}>
        <rect
          x={CARD_X}
          y={CARD_Y}
          width={CARD_W}
          height={CARD_H}
          rx={4}
          className="plate-fill-tint plate-stroke w15"
        />
        <line
          x1={CARD_X + 40}
          y1={CARD_Y + 44}
          x2={CARD_X + CARD_W - 40}
          y2={CARD_Y + 44}
          className="plate-stroke-hairline w05"
        />
        <text x={CARD_X + 40} y={CARD_Y + 34} className="t-label-soft">
          THREE QUESTIONS, IN ORDER
        </text>
        {QUESTIONS.map((question, index) => {
          const yBase = CARD_Y + 100 + index * 180
          return (
            <g key={question.id} className="fade-in" style={{ animationDelay: `${index * 140 + 260}ms` }}>
              <text x={CARD_X + 40} y={yBase} className="t-mono-small">
                {`0${index + 1}`}
              </text>
              <text x={CARD_X + 96} y={yBase} className="t-question">
                {question.question}
              </text>
              <line
                x1={CARD_X + 96}
                y1={yBase + 14}
                x2={CARD_X + 96 + question.question.length * 12.4}
                y2={yBase + 14}
                className="plate-stroke-soft w1"
                style={{ animationDelay: `${index * 140 + 400}ms` }}
              />
              <text x={CARD_X + 96} y={yBase + 44} className="t-question-hint">
                {question.hint}
              </text>
              <text x={CARD_X + 96} y={yBase + 82} className="t-consequence">
                {question.consequence}
              </text>
            </g>
          )
        })}
      </g>

      <g>
        <text x={STACK_X} y={CARD_Y - 8} className="t-label-soft">
          FOUR DESTINATIONS, IN ORDER
        </text>
        <text x={STACK_X + STACK_W} y={CARD_Y - 8} textAnchor="end" className="t-mono-small">
          STOP AT THE ONE THAT SOLVES YOUR PROBLEM
        </text>
        {DESTINATIONS.map((destination, index) => {
          const y = STACK_Y + index * STACK_ROW_H
          return (
            <g key={destination.id} className="fade-in" style={{ animationDelay: `${index * 100 + 320}ms` }}>
              <line
                x1={STACK_X}
                y1={y}
                x2={STACK_X + STACK_W}
                y2={y}
                className="plate-stroke w1"
                style={{ animationDelay: `${index * 100 + 200}ms` }}
              />
              <rect
                x={STACK_X + 8}
                y={y + 34}
                width={26}
                height={26}
                rx={2}
                className="plate-stroke w15 plate-fill-paper"
              />
              <text x={STACK_X + 62} y={y + 54} className="t-destination">
                {destination.label}
              </text>
              <text x={STACK_X + 62} y={y + 92} className="t-body-soft">
                {destination.addWhen}
              </text>
              <text
                x={STACK_X + STACK_W - 8}
                y={y + 54}
                textAnchor="end"
                className="t-mono-small"
              >
                {`0${index + 1}`}
              </text>
            </g>
          )
        })}
        <line
          x1={STACK_X}
          y1={STACK_Y + DESTINATIONS.length * STACK_ROW_H}
          x2={STACK_X + STACK_W}
          y2={STACK_Y + DESTINATIONS.length * STACK_ROW_H}
          className="plate-stroke w1"
          style={{ animationDelay: `${DESTINATIONS.length * 100 + 240}ms` }}
        />
      </g>

      <g className="fade-in" style={{ animationDelay: '700ms' }}>
        <line
          x1={48}
          y1={892}
          x2={1552}
          y2={892}
          className="plate-stroke-hairline w05"
        />
        <text x={800} y={932} textAnchor="middle" className="t-footer">
          Complexity is not progress by itself. Complexity is a cost you pay for a capability.
        </text>
      </g>
    </PlateShell>
  )
}
