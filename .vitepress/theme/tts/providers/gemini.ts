import { filterTtsModels, normalizeBaseUrl, type SynthesizeRequest, type TtsProviderAdapter, type VoiceOption } from './types'
import { readApiError } from './fetchError'

const FALLBACK_MODELS = ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts']

export const GEMINI_VOICES: VoiceOption[] = [
  { id: 'Kore', label: 'Kore' },
  { id: 'Puck', label: 'Puck' },
  { id: 'Charon', label: 'Charon' },
  { id: 'Fenrir', label: 'Fenrir' },
  { id: 'Aoede', label: 'Aoede' },
  { id: 'Leda', label: 'Leda' },
  { id: 'Orus', label: 'Orus' },
  { id: 'Zephyr', label: 'Zephyr' },
]

function b64ToBlob(b64: string, mimeType: string): Blob {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}

export const geminiAdapter: TtsProviderAdapter = {
  id: 'gemini',

  async listModels(baseUrl, apiKey) {
    const res = await fetch(`${normalizeBaseUrl(baseUrl)}/v1beta/models?key=${encodeURIComponent(apiKey)}`)
    if (!res.ok) throw new Error(await readApiError(res))
    const data = (await res.json()) as { models?: Array<{ name: string }> }
    const ids = (data.models ?? []).map(m => m.name.replace(/^models\//, ''))
    const filtered = filterTtsModels(ids)
    return filtered.length ? filtered : FALLBACK_MODELS
  },

  async listVoices() {
    return GEMINI_VOICES
  },

  async synthesize(req: SynthesizeRequest) {
    const url = `${normalizeBaseUrl(req.baseUrl)}/v1beta/models/${encodeURIComponent(req.model)}:generateContent?key=${encodeURIComponent(req.apiKey)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: req.voiceId },
            },
          },
        },
      }),
    })
    if (!res.ok) throw new Error(await readApiError(res))

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> }
      }>
    }
    const inline = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)?.inlineData
    if (!inline?.data) throw new Error('Gemini returned no audio data')

    const mime = inline.mimeType?.includes('mpeg') ? 'audio/mpeg' : inline.mimeType ?? 'audio/wav'
    return b64ToBlob(inline.data, mime)
  },
}