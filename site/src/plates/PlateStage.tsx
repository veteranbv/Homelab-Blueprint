import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { FAILURES, PLATES } from './models'
import { Plate01Questions } from './Plate01Questions'
import { Plate02OneHost } from './Plate02OneHost'
import { Plate03Boundaries } from './Plate03Boundaries'
import { Plate04Recovery } from './Plate04Recovery'
import { Plate05Loop } from './Plate05Loop'
import type { FailureId, PlateId, PlateManifestEntry, Theme } from './types'

interface PlateStageProps {
  theme: Theme
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const listener = () => setReduced(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])
  return reduced
}

function isPlateId(value: string): value is PlateId {
  return PLATES.some((plate) => plate.id === value)
}

function usePlateFromHash(): [PlateId, (id: PlateId) => void] {
  const [id, setId] = useState<PlateId>(() => {
    if (typeof window === 'undefined') return 'plate-01'
    const raw = window.location.hash.replace(/^#/, '')
    return isPlateId(raw) ? raw : 'plate-01'
  })
  const update = useCallback((next: PlateId) => {
    setId(next)
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', `#${next}`)
    }
  }, [])
  return [id, update]
}

function isFailureId(value: string): value is FailureId {
  return value === 'none' || FAILURES.some((failure) => failure.id === value)
}

function renderPlate(id: PlateId, theme: Theme, failure: FailureId, reducedMotion: boolean): ReactNode {
  switch (id) {
    case 'plate-01':
      return <Plate01Questions theme={theme} failure={failure} reducedMotion={reducedMotion} />
    case 'plate-02':
      return <Plate02OneHost theme={theme} failure={failure} reducedMotion={reducedMotion} />
    case 'plate-03':
      return <Plate03Boundaries theme={theme} failure={failure} reducedMotion={reducedMotion} />
    case 'plate-04':
      return <Plate04Recovery theme={theme} failure={failure} reducedMotion={reducedMotion} />
    case 'plate-05':
      return <Plate05Loop theme={theme} failure={failure} reducedMotion={reducedMotion} />
  }
}

interface PlateReaderProps {
  plate: PlateManifestEntry
  onInspect: () => void
}

