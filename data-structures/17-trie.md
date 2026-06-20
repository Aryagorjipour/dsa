# 17 - Trie (Prefix Tree)

## What is a Trie?

A **Trie** (pronounced "try", sometimes called prefix tree) is a tree where each **edge** represents a character, and each **node** represents a prefix (or a word).

It is optimized for **string** problems, especially:
- Prefix matching
- Autocomplete
- Spell checking
- IP routing (sometimes)

## Visual Example — Inserting "cat", "car", "dog"

![Trie (Prefix Tree)](/images/trie.png)

- "cat" ends at the 't' node
- "car" ends at the 'r' node
- "dog" lives under 'd'

You can mark nodes as "end of word".

## Why Tries Are Powerful

- Search for a word or prefix: O(length of word)
- Independent of how many words are stored (unlike hash map which hashes the whole key)
- Excellent for **autocomplete** because all words with the same prefix live in the same subtree
- Can do prefix counts easily

## Basic Operations

- Insert(word)
- Search(word) — exact match
- StartsWith(prefix)
- Delete (a bit more work)
- Count words with given prefix

## C# Implementation

```csharp
public class Trie {
    private class TrieNode {
        public Dictionary<char, TrieNode> Children = new();
        public bool IsEndOfWord;
        public int WordCount; // optional: how many words pass through
    }

    private readonly TrieNode _root = new();

    public void Insert(string word) {
        var node = _root;
        foreach (char c in word) {
            if (!node.Children.ContainsKey(c))
                node.Children[c] = new TrieNode();
            node = node.Children[c];
            node.WordCount++;
        }
        node.IsEndOfWord = true;
    }

    public bool Search(string word) {
        var node = SearchPrefix(word);
        return node != null && node.IsEndOfWord;
    }

    public bool StartsWith(string prefix) {
        return SearchPrefix(prefix) != null;
    }

    public int CountWordsWithPrefix(string prefix) {
        var node = SearchPrefix(prefix);
        return node?.WordCount ?? 0;
    }

    private TrieNode? SearchPrefix(string prefix) {
        var node = _root;
        foreach (char c in prefix) {
            if (!node.Children.TryGetValue(c, out var child))
                return null;
            node = child;
        }
        return node;
    }
}
```

## Go Implementation

```go
type TrieNode struct {
    children   map[rune]*TrieNode
    isEnd      bool
    passCount  int
}

type Trie struct {
    root *TrieNode
}

func NewTrie() *Trie {
    return &Trie{root: &TrieNode{children: make(map[rune]*TrieNode)}}
}

func (t *Trie) Insert(word string) {
    node := t.root
    for _, c := range word {
        if _, ok := node.children[c]; !ok {
            node.children[c] = &TrieNode{children: make(map[rune]*TrieNode)}
        }
        node = node.children[c]
        node.passCount++
    }
    node.isEnd = true
}
```

## Real World Use Cases

### 1. Autocomplete / Typeahead

Google, Bing, IDEs, phone keyboards, Slack command palette, etc.

As you type "app", the trie can return all words starting with "app" very fast.

### 2. Spell Checkers

The dictionary is often a trie. You can also do edit-distance searches from the trie.

### 3. IP Routing (Radix / Patricia Tries)

Routers use specialized tries (often binary or radix tries) for longest prefix matching on IP addresses. Extremely performance critical.

### 4. Compilers & IDEs

- Symbol completion
- Go to definition
- Error detection

Roslyn and Go's `gopls` use trie-like structures heavily.

### 5. Full-Text Search Engines

Inverted indexes often use tries or suffix structures.

### 6. URL Routing in Web Frameworks

Some routers use trie structures for efficient matching (especially ones that support wildcards and prefixes).

### 7. Bioinformatics

Tries are used for DNA sequence storage and matching (4-ary tries).

### 8. Databases

- Some secondary indexes
- Prefix compression in LSM trees (RocksDB, LevelDB use prefix tries in blocks)

## Variants

- **Binary Trie** — each node has 0/1 children (used for IP, integers)
- **Radix Tree / Patricia Trie** — compresses single-child paths (huge memory win)
- **Suffix Trie / Suffix Tree** — contains all suffixes of a string (very powerful for string algorithms)
- **Ternary Search Trie** — mixes BST + trie ideas

## Memory Considerations

Naive trie with one node per character can use a lot of memory.

Real implementations:
- Use maps only when needed
- Use arrays of size 26 or 256 for ASCII
- Use radix/patricia compression
- Pool nodes or use struct arrays

## Famous Problems

- Implement Trie (Prefix Tree)
- Word Search II (backtracking + trie)
- Design Add and Search Words Data Structure (trie + wildcard)
- Longest Word in Dictionary
- Replace Words (using trie for dictionary)

## Summary

Trie = tree where path from root spells a string.

It is the go-to structure whenever you care about **prefixes** or need to store a dictionary of strings efficiently for lookup and autocomplete-style operations.


::: tip Project Lab
**Build it yourself:** [Autocomplete Engine](/projects/tier-2/07-autocomplete-engine) — prefix search, frequency ranking, and fuzzy suggestions.
:::

**Next:** [18 - B-Tree and B+ Tree](18-btree-bplustree.md) — the kings of database storage.
