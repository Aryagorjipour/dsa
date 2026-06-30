#!/usr/bin/env node
/**
 * Unit tests for TTS speech preparation (mirrors speechPrep.ts + defaultGlossary).
 */

function normalizeReadingText(raw) {
  return raw.replace(/\u200b/g, '').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
}

function tokenizeWords(text) {
  const normalized = normalizeReadingText(text)
  const words = []
  const re = /\S+/g
  let match
  while ((match = re.exec(normalized)) !== null) {
    words.push({ text: match[0], start: match.index, end: match.index + match[0].length })
  }
  return words
}

const DEFAULT_GLOSSARY = [
  { match: 'O\\(n\\s*log\\s*n\\)', spoken: 'big O of n log n', isRegex: true, priority: 10 },
  { match: 'O\\(n\\)', spoken: 'big O of n', isRegex: true, priority: 5 },
  { match: 'O\\(1\\)', spoken: 'big O of one', isRegex: true, priority: 5 },
  { match: 'C#', spoken: 'C sharp', priority: 20 },
  { match: '.NET', spoken: 'dot net', priority: 20 },
  { match: 'hash map', spoken: 'hashmap', priority: 12 },
]

function findMatches(text, rules) {
  const spans = []
  for (const rule of rules) {
    if (rule.isRegex) {
      const re = new RegExp(rule.match, 'gi')
      let m
      while ((m = re.exec(text)) !== null) {
        spans.push({ start: m.index, end: m.index + m[0].length, spoken: rule.spoken, priority: rule.priority ?? 50 })
      }
    } else {
      let from = 0
      const lower = text.toLowerCase()
      const needle = rule.match.toLowerCase()
      while (from < text.length) {
        const idx = lower.indexOf(needle, from)
        if (idx < 0) break
        spans.push({ start: idx, end: idx + rule.match.length, spoken: rule.spoken, priority: rule.priority ?? 50 })
        from = idx + 1
      }
    }
  }
  spans.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    return b.end - b.start - (a.end - a.start) || a.priority - b.priority
  })
  const picked = []
  let cursor = 0
  for (const span of spans) {
    if (span.start < cursor) continue
    picked.push(span)
    cursor = span.end
  }
  return picked
}

function prepareSpeechText(rawDisplay, rules = DEFAULT_GLOSSARY) {
  const displayText = normalizeReadingText(rawDisplay)
  const matches = findMatches(displayText, rules)
  let spokenText = ''
  let pos = 0
  for (const m of matches) {
    if (m.start > pos) spokenText += displayText.slice(pos, m.start)
    if (spokenText.length && !spokenText.endsWith(' ')) spokenText += ' '
    spokenText += m.spoken
    pos = m.end
  }
  if (pos < displayText.length) spokenText += displayText.slice(pos)
  return { displayText, spokenText: normalizeReadingText(spokenText) }
}

let failed = 0
function assert(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`)
    failed++
  } else {
    console.log(`ok: ${name}`)
  }
}

const csharp = prepareSpeechText('Full C# and Go code')
assert('C# becomes C sharp', csharp.spokenText.includes('C sharp'))
assert('C# not left as hashtag', !csharp.spokenText.includes('C#'))

const bigO = prepareSpeechText('Merge sort is O(n log n) time')
assert('O(n log n) expanded', bigO.spokenText.includes('big O of n log n'))

const hashmap = prepareSpeechText('Use a hash map for lookups')
assert('hash map compound', hashmap.spokenText.includes('hashmap'))

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}
console.log('\nAll TTS speech-prep tests passed')