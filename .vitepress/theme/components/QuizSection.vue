<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { handbookLink } from '../utils/handbookLink'
import QuizQuestion from './QuizQuestion.vue'
import { useQuiz } from '../composables/useQuiz'
import { buildPlaygroundUrl } from '../utils/playgroundUrl'

const {
  pack,
  packLoading,
  pageHasQuiz,
  expanded,
  activeTab,
  currentIndex,
  currentQuestion,
  activeQuestions,
  totalQuestions,
  pendingAnswer,
  submitted,
  lastCorrect,
  studyMode,
  quizStats,
  challengeStats,
  masteryPercent,
  isMastered,
  summaryText,
  topicProgress,
  setPending,
  submitAnswer,
  retryQuestion,
  goToQuestion,
  toggleStudyMode,
  loadQuizData,
} = useQuiz()

onMounted(() => loadQuizData())

const canSubmit = computed(() => {
  if (!currentQuestion.value || pendingAnswer.value === null) return false
  if (currentQuestion.value.type === 'fill-blank') {
    return Array.isArray(pendingAnswer.value) && pendingAnswer.value[0]?.trim()
  }
  if (currentQuestion.value.type === 'matching') {
    const pairs = currentQuestion.value.pairs?.length ?? 0
    return Array.isArray(pendingAnswer.value) && pendingAnswer.value.length === pairs
  }
  if (currentQuestion.value.type === 'mini-code') {
    return Array.isArray(pendingAnswer.value) && pendingAnswer.value.length === currentQuestion.value.rubric.length
  }
  if (currentQuestion.value.type === 'true-false') {
    return typeof pendingAnswer.value === 'boolean'
  }
  return Array.isArray(pendingAnswer.value) && pendingAnswer.value.length > 0
})

