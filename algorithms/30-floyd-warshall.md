# 30 - Floyd-Warshall Algorithm

## The Problem Floyd-Warshall Solves

**Problem: Find shortest paths between every pair of vertices in a weighted graph.**

### Canonical Problem: All-Pairs Shortest Paths

Given `n` vertices and a weight matrix (or edge list converted to matrix), compute `dist[i][j]` = minimum cost from `i` to `j` for all pairs.

**Why Floyd-Warshall works:** Dynamic programming. Allow paths that pass only through intermediates `{0, 1, …, k}`; increment `k` from 0 to `n-1`. Each update considers whether routing through `k` beats the current best.

## How It Works

For each intermediate vertex `k`, for every pair `(i, j)`:

```
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

Initialize `dist[i][j]` from direct edges; `dist[i][i] = 0`; no edge → ∞ (use a large sentinel).

**Negative cycles:** After the algorithm, if any `dist[i][i] < 0`, vertex `i` lies on a negative cycle.

## When to Use Floyd-Warshall vs Repeated Dijkstra

| Scenario | Prefer |
|----------|--------|
| Dense graph, many all-pairs queries | Floyd-Warshall O(V³) |
| Sparse graph, few queries | Dijkstra from each source |
| Negative edges (no negative cycles) | Floyd-Warshall |
| Need path reconstruction for one pair | Either (with `next` matrix) |
| V ≤ ~400–500, simple code matters | Floyd-Warshall |

Running Dijkstra from each vertex costs O(V × (V + E) log V). For dense graphs where E ≈ V², Floyd-Warshall's O(V³) is competitive and gives all answers in one pass.

## Complexity

| Variant | Time | Space | Notes |
|---------|------|-------|-------|
| All-pairs shortest paths | O(V³) | O(V²) | Three nested loops |
| Transitive closure only | O(V³) | O(V²) | Use boolean OR instead of min |
| Negative cycle check | O(V³) | O(V²) | Check diagonal after run |
| Path reconstruction | O(V³) build | O(V²) | `next[i][j]` matrix |

## Full Implementation

### C#

```csharp
public static class FloydWarshall {
    private const double Inf = double.PositiveInfinity;

    // Canonical: all-pairs shortest paths from weight matrix
    // graph[i,j] = direct edge weight; no edge = +infinity
    public static (double[,] dist, bool hasNegativeCycle) AllPairs(double[,] graph) {
        int n = graph.GetLength(0);
        double[,] dist = (double[,])graph.Clone();

        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (dist[i, k] < Inf && dist[k, j] < Inf)
                        dist[i, j] = Math.Min(dist[i, j], dist[i, k] + dist[k, j]);

        bool hasNeg = false;
        for (int i = 0; i < n; i++)
            if (dist[i, i] < 0) { hasNeg = true; break; }

        return (dist, hasNeg);
    }

    // Build matrix from edge list: (from, to, weight)
    public static double[,] BuildMatrix(int n, List<(int from, int to, double weight)> edges) {
        var dist = new double[n, n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++)
                dist[i, j] = i == j ? 0 : Inf;
        }
        foreach (var (from, to, w) in edges)
            dist[from, to] = Math.Min(dist[from, to], w);
        return dist;
    }

    // All-pairs with path reconstruction via next matrix
    public static (double[,] dist, int[,] next) AllPairsWithPath(double[,] graph) {
        int n = graph.GetLength(0);
        double[,] dist = (double[,])graph.Clone();
        var next = new int[n, n];

        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                next[i, j] = graph[i, j] < Inf ? j : -1;

        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (dist[i, k] < Inf && dist[k, j] < Inf
                        && dist[i, k] + dist[k, j] < dist[i, j]) {
                        dist[i, j] = dist[i, k] + dist[k, j];
                        next[i, j] = next[i, k];
                    }

        return (dist, next);
    }

    public static List<int> ReconstructPath(int[,] next, int from, int to) {
        if (next[from, to] == -1) return new List<int>();
        var path = new List<int> { from };
        int cur = from;
        while (cur != to) {
            cur = next[cur, to];
            if (cur == -1) return new List<int>();
            path.Add(cur);
        }
        return path;
    }

    // Transitive closure: can i reach j?
    public static bool[,] Reachability(int n, List<(int from, int to)> edges) {
        var reach = new bool[n, n];
        for (int i = 0; i < n; i++) reach[i, i] = true;
        foreach (var (from, to) in edges) reach[from, to] = true;

        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    reach[i, j] = reach[i, j] || (reach[i, k] && reach[k, j]);

        return reach;
    }
}
```

### Go

```go
const fwInf = math.MaxFloat64 / 2

