import { joinApiPath, type SynthesizeRequest, type TtsProviderAdapter, type VoiceOption } from './types'
import { readApiError } from './fetchError'

/** xAI TTS has no model param — placeholder for config UI only. */
export const GROK_TTS_PLACEHOLDER_MODEL = 'xai-tts'

export const GROK_FALLBACK_VOICES: VoiceOption[] = [
  { id: 'eve', label: 'Eve' },
  { id: 'ara', label: 'Ara' },
  { id: 'rex', label: 'Rex' },
  { id: 'sal', label: 'Sal' },
  { id: 'leo', label: 'Leo' },
]

function grokSpeed(rate: number): number {
  return Math.max(0.7, Math.min(1.5, rate))
}

export const grokAdapter: TtsProviderAdapter = {
  id: 'grok',

  async listModels() {
    return [GROK_TTS_PLACEHOLDER_MODEL]
  },

  async listVoices(baseUrl, apiKey) {
    const res = await fetch(joinApiPath(baseUrl, '/v1/tts/voices'), {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) throw new Error(await readApiError(res))
    const data = (await res.json()) as {
      voices?: Array<{ voice_id?: string; id?: string; name?: string }>
    }
    const voices = (data.voices ?? []).map(v => ({
      id: v.voice_id ?? v.id ?? '',
      label: v.name ?? v.voice_id ?? v.id ?? '',
    })).filter(v => v.id)
    return voices.length ? voices : GROK_FALLBACK_VOICES
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
        speed: grokSpeed(req.rate),
      }),
    })
    if (!res.ok) throw new Error(await readApiError(res))

    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as { audio?: string; content_type?: string }
      if (data.audio) {
        const binary = atob(data.audio)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return new Blob([bytes], { type: data.content_type ?? 'audio/mpeg' })
      }
    }

    return res.blob()
  },
}