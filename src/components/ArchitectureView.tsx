import React, { useState } from 'react';
import {
  Workflow,
  FileSpreadsheet,
  Cpu,
  Layers,
  Monitor,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Code2,
  Info,
  Server,
  Zap,
} from 'lucide-react';

interface PipelineStage {
  id: number;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  inputs: string;
  outputs: string;
  responsibilities: string[];
  formula?: string;
  codeSnippet: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    name: 'Stage 1: Contact Data Ingestion',
    subtitle: 'Parse CSV/VCF files into standardized Contact objects',
    icon: FileSpreadsheet,
    color: 'border-sky-500 bg-sky-50 text-sky-700',
    inputs: 'Raw text streams, CSV files, vCard (VCF) records, or manual form inputs',
    outputs: 'Standardized Contact objects: { name, phone, email, group, notes, id }',
    responsibilities: [
      'Tokenizes comma-separated values and vCard attribute lines (FN, TEL, EMAIL).',
      'Normalizes text fields: trims whitespace, canonicalizes phone numbers.',
      'Performs field-level validation and flags malformed or empty records.',
      'Prepares standardized in-memory records ready for primary and secondary indexing.',
    ],
    codeSnippet: `def ingest_contact(row_dict: dict) -> Contact:
    return Contact(
        name=row_dict.get("Name", "").strip(),
        phone=normalize_phone(row_dict.get("Phone", "")),
        email=row_dict.get("Email", "").strip(),
        group=row_dict.get("Group", "General").strip()
    )`,
  },
  {
    id: 2,
    name: 'Stage 2: Hash Code Computation Engine',
    subtitle: 'Polynomial rolling hash function over normalized string key',
    icon: Cpu,
    color: 'border-indigo-500 bg-indigo-50 text-indigo-700',
    inputs: 'Normalized key string s (Name or Phone number)',
    outputs: 'Large polynomial integer sum and initial Bucket Index: h(key) mod m',
    formula: 'h(key) = ( Σ s[i] · p^i ) mod m   (where p = 31, m = table capacity)',
    responsibilities: [
      'Extracts ASCII character values s[i] for each character index i.',
      'Applies prime multiplier constant p = 31 to distribute keys uniformly across buckets.',
      'Computes polynomial summation without collision clustering.',
      'Applies modulo m to project into valid bucket range [0, m - 1].',
    ],
    codeSnippet: `def compute_polynomial_hash(key: str, capacity: int) -> int:
    total_hash = 0
    p_power = 1
    for char in key:
        total_hash += ord(char) * p_power
        p_power *= 31
    return total_hash % capacity`,
  },
  {
    id: 3,
    name: 'Stage 3: Collision & Storage Manager',
    subtitle: 'Separate chaining linked lists and dynamic auto-rehashing (α ≥ 0.75)',
    icon: Layers,
    color: 'border-amber-500 bg-amber-50 text-amber-700',
    inputs: 'Computed Bucket Index, key, and payload value',
    outputs: 'Direct bucket slot assignment, collision chain nodes, or resized table (2× capacity)',
    formula: 'Load Factor α = n / m;  Trigger rehash when α ≥ 0.75',
    responsibilities: [
      'Directly links new HashNode into bucket array if slot is currently null.',
      'Resolves collisions using separate chaining linked list nodes.',
      'Continuously monitors table saturation: α = n / m.',
      'When α ≥ 0.75, automatically doubles bucket capacity (m = 2m) and rehashes all elements.',
    ],
    codeSnippet: `if (self.size + 1) / self.capacity >= 0.75:
    self.resize(self.capacity * 2)

bucket = self.buckets[bucket_index]
if bucket is None:
    self.buckets[bucket_index] = HashNode(key, value)
else:
    # Separate Chaining traversal
    curr = bucket
    while curr.next:
        curr = curr.next
    curr.next = HashNode(key, value)`,
  },
  {
    id: 4,
    name: 'Stage 4: Interactive Web UI & Search',
    subtitle: 'Instant O(1) lookups, real-time telemetry, and directory filters',
    icon: Monitor,
    color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    inputs: 'User query keystrokes, filter selections, and inspection requests',
    outputs: 'Sub-millisecond contact retrieval cards, live bucket graph, and performance analytics',
    responsibilities: [
      'Bypasses linear scans by immediately hashing user search query in O(1).',
      'Provides fallback fuzzy substring filters when exact key is not matched.',
      'Renders live bucket utilization gauge and collision chain visualization.',
      'Allows real-time CRUD operations, CSV/VCF export, and latency telemetry.',
    ],
    codeSnippet: `t0 = time.perf_counter()
contact = hash_table.search(user_query)
elapsed_us = (time.perf_counter() - t0) * 1_000_000
render_contact_details(contact, elapsed_us)`,
  },
];

export const ArchitectureView: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const activeStage = PIPELINE_STAGES.find(s => s.id === selectedStage)!;

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Workflow className="w-3.5 h-3.5 text-indigo-600" />
          <span>Slide 11 Reference: 4-Stage Operational Data Pipeline</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          System Architecture & Pipeline Flow
        </h2>
        <p className="text-xs text-slate-500">
          The end-to-end architecture diagram showing how contact records flow from raw file
          ingestion to polynomial hashing, separate chaining storage, and instant O(1) web
          rendering.
        </p>
      </div>

      {/* Visual 4-Stage Flow Diagram */}
      <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6 text-center">
          Operational Data Flow Diagram
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.id;

            return (
              <div key={stage.id} className="flex flex-col items-center">
                <button
                  onClick={() => setSelectedStage(stage.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all relative ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                      Stage {stage.id}
                    </span>
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">{stage.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {stage.subtitle}
                  </p>
                </button>

                {/* Arrow connector for next item on desktop */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -ml-2 text-slate-600 pointer-events-none" style={{ left: `${(idx + 1) * 25}%` }}>
                    <ArrowRight className="w-5 h-5 text-indigo-400/80 -translate-x-1/2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono">
            S{activeStage.id}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{activeStage.name}</h3>
            <p className="text-xs text-slate-500">{activeStage.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left: Inputs, Outputs & Responsibilities */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">Inputs:</span>
              <p className="text-slate-600">{activeStage.inputs}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">Outputs:</span>
              <p className="text-slate-600">{activeStage.outputs}</p>
            </div>

            {activeStage.formula && (
              <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-900">
                <span className="font-sans font-semibold text-indigo-950 block mb-1">
                  Mathematical Formulation:
                </span>
                <p className="font-bold">{activeStage.formula}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Stage Responsibilities:</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {activeStage.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Code Implementation Block */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 flex items-center">
                <Code2 className="w-4 h-4 mr-1.5 text-indigo-600" />
                Pipeline Implementation Code:
              </span>
              <span className="font-mono text-[10px] text-slate-400">Python / Streamlit</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
              <code>{activeStage.codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Architecture Transparency Card */}
      <div className="p-5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="flex items-center space-x-2 font-semibold text-slate-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Architectural Transparency & Implementation Stack Notice</span>
        </div>
        <p className="leading-relaxed">
          The presentation outlines a pure <strong>Python + Streamlit + Pandas</strong> software
          stack. To deliver the most fluid, sub-millisecond interactive experience inside modern
          browsers without requiring remote server hops for single keypresses, this web deployment
          executes the <em>identical mathematical hashing algorithm</em> (prime base p = 31, separate
          chaining, load factor α ≥ 0.75 dynamic auto-rehashing) via a high-performance in-memory
          engine, while providing complete, documented, and exportable Python scripts in the{' '}
          <strong>Technology Stack</strong> view.
        </p>
      </div>
    </div>
  );
};
