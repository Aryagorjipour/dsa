using System;
using System.Collections.Generic;
using System.Linq;

class ConsistentHashing {
    // Simple Consistent Hashing demo
    // Used in Cassandra, DynamoDB, CDNs, load balancers

    private Dictionary<uint, string> ring = new();
    private List<uint> sortedKeys = new();
    private int replicas;

    public ConsistentHashing(int replicas) {
        this.replicas = replicas;
    }

    private uint Hash(string key) {
        return (uint)key.GetHashCode();
    }

    public void AddNode(string node) {
        for (int i = 0; i < replicas; i++) {
            uint h = Hash($"{node}-{i}");
            ring[h] = node;
            sortedKeys.Add(h);
        }
        sortedKeys.Sort();
    }

    public string GetNode(string key) {
        if (ring.Count == 0) return "";
        uint h = Hash(key);
        int idx = sortedKeys.BinarySearch(h);
        if (idx < 0) idx = ~idx;
        if (idx == sortedKeys.Count) idx = 0;
        return ring[sortedKeys[idx]];
    }

    static void Main() {
        var ch = new ConsistentHashing(3);
        ch.AddNode("nodeA");
        ch.AddNode("nodeB");

        Console.WriteLine("user123 -> " + ch.GetNode("user123"));
        ch.AddNode("nodeC");
        Console.WriteLine("After add nodeC: user123 -> " + ch.GetNode("user123"));
    }
}