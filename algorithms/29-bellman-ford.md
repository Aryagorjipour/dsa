# 29 - Bellman-Ford Algorithm

## The Problem Bellman-Ford Solves

**Problem: Find shortest paths from a single source in a graph that may contain negative edge weights, and detect negative-weight cycles reachable from the source.**

Dijkstra's greedy "settle smallest distance" breaks when a negative edge can retroactively improve a path already considered final.

### Canonical Problem: Negative Edges and Cycle Detection

Given a directed weighted graph (possibly with negative edges), compute shortest-path distances from a source. Report whether a negative cycle exists — a cycle whose total edge weight is negative, making "shortest path" undefined.

**Why Bellman-Ford works:** After `k` relaxation rounds, you know the shortest path using at most `k` edges. After `V - 1` rounds, all simple shortest paths are found. A `V`th round that still improves a distance proves a negative cycle.

## How It Works

1. Initialize `dist[source] = 0`, all others to ∞.
2. Repeat `V - 1` times: relax **every edge** `(u, v, w)` — if `dist[u] + w < dist[v]`, update.
3. Run one more relaxation pass; any improvement means a negative cycle exists.

**Early termination:** If a full pass makes no updates, stop — distances have converged.

## Complexity

| Variant | Time | Space | Notes |
|---------|------|-------|-------|
| Standard | O(V × E) | O(V) | Relax all edges each round |
| Early termination | O(V × E) worst | O(V) | Often faster on sparse graphs |
| SPFA (queue-based) | O(V × E) worst | O(V) | Practical average can be better |
| Dijkstra (comparison) | O((V + E) log V) | O(V) | Only non-negative weights |

## Full Implementation

### C#

```csharp
public record BFEdge(int From, int To, double Weight);

public static class BellmanFord {
    public static (double[] dist, bool hasNegativeCycle) ShortestPaths(
        List<BFEdge> edges, int V, int source) {

        var dist = new double[V];
        Array.Fill(dist, double.PositiveInfinity);
        dist[source] = 0;

        for (int i = 1; i < V; i++) {
            bool updated = false;
            foreach (var e in edges) {
                if (dist[e.From] == double.PositiveInfinity) continue;
                double nd = dist[e.From] + e.Weight;
                if (nd < dist[e.To]) {
                    dist[e.To] = nd;
                    updated = true;
                }
            }
            if (!updated) break;
        }

        bool hasNeg = false;
        foreach (var e in edges) {
            if (dist[e.From] == double.PositiveInfinity) continue;
            if (dist[e.From] + e.Weight < dist[e.To]) {
                hasNeg = true;
                break;
            }
        }
        return (dist, hasNeg);
    }

    // Flagship application: currency arbitrage detection
    // rates[u][v] = exchange rate from currency u to v
    // Negative cycle in -log(rate) graph → arbitrage opportunity
    public static bool HasArbitrage(double[][] rates) {
        int n = rates.Length;
        var edges = new List<BFEdge>();
        for (int u = 0; u < n; u++)
            for (int v = 0; v < n; v++)
                if (rates[u][v] > 0)
                    edges.Add(new BFEdge(u, v, -Math.Log(rates[u][v])));

        var (_, hasCycle) = ShortestPaths(edges, n, 0);
        return hasCycle;
    }

    // Return vertices on a negative cycle (if any)
    public static List<int>? FindNegativeCycle(List<BFEdge> edges, int V, int source) {
        var dist = new double[V];
        var parent = new int[V];
        Array.Fill(dist, double.PositiveInfinity);
        Array.Fill(parent, -1);
        dist[source] = 0;

        int lastUpdated = -1;
        for (int i = 0; i < V; i++) {
            lastUpdated = -1;
            foreach (var e in edges) {
                if (dist[e.From] == double.PositiveInfinity) continue;
                double nd = dist[e.From] + e.Weight;
                if (nd < dist[e.To]) {
                    dist[e.To] = nd;
                    parent[e.To] = e.From;
                    lastUpdated = e.To;
                }
            }
        }

        if (lastUpdated == -1) return null;

        // Walk back V steps to guarantee we are on the cycle
        int x = lastUpdated;
        for (int i = 0; i < V; i++) x = parent[x];

        var cycle = new List<int> { x };
        int cur = parent[x];
        while (cur != x) {
            cycle.Add(cur);
            cur = parent[cur];
        }
        cycle.Reverse();
        return cycle;
    }
}
```

