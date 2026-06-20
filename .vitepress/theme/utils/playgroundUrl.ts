import { handbookLink } from './handbookLink'
import { normalizePagePath } from './normalizePagePath'

export interface PlaygroundLinkOptions {
  from?: string
  lang?: 'go' | 'csharp'
  code?: string
}

/** Build a playground URL with normalized handbook paths and correct base prefix. */
export function buildPlaygroundUrl(options: PlaygroundLinkOptions = {}): string {
  const params = new URLSearchParams()

  if (options.from) {
    params.set('from', normalizePagePath(options.from))
  }
  if (options.lang) {
    params.set('lang', options.lang)
  }
  if (options.code) {
    params.set('code', options.code)
  }

  const qs = params.toString()
  return handbookLink(`/playground${qs ? `?${qs}` : ''}`)
}