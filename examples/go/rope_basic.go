package main

import "fmt"

// Basic Rope node for long string manipulation
// Problem: Edit very large strings efficiently.

type Rope struct {
    left, right *Rope
    weight      int
    value       string
}

func (r *Rope) Len() int {
    if r == nil {
        return 0
    }
    return r.weight + r.right.Len()
}

func (r *Rope) Index(i int) byte {
    if i < r.weight {
        if r.left == nil {
            return r.value[i]
        }
        return r.left.Index(i)
    }
    return r.right.Index(i - r.weight)
}

// Insert, Split, Concat implementations follow tree rules.

func main() {
    fmt.Println("Rope for efficient large document editing (text editors, version control)")
}
