import { filterTtsModels, normalizeBaseUrl, type SynthesizeRequest, type TtsProviderAdapter } from './types'
import { readApiError } from './fetchError'

const FALLBACK_MODELS = ['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts']

export const OPENAI_VOICES = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'onyx',
  'nova',
  'sage',
  'shimmer',
  'verse',
]

export const openaiAdapter: TtsProviderAdapter = {
  id: 'openai',

  async listModels(baseUrl, apiKey) {
    const res = await fetch(`${normalizeBaseUrl(baseUrl)}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) throw new Error(await readApiError(res))
    const data = (await res.json()) as { data?: Array<{ id: string }> }
    const ids = (data.data ?? []).map(m => m.id)
    const filtered = filterTtsModels(ids)
    return filtered.length ? filtered : FALLBACK_MODELS
  },

  async synthesize(req: SynthesizeRequest) {
    const res = await fetch(`${normalizeBaseUrl(req.baseUrl)}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${req.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: req.model,
        input: req.text,
        voice: req.voiceId,
        speed: req.rate,
      }),
    })
    if (!res.ok) throw new Error(await readApiError(res))
    return res.blob()
  },
}