// AllPairs — canonical Floyd-Warshall on distance matrix
func AllPairs(dist [][]float64) ([][]float64, bool) {
    n := len(dist)
    d := make([][]float64, n)
    for i := range d {
        d[i] = make([]float64, n)
        copy(d[i], dist[i])
    }

    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if d[i][k] < fwInf && d[k][j] < fwInf {
                    if nd := d[i][k] + d[k][j]; nd < d[i][j] {
                        d[i][j] = nd
                    }
                }
            }
        }
    }

    for i := 0; i < n; i++ {
        if d[i][i] < 0 {
            return d, true
        }
    }
    return d, false
}

// BuildMatrix from edge list (from, to, weight)
func BuildMatrix(n int, edges [][3]float64) [][]float64 {
    dist := make([][]float64, n)
    for i := 0; i < n; i++ {
        dist[i] = make([]float64, n)
        for j := 0; j < n; j++ {
            if i == j {
                dist[i][j] = 0
            } else {
                dist[i][j] = fwInf
            }
        }
    }
    for _, e := range edges {
        u, v, w := int(e[0]), int(e[1]), e[2]
        if w < dist[u][v] {
            dist[u][v] = w
        }
    }
    return dist
}

// AllPairsWithPath — includes next matrix for reconstruction
func AllPairsWithPath(dist [][]float64) ([][]float64, [][]int) {
    n := len(dist)
    d := make([][]float64, n)
    next := make([][]int, n)
    for i := 0; i < n; i++ {
        d[i] = make([]float64, n)
        copy(d[i], dist[i])
        next[i] = make([]int, n)
        for j := 0; j < n; j++ {
            if dist[i][j] < fwInf {
                next[i][j] = j
            } else {
                next[i][j] = -1
            }
        }
    }

    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if d[i][k] < fwInf && d[k][j] < fwInf {
                    if nd := d[i][k] + d[k][j]; nd < d[i][j] {
                        d[i][j] = nd
                        next[i][j] = next[i][k]
                    }
                }
            }
        }
    }
    return d, next
}

func ReconstructPath(next [][]int, from, to int) []int {
    if next[from][to] == -1 {
        return nil
    }
    path := []int{from}
    cur := from
    for cur != to {
        cur = next[cur][to]
        if cur == -1 {
            return nil
        }
        path = append(path, cur)
    }
    return path
}

// Reachability — transitive closure (Warshall variant)
func Reachability(n int, edges [][2]int) [][]bool {
    reach := make([][]bool, n)
    for i := 0; i < n; i++ {
        reach[i] = make([]bool, n)
        reach[i][i] = true
    }
    for _, e := range edges {
        reach[e[0]][e[1]] = true
    }

    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])
            }
        }
    }
    return reach
}
```

Add `import "math"` at the top of a real Go file.

## Real World

- **City routing tables** — precompute all-pairs travel times for small networks (≤ few hundred nodes).
- **Social network analysis** — shortest connection chains between any two users in a small graph.
- **Game AI** — precompute distance fields between all waypoints on a level.
- **Compiler analysis** — value propagation and dependency reachability.
- **Transitive closure** — "can A reach B?" for dependency or permission graphs.

## Problems

- Find the City With the Smallest Number of Neighbors at Threshold Distance
- Graph connectivity queries (transitive closure)
- Count paths of length k (DP on adjacency matrix)
- Detect negative cycles in small dense graphs

## Summary

Floyd-Warshall is the elegant DP solution for all-pairs shortest paths: one triple loop, O(V³) time, O(V²) space. Use it when the graph is small and dense, you need every pair, or negative edges (without negative cycles) are present.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Route Planner](/projects/tier-2/08-route-planner) — compare single-source Dijkstra vs all-pairs Floyd-Warshall for multi-query routing.
:::

**Next:** [31 - Minimum Spanning Tree (Kruskal + Prim)](31-mst-kruskal-prim.md)