import { PLATES } from './models'
import { PLATE_WIDTH, SAFE_LEFT, plateTokens } from './plate-shell'
import { PlateShell } from './PlateShell'
import type { FailureId, Theme } from './types'

interface Plate03Props {
  theme: Theme
  failure: FailureId
  reducedMotion: boolean
}

const PLATE = PLATES[2]

const EDGE = { x: 100, y: 280, w: 240, h: 400 }
const CORE = { x: 400, y: 220, w: 480, h: 460 }
const DATA = { x: 940, y: 280, w: 340, h: 400 }
const ANNEX = { x: 1340, y: 340, w: 210, h: 180 }

const DOOR = {
  publicToEdge: { x: EDGE.x + EDGE.w / 2, y: EDGE.y, width: 60 },
  edgeToCore: { x: EDGE.x + EDGE.w, y: EDGE.y + EDGE.h / 2, width: 60 },
  coreToData: { x: DATA.x, y: DATA.y + DATA.h / 2, width: 60 },
  coreToAnnex: { x: CORE.x + CORE.w, y: 260, width: 40 },
}

const BRIDGE_Y = 200

function wallPath(
  rect: { x: number; y: number; w: number; h: number },
  doors: { side: 'top' | 'right' | 'left' | 'bottom'; at: number; width: number }[],
) {
  const { x, y, w, h } = rect
  const perSide: Record<'top' | 'right' | 'bottom' | 'left', number[]> = {
    top: [x, x + w],
    right: [y, y + h],
    bottom: [x, x + w],
    left: [y, y + h],
  }
  for (const door of doors) {
    perSide[door.side].push(door.at - door.width / 2, door.at + door.width / 2)
    perSide[door.side].sort((a, b) => a - b)
  }
  const paths: string[] = []
  const sides = ['top', 'right', 'bottom', 'left'] as const
  for (const side of sides) {
    const points = perSide[side]
    for (let i = 0; i < points.length; i += 2) {
      const a = points[i]
      const b = points[i + 1]
      if (side === 'top') paths.push(`M ${a} ${y} L ${b} ${y}`)
      if (side === 'right') paths.push(`M ${x + w} ${a} L ${x + w} ${b}`)
      if (side === 'bottom') paths.push(`M ${a} ${y + h} L ${b} ${y + h}`)
      if (side === 'left') paths.push(`M ${x} ${a} L ${x} ${b}`)
    }
  }
  return paths.join(' ')
}

interface ChipProps {
  cx: number
  cy: number
  lines: string[]
  width?: number
  padding?: number
}

