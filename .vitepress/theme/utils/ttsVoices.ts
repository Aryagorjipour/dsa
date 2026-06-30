/** Handbook content is English — prefer en-* even when the OS locale differs. */
export const HANDBOOK_TTS_LANG = 'en-US'

// macOS novelty voices only — do not block espeak (common on Linux).
const NOVELTY_VOICES =
  /bells|bad news|bahh|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|zarvox|flo|albert|fred|bruce|junior|kathy|princess|ralph|victoria/i

const PREFER =
  /premium|natural|enhanced|neural|neural2|samantha|karen|daniel|moira|tessa|zira|aria|jenny|guy|google (us|uk) english|microsoft .* natural|google.*wavenet/i

function normalizeLang(lang: string): string {
  return lang.replace(/_/g, '-').toLowerCase()
}

function langMatches(voiceLang: string, preferred: string): boolean {
  const v = normalizeLang(voiceLang)
  const p = normalizeLang(preferred)
  if (v === p) return true
  const vBase = v.split('-')[0]
  const pBase = p.split('-')[0]
  return vBase === pBase
}

export function scoreVoice(voice: SpeechSynthesisVoice, preferredLang: string): number {
  let score = 0
  const name = voice.name.toLowerCase()

  if (NOVELTY_VOICES.test(name)) score -= 200
  if (/espeak|eloquence|festival|mbrola/i.test(name)) score -= 12
  if (PREFER.test(name)) score += 40
  if (voice.localService) score += 35
  if (voice.default) score += 8
  if (langMatches(voice.lang, preferredLang)) score += 25
  if (name.includes('english')) score += 5

  return score
}

export function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  preferredLang = HANDBOOK_TTS_LANG,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null

  const ranked = [...voices]
    .map(v => ({ v, score: scoreVoice(v, preferredLang) }))
    .filter(entry => entry.score > -100)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.v ?? voices[0] ?? null
}

export async function waitForVoices(
  synth: SpeechSynthesis,
  { timeoutMs = 3000, pollMs = 80 } = {},
): Promise<SpeechSynthesisVoice[]> {
  const read = () => synth.getVoices().filter(v => v.name.trim().length > 0)
  const immediate = read()
  if (immediate.length) return immediate

  return new Promise(resolve => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      synth.removeEventListener('voiceschanged', onChange)
      window.clearInterval(poll)
      window.clearTimeout(timer)
      resolve(read())
    }
    const onChange = () => {
      if (read().length) finish()
    }
    synth.addEventListener('voiceschanged', onChange)
    const poll = window.setInterval(() => {
      if (read().length) finish()
    }, pollMs)
    const timer = window.setTimeout(finish, timeoutMs)
    synth.getVoices()
  })
}

export function listVoicesGrouped(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const unique = new Map<string, SpeechSynthesisVoice>()
  for (const voice of voices) {
    const key = `${voice.name}::${voice.lang}`
    if (!unique.has(key)) unique.set(key, voice)
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export const TTS_RATE_KEY = 'dsa-tts-rate'
export const TTS_VOICE_KEY = 'dsa-tts-voice-uri'

export function loadStoredRate(): number {
  if (typeof localStorage === 'undefined') return 1
  const raw = localStorage.getItem(TTS_RATE_KEY)
  const n = raw ? parseFloat(raw) : 1
  return Number.isFinite(n) ? Math.max(0.5, Math.min(2, n)) : 1
}

export function saveStoredRate(rate: number): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(TTS_RATE_KEY, String(rate))
}

export function loadStoredVoiceUri(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TTS_VOICE_KEY)
}

export function saveStoredVoiceUri(uri: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(TTS_VOICE_KEY, uri)
}

export function findVoiceByUri(
  voices: SpeechSynthesisVoice[],
  uri: string | null,
): SpeechSynthesisVoice | null {
  if (!uri) return null
  return voices.find(v => v.voiceURI === uri || v.name === uri) ?? null
}