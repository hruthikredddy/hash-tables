import React, { useState } from 'react';
import {
  Users,
  Grid,
  Zap,
  TrendingDown,
  Layers,
  Search,
  Plus,
  Upload,
  BarChart2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import type { Contact, HashTableStats } from '../types/contact';
import type { NavTab } from './Sidebar';

interface ActivityItem {
  id: string;
  timestamp: number;
  type: 'insert' | 'search' | 'delete' | 'rehash' | 'import';
  description: string;
  details?: string;
}

interface OverviewViewProps {
  stats: {
    nameTableStats: HashTableStats;
    phoneTableStats: HashTableStats;
    totalContacts: number;
    sampleCount: number;
    userCount: number;
  };
  recentActivities: ActivityItem[];
  lastSearchMetric?: {
    query: string;
    durationUs: number;
    bucketIndex?: number;
    isHit: boolean;
    chainSteps?: number;
  } | null;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onQuickSearch: (query: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  recentActivities,
  lastSearchMetric,
  onNavigateTab,
  onOpenAddModal,
  onOpenImportModal,
  onQuickSearch,
}) => {
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const nameStats = stats.nameTableStats;
  const loadPercentage = Math.min(100, (nameStats.loadFactor / nameStats.threshold) * 100);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      onQuickSearch(quickSearchInput.trim());
      onNavigateTab('contacts');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Executive Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Polynomial Rolling Hash • Separate Chaining Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Smart Contact Management Using Hash Tables
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            A high-performance in-memory directory delivering constant-time{' '}
            <span className="font-semibold text-emerald-400 font-mono">O(1)</span> contact
            retrieval, dynamic load auto-resizing at{' '}
            <span className="font-mono text-amber-300">α ≥ 0.75</span>, and dual-index hashing for
            both names and phone numbers.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Contact</span>
            </button>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-all"
            >
              <Grid className="w-4 h-4 text-indigo-400" />
              <span>Explore Hash Buckets</span>
            </button>
            <button
              onClick={() => onNavigateTab('benchmark')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-all"
            >
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Run Benchmarks</span>
            </button>
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-all"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import CSV/VCF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Contacts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stored Contacts (n)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {stats.totalContacts}
            </span>
            <span className="text-xs text-slate-500">
              ({stats.userCount} custom, {stats.sampleCount} sample)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1 shrink-0" />
            Dual-indexed in memory
          </p>
        </div>

        {/* Metric 2: Table Capacity (m) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Table Capacity (m)</span>
            <Grid className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {nameStats.capacity}
            </span>
            <span className="text-xs text-slate-500">buckets</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center">
            <span className="font-mono text-indigo-600 font-semibold mr-1">
              {nameStats.occupiedBuckets}
            </span>
            occupied ({nameStats.emptyBuckets} empty)
          </p>
        </div>

        {/* Metric 3: Load Factor (alpha) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Load Factor (α = n/m)</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-bold font-mono ${
                nameStats.loadFactor >= 0.75 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {nameStats.loadFactor.toFixed(3)}
            </span>
            <span className="text-xs text-slate-500">/ 0.75 limit</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                nameStats.loadFactor >= 0.75 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Collision Metric */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Collisions & Chains</span>
            <TrendingDown className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {nameStats.totalCollisions}
            </span>
            <span className="text-xs text-slate-500">
              in {nameStats.collisionBucketsCount} bucket(s)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center">
            Max chain length:
            <span className="font-mono text-slate-700 font-semibold ml-1">
              {nameStats.maxChainLength}
            </span>
            <span className="ml-2 text-slate-400">
              (Rehashes: {nameStats.rehashCount})
            </span>
          </p>
        </div>
      </div>

      {/* Row 2: Hash Table Utilization & Quick O(1) Interactive Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hash Table Saturation & Slide 7 Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slide 7 Comparison Card: Linear Search vs Hash Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Slide 7 Reference: Hashing vs Linear Search — Finding "David"
                </h3>
                <p className="text-xs text-slate-500">
                  Visual proof of O(1) direct bucket jump versus sequential O(N) array scans
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                ~99% Latency Cut
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linear Search Side */}
              <div className="p-4 rounded-lg bg-red-50/50 border border-red-200/80">
                <div className="flex items-center justify-between text-xs font-semibold text-red-900 mb-2">
                  <span>Linear Search O(N)</span>
                  <span className="font-mono text-red-600">4 checks needed</span>
                </div>
                <p className="text-xs text-red-700 mb-3">
                  Must scan all N records sequentially until finding a match:
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="p-1.5 bg-white rounded border border-red-200 text-slate-600 flex justify-between">
                    <span>1. Alice</span>
                    <span className="text-red-500">Check 1 ✗</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-red-200 text-slate-600 flex justify-between">
                    <span>2. Bob</span>
                    <span className="text-red-500">Check 2 ✗</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-red-200 text-slate-600 flex justify-between">
                    <span>3. Charlie</span>
                    <span className="text-red-500">Check 3 ✗</span>
                  </div>
                  <div className="p-1.5 bg-emerald-50 rounded border border-emerald-300 text-emerald-800 font-semibold flex justify-between">
                    <span>4. David</span>
                    <span className="text-emerald-600">Found! (4th check)</span>
                  </div>
                </div>
              </div>

              {/* Hash Table Side */}
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/80">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-2">
                  <span>Custom Hash Table O(1)</span>
                  <span className="font-mono text-emerald-700">1 step calculation</span>
                </div>
                <p className="text-xs text-emerald-800 mb-3">
                  Computes polynomial hash index and jumps directly to bucket:
                </p>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 bg-slate-900 text-slate-200 rounded text-[10px] leading-tight">
                    <span className="text-indigo-400 font-semibold">Formula:</span> h("David") = (68×1 + 97×31 + 118×961 + ...) mod 8
                    <div className="text-emerald-400 font-bold mt-1">
                      → Bucket Index [5]
                    </div>
                  </div>
                  <div className="p-1.5 bg-emerald-100/60 rounded border border-emerald-300 text-emerald-900 font-semibold flex justify-between items-center">
                    <span>Bucket [5] → David Miller</span>
                    <span className="text-emerald-700 text-[10px] bg-white px-2 py-0.5 rounded shadow-xs">
                      1 direct jump (&lt;0.05ms)
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 flex items-center justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Bypasses 100% of other records
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bucket Occupancy Visual Distribution Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Primary Name Hash Table Bucket Allocation (m = {nameStats.capacity})
                </h3>
                <p className="text-xs text-slate-500">
                  Visual distribution of stored keys across separate chaining buckets
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('explorer')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center"
              >
                <span>Full Explorer</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Bucket Grid Miniature */}
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              {Array.from({ length: nameStats.capacity }).map((_, idx) => {
                const isOccupied = idx < nameStats.occupiedBuckets; // illustrative distribution in mini
                return (
                  <div
                    key={idx}
                    title={`Bucket [${idx}]`}
                    className={`h-7 rounded flex items-center justify-center font-mono text-[10px] border transition-colors ${
                      isOccupied
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {idx}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                  <span>Occupied: {nameStats.occupiedBuckets}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300" />
                  <span>Empty: {nameStats.emptyBuckets}</span>
                </span>
              </div>
              <span className="font-mono text-slate-600">
                Resizes at {Math.floor(nameStats.capacity * 0.75)} items
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Instant O(1) Tester & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Search Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Live Hash Lookup Tester
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Test instant O(1) key hashing on stored records
            </p>

            <form onSubmit={handleQuickSubmit} className="space-y-3">
              <div>
                <label htmlFor="quick-query" className="text-xs font-medium text-slate-700 block mb-1">
                  Contact Name or Phone Key:
                </label>
                <div className="relative">
                  <input
                    id="quick-query"
                    type="text"
                    value={quickSearchInput}
                    onChange={e => setQuickSearchInput(e.target.value)}
                    placeholder="e.g. Alice Smith, CAT, or +1 555-0142"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Search in Contact Directory</span>
              </button>
            </form>

            {/* Last Search Telemetry */}
            {lastSearchMetric && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span className="text-slate-500">Query: "{lastSearchMetric.query}"</span>
                  <span
                    className={`font-semibold ${
                      lastSearchMetric.isHit ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {lastSearchMetric.isHit ? 'Match Found' : 'Not Found'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                  <span>Duration:</span>
                  <span className="text-indigo-600 font-bold">
                    {lastSearchMetric.durationUs} µs
                  </span>
                </div>
                {lastSearchMetric.bucketIndex !== undefined && (
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                    <span>Bucket Index:</span>
                    <span>[{lastSearchMetric.bucketIndex}]</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Operations Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Engine Activity
              </h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {recentActivities.slice(0, 5).map(act => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                        act.type === 'insert'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.type === 'delete'
                          ? 'bg-red-100 text-red-800'
                          : act.type === 'rehash'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {act.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{act.description}</p>
                  {act.details && (
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{act.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
