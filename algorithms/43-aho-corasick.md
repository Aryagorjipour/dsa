# 43 - Aho-Corasick

## The Problem

**Multiple Pattern String Matching:** Given text `T` of length `n` and a dictionary of `k` patterns (total length `Σ|pᵢ|`), find **every occurrence of every pattern** in `T`, including overlaps.

**Why naive fails:** Running KMP or Rabin-Karp separately for each pattern costs **O(n × k)**. For `n = 1M` and `k = 10,000`, that is 10 billion character visits — unusable at scale.

Aho-Corasick builds **one automaton** from all patterns and scans the text in a **single pass**.

### Canonical Problem: Multi-Pattern Keyword Search

**Input:**

- Text `T` (web page, server log, genome sequence)
- Dictionary `D` of patterns (virus signatures, banned phrases, DNA motifs)

**Output:**

- For every pattern, all starting positions in `T`
- Must handle overlaps: patterns `"he"`, `"she"`, `"his"`, `"hers"` in `"ushers"` report all matches

Invented in 1975 at Bell Labs for bibliographic search.

## How It Works

1. **Trie** — insert all patterns into a prefix tree
2. **Failure links** — BFS from root (like KMP LPS generalized to a trie)
3. **Output links** — each node collects patterns ending at that node plus patterns from failure targets
4. **Search** — walk text, follow trie edges or failure links; emit all matches at each position

![Aho-Corasick Automaton](/images/aho-corasick-automaton.png)

## Full Implementation

### C#

```csharp
public class ACNode {
    public Dictionary<char, ACNode> Children = new();
    public ACNode? Fail;
    public List<string> Output = new();
}

public class AhoCorasick {
    private readonly ACNode _root = new();

    public void AddPattern(string pattern) {
        var node = _root;
        foreach (char c in pattern) {
            if (!node.Children.ContainsKey(c)) {
                node.Children[c] = new ACNode();
            }
            node = node.Children[c];
        }
        node.Output.Add(pattern);
    }

    public void Build() {
        var queue = new Queue<ACNode>();
        foreach (var child in _root.Children.Values) {
            child.Fail = _root;
            queue.Enqueue(child);
        }

        while (queue.Count > 0) {
            var curr = queue.Dequeue();
            foreach (var (c, child) in curr.Children) {
                queue.Enqueue(child);
                var f = curr.Fail;
                while (f != null && !f.Children.ContainsKey(c)) {
                    f = f.Fail;
                }
                child.Fail = f?.Children.GetValueOrDefault(c) ?? _root;
                child.Output.AddRange(child.Fail.Output);
            }
        }
    }

    public Dictionary<string, List<int>> Search(string text) {
        var result = new Dictionary<string, List<int>>();
        var node = _root;

        for (int i = 0; i < text.Length; i++) {
            char c = text[i];
            while (node != _root && !node.Children.ContainsKey(c)) {
                node = node.Fail!;
            }
            if (node.Children.TryGetValue(c, out var next)) {
                node = next;
            }
            foreach (string pat in node.Output) {
                if (!result.ContainsKey(pat)) result[pat] = new List<int>();
                result[pat].Add(i - pat.Length + 1);
            }
        }
        return result;
    }
}
```

### Go

```go
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
```

**Example:** patterns `["he", "she", "his", "hers"]` on text `"ushers"` reports matches at multiple overlapping positions.

Runnable reference: `examples/go/aho_corasick.go`.

## Complexity

| Phase | Time | Space |
|-------|------|-------|
| Build trie | O(Σ\|pᵢ\|) | O(Σ\|pᵢ\|) nodes |
| Build failure links (BFS) | O(Σ\|pᵢ\| × σ) | — | σ = alphabet; map-based trie avoids full σ per node |
| Search | O(n + matches) | O(1) extra | Linear in text length |
| **Total search** | **O(n + z)** | — | z = total occurrences reported |

Preprocessing is paid once; each additional text scan is O(n).

## Real World

| Domain | Use |
|--------|-----|
| **Antivirus / IDS** | ClamAV, Snort — scan packets and files for thousands of malware signatures in one pass |
| **Content moderation** | Detect banned phrases, URLs, slurs across large corpora |
| **Bioinformatics** | Find all known DNA/RNA motifs in a genome |
| **Log analysis** | Flag any of hundreds of error patterns in streaming logs |
| **Search engines** | Multi-keyword extraction and filtering at scale |
| **Spam / plagiarism** | Dictionary-based fingerprint matching |

## Comparison

| Approach | k patterns, text length n | Overlaps |
|----------|---------------------------|----------|
| KMP × k | O(n × k) | Yes |
| Rabin-Karp + hash set | O(n) average per window | Tricky |
| **Aho-Corasick** | **O(n + matches)** | **Yes, built-in** |

## Relationship to KMP

Failure links in Aho-Corasick are KMP's LPS idea **generalized to a trie**. KMP is the single-pattern special case; Aho-Corasick is the multi-pattern automaton.

## Summary

Aho-Corasick is the **multi-pattern king**: build a trie, add failure links by BFS, scan text once. Preprocess all patterns, search each document in O(n) — the backbone of signature scanning and keyword filtering at scale.

**Next:** [44 - Backtracking](44-backtracking.md)