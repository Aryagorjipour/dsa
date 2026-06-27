<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { openNoteDialog } from '../composables/useNoteDialog'
import { showToast } from '../composables/useToast'
import { findNoteForHeading } from '../utils/findNoteForAnchor'

const route = useRoute()
const { notes, addNote, updateNote, removeNote, currentPagePath } = useAnnotations()

function updateHeadingButtonStates() {
  document.querySelectorAll('.dsa-heading-note-btn').forEach(btn => {
    const heading = btn.closest('h2, h3')
    const id = heading?.id
    if (!id) return

    const hasNote = !!findNoteForHeading(id, currentPagePath.value, notes.value)
    const sectionTitle = heading.textContent?.trim() || 'Section note'

    btn.classList.toggle('has-note', hasNote)
    btn.title = hasNote ? 'Edit section note' : 'Add section note'
    btn.setAttribute(
      'aria-label',
      hasNote ? `Edit note for section: ${sectionTitle}` : `Add note to section: ${sectionTitle}`,
    )
  })
}

async function onHeadingNoteClick(heading, headingId) {
  const sectionTitle = heading.textContent?.trim() || 'Section note'
  await loadAnnotations()

  const existing = findNoteForHeading(headingId, currentPagePath.value, notes.value)
  const body = await openNoteDialog({
    title: `Note for “${sectionTitle}”`,
    placeholder: 'Section notes, reminders, questions…',
    initial: existing?.body ?? '',
  })
  if (body === null) return

  try {
    const trimmed = body.trim()
    if (existing) {
      if (!trimmed) {
        await removeNote(existing.id)
        showToast('Section note removed')
      } else {
        await updateNote(existing.id, trimmed, sectionTitle)
        showToast('Section note updated')
      }
    } else if (trimmed) {
      await addNote({
        pagePath: currentPagePath.value,
        anchorType: 'heading',
        anchorId: headingId,
        title: sectionTitle,
        body: trimmed,
      })
      showToast('Section note saved')
    }
    updateHeadingButtonStates()
  } catch (err) {
    console.error('[dsa] section note failed', err)
    showToast('Could not save section note')
  }
}

function injectHeadingButtons() {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  doc.querySelectorAll('h2, h3').forEach(heading => {
    if (heading.querySelector('.dsa-heading-note-btn')) return
    const id = heading.id
    if (!id) return

    const btn = document.createElement('button')
    btn.className = 'dsa-heading-note-btn'
    btn.type = 'button'
    btn.textContent = '+'
    btn.addEventListener('click', async e => {
      e.preventDefault()
      e.stopPropagation()
      await onHeadingNoteClick(heading, id)
    })

    heading.classList.add('dsa-heading-with-note')
    heading.appendChild(btn)
  })

  updateHeadingButtonStates()
}

function cleanup() {
  document.querySelectorAll('.dsa-heading-note-btn').forEach(el => el.remove())
  document.querySelectorAll('.dsa-heading-with-note').forEach(el => {
    el.classList.remove('dsa-heading-with-note')
  })
}

function scheduleInject() {
  requestAnimationFrame(() => {
    injectHeadingButtons()
    setTimeout(injectHeadingButtons, 100)
  })
}

onMounted(() => {
  scheduleInject()
})

onUnmounted(() => cleanup())

watch(() => route.path, () => {
  cleanup()
  scheduleInject()
})

watch(notes, () => updateHeadingButtonStates(), { deep: true })
</script>

<template>
  <span style="display:none" />
</template>