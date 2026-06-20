<script setup>
import { computed } from 'vue'
import { isMcqLike } from '../../../quizzes/grading'

const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: [Array, Boolean], default: null },
  submitted: { type: Boolean, default: false },
  correct: { type: Boolean, default: null },
  studyMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isMcq = computed(() => isMcqLike(props.question.type))
const isMulti = computed(() => props.question.type === 'mcq-multi')
const isTrueFalse = computed(() => props.question.type === 'true-false')
const isFillBlank = computed(() => props.question.type === 'fill-blank')
const isOrdering = computed(() => props.question.type === 'ordering')
const isMatching = computed(() => props.question.type === 'matching')
const isMiniCode = computed(() => props.question.type === 'mini-code')

const difficultyClass = computed(() => `diff-${props.question.difficulty}`)

const orderingItems = computed(() => {
  if (!isOrdering.value) return []
  if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    const ids = props.modelValue
    return ids.map(id => props.question.items.find(i => i.id === id)).filter(Boolean)
  }
  return [...props.question.items]
})

const rightOptions = computed(() => {
  if (!isMatching.value) return []
  return [...new Set(props.question.pairs.map(p => p.right))]
})

function mcqSelected(id) {
  return Array.isArray(props.modelValue) && props.modelValue.includes(id)
}

function toggleMcq(id) {
  if (props.submitted && !props.studyMode) return
  if (isMulti.value) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = current.indexOf(id)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(id)
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', [id])
  }
}

function setTrueFalse(val) {
  if (props.submitted && !props.studyMode) return
  emit('update:modelValue', val)
}

function setFillBlank(e) {
  emit('update:modelValue', [e.target.value])
}

function optionClass(id) {
  if (!props.submitted && !props.studyMode) {
    return mcqSelected(id) ? 'selected' : ''
  }
  const isCorrect = props.question.correct?.includes(id)
  if (isCorrect) return 'correct'
  if (mcqSelected(id) && !isCorrect) return 'incorrect'
  return ''
}

function moveOrder(index, dir) {
  const items = orderingItems.value.map(i => i.id)
  const target = index + dir
  if (target < 0 || target >= items.length) return
  ;[items[index], items[target]] = [items[target], items[index]]
  emit('update:modelValue', items)
}

function matchSelection(pairId, right) {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const prefix = `${pairId}=`
  const filtered = current.filter(v => !v.startsWith(prefix))
  filtered.push(`${pairId}=${right}`)
  emit('update:modelValue', filtered)
}

function getMatchValue(pairId) {
  if (!Array.isArray(props.modelValue)) return ''
  const entry = props.modelValue.find(v => v.startsWith(`${pairId}=`))
  return entry ? entry.slice(pairId.length + 1) : ''
}

function toggleRubricItem(index) {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const key = String(index)
  const idx = current.indexOf(key)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(key)
  emit('update:modelValue', current)
}

function rubricChecked(index) {
  return Array.isArray(props.modelValue) && props.modelValue.includes(String(index))
}

const showExplanation = computed(() => props.submitted || props.studyMode)
</script>

