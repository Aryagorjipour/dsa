# 27 - Topological Sort

## The Problem Topological Sort Solves

**Problem: Given a directed acyclic graph (DAG), produce a linear ordering of vertices such that for every edge u → v, u appears before v.**

If the graph contains a cycle, no valid topological order exists.

### Canonical Problem: Build Dependency Order (Kahn's Algorithm)

Given tasks with prerequisites (directed edges `prerequisite → task`), output an execution order that respects all dependencies. Detect impossible schedules (cycles).

**Why Kahn's works:** Repeatedly peel off tasks with indegree 0 — they have no unmet dependencies. Decrement indegrees of dependents; if a node never reaches indegree 0, it sits on a cycle.

## How It Works (Kahn's Algorithm)

1. Compute indegree for every vertex.
2. Enqueue all vertices with indegree 0.
3. Dequeue `u`, append to result, decrement indegree of each neighbor `v`.
4. If `v`'s indegree becomes 0, enqueue `v`.
5. If result length < V, a cycle exists.

This is BFS on the **indegree layer** — the dual view of DFS post-order topological sort.

## Complexity

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Kahn's (BFS) | O(V + E) | O(V) | Queue + indegree array |
| DFS post-order | O(V + E) | O(V) | Push onto stack after visiting children |
| Cycle detection | O(V + E) | O(V) | Kahn's: `order.Count < V` |

## Full Implementation

### C#

```csharp
public static class TopologicalSort {
    // Canonical: Kahn's algorithm — build dependency order from edge list
    // edges[i] = (from, to) means from must complete before to
    public static (List<int> order, bool hasCycle) Kahn(int n, List<(int from, int to)> edges) {
        var graph = new List<int>[n];
        var indegree = new int[n];
        for (int i = 0; i < n; i++) graph[i] = new List<int>();

        foreach (var (from, to) in edges) {
            graph[from].Add(to);
            indegree[to]++;
        }

        var queue = new Queue<int>();
        for (int i = 0; i < n; i++)
            if (indegree[i] == 0) queue.Enqueue(i);

        var order = new List<int>();
        while (queue.Count > 0) {
            int u = queue.Dequeue();
            order.Add(u);
            foreach (int v in graph[u]) {
                if (--indegree[v] == 0) queue.Enqueue(v);
            }
        }

        return (order, order.Count != n);
    }

    // Course schedule variant: return true if all courses can be finished
    public static bool CanFinish(int numCourses, int[][] prerequisites) {
        var edges = new List<(int, int)>();
        foreach (var p in prerequisites)
            edges.Add((p[1], p[0])); // prerequisite → course
        var (_, hasCycle) = Kahn(numCourses, edges);
        return !hasCycle;
    }

    // DFS-based topological sort (alternative)
    public static (List<int> order, bool hasCycle) DfsTopo(int n, List<(int from, int to)> edges) {
        var graph = new List<int>[n];
        for (int i = 0; i < n; i++) graph[i] = new List<int>();
        foreach (var (from, to) in edges) graph[from].Add(to);

        var state = new int[n]; // 0=unvisited, 1=on stack, 2=done
        var stack = new Stack<int>();

        bool Dfs(int u) {
            state[u] = 1;
            foreach (int v in graph[u]) {
                if (state[v] == 1) return false;
                if (state[v] == 0 && !Dfs(v)) return false;
            }
            state[u] = 2;
            stack.Push(u);
            return true;
        }

        for (int i = 0; i < n; i++)
            if (state[i] == 0 && !Dfs(i)) return (new List<int>(), true);

        var order = new List<int>();
        while (stack.Count > 0) order.Add(stack.Pop());
        return (order, false);
    }
}
```

### Go

```go
type Edge struct{ From, To int }

// Kahn — canonical topological sort via indegree BFS
func Kahn(n int, edges []Edge) (order []int, hasCycle bool) {
    graph := make([][]int, n)
    indegree := make([]int, n)

    for _, e := range edges {
        graph[e.From] = append(graph[e.From], e.To)
        indegree[e.To]++
    }

    queue := make([]int, 0)
    for i := 0; i < n; i++ {
        if indegree[i] == 0 {
            queue = append(queue, i)
        }
    }

    head := 0
    for head < len(queue) {
        u := queue[head]
        head++
        order = append(order, u)
        for _, v := range graph[u] {
            indegree[v]--
            if indegree[v] == 0 {
                queue = append(queue, v)
            }
        }
    }

    return order, len(order) != n
}

// CanFinish — course schedule: true if no cycle in prerequisite graph
func CanFinish(numCourses int, prerequisites [][]int) bool {
    edges := make([]Edge, len(prerequisites))
    for i, p := range prerequisites {
        edges[i] = Edge{From: p[1], To: p[0]} // prerequisite → course
    }
    _, hasCycle := Kahn(numCourses, edges)
    return !hasCycle
}

// DfsTopo — DFS post-order alternative
func DfsTopo(n int, edges []Edge) (order []int, hasCycle bool) {
    graph := make([][]int, n)
    for _, e := range edges {
        graph[e.From] = append(graph[e.From], e.To)
    }

    state := make([]int, n) // 0=unvisited, 1=on stack, 2=done
    stack := make([]int, 0)

    var dfs func(int) bool
    dfs = func(u int) bool {
        state[u] = 1
        for _, v := range graph[u] {
            if state[v] == 1 {
                return false
            }
            if state[v] == 0 && !dfs(v) {
                return false
            }
        }
        state[u] = 2
        stack = append(stack, u)
        return true
    }

    for i := 0; i < n; i++ {
        if state[i] == 0 && !dfs(i) {
            return nil, true
        }
    }

    for i := len(stack) - 1; i >= 0; i-- {
        order = append(order, stack[i])
    }
    return order, false
}
```

## Kahn's vs DFS Post-Order

| Aspect | Kahn's | DFS post-order |
|--------|--------|----------------|
| Intuition | Peel ready tasks (indegree 0) | Finish children, then push node |
| Data structure | Queue | Recursion stack |
| Cycle detect | `order.len < V` | Back edge during DFS |
| Parallelism | Natural — all indegree-0 nodes can run together | Harder to parallelize |

Prefer **Kahn's** when modeling task queues and build pipelines.

## Real World

- **Package managers** — npm, yarn, NuGet, Go modules resolve install order from dependency graphs.
- **Build systems** — Make, Bazel, MSBuild, Cargo compile targets in topological order.
- **CI/CD pipelines** — stage ordering when jobs declare upstream dependencies.
- **Database migrations** — run schema changes only after their prerequisites.
- **Task orchestration** — Airflow, Dagster, Prefect schedule DAGs of jobs.
- **Course planning** — prerequisite chains in university registration systems.

## Problems

- Course Schedule I & II
- Alien Dictionary (build graph from ordering constraints)
- Minimum Height Trees (peel leaves layer by layer — related BFS idea)
- Sequence Reconstruction (validate unique topological order)

## Summary

Topological sort turns dependency graphs into executable orderings. Kahn's algorithm is the canonical BFS approach: track indegrees, dequeue ready nodes, detect cycles when nodes remain. Every build tool you use runs a variant of this.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Task Queue System](/projects/tier-2/06-task-queue-system) — Kahn's algorithm for dependency ordering with cycle detection.
:::

**Next:** [28 - Dijkstra's Shortest Path](28-dijkstra.md)