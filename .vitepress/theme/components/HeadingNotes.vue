<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations } from '../composables/useAnnotations'
import { openNoteDialog } from '../composables/useNoteDialog'
import { showToast } from '../composables/useToast'

const route = useRoute()
const { addNote, currentPagePath } = useAnnotations()

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
    btn.title = 'Add section note'
    btn.setAttribute('aria-label', `Add note to section: ${heading.textContent}`)
    btn.textContent = '+'
    btn.addEventListener('click', async e => {
      e.preventDefault()
      e.stopPropagation()
      const title = heading.textContent?.trim() || 'Section note'
      const body = await openNoteDialog({
        title: `Note for “${title}”`,
        placeholder: 'Section notes, reminders, questions…',
      })
      if (!body) return
      await addNote({
        pagePath: currentPagePath.value,
        anchorType: 'heading',
        anchorId: id,
        title,
        body: body.trim(),
      })
      showToast('Section note saved')
    })

    heading.classList.add('dsa-heading-with-note')
    heading.appendChild(btn)
  })
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
    // Firefox can paint .vp-doc slightly after route change; retry once.
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
</script>

<template>
  <span style="display:none" />
</template>