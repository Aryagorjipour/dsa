import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { showToast } from './useToast'
import { normalizePagePath } from '../utils/normalizePagePath'
import { useAnnotations, loadAnnotations } from './useAnnotations'
import { openNoteDialog } from './useNoteDialog'
import { findPageNote } from '../utils/findNoteForAnchor'
import { assertOnline } from '../utils/networkFeatures'

export function usePageActions() {
  const { page } = useData()
  const route = useRoute()
  const { notes, addNote, updateNote, removeNote, currentPagePath } = useAnnotations()

  const title = computed(() => page.value.title || 'DSA Topic')
  const isProjectPage = computed(() => normalizePagePath(route.path).includes('/projects/tier-'))
  const pageNote = computed(() => findPageNote(currentPagePath.value, notes.value))

  function sharePage() {
    navigator.clipboard.writeText(window.location.href)
    showToast('Link copied to clipboard')
  }

  async function editPageNote() {
    await loadAnnotations()
    const existing = pageNote.value
    const body = await openNoteDialog({
      title: `Note for “${title.value}”`,
      placeholder: 'Page-level notes, takeaways, questions…',
      initial: existing?.body ?? '',
    })
    if (body === null) return

    try {
      const trimmed = body.trim()
      if (existing) {
        if (!trimmed) {
          await removeNote(existing.id)
          showToast('Page note removed')
        } else {
          await updateNote(existing.id, trimmed, title.value)
          showToast('Page note updated')
        }
      } else if (trimmed) {
        await addNote({
          pagePath: currentPagePath.value,
          anchorType: 'free',
          title: title.value,
          body: trimmed,
        })
        showToast('Page note saved — press Shift+N to view on this page')
      }
    } catch (err) {
      console.error('[dsa] page note failed', err)
      showToast('Could not save page note')
    }
  }

  function giveToAI() {
    const prompt = isProjectPage.value
      ? `You are a senior software architect mentoring a developer through a "Build Your Own X" project from the DSA Handbook Project Lab.

Project: ${title.value}
Page: ${window.location.href}

Act as a Socratic tutor. Help me design and implement this project WITHOUT giving complete solutions. For each milestone:
- Ask what I've tried so far
- Point out design trade-offs
- Suggest what handbook chapters to re-read
- Give small hints, not full code

Start by asking which milestone I'm on and what I've built so far.`
      : `You are an expert tutor on Data Structures and Algorithms.

Please explain the following topic from the "DSA Handbook" in a clear, beginner-friendly way. Include:
- The core problem it solves
- Intuitive explanation
- Real-world use cases
- Simple code examples in Go and C#

Topic: ${title.value}

Page: ${window.location.href}

Start your explanation now.`

    navigator.clipboard.writeText(prompt)
    const chatCheck = assertOnline('chatgpt', navigator.onLine)
    if (!chatCheck.ok) {
      showToast('Prompt copied — connect to the internet to open ChatGPT', undefined, 5000)
      return
    }
    showToast('Prompt copied', {
      label: 'Open ChatGPT',
      onClick: () => {
        window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, '_blank', 'noopener')
      },
    })
  }

  return {
    title,
    isProjectPage,
    pageNote,
    sharePage,
    editPageNote,
    giveToAI,
  }
}