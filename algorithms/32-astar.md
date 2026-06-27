# 32 - A* Search (A-star)

## The Problem

Find the shortest path from start to goal with a **heuristic** that guides search toward the goal.

A* is Dijkstra + h(n): f(n) = g(n) + h(n).

### Canonical Problem: Shortest Path in a Grid with Obstacles and Costs

2D grid with walls (-1) and terrain costs. BFS fails on varying costs. Dijkstra works but explores too broadly. A* with Manhattan heuristic focuses search while staying optimal when h is admissible.

![A* Pathfinding with Heuristic](/images/astar-heuristic.png)

## Complexity

| Case | Time | Space |
|------|------|-------|
| Typical grid | O(E log V) | O(V) |

Depends on heuristic quality; good h dramatically reduces explored nodes.

## Full Implementation

### C#

```csharp
public static List<(int r, int c)> AStar(int[,] grid, (int r, int c) start, (int r, int c) goal) {
    int rows = grid.GetLength(0), cols = grid.GetLength(1);
    int H((int r, int c) p) => Math.Abs(p.r - goal.r) + Math.Abs(p.c - goal.c);

    var open = new PriorityQueue<(int r, int c), int>();
    var gScore = new Dictionary<(int, int), int> { [start] = 0 };
    var came = new Dictionary<(int, int), (int, int)>();
    open.Enqueue(start, H(start));

    var dirs = new[] { (0, 1), (1, 0), (0, -1), (-1, 0) };
    while (open.Count > 0) {
        var cur = open.Dequeue();
        if (cur == goal) return Reconstruct(came, cur);

        foreach (var (dr, dc) in dirs) {
            int nr = cur.r + dr, nc = cur.c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr, nc] < 0) continue;
            int tent = gScore[cur] + grid[nr, nc];
            var nei = (nr, nc);
            if (!gScore.TryGetValue(nei, out int old) || tent < old) {
                gScore[nei] = tent;
                came[nei] = cur;
                open.Enqueue(nei, tent + H(nei));
            }
        }
    }
    return null;
}

static List<(int r, int c)> Reconstruct(Dictionary<(int, int), (int, int)> came, (int r, int c) cur) {
    var path = new List<(int, int)> { cur };
    while (came.TryGetValue(cur, out var prev)) {
        path.Add(prev);
        cur = prev;
    }
    path.Reverse();
    return path;
}
```

### Go

```go
type Point struct{ r, c int }

func AStar(grid [][]int, start, goal Point) []Point {
    rows, cols := len(grid), len(grid[0])
    h := func(p Point) int { return abs(p.r-goal.r) + abs(p.c-goal.c) }

    gScore := map[Point]int{start: 0}
    came := map[Point]Point{}
    open := &PriorityQueue{}
    heap.Init(open)
    heap.Push(open, &PQItem{p: start, f: h(start)})

    dirs := []Point{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}
    for open.Len() > 0 {
        cur := heap.Pop(open).(*PQItem).p
        if cur == goal {
            return reconstruct(came, cur)
        }
        for _, d := range dirs {
            nr, nc := cur.r+d.r, cur.c+d.c
            if nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] < 0 {
                continue
            }
            nei := Point{nr, nc}
            tent := gScore[cur] + grid[nr][nc]
            if old, ok := gScore[nei]; !ok || tent < old {
                gScore[nei] = tent
                came[nei] = cur
                heap.Push(open, &PQItem{p: nei, f: tent + h(nei)})
            }
        }
    }
    return nil
}

func reconstruct(came map[Point]Point, cur Point) []Point {
    path := []Point{cur}
    for p, ok := came[cur]; ok; p, ok = came[p] {
        path = append([]Point{p}, path...)
        cur = p
    }
    return path
}
```

See `examples/go/astar_grid.go` for a runnable version with priority queue types.

## Real World

- Game pathfinding (Unity, Unreal, custom engines)
- Robotics (ROS navigation)
- Map routing (with hierarchical optimizations on top)

## Heuristics

- **Manhattan** — grid, 4 directions (admissible)
- **Euclidean** — geometric distance
- Domain-specific heuristics must be **admissible** (never overestimate) for optimality

## Summary

A* is the workhorse of informed pathfinding when you can estimate distance to the goal.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Route Planner](/projects/tier-2/08-route-planner) — grid pathfinding with admissible heuristics.
:::

**Next:** [33 - DP Fundamentals](33-dp-fundamentals.md)