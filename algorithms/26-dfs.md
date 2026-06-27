# 26 - Depth-First Search (DFS)

## The Problem DFS Solves

**Problem: Systematically explore a graph by going as deep as possible along one branch before backtracking.**

DFS is the workhorse for structure discovery: connected components, cycle detection, topological ordering, maze solving, and the backbone of backtracking.

### Canonical Problem 1: Count Connected Components

Given an undirected graph, how many separate connected regions exist?

**Why DFS works:** Each DFS call from an unvisited node floods one entire component. Increment a counter each time you start a new flood.

### Canonical Problem 2: Detect Cycle in a Directed Graph

A directed graph has a cycle if and only if DFS encounters a neighbor that is **currently on the recursion stack** (gray node in the white-gray-black model).

**Why DFS works:** Back edges (edges to ancestors in the DFS tree) reveal cycles. BFS cannot detect directed cycles this cleanly.

## How It Works

1. Pick an unvisited node and mark it visited.
2. Recursively visit each unvisited neighbor (or push onto an explicit stack).
3. When no unvisited neighbors remain, backtrack.
4. Repeat for any remaining unvisited nodes (handles disconnected graphs).

Implement with **recursion** (elegant) or an **explicit stack** (safer for very deep graphs).

## Complexity

| Variant | Time | Space | Notes |
|---------|------|-------|-------|
| Graph DFS | O(V + E) | O(V) | Visits each vertex and edge once |
| Grid DFS | O(m × n) | O(m × n) | Recursion stack or explicit stack |
| Connected components | O(V + E) | O(V) | One pass over all nodes |
| Cycle detection (directed) | O(V + E) | O(V) | Three-color or on-stack tracking |

## Full Implementation

### C#

```csharp
public static class DFS {
    // Canonical: count connected components in undirected graph
    public static int CountComponents(List<int>[] graph) {
        int n = graph.Length;
        var visited = new bool[n];
        int count = 0;

        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                FloodFill(graph, i, visited);
                count++;
            }
        }
        return count;
    }

    private static void FloodFill(List<int>[] graph, int node, bool[] visited) {
        visited[node] = true;
        foreach (int nei in graph[node]) {
            if (!visited[nei]) FloodFill(graph, nei, visited);
        }
    }

    // Canonical: detect cycle in directed graph
    public static bool HasCycleDirected(List<int>[] graph) {
        int n = graph.Length;
        var state = new int[n]; // 0=unvisited, 1=on stack, 2=done

        for (int i = 0; i < n; i++) {
            if (state[i] == 0 && DfsCycle(graph, i, state)) return true;
        }
        return false;
    }

    private static bool DfsCycle(List<int>[] graph, int node, int[] state) {
        state[node] = 1;
        foreach (int nei in graph[node]) {
            if (state[nei] == 1) return true;  // back edge → cycle
            if (state[nei] == 0 && DfsCycle(graph, nei, state)) return true;
        }
        state[node] = 2;
        return false;
    }

    // Iterative DFS (avoids recursion depth limits)
    public static void DfsIterative(List<int>[] graph, int start, Action<int> visit) {
        var visited = new bool[graph.Length];
        var stack = new Stack<int>();
        stack.Push(start);

        while (stack.Count > 0) {
            int node = stack.Pop();
            if (visited[node]) continue;
            visited[node] = true;
            visit(node);
            foreach (int nei in graph[node]) {
                if (!visited[nei]) stack.Push(nei);
            }
        }
    }

    // Grid DFS: count islands (connected '1' regions)
    public static int CountIslands(char[][] grid) {
        int rows = grid.Length, cols = grid[0].Length, count = 0;
        var dirs = new[] { (0, 1), (1, 0), (0, -1), (-1, 0) };

        void Dfs(int r, int c) {
            if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != '1') return;
            grid[r][c] = '0'; // mark visited
            foreach (var (dr, dc) in dirs) Dfs(r + dr, c + dc);
        }

        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (grid[r][c] == '1') { Dfs(r, c); count++; }

        return count;
    }
}
```

### Go

```go
// CountComponents — canonical connected components in undirected graph
func CountComponents(graph [][]int) int {
    n := len(graph)
    visited := make([]bool, n)
    count := 0

    var flood func(int)
    flood = func(node int) {
        visited[node] = true
        for _, nei := range graph[node] {
            if !visited[nei] {
                flood(nei)
            }
        }
    }

    for i := 0; i < n; i++ {
        if !visited[i] {
            flood(i)
            count++
        }
    }
    return count
}

// HasCycleDirected — canonical cycle detection in directed graph
func HasCycleDirected(graph [][]int) bool {
    n := len(graph)
    state := make([]int, n) // 0=unvisited, 1=on stack, 2=done

    var dfs func(int) bool
    dfs = func(node int) bool {
        state[node] = 1
        for _, nei := range graph[node] {
            if state[nei] == 1 {
                return true
            }
            if state[nei] == 0 && dfs(nei) {
                return true
            }
        }
        state[node] = 2
        return false
    }

    for i := 0; i < n; i++ {
        if state[i] == 0 && dfs(i) {
            return true
        }
    }
    return false
}

// DfsIterative — explicit stack, no recursion
func DfsIterative(graph [][]int, start int, visit func(int)) {
    visited := make([]bool, len(graph))
    stack := []int{start}

    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        if visited[node] {
            continue
        }
        visited[node] = true
        visit(node)
        for _, nei := range graph[node] {
            if !visited[nei] {
                stack = append(stack, nei)
            }
        }
    }
}

// CountIslands — grid DFS for connected '1' regions
func CountIslands(grid [][]byte) int {
    rows, cols := len(grid), len(grid[0])
    dirs := [][2]int{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}
    count := 0

    var dfs func(int, int)
    dfs = func(r, c int) {
        if r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != '1' {
            return
        }
        grid[r][c] = '0'
        for _, d := range dirs {
            dfs(r+d[0], c+d[1])
        }
    }

    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            if grid[r][c] == '1' {
                dfs(r, c)
                count++
            }
        }
    }
    return count
}
```

## DFS vs BFS

| Need | Use |
|------|-----|
| Shortest path (unweighted) | BFS |
| Connected components | DFS or BFS |
| Cycle detection (directed) | DFS |
| Topological sort | DFS post-order or Kahn's BFS |
| Explore all possibilities | DFS + backtracking |
| Memory on wide graphs | DFS (stack depth vs BFS queue width) |

## The Backtracking Pattern

Many hard problems are "try a choice → recurse → undo":

- Sudoku, N-Queens, permutations/combinations
- Word Search on a board
- Graph coloring

This is DFS with an explicit undo step. See [44 - Backtracking](44-backtracking.md) for the full treatment.

## Real World

- **Compilers** — walk abstract syntax trees (pre/in/post-order are DFS variants).
- **File systems** — `find`, `du`, recursive directory traversal.
- **Git** — walk commit history along parent pointers.
- **Maze generation** — DFS carves long corridors; also used in maze solving.
- **Strongly connected components** — Kosaraju and Tarjan build on DFS.
- **Topological sort** — DFS finishing times produce a valid order on DAGs.

## Problems

- Number of Connected Components in an Undirected Graph
- Course Schedule (cycle detection in prerequisite graph)
- Number of Islands
- Clone Graph
- Path Sum (tree DFS)

## Summary

DFS explores depth-first and excels at structural questions: how many components, is there a cycle, can we reach everything? Pair it with BFS — BFS for shortest unweighted paths, DFS for components, cycles, and backtracking.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Route Planner](/projects/tier-2/08-route-planner)
:::

**Next:** [27 - Topological Sort](27-topological-sort.md)