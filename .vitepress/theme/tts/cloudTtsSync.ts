import { testProviderConnection } from './providers'
import {
  getCloudApiKey,
  loadCloudTtsConfig,
  saveCloudTtsConfig,
  type CloudTtsConfig,
} from './ttsSecretStore'

export const CLOUD_TTS_SYNC_INTERVAL_MS = 30 * 60 * 1000
export const CLOUD_TTS_SYNC_MIN_GAP_MS = 5 * 60 * 1000

export interface ProviderSyncPayload {
  models: string[]
  voices?: Array<{ id: string; label: string }>
}

export interface CloudTtsSyncResult {
  ok: boolean
  configured: boolean
  error?: string
  config?: CloudTtsConfig
  payload?: ProviderSyncPayload
}

/** Merge API model list with a stored selection so the UI never drops the chosen model. */
export function mergeModelList(storedModel: string, fetchedModels: string[]): string[] {
  const trimmed = storedModel.trim()
  if (!trimmed) return [...fetchedModels]
  if (!fetchedModels.length) return [trimmed]
  if (fetchedModels.includes(trimmed)) return [...fetchedModels]
  return [trimmed, ...fetchedModels]
}

/** Pick model + voice after a successful provider probe — keeps stored values when still valid. */
export function resolveSyncedCloudFields(
  config: CloudTtsConfig,
  payload: ProviderSyncPayload,
): { model: string; voiceId: string; models: string[] } {
  const storedModel =
    config.provider === 'grok' ? 'xai-tts' : (config.model || '').trim()
  const models =
    config.provider === 'grok'
      ? ['xai-tts']
      : mergeModelList(storedModel, payload.models)

  let model = storedModel
  if (config.provider === 'grok') {
    model = 'xai-tts'
  } else if (!model && models.length) {
    model = models[0]!
  }

  let voiceId = config.voiceId
  if (payload.voices?.length && !payload.voices.some(v => v.id === voiceId)) {
    voiceId = payload.voices[0]!.id
  }

  return { model, voiceId, models }
}

let syncInFlight: Promise<CloudTtsSyncResult> | null = null
let lastSyncAttempt = 0

export async function syncCloudTtsConnection(force = false): Promise<CloudTtsSyncResult> {
  if (syncInFlight) return syncInFlight

  const now = Date.now()
  if (!force && now - lastSyncAttempt < CLOUD_TTS_SYNC_MIN_GAP_MS) {
    const config = await loadCloudTtsConfig()
    return { ok: config.configured, configured: config.configured, config }
  }

  syncInFlight = (async (): Promise<CloudTtsSyncResult> => {
    lastSyncAttempt = Date.now()
    try {
      const config = await loadCloudTtsConfig()
      const apiKey = await getCloudApiKey()
      if (!apiKey) {
        return { ok: false, configured: false, config }
      }

      const payload = await testProviderConnection(config.provider, config.baseUrl, apiKey)
      const { model, voiceId, models } = resolveSyncedCloudFields(config, payload)

      const next: CloudTtsConfig = {
        ...config,
        model,
        voiceId,
        configured: true,
        lastSyncedAt: Date.now(),
      }
      await saveCloudTtsConfig(next)

      return {
        ok: true,
        configured: true,
        config: next,
        payload: { models, voices: payload.voices },
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cloud sync failed'
      const config = await loadCloudTtsConfig()
      const authFailure = /401|403|unauthorized|invalid.*key|authentication/i.test(message)

      if (authFailure && config.configured) {
        const next = { ...config, configured: false }
        await saveCloudTtsConfig(next)
        return { ok: false, configured: false, error: message, config: next }
      }

      return {
        ok: false,
        configured: config.configured,
        error: message,
        config,
      }
    } finally {
      syncInFlight = null
    }
  })()

  return syncInFlight
}

export function isCloudSyncDue(config: CloudTtsConfig, now = Date.now()): boolean {
  if (!config.configured) return false
  if (!config.lastSyncedAt) return true
  return now - config.lastSyncedAt >= CLOUD_TTS_SYNC_INTERVAL_MS
}