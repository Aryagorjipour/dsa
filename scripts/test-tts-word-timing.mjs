#!/usr/bin/env node
/**
 * Unit tests for syllable-weighted word timing (mirrors wordTiming.ts).
 */

function tokenizeWords(text) {
  const words = []
  const re = /\S+/g
  let match
  while ((match = re.exec(text)) !== null) words.push({ text: match[0] })
  return words
}

function syllableWeight(word) {
  const s = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!s) return 1
  const groups = s.match(/[aeiouy]+/g)
  return Math.max(1, groups?.length ?? 1)
}

function charWeightsForText(text) {
  return tokenizeWords(text).map(w => syllableWeight(w.text))
}

function spokenWordAtOffset(offsetMs, durationMs, phonemeWeights) {
  if (!phonemeWeights.length || durationMs <= 0) return 0
  const ratio = Math.max(0, Math.min(1, offsetMs / durationMs))
  const total = phonemeWeights.reduce((s, w) => s + w, 0)
  const target = ratio * total
  let acc = 0
  for (let i = 0; i < phonemeWeights.length; i++) {
    acc += phonemeWeights[i]
    if (target <= acc) return i
  }
  return phonemeWeights.length - 1
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

const weights = charWeightsForText('a algorithm')
assert('longer word has more weight', weights[1] > weights[0])

const mid = spokenWordAtOffset(500, 1000, weights)
assert('mid playback hits second word', mid === 1)

const start = spokenWordAtOffset(0, 1000, weights)
assert('start is first word', start === 0)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}
console.log('\nAll TTS word-timing tests passed')