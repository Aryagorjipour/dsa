import type { CloudTtsProvider } from '../ttsSecretStore'

export interface VoiceOption {
  id: string
  label: string
}

export interface SynthesizeRequest {
  baseUrl: string
  apiKey: string
  model: string
  voiceId: string
  text: string
  rate: number
}

export interface TtsProviderAdapter {
  id: CloudTtsProvider
  listModels(baseUrl: string, apiKey: string): Promise<string[]>
  listVoices?(baseUrl: string, apiKey: string): Promise<VoiceOption[]>
  synthesize(req: SynthesizeRequest): Promise<Blob>
}

export function filterTtsModels(ids: string[]): string[] {
  const ttsHints = /tts|speech|audio|preview-tts/i
  return ids.filter(id => ttsHints.test(id)).sort()
}

export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

/** Join base URL with an API path; avoids `/v1/v1/...` when base already ends with `/v1`. */
export function joinApiPath(baseUrl: string, path: string): string {
  const base = normalizeBaseUrl(baseUrl)
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (/\/v1$/i.test(base) && normalized.startsWith('/v1/')) {
    return `${base}${normalized.slice(3)}`
  }
  if (/\/v1$/i.test(base) && normalized === '/v1') {
    return base
  }
  return `${base}${normalized}`
}