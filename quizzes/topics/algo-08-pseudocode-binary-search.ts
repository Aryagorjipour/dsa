import type { QuizPack } from '../types'

export default {
  pagePath: '/algorithms/08-pseudocode-binary-search',
  topicId: 'pseudocode-binary-search',
  title: 'Pseudocode Binary Search and Variants',
  quiz: [
    {
      id: 'pbs-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'In standard binary search pseudocode, when should the loop continue?',
      options: [
        { id: 'a', text: 'while low <= high' },
        { id: 'b', text: 'while low < high' },
        { id: 'c', text: 'while high > 0' },
        { id: 'd', text: 'while mid != target' },
      ],
      correct: ['a'],
      explanation: 'Classic inclusive bounds [low, high] require low <= high. Stopping at low < high is a different invariant.',
    },
    {
      id: 'pbs-q2',
      type: 'fill-blank',
      difficulty: 'easy',
      question: 'Overflow-safe mid calculation: mid = low + (high - low) / ___',
      correct: ['2'],
      explanation: 'Halving the span (high - low) avoids integer overflow from (low + high) in large indices.',
    },
    {
      id: 'pbs-q3',
      type: 'true-false',
      difficulty: 'medium',
      question: 'Writing pseudocode first helps you focus on the loop invariant before wrestling with edge cases in real code.',
      correct: true,
      explanation: 'The chapter stresses invariant-first thinking: target, if present, stays within [low, high] while the space halves.',
    },
    {
      id: 'pbs-q4',
      type: 'trace',
      difficulty: 'medium',
      question: 'Sorted array with duplicates [1, 2, 2, 2, 3]. Find first occurrence of 2 using lower-bound logic. Final answer index?',
      options: [
        { id: 'a', text: 'Index 1' },
        { id: 'b', text: 'Index 2' },
        { id: 'c', text: 'Index 3' },
        { id: 'd', text: 'Index 4' },
      ],
      correct: ['a'],
      explanation: 'On match, record ans=mid and set high=mid-1 to keep searching left for the first 2.',
    },
    {
      id: 'pbs-q5',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'In rotated sorted array search, why check if nums[left] <= nums[mid]?',
      code: `if (nums[left] <= nums[mid]) {
    if (nums[left] <= target && target < nums[mid])
        right = mid - 1;
    else
        left = mid + 1;
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Determines which half is sorted so you know where target can lie' },
        { id: 'b', text: 'Detects duplicate elements only' },
        { id: 'c', text: 'Proves the array was never rotated' },
        { id: 'd', text: 'Replaces the need for comparing mid to target' },
      ],
      correct: ['a'],
      explanation: 'Rotation breaks global order but one half is always sorted. Compare target only within that sorted half.',
    },
    {
      id: 'pbs-q6',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Sorted array [10, 20, 30, 40, 50], target 25 (not present). What does classic binary search return?',
      options: [
        { id: 'a', text: '-1 after low > high' },
        { id: 'b', text: 'Index 2 (value 30)' },
        { id: 'c', text: 'Index 1 (value 20)' },
        { id: 'd', text: 'Throws an exception' },
      ],
      correct: ['a'],
      explanation: 'Standard search returns -1 when the invariant range empties without a match. Lower bound would differ.',
    },
    {
      id: 'pbs-q7',
      type: 'mcq-multi',
      difficulty: 'hard',
      question: 'Real binary search code must handle which edge cases? (Select all that apply)',
      options: [
        { id: 'a', text: 'Empty array (length 0)' },
        { id: 'b', text: 'Target smaller than all elements' },
        { id: 'c', text: 'Target larger than all elements' },
        { id: 'd', text: 'Unsorted array in O(log n) without preprocessing' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Pseudocode maps cleanly once you handle empty bounds and targets outside the value range. Unsorted data cannot be binary searched in O(log n).',
    },
    {
      id: 'pbs-q8',
      type: 'trace',
      difficulty: 'hard',
      question: 'Rotated sorted array [4, 5, 6, 7, 0, 1, 2], target 0. Which index is returned?',
      options: [
        { id: 'a', text: 'Index 4' },
        { id: 'b', text: 'Index 0' },
        { id: 'c', text: 'Index 3' },
        { id: 'd', text: '-1' },
      ],
      correct: ['a'],
      explanation: 'Classic chapter example: pivot rotation places 0 at index 4; rotated-search logic narrows to it.',
    },
  ],
  challenges: [
    {
      id: 'pbs-c1',
      type: 'variant',
      difficulty: 'hard',
      question: 'Find last occurrence (upper bound) of target in a sorted array with duplicates. On arr[mid] == target, which direction do you continue searching?',
      options: [
        { id: 'a', text: 'Set low = mid + 1 (search right)' },
        { id: 'b', text: 'Set high = mid - 1 (search left)' },
        { id: 'c', text: 'Return mid immediately' },
        { id: 'd', text: 'Restart from index 0' },
      ],
      correct: ['a'],
      explanation: 'Mirror of find-first: record ans on match, then move right to capture the last equal element.',
    },
    {
      id: 'pbs-c2',
      type: 'mini-code',
      difficulty: 'medium',
      question: 'Implement findFirst (lower bound) from the chapter pseudocode. Test on [1, 2, 2, 2, 3] for target 2 — expect index 1.',
      rubric: [
        'Initialize low=0, high=len-1, ans=-1',
        'Loop while low <= high with overflow-safe mid',
        'On match: ans=mid, high=mid-1',
        'On arr[mid] < target: low=mid+1; else high=mid-1',
        'Return ans (1 for the sample)',
      ],
      explanation: 'Translate pseudocode to code precisely. This variant is the template for many bound problems.',
    },
  ],
} satisfies QuizPack