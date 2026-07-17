export const repositoryUrl = 'https://github.com/veteranbv/Homelab-Blueprint'
export const canonicalGuideBase = 'https://homelab.codes/guide'

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}` || '/'
}

export function chapterHref(id: string): string {
  return withBase(`/chapters/${id}/`)
}

export function canonicalUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${canonicalGuideBase}${normalized}`
}
