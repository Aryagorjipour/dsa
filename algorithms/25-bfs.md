# 25 - Breadth-First Search (BFS)

## The Problem BFS Solves

**Problem: Find the shortest path from a source to a target in an unweighted graph or grid — measured in number of edges or steps.**

Every time you hear "shortest path" and every move costs the same (or edges have weight 1), think BFS.

BFS explores the graph **level by level**: all nodes at distance 1, then distance 2, and so on. The first time you reach the target, you have found the minimum number of steps.

### Canonical Problem: Shortest Path in an Unweighted Grid

Given an `m × n` grid with open cells (`0`) and walls (`1`), find the minimum number of steps from start to goal moving in 4 directions.

**Why BFS works:** Each step adds exactly 1 to the path length. Visiting cells in increasing distance order guarantees the first arrival at the goal is optimal.

## How It Works

1. Enqueue the source with distance `0`.
2. Mark the source visited.
3. Dequeue a cell; if it is the target, return its distance.
4. Enqueue all unvisited neighbors with distance + 1.
5. Repeat until the queue is empty (no path) or the target is found.

Use a **queue** (FIFO), not a stack. A queue processes nodes in order of discovery distance; a stack dives deep and does not guarantee shortest paths.

## Complexity

| Variant | Time | Space | Notes |
|---------|------|-------|-------|
| Graph BFS | O(V + E) | O(V) | V = vertices, E = edges |
| Grid BFS | O(m × n) | O(m × n) | Each cell visited once |
| Shortest path | O(V + E) | O(V) | Stops early when target found |
| All reachable | O(V + E) | O(V) | Visits entire component |

## Full Implementation

### C#

```csharp
public static class BFS {
    // Canonical: shortest path steps in unweighted grid (4 directions)
    public static int ShortestPathGrid(int[][] grid, (int r, int c) start, (int r, int c) goal) {
        int rows = grid.Length, cols = grid[0].Length;
        if (grid[start.r][start.c] == 1 || grid[goal.r][goal.c] == 1) return -1;
        if (start == goal) return 0;

        var dirs = new[] { (0, 1), (1, 0), (0, -1), (-1, 0) };
        var visited = new bool[rows, cols];
        var queue = new Queue<((int r, int c) pos, int dist)>();

        queue.Enqueue((start, 0));
        visited[start.r, start.c] = true;

        while (queue.Count > 0) {
            var (pos, dist) = queue.Dequeue();
            if (pos == goal) return dist;

            foreach (var (dr, dc) in dirs) {
                int nr = pos.r + dr, nc = pos.c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] == 1 || visited[nr, nc]) continue;
                visited[nr, nc] = true;
                queue.Enqueue(((nr, nc), dist + 1));
            }
        }
        return -1;
    }

    // Reconstruct path (list of cells from start to goal)
    public static List<(int r, int c)>? PathGrid(int[][] grid, (int r, int c) start, (int r, int c) goal) {
        int rows = grid.Length, cols = grid[0].Length;
        if (grid[start.r][start.c] == 1 || grid[goal.r][goal.c] == 1) return null;

        var dirs = new[] { (0, 1), (1, 0), (0, -1), (-1, 0) };
        var visited = new bool[rows, cols];
        var parent = new (int r, int c)?[rows, cols];
        var queue = new Queue<(int r, int c)>();

        queue.Enqueue(start);
        visited[start.r, start.c] = true;

        while (queue.Count > 0) {
            var pos = queue.Dequeue();
            if (pos == goal) return Reconstruct(parent, start, goal);

            foreach (var (dr, dc) in dirs) {
                int nr = pos.r + dr, nc = pos.c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] == 1 || visited[nr, nc]) continue;
                visited[nr, nc] = true;
                parent[nr, nc] = pos;
                queue.Enqueue((nr, nc));
            }
        }
        return null;
    }

    // General graph BFS on adjacency list
    public static int ShortestPathGraph(List<int>[] graph, int start, int target) {
        var visited = new bool[graph.Length];
        var queue = new Queue<(int node, int dist)>();
        queue.Enqueue((start, 0));
        visited[start] = true;

        while (queue.Count > 0) {
            var (node, dist) = queue.Dequeue();
            if (node == target) return dist;
            foreach (int nei in graph[node]) {
                if (visited[nei]) continue;
                visited[nei] = true;
                queue.Enqueue((nei, dist + 1));
            }
        }
        return -1;
    }

    private static List<(int r, int c)> Reconstruct((int r, int c)?[,] parent, (int r, int c) start, (int r, int c) goal) {
        var path = new List<(int, int)> { goal };
        var cur = goal;
        while (cur != start) {
            cur = parent[cur.r, cur.c]!.Value;
            path.Add(cur);
        }
        path.Reverse();
        return path;
    }
}
```

### Go

