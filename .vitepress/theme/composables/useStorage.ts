import { get, set, del, keys } from 'idb-keyval'

export const STORAGE_VERSION = 'dsa-annotations-v1'

export interface Highlight {
  id: string
  pagePath: string
  anchorType: 'text-range' | 'heading'
  blockId: string
  startOffset: number
  endOffset: number
  color: 'yellow' | 'green' | 'blue' | 'pink'
  noteId?: string
  createdAt: number
  textSnapshot: string
}

export interface Note {
  id: string
  pagePath: string
  anchorType: 'heading' | 'highlight' | 'free'
  anchorId?: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
}

export interface PlaygroundSnippet {
  id: string
  title: string
  lang: 'go' | 'csharp'
  code: string
  sourcePage?: string
  createdAt: number
}

export interface UserDataExport {
  version: string
  exportedAt: number
  highlights: Highlight[]
  notes: Note[]
  playgroundSnippets: PlaygroundSnippet[]
  playgroundState?: { go: string; csharp: string }
}

const PREFIX = 'dsa:'

export async function getHighlights(): Promise<Highlight[]> {
  return (await get(`${PREFIX}highlights`)) ?? []
}

export async function setHighlights(highlights: Highlight[]) {
  await set(`${PREFIX}highlights`, highlights)
}

export async function getNotes(): Promise<Note[]> {
  return (await get(`${PREFIX}notes`)) ?? []
}

export async function setNotes(notes: Note[]) {
  await set(`${PREFIX}notes`, notes)
}

export async function getSnippets(): Promise<PlaygroundSnippet[]> {
  return (await get(`${PREFIX}snippets`)) ?? []
}

export async function setSnippets(snippets: PlaygroundSnippet[]) {
  await set(`${PREFIX}snippets`, snippets.slice(0, 50))
}

export async function getPlaygroundState(): Promise<{ go: string; csharp: string }> {
  return (await get(`${PREFIX}playground`)) ?? { go: '', csharp: '' }
}

export async function setPlaygroundState(state: { go: string; csharp: string }) {
  await set(`${PREFIX}playground`, state)
}

export async function getHighlightsVisible(): Promise<boolean> {
  const v = await get(`${PREFIX}highlights-visible`)
  return v !== false
}

export async function setHighlightsVisible(visible: boolean) {
  await set(`${PREFIX}highlights-visible`, visible)
}

export async function exportUserData(): Promise<UserDataExport> {
  const [highlights, notes, snippets, playgroundState] = await Promise.all([
    getHighlights(),
    getNotes(),
    getSnippets(),
    getPlaygroundState(),
  ])
  return {
    version: STORAGE_VERSION,
    exportedAt: Date.now(),
    highlights,
    notes,
    playgroundSnippets: snippets,
    playgroundState,
  }
}

export async function importUserData(
  data: UserDataExport,
  mode: 'merge' | 'replace'
): Promise<void> {
  if (mode === 'replace') {
    const allKeys = await keys()
    for (const key of allKeys) {
      if (String(key).startsWith(PREFIX)) {
        await del(key)
      }
    }
  }

  if (mode === 'merge') {
    const [existingH, existingN, existingS] = await Promise.all([
      getHighlights(),
      getNotes(),
      getSnippets(),
    ])
    const mergedH = [...existingH, ...data.highlights.filter(h => !existingH.some(e => e.id === h.id))]
    const mergedN = [...existingN, ...data.notes.filter(n => !existingN.some(e => e.id === n.id))]
    const mergedS = [...existingS, ...data.playgroundSnippets.filter(s => !existingS.some(e => e.id === s.id))]
    await setHighlights(mergedH)
    await setNotes(mergedN)
    await setSnippets(mergedS.slice(0, 50))
  } else {
    await setHighlights(data.highlights)
    await setNotes(data.notes)
    await setSnippets(data.playgroundSnippets)
  }

  if (data.playgroundState) {
    await setPlaygroundState(data.playgroundState)
  }
}

export async function clearAllUserData() {
  const allKeys = await keys()
  for (const key of allKeys) {
    if (String(key).startsWith(PREFIX)) {
      await del(key)
    }
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}