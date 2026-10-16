import React, { useState } from 'react';
import {
  Grid,
  Hash,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { Contact } from '../types/contact';
import { CustomHashTable, computePolynomialHash, normalizeKey } from '../utils/hashTable';

interface ExplorerViewProps {
  initialKeyToTrace?: string;
  nameTable: CustomHashTable<Contact>;
  onContactCountChanged: () => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  initialKeyToTrace = 'CAT',
  nameTable,
  onContactCountChanged,
}) => {
  const [activeKey, setActiveKey] = useState<string>(initialKeyToTrace);
  const [testKeyInput, setTestKeyInput] = useState<string>('');
  const [testValInput, setTestValInput] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Dedicated demo table for controlled capacity experiments if desired
  const [useDedicatedDemo, setUseDedicatedDemo] = useState(false);
  const [demoTable, setDemoTable] = useState<CustomHashTable<string>>(() => {
    const dt = new CustomHashTable<string>(8);
    dt.insert('Alice', 'Lead');
    dt.insert('Bob', 'Dev');
    dt.insert('CAT', 'Slide 8 Example');
    dt.insert('David', 'Slide 7 Example');
    return dt;
  });

  const activeTable = useDedicatedDemo ? demoTable : nameTable;
  const buckets = activeTable.inspectBuckets();
  const stats = activeTable.getStats();

  // Run trace on activeKey
  const traceResult = activeKey.trim()
    ? activeTable.traceLookup(activeKey.trim())
    : null;

  const handleInsertTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testKeyInput.trim()) return;

    try {
      const res = activeTable.insert(testKeyInput.trim(), {
        id: `test_${Date.now()}`,
        name: testKeyInput.trim(),
        phone: testValInput.trim() || '+1 555-0000',
        email: `${normalizeKey(testKeyInput)}@hashlab.io`,
        group: 'Test',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);

      setActiveKey(testKeyInput.trim());
      setFeedbackNotice({
        type: 'success',
        text: `Key "${testKeyInput.trim()}" inserted into Bucket [${res.bucketIndex}]. ${
          res.collided ? 'Collision chained!' : 'Direct head slot.'
        }${res.rehashed ? ` Table auto-resized from ${res.oldCapacity} to ${res.newCapacity}!` : ''}`,
      });

      setTestKeyInput('');
      setTestValInput('');
      onContactCountChanged();
    } catch (err: any) {
      setFeedbackNotice({ type: 'error', text: err.message || 'Insert error' });
    }
  };

  const handleDeleteActiveKey = (key: string) => {
    const res = activeTable.delete(key);
    if (res.deleted) {
      setFeedbackNotice({
        type: 'info',
        text: `Key "${key}" successfully unlinked from Bucket [${res.bucketIndex}].`,
      });
      onContactCountChanged();
    } else {
      setFeedbackNotice({
        type: 'error',
        text: `Key "${key}" could not be deleted (not found).`,
      });
    }
  };

  const handleSimulateAutoRehash = () => {
    // Add items until load factor exceeds 0.75
    const testKeys = ['Echo', 'Fox', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike'];
    let triggered = false;

    for (const k of testKeys) {
      const res = activeTable.insert(k, {
        id: `auto_${Date.now()}_${k}`,
        name: k,
        phone: '+1 555-9999',
        email: `${k.toLowerCase()}@hashlab.io`,
        group: 'RehashDemo',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);

      if (res.rehashed) {
        triggered = true;
        setFeedbackNotice({
          type: 'success',
          text: `Auto-rehash triggered when inserting "${k}"! Capacity doubled to ${res.newCapacity} (Load factor reached 0.75). All nodes remapped.`,
        });
        setActiveKey(k);
        break;
      }
    }

    if (!triggered) {
      setFeedbackNotice({
        type: 'info',
        text: `Inserted elements. Current load factor: ${activeTable.getLoadFactor().toFixed(2)}.`,
      });
    }

    onContactCountChanged();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Slide References */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              <span>Slide 6, 7 & 8 Formula: h(key) = ( Σ s[i] · 31^i ) mod m</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Interactive Hash Table & Collision Explorer
            </h2>
            <p className="text-xs text-slate-500">
              Inspect live bucket array indices, separate chaining linked lists, and step-by-step
              polynomial calculation breakdown.
            </p>
          </div>

          {/* Preset Buttons from PPT Slides */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">PPT Presets:</span>
            <button
              onClick={() => setActiveKey('CAT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                activeKey.toUpperCase() === 'CAT'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              "CAT" (Slide 8 Example)
            </button>
            <button
              onClick={() => setActiveKey('David')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                activeKey.toLowerCase() === 'david'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              "David" (Slide 7 Example)
            </button>
            <button
              onClick={() => setActiveKey('Alice')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            >
              "Alice"
            </button>
            <button
              onClick={() => setActiveKey('Bob')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            >
              "Bob"
            </button>
          </div>
        </div>

        {/* Live Explorer Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">Capacity (m):</span>
            <span className="font-mono text-base font-bold text-slate-900">{stats.capacity}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">Stored Items (n):</span>
            <span className="font-mono text-base font-bold text-slate-900">{stats.size}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">Load Factor (α):</span>
            <span
              className={`font-mono text-base font-bold ${
                stats.loadFactor >= 0.75 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {stats.loadFactor.toFixed(3)}
              <span className="text-slate-400 text-xs font-normal"> / 0.75</span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">Collisions / Rehashes:</span>
            <span className="font-mono text-base font-bold text-indigo-600">
              {stats.totalCollisions} / {stats.rehashCount}
            </span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Mathematical Trace Card */}
      {traceResult && (
        <div className="bg-slate-950 text-white rounded-xl p-6 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Trace Target
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  "{traceResult.computation.key}"
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full 4-step pipeline execution matching PPT Slide 8
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded font-semibold ${
                  traceResult.found
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {traceResult.found ? 'O(1) Found!' : 'Key Not in Table'}
              </span>
              <span className="font-mono text-xs text-indigo-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Bucket [{traceResult.computation.bucketIndex}]
              </span>
            </div>
          </div>

          {/* 4 Execution Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {traceResult.steps.map(step => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 leading-tight">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {step.description}
                  </p>
                </div>

                {step.formula && (
                  <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-indigo-300 border border-slate-800 break-all">
                    {step.formula}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Slide 8 Exact Formula Breakdown for CAT */}
          {activeKey.toUpperCase() === 'CAT' && (
            <div className="mt-4 p-4 rounded-lg bg-indigo-950/70 border border-indigo-700/80 text-xs font-mono text-indigo-200">
              <div className="flex items-center space-x-2 text-white font-bold mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Presentation Slide 8: Exact Step-by-Step Mathematical Verification</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1 border-t border-indigo-900/80">
                <div className="space-y-1">
                  <div><strong className="text-white">Step 1: Extract ASCII:</strong> 'C' = 67, 'A' = 65, 'T' = 84</div>
                  <div><strong className="text-white">Step 2: Polynomial Sum:</strong> 67×31^0 + 65×31^1 + 84×31^2</div>
                  <div className="text-indigo-300">= 67 + 2,015 + 80,724 = <strong>82,806</strong></div>
                </div>
                <div className="space-y-1">
                  <div><strong className="text-white">Step 3: Modulo m = 8:</strong> 82,806 mod 8 = <strong>Bucket Index [6]</strong></div>
                  <div className="text-emerald-400 font-bold">Step 4: Direct Access: Jump to Bucket[6] → Found! (&lt; 0.01 ms)</div>
                  <div className="text-slate-400 text-[10px]">Linear search would check Alice → Bob → Charlie... up to N times.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bucket Array Grid Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Bucket Array with Separate Chaining Linked Lists
            </h3>
            <p className="text-xs text-slate-500">
              Click any bucket to inspect its stored keys, raw hash, and collision nodes
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSimulateAutoRehash}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-medium border border-amber-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Trigger Auto-Rehash (Load &gt; 0.75)</span>
            </button>
          </div>
        </div>

        {feedbackNotice && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
              feedbackNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : feedbackNotice.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-600" />
            )}
            <span>{feedbackNotice.text}</span>
          </div>
        )}

        {/* Bucket List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto p-1">
          {buckets.map(b => {
            const isTargetBucket = traceResult?.computation.bucketIndex === b.index;

            return (
              <div
                key={b.index}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTargetBucket
                    ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                    : b.isOccupied
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/60 border-slate-200/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      [{b.index}]
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {b.isOccupied
                        ? `${b.chainLength} node${b.chainLength > 1 ? 's' : ''}`
                        : 'Empty'}
                    </span>
                  </div>

                  {b.chainLength > 1 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      Collision Chain ({b.chainLength})
                    </span>
                  )}
                </div>

                {/* Chained Nodes */}
                {b.isOccupied ? (
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {b.nodes.map((node, nodeIdx) => {
                      const isMatchedKey =
                        normalizeKey(node.key) === normalizeKey(activeKey);

                      return (
                        <div
                          key={nodeIdx}
                          className={`p-2 rounded-lg border flex items-center justify-between ${
                            isMatchedKey
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-[10px] text-slate-400">#{nodeIdx + 1}</span>
                            <span className="truncate">"{node.key}"</span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => setActiveKey(node.key)}
                              className="text-[10px] text-indigo-600 hover:underline"
                            >
                              Trace
                            </button>
                            <button
                              onClick={() => handleDeleteActiveKey(node.key)}
                              className="text-[10px] text-red-500 hover:underline"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic p-2 text-center border border-dashed border-slate-200 rounded">
                    null pointer (0 nodes)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Key Insertion & Tester Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Direct Hash Table Key Operator
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Add any arbitrary test key to observe its ASCII computation, collision handling, and
          automatic load factor scaling.
        </p>

        <form onSubmit={handleInsertTest} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={testKeyInput}
              onChange={e => setTestKeyInput(e.target.value)}
              placeholder="Enter key to hash (e.g. Charlie, CAT, Diana, Apollo)..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>
          <div className="w-full sm:w-48">
            <input
              type="text"
              value={testValInput}
              onChange={e => setTestValInput(e.target.value)}
              placeholder="Optional payload / note"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Hash & Insert Key</span>
          </button>
        </form>
      </div>
    </div>
  );
};
