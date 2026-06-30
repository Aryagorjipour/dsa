#!/usr/bin/env node
/**
 * Unit tests for handbook TTS voice scoring (mirrors ttsVoices.ts).
 */

const HANDBOOK_TTS_LANG = 'en-US'

const NOVELTY_VOICES =
  /bells|bad news|bahh|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|zarvox|flo|albert|fred|bruce|junior|kathy|princess|ralph|victoria/i

const PREFER =
  /premium|natural|enhanced|neural|neural2|samantha|karen|daniel|moira|tessa|zira|aria|jenny|guy|google (us|uk) english|microsoft .* natural|google.*wavenet/i

function normalizeLang(lang) {
  return lang.replace(/_/g, '-').toLowerCase()
}

function langMatches(voiceLang, preferred) {
  const v = normalizeLang(voiceLang)
  const p = normalizeLang(preferred)
  if (v === p) return true
  return v.split('-')[0] === p.split('-')[0]
}

function scoreVoice(voice, preferredLang) {
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

function pickBestVoice(voices, preferredLang = HANDBOOK_TTS_LANG) {
  if (!voices.length) return null
  const ranked = [...voices]
    .map(v => ({ v, score: scoreVoice(v, preferredLang) }))
    .filter(entry => entry.score > -100)
    .sort((a, b) => b.score - a.score)
  return ranked[0]?.v ?? voices[0] ?? null
}

let failed = 0

function assert(cond, msg) {
  if (!cond) {
    console.error(`  ✗ ${msg}`)
    failed++
  } else {
    console.log(`  ✓ ${msg}`)
  }
}

console.log('test-tts-voices\n')

const espeakEn = {
  name: 'English (America) — espeak-ng',
  lang: 'en-US',
  localService: true,
  default: false,
}
const naturalEn = {
  name: 'Microsoft Aria Natural',
  lang: 'en-US',
  localService: false,
  default: false,
}
const novelty = { name: 'Bells', lang: 'en-US', localService: true, default: false }
const persian = {
  name: 'Persian — espeak-ng',
  lang: 'fa-IR',
  localService: true,
  default: false,
}

assert(scoreVoice(espeakEn, HANDBOOK_TTS_LANG) > -100, 'espeak English is not hard-blocked')
assert(scoreVoice(novelty, HANDBOOK_TTS_LANG) <= -100, 'novelty voice is hard-blocked')
assert(
  pickBestVoice([espeakEn, persian], HANDBOOK_TTS_LANG).lang === 'en-US',
  'prefers English handbook voice over OS locale',
)
assert(
  pickBestVoice([espeakEn, naturalEn], HANDBOOK_TTS_LANG).name.includes('Natural'),
  'prefers natural voice over espeak',
)
assert(pickBestVoice([], HANDBOOK_TTS_LANG) === null, 'empty voice list returns null')
assert(
  pickBestVoice([novelty, espeakEn], HANDBOOK_TTS_LANG).name.includes('espeak'),
  'falls back to espeak when novelty is only alternative',
)

console.log(failed ? `\n${failed} check(s) failed` : '\nAll TTS voice checks passed')
process.exit(failed ? 1 : 0)