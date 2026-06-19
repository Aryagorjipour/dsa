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

```csharp
Dictionary<int, List<int>> graph = new();
graph[0] = new List<int> { 1, 2 };
graph[1] = new List<int> { 0, 3 };
```

Go:
```go
graph := map[int][]int{
    0: {1, 2},
    1: {0, 3},
}
```

Pros: Memory efficient for sparse graphs, fast iteration over neighbors.
Cons: Slow to check "is there an edge between u and v?"

### 2. Adjacency Matrix

```csharp
bool[,] matrix = new bool[n, n];
matrix[0, 1] = true;
matrix[1, 0] = true; // undirected
```

Pros: O(1) edge check.
Cons: O(n²) memory. Bad for sparse graphs.

### 3. Edge List

Just a list of pairs. Simple but slow for most algorithms.

### 4. Specialized (Incidence, CSR, etc.)

Used in high-performance graph databases and libraries.

## Real World Graphs (This List Is Massive)

### 1. Social Networks

- Facebook friends graph (undirected)
- Twitter / Instagram follow graph (directed)
- LinkedIn professional network

### 2. Web

- The entire internet is a directed graph (pages → links)
- Google's original PageRank is a graph algorithm

### 3. Maps and Navigation

- Roads as edges, intersections as nodes
- Google Maps, Uber, Waze all run graph algorithms constantly

### 4. Package Managers & Build Systems

- npm, Maven, NuGet, Go modules: dependency graphs (DAGs)
- Make, Bazel, MSBuild: task dependency graphs
- Topological sort is used to decide build order

### 5. Databases & Data Modeling

- Many-to-many relationships are graphs
- Neo4j, Amazon Neptune, JanusGraph are graph databases
- Recommendation engines ("people who bought X also bought Y")

### 6. Operating Systems & Runtimes

- Process dependency graphs
- File system hard links (can form graphs)
- .NET and Go dependency graphs for assemblies/modules

### 7. Networking

- Network topology
- Routing tables (BGP is fundamentally graph-based)
- CDN server relationships

### 8. Biology & Chemistry

- Protein interaction networks
- Metabolic pathways
- Molecular graphs

### 9. Finance

- Transaction graphs (fraud detection)
- Ownership graphs
- Payment networks

### 10. Games

- State spaces
- Navigation meshes (often turned into graphs)
- Quest / dialogue graphs

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
- Libraries: QuikGraph, GraphSharp, Microsoft Automatic Graph Layout.
- Roslyn, MSBuild, and Entity Framework all model parts of the world as graphs internally.

**Go**
- Again, maps of slices.
- Used heavily in Kubernetes (object relationships, scheduling), Docker, Terraform providers, etc.
- Many high-scale Go services have custom graph packages.

## Common Graph Problems in Interviews & Real Life

- Clone graph
- Number of islands (matrix as graph)
- Course schedule (topological sort)
- Network delay time (Dijkstra)
- Critical connections in a network (bridges)
- Word ladder
- Alien dictionary
- Reconstruct itinerary (Euler path)

## Storage at Massive Scale

When graphs have billions of nodes/edges:
- Special graph databases
- Distributed graph processing (Pregel, GraphX, GraphChi)
- Sharded adjacency lists
- Compression techniques

Facebook, LinkedIn, Google, and Twitter all run some of the largest graphs in existence.

## Summary

Graphs are the ultimate modeling tool for **relationships**.

If your problem involves "connections", "dependencies", "networks", "routes", or "influence", there is almost always a graph hiding underneath.

Mastering graphs + the algorithms that run on them (BFS, DFS, shortest path, topological sort, MST) will make you dramatically more powerful as an engineer.

**Next:** Probabilistic data structures begin with [24 - Bloom Filter](24-bloom-filter.md)
