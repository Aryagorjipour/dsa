// Starter for Project Lab #2 — Sorting Benchmarker
// Spec: /projects/tier-1/02-sorting-benchmarker
package main

import "fmt"

type Sorter interface {
	Sort(data []int)
	Name() string
}

func main() {
	fmt.Println("Implement sort algorithms, workload generators, and a BenchmarkHarness.")
}