function PlateReader({ plate, onInspect }: PlateReaderProps) {
  return (
    <div className="plate-reader" data-testid={`plate-reader-${plate.id}`}>
      <div className="plate-reader-head">
        <p className="plate-reader-eyebrow">{`Plate ${plate.number}, ${plate.eyebrow}`}</p>
        <h3 className="plate-reader-title">{plate.name}</h3>
        <p className="plate-reader-teaching">{plate.teachingPoint}</p>
      </div>
      <ol className="plate-reader-notes">
        {plate.mobileNotes.map((note, index) => (
          <li key={`${plate.id}-${index}`} className="plate-reader-note">
            <span className="plate-reader-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="plate-reader-body">
              <span className="plate-reader-label">{note.label}</span>
              <p className="plate-reader-text">{note.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="plate-inspect"
        onClick={onInspect}
        data-testid={`plate-inspect-${plate.id}`}
      >
        Inspect the full drawing
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  )
}

interface PlateInspectorProps {
  plate: PlateManifestEntry
  theme: Theme
  failure: FailureId
  reducedMotion: boolean
  open: boolean
  onClose: () => void
}

function PlateInspector({ plate, theme, failure, reducedMotion, open, onClose }: PlateInspectorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const onBackdropClick = useCallback((event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="plate-viewer"
      aria-labelledby={`plate-viewer-title-${plate.id}`}
      onClick={onBackdropClick}
    >
      <div className="plate-viewer-header">
        <div>
          <p className="plate-reader-eyebrow">{`Plate ${plate.number}`}</p>
          <h2 id={`plate-viewer-title-${plate.id}`} className="plate-viewer-title">
            {plate.name}
          </h2>
        </div>
        <button
          type="button"
          className="plate-viewer-close"
          onClick={onClose}
          aria-label="Close full drawing viewer"
        >
          Close
        </button>
      </div>
      <div className="plate-viewer-body">
        <div className="plate-viewer-canvas">
          {open ? renderPlate(plate.id, theme, failure, reducedMotion) : null}
        </div>
      </div>
      <p className="plate-viewer-hint">
        Scroll or drag to move across the drawing. Pinch to zoom on touch devices.
      </p>
    </dialog>
  )
}

export function PlateStage({ theme }: PlateStageProps) {
  const reducedMotion = useReducedMotion()
  const [activeId, setActiveId] = usePlateFromHash()
  const [failure, setFailure] = useState<FailureId>('none')
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const activatePlate = useCallback(
    (next: PlateId) => {
      setInspectorOpen(false)
      setActiveId(next)
    },
    [setActiveId],
  )

  const activeIndex = useMemo(() => PLATES.findIndex((plate) => plate.id === activeId), [activeId])
  const activePlate = PLATES[Math.max(0, activeIndex)]

  const applicableFailures = useMemo(
    () => FAILURES.filter((candidate) => candidate.applicablePlates.includes(activeId)),
    [activeId],
  )

  const effectiveFailure: FailureId = useMemo(() => {
    if (failure === 'none') return 'none'
    const applies = applicableFailures.some((candidate) => candidate.id === failure)
    return applies ? failure : 'none'
  }, [failure, applicableFailures])

  const effectiveFailureCopy = FAILURES.find((candidate) => candidate.id === effectiveFailure)

  const move = useCallback(
    (direction: -1 | 1) => {
      const next = (activeIndex + direction + PLATES.length) % PLATES.length
      activatePlate(PLATES[next].id)
    },
    [activeIndex, activatePlate],
  )

  const onTabsKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        move(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        move(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        activatePlate(PLATES[0].id)
      } else if (event.key === 'End') {
        event.preventDefault()
        activatePlate(PLATES[PLATES.length - 1].id)
      }
    },
    [activatePlate, move],
  )

  const onFailureChange = useCallback((value: string) => {
    if (isFailureId(value)) setFailure(value)
  }, [])

  const openInspector = useCallback(() => setInspectorOpen(true), [])
  const closeInspector = useCallback(() => setInspectorOpen(false), [])

  return (
    <section className="plate-stage" aria-labelledby="plate-stage-title" data-testid="plate-stage">
      <div className="plate-stage-heading">
        <div>
          <p className="eyebrow">A working drawing set</p>
          <h2 id="plate-stage-title">Five plates that carry the whole design.</h2>
        </div>
        <p>
          Each plate is one sheet from a working set. Move between them, then break a dependency to see which
          record still stands.
        </p>
      </div>

      <div className="plate-stage-shell">
        <div
          className="plate-tabs"
          role="tablist"
          aria-label="Plates"
          ref={listRef}
          onKeyDown={onTabsKeyDown}
        >
          {PLATES.map((plate) => {
            const isActive = plate.id === activeId
            return (
              <button
                key={plate.id}
                role="tab"
                type="button"
                id={`tab-${plate.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${plate.id}`}
                tabIndex={isActive ? 0 : -1}
                className={isActive ? 'plate-tab is-active' : 'plate-tab'}
                onClick={() => activatePlate(plate.id)}
              >
                <span className="plate-tab-number">{plate.number}</span>
                <span className="plate-tab-name">{plate.name}</span>
              </button>
            )
          })}
        </div>

        <div className="plate-controls">
          <div className="plate-info">
            <p className="eyebrow">{activePlate.eyebrow}</p>
            <h3>{activePlate.name}</h3>
            <p>{activePlate.teachingPoint}</p>
          </div>
          <div className="plate-failure">
            <label htmlFor="plate-failure-select">Simulate a failure</label>
            <select
              id="plate-failure-select"
              value={effectiveFailure}
              onChange={(event) => onFailureChange(event.target.value)}
            >
              <option value="none">No failure</option>
              {applicableFailures.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label}
                </option>
              ))}
            </select>
            <p className="plate-failure-lesson" aria-live="polite">
              {effectiveFailure === 'none'
                ? 'Select a dependency to see what still holds when it breaks.'
                : (effectiveFailureCopy?.lesson ?? '')}
            </p>
          </div>
        </div>

        <div
          key={activePlate.id}
          className={reducedMotion ? 'plate-canvas is-static' : 'plate-canvas'}
          role="tabpanel"
          id={`panel-${activePlate.id}`}
          aria-labelledby={`tab-${activePlate.id}`}
          data-testid={`plate-canvas-${activePlate.id}`}
        >
          {renderPlate(activePlate.id, theme, effectiveFailure, reducedMotion)}
        </div>

        <PlateReader plate={activePlate} onInspect={openInspector} />

        <ol className="plate-chapters">
          {activePlate.chapters.map((chapter) => (
            <li key={chapter}>
              <a href={`https://github.com/veteranbv/Homelab-Blueprint/blob/master/${chapter}`}>
                {chapter}
              </a>
            </li>
          ))}
        </ol>
      </div>

      <PlateInspector
        plate={activePlate}
        theme={theme}
        failure={effectiveFailure}
        reducedMotion={reducedMotion}
        open={inspectorOpen}
        onClose={closeInspector}
      />
    </section>
  )
}
