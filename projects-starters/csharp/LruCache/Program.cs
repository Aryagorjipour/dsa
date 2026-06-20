// Starter for Project Lab #5 — Cache with Eviction Policies
// Spec: /projects/tier-2/05-cache-with-eviction

interface ICache<K, V>
{
    bool TryGet(K key, out V value);
    void Put(K key, V value);
}

class Program
{
    static void Main()
    {
        Console.WriteLine("Start with DoublyLinkedList, then LRUCache, then LFU variants.");
    }
}