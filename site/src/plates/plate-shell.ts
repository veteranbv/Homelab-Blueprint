import type { Theme } from './types'

export const PLATE_WIDTH = 1600
export const PLATE_HEIGHT = 1000
export const TITLE_BLOCK_HEIGHT = 108
export const SHEET_MARGIN = 48
export const SAFE_LEFT = SHEET_MARGIN
export const SAFE_RIGHT = PLATE_WIDTH - SHEET_MARGIN
export const BODY_TOP = TITLE_BLOCK_HEIGHT + 32
export const BODY_BOTTOM = PLATE_HEIGHT - SHEET_MARGIN

const LIGHT_TOKENS = {
  paper: '#F1EBDD',
  paperTint: '#E6DECA',
  paperElevated: '#F7F1E1',
  ink: '#181613',
  inkSoft: '#7A7261',
  hairline: '#BFB49B',
  warn: '#A83521',
  verify: '#2B5D4A',
}

const DARK_TOKENS = {
  paper: '#12141A',
  paperTint: '#191C24',
  paperElevated: '#20242E',
  ink: '#F0EAD8',
  inkSoft: '#95917E',
  hairline: '#40434D',
  warn: '#E6704F',
  verify: '#7AC0A0',
}

export function plateTokens(theme: Theme) {
  return theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS
}

const SERIF = "'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, ui-serif, Georgia, serif"
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"

export function plateStyleBlock(theme: Theme, reducedMotion: boolean) {
  const t = plateTokens(theme)
  return `
    .plate-paper { fill: ${t.paper}; }
    .plate-paper-tint { fill: ${t.paperTint}; }
    .plate-paper-elevated { fill: ${t.paperElevated}; }
    .plate-ink { fill: ${t.ink}; }
    .plate-ink-soft { fill: ${t.inkSoft}; }
    .plate-warn { fill: ${t.warn}; }
    .plate-verify { fill: ${t.verify}; }
    .plate-stroke { stroke: ${t.ink}; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .plate-stroke-soft { stroke: ${t.inkSoft}; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .plate-stroke-hairline { stroke: ${t.hairline}; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .plate-stroke-warn { stroke: ${t.warn}; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .plate-stroke-verify { stroke: ${t.verify}; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .plate-fill-paper { fill: ${t.paper}; }
    .plate-fill-tint { fill: ${t.paperTint}; }
    .plate-fill-elevated { fill: ${t.paperElevated}; }
    .w05 { stroke-width: 0.6; }
    .w1  { stroke-width: 1.1; }
    .w15 { stroke-width: 1.6; }
    .w25 { stroke-width: 2.4; }
    .w4  { stroke-width: 3.6; }
    .t-plate-number { font-family: ${SERIF}; font-size: 44px; font-weight: 600; letter-spacing: -0.02em; fill: ${t.ink}; }
    .t-plate-name   { font-family: ${SANS};  font-size: 13px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; fill: ${t.inkSoft}; }
    .t-plate-title  { font-family: ${SERIF}; font-size: 36px; font-weight: 500; letter-spacing: -0.02em; fill: ${t.ink}; }
    .t-teaching     { font-family: ${SERIF}; font-style: italic; font-size: 19px; fill: ${t.ink}; }
    .t-revision     { font-family: ${MONO};  font-size: 11px; letter-spacing: 0.08em; fill: ${t.inkSoft}; }
    .t-callout      { font-family: ${SERIF}; font-style: italic; font-size: 15px; fill: ${t.ink}; }
    .t-label        { font-family: ${SANS};  font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; fill: ${t.ink}; }
    .t-label-soft   { font-family: ${SANS};  font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; fill: ${t.inkSoft}; }
    .t-body         { font-family: ${SANS};  font-size: 13px; fill: ${t.ink}; }
    .t-body-soft    { font-family: ${SANS};  font-size: 13px; fill: ${t.inkSoft}; }
    .t-mono         { font-family: ${MONO};  font-size: 12px; fill: ${t.ink}; }
    .t-mono-soft    { font-family: ${MONO};  font-size: 12px; fill: ${t.inkSoft}; }
    .t-mono-small   { font-family: ${MONO};  font-size: 10px; fill: ${t.inkSoft}; letter-spacing: 0.06em; }
    .t-stamp        { font-family: ${MONO};  font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
    .t-question     { font-family: ${SERIF}; font-style: italic; font-size: 28px; fill: ${t.ink}; }
    .t-question-hint{ font-family: ${SANS};  font-size: 12px; letter-spacing: 0.02em; fill: ${t.inkSoft}; }
    .t-destination  { font-family: ${SANS};  font-size: 15px; font-weight: 700; letter-spacing: 0.06em; fill: ${t.ink}; }
    .t-consequence  { font-family: ${SERIF}; font-style: italic; font-size: 13px; fill: ${t.inkSoft}; }
    .t-footer       { font-family: ${SERIF}; font-style: italic; font-size: 17px; fill: ${t.ink}; }
    .t-anchor       { font-family: ${MONO};  font-size: 11px; font-weight: 700; fill: ${t.ink}; letter-spacing: 0.02em; }
    .fade-in        { opacity: ${reducedMotion ? '1' : '0'}; ${reducedMotion ? '' : 'animation: plate-fade 380ms ease-out 200ms forwards;'} }
    .fade-in.d-1    { animation-delay: 260ms; }
    .fade-in.d-2    { animation-delay: 340ms; }
    .fade-in.d-3    { animation-delay: 420ms; }
    .fade-in.d-4    { animation-delay: 500ms; }
    .fade-in.d-5    { animation-delay: 580ms; }
    .cursor         { ${reducedMotion ? '' : 'animation: plate-blink 1200ms steps(2, end) infinite;'} }
    .failure-stamp  { transform-origin: center; ${reducedMotion ? '' : 'animation: plate-stamp 480ms cubic-bezier(0.2, 0.7, 0.2, 1) both;'} }
    @keyframes plate-fade { to { opacity: 1; } }
    @keyframes plate-blink { 50% { opacity: 0; } }
    @keyframes plate-stamp { from { opacity: 0; transform: scale(0.86) rotate(-6deg); } to { opacity: 1; transform: scale(1) rotate(-3deg); } }
    @media (prefers-reduced-motion: reduce) {
      .fade-in, .failure-stamp { animation: none !important; opacity: 1 !important; }
      .cursor { animation: none !important; }
    }
  `
}

export const REVISION_STAMP = 'REV 2026-07'
