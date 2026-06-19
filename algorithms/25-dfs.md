# 25 - Depth-First Search (DFS)

## The Core Idea

Go as deep as possible along one path before backtracking.

Implemented via:
- Recursion (call stack)
- Explicit stack

## When DFS is Better Than BFS

- You need to explore all possibilities (backtracking)
- You want to detect cycles
- Memory is constrained (BFS can use more memory on wide graphs)
- You just need *any* path, not the shortest

## Classic Applications

- Detecting cycles in directed/undirected graphs
- Topological sort (on DAGs)
- Finding connected components
- Solving mazes / puzzles (Sudoku, N-Queens, word search)
- Tree traversals (pre, in, post order)
- Graph cloning / deep copy
- Strongly connected components (Kosaraju / Tarjan use DFS)

## Implementation

Recursive is elegant. Iterative with stack is safer for large graphs.

## Real World

- Compilers walking ASTs
- File system traversal (`find`, `du`, recursive delete)
- Web crawlers (with care to avoid infinite depth)
- Game AI (minimax, state space search)
- Git history walking (in some operations)

## Important Pattern: Backtracking

Many hard problems are "try choices, recurse, undo".

This is DFS + undo.

We will cover full Backtracking in its dedicated chapter.
