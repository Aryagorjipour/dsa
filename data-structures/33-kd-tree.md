# 33 - KD Tree

## What is a KD Tree?

A **k-dimensional tree** (KD-tree) is a binary tree for organizing points in k-dimensional space.

For 2D: alternates splitting on X and Y.
For 3D: cycles through X, Y, Z.
For higher dimensions: cycles through the dimensions.

Each level splits the space along one axis.

![KD Tree](/images/kd-tree.png)

## Strengths

- Very good for **nearest neighbor** searches in low dimensions (k ≤ 10–20).
- Relatively simple to build.
- Can answer range searches.

## Weaknesses

- Performance degrades badly in high dimensions (curse of dimensionality).
- Not great for frequent updates (most implementations are static).
- Nearest neighbor can degenerate in worst case.

## Operations & Complexity

| Operation        | Average (low dim) | Worst case | Space |
|------------------|-------------------|------------|-------|
| Build (n points) | O(n log n)        | O(n log n) | O(n)  |
| Nearest neighbor | O(log n)          | O(n)       | O(n)  |
| Range query      | O(n^(1−1/k) + m)  | O(n)       | O(n)  |

m = number of points in range.

## Complete Implementation (C#)

```csharp
public record Point2D(double X, double Y);

public class KDTree {
    private class Node {
        public Point2D Point;
        public Node? Left, Right;
        public int Axis; // 0 = X, 1 = Y

        public Node(Point2D p, int axis) {
            Point = p;
            Axis = axis;
        }
    }

    private Node? root;

    public void Build(List<Point2D> points) {
        root = BuildRecursive(points, 0);
    }

    private Node? BuildRecursive(List<Point2D> points, int depth) {
        if (points.Count == 0) return null;
        int axis = depth % 2;
        points.Sort((a, b) => axis == 0
            ? a.X.CompareTo(b.X)
            : a.Y.CompareTo(b.Y));
        int mid = points.Count / 2;
        var node = new Node(points[mid], axis);
        node.Left = BuildRecursive(points.Take(mid).ToList(), depth + 1);
        node.Right = BuildRecursive(points.Skip(mid + 1).ToList(), depth + 1);
        return node;
    }

    public Point2D NearestNeighbor(Point2D target) {
        if (root == null) throw new InvalidOperationException("Empty tree");
        double bestDist = double.MaxValue;
        Point2D best = root.Point;
        SearchNearest(root, target, ref best, ref bestDist);
        return best;
    }

    private void SearchNearest(Node? node, Point2D target, ref Point2D best, ref double bestDist) {
        if (node == null) return;

        double dist = Distance(node.Point, target);
        if (dist < bestDist) {
            bestDist = dist;
            best = node.Point;
        }

        int axis = node.Axis;
        double diff = axis == 0 ? target.X - node.Point.X : target.Y - node.Point.Y;
        Node? near = diff < 0 ? node.Left : node.Right;
        Node? far = diff < 0 ? node.Right : node.Left;

        SearchNearest(near, target, ref best, ref bestDist);

        if (diff * diff < bestDist) {
            SearchNearest(far, target, ref best, ref bestDist);
        }
    }

    private static double Distance(Point2D a, Point2D b) {
        double dx = a.X - b.X, dy = a.Y - b.Y;
        return dx * dx + dy * dy;
    }
}
```

## Complete Implementation (Go)

```go
import "sort"

type Point2D struct{ X, Y float64 }

type kdNode struct {
    point      Point2D
    left, right *kdNode
    axis       int
}

type KDTree struct {
    root *kdNode
}

func (t *KDTree) Build(points []Point2D) {
    t.root = buildRecursive(points, 0)
}

func buildRecursive(points []Point2D, depth int) *kdNode {
    if len(points) == 0 {
        return nil
    }
    axis := depth % 2
    sort.Slice(points, func(i, j int) bool {
        if axis == 0 {
            return points[i].X < points[j].X
        }
        return points[i].Y < points[j].Y
    })
    mid := len(points) / 2
    node := &kdNode{point: points[mid], axis: axis}
    node.left = buildRecursive(points[:mid], depth+1)
    node.right = buildRecursive(points[mid+1:], depth+1)
    return node
}

func (t *KDTree) NearestNeighbor(target Point2D) Point2D {
    if t.root == nil {
        panic("empty tree")
    }
    best := t.root.point
    bestDist := distance(best, target)
    t.searchNearest(t.root, target, &best, &bestDist)
    return best
}

func (t *KDTree) searchNearest(node *kdNode, target Point2D, best *Point2D, bestDist *float64) {
    if node == nil {
        return
    }
    if d := distance(node.point, target); d < *bestDist {
        *bestDist = d
        *best = node.point
    }
    var diff float64
    if node.axis == 0 {
        diff = target.X - node.point.X
    } else {
        diff = target.Y - node.point.Y
    }
    var near, far *kdNode
    if diff < 0 {
        near, far = node.left, node.right
    } else {
        near, far = node.right, node.left
    }
    t.searchNearest(near, target, best, bestDist)
    if diff*diff < *bestDist {
        t.searchNearest(far, target, best, bestDist)
    }
}

func distance(a, b Point2D) float64 {
    dx, dy := a.X-b.X, a.Y-b.Y
    return dx*dx + dy*dy
}
```

## Real World Uses

### 1. Computer Graphics & Games

Nearest neighbor queries, some collision and spatial queries, photon mapping in ray tracing.

### 2. Machine Learning

K-nearest neighbors (KNN) classification and regression.

### 3. Geographic / Location Services

"Find the 5 closest restaurants to this point."

### 4. Robotics & Computer Vision

Point cloud processing, feature matching.

## Comparison With Other Spatial Structures

| Structure | Best for                              |
|-----------|---------------------------------------|
| Quadtree  | Uniform 2D partitioning, range queries|
| R-tree    | Rectangles, disk-based spatial indexes|
| KD-tree   | Point nearest-neighbor in low dimensions |

## Summary

KD-tree = space-partitioning binary tree that alternates dimensions.

It is a classic tool for nearest-neighbor problems in low-dimensional spaces (especially in ML and graphics).

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Geospatial Index](/projects/tier-4/21-geospatial-index)
:::

**Next:** [34 - R-Tree](34-rtree.md)