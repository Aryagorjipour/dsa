import { openaiAdapter } from './openai'
import type { TtsProviderAdapter } from './types'

/** OpenAI-compatible speech endpoint at a custom base URL (proxy, LiteLLM, etc.). */
export const customAdapter: TtsProviderAdapter = {
  id: 'custom',
  listModels: openaiAdapter.listModels.bind(openaiAdapter),
  synthesize: openaiAdapter.synthesize.bind(openaiAdapter),
}