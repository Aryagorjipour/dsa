using System;

class Program
{
    // Simulates the famous Two Crystal Balls problem
    static int FindBreakingFloor(int breakingFloor, int totalFloors)
    {
        if (breakingFloor < 0 || breakingFloor > totalFloors) return -1;

        int jump = 0;
        while (jump * (jump + 1) / 2 < totalFloors) jump++;

        int drops = 0;
        int prev = 0;

        for (int current = jump; current < totalFloors; current += Math.Max(1, jump))
        {
            drops++;
            if (current >= breakingFloor)
            {
                for (int i = prev + 1; i <= current && i < totalFloors; i++)
                {
                    drops++;
                    if (i >= breakingFloor)
                    {
                        Console.WriteLine($"Broke at floor {i}. Total drops: {drops}");
                        return i;
                    }
                }
                return current;
            }
            prev = current;
            jump--;
            if (jump < 1) jump = 1;
        }

        for (int i = prev + 1; i < totalFloors; i++)
        {
            drops++;
            if (i >= breakingFloor)
            {
                Console.WriteLine($"Broke at floor {i}. Total drops: {drops}");
                return i;
            }
        }
        return totalFloors;
    }

    static void Main()
    {
        var rand = new Random();
        int total = 100;
        int breaking = rand.Next(total + 1);

        Console.WriteLine($"True breaking floor: {breaking}");
        int result = FindBreakingFloor(breaking, total);
        Console.WriteLine($"Found breaking floor: {result}");
    }
}
