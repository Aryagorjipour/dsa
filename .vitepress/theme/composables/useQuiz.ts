import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import type { QuizPack, Question, TopicProgress, QuizProgressStore } from '../../../quizzes/types'
import { MASTERY_THRESHOLD } from '../../../quizzes/types'
import { gradeAnswer } from '../../../quizzes/grading'
import { loadQuizPack, hasQuiz } from '../../../quizzes/registry'
import { normalizePagePath } from '../utils/normalizePagePath'
import {
  getQuizProgress,
  setQuizProgress,
  updateQuizStreak,
} from './useStorage'

const progressStore = ref<QuizProgressStore | null>(null)
const loaded = ref(false)

export async function loadQuizData() {
  progressStore.value = await getQuizProgress()
  loaded.value = true
}

function ensureTopic(pagePath: string): TopicProgress {
  if (!progressStore.value) {
    progressStore.value = { topics: {}, streak: 0, lastActiveDate: null, studyMode: false }
  }
  if (!progressStore.value.topics[pagePath]) {
    progressStore.value.topics[pagePath] = {
      pagePath,
      questionStates: {},
      lastVisitedAt: Date.now(),
    }
  }
  return progressStore.value.topics[pagePath]
}

async function persist() {
  if (progressStore.value) {
    await setQuizProgress(progressStore.value)
  }
}

