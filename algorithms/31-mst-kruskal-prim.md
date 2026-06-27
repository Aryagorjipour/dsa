# 31 - Minimum Spanning Tree (Kruskal + Prim)

## The Problem MST Solves

**Problem: Given a connected, undirected, weighted graph, find a subset of edges that connects all vertices with minimum total weight and no cycles.**

The result is a **tree** spanning all `V` vertices with exactly `V - 1` edges.

### Canonical Problem: MST from an Edge List

Given `n` vertices and a list of weighted undirected edges, compute the minimum spanning tree using both classic algorithms:

- **Kruskal** — sort edges, greedily add cheapest non-cycle edge (Union-Find).
- **Prim** — grow a tree from a start vertex, always add the cheapest edge to an outside vertex (priority queue).

Both are greedy and both are correct because of the **cut property**: the lightest edge crossing any cut belongs to some MST.

## How It Works

### Kruskal

1. Sort all edges by weight ascending.
2. Initialize Union-Find with each vertex in its own set.
3. For each edge `(u, v, w)` in sorted order:
   - If `Find(u) ≠ Find(v)`, add the edge to the MST and `Union(u, v)`.
4. Stop when you have `V - 1` edges.

### Prim

1. Start from any vertex; mark it in the tree.
2. Push all edges from the tree to a min-heap keyed by weight.
3. Pop the cheapest edge `(u, v, w)` where `u` is in the tree and `v` is not.
4. Add `v` and its outgoing edges to the heap.
5. Repeat until all vertices are in the tree.

## Complexity

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Kruskal | O(E log E) | O(V) | Sort dominates; Union-Find ≈ O(α(V)) per op |
| Prim (binary heap) | O(E log V) | O(V) | Lazy heap; good on sparse graphs |
| Prim (dense, array) | O(V²) | O(V) | Scan all vertices for min edge |
| Borůvka | O(E log V) | O(V) | Parallel-friendly variant |

## Full Implementation

### C#

```csharp
public record UndirectedEdge(int U, int V, int Weight);

public class DisjointSet {
    private readonly int[] parent;
    private readonly int[] rank;

    public DisjointSet(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int Find(int x) {
        if (parent[x] != x) parent[x] = Find(parent[x]);
        return parent[x];
    }

    public bool Union(int x, int y) {
        int px = Find(x), py = Find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else { parent[py] = px; rank[px]++; }
        return true;
    }
}

public static class MST {
    // Canonical: Kruskal on edge list
    public static (List<UndirectedEdge> mst, int totalWeight) Kruskal(int n, List<UndirectedEdge> edges) {
        var sorted = edges.OrderBy(e => e.Weight).ToList();
        var dsu = new DisjointSet(n);
        var mst = new List<UndirectedEdge>();
        int weight = 0;

        foreach (var e in sorted) {
            if (dsu.Union(e.U, e.V)) {
                mst.Add(e);
                weight += e.Weight;
                if (mst.Count == n - 1) break;
            }
        }
        return (mst, weight);
    }

    // Canonical: Prim on edge list (builds adjacency list internally)
    public static (List<UndirectedEdge> mst, int totalWeight) Prim(int n, List<UndirectedEdge> edges, int start = 0) {
        var adj = new List<(int to, int w)>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<(int, int)>();
        foreach (var e in edges) {
            adj[e.U].Add((e.V, e.Weight));
            adj[e.V].Add((e.U, e.Weight));
        }

        var inTree = new bool[n];
        var mst = new List<UndirectedEdge>();
        int totalWeight = 0;

        var pq = new PriorityQueue<int, int>();
        inTree[start] = true;
        foreach (var (to, w) in adj[start])
            pq.Enqueue(to, w);

        while (pq.Count > 0 && mst.Count < n - 1) {
            pq.TryDequeue(out int v, out int w);
            if (inTree[v]) continue;

            inTree[v] = true;
            totalWeight += w;
            mst.Add(new UndirectedEdge(start, v, w)); // parent tracking simplified

            foreach (var (to, wt) in adj[v]) {
                if (!inTree[to]) pq.Enqueue(to, wt);
            }
        }
        return (mst, totalWeight);
    }

    // Prim with explicit parent tracking for correct edge recording
    public static (List<UndirectedEdge> mst, int totalWeight) PrimWithParent(int n, List<UndirectedEdge> edges, int start = 0) {
        var adj = new List<(int to, int w)>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<(int, int)>();
        foreach (var e in edges) {
            adj[e.U].Add((e.V, e.Weight));
            adj[e.V].Add((e.U, e.Weight));
        }

        var inTree = new bool[n];
        var parent = new int[n];
        Array.Fill(parent, -1);
        var key = new int[n];
        Array.Fill(key, int.MaxValue);
        key[start] = 0;

        var mst = new List<UndirectedEdge>();
        int totalWeight = 0;

        for (int count = 0; count < n; count++) {
            int u = -1;
            for (int i = 0; i < n; i++)
                if (!inTree[i] && (u == -1 || key[i] < key[u])) u = i;

            inTree[u] = true;
            if (parent[u] != -1) {
                mst.Add(new UndirectedEdge(parent[u], u, key[u]));
                totalWeight += key[u];
            }

            foreach (var (v, w) in adj[u]) {
                if (!inTree[v] && w < key[v]) {
                    key[v] = w;
                    parent[v] = u;
                }
            }
        }
        return (mst, totalWeight);
    }
}
```