function LabelChip({ cx, cy, lines, width = 220, padding = 10 }: ChipProps) {
  const lineHeight = 15
  const totalHeight = lines.length * lineHeight + padding * 2
  return (
    <g>
      <rect
        x={cx - width / 2}
        y={cy - totalHeight / 2}
        width={width}
        height={totalHeight}
        rx={2}
        className="plate-stroke-hairline w1 plate-fill-elevated"
      />
      {lines.map((line, index) => (
        <text
          key={index}
          x={cx}
          y={cy - totalHeight / 2 + padding + (index + 1) * lineHeight - 4}
          textAnchor="middle"
          className="t-mono-small"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

export function Plate03Boundaries({ theme, failure, reducedMotion }: Plate03Props) {
  const tokens = plateTokens(theme)
  const identityBroken = failure === 'identity'
  const internetBroken = failure === 'internet'

  return (
    <PlateShell plate={PLATE} theme={theme} failure={failure} reducedMotion={reducedMotion}>
      {/* Room descriptors above each room */}
      <g>
        <text x={EDGE.x + EDGE.w / 2} y={140} textAnchor="middle" className="t-label-soft">
          UNTRUSTED, EPHEMERAL
        </text>
        <text x={CORE.x + CORE.w / 2} y={140} textAnchor="middle" className="t-label-soft">
          TRUSTED, MAINTAINED
        </text>
        <text x={DATA.x + DATA.w / 2} y={140} textAnchor="middle" className="t-label-soft">
          IRREPLACEABLE, RECOVERABLE
        </text>
        <text x={ANNEX.x + ANNEX.w / 2} y={140} textAnchor="middle" className="t-label-soft">
          OPTIONAL ANNEX
        </text>
      </g>

      {/* PUBLIC label above EDGE */}
      <g>
        <text x={EDGE.x + EDGE.w / 2} y={EDGE.y - 44} textAnchor="middle" className="t-label">
          PUBLIC INTERNET
        </text>
        <path
          d={`M ${EDGE.x} ${EDGE.y - 32} L ${EDGE.x + EDGE.w} ${EDGE.y - 32}`}
          className="plate-stroke-hairline w05"
          strokeDasharray="4 6"
        />
      </g>

      {/* EDGE room, thin wall */}
      <g>
        <rect x={EDGE.x} y={EDGE.y} width={EDGE.w} height={EDGE.h} className="plate-fill-tint" />
        <path
          d={wallPath(EDGE, [
            { side: 'top', at: DOOR.publicToEdge.x, width: DOOR.publicToEdge.width },
            { side: 'right', at: DOOR.edgeToCore.y, width: DOOR.edgeToCore.width },
          ])}
          className={internetBroken ? 'plate-stroke-warn w25' : 'plate-stroke w25'}
        />
        <text x={EDGE.x + 16} y={EDGE.y + 26} className="t-label">
          EDGE
        </text>
        <text x={EDGE.x + EDGE.w - 16} y={EDGE.y + 26} textAnchor="end" className="t-mono-small">
          THIN WALL
        </text>

        <rect x={EDGE.x + 20} y={EDGE.y + 60} width={EDGE.w - 40} height={90} className="plate-stroke-hairline w15 plate-fill-elevated" />
        <text x={EDGE.x + EDGE.w / 2} y={EDGE.y + 90} textAnchor="middle" className="t-label">
          TLS TERMINATOR
        </text>
        <text x={EDGE.x + EDGE.w / 2} y={EDGE.y + 110} textAnchor="middle" className="t-body-soft">
          publishes,
        </text>
        <text x={EDGE.x + EDGE.w / 2} y={EDGE.y + 128} textAnchor="middle" className="t-body-soft">
          never authorizes
        </text>

        <rect x={EDGE.x + 20} y={EDGE.y + EDGE.h - 140} width={EDGE.w - 40} height={90} className="plate-stroke-hairline w15 plate-fill-elevated" />
        <text x={EDGE.x + EDGE.w / 2} y={EDGE.y + EDGE.h - 110} textAnchor="middle" className="t-label">
          REMOTE ACCESS MESH
        </text>
        <text x={EDGE.x + EDGE.w / 2} y={EDGE.y + EDGE.h - 90} textAnchor="middle" className="t-body-soft">
          no admin ports
        </text>
        <text x={EDGE.x + EDGE.w / 2} y={EDGE.y + EDGE.h - 72} textAnchor="middle" className="t-body-soft">
          exposed to the internet
        </text>
      </g>

      {/* CORE room, thick wall */}
      <g>
        <rect x={CORE.x} y={CORE.y} width={CORE.w} height={CORE.h} className="plate-fill-paper" />
        <path
          d={wallPath(CORE, [
            { side: 'left', at: DOOR.edgeToCore.y, width: DOOR.edgeToCore.width },
            { side: 'right', at: DOOR.coreToData.y, width: DOOR.coreToData.width },
            { side: 'right', at: DOOR.coreToAnnex.y, width: DOOR.coreToAnnex.width },
          ])}
          className="plate-stroke w4"
        />
        <text x={CORE.x + 20} y={CORE.y + 30} className="t-label">
          PRIVATE CORE
        </text>
        <text x={CORE.x + CORE.w - 20} y={CORE.y + 30} textAnchor="end" className="t-mono-small">
          THICK WALL
        </text>

        {/* COMPUTE */}
        <rect x={CORE.x + 40} y={CORE.y + 70} width={180} height={110} className="plate-stroke-hairline w15 plate-fill-elevated" />
        <text x={CORE.x + 130} y={CORE.y + 98} textAnchor="middle" className="t-label">
          COMPUTE
        </text>
        <text x={CORE.x + 130} y={CORE.y + 122} textAnchor="middle" className="t-body-soft">
          containers or VMs
        </text>
        <text x={CORE.x + 130} y={CORE.y + 142} textAnchor="middle" className="t-body-soft">
          one owner per service
        </text>
        <text x={CORE.x + 130} y={CORE.y + 162} textAnchor="middle" className="t-body-soft">
          patched on a schedule
        </text>

        {/* IDENTITY */}
        <rect
          x={CORE.x + 260}
          y={CORE.y + 70}
          width={180}
          height={110}
          className={identityBroken ? 'plate-stroke-warn w25 plate-fill-elevated' : 'plate-stroke-hairline w15 plate-fill-elevated'}
        />
        <text x={CORE.x + 350} y={CORE.y + 98} textAnchor="middle" className="t-label">
          IDENTITY
        </text>
        <text x={CORE.x + 350} y={CORE.y + 122} textAnchor="middle" className="t-body-soft">
          OIDC authority
        </text>
        <text x={CORE.x + 350} y={CORE.y + 142} textAnchor="middle" className="t-body-soft">
          break-glass sealed
        </text>
        <text x={CORE.x + 350} y={CORE.y + 162} textAnchor="middle" className="t-body-soft">
          recovery is independent
        </text>

        {/* NETWORK */}
        <rect x={CORE.x + 40} y={CORE.y + 210} width={400} height={100} className="plate-stroke-hairline w15 plate-fill-elevated" />
        <text x={CORE.x + 240} y={CORE.y + 236} textAnchor="middle" className="t-label">
          NETWORK
        </text>
        <text x={CORE.x + 240} y={CORE.y + 258} textAnchor="middle" className="t-body-soft">
          resolver, ingress routing, policy
        </text>
        <text x={CORE.x + 240} y={CORE.y + 278} textAnchor="middle" className="t-body-soft">
          two resolvers on independent domains
        </text>

        {/* OBSERVABILITY */}
        <rect x={CORE.x + 40} y={CORE.y + 340} width={400} height={90} className="plate-stroke-hairline w15 plate-fill-elevated" />
        <text x={CORE.x + 240} y={CORE.y + 366} textAnchor="middle" className="t-label">
          OBSERVABILITY
        </text>
        <text x={CORE.x + 240} y={CORE.y + 388} textAnchor="middle" className="t-body-soft">
          reachability, host health, job heartbeats
        </text>
        <text x={CORE.x + 240} y={CORE.y + 408} textAnchor="middle" className="t-body-soft">
          the alert path lives outside this zone
        </text>
      </g>

      {/* DATA room */}
      <g>
        <rect x={DATA.x} y={DATA.y} width={DATA.w} height={DATA.h} className="plate-fill-paper" />
        <path
          d={wallPath(DATA, [
            { side: 'left', at: DOOR.coreToData.y, width: DOOR.coreToData.width },
          ])}
          className="plate-stroke w4"
        />
        <text x={DATA.x + 20} y={DATA.y + 30} className="t-label">
          DATA
        </text>
        <text x={DATA.x + DATA.w - 20} y={DATA.y + 30} textAnchor="end" className="t-mono-small">
          THICK WALL, LOCKED
        </text>

        <text x={DATA.x + DATA.w / 2} y={DATA.y + 82} textAnchor="middle" className="t-label">
          STORAGE POOL
        </text>
        <text x={DATA.x + DATA.w / 2} y={DATA.y + 102} textAnchor="middle" className="t-body-soft">
          integrity, snapshots, recovery source
        </text>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={DATA.x + 40}
            y={DATA.y + 130 + i * 44}
            width={DATA.w - 80}
            height={34}
            className="plate-stroke-hairline w15 plate-fill-elevated"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <text
            key={i}
            x={DATA.x + 60}
            y={DATA.y + 152 + i * 44}
            className="t-mono-small"
          >
            {`DISK ${i + 1}`}
          </text>
        ))}

        <text x={DATA.x + DATA.w / 2} y={DATA.y + 290} textAnchor="middle" className="t-body-soft">
          The encrypted copy lives elsewhere.
        </text>
        <text x={DATA.x + DATA.w / 2} y={DATA.y + 308} textAnchor="middle" className="t-body-soft">
          See Plate 04 for the recovery chain.
        </text>
      </g>

      {/* ANNEX (AI plane) */}
      <g>
        <rect x={ANNEX.x} y={ANNEX.y} width={ANNEX.w} height={ANNEX.h} className="plate-fill-tint" />
        <rect
          x={ANNEX.x}
          y={ANNEX.y}
          width={ANNEX.w}
          height={ANNEX.h}
          className="plate-stroke w15"
          strokeDasharray="8 6"
          fill="none"
        />
        <text x={ANNEX.x + ANNEX.w / 2} y={ANNEX.y + 30} textAnchor="middle" className="t-label">
          AI ANNEX
        </text>
        <text x={ANNEX.x + ANNEX.w / 2} y={ANNEX.y + 50} textAnchor="middle" className="t-mono-small">
          OPTIONAL
        </text>
        <line x1={ANNEX.x + 20} y1={ANNEX.y + 66} x2={ANNEX.x + ANNEX.w - 20} y2={ANNEX.y + 66} className="plate-stroke-hairline w05" />
        <text x={ANNEX.x + ANNEX.w / 2} y={ANNEX.y + 96} textAnchor="middle" className="t-body-soft">
          Unplug without
        </text>
        <text x={ANNEX.x + ANNEX.w / 2} y={ANNEX.y + 114} textAnchor="middle" className="t-body-soft">
          losing household services
        </text>
        <text x={ANNEX.x + ANNEX.w / 2} y={ANNEX.y + 138} textAnchor="middle" className="t-body-soft">
          Separate power domain
        </text>
        <text x={ANNEX.x + ANNEX.w / 2} y={ANNEX.y + 156} textAnchor="middle" className="t-body-soft">
          from Core
        </text>
      </g>

      {/* Bridge CORE -> ANNEX (goes over top of DATA, entirely in the header lane) */}
      <g>
        <path
          d={`M ${CORE.x + CORE.w} ${DOOR.coreToAnnex.y} L ${CORE.x + CORE.w + 30} ${DOOR.coreToAnnex.y} L ${CORE.x + CORE.w + 30} ${BRIDGE_Y} L ${ANNEX.x + ANNEX.w / 2} ${BRIDGE_Y} L ${ANNEX.x + ANNEX.w / 2} ${ANNEX.y}`}
          className="plate-stroke-hairline w15"
          strokeDasharray="6 6"
          fill="none"
        />
      </g>

      {/* Door swing arcs, on hairline so they read as door hinges */}
      <g>
        {/* PUBLIC -> EDGE */}
        <path
          d={`M ${DOOR.publicToEdge.x - 24} ${EDGE.y} A 24 24 0 0 1 ${DOOR.publicToEdge.x + 24} ${EDGE.y}`}
          className="plate-stroke-hairline w05"
          fill="none"
        />
        {/* EDGE -> CORE */}
        <path
          d={`M ${EDGE.x + EDGE.w} ${DOOR.edgeToCore.y - 24} A 24 24 0 0 1 ${EDGE.x + EDGE.w} ${DOOR.edgeToCore.y + 24}`}
          className="plate-stroke-hairline w05"
          fill="none"
        />
        {/* CORE -> DATA */}
        <path
          d={`M ${DATA.x} ${DOOR.coreToData.y - 24} A 24 24 0 0 1 ${DATA.x} ${DOOR.coreToData.y + 24}`}
          className="plate-stroke-hairline w05"
          fill="none"
        />
      </g>

      {/* Door label chips, on paper-elevated background so they sit above any line */}
      <g>
        <LabelChip
          cx={DOOR.publicToEdge.x}
          cy={EDGE.y - 6}
          lines={['443/tcp, HTTPS only', 'TLS SNI required']}
          width={200}
        />
        <LabelChip
          cx={(EDGE.x + EDGE.w + CORE.x) / 2}
          cy={DOOR.edgeToCore.y}
          lines={['documented ports', 'stateful return only']}
          width={210}
        />
        <LabelChip
          cx={(CORE.x + CORE.w + DATA.x) / 2}
          cy={DOOR.coreToData.y}
          lines={['documented CIDR', 'service accounts only']}
          width={220}
        />
        <LabelChip
          cx={(CORE.x + CORE.w + 30 + ANNEX.x + ANNEX.w / 2) / 2}
          cy={BRIDGE_Y}
          lines={['unix socket, read-only']}
          width={220}
        />
      </g>

      {/* Lock on CORE -> DATA door */}
      <g transform={`translate(${(CORE.x + CORE.w + DATA.x) / 2} ${DOOR.coreToData.y + 62})`}>
        <rect
          x={-12}
          y={-6}
          width={24}
          height={20}
          className={identityBroken ? 'plate-stroke-warn w15 plate-fill-elevated' : 'plate-stroke w15 plate-fill-elevated'}
        />
        <path
          d="M -7 -6 L -7 -12 A 7 7 0 0 1 7 -12 L 7 -6"
          className={identityBroken ? 'plate-stroke-warn w15' : 'plate-stroke w15'}
          fill="none"
        />
        {identityBroken && (
          <text y={40} textAnchor="middle" className="t-stamp plate-warn" fill={tokens.warn}>
            BREAK-GLASS
          </text>
        )}
      </g>

      {/* Bottom default-policy strip */}
      <g>
        <rect
          x={SAFE_LEFT}
          y={840}
          width={PLATE_WIDTH - SAFE_LEFT * 2}
          height={112}
          className="plate-stroke w15 plate-fill-elevated"
        />
        <text x={SAFE_LEFT + 20} y={868} className="t-label">
          DEFAULT POLICY
        </text>
        <text x={SAFE_LEFT + 20} y={898} className="t-callout">
          Deny cross-zone. Allow named dependencies. Log denies with consequence.
        </text>
        <text x={SAFE_LEFT + 20} y={922} className="t-body-soft">
          Keep the management plane inside Private Core and reachable only from the mesh above.
        </text>
        <text x={PLATE_WIDTH - SAFE_LEFT - 20} y={868} textAnchor="end" className="t-mono-small">
          FLOW LABELS SIT ON PAPER CHIPS
        </text>
        <text x={PLATE_WIDTH - SAFE_LEFT - 20} y={898} textAnchor="end" className="t-mono-small">
          THE LOCK MARKS AN IDENTITY BOUNDARY
        </text>
        <text x={PLATE_WIDTH - SAFE_LEFT - 20} y={922} textAnchor="end" className="t-mono-small">
          THE DASHED WALL IS OPTIONAL
        </text>
      </g>

      {/* Failure caption */}
      {(identityBroken || internetBroken) && (
        <g className="fade-in">
          <rect
            x={SAFE_LEFT}
            y={790}
            width={PLATE_WIDTH - SAFE_LEFT * 2}
            height={30}
            fill="none"
            className="plate-stroke-warn w1"
          />
          <text
            x={SAFE_LEFT + 20}
            y={810}
            className="t-stamp plate-warn"
            fill={tokens.warn}
          >
            {identityBroken
              ? 'IDENTITY DOWN. Sealed break-glass credential preserves administrator access.'
              : 'UPLINK DOWN. Public door closed. Private mesh continues locally. Off-site copy pauses.'}
          </text>
        </g>
      )}
    </PlateShell>
  )
}
