export type NetworkFeature = 'wandbox' | 'external-link' | 'chatgpt'

export interface OfflineFeatureCopy {
  title: string
  message: string
  worksOffline: string[]
}

const FEATURE_COPY: Record<NetworkFeature, OfflineFeatureCopy> = {
  wandbox: {
    title: 'Wandbox requires internet',
    message:
      'Code compilation runs on wandbox.org servers. You can still edit code and use saved snippets offline.',
    worksOffline: ['Edit and save code', 'Saved snippets', 'Copy code'],
  },
  chatgpt: {
    title: 'ChatGPT requires internet',
    message: 'Your prompt was copied to the clipboard. Connect to the internet to open ChatGPT.',
    worksOffline: ['Copy prompt to clipboard'],
  },
  'external-link': {
    title: 'This link requires internet',
    message: 'Connect to the internet to open this external page.',
    worksOffline: [],
  },
}

export function requiresNetwork(_feature: NetworkFeature): boolean {
  return true
}

export function getOfflineCopy(feature: NetworkFeature): OfflineFeatureCopy {
  return FEATURE_COPY[feature]
}

export function assertOnline(
  feature: NetworkFeature,
  isOnline: boolean,
): { ok: true } | { ok: false; title: string; message: string } {
  if (isOnline) return { ok: true }
  const copy = FEATURE_COPY[feature]
  return { ok: false, title: copy.title, message: copy.message }
}