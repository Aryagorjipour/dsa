import { DEFAULT_GLOSSARY, GLOSSARY_VERSION, type GlossaryRule } from './defaultGlossary'

export const TTS_GLOSSARY_OVERRIDES_KEY = 'dsa-tts-glossary-overrides'

export function loadGlossaryOverrides(): GlossaryRule[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(TTS_GLOSSARY_OVERRIDES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is GlossaryRule =>
        r && typeof r.match === 'string' && typeof r.spoken === 'string',
    )
  } catch {
    return []
  }
}

export function saveGlossaryOverrides(rules: GlossaryRule[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(TTS_GLOSSARY_OVERRIDES_KEY, JSON.stringify(rules))
}

export function mergeGlossaryRules(overrides: GlossaryRule[] = loadGlossaryOverrides()): GlossaryRule[] {
  const merged = [...overrides.map(r => ({ ...r, priority: r.priority ?? 0 })), ...DEFAULT_GLOSSARY]
  return merged.sort((a, b) => {
    const lenA = a.isRegex ? a.match.length : a.match.length
    const lenB = b.isRegex ? b.match.length : b.match.length
    if (lenB !== lenA) return lenB - lenA
    return (a.priority ?? 50) - (b.priority ?? 50)
  })
}

export function getGlossaryVersion(): string {
  return GLOSSARY_VERSION
}

export { DEFAULT_GLOSSARY, GLOSSARY_VERSION }
export type { GlossaryRule }