### Go

```go
type BFEdge struct {
    From, To int
    Weight   float64
}

const bfInf = math.MaxFloat64 / 2

// ShortestPaths — canonical Bellman-Ford with negative cycle detection
func ShortestPaths(edges []BFEdge, v, source int) (dist []float64, hasNegCycle bool) {
    dist = make([]float64, v)
    for i := range dist {
        dist[i] = bfInf
    }
    dist[source] = 0

    for i := 1; i < v; i++ {
        updated := false
        for _, e := range edges {
            if dist[e.From] == bfInf {
                continue
            }
            nd := dist[e.From] + e.Weight
            if nd < dist[e.To] {
                dist[e.To] = nd
                updated = true
            }
        }
        if !updated {
            break
        }
    }

    for _, e := range edges {
        if dist[e.From] == bfInf {
            continue
        }
        if dist[e.From]+e.Weight < dist[e.To] {
            return dist, true
        }
    }
    return dist, false
}

// HasArbitrage — negative cycle in -log(rate) graph
func HasArbitrage(rates [][]float64) bool {
    n := len(rates)
    edges := make([]BFEdge, 0)
    for u := 0; u < n; u++ {
        for v := 0; v < n; v++ {
            if rates[u][v] > 0 {
                edges = append(edges, BFEdge{u, v, -math.Log(rates[u][v])})
            }
        }
    }
    _, hasCycle := ShortestPaths(edges, n, 0)
    return hasCycle
}

// FindNegativeCycle returns vertices on a negative cycle, or nil
func FindNegativeCycle(edges []BFEdge, v, source int) []int {
    dist := make([]float64, v)
    parent := make([]int, v)
    for i := range dist {
        dist[i] = bfInf
        parent[i] = -1
    }
    dist[source] = 0

    lastUpdated := -1
    for i := 0; i < v; i++ {
        lastUpdated = -1
        for _, e := range edges {
            if dist[e.From] == bfInf {
                continue
            }
            nd := dist[e.From] + e.Weight
            if nd < dist[e.To] {
                dist[e.To] = nd
                parent[e.To] = e.From
                lastUpdated = e.To
            }
        }
    }

    if lastUpdated == -1 {
        return nil
    }

    x := lastUpdated
    for i := 0; i < v; i++ {
        x = parent[x]
    }

    cycle := []int{x}
    cur := parent[x]
    for cur != x {
        cycle = append(cycle, cur)
        cur = parent[cur]
    }
    for i, j := 0, len(cycle)-1; i < j; i, j = i+1, j-1 {
        cycle[i], cycle[j] = cycle[j], cycle[i]
    }
    return cycle
}
```

Add `import "math"` at the top of a real Go file using these functions.

## Why Negative Cycles Matter

A negative cycle reachable from the source means you can loop forever, decreasing total cost. "Shortest path" is undefined (−∞). Detecting this is as important as computing distances.

## Real World

- **Currency arbitrage** — model exchange rates as `-log(rate)` edges; negative cycle = profit loop.
- **Difference constraints** — systems of inequalities `x_j - x_i ≤ w` reduce to Bellman-Ford.
- **Routing with subsidies** — negative edge costs (rebates) require Bellman-Ford, not Dijkstra.
- **Order book analysis** — detect arbitrage cycles across trading pairs.
- **Constraint satisfaction** — feasibility of linear inequality systems on graphs.

## Problems

- Network Delay Time with possible negative edges (use Bellman-Ford)
- Cheapest Flights Within K Stops (Bellman-Ford with exactly k rounds)
- Currency arbitrage detection
- Shortest path in DAG with negative edges (can use topo sort in O(V+E) — faster)

## Summary

Bellman-Ford trades speed for generality: O(V × E) but handles negative edges and finds negative cycles. Use Dijkstra when weights are non-negative; reach for Bellman-Ford when negatives or cycle detection are in play.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

**Next:** [30 - Floyd-Warshall Algorithm](30-floyd-warshall.md)