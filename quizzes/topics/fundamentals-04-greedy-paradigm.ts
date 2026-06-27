import type { QuizPack } from '../types'

export default {
  pagePath: '/fundamentals/04-greedy-paradigm',
  topicId: 'greedy',
  title: 'Greedy Paradigm',
  quiz: [
    {
      id: 'greedy-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'A greedy algorithm is characterized by:',
      options: [
        { id: 'a', text: 'Making the locally optimal choice at each step without revisiting past decisions' },
        { id: 'b', text: 'Trying all possibilities and undoing wrong choices' },
        { id: 'c', text: 'Caching every overlapping subproblem in a table' },
        { id: 'd', text: 'Always dividing the input in half recursively' },
      ],
      correct: ['a'],
      explanation: 'Greedy never goes back. That makes it fast when it works — and dangerous when local choices lead to a suboptimal global answer.',
    },
    {
      id: 'greedy-q2',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Coin change: denominations [1, 3, 4], amount = 6. What happens to the greedy strategy?',
      options: [
        { id: 'a', text: 'Greedy gives 4+1+1 = 3 coins; optimal is 3+3 = 2 coins — greedy fails' },
        { id: 'b', text: 'Greedy always optimal for any coin system' },
        { id: 'c', text: 'Greedy gives 3+3 but that uses forbidden coins' },
        { id: 'd', text: 'Greedy requires dynamic programming for US coins only' },
      ],
      correct: ['a'],
      explanation: 'US coins (25,10,5,1) make greedy work for 67¢, but arbitrary systems break it — classic greedy failure example from the chapter.',
      misconception: 'A strategy that works for one denomination set does not generalize.',
    },
    {
      id: 'greedy-q3',
      type: 'matching',
      difficulty: 'medium',
      question: 'Match each problem to why greedy is proven or commonly used:',
      pairs: [
        { id: '1', left: 'Huffman coding', right: 'Greedy merge of lowest-frequency nodes builds optimal prefix codes' },
        { id: '2', left: 'Kruskal / Prim MST', right: 'Greedy edge/vertex choices yield minimum total weight' },
        { id: '3', left: 'Dijkstra (non-negative edges)', right: 'Settling closest unsettled vertex is locally optimal' },
      ],
      explanation: 'These are the chapter\'s flagship "greedy works" examples — compression, network design, and routing.',
    },
    {
      id: 'greedy-q4',
      type: 'true-false',
      difficulty: 'easy',
      question: 'Activity selection (pick the meeting that finishes earliest) is a classic problem where greedy produces an optimal schedule.',
      correct: true,
      explanation: 'Sort by end time, greedily pick compatible activities — optimal substructure + greedy choice property hold.',
    },
    {
      id: 'greedy-q5',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Typical greedy implementation that sorts input first (e.g., activity selection) runs in:',
      options: [
        { id: 'a', text: 'O(n log n)' },
        { id: 'b', text: 'O(2^n)' },
        { id: 'c', text: 'O(n²) always' },
        { id: 'd', text: 'O(1)' },
      ],
      correct: ['a'],
      explanation: 'Sort dominates at O(n log n), then a linear scan makes greedy choices — fast when the proof holds.',
    },
    {
      id: 'greedy-q6',
      type: 'mcq',
      difficulty: 'hard',
      question: 'Which problem from the chapter is explicitly NOT solved optimally by greedy?',
      options: [
        { id: 'a', text: '0/1 Knapsack — needs DP' },
        { id: 'b', text: 'Fractional knapsack — greedy by value/weight works' },
        { id: 'c', text: 'Activity selection — greedy by earliest finish works' },
        { id: 'd', text: 'Huffman coding — greedy merge works' },
      ],
      correct: ['a'],
      explanation: '0/1 knapsack cannot take fractions — greedy value/weight fails. Fractional knapsack, MST, Huffman, and activity selection are greedy wins.',
    },
    {
      id: 'greedy-q7',
      type: 'code-analysis',
      difficulty: 'medium',
      question: 'What greedy rule does this activity selection code implement?',
      code: `acts.Sort((a, b) => a.End.CompareTo(b.End));
foreach (var a in acts) {
    if (a.Start >= lastEnd) {
        result.Add(a);
        lastEnd = a.End;
    }
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Sort by earliest finish; pick non-overlapping activities greedily' },
        { id: 'b', text: 'Sort by latest start; pick longest activities' },
        { id: 'c', text: 'Random shuffle then pick all activities' },
        { id: 'd', text: 'Dynamic programming table fill' },
      ],
      correct: ['a'],
      explanation: 'Earliest-finish-first is the classic greedy proof for maximum non-overlapping activities.',
    },
    {
      id: 'greedy-q8',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'Greedy works reliably when a problem has optimal substructure and the ___ choice property.',
      correct: ['greedy', 'greedy choice'],
      aliases: ['locally optimal', 'greedy-choice'],
      explanation: 'You must prove (or strongly believe) that a locally best irrevocable choice leads to a global optimum — never assume blindly.',
    },
  ],
  challenges: [
    {
      id: 'greedy-c1',
      type: 'scenario',
      difficulty: 'hard',
      question: 'Make change for 67¢ with US coins (25, 10, 5, 1). Greedy takes 2×25, 1×10, 1×5, 2×1. How many coins total?',
      options: [
        { id: 'a', text: '6 coins — and this is optimal for US denominations' },
        { id: 'b', text: '8 coins — greedy is suboptimal' },
        { id: 'c', text: '4 coins — skip pennies' },
        { id: 'd', text: '67 coins — one cent at a time' },
      ],
      correct: ['a'],
      explanation: '2+1+1+2 = 6 coins. For US coinage, greedy largest-first is optimal — contrast with [1,3,4] where it fails.',
    },
    {
      id: 'greedy-c2',
      type: 'design',
      difficulty: 'medium',
      question: 'A problem "looks greedy" but optimal solutions require trying and undoing choices. Which paradigm fits?',
      options: [
        { id: 'a', text: 'Backtracking — try choices, prune, undo when wrong' },
        { id: 'b', text: 'Pure greedy — never reconsider' },
        { id: 'c', text: 'Hash map lookup only' },
        { id: 'd', text: 'Two pointers on a sorted array' },
      ],
      correct: ['a'],
      explanation: 'Chapter contrast: Greedy = irrevocable; DP = overlapping subsolutions; Backtracking = explore and undo. Many hard problems start as greedy attempts then become DP or backtracking.',
    },
  ],
} satisfies QuizPack