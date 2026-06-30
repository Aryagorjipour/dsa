import { get, set, del } from 'idb-keyval'

export type CloudTtsProvider = 'openai' | 'gemini' | 'grok' | 'custom'

export interface CloudTtsConfig {
  provider: CloudTtsProvider
  baseUrl: string
  model: string
  voiceId: string
  configured: boolean
}

interface EncryptedSecret {
  iv: string
  ciphertext: string
}

const CONFIG_KEY = 'dsa:tts-cloud-config'
const SECRET_KEY = 'dsa:tts-cloud-secret'
const DEVICE_KEY = 'dsa:tts-device-crypto-key'

let cachedApiKey: string | null = null

function idbAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function b64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function getDeviceCryptoKey(): Promise<CryptoKey> {
  if (!idbAvailable()) {
    throw new Error('IndexedDB unavailable')
  }
  const stored = await get<string>(DEVICE_KEY)
  if (stored) {
    return crypto.subtle.importKey('raw', b64ToBuf(stored), 'AES-GCM', false, ['encrypt', 'decrypt'])
  }
  const raw = crypto.getRandomValues(new Uint8Array(32))
  const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
  await set(DEVICE_KEY, bufToB64(raw.buffer))
  return key
}

async function encryptSecret(plaintext: string): Promise<EncryptedSecret> {
  const key = await getDeviceCryptoKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return { iv: bufToB64(iv.buffer), ciphertext: bufToB64(ciphertext) }
}

async function decryptSecret(payload: EncryptedSecret): Promise<string> {
  const key = await getDeviceCryptoKey()
  const iv = new Uint8Array(b64ToBuf(payload.iv))
  const ciphertext = b64ToBuf(payload.ciphertext)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(decrypted)
}

export const PROVIDER_DEFAULTS: Record<CloudTtsProvider, string> = {
  openai: 'https://api.openai.com',
  gemini: 'https://generativelanguage.googleapis.com',
  grok: 'https://api.x.ai',
  custom: '',
}

export function defaultCloudConfig(provider: CloudTtsProvider = 'openai'): CloudTtsConfig {
  return {
    provider,
    baseUrl: PROVIDER_DEFAULTS[provider],
    model: provider === 'openai' ? 'tts-1' : provider === 'gemini' ? 'gemini-2.5-flash-preview-tts' : 'grok-tts',
    voiceId: provider === 'grok' ? 'eve' : provider === 'openai' ? 'coral' : 'Kore',
    configured: false,
  }
}

export async function loadCloudTtsConfig(): Promise<CloudTtsConfig> {
  if (!idbAvailable()) return defaultCloudConfig()
  return (await get<CloudTtsConfig>(CONFIG_KEY)) ?? defaultCloudConfig()
}

export async function saveCloudTtsConfig(config: CloudTtsConfig): Promise<void> {
  if (!idbAvailable()) return
  await set(CONFIG_KEY, config)
}

export async function saveCloudApiKey(apiKey: string): Promise<void> {
  if (!idbAvailable()) return
  const encrypted = await encryptSecret(apiKey.trim())
  await set(SECRET_KEY, encrypted)
  cachedApiKey = apiKey.trim()
}

export async function getCloudApiKey(): Promise<string | null> {
  if (!idbAvailable()) return null
  if (cachedApiKey) return cachedApiKey
  const encrypted = await get<EncryptedSecret>(SECRET_KEY)
  if (!encrypted) return null
  try {
    cachedApiKey = await decryptSecret(encrypted)
    return cachedApiKey
  } catch {
    return null
  }
}

export async function hasStoredApiKey(): Promise<boolean> {
  if (!idbAvailable()) return false
  return !!(await get<EncryptedSecret>(SECRET_KEY))
}

export function maskApiKey(key: string): string {
  if (key.length <= 4) return '••••'
  return `••••••••${key.slice(-4)}`
}

export async function clearCloudTtsCredentials(): Promise<void> {
  cachedApiKey = null
  if (!idbAvailable()) return
  await del(SECRET_KEY)
  await saveCloudTtsConfig(defaultCloudConfig())
}

export async function isCloudTtsConfigured(): Promise<boolean> {
  const config = await loadCloudTtsConfig()
  return config.configured && !!(await getCloudApiKey())
}

export function clearApiKeyCache(): void {
  cachedApiKey = null
}