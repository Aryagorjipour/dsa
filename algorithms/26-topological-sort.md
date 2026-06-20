# 26 - Topological Sort

## The Problem

Given a directed acyclic graph (DAG), produce a linear ordering of nodes such that for every directed edge u → v, u comes before v.

If the graph has a cycle, no valid topological order exists.

## Why It Exists

Scheduling with dependencies:
- "A must happen before B"
- Install packages in correct order
- Compile files in correct order
- Course prerequisites

## Two Main Algorithms

1. **DFS + finishing times** (post-order)
2. **Kahn's algorithm** (BFS + indegrees)

Both are O(V + E).

## Real World Examples

- npm / yarn / pnpm / NuGet / Go module resolution
- Build systems (Make, Bazel, MSBuild, Cargo)
- CI/CD pipeline stage ordering
- Database migration ordering
- Task orchestration in Airflow, Dagster, Prefect, etc.

## Kahn's Algorithm Sketch

```csharp
Queue<int> queue = new();
foreach (var node in nodes) if (indegree[node] == 0) queue.Enqueue(node);

List<int> order = new();
while (queue.Count > 0) {
    int u = queue.Dequeue();
    order.Add(u);
    foreach (int v in graph[u]) {
        if (--indegree[v] == 0) queue.Enqueue(v);
    }
}
if (order.Count != nodes.Count) // cycle
```

## Summary

Topological sort is the algorithm that makes "do things in the right dependency order" possible at scale in every build tool and package manager you use.
::: tip Project Lab
**Build it yourself:** [Task Queue System](/projects/tier-2/06-task-queue-system) — Kahn's algorithm for dependency ordering.
:::
