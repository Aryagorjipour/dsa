package main

import "fmt"

// Point Quadtree for 2D range queries.
// Problem: Given many points in 2D, quickly find all points inside a rectangle.
// Use cases: Game collision, GIS, UI hit testing, nearest neighbors in low dim.

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
	q.children[1] = NewQuadtree(mx, y1, x2, my) // NE
	q.children[2] = NewQuadtree(x1, my, mx, y2) // SW
	q.children[3] = NewQuadtree(mx, my, x2, y2) // SE
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

func main() {
	qt := NewQuadtree(0, 0, 100, 100)
	points := []Point{
		{10, 20}, {15, 25}, {80, 80}, {12, 22},
		{50, 50}, {51, 51}, {52, 52}, {53, 53},
		{90, 10}, {5, 95},
	}
	for _, p := range points {
		qt.Insert(p)
	}
	results := qt.Query(0, 0, 30, 30)
	fmt.Printf("Points in region [0,0]-[30,30]: %d\n", len(results))
	for _, p := range results {
		fmt.Printf("  (%.0f, %.0f)\n", p.X, p.Y)
	}
}