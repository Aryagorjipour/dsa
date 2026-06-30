#!/usr/bin/env node
/**
 * Unit tests for cloud TTS sync helpers (mirrors cloudTtsSync.ts).
 */

function mergeModelList(storedModel, fetchedModels) {
  const trimmed = storedModel.trim()
  if (!trimmed) return [...fetchedModels]
  if (!fetchedModels.length) return [trimmed]
  if (fetchedModels.includes(trimmed)) return [...fetchedModels]
  return [trimmed, ...fetchedModels]
}

function resolveSyncedCloudFields(config, payload) {
  const storedModel = config.provider === 'grok' ? 'xai-tts' : (config.model || '').trim()
  const models =
    config.provider === 'grok' ? ['xai-tts'] : mergeModelList(storedModel, payload.models)

  let model = storedModel
  if (config.provider === 'grok') {
    model = 'xai-tts'
  } else if (!model && models.length) {
    model = models[0]
  }

  let voiceId = config.voiceId
  if (payload.voices?.length && !payload.voices.some(v => v.id === voiceId)) {
    voiceId = payload.voices[0].id
  }

  return { model, voiceId, models }
}

const CLOUD_TTS_SYNC_INTERVAL_MS = 30 * 60 * 1000

function isCloudSyncDue(config, now = Date.now()) {
  if (!config.configured) return false
  if (!config.lastSyncedAt) return true
  return now - config.lastSyncedAt >= CLOUD_TTS_SYNC_INTERVAL_MS
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

assert('keeps stored model in merged list', mergeModelList('gpt-4o-mini-tts', ['tts-1', 'tts-1-hd']).includes('gpt-4o-mini-tts'))
assert('prepends missing stored model', mergeModelList('custom-model', ['tts-1'])[0] === 'custom-model')
assert('empty stored uses fetched', mergeModelList('', ['tts-1']).join() === 'tts-1')

const resolved = resolveSyncedCloudFields(
  { provider: 'openai', model: 'gpt-4o-mini-tts', voiceId: 'coral' },
  { models: ['tts-1', 'tts-1-hd'], voices: [{ id: 'coral', label: 'coral' }] },
)
assert('preserves chosen model', resolved.model === 'gpt-4o-mini-tts')
assert('model list keeps chosen entry', resolved.models.includes('gpt-4o-mini-tts'))

const grok = resolveSyncedCloudFields(
  { provider: 'grok', model: 'grok-tts', voiceId: 'eve' },
  { models: ['grok-tts'], voices: [{ id: 'ara', label: 'Ara' }] },
)
assert('grok normalizes placeholder model', grok.model === 'xai-tts')

const now = 1_000_000
assert('sync due without timestamp', isCloudSyncDue({ configured: true }, now))
assert('sync not due after recent sync', !isCloudSyncDue({ configured: true, lastSyncedAt: now - 1000 }, now))
assert('sync due after interval', isCloudSyncDue({ configured: true, lastSyncedAt: now - CLOUD_TTS_SYNC_INTERVAL_MS - 1 }, now))

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS cloud sync tests passed')