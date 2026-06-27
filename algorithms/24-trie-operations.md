# 24 - Trie Operations

## The Problems Trie Operations Solve

Tries excel at **prefix-based** string operations in O(m) time where m is key length.

### Canonical Problem: Autocomplete / Prefix Search

Given a dictionary, return all words starting with prefix `"prog"`. Hash maps cannot do prefix queries efficiently. Trie walks the prefix once, then DFS collects completions.

## Operations & Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Insert | O(m) | O(m) new nodes worst case |
| Search exact | O(m) | O(1) |
| StartsWith | O(m) | O(1) |
| Delete | O(m) | O(1) |
| List by prefix | O(m + k) | O(k) output |

m = key length, k = number of matches.

## Full Implementation

### C#

```csharp
public class TrieNode {
    public Dictionary<char, TrieNode> Children = new();
    public bool IsEnd;
}

public class Trie {
    private readonly TrieNode _root = new();

    public void Insert(string word) {
        var node = _root;
        foreach (char c in word) {
            if (!node.Children.ContainsKey(c))
                node.Children[c] = new TrieNode();
            node = node.Children[c];
        }
        node.IsEnd = true;
    }

    public bool Search(string word) {
        var node = FindNode(word);
        return node != null && node.IsEnd;
    }

    public bool StartsWith(string prefix) => FindNode(prefix) != null;

    public bool Delete(string word) {
        return DeleteRec(_root, word, 0);
    }

    bool DeleteRec(TrieNode node, string word, int i) {
        if (i == word.Length) {
            if (!node.IsEnd) return false;
            node.IsEnd = false;
            return node.Children.Count == 0;
        }
        char c = word[i];
        if (!node.Children.TryGetValue(c, out var child)) return false;
        bool shouldDelete = DeleteRec(child, word, i + 1);
        if (shouldDelete) node.Children.Remove(c);
        return !node.IsEnd && node.Children.Count == 0;
    }

    public List<string> Suggestions(string prefix) {
        var node = FindNode(prefix);
        var results = new List<string>();
        if (node != null) Collect(node, prefix, results);
        return results;
    }

    TrieNode? FindNode(string prefix) {
        var node = _root;
        foreach (char c in prefix) {
            if (!node.Children.TryGetValue(c, out node)) return null;
        }
        return node;
    }

    void Collect(TrieNode node, string path, List<string> results) {
        if (node.IsEnd) results.Add(path);
        foreach (var (c, child) in node.Children)
            Collect(child, path + c, results);
    }
}
```

### Go

```go
type TrieNode struct {
    children map[rune]*TrieNode
    isEnd    bool
}

type Trie struct{ root *TrieNode }

func NewTrie() *Trie {
    return &Trie{root: &TrieNode{children: make(map[rune]*TrieNode)}}
}

func (t *Trie) Insert(word string) {
    node := t.root
    for _, ch := range word {
        if node.children[ch] == nil {
            node.children[ch] = &TrieNode{children: make(map[rune]*TrieNode)}
        }
        node = node.children[ch]
    }
    node.isEnd = true
}

func (t *Trie) Search(word string) bool {
    node := t.findNode(word)
    return node != nil && node.isEnd
}

func (t *Trie) StartsWith(prefix string) bool {
    return t.findNode(prefix) != nil
}

func (t *Trie) Suggestions(prefix string) []string {
    node := t.findNode(prefix)
    if node == nil {
        return nil
    }
    var out []string
    t.collect(node, prefix, &out)
    return out
}

func (t *Trie) findNode(prefix string) *TrieNode {
    node := t.root
    for _, ch := range prefix {
        if node.children[ch] == nil {
            return nil
        }
        node = node.children[ch]
    }
    return node
}

func (t *Trie) collect(node *TrieNode, path string, out *[]string) {
    if node.isEnd {
        *out = append(*out, path)
    }
    for ch, child := range node.children {
        t.collect(child, path+string(ch), out)
    }
}
```

## Word Search II Pattern (board + trie)

Build trie of dictionary words, DFS each cell, prune when trie has no matching child. Used in autocomplete engines and word games.

## Real World

- Google Search suggestions, VS Code IntelliSense, Amazon typeahead
- Spell checkers and IP routing tables (prefix tries)
- Full-text search engines (see Project Lab)

## Summary

Trie operations turn prefix problems into tree walks. Insert, search, delete, and autocomplete are the core API.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Autocomplete Engine](/projects/tier-2/07-autocomplete-engine) — trie + ranking + prefix DFS.
:::

**Next:** [25 - BFS](25-bfs.md)