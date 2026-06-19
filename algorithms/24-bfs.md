# 24 - Breadth-First Search (BFS)

## The Canonical Problem BFS Solves

"Find the shortest path from A to B in an **unweighted** graph (or grid)."

Every time you hear "shortest path" and edges have no weight (or weight 1), think BFS.

## How It Works

Use a **queue**.

- Start from source
- Visit all neighbors (level 1)
- Then all their unvisited neighbors (level 2)
- And so on

This naturally finds shortest path in terms of number of edges.

## Classic Real Examples

- "Minimum number of moves in a game" (chess king, snake, etc.)
- "Shortest transformation from word A to word B" (word ladder)
- Level-order traversal of a tree
- Finding connected components
- "Degrees of separation" in social networks
- Pac-Man / maze solving (unweighted)

## Implementation Pattern (C#)

```csharp
int ShortestPath(Node start, Node target) {
    var queue = new Queue<(Node, int)>();
    var visited = new HashSet<Node>();
    queue.Enqueue((start, 0));
    visited.Add(start);

    while (queue.Count > 0) {
        var (node, dist) = queue.Dequeue();
        if (node == target) return dist;

        foreach (var nei in node.Neighbors) {
            if (visited.Add(nei)) {
                queue.Enqueue((nei, dist + 1));
            }
        }
    }
    return -1;
}
```

## Grid Version (Very Common)

Treat each cell as a node. Use (r,c) tuples or encode as single int.

Use a visited 2D array or set.

## Why Queue, Not Stack?

Queue = level by level = shortest path in unweighted.

Stack (or recursion) = DFS = can find a path, not necessarily shortest.

## Real Systems

- Google Maps (for walking when all paths cost ~1)
- Many game pathfinding (when movement cost is uniform)
- Network routing protocols in simple cases
- Dependency resolution at the same "level"

## Summary

BFS is the tool for shortest path when all edges cost the same.

It is also the foundation for many level-based processing algorithms.