export function useQuiz() {
  const route = useRoute()
  const pack = ref<QuizPack | null>(null)
  const packLoading = ref(false)
  const clientReady = ref(false)
  const expanded = ref(false)
  const activeTab = ref<'quiz' | 'challenges'>('quiz')
  const currentIndex = ref(0)
  const studyMode = ref(false)
  const pendingAnswer = ref<string[] | boolean | null>(null)
  const submitted = ref(false)
  const lastCorrect = ref<boolean | null>(null)

  const pagePath = computed(() => normalizePagePath(route.path))
  const pageHasQuiz = computed(() => hasQuiz(pagePath.value))

  const activeQuestions = computed(() => {
    if (!pack.value) return []
    return activeTab.value === 'quiz' ? pack.value.quiz : pack.value.challenges
  })

  const currentQuestion = computed(() => activeQuestions.value[currentIndex.value] ?? null)

  const topicProgress = computed(() => {
    if (!progressStore.value || !pack.value) return null
    const key = pagePath.value
    return progressStore.value.topics[key]
      ?? progressStore.value.topics[route.path]
      ?? null
  })

  function countCorrect(questions: Question[]): { answered: number; correct: number } {
    const states = topicProgress.value?.questionStates ?? {}
    let answered = 0
    let correct = 0
    for (const q of questions) {
      const s = states[q.id]
      if (s) {
        answered++
        if (s.correct) correct++
      }
    }
    return { answered, correct }
  }

  const quizStats = computed(() => countCorrect(pack.value?.quiz ?? []))
  const challengeStats = computed(() => countCorrect(pack.value?.challenges ?? []))
  const totalQuestions = computed(() => activeQuestions.value.length)

  const masteryPercent = computed(() => {
    if (!pack.value) return 0
    const all = [...pack.value.quiz, ...pack.value.challenges]
    if (all.length === 0) return 0
    const { correct } = countCorrect(all)
    return Math.round((correct / all.length) * 100)
  })

  const isMastered = computed(() => masteryPercent.value >= MASTERY_THRESHOLD * 100)

  const summaryText = computed(() => {
    if (!pack.value) return ''
    const all = [...pack.value.quiz, ...pack.value.challenges]
    const { correct } = countCorrect(all)
    return `${correct}/${all.length} correct · ${masteryPercent.value}%`
  })

  async function loadPack() {
    if (typeof window === 'undefined') return

    if (!pageHasQuiz.value) {
      pack.value = null
      return
    }
    packLoading.value = true
    pack.value = await loadQuizPack(pagePath.value)
    packLoading.value = false

    if (clientReady.value && window.location.hash.startsWith('#quiz')) {
      expanded.value = true
      const qMatch = window.location.hash.match(/#quiz\/q(\d+)/)
      if (qMatch) {
        const idx = parseInt(qMatch[1], 10) - 1
        if (idx >= 0) currentIndex.value = idx
      }
    }

    if (!loaded.value) await loadQuizData()
    studyMode.value = progressStore.value?.studyMode ?? false
  }

  function resetQuestionState() {
    pendingAnswer.value = null
    submitted.value = false
    lastCorrect.value = null
  }

  function restoreAnswerForQuestion(q: Question | null) {
    resetQuestionState()
    if (!q) return

    if (q.type === 'ordering') {
      pendingAnswer.value = q.items.map(i => i.id)
    }

    if (!topicProgress.value) return
    const state = topicProgress.value.questionStates[q.id]
    if (!state) return
    pendingAnswer.value = state.lastAnswer
    submitted.value = true
    lastCorrect.value = state.correct
  }

  watch(currentQuestion, q => restoreAnswerForQuestion(q), { immediate: true })

  watch(activeTab, () => {
    currentIndex.value = 0
    resetQuestionState()
  })

  onMounted(() => {
    clientReady.value = true
    if (window.location.hash.startsWith('#quiz')) {
      expanded.value = true
      const qMatch = window.location.hash.match(/#quiz\/q(\d+)/)
      if (qMatch) {
        const idx = parseInt(qMatch[1], 10) - 1
        if (idx >= 0) currentIndex.value = idx
      }
    }
  })

  watch(pagePath, () => {
    if (typeof window === 'undefined') return
    currentIndex.value = 0
    if (clientReady.value) {
      expanded.value = window.location.hash.startsWith('#quiz')
    }
    activeTab.value = 'quiz'
    loadPack()
  }, { immediate: true })

  function setPending(answer: string[] | boolean) {
    pendingAnswer.value = answer
    if (submitted.value) submitted.value = false
  }

  async function submitAnswer() {
    const q = currentQuestion.value
    if (!q || pendingAnswer.value === null) return

    const correct = gradeAnswer(q, pendingAnswer.value)
    lastCorrect.value = correct
    submitted.value = true

    const topic = ensureTopic(pagePath.value)
    const existing = topic.questionStates[q.id]
    const isFirst = !existing

    topic.questionStates[q.id] = {
      attempts: (existing?.attempts ?? 0) + 1,
      correct,
      lastAnswer: pendingAnswer.value,
      answeredAt: Date.now(),
      firstAttemptCorrect: isFirst ? correct : existing?.firstAttemptCorrect,
    }
    topic.lastVisitedAt = Date.now()

    if (correct && progressStore.value) {
      progressStore.value = await updateQuizStreak(progressStore.value)
    }

    await persist()
  }

  function retryQuestion() {
    pendingAnswer.value = null
    submitted.value = false
    lastCorrect.value = null
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < totalQuestions.value) {
      currentIndex.value = index
    }
  }

  function toggleStudyMode() {
    studyMode.value = !studyMode.value
    if (progressStore.value) {
      progressStore.value.studyMode = studyMode.value
      persist()
    }
  }

  return {
    pack,
    packLoading,
    clientReady,
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
    progressStore,
    loaded,
    setPending,
    submitAnswer,
    retryQuestion,
    goToQuestion,
    toggleStudyMode,
    loadPack,
    loadQuizData,
  }
}

export function computeGlobalStats(store: QuizProgressStore, totalAvailable: number) {
  let topicsStarted = 0
  let topicsMastered = 0
  let totalCorrect = 0
  let totalAnswered = 0

  for (const topic of Object.values(store.topics)) {
    const states = Object.values(topic.questionStates)
    if (states.length > 0) topicsStarted++
    const correct = states.filter(s => s.correct).length
    const answered = states.length
    totalCorrect += correct
    totalAnswered += answered
    if (answered > 0 && correct / answered >= MASTERY_THRESHOLD) {
      topicsMastered++
    }
  }

  const overallPercent = totalAvailable > 0
    ? Math.round((totalCorrect / totalAvailable) * 100)
    : 0

  return { topicsStarted, topicsMastered, totalCorrect, totalAnswered, overallPercent, streak: store.streak }
}