### Go

```go
type UEdge struct {
    U, V, Weight int
}

type DSU struct {
    parent, rank []int
}

func NewDSU(n int) *DSU {
    d := &DSU{parent: make([]int, n), rank: make([]int, n)}
    for i := range d.parent {
        d.parent[i] = i
    }
    return d
}

func (d *DSU) Find(x int) int {
    if d.parent[x] != x {
        d.parent[x] = d.Find(d.parent[x])
    }
    return d.parent[x]
}

func (d *DSU) Union(x, y int) bool {
    px, py := d.Find(x), d.Find(y)
    if px == py {
        return false
    }
    if d.rank[px] < d.rank[py] {
        d.parent[px] = py
    } else if d.rank[px] > d.rank[py] {
        d.parent[py] = px
    } else {
        d.parent[py] = px
        d.rank[px]++
    }
    return true
}

// Kruskal — canonical MST from edge list
func Kruskal(n int, edges []UEdge) (mst []UEdge, totalWeight int) {
    sorted := make([]UEdge, len(edges))
    copy(sorted, edges)
    sort.Slice(sorted, func(i, j int) bool {
        return sorted[i].Weight < sorted[j].Weight
    })

    dsu := NewDSU(n)
    for _, e := range sorted {
        if dsu.Union(e.U, e.V) {
            mst = append(mst, e)
            totalWeight += e.Weight
            if len(mst) == n-1 {
                break
            }
        }
    }
    return mst, totalWeight
}

// Prim — canonical MST from edge list via min-heap
func Prim(n int, edges []UEdge, start int) (mst []UEdge, totalWeight int) {
    adj := make([][]struct{ to, w int }, n)
    for _, e := range edges {
        adj[e.U] = append(adj[e.U], struct{ to, w int }{e.V, e.Weight})
        adj[e.V] = append(adj[e.V], struct{ to, w int }{e.U, e.Weight})
    }

    inTree := make([]bool, n)
    parent := make([]int, n)
    for i := range parent {
        parent[i] = -1
    }

    type heapItem struct {
        v, w int
    }
    h := &primHeap{}
    heap.Init(h)

    inTree[start] = true
    for _, e := range adj[start] {
        heap.Push(h, &heapItem{v: e.to, w: e.w})
        parent[e.to] = start
    }

    for h.Len() > 0 && len(mst) < n-1 {
        item := heap.Pop(h).(*heapItem)
        v, w := item.v, item.w
        if inTree[v] {
            continue
        }
        inTree[v] = true
        totalWeight += w
        mst = append(mst, UEdge{parent[v], v, w})

        for _, e := range adj[v] {
            if !inTree[e.to] {
                heap.Push(h, &heapItem{v: e.to, w: e.w})
                parent[e.to] = v
            }
        }
    }
    return mst, totalWeight
}

type primHeap []*struct{ v, w int }

func (h primHeap) Len() int            { return len(h) }
func (h primHeap) Less(i, j int) bool  { return h[i].w < h[j].w }
func (h primHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *primHeap) Push(x interface{}) { *h = append(*h, x.(*struct{ v, w int })) }
func (h *primHeap) Pop() interface{} {
    old := *h
    n := len(old)
    item := old[n-1]
    *h = old[:n-1]
    return item
}
```

Add `import ("container/heap"; "sort")` at the top of a real Go file. See `examples/go/union_find_mst.go` for a runnable Kruskal demo.

## Kruskal vs Prim

| Aspect | Kruskal | Prim |
|--------|---------|------|
| Best on | Sparse graphs (E ≈ V) | Dense graphs |
| Core structure | Sort + Union-Find | Priority queue |
| Edge input | Natural fit for edge lists | Build adjacency list |
| Parallelism | Sort + filter is parallel-friendly | Harder to parallelize |
| Intuition | Add global cheapest safe edge | Grow tree from a seed |

## Real World

- **Network design** — minimum-cost fiber, cable, or power line layout connecting all sites.
- **Clustering** — single-linkage clustering is MST-based (cut longest edges).
- **Image segmentation** — treat pixels as vertices; MST merges similar regions.
- **Approximation algorithms** — MST is a 2-approximation for metric TSP (double the tree).
- **PCB / VLSI layout** — wire all pins with minimum total wire length.
- **Social graphs** — find backbone connections that link communities cheaply.

## Problems

- Min Cost to Connect All Points (MST on complete graph of coordinates)
- Connecting Cities With Minimum Cost
- Critical Connections (find bridges — related graph theory)
- Optimize Water Distribution (MST variant)

## Summary

MST algorithms are textbook greedy: Kruskal sorts and unions, Prim grows with a heap. Both produce minimum total weight spanning trees. Pair Kruskal with [Union-Find](../data-structures/25-disjoint-set-union-find.md) — one of the most satisfying algorithm + data structure combinations in computer science.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Network Optimizer](/projects/tier-3/15-network-optimizer) — Kruskal + Prim on edge lists with Union-Find for backbone design.
:::

**Next:** [32 - A* Search (A-star)](32-astar.md)