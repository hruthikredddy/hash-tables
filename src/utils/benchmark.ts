import type { BenchmarkResult, Contact } from '../types/contact';
import { BinarySearchTree } from './bst';
import { CustomHashTable, normalizeKey } from './hashTable';

export interface BenchmarkConfig {
  datasetSize: number;
  queryCount: number;
  includeBst?: boolean;
}

export function generateBenchmarkContacts(count: number): Contact[] {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack', 'Kavita', 'Leo', 'Maya', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zane'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'];
  const groups = ['Work', 'Family', 'Friends', 'VIP', 'Emergency', 'Clients'];

  const contacts: Contact[] = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const uniqueSuffix = i >= firstNames.length * lastNames.length ? `_${i}` : (i > 100 ? `_${i}` : '');
    const name = `${fn} ${ln}${uniqueSuffix}`;
    const phone = `+1555${String(100000 + i).padStart(6, '0')}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${uniqueSuffix}@contactnet.io`;
    const group = groups[i % groups.length];

    contacts.push({
      id: `bench_${i + 1}`,
      name,
      phone,
      email,
      group,
      createdAt: Date.now() - (count - i) * 1000,
      updatedAt: Date.now() - (count - i) * 1000,
    });
  }

  return contacts;
}

/**
 * Execute real, high-resolution benchmark comparing Linear Search, BST, and Hash Table
 */
export async function runAlgorithmicBenchmark(
  contacts: Contact[],
  queryCount = 100
): Promise<BenchmarkResult[]> {
  const datasetSize = contacts.length;
  if (datasetSize === 0) {
    throw new Error('Dataset must contain at least 1 contact for benchmarking');
  }

  // 1. Prepare data structures
  const arrayList: Contact[] = [...contacts];
  const hash = new CustomHashTable<Contact>(Math.max(16, Math.floor(datasetSize * 1.5)));
  const bst = new BinarySearchTree<Contact>();

  for (const c of contacts) {
    hash.insert(c.name, c);
    bst.insert(normalizeKey(c.name), c);
  }

  // Select target search keys: mix of hits and misses
  const searchKeys: string[] = [];
  for (let i = 0; i < queryCount; i++) {
    if (i % 5 === 0) {
      // 20% misses (not in list)
      searchKeys.push(`NonExistent_Contact_${i}`);
    } else {
      // 80% hits (randomly picked across entire array)
      const randomIndex = Math.floor(Math.random() * datasetSize);
      searchKeys.push(contacts[randomIndex].name);
    }
  }

  // Helper for array linear search
  const runLinearSearchTest = () => {
    let totalComparisons = 0;
    const durationsUs: number[] = [];

    for (const rawKey of searchKeys) {
      const key = normalizeKey(rawKey);
      const t0 = performance.now();
      let found = false;
      let comparisons = 0;

      for (let i = 0; i < arrayList.length; i++) {
        comparisons++;
        if (normalizeKey(arrayList[i].name) === key) {
          found = true;
          break;
        }
      }

      const t1 = performance.now();
      durationsUs.push((t1 - t0) * 1000); // convert ms to microseconds
      totalComparisons += comparisons;
    }

    return {
      durationsUs,
      averageComparisons: Math.round(totalComparisons / searchKeys.length),
    };
  };

  // Helper for BST search test
  const runBSTTest = () => {
    let totalComparisons = 0;
    const durationsUs: number[] = [];

    for (const rawKey of searchKeys) {
      const key = normalizeKey(rawKey);
      const t0 = performance.now();
      const res = bst.search(key);
      const t1 = performance.now();

      durationsUs.push((t1 - t0) * 1000);
      totalComparisons += res.comparisons;
    }

    return {
      durationsUs,
      averageComparisons: Math.round(totalComparisons / searchKeys.length),
    };
  };

  // Helper for Hash Table search test
  const runHashTest = () => {
    let totalComparisons = 0;
    const durationsUs: number[] = [];

    for (const rawKey of searchKeys) {
      const t0 = performance.now();
      const res = hash.search(rawKey);
      const t1 = performance.now();

      durationsUs.push((t1 - t0) * 1000);
      // comparisons = chain steps taken (1 if direct bucket match without collisions)
      totalComparisons += Math.max(1, res.chainSteps);
    }

    return {
      durationsUs,
      averageComparisons: Number((totalComparisons / searchKeys.length).toFixed(2)),
    };
  };

  // Run tests
  const linearStats = runLinearSearchTest();
  const bstStats = runBSTTest();
  const hashStats = runHashTest();

  const calculateMetrics = (
    durations: number[],
    methodName: string,
    algorithmType: BenchmarkResult['algorithmType'],
    complexity: string,
    avgComparisons: number
  ): BenchmarkResult => {
    const sorted = [...durations].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const avg = sum / sorted.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return {
      methodName,
      algorithmType,
      theoreticalComplexity: complexity,
      datasetSize,
      searchCount: searchKeys.length,
      totalTimeMs: Number((sum / 1000).toFixed(4)),
      averageTimeUs: Number(avg.toFixed(2)),
      medianTimeUs: Number(median.toFixed(2)),
      minTimeUs: Number(sorted[0].toFixed(2)),
      maxTimeUs: Number(sorted[sorted.length - 1].toFixed(2)),
      averageComparisons: avgComparisons,
    };
  };

  const linearRes = calculateMetrics(
    linearStats.durationsUs,
    'Unindexed Array (Linear Search)',
    'Linear Search (Array)',
    'O(N) — Linear scan',
    linearStats.averageComparisons
  );

  const bstRes = calculateMetrics(
    bstStats.durationsUs,
    'Binary Search Tree (BST)',
    'Binary Search Tree (BST)',
    'O(log N) — Tree traversal',
    bstStats.averageComparisons
  );

  const hashRes = calculateMetrics(
    hashStats.durationsUs,
    'Custom Polynomial Hash Table',
    'Custom Hash Table (O(1))',
    'O(1) — Direct bucket jump',
    hashStats.averageComparisons
  );

  // Compute latency reduction percentage relative to Linear Search
  const linearAvg = Math.max(0.001, linearRes.averageTimeUs);
  const hashAvg = hashRes.averageTimeUs;
  const reduction = Math.max(0, Math.min(99.99, ((linearAvg - hashAvg) / linearAvg) * 100));
  hashRes.latencyReductionPercent = Number(reduction.toFixed(1));

  const bstReduction = Math.max(0, Math.min(99.99, ((linearAvg - bstRes.averageTimeUs) / linearAvg) * 100));
  bstRes.latencyReductionPercent = Number(bstReduction.toFixed(1));

  return [linearRes, bstRes, hashRes];
}
