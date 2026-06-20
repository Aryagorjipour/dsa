<script setup>
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { showToast } from '../composables/useToast'

const { page } = useData()
const route = useRoute()

const title = computed(() => page.value.title || 'DSA Topic')
const isProjectPage = computed(() => route.path.includes('/projects/tier-'))

function playgroundUrl() {
  return withBase(`/playground?from=${encodeURIComponent(route.path)}`)
}

function sharePage() {
  navigator.clipboard.writeText(window.location.href)
  showToast('Link copied to clipboard')
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
  showToast('Prompt copied', {
    label: 'Open ChatGPT',
    onClick: () => {
      window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, '_blank', 'noopener')
    },
  })
}
</script>

<template>
  <div class="page-tools">
    <div class="actions">
      <button class="btn" @click="sharePage">Share</button>
      <button class="btn" @click="giveToAI">{{ isProjectPage ? 'Mentor Mode' : 'Give to AI' }}</button>
      <a v-if="isProjectPage" href="/projects/README" class="btn">Project Lab</a>
      <a v-if="isProjectPage" href="/projects/contributing" class="btn">Contribute</a>
      <a
        v-if="!isProjectPage"
        :href="playgroundUrl()"
        class="btn primary"
      >
        Open Playground
      </a>
    </div>
    <p v-if="isProjectPage" class="project-hint">
      This is a build specification — implement it yourself. Check
      <code>projects-starters/</code> in the repo for interface stubs.
    </p>
  </div>
</template>

<style scoped>
.page-tools {
  margin: 40px 0 20px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  color: var(--vp-c-text-1);
  display: inline-flex;
  align-items: center;
}

.btn.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.project-hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 10px;
  line-height: 1.5;
}

.project-hint code {
  font-size: 11px;
}
</style>