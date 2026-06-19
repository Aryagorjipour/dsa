package main

import "fmt"

// Trie for Autocomplete
// Real-world: Google search suggestions, IDE code completion (VSCode, IntelliJ),
// e-commerce search (Amazon), mobile keyboards.

type TrieNode struct {
	children map[rune]*TrieNode
	isEnd    bool
}

type Trie struct {
	root *TrieNode
}

func NewTrie() *Trie {
	return &Trie{root: &TrieNode{children: make(map[rune]*TrieNode)}}
}

func (t *Trie) Insert(word string) {
	node := t.root
	for _, ch := range word {
		if _, ok := node.children[ch]; !ok {
			node.children[ch] = &TrieNode{children: make(map[rune]*TrieNode)}
		}
		node = node.children[ch]
	}
	node.isEnd = true
}

func (t *Trie) Suggestions(prefix string) []string {
	node := t.root
	for _, ch := range prefix {
		if child, ok := node.children[ch]; ok {
			node = child
		} else {
			return []string{}
		}
	}
	var results []string
	t.collect(node, prefix, &results)
	return results
}

func (t *Trie) collect(node *TrieNode, prefix string, results *[]string) {
	if node.isEnd {
		*results = append(*results, prefix)
	}
	for ch, child := range node.children {
		t.collect(child, prefix+string(ch), results)
	}
}

func main() {
	trie := NewTrie()
	words := []string{"programming", "program", "progress", "project", "protest", "process"}
	for _, w := range words {
		trie.Insert(w)
	}

	fmt.Println("Suggestions for 'prog':", trie.Suggestions("prog"))
	fmt.Println("Suggestions for 'pro':", trie.Suggestions("pro"))

	// Production: Used in search engines for instant suggestions,
	// code editors for IntelliSense, e-commerce for typeahead.
}