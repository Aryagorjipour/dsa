/** Piper emits standard 16-bit mono PCM WAV with a 44-byte header. */

export function extractWavPcm(buffer: ArrayBuffer): {
  pcm: Uint8Array
  sampleRate: number
  channels: number
} {
  const view = new DataView(buffer)
  if (view.byteLength < 44) throw new Error('Invalid WAV: too short')
  const channels = view.getUint16(22, true)
  const sampleRate = view.getUint32(24, true)
  const dataSize = view.getUint32(40, true)
  const pcm = new Uint8Array(buffer, 44, dataSize)
  return { pcm, sampleRate, channels }
}

export function buildWavFromPcm(
  pcm: Uint8Array,
  sampleRate: number,
  channels = 1,
): ArrayBuffer {
  const headerLength = 44
  const view = new DataView(new ArrayBuffer(headerLength + pcm.byteLength))
  view.setUint32(0, 0x46464952, true) // RIFF
  view.setUint32(4, view.buffer.byteLength - 8, true)
  view.setUint32(8, 0x45564157, true) // WAVE
  view.setUint32(12, 0x20746d66, true) // fmt
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, channels * 2 * sampleRate, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  view.setUint32(36, 0x61746164, true) // data
  view.setUint32(40, pcm.byteLength, true)
  new Uint8Array(view.buffer, headerLength).set(pcm)
  return view.buffer
}

export async function concatWavBlobs(blobs: Blob[]): Promise<Blob> {
  if (!blobs.length) throw new Error('No WAV blobs to concatenate')
  if (blobs.length === 1) return blobs[0]!

  const parts = await Promise.all(blobs.map(b => b.arrayBuffer()))
  const parsed = parts.map(extractWavPcm)
  const sampleRate = parsed[0]!.sampleRate
  const channels = parsed[0]!.channels

  for (const part of parsed) {
    if (part.sampleRate !== sampleRate || part.channels !== channels) {
      throw new Error('WAV format mismatch during concatenation')
    }
  }

  const totalPcm = parsed.reduce((sum, p) => sum + p.pcm.byteLength, 0)
  const merged = new Uint8Array(totalPcm)
  let offset = 0
  for (const part of parsed) {
    merged.set(part.pcm, offset)
    offset += part.pcm.byteLength
  }

  return new Blob([buildWavFromPcm(merged, sampleRate, channels)], { type: 'audio/x-wav' })
}