function handleKeydown(e) {
  if (!expanded.value || !pageHasQuiz.value) return
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

  if (e.key === 'ArrowLeft') {
    goToQuestion(currentIndex.value - 1)
  } else if (e.key === 'ArrowRight') {
    goToQuestion(currentIndex.value + 1)
  } else if (e.key === 'Enter' && canSubmit.value && !submitted.value) {
    submitAnswer()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

watch(expanded, val => {
  if (val && pack.value) {
    history.replaceState(null, '', `${location.pathname}${location.search}#quiz`)
  }
})

function playgroundUrl() {
  return buildPlaygroundUrl({ from: pack.value?.pagePath || '' })
}
</script>

<template>
  <section
    v-if="pageHasQuiz"
    id="quiz"
    class="quiz-section"
    aria-label="Quizzes and Challenges"
  >
    <div class="quiz-header">
      <button
        class="quiz-toggle"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        <span class="quiz-title">
          <span class="quiz-icon" aria-hidden="true">✦</span>
          Quizzes &amp; Challenges
          <span v-if="isMastered" class="mastered-badge" title="Topic mastered">★</span>
        </span>
        <span class="quiz-summary">{{ packLoading ? 'Loading…' : summaryText }}</span>
        <span class="arrow" aria-hidden="true">{{ expanded ? '▾' : '▸' }}</span>
      </button>
    </div>

    <div v-if="expanded && pack" class="quiz-body">
      <div class="quiz-toolbar">
        <div class="tabs" role="tablist">
          <button
            role="tab"
            class="tab"
            :class="{ active: activeTab === 'quiz' }"
            :aria-selected="activeTab === 'quiz'"
            @click="activeTab = 'quiz'"
          >
            Knowledge Check
            <span class="tab-count">{{ quizStats.correct }}/{{ pack.quiz.length }}</span>
          </button>
          <button
            role="tab"
            class="tab challenge-tab"
            :class="{ active: activeTab === 'challenges' }"
            :aria-selected="activeTab === 'challenges'"
            @click="activeTab = 'challenges'"
          >
            ⚡ Challenges
            <span class="tab-count">{{ challengeStats.correct }}/{{ pack.challenges.length }}</span>
          </button>
        </div>

        <div class="toolbar-actions">
          <button
            type="button"
            class="tool-btn"
            :class="{ active: studyMode }"
            :aria-pressed="studyMode"
            title="Reveal answers without submitting"
            @click="toggleStudyMode"
          >
            Study mode
          </button>
          <a :href="handbookLink('/quizzes')" class="tool-btn link">All progress</a>
        </div>
      </div>

      <div class="progress-bar-wrap" role="progressbar" :aria-valuenow="masteryPercent" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" :style="{ width: masteryPercent + '%' }" />
      </div>

      <div v-if="currentQuestion" class="question-area">
        <div class="question-nav-top">
          <span class="q-counter">Question {{ currentIndex + 1 }} of {{ totalQuestions }}</span>
        </div>

        <QuizQuestion
          :question="currentQuestion"
          :model-value="pendingAnswer"
          :submitted="submitted"
          :correct="lastCorrect"
          :study-mode="studyMode"
          @update:model-value="setPending"
        />

        <div v-if="currentQuestion.type === 'mini-code'" class="playground-link">
          <a :href="playgroundUrl()" class="btn primary">Open in Playground</a>
        </div>

        <div class="question-actions">
          <button
            type="button"
            class="btn"
            :disabled="currentIndex === 0"
            @click="goToQuestion(currentIndex - 1)"
          >← Prev</button>

          <button
            v-if="!submitted || studyMode"
            type="button"
            class="btn primary"
            :disabled="!canSubmit"
            @click="submitAnswer"
          >Check Answer</button>
          <button
            v-else
            type="button"
            class="btn"
            @click="retryQuestion"
          >Try Again</button>

          <button
            type="button"
            class="btn"
            :disabled="currentIndex >= totalQuestions - 1"
            @click="goToQuestion(currentIndex + 1)"
          >Next →</button>
        </div>

        <div class="question-dots" role="navigation" aria-label="Question navigation">
          <button
            v-for="(q, idx) in activeQuestions"
            :key="q.id"
            type="button"
            class="dot"
            :class="{
              active: idx === currentIndex,
              done: topicProgress?.questionStates?.[q.id]?.correct,
            }"
            :aria-label="`Question ${idx + 1}`"
            :aria-current="idx === currentIndex ? 'step' : undefined"
            @click="goToQuestion(idx)"
          />
        </div>

        <p class="keyboard-hint">← → navigate · Enter to submit</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.quiz-section {
  margin: 32px 0 8px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.quiz-header {
  margin-bottom: 0;
}

.quiz-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s;
}

.quiz-toggle:hover {
  border-color: var(--vp-c-brand-1);
}

.quiz-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.quiz-icon {
  color: var(--vp-c-brand-1);
}

.mastered-badge {
  color: #eab308;
  font-size: 14px;
}

.quiz-summary {
  margin-left: auto;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.arrow {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.quiz-body {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.quiz-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.tab.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.challenge-tab.active {
  background: #7c3aed;
  border-color: #7c3aed;
}

.tab-count {
  margin-left: 6px;
  opacity: 0.85;
  font-size: 11px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.tool-btn {
  padding: 5px 10px;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: pointer;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.tool-btn.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.progress-bar-wrap {
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  margin-bottom: 16px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.3s ease;
}

.question-nav-top {
  margin-bottom: 12px;
}

.q-counter {
  font-size: 12px;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.playground-link {
  margin: 12px 0;
}

.question-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.btn {
  padding: 8px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-1);
  min-height: 44px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.question-dots {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 14px;
  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  padding: 0;
  cursor: pointer;
}

.dot.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.dot.done {
  background: #22c55e;
  border-color: #22c55e;
}

.keyboard-hint {
  text-align: center;
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin-top: 10px;
}

@media (max-width: 640px) {
  .quiz-toggle {
    flex-wrap: wrap;
  }

  .quiz-summary {
    margin-left: 0;
    width: 100%;
    order: 3;
  }

  .question-actions .btn {
    flex: 1;
    min-width: 80px;
  }
}
</style>