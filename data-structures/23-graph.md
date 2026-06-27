# 23 - Graph

## What is a Graph?

A **graph** is a collection of **vertices** (nodes) connected by **edges**.

Graphs are the most general data structure for modeling relationships.

If you can draw dots and lines between them, it's probably a graph.

## Types of Graphs

- **Undirected**: Edges have no direction (friendship on Facebook)
- **Directed**: Edges have direction (Twitter follows, web links, dependencies)
- **Weighted**: Edges have costs/weights (road distances, flight prices)
- **Unweighted**: All edges are equal
- **Cyclic / Acyclic**: Contains cycles or not
- **Connected / Disconnected**
- **Dense / Sparse**

Special important graphs:
- **Tree** = connected acyclic graph
- **DAG** (Directed Acyclic Graph) = very important in builds, scheduling, Git, etc.

## Representations (Critical)

### 1. Adjacency List (Most Common)

Memory efficient for sparse graphs, fast iteration over neighbors.

### 2. Adjacency Matrix

O(1) edge check, O(n²) memory. Bad for sparse graphs.

### 3. Edge List

Simple but slow for most algorithms.

## Operations & Complexity (Adjacency List)

| Operation           | Time        | Space |
|---------------------|-------------|-------|
| Add vertex          | O(1)        | O(V + E) |
| Add edge            | O(1) avg    | O(V + E) |
| Remove edge         | O(degree)   | O(V + E) |
| Neighbors(v)        | O(degree)   | O(V + E) |
| Check edge (u, v)   | O(degree)   | O(V + E) |

## Complete Implementation (C#) — Adjacency List

```csharp
public class Graph {
    private readonly Dictionary<int, List<int>> _adj = new();
    public bool Directed { get; }

    public Graph(bool directed = false) {
        Directed = directed;
    }

    public void AddVertex(int v) {
        if (!_adj.ContainsKey(v)) {
            _adj[v] = new List<int>();
        }
    }

    public void AddEdge(int u, int v) {
        AddVertex(u);
        AddVertex(v);
        _adj[u].Add(v);
        if (!Directed) {
            _adj[v].Add(u);
        }
    }

    public IReadOnlyList<int> Neighbors(int v) {
        if (!_adj.TryGetValue(v, out var list)) {
            return Array.Empty<int>();
        }
        return list;
    }

    public IEnumerable<int> Vertices => _adj.Keys;

    public bool HasEdge(int u, int v) {
        return _adj.TryGetValue(u, out var list) && list.Contains(v);
    }

    public int VertexCount => _adj.Count;

    public int EdgeCount {
        get {
            int count = _adj.Values.Sum(l => l.Count);
            return Directed ? count : count / 2;
        }
    }
}
```

## Complete Implementation (Go) — Adjacency List

```go
type Graph struct {
    adj      map[int][]int
    directed bool
}

func NewGraph(directed bool) *Graph {
    return &Graph{
        adj:      make(map[int][]int),
        directed: directed,
    }
}

func (g *Graph) AddVertex(v int) {
    if _, ok := g.adj[v]; !ok {
        g.adj[v] = []int{}
    }
}

func (g *Graph) AddEdge(u, v int) {
    g.AddVertex(u)
    g.AddVertex(v)
    g.adj[u] = append(g.adj[u], v)
    if !g.directed {
        g.adj[v] = append(g.adj[v], u)
    }
}

func (g *Graph) Neighbors(v int) []int {
    if list, ok := g.adj[v]; ok {
        return list
    }
    return nil
}

func (g *Graph) HasEdge(u, v int) bool {
    for _, n := range g.adj[u] {
        if n == v {
            return true
        }
    }
    return false
}

func (g *Graph) VertexCount() int {
    return len(g.adj)
}
```

## Real World Graphs (This List Is Massive)

### 1. Social Networks

Facebook friends graph (undirected), Twitter/Instagram follow graph (directed).

### 2. Web

The entire internet is a directed graph. Google's original PageRank is a graph algorithm.

### 3. Maps and Navigation

Roads as edges, intersections as nodes. Google Maps, Uber, Waze run graph algorithms constantly.

### 4. Package Managers & Build Systems

npm, Maven, NuGet, Go modules: dependency graphs (DAGs). Make, Bazel, MSBuild use topological sort.

### 5. Databases & Data Modeling

Neo4j, Amazon Neptune, JanusGraph are graph databases.

### 6. Operating Systems & Runtimes

Process dependency graphs, .NET and Go dependency graphs for assemblies/modules.

### 7. Networking

Network topology, routing tables (BGP is fundamentally graph-based).

### 8. Finance

Transaction graphs (fraud detection), ownership graphs, payment networks.

### 9. Games

State spaces, navigation meshes, quest/dialogue graphs.

## Core Graph Algorithms (We'll Cover in Depth Later)

![BFS on a Graph](/images/bfs-graph.png)

- BFS & DFS (traversal)
- Topological Sort (on DAGs)
- Dijkstra, Bellman-Ford, Floyd-Warshall (shortest paths)
- Minimum Spanning Tree (Kruskal, Prim)
- A* (heuristic search)
- Strongly Connected Components
- Maximum Flow / Min Cut
- Cycle detection

## Graph in C# and Go Ecosystems

**C#**
- No built-in graph, but `Dictionary` + lists is common.
- Libraries: QuikGraph, GraphSharp.
- Roslyn, MSBuild, and Entity Framework model parts of the world as graphs internally.

**Go**
- Maps of slices.
- Used heavily in Kubernetes, Docker, Terraform providers.

## Common Graph Problems in Interviews & Real Life

- Clone graph
- Number of islands (matrix as graph)
- Course schedule (topological sort)
- Network delay time (Dijkstra)
- Critical connections in a network (bridges)
- Word ladder
- Alien dictionary

## Summary

Graphs are the ultimate modeling tool for **relationships**.

If your problem involves "connections", "dependencies", "networks", "routes", or "influence", there is almost always a graph hiding underneath.

Mastering graphs + the algorithms that run on them (BFS, DFS, shortest path, topological sort, MST) will make you dramatically more powerful as an engineer.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Route Planner](/projects/tier-2/08-route-planner) and [Network Optimizer](/projects/tier-3/15-network-optimizer) — shortest paths and backbone design.
:::

**Next:** [24 - Bloom Filter](24-bloom-filter.md)