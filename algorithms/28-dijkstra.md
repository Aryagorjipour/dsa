# 28 - Dijkstra's Shortest Path

## The Problem Dijkstra Solves

**Problem: Find the shortest path from a single source to all other vertices (or to a specific target) in a graph with non-negative edge weights.**

### Canonical Problem: Weighted Shortest Path

Given a weighted directed graph and a source vertex, compute minimum-cost distances to every reachable node and reconstruct the path to a target.

**Why Dijkstra works:** Always settle the unvisited vertex with the smallest known distance next. With non-negative weights, that distance is final — no cheaper path can appear later.

## How It Works

1. Initialize `dist[source] = 0`, all others to ∞.
2. Use a **min-priority queue** keyed by current best distance.
3. Pop the vertex `u` with minimum `dist[u]`.
4. **Relax** each edge `(u, v, w)`: if `dist[u] + w < dist[v]`, update `dist[v]` and enqueue.
5. Repeat until the queue is empty or the target is settled.

The **lazy** version allows duplicate queue entries (simpler code). An eager version with decrease-key is more complex; lazy is usually fast enough in practice.

## Key Requirement

**Non-negative edge weights only.** If negative edges exist, use [Bellman-Ford](29-bellman-ford.md).

## Complexity

| Implementation | Time | Space | Notes |
|----------------|------|-------|-------|
| Binary heap (lazy) | O((V + E) log V) | O(V) | Duplicate entries OK |
| Binary heap (decrease-key) | O(E log V) | O(V) | More complex |
| Array (dense graph) | O(V²) | O(V) | No heap overhead |
| Fibonacci heap | O(E + V log V) | O(V) | Theoretical; rare in practice |

## Full Implementation

### C#

```csharp
public record WeightedEdge(int To, int Weight);

public static class Dijkstra {
    private const int Inf = int.MaxValue / 2;

    // Canonical: single-source shortest paths with path reconstruction
    public static (int[] dist, int[] parent) ShortestPaths(List<WeightedEdge>[] graph, int source) {
        int n = graph.Length;
        var dist = new int[n];
        var parent = new int[n];
        Array.Fill(dist, Inf);
        Array.Fill(parent, -1);
        dist[source] = 0;

        var pq = new PriorityQueue<int, int>();
        pq.Enqueue(source, 0);

        while (pq.Count > 0) {
            pq.TryDequeue(out int u, out int d);
            if (d > dist[u]) continue; // stale entry

            foreach (var (v, w) in graph[u]) {
                int nd = dist[u] + w;
                if (nd < dist[v]) {
                    dist[v] = nd;
                    parent[v] = u;
                    pq.Enqueue(v, nd);
                }
            }
        }
        return (dist, parent);
    }

    public static int ShortestPathToTarget(List<WeightedEdge>[] graph, int source, int target) {
        var (dist, _) = ShortestPaths(graph, source);
        return dist[target] >= Inf ? -1 : dist[target];
    }

    public static List<int> ReconstructPath(int[] parent, int source, int target) {
        if (parent[target] == -1 && target != source) return new List<int>();
        var path = new List<int>();
        for (int cur = target; cur != -1; cur = parent[cur])
            path.Add(cur);
        path.Reverse();
        return path[0] == source ? path : new List<int>();
    }

    // Edge-list input helper: build adjacency list from (from, to, weight)
    public static List<WeightedEdge>[] BuildGraph(int n, List<(int from, int to, int weight)> edges) {
        var graph = new List<WeightedEdge>[n];
        for (int i = 0; i < n; i++) graph[i] = new List<WeightedEdge>();
        foreach (var (from, to, w) in edges)
            graph[from].Add(new WeightedEdge(to, w));
        return graph;
    }
}
```

### Go

