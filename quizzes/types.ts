export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionType =
  | 'mcq'
  | 'mcq-multi'
  | 'true-false'
  | 'complexity'
  | 'fill-blank'
  | 'code-analysis'
  | 'ordering'
  | 'matching'
  | 'scenario'
  | 'trace'
  | 'design'
  | 'mini-code'
  | 'debug'
  | 'variant'

export interface QuestionOption {
  id: string
  text: string
}

export interface MatchingPair {
  id: string
  left: string
  right: string
}

export interface BaseQuestion {
  id: string
  type: QuestionType
  difficulty: Difficulty
  question: string
  explanation: string
  misconception?: string
  code?: string
  codeLang?: 'go' | 'csharp' | 'pseudocode'
}

export interface McqQuestion extends BaseQuestion {
  type: 'mcq' | 'mcq-multi' | 'complexity' | 'code-analysis' | 'scenario' | 'trace' | 'design' | 'debug' | 'variant'
  options: QuestionOption[]
  correct: string[]
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false'
  correct: boolean
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank'
  correct: string[]
  aliases?: string[]
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering'
  items: QuestionOption[]
  correct: string[]
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching'
  pairs: MatchingPair[]
}

export interface MiniCodeQuestion extends BaseQuestion {
  type: 'mini-code'
  playgroundLang?: 'go' | 'csharp'
  starterCode?: string
  rubric: string[]
}

export type Question =
  | McqQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | OrderingQuestion
  | MatchingQuestion
  | MiniCodeQuestion

export interface QuizPack {
  pagePath: string
  topicId: string
  title: string
  quiz: Question[]
  challenges: Question[]
}

export interface QuestionState {
  attempts: number
  correct: boolean
  lastAnswer: string[] | boolean
  answeredAt: number
  firstAttemptCorrect?: boolean
}

export interface TopicProgress {
  pagePath: string
  questionStates: Record<string, QuestionState>
  lastVisitedAt: number
}

export interface QuizProgressStore {
  topics: Record<string, TopicProgress>
  streak: number
  lastActiveDate: string | null
  studyMode: boolean
}

export const MASTERY_THRESHOLD = 0.8