<template>
  <div class="quiz-question">
    <div class="question-meta">
      <span class="difficulty" :class="difficultyClass">{{ question.difficulty }}</span>
      <span class="type-badge">{{ question.type.replace(/-/g, ' ') }}</span>
    </div>

    <p class="question-text">{{ question.question }}</p>

    <pre v-if="question.code" class="question-code"><code>{{ question.code }}</code></pre>

    <!-- MCQ types -->
    <div
      v-if="isMcq"
      class="options"
      role="radiogroup"
      :aria-label="question.question"
    >
      <button
        v-for="opt in question.options"
        :key="opt.id"
        type="button"
        class="option"
        :class="optionClass(opt.id)"
        :aria-pressed="mcqSelected(opt.id)"
        @click="toggleMcq(opt.id)"
      >
        <span class="option-marker" aria-hidden="true">{{ mcqSelected(opt.id) ? '●' : '○' }}</span>
        <span>{{ opt.text }}</span>
        <span
          v-if="(submitted || studyMode) && question.correct.includes(opt.id)"
          class="result-icon correct-icon"
          aria-label="Correct"
        >✓</span>
        <span
          v-if="submitted && mcqSelected(opt.id) && !question.correct.includes(opt.id)"
          class="result-icon incorrect-icon"
          aria-label="Incorrect"
        >✗</span>
      </button>
    </div>

    <!-- True/False -->
    <div v-if="isTrueFalse" class="options tf-options">
      <button
        type="button"
        class="option"
        :class="{ selected: modelValue === true, correct: (submitted || studyMode) && question.correct === true, incorrect: submitted && modelValue === true && !question.correct }"
        @click="setTrueFalse(true)"
      >True</button>
      <button
        type="button"
        class="option"
        :class="{ selected: modelValue === false, correct: (submitted || studyMode) && question.correct === false, incorrect: submitted && modelValue === false && !question.correct }"
        @click="setTrueFalse(false)"
      >False</button>
    </div>

    <!-- Fill blank -->
    <div v-if="isFillBlank" class="fill-blank">
      <input
        type="text"
        class="blank-input"
        :value="Array.isArray(modelValue) ? modelValue[0] : ''"
        :disabled="submitted && !studyMode"
        placeholder="Type your answer…"
        aria-label="Answer"
        @input="setFillBlank"
      />
      <p v-if="(submitted || studyMode) && !correct" class="hint-answer">
        Accepted: {{ [...question.correct, ...(question.aliases || [])].join(', ') }}
      </p>
    </div>

    <!-- Ordering -->
    <div v-if="isOrdering" class="ordering">
      <div
        v-for="(item, idx) in orderingItems"
        :key="item.id"
        class="order-item"
      >
        <span class="order-num">{{ idx + 1 }}</span>
        <span class="order-text">{{ item.text }}</span>
        <div class="order-actions">
          <button type="button" aria-label="Move up" :disabled="idx === 0" @click="moveOrder(idx, -1)">↑</button>
          <button type="button" aria-label="Move down" :disabled="idx === orderingItems.length - 1" @click="moveOrder(idx, 1)">↓</button>
        </div>
      </div>
    </div>

    <!-- Matching -->
    <div v-if="isMatching" class="matching">
      <div v-for="pair in question.pairs" :key="pair.id" class="match-row">
        <span class="match-left">{{ pair.left }}</span>
        <select
          class="match-select"
          :value="getMatchValue(pair.id)"
          :disabled="submitted && !studyMode"
          @change="matchSelection(pair.id, $event.target.value)"
        >
          <option value="" disabled>Select…</option>
          <option v-for="r in rightOptions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </div>

    <!-- Mini-code rubric -->
    <div v-if="isMiniCode" class="mini-code">
      <p class="rubric-hint">Self-check: mark each item when your solution satisfies it.</p>
      <label
        v-for="(item, idx) in question.rubric"
        :key="idx"
        class="rubric-item"
      >
        <input
          type="checkbox"
          :checked="rubricChecked(idx)"
          :disabled="submitted && !studyMode"
          @change="toggleRubricItem(idx)"
        />
        <span>{{ item }}</span>
      </label>
    </div>

    <!-- Feedback -->
    <div
      v-if="showExplanation"
      class="feedback"
      :class="{ 'is-correct': correct, 'is-incorrect': submitted && !correct }"
      role="status"
      aria-live="polite"
    >
      <p v-if="submitted" class="feedback-status">
        <strong>{{ correct ? 'Correct!' : 'Not quite.' }}</strong>
      </p>
      <p class="explanation">{{ question.explanation }}</p>
      <p v-if="question.misconception && submitted && !correct" class="misconception">
        <strong>Common trap:</strong> {{ question.misconception }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.quiz-question {
  font-size: 14px;
}

.question-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.difficulty {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 4px;
}

.diff-easy { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
.diff-medium { background: rgba(234, 179, 8, 0.15); color: #ca8a04; }
.diff-hard { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

html.dark .diff-easy { color: #4ade80; }
html.dark .diff-medium { color: #facc15; }
html.dark .diff-hard { color: #f87171; }

.type-badge {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-transform: capitalize;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  margin: 0 0 12px;
  color: var(--vp-c-text-1);
}

.question-code {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tf-options {
  flex-direction: row;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 14px;
  color: var(--vp-c-text-1);
  transition: border-color 0.15s, background 0.15s;
  min-height: 44px;
}

.tf-options .option {
  flex: 1;
  justify-content: center;
}

.option:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
}

.option.selected {
  border-color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.08);
}

.option.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.option.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.option-marker {
  flex-shrink: 0;
  color: var(--vp-c-brand-1);
}

.result-icon {
  margin-left: auto;
  font-weight: 700;
}

.correct-icon { color: #22c55e; }
.incorrect-icon { color: #ef4444; }

.blank-input {
  width: 100%;
  max-width: 320px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.hint-answer {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 8px;
}

.ordering {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.order-num {
  font-weight: 700;
  color: var(--vp-c-brand-1);
  min-width: 20px;
}

.order-text { flex: 1; }

.order-actions button {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.matching {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.match-left {
  flex: 1;
  min-width: 140px;
  font-weight: 500;
}

.match-select {
  flex: 1;
  min-width: 160px;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  min-height: 44px;
}

.mini-code .rubric-hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.rubric-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  cursor: pointer;
  font-size: 13px;
}

.feedback {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.feedback.is-correct {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.06);
}

.feedback.is-incorrect {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.feedback-status {
  margin: 0 0 6px;
}

.explanation {
  margin: 0;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.misconception {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>