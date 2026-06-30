import { joinApiPath, type SynthesizeRequest, type TtsProviderAdapter, type VoiceOption } from './types'
import { readApiError } from './fetchError'

const FALLBACK_VOICES: VoiceOption[] = [
  { id: 'eve', label: 'Eve' },
  { id: 'ara', label: 'Ara' },
  { id: 'rex', label: 'Rex' },
  { id: 'sal', label: 'Sal' },
  { id: 'leo', label: 'Leo' },
]

export const grokAdapter: TtsProviderAdapter = {
  id: 'grok',

  async listModels() {
    return ['grok-tts']
  },

  async listVoices(baseUrl, apiKey) {
    const res = await fetch(joinApiPath(baseUrl, '/v1/tts/voices'), {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) throw new Error(await readApiError(res))
    const data = (await res.json()) as { voices?: Array<{ id: string; name?: string }> }
    const voices = (data.voices ?? []).map(v => ({ id: v.id, label: v.name ?? v.id }))
    return voices.length ? voices : FALLBACK_VOICES
  },

  async synthesize(req: SynthesizeRequest) {
    const res = await fetch(joinApiPath(req.baseUrl, '/v1/tts'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${req.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: req.text,
        voice_id: req.voiceId,
        language: 'en',
      }),
    })
    if (!res.ok) throw new Error(await readApiError(res))
    return res.blob()
  },
}