```go
type WEdge struct {
    To     int
    Weight int
}

const inf = int(^uint(0) >> 1) // max int / 2 safe margin

// ShortestPaths — canonical Dijkstra with lazy priority queue
func ShortestPaths(graph [][]WEdge, source int) (dist, parent []int) {
    n := len(graph)
    dist = make([]int, n)
    parent = make([]int, n)
    for i := range dist {
        dist[i] = inf
        parent[i] = -1
    }
    dist[source] = 0

    pq := NewMinHeap()
    pq.Push(source, 0)

    for pq.Len() > 0 {
        u, d := pq.Pop()
        if d > dist[u] {
            continue
        }
        for _, e := range graph[u] {
            nd := dist[u] + e.Weight
            if nd < dist[e.To] {
                dist[e.To] = nd
                parent[e.To] = u
                pq.Push(e.To, nd)
            }
        }
    }
    return dist, parent
}

func ShortestPathToTarget(graph [][]WEdge, source, target int) int {
    dist, _ := ShortestPaths(graph, source)
    if dist[target] >= inf {
        return -1
    }
    return dist[target]
}

func ReconstructPath(parent []int, source, target int) []int {
    if parent[target] == -1 && target != source {
        return nil
    }
    path := make([]int, 0)
    for cur := target; cur != -1; cur = parent[cur] {
        path = append(path, cur)
    }
    for i, j := 0, len(path)-1; i < j; i, j = i+1, j-1 {
        path[i], path[j] = path[j], path[i]
    }
    if len(path) == 0 || path[0] != source {
        return nil
    }
    return path
}

// BuildGraph from edge list (from, to, weight)
func BuildGraph(n int, edges [][3]int) [][]WEdge {
    graph := make([][]WEdge, n)
    for _, e := range edges {
        graph[e[0]] = append(graph[e[0]], WEdge{To: e[1], Weight: e[2]})
    }
    return graph
}

// Minimal binary min-heap for Dijkstra
type minHeap struct {
    nodes []int
    keys  []int
}

func NewMinHeap() *minHeap { return &minHeap{} }
func (h *minHeap) Len() int { return len(h.nodes) }

func (h *minHeap) Push(node, key int) {
    h.nodes = append(h.nodes, node)
    h.keys = append(h.keys, key)
    i := len(h.nodes) - 1
    for i > 0 {
        p := (i - 1) / 2
        if h.keys[p] <= h.keys[i] {
            break
        }
        h.nodes[p], h.nodes[i] = h.nodes[i], h.nodes[p]
        h.keys[p], h.keys[i] = h.keys[i], h.keys[p]
        i = p
    }
}

func (h *minHeap) Pop() (int, int) {
    node, key := h.nodes[0], h.keys[0]
    last := len(h.nodes) - 1
    h.nodes[0], h.nodes[last] = h.nodes[last], h.nodes[0]
    h.keys[0], h.keys[last] = h.keys[last], h.keys[0]
    h.nodes = h.nodes[:last]
    h.keys = h.keys[:last]

    i := 0
    for {
        l, r, smallest := 2*i+1, 2*i+2, i
        if l < len(h.keys) && h.keys[l] < h.keys[smallest] {
            smallest = l
        }
        if r < len(h.keys) && h.keys[r] < h.keys[smallest] {
            smallest = r
        }
        if smallest == i {
            break
        }
        h.nodes[i], h.nodes[smallest] = h.nodes[smallest], h.nodes[i]
        h.keys[i], h.keys[smallest] = h.keys[smallest], h.keys[i]
        i = smallest
    }
    return node, key
}
```

In production Go, prefer `container/heap` — the inline heap above keeps the chapter self-contained.

## Variants & Improvements

- **A*** — Dijkstra + admissible heuristic `h(n)`; see [32 - A*](32-astar.md).
- **Bidirectional Dijkstra** — search from source and target simultaneously.
- **Contraction hierarchies** — preprocessing for fast road-network queries (Google Maps scale).
- **Non-negative constraint** — zero-weight edges are fine; negative edges break the greedy invariant.

## Real World

- **Road routing** — GPS navigation with varying road speeds and tolls.
- **Network routing** — OSPF uses a link-state variant; many protocols compute least-cost paths.
- **Game pathfinding** — terrain with movement costs (swamp slow, road fast).
- **Flight connections** — minimum total fare or time with non-negative leg costs.
- **Telecom** — least-latency path selection in SDN controllers.

## Problems

- Network Delay Time (Dijkstra from source)
- Path with Minimum Effort (variant with max edge weight)
- Cheapest Flights Within K Stops (Dijkstra + layer constraint)
- Number of Ways to Arrive at Destination (count shortest paths)

## Summary

Dijkstra is the foundation of weighted shortest-path routing when costs are non-negative. Master the relax step, lazy priority queue, and path reconstruction — then layer A* heuristics or all-pairs algorithms on top.

::: tip Project Lab
**Build it yourself:** [Route Planner](/projects/tier-2/08-route-planner) — Dijkstra on weighted graphs, then A* with admissible heuristics.
:::

**Next:** [29 - Bellman-Ford Algorithm](29-bellman-ford.md)