# 34 - R-Tree

## What is an R-Tree?

An **R-tree** is a tree data structure designed for **spatial indexing** of multi-dimensional information (especially rectangles).

### Canonical Problem: Find All Objects in a Geographic Region (Spatial Range Queries in Maps/GIS)

**Problem:**

You have millions of points or rectangles (restaurants, map features, bounding boxes). Given a query rectangle, return all that intersect it quickly.

R-Tree groups nearby objects with bounding boxes for pruning.

Used in every major GIS database (PostGIS, MongoDB `$geoWithin`, etc.).

It groups nearby objects and represents them with their minimum bounding rectangle (MBR) at higher levels.

It is the dominant structure for spatial databases and GIS.

## Key Idea

Instead of points, R-trees store **rectangles** (or bounding boxes of objects).

Internal nodes contain bounding boxes that cover all children.

This allows very efficient "find all objects that intersect this rectangle" queries.

## Operations & Complexity

| Operation    | Average      | Worst case | Space |
|--------------|--------------|------------|-------|
| Insert       | O(log n)     | O(n)       | O(n)  |
| Range query  | O(log n + k) | O(n)       | O(n)  |
| Delete       | O(log n)     | O(n)       | O(n)  |
| Build (bulk) | O(n log n)   | O(n log n) | O(n)  |

k = number of results. Production R*-trees improve average-case performance significantly.

## Complete Implementation (C#)

```csharp
public record Rect(double MinX, double MinY, double MaxX, double MaxY) {
    public bool Intersects(Rect other) =>
        !(MaxX < other.MinX || MinX > other.MaxX ||
          MaxY < other.MinY || MinY > other.MaxY);

    public static Rect Union(Rect a, Rect b) => new(
        Math.Min(a.MinX, b.MinX), Math.Min(a.MinY, b.MinY),
        Math.Max(a.MaxX, b.MaxX), Math.Max(a.MaxY, b.MaxY));
}

public class RTree {
    private const int MaxEntries = 4;
    private RTreeNode root = new();

    private class RTreeNode {
        public List<Rect> Bounds = new();
        public List<RTreeNode> Children = new();
        public List<int> Data = new(); // leaf IDs
        public bool IsLeaf => Children.Count == 0;
    }

    public void Insert(Rect bounds, int id) {
        var leaf = ChooseLeaf(root, bounds);
        leaf.Bounds.Add(bounds);
        leaf.Data.Add(id);

        if (leaf.Bounds.Count > MaxEntries) {
            SplitNode(leaf);
        }
    }

    public List<int> RangeQuery(Rect query) {
        var result = new List<int>();
        Search(root, query, result);
        return result;
    }

    private void Search(RTreeNode node, Rect query, List<int> result) {
        for (int i = 0; i < node.Bounds.Count; i++) {
            if (!node.Bounds[i].Intersects(query)) continue;

            if (node.IsLeaf) {
                result.Add(node.Data[i]);
            } else {
                Search(node.Children[i], query, result);
            }
        }
    }

    private RTreeNode ChooseLeaf(RTreeNode node, Rect bounds) {
        if (node.IsLeaf) return node;

        int best = 0;
        double bestEnlargement = double.MaxValue;
        for (int i = 0; i < node.Bounds.Count; i++) {
            double enlargement = Area(Rect.Union(node.Bounds[i], bounds)) - Area(node.Bounds[i]);
            if (enlargement < bestEnlargement) {
                bestEnlargement = enlargement;
                best = i;
            }
        }
        return ChooseLeaf(node.Children[best], bounds);
    }

    private void SplitNode(RTreeNode node) {
        // Simplified linear split: divide entries in half
        int mid = node.Bounds.Count / 2;
        var newNode = new RTreeNode();

        newNode.Bounds.AddRange(node.Bounds.GetRange(mid, node.Bounds.Count - mid));
        newNode.Data.AddRange(node.Data.GetRange(mid, node.Data.Count - mid));
        if (!node.IsLeaf) {
            newNode.Children.AddRange(node.Children.GetRange(mid, node.Children.Count - mid));
            node.Children.RemoveRange(mid, node.Children.Count - mid);
        }

        node.Bounds.RemoveRange(mid, node.Bounds.Count - mid);
        node.Data.RemoveRange(mid, node.Data.Count - mid);

        if (node == root) {
            var newRoot = new RTreeNode {
                Bounds = { EnclosingBounds(node), EnclosingBounds(newNode) },
                Children = { node, newNode }
            };
            root = newRoot;
        }
    }

    private static Rect EnclosingBounds(RTreeNode node) {
        var r = node.Bounds[0];
        for (int i = 1; i < node.Bounds.Count; i++) {
            r = Rect.Union(r, node.Bounds[i]);
        }
        return r;
    }

    private static double Area(Rect r) => (r.MaxX - r.MinX) * (r.MaxY - r.MinY);
}
```

