package main

import "fmt"

// Segment Tree for Range Sum Queries with Point Updates
// Real-world use: Time-series analytics, database range aggregates,
// financial running totals, image processing prefix sums.

type SegmentTree struct {
    tree []int
    n    int
}

func NewSegmentTree(arr []int) *SegmentTree {
    n := len(arr)
    t := &SegmentTree{
        tree: make([]int, 4*n),
        n:    n,
    }
    t.build(arr, 0, 0, n-1)
    return t
}

func (st *SegmentTree) build(arr []int, node, start, end int) {
    if start == end {
        st.tree[node] = arr[start]
        return
    }
    mid := (start + end) / 2
    st.build(arr, 2*node+1, start, mid)
    st.build(arr, 2*node+2, mid+1, end)
    st.tree[node] = st.tree[2*node+1] + st.tree[2*node+2]
}

func (st *SegmentTree) Update(idx, val int) {
    st.update(0, 0, st.n-1, idx, val)
}

func (st *SegmentTree) update(node, start, end, idx, val int) {
    if start == end {
        st.tree[node] = val
        return
    }
    mid := (start + end) / 2
    if idx <= mid {
        st.update(2*node+1, start, mid, idx, val)
    } else {
        st.update(2*node+2, mid+1, end, idx, val)
    }
    st.tree[node] = st.tree[2*node+1] + st.tree[2*node+2]
}

func (st *SegmentTree) Query(l, r int) int {
    return st.query(0, 0, st.n-1, l, r)
}

func (st *SegmentTree) query(node, start, end, l, r int) int {
    if r < start || end < l {
        return 0
    }
    if l <= start && end <= r {
        return st.tree[node]
    }
    mid := (start + end) / 2
    return st.query(2*node+1, start, mid, l, r) + st.query(2*node+2, mid+1, end, l, r)
}

func main() {
    // Example: Sales data over days, frequent range sum queries + updates
    sales := []int{10, 20, 30, 40, 50, 60}
    st := NewSegmentTree(sales)

    fmt.Println("Sum days 1-3:", st.Query(1, 3)) // 90

    st.Update(2, 100) // day 2 sales corrected to 100
    fmt.Println("After update, sum days 0-5:", st.Query(0, 5)) // 280

    // Use case: This pattern appears in analytics DBs, financial time-series,
    // and monitoring systems that need fast range aggregates with updates.
}