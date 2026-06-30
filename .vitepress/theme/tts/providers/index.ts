import type { CloudTtsProvider } from '../ttsSecretStore'
import { customAdapter } from './custom'
import { geminiAdapter } from './gemini'
import { grokAdapter } from './grok'
import { openaiAdapter } from './openai'
import type { TtsProviderAdapter } from './types'

export { filterTtsModels, joinApiPath, normalizeBaseUrl } from './types'
export type { SynthesizeRequest, TtsProviderAdapter, VoiceOption } from './types'
export { OPENAI_VOICES } from './openai'
export { GEMINI_VOICES } from './gemini'
export { isLikelyCorsError } from './fetchError'

const adapters: Record<CloudTtsProvider, TtsProviderAdapter> = {
  openai: openaiAdapter,
  gemini: geminiAdapter,
  grok: grokAdapter,
  custom: customAdapter,
}

export function getProviderAdapter(provider: CloudTtsProvider): TtsProviderAdapter {
  return adapters[provider]
}

export async function testProviderConnection(
  provider: CloudTtsProvider,
  baseUrl: string,
  apiKey: string,
): Promise<{ models: string[]; voices?: Array<{ id: string; label: string }> }> {
  const adapter = getProviderAdapter(provider)
  const models = await adapter.listModels(baseUrl, apiKey)
  const voices = adapter.listVoices ? await adapter.listVoices(baseUrl, apiKey) : undefined
  return { models, voices }
}