## Complete Implementation (Go)

```go
import "math"

type Rect struct {
    MinX, MinY, MaxX, MaxY float64
}

func (r Rect) Intersects(other Rect) bool {
    return !(r.MaxX < other.MinX || r.MinX > other.MaxX ||
        r.MaxY < other.MinY || r.MinY > other.MaxY)
}

func UnionRect(a, b Rect) Rect {
    return Rect{
        MinX: math.Min(a.MinX, b.MinX),
        MinY: math.Min(a.MinY, b.MinY),
        MaxX: math.Max(a.MaxX, b.MaxX),
        MaxY: math.Max(a.MaxY, b.MaxY),
    }
}

const maxEntries = 4

type rtreeNode struct {
    bounds   []Rect
    children []*rtreeNode
    data     []int
}

func (n *rtreeNode) isLeaf() bool { return len(n.children) == 0 }

type RTree struct {
    root *rtreeNode
}

func NewRTree() *RTree {
    return &RTree{root: &rtreeNode{}}
}

func (t *RTree) Insert(bounds Rect, id int) {
    leaf := t.chooseLeaf(t.root, bounds)
    leaf.bounds = append(leaf.bounds, bounds)
    leaf.data = append(leaf.data, id)
    if len(leaf.bounds) > maxEntries {
        t.splitNode(leaf)
    }
}

func (t *RTree) RangeQuery(query Rect) []int {
    var result []int
    t.search(t.root, query, &result)
    return result
}

func (t *RTree) search(node *rtreeNode, query Rect, result *[]int) {
    for i, b := range node.bounds {
        if !b.Intersects(query) {
            continue
        }
        if node.isLeaf() {
            *result = append(*result, node.data[i])
        } else {
            t.search(node.children[i], query, result)
        }
    }
}

func (t *RTree) chooseLeaf(node *rtreeNode, bounds Rect) *rtreeNode {
    if node.isLeaf() {
        return node
    }
    best := 0
    bestEnlargement := math.MaxFloat64
    for i, b := range node.bounds {
        enlargement := rectArea(UnionRect(b, bounds)) - rectArea(b)
        if enlargement < bestEnlargement {
            bestEnlargement = enlargement
            best = i
        }
    }
    return t.chooseLeaf(node.children[best], bounds)
}

func (t *RTree) splitNode(node *rtreeNode) {
    mid := len(node.bounds) / 2
    newNode := &rtreeNode{
        bounds: append([]Rect{}, node.bounds[mid:]...),
        data:   append([]int{}, node.data[mid:]...),
    }
    if !node.isLeaf() {
        newNode.children = append([]*rtreeNode{}, node.children[mid:]...)
        node.children = node.children[:mid]
    }
    node.bounds = node.bounds[:mid]
    node.data = node.data[:mid]

    if node == t.root {
        t.root = &rtreeNode{
            bounds:   []Rect{enclosingBounds(node), enclosingBounds(newNode)},
            children: []*rtreeNode{node, newNode},
        }
    }
}

func enclosingBounds(node *rtreeNode) Rect {
    r := node.bounds[0]
    for i := 1; i < len(node.bounds); i++ {
        r = UnionRect(r, node.bounds[i])
    }
    return r
}

func rectArea(r Rect) float64 {
    return (r.MaxX - r.MinX) * (r.MaxY - r.MinY)
}
```

> **Note:** This is a simplified educational R-tree. Production implementations (R*-tree in PostGIS, GiST) use sophisticated split heuristics, bulk loading, and disk-aware node sizing.

## Real World Dominance

### 1. All Major Databases With Spatial Features

- **PostGIS** (PostgreSQL) uses GiST indexes (R-tree family)
- **MySQL**, **Oracle Spatial**, **SQL Server**, **MongoDB** geospatial indexes use R-tree variants

### 2. Mapping & GIS Software

QGIS, ArcGIS, Google Earth Engine internals.

## Comparison

| Structure | Best for                              |
|-----------|---------------------------------------|
| Quadtree  | Points, simpler 2D partitioning       |
| R-tree    | Rectangles, production spatial DBs    |
| KD-tree   | Point nearest-neighbor (low dim)      |

## Summary

R-Tree = the spatial indexing workhorse of the database and GIS world.

If you have ever used `ST_Within`, `ST_Intersects`, or any "find things near me" feature in a real database, you have used an R-tree (or a close relative).

This completes the **Data Structures** section.

---

You now have a comprehensive understanding of 30+ fundamental and advanced data structures, with real implementations, real-world context in C# and Go ecosystems, and the problems they were invented to solve.

**Next major section:** Algorithms.

::: tip Project Lab
**Build it yourself:** [Geospatial Index](/projects/tier-4/21-geospatial-index) — R-tree range and nearest-neighbor queries.
:::