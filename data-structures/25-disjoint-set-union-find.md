# 25 - Disjoint Set (Union-Find)

## What is Disjoint Set?

**Disjoint Set** (also called Union-Find) is a data structure that tracks a collection of **disjoint** (non-overlapping) sets.

It answers two fundamental questions very efficiently:
- "Are these two elements in the same set?"
- "Merge these two sets together"

## Core Operations

- `Find(x)` — which set does x belong to?
- `Union(x, y)` — merge the sets containing x and y
- `Connected(x, y)` — convenience wrapper around find

With the two key optimizations (union by rank/size + path compression), both operations are **effectively O(1)** (more precisely O(α(n)) where α is the inverse Ackermann function — grows so slowly it's basically constant for any practical n).

## The Two Magic Optimizations

1. **Union by rank (or size)**: When merging two trees, always attach the smaller/shorter to the taller. Keeps trees flat.
2. **Path compression**: When finding the root of a node, make every node on the path point directly to the root. This flattens the tree dramatically over time.

Together they make the structure ridiculously fast.

## Operations & Complexity

| Operation   | Amortized | Space |
|-------------|-----------|-------|
| Find        | O(α(n))   | O(n)  |
| Union       | O(α(n))   | O(n)  |
| Connected   | O(α(n))   | O(n)  |

α(n) ≤ 4 for any n that fits in the observable universe.

## Complete Implementation (C#)

```csharp
public class DisjointSet {
    private int[] parent;
    private int[] rank;

    public DisjointSet(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int Find(int x) {
        if (parent[x] != x) {
            parent[x] = Find(parent[x]);
        }
        return parent[x];
    }

    public void Union(int x, int y) {
        int px = Find(x);
        int py = Find(y);
        if (px == py) return;

        if (rank[px] < rank[py]) {
            parent[px] = py;
        } else if (rank[px] > rank[py]) {
            parent[py] = px;
        } else {
            parent[py] = px;
            rank[px]++;
        }
    }

    public bool Connected(int x, int y) => Find(x) == Find(y);
}
```

## Complete Implementation (Go)

From `examples/go/union_find_mst.go`.

```go
type DisjointSet struct {
    parent []int
    rank   []int
}

func NewDisjointSet(n int) *DisjointSet {
    d := &DisjointSet{
        parent: make([]int, n),
        rank:   make([]int, n),
    }
    for i := range d.parent {
        d.parent[i] = i
    }
    return d
}

func (d *DisjointSet) Find(x int) int {
    if d.parent[x] != x {
        d.parent[x] = d.Find(d.parent[x])
    }
    return d.parent[x]
}

func (d *DisjointSet) Union(x, y int) {
    px, py := d.Find(x), d.Find(y)
    if px == py {
        return
    }
    if d.rank[px] < d.rank[py] {
        d.parent[px] = py
    } else if d.rank[px] > d.rank[py] {
        d.parent[py] = px
    } else {
        d.parent[py] = px
        d.rank[px]++
    }
}

func (d *DisjointSet) Connected(x, y int) bool {
    return d.Find(x) == d.Find(y)
}
```

### Example: Kruskal's Minimum Spanning Tree

```go
edges := [][3]int{{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}
sort.Slice(edges, func(i, j int) bool { return edges[i][2] < edges[j][2] })

dsu := NewDisjointSet(4)
mstWeight := 0
for _, e := range edges {
    if !dsu.Connected(e[0], e[1]) {
        dsu.Union(e[0], e[1])
        mstWeight += e[2]
    }
}
```

## Real World Use Cases

### 1. Kruskal's Minimum Spanning Tree

Network design (cable laying), clustering, image segmentation.

### 2. Connected Components in Graphs

Image processing (connected regions of pixels), social network "friend circles".

### 3. Percolation / Grid Problems

"When does water reach the bottom?" — famous in physics and games.

### 4. Building Mazes (Randomized)

Union-Find is perfect for generating mazes by randomly merging cells.

### 5. Account Merge Problems

"These two emails belong to the same person" → union them.

### 6. Redundant Connection Detection

"Which edge can we remove without disconnecting the network?"

## Limitations

- It is destructive (hard to undo unions without extra work).
- It does not give you paths or distances.
- For full graph algorithms you often need adjacency lists + BFS/DFS instead.

## Famous Problems

- Number of Provinces
- Surrounded Regions
- Accounts Merge
- Redundant Connection
- Kruskal MST reconstruction
- Largest Component Size by Common Factor

## Summary

Disjoint Set / Union-Find is one of the most beautiful "small but mighty" data structures.

With two clever optimizations it achieves near-constant time for connectivity queries, making it the weapon of choice for MST, component labeling, and many union-heavy problems.

::: tip Project Lab
**Build it yourself:** [Network Optimizer](/projects/tier-3/15-network-optimizer)
:::

**Next:** [26 - HyperLogLog](26-hyperloglog.md)