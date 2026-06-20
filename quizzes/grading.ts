import type { Question } from './types'

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/²/g, '2')
    .replace(/\^/g, '')
}

export function gradeAnswer(question: Question, answer: string[] | boolean): boolean {
  switch (question.type) {
    case 'true-false':
      return typeof answer === 'boolean' && answer === question.correct

    case 'fill-blank': {
      if (typeof answer === 'boolean' || answer.length === 0) return false
      const raw = normalize(answer[0])
      const accepted = [
        ...question.correct.map(normalize),
        ...(question.aliases ?? []).map(normalize),
      ]
      return accepted.some(a => raw === a || raw.includes(a) || a.includes(raw))
    }

    case 'ordering': {
      if (typeof answer === 'boolean') return false
      return (
        answer.length === question.correct.length &&
        answer.every((id, i) => id === question.correct[i])
      )
    }

    case 'matching': {
      if (typeof answer === 'boolean') return false
      const expected = question.pairs.map(p => `${p.id}=${p.right}`)
      const given = [...answer].sort()
      const exp = [...expected].sort()
      return given.length === exp.length && given.every((v, i) => v === exp[i])
    }

    case 'mini-code':
      return typeof answer !== 'boolean' && answer.length === question.rubric.length

    default: {
      if (typeof answer === 'boolean') return false
      const correct = [...question.correct].sort()
      const given = [...answer].sort()
      return (
        correct.length === given.length &&
        correct.every((id, i) => id === given[i])
      )
    }
  }
}

export function isMcqLike(type: string): boolean {
  return [
    'mcq', 'mcq-multi', 'complexity', 'code-analysis', 'scenario',
    'trace', 'design', 'debug', 'variant',
  ].includes(type)
}