# 28 - Bellman-Ford Algorithm

## The Problem That Shows Why Bellman-Ford Exists

**Problem: Find shortest paths from a single source in a graph that may contain negative edge weights, and detect negative weight cycles.**

Dijkstra fails with negative weights.

### Flagship Real Problem: Currency Arbitrage Detection

You are given exchange rates between currencies. Is there a way to start with 1 unit of currency A, exchange through a cycle, and end up with more than 1 unit of A?

This is a positive cycle in log space.

Solution:
- Model currencies as vertices
- Edge from currency u to v with weight = -log(exchange rate u->v)
- Run Bellman-Ford
- If negative cycle exists after |V|-1 iterations, arbitrage opportunity exists.

This is why Bellman-Ford was invented — negative weights and cycle detection.

## Full Algorithm

Relax all edges |V|-1 times.
On |V|th relaxation, if any update possible → negative cycle.

### C# Implementation (with negative cycle detection)

```csharp
public class BellmanFord {
    public (double[] dist, bool hasNegativeCycle) ShortestPaths(List<Edge> edges, int V, int source) {
        double[] dist = new double[V];
        Array.Fill(dist, double.PositiveInfinity);
        dist[source] = 0;

        for (int i = 1; i < V; i++) {
            bool updated = false;
            foreach (var e in edges) {
                if (dist[e.From] + e.Weight < dist[e.To]) {
                    dist[e.To] = dist[e.From] + e.Weight;
                    updated = true;
                }
            }
            if (!updated) break;
        }

        bool hasNeg = false;
        foreach (var e in edges) {
            if (dist[e.From] + e.Weight < dist[e.To]) {
                hasNeg = true;
                break;
            }
        }
        return (dist, hasNeg);
    }
}

public record Edge(int From, int To, double Weight);
```

Go version with slices.

## Real World

- Currency trading systems
- Routing with possible "negative costs" (subsidies)
- Detecting arbitrage in order books
- Some constraint satisfaction

Bellman-Ford is slower O(VE) but more general than Dijkstra.
