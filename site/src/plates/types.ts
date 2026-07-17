export type PlateId = 'plate-01' | 'plate-02' | 'plate-03' | 'plate-04' | 'plate-05'

export type Theme = 'light' | 'dark'

export type FailureId =
  | 'none'
  | 'host'
  | 'internet'
  | 'storage'
  | 'identity'
  | 'inference'

export interface FailureCopy {
  id: Exclude<FailureId, 'none'>
  label: string
  lesson: string
  applicablePlates: readonly PlateId[]
}

export interface MobileNote {
  label: string
  text: string
}

export interface PlateManifestEntry {
  id: PlateId
  number: string
  name: string
  eyebrow: string
  teachingPoint: string
  a11yDescription: string
  chapters: readonly string[]
  mobileNotes: readonly MobileNote[]
}
