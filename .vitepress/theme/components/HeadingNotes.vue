<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations } from '../composables/useAnnotations'
import { showToast } from '../composables/useToast'

const route = useRoute()
const { addNote } = useAnnotations()

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
      const body = prompt(`Note for "${title}":`, '')
      if (body === null || !body.trim()) return
      await addNote({
        pagePath: route.path,
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

onMounted(() => {
  setTimeout(injectHeadingButtons, 150)
})

onUnmounted(() => cleanup())

watch(() => route.path, () => {
  cleanup()
  setTimeout(injectHeadingButtons, 200)
})
</script>

<template>
  <span style="display:none" />
</template>