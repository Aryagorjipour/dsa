# 32 - Quadtree

## What is a Quadtree?

A **quadtree** is a tree data structure used to partition 2D space.

Each internal node has exactly **four children** (hence "quad"), representing four quadrants:
- North-West, North-East, South-West, South-East

It is the 2D equivalent of a binary tree for space partitioning.

## Why Quadtrees Exist

When you have many objects in 2D space and want to answer:
- "Which objects are near this point?"
- "Which objects overlap this rectangle?"
- "How do I efficiently render only visible objects?"

Naive O(n) scan is too slow.

Quadtree lets you discard huge empty regions quickly.

![Quadtree](/images/quadtree.png)

## Operations & Complexity

| Operation      | Average    | Worst case | Space |
|----------------|------------|------------|-------|
| Insert point   | O(log n)   | O(n)       | O(n)  |
| Range query    | O(log n + k)| O(n)      | O(n)  |
| Build (n pts)  | O(n log n) | O(n²)      | O(n)  |

Worst case occurs with clustered points (all in one corner).

## Complete Implementation (C#)

```csharp
public record Point(double X, double Y);

public class Quadtree {
    private const int Capacity = 4;
    private readonly double x1, y1, x2, y2;
    private readonly List<Point> points = new();
    private bool divided;
    private Quadtree? nw, ne, sw, se;

    public Quadtree(double x1, double y1, double x2, double y2) {
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
    }

    public bool Insert(Point p) {
        if (!InBoundary(p)) return false;

        if (points.Count < Capacity && !divided) {
            points.Add(p);
            return true;
        }

        if (!divided) Subdivide();

        return nw!.Insert(p) || ne!.Insert(p) || sw!.Insert(p) || se!.Insert(p);
    }

    public List<Point> Query(double qx1, double qy1, double qx2, double qy2) {
        var result = new List<Point>();
        QueryRange(qx1, qy1, qx2, qy2, result);
        return result;
    }

    private void QueryRange(double qx1, double qy1, double qx2, double qy2, List<Point> result) {
        if (!Intersects(qx1, qy1, qx2, qy2)) return;

        foreach (var p in points) {
            if (p.X >= qx1 && p.X <= qx2 && p.Y >= qy1 && p.Y <= qy2) {
                result.Add(p);
            }
        }

        if (divided) {
            nw!.QueryRange(qx1, qy1, qx2, qy2, result);
            ne!.QueryRange(qx1, qy1, qx2, qy2, result);
            sw!.QueryRange(qx1, qy1, qx2, qy2, result);
            se!.QueryRange(qx1, qy1, qx2, qy2, result);
        }
    }

    private void Subdivide() {
        double mx = (x1 + x2) / 2;
        double my = (y1 + y2) / 2;
        nw = new Quadtree(x1, y1, mx, my);
        ne = new Quadtree(mx, y1, x2, my);
        sw = new Quadtree(x1, my, mx, y2);
        se = new Quadtree(mx, my, x2, y2);
        divided = true;

        foreach (var p in points) {
            nw.Insert(p) || ne.Insert(p) || sw.Insert(p) || se.Insert(p);
        }
        points.Clear();
    }

    private bool InBoundary(Point p) =>
        p.X >= x1 && p.X <= x2 && p.Y >= y1 && p.Y <= y2;

    private bool Intersects(double qx1, double qy1, double qx2, double qy2) =>
        !(qx2 < x1 || qx1 > x2 || qy2 < y1 || qy1 > y2);
}
```

## Complete Implementation (Go)

From `examples/go/quadtree_2d.go`, with full subdivide and query.

```go
type Point struct{ X, Y float64 }

type Quadtree struct {
    boundary [4]float64 // x1, y1, x2, y2
    points   []Point
    divided  bool
    children [4]*Quadtree
}

const quadCapacity = 4

func NewQuadtree(x1, y1, x2, y2 float64) *Quadtree {
    return &Quadtree{boundary: [4]float64{x1, y1, x2, y2}}
}

func (q *Quadtree) Insert(p Point) bool {
    if !q.inBoundary(p) {
        return false
    }
    if len(q.points) < quadCapacity && !q.divided {
        q.points = append(q.points, p)
        return true
    }
    if !q.divided {
        q.subdivide()
    }
    for _, c := range q.children {
        if c.Insert(p) {
            return true
        }
    }
    return false
}

func (q *Quadtree) Query(qx1, qy1, qx2, qy2 float64) []Point {
    var result []Point
    q.queryRange(qx1, qy1, qx2, qy2, &result)
    return result
}

func (q *Quadtree) queryRange(qx1, qy1, qx2, qy2 float64, result *[]Point) {
    if !q.intersects(qx1, qy1, qx2, qy2) {
        return
    }
    for _, p := range q.points {
        if p.X >= qx1 && p.X <= qx2 && p.Y >= qy1 && p.Y <= qy2 {
            *result = append(*result, p)
        }
    }
    if q.divided {
        for _, c := range q.children {
            c.queryRange(qx1, qy1, qx2, qy2, result)
        }
    }
}

func (q *Quadtree) subdivide() {
    x1, y1, x2, y2 := q.boundary[0], q.boundary[1], q.boundary[2], q.boundary[3]
    mx, my := (x1+x2)/2, (y1+y2)/2
    q.children[0] = NewQuadtree(x1, y1, mx, my) // NW
    q.children[1] = NewQuadtree(mx, y1, x2, my)   // NE
    q.children[2] = NewQuadtree(x1, my, mx, y2)   // SW
    q.children[3] = NewQuadtree(mx, my, x2, y2)   // SE
    q.divided = true
    for _, p := range q.points {
        for _, c := range q.children {
            if c.Insert(p) {
                break
            }
        }
    }
    q.points = nil
}

func (q *Quadtree) inBoundary(p Point) bool {
    return p.X >= q.boundary[0] && p.X <= q.boundary[2] &&
        p.Y >= q.boundary[1] && p.Y <= q.boundary[3]
}

func (q *Quadtree) intersects(qx1, qy1, qx2, qy2 float64) bool {
    return !(qx2 < q.boundary[0] || qx1 > q.boundary[2] ||
        qy2 < q.boundary[1] || qy1 > q.boundary[3])
}
```

## Real World Uses

### 1. Games (Extremely Common)

Collision detection, visibility/frustum culling, AI perception, particle systems.

### 2. Geographic Information Systems (GIS) & Maps

Efficient storage and querying of points of interest.

### 3. Computer Graphics & Rendering

Scene management, terrain rendering (quadtree terrain).

### 4. Image Processing & Compression

Quadtree image compression, region of interest processing.

## Limitations

- Can become very deep with clustered data (all points in one corner).
- Not optimal for all types of spatial queries (range, nearest neighbor).
- 3D version is **octree**.

## Summary

Quadtree = recursive 2D space division into four quadrants.

It is one of the fundamental tools in games and any system that needs to deal with "nearby things in 2D".

::: tip Project Lab
**Build it yourself:** [Geospatial Index](/projects/tier-4/21-geospatial-index) — quadtrees, KD-trees, and R-trees for spatial queries.
:::

**Next:** [33 - KD Tree](33-kd-tree.md)