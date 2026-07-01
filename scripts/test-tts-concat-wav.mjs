#!/usr/bin/env node
/**
 * Unit tests for WAV concatenation (mirrors concatWav.ts).
 */

function buildWavFromPcm(pcm, sampleRate, channels = 1) {
  const headerLength = 44
  const view = new DataView(new ArrayBuffer(headerLength + pcm.byteLength))
  view.setUint32(0, 0x46464952, true)
  view.setUint32(4, view.buffer.byteLength - 8, true)
  view.setUint32(8, 0x45564157, true)
  view.setUint32(12, 0x20746d66, true)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, channels * 2 * sampleRate, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  view.setUint32(36, 0x61746164, true)
  view.setUint32(40, pcm.byteLength, true)
  new Uint8Array(view.buffer, headerLength).set(pcm)
  return view.buffer
}

function extractWavPcm(buffer) {
  const view = new DataView(buffer)
  return {
    channels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    pcm: new Uint8Array(buffer, 44, view.getUint32(40, true)),
  }
}

function concatWav(buffers) {
  const parsed = buffers.map(extractWavPcm)
  const sampleRate = parsed[0].sampleRate
  const channels = parsed[0].channels
  const total = parsed.reduce((sum, p) => sum + p.pcm.byteLength, 0)
  const merged = new Uint8Array(total)
  let offset = 0
  for (const part of parsed) {
    merged.set(part.pcm, offset)
    offset += part.pcm.byteLength
  }
  return buildWavFromPcm(merged, sampleRate, channels)
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

const pcmA = new Uint8Array([0, 1, 2, 3])
const pcmB = new Uint8Array([4, 5, 6, 7])
const wavA = buildWavFromPcm(pcmA, 22050)
const wavB = buildWavFromPcm(pcmB, 22050)
const merged = concatWav([wavA, wavB])
const out = extractWavPcm(merged)

assert('merged pcm length', out.pcm.byteLength === 8)
assert('merged pcm bytes', out.pcm[0] === 0 && out.pcm[7] === 7)
assert('sample rate preserved', out.sampleRate === 22050)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS concat WAV tests passed')