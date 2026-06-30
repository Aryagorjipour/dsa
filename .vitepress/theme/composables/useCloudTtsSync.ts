import { onMounted, onUnmounted } from 'vue'
import {
  CLOUD_TTS_SYNC_INTERVAL_MS,
  isCloudSyncDue,
  syncCloudTtsConnection,
} from '../tts/cloudTtsSync'
import { loadCloudTtsConfig } from '../tts/ttsSecretStore'

/** Periodically re-test cloud TTS and refresh stored provider settings. */
export function useCloudTtsSync(onUpdated?: () => void): void {
  let intervalId: ReturnType<typeof setInterval> | null = null

  async function runSync(force = false): Promise<void> {
    if (!force) {
      const config = await loadCloudTtsConfig()
      if (!isCloudSyncDue(config)) return
    }
    await syncCloudTtsConnection(force)
    onUpdated?.()
  }

  function onVisibilityChange(): void {
    if (document.visibilityState === 'visible') void runSync(false)
  }

  onMounted(() => {
    void runSync(false)
    intervalId = setInterval(() => void runSync(false), CLOUD_TTS_SYNC_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    if (intervalId) clearInterval(intervalId)
  })
}