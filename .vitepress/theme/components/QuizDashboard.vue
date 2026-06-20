<script setup>
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { QUIZ_INDEX, totalQuizQuestions } from '../../../quizzes/registry'
import { MASTERY_THRESHOLD } from '../../../quizzes/types'
import { loadQuizData, computeGlobalStats } from '../composables/useQuiz'
import { getQuizProgress } from '../composables/useStorage'

const progressStore = ref(null)
const filter = ref('all')

onMounted(async () => {
  await loadQuizData()
  progressStore.value = await getQuizProgress()
})

const topicRows = computed(() => {
  return QUIZ_INDEX.map(entry => {
    const topic = progressStore.value?.topics[entry.pagePath]
      ?? progressStore.value?.topics[`/dsa${entry.pagePath}`]
    const states = topic ? Object.values(topic.questionStates) : []
    const correct = states.filter(s => s.correct).length
    const total = entry.quizCount + entry.challengeCount
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0
    const mastered = total > 0 && correct / total >= MASTERY_THRESHOLD
    const started = states.length > 0

    return {
      ...entry,
      correct,
      total,
      percent,
      mastered,
      started,
      link: withBase(entry.pagePath) + '#quiz',
    }
  })
})

const filteredRows = computed(() => {
  if (filter.value === 'started') return topicRows.value.filter(r => r.started && !r.mastered)
  if (filter.value === 'mastered') return topicRows.value.filter(r => r.mastered)
  if (filter.value === 'not-started') return topicRows.value.filter(r => !r.started)
  return topicRows.value
})

const sections = computed(() => {
  const groups = {}
  for (const row of filteredRows.value) {
    if (!groups[row.section]) groups[row.section] = []
    groups[row.section].push(row)
  }
  return groups
})

const globalStats = computed(() => {
  if (!progressStore.value) {
    return { topicsStarted: 0, topicsMastered: 0, totalCorrect: 0, totalAnswered: 0, overallPercent: 0, streak: 0 }
  }
  return computeGlobalStats(progressStore.value, totalQuizQuestions())
})

const summaryCards = computed(() => [
  { label: 'Topics with quizzes', value: QUIZ_INDEX.length },
  { label: 'Started', value: topicRows.value.filter(r => r.started).length },
  { label: 'Mastered (≥80%)', value: topicRows.value.filter(r => r.mastered).length },
  { label: 'Day streak', value: progressStore.value?.streak ?? 0 },
])
</script>

<template>
  <div class="quiz-dashboard">
    <p class="intro">
      Track your progress across handbook quizzes. All data stays in your browser.
    </p>

    <div class="summary-cards">
      <div v-for="card in summaryCards" :key="card.label" class="summary-card">
        <span class="card-value">{{ card.value }}</span>
        <span class="card-label">{{ card.label }}</span>
      </div>
    </div>

    <div class="filters">
      <button
        v-for="f in [
          { id: 'all', label: 'All' },
          { id: 'not-started', label: 'Not started' },
          { id: 'started', label: 'In progress' },
          { id: 'mastered', label: 'Mastered' },
        ]"
        :key="f.id"
        type="button"
        class="filter-btn"
        :class="{ active: filter === f.id }"
        @click="filter = f.id"
      >{{ f.label }}</button>
    </div>

    <div v-for="(rows, section) in sections" :key="section" class="section-group">
      <h3>{{ section }}</h3>
      <div class="topic-list">
        <a
          v-for="row in rows"
          :key="row.pagePath"
          :href="row.link"
          class="topic-row"
        >
          <span class="topic-title">
            <span v-if="row.mastered" class="star" title="Mastered">★</span>
            {{ row.title }}
          </span>
          <span class="topic-progress">
            <span class="mini-bar">
              <span class="mini-fill" :style="{ width: row.percent + '%' }" />
            </span>
            <span class="topic-stats">
              {{ row.started ? `${row.correct}/${row.total} · ${row.percent}%` : 'Not started' }}
            </span>
          </span>
        </a>
      </div>
    </div>

    <p v-if="filteredRows.length === 0" class="empty">No topics match this filter.</p>
  </div>
</template>

<style scoped>
.quiz-dashboard {
  max-width: 720px;
}

.intro {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.summary-card {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  text-align: center;
}

.card-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.card-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.filter-btn.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.section-group {
  margin-bottom: 28px;
}

.section-group h3 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin-bottom: 10px;
  border: none;
  padding: 0;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topic-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: border-color 0.15s;
  flex-wrap: wrap;
}

.topic-row:hover {
  border-color: var(--vp-c-brand-1);
}

.topic-title {
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.star {
  color: #eab308;
}

.topic-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
}

.mini-bar {
  width: 80px;
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  display: block;
}

.topic-stats {
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.empty {
  color: var(--vp-c-text-3);
  font-style: italic;
}
</style>