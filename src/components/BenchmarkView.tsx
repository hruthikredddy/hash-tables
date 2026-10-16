import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  BarChart2,
  TrendingDown,
  Zap,
  CheckCircle2,
  Info,
  Clock,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import type { BenchmarkResult } from '../types/contact';
import { generateBenchmarkContacts, runAlgorithmicBenchmark } from '../utils/benchmark';

export const BenchmarkView: React.FC = () => {
  const [datasetSize, setDatasetSize] = useState<number>(2000);
  const [queryCount, setQueryCount] = useState<number>(100);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [runProgress, setRunProgress] = useState<string>('');

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setRunProgress('Generating benchmark contact dataset in memory...');
    setResults(null);

    // Yield to UI thread for smooth rendering
    await new Promise(r => setTimeout(r, 60));

    try {
      const contacts = generateBenchmarkContacts(datasetSize);
      setRunProgress(`Executing ${queryCount} randomized searches across Linear Array, BST, and Hash Table...`);
      await new Promise(r => setTimeout(r, 60));

      const benchResults = await runAlgorithmicBenchmark(contacts, queryCount);
      setResults(benchResults);
      setRunProgress('');
    } catch (err) {
      console.error(err);
      setRunProgress('Benchmark failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const linearRes = results?.find(r => r.algorithmType.includes('Linear'));
  const bstRes = results?.find(r => r.algorithmType.includes('Binary'));
  const hashRes = results?.find(r => r.algorithmType.includes('Custom'));

  const maxDuration = results
    ? Math.max(...results.map(r => r.averageTimeUs), 0.01)
    : 1;

  return (
    <div className="space-y-6">
      {/* Configuration & Trigger Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Client-Side Microsecond Timing</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Algorithmic Benchmark Engine: Array vs BST vs Hash Table
            </h2>
            <p className="text-xs text-slate-500">
              Directly measures Slide 9 & 10 complexity claims under identical test sets and random
              search queries.
            </p>
          </div>

          {/* Benchmark Run Button */}
          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Running Benchmark...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute High-Resolution Benchmark</span>
              </>
            )}
          </button>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5 text-xs">
          <div>
            <label htmlFor="bench-size" className="block text-xs font-medium text-slate-700 mb-1">
              Dataset Size (Contacts):
            </label>
            <select
              id="bench-size"
              value={datasetSize}
              disabled={isRunning}
              onChange={e => setDatasetSize(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={500}>500 Contacts</option>
              <option value={2000}>2,000 Contacts</option>
              <option value={10000}>10,000 Contacts</option>
              <option value={25000}>25,000 Contacts</option>
              <option value={50000}>50,000 Contacts (Stress Test)</option>
            </select>
          </div>

          <div>
            <label htmlFor="bench-queries" className="block text-xs font-medium text-slate-700 mb-1">
              Test Query Iterations:
            </label>
            <select
              id="bench-queries"
              value={queryCount}
              disabled={isRunning}
              onChange={e => setQueryCount(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={50}>50 Random Lookups (80% hits, 20% misses)</option>
              <option value={100}>100 Random Lookups (Default)</option>
              <option value={250}>250 Random Lookups (High Precision)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Timing via `window.performance.now()` in microseconds</span>
            </div>
          </div>
        </div>

        {isRunning && (
          <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-mono animate-pulse flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>{runProgress}</span>
          </div>
        )}
      </div>

      {/* Benchmark Results Display */}
      {results && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Latency Reduction Headline */}
          {hashRes && (
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-xl p-6 text-white border border-emerald-900/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase font-semibold text-emerald-400">
                  Target Stated in PPT: ~99% Search Latency Reduction
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1">
                  {hashRes.latencyReductionPercent}% Actual Speedup
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Custom Hash Table completed queries in{' '}
                  <span className="text-emerald-400 font-bold">{hashRes.averageTimeUs} µs</span> avg
                  vs{' '}
                  <span className="text-red-300 font-bold">{linearRes?.averageTimeUs} µs</span> in
                  linear search.
                </p>
              </div>

              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-xs font-mono text-xs space-y-1">
                <div>Element Comparisons:</div>
                <div className="text-emerald-300 font-bold">
                  Hash: {hashRes.averageComparisons} step vs Linear: ~
                  {linearRes?.averageComparisons} steps
                </div>
                <div className="text-[10px] text-slate-400">
                  Ratio: {((linearRes?.averageComparisons || 1) / Math.max(1, hashRes.averageComparisons)).toFixed(0)}× fewer comparisons
                </div>
              </div>
            </div>
          )}

          {/* Visual Latency Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Visual Latency Comparison (Average Duration per Search)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Normalized comparison across {datasetSize.toLocaleString()} records
            </p>

            <div className="space-y-5">
              {results.map(res => {
                const percent = Math.max(2, (res.averageTimeUs / maxDuration) * 100);
                const isHash = res.algorithmType.includes('Custom');
                const isBST = res.algorithmType.includes('Binary');

                return (
                  <div key={res.methodName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{res.methodName}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {res.theoreticalComplexity}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {res.averageTimeUs} µs{' '}
                        <span className="text-slate-400 font-normal">
                          ({(res.averageTimeUs / 1000).toFixed(4)} ms)
                        </span>
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHash
                            ? 'bg-emerald-500'
                            : isBST
                            ? 'bg-indigo-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Comparisons: {res.averageComparisons} avg</span>
                      <span>
                        Min: {res.minTimeUs} µs • Median: {res.medianTimeUs} µs • Max:{' '}
                        {res.maxTimeUs} µs
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Measured Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Detailed Benchmark Execution Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Algorithm / Method</th>
                    <th className="py-3 px-4">Theoretical Complexity</th>
                    <th className="py-3 px-4">Average Time</th>
                    <th className="py-3 px-4">Median Time</th>
                    <th className="py-3 px-4">Min / Max Time</th>
                    <th className="py-3 px-4">Avg Comparisons</th>
                    <th className="py-3 px-4">Latency Reduction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {results.map(r => (
                    <tr key={r.methodName} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">
                        {r.methodName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{r.theoreticalComplexity}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.averageTimeUs} µs</td>
                      <td className="py-3 px-4 text-slate-600">{r.medianTimeUs} µs</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {r.minTimeUs} µs / {r.maxTimeUs} µs
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {r.averageComparisons}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {r.latencyReductionPercent ? `${r.latencyReductionPercent}%` : 'Baseline'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Slide 9 & 10 Theoretical Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Presentation Slides 9 & 10: Complexity & Solution Analysis
          </h3>
          <p className="text-xs text-slate-500">
            Theoretical algorithmic comparison as specified in the project presentation
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white text-[11px] font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4">Unindexed Array / List</th>
                <th className="py-3 px-4">Binary Search Tree (BST)</th>
                <th className="py-3 px-4 bg-indigo-900">Proposed Hash Table (Our Project)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">Search Time Complexity</td>
                <td className="py-3 px-4 text-slate-600 font-mono">O(N) Linear Time</td>
                <td className="py-3 px-4 text-slate-600 font-mono">O(log N) Logarithmic</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-800 font-mono font-bold">
                  100% O(1) Constant Time
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">Insertion / Deletion</td>
                <td className="py-3 px-4 text-slate-600 font-mono">O(1) Append / O(N) Shift</td>
                <td className="py-3 px-4 text-slate-600 font-mono">O(log N) Tree Insertion</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-800 font-mono font-bold">
                  O(1) Average Time
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">Memory Indexing Structure</td>
                <td className="py-3 px-4 text-slate-600">Contiguous Memory</td>
                <td className="py-3 px-4 text-slate-600">Pointer Overhead per Node</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-800 font-medium">
                  Direct Bucket Indexing
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">Collision / Duplicate Control</td>
                <td className="py-3 px-4 text-slate-600">Allows Duplicates</td>
                <td className="py-3 px-4 text-slate-600">Requires Tree Balancing (AVL)</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-800 font-medium">
                  Separate Chaining &amp; Auto-Resizing
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">1M Contact Lookup Claim</td>
                <td className="py-3 px-4 text-red-600 font-mono">~500,000 comparisons avg</td>
                <td className="py-3 px-4 text-slate-600 font-mono">~20 comparisons</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-800 font-mono font-bold">
                  1 hash computation (500,000× fewer)
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">Scalability (1M+ Contacts)</td>
                <td className="py-3 px-4 text-red-600">High Latency (Degrades)</td>
                <td className="py-3 px-4 text-slate-600">Moderate Latency</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-800 font-semibold">
                  Near-Instant Lookup (&lt; 1 ms target)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology & Distinction Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center space-x-2 font-semibold text-slate-800">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Benchmark Methodology & Presentation Claims Distinction</span>
        </div>
        <p className="leading-relaxed">
          The presentation slide figures (sub-millisecond queries for 1,000,000 records, ~99% latency
          reduction) represent <strong>theoretical project targets</strong> and asymptotic complexity
          projections. In this web application, tests execute in real time inside your browser engine
          over genuine in-memory datasets up to 50,000 records using high-resolution{' '}
          <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">performance.now()</code>.
          Timing reflects pure search execution time excluding DOM rendering.
        </p>
      </div>
    </div>
  );
};
