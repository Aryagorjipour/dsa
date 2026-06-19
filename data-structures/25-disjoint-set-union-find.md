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

## Implementation (C#)

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
            parent[x] = Find(parent[x]); // path compression
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

Go version is nearly identical.

## Real World Use Cases

### 1. Kruskal's Minimum Spanning Tree

One of the two classic MST algorithms. Union-Find is used to avoid adding edges that would create cycles.

### 2. Connected Components in Graphs

Finding how many separate components exist, or labeling them.

Used in:
- Image processing (connected regions of pixels)
- Social network "friend circles"
- Network connectivity problems

### 3. Percolation / Grid Problems

Famous in physics and games ("when does water reach the bottom?").

### 4. Building Mazes (Randomized)

Union-Find is perfect for generating mazes by randomly merging cells.

### 5. Account Merge Problems

"These two emails belong to the same person" → union them. Classic real-world problem at any company with user accounts.

### 6. Redundant Connection Detection

"Which edge can we remove without disconnecting the network?"

### 7. Database & Distributed Systems

Some clustering and sharding decisions use union-find logic.

## When Union-Find Shines

- You only care about **connectivity**, not paths or distances.
- You do a huge number of unions and finds.
- The graph is being built dynamically.

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

**Next:** [26 - HyperLogLog](26-hyperloglog.md)
