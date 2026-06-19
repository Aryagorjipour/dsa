# 29 - Floyd-Warshall Algorithm

## The Problem

**Find shortest paths between ALL pairs of vertices in a weighted graph (dense graph).**

Can handle negative weights (but no negative cycles).

## Flagship Problem

In a small city with 100 intersections and known travel times (some one-way), answer "what is the fastest way from any point A to any point B?" for hundreds of queries.

Running Dijkstra from each vertex is O(V * (V+E) log V). Floyd-Warshall is simple O(V³) and gives all answers in a matrix.

Also used for:
- Transitive closure (reachability)
- Finding if graph has negative cycle (check diagonal <0 after run)

## Full Implementation

### C#

```csharp
public static double[,] FloydWarshall(double[,] graph) {
    int n = graph.GetLength(0);
    double[,] dist = (double[,])graph.Clone();

    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (dist[i, k] + dist[k, j] < dist[i, j])
                    dist[i, j] = dist[i, k] + dist[k, j];

    return dist;
}
```

Handle infinities carefully (use a large number for "no edge").

Go equivalent.

## Complexity

O(V³) time, O(V²) space.

## Real World

- Small dense graphs in routing
- All-pairs in social network analysis
- Some compiler analyses
- Warshall for reachability (bitsets can optimize)

Floyd-Warshall is the elegant "dynamic programming on graphs" for all-pairs.
