package main

import "fmt"

// Basic Aho-Corasick for multiple patterns
// Problem: Find all occurrences of many keywords in a document in one pass.
// Use cases: Antivirus, content moderation, bioinformatics, log keyword search.

type ACNode struct {
	children map[byte]*ACNode
	fail     *ACNode
	output   []string
}

type AhoCorasick struct {
	root *ACNode
}

func NewAhoCorasick() *AhoCorasick {
	return &AhoCorasick{root: &ACNode{children: make(map[byte]*ACNode)}}
}

func (ac *AhoCorasick) AddPattern(p string) {
	node := ac.root
	for i := 0; i < len(p); i++ {
		c := p[i]
		if node.children[c] == nil {
			node.children[c] = &ACNode{children: make(map[byte]*ACNode)}
		}
		node = node.children[c]
	}
	node.output = append(node.output, p)
}

func (ac *AhoCorasick) Build() {
	queue := []*ACNode{ac.root}
	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]
		for c, child := range curr.children {
			queue = append(queue, child)
			f := curr.fail
			for f != nil && f.children[c] == nil {
				f = f.fail
			}
			if f != nil {
				child.fail = f.children[c]
			} else {
				child.fail = ac.root
			}
			child.output = append(child.output, child.fail.output...)
		}
	}
}

func (ac *AhoCorasick) Search(text string) map[string][]int {
	result := make(map[string][]int)
	node := ac.root
	for i := 0; i < len(text); i++ {
		c := text[i]
		for node != ac.root && node.children[c] == nil {
			node = node.fail
		}
		if node.children[c] != nil {
			node = node.children[c]
		}
		for _, pat := range node.output {
			result[pat] = append(result[pat], i-len(pat)+1)
		}
	}
	return result
}

func main() {
	ac := NewAhoCorasick()
	for _, p := range []string{"he", "she", "his", "hers"} {
		ac.AddPattern(p)
	}
	ac.Build()

	matches := ac.Search("hershe")
	fmt.Println(matches)
	// Output shows positions for all patterns found.
}