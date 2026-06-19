using System;
using System.Collections.Generic;

class TrieAutocomplete {
    // Trie for Autocomplete - Google, IDEs, e-commerce
    class Node {
        public Dictionary<char, Node> Children = new();
        public bool IsEnd;
    }

    private Node root = new();

    public void Insert(string word) {
        var node = root;
        foreach (char c in word) {
            if (!node.Children.ContainsKey(c))
                node.Children[c] = new Node();
            node = node.Children[c];
        }
        node.IsEnd = true;
    }

    public List<string> Suggestions(string prefix) {
        var results = new List<string>();
        var node = root;
        foreach (char c in prefix) {
            if (!node.Children.TryGetValue(c, out node)) return results;
        }
        Collect(node, prefix, results);
        return results;
    }

    private void Collect(Node node, string prefix, List<string> results) {
        if (node.IsEnd) results.Add(prefix);
        foreach (var kv in node.Children) {
            Collect(kv.Value, prefix + kv.Key, results);
        }
    }

    static void Main() {
        var trie = new TrieAutocomplete();
        foreach (var w in new[] {"programming", "program", "progress", "project"}) trie.Insert(w);
        Console.WriteLine(string.Join(", ", trie.Suggestions("prog")));
    }
}