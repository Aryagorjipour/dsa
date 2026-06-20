// Starter for Project Lab #1 — Search Library
// Spec: /projects/tier-1/01-search-library
package main

import "fmt"

// Searcher is the common interface all search algorithms implement.
type Searcher[T comparable] interface {
	Search(data []T, target T) int
	Name() string
}

func main() {
	fmt.Println("Implement LinearSearch, BinarySearch, ExponentialSearch, then wire a SearchLibrary dispatcher.")
}