```go
type Point struct{ r, c int }

// ShortestPathGrid — canonical unweighted grid shortest path (4 directions)
func ShortestPathGrid(grid [][]int, start, goal Point) int {
    rows, cols := len(grid), len(grid[0])
    if grid[start.r][start.c] == 1 || grid[goal.r][goal.c] == 1 {
        return -1
    }
    if start == goal {
        return 0
    }

    dirs := []Point{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}
    visited := make([][]bool, rows)
    for i := range visited {
        visited[i] = make([]bool, cols)
    }

    type state struct {
        p    Point
        dist int
    }
    queue := []state{{start, 0}}
    visited[start.r][start.c] = true
    head := 0

    for head < len(queue) {
        cur := queue[head]
        head++
        if cur.p == goal {
            return cur.dist
        }
        for _, d := range dirs {
            nr, nc := cur.p.r+d.r, cur.p.c+d.c
            if nr < 0 || nr >= rows || nc < 0 || nc >= cols {
                continue
            }
            if grid[nr][nc] == 1 || visited[nr][nc] {
                continue
            }
            visited[nr][nc] = true
            queue = append(queue, state{Point{nr, nc}, cur.dist + 1})
        }
    }
    return -1
}

// PathGrid reconstructs the shortest path as a slice of cells
func PathGrid(grid [][]int, start, goal Point) []Point {
    rows, cols := len(grid), len(grid[0])
    if grid[start.r][start.c] == 1 || grid[goal.r][goal.c] == 1 {
        return nil
    }

    dirs := []Point{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}
    visited := make([][]bool, rows)
    parent := make([][]*Point, rows)
    for i := range visited {
        visited[i] = make([]bool, cols)
        parent[i] = make([]*Point, cols)
    }

    queue := []Point{start}
    visited[start.r][start.c] = true
    head := 0

    for head < len(queue) {
        p := queue[head]
        head++
        if p == goal {
            return reconstructPath(parent, start, goal)
        }
        for _, d := range dirs {
            nr, nc := p.r+d.r, p.c+d.c
            if nr < 0 || nr >= rows || nc < 0 || nc >= cols {
                continue
            }
            if grid[nr][nc] == 1 || visited[nr][nc] {
                continue
            }
            visited[nr][nc] = true
            np := Point{nr, nc}
            parent[nr][nc] = &p
            queue = append(queue, np)
        }
    }
    return nil
}

func reconstructPath(parent [][]*Point, start, goal Point) []Point {
    path := []Point{goal}
    cur := goal
    for cur != start {
        cur = *parent[cur.r][cur.c]
        path = append(path, cur)
    }
    for i, j := 0, len(path)-1; i < j; i, j = i+1, j-1 {
        path[i], path[j] = path[j], path[i]
    }
    return path
}

// ShortestPathGraph — BFS on adjacency list
func ShortestPathGraph(graph [][]int, start, target int) int {
    visited := make([]bool, len(graph))
    type state struct {
        node int
        dist int
    }
    queue := []state{{start, 0}}
    visited[start] = true
    head := 0

    for head < len(queue) {
        cur := queue[head]
        head++
        if cur.node == target {
            return cur.dist
        }
        for _, nei := range graph[cur.node] {
            if visited[nei] {
                continue
            }
            visited[nei] = true
            queue = append(queue, state{nei, cur.dist + 1})
        }
    }
    return -1
}
```

## BFS vs DFS

| Need | Use |
|------|-----|
| Shortest path (unweighted) | BFS |
| Level-order traversal | BFS |
| Any path / explore all states | DFS |
| Cycle detection | DFS (or specialized) |
| Wide graph, memory concern | DFS (BFS queue can grow large) |

## Real World

- **Social networks** — "degrees of separation" is BFS by hop count.
- **Word Ladder** — transform one word to another in minimum steps; each edge is one letter change.
- **Game AI** — uniform-cost movement (Pac-Man mazes, chess king moves) before terrain-weighted routing.
- **Web crawlers** — breadth-first crawling keeps results near the seed URL.
- **Broadcast routing** — flood a network layer by layer to reach all nodes with minimum hops.
- **Level-order tree traversal** — process tree nodes generation by generation.

When edge weights vary, BFS is no longer correct — graduate to [Dijkstra](28-dijkstra.md) or [A*](32-astar.md).

## Problems

- Shortest path in binary matrix (LeetCode 1091)
- Rotting Oranges — multi-source BFS
- Word Ladder — BFS on implicit graph
- Number of Islands — can use BFS or DFS
- Minimum Knight Moves — BFS on chess board

## Summary

BFS is the go-to algorithm for shortest paths when every step costs the same. Master the queue + visited pattern on grids and adjacency lists — it is the foundation for topological sort (Kahn's), bidirectional search, and many level-based algorithms.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Route Planner](/projects/tier-2/08-route-planner) — start with unweighted grid BFS before adding weighted Dijkstra and A*.
:::

**Next:** [26 - Depth-First Search (DFS)](26-dfs.md)