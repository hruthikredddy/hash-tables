import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  Workflow,
  Sparkles,
  BarChart2,
  Database,
} from 'lucide-react';

interface Milestone {
  phase: number;
  weeks: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  description: string;
  milestones: string[];
  deliverables: string[];
}

const ROADMAP_PHASES: Milestone[] = [
  {
    phase: 1,
    weeks: 'Weeks 1 – 2',
    title: 'Phase 1: Setup & Architecture',
    status: 'Completed',
    description:
      'Design contact record schema and establish the baseline array-search benchmark.',
    milestones: [
      'Define Contact entity schema: Name, Phone, Email, Group, and metadata.',
      'Construct unindexed contiguous array storage structure.',
      'Implement linear search scan algorithm O(N) for baseline timing.',
      'Design test suite and verify worst-case latency scaling.',
    ],
    deliverables: ['Schema specification document', 'Baseline linear search benchmark suite'],
  },
  {
    phase: 2,
    weeks: 'Weeks 3 – 4',
    title: 'Phase 2: Hashing Engine',
    status: 'Completed',
    description:
      'Build polynomial hash function, separate chaining, and dynamic resizing engine.',
    milestones: [
      'Implement polynomial rolling hash: h(key) = (Σ s[i] · 31^i) mod m.',
      'Construct separate chaining linked-list collision buckets.',
      'Integrate automatic capacity doubling (m = 2m) when load factor α ≥ 0.75.',
      'Write unit tests for collision resolution and rehashing integrity.',
    ],
    deliverables: ['CustomHashTable engine module', 'Automated unit test suite (100% passing)'],
  },
  {
    phase: 3,
    weeks: 'Weeks 5 – 6',
    title: 'Phase 3: CRUD & Search Features',
    status: 'Completed',
    description:
      'Implement O(1) search, fuzzy matching fallback, contact editing, and batch deletion.',
    milestones: [
      'Implement dual-index hash tables for both primary Name and Phone lookups.',
      'Build contact insertion with duplicate primary key prevention.',
      'Implement contact update with automatic index re-registration.',
      'Develop substring / fuzzy fallback search when exact key is not matched.',
      'Construct batch deletion and safe chain unlinking.',
    ],
    deliverables: ['ContactManager dual-index engine', 'CRUD validation and fallback search'],
  },
  {
    phase: 4,
    weeks: 'Weeks 7 – 8',
    title: 'Phase 4: Web UI & Benchmarking',
    status: 'In Progress',
    description:
      'Deploy Streamlit web dashboard and run latency benchmarking tests on 1M contacts.',
    milestones: [
      'Build interactive dashboard interface with real-time bucket telemetry.',
      'Integrate CSV and VCF file ingestion and export pipeline.',
      'Construct high-resolution microsecond benchmarking module against BST and Array.',
      'Verify ~99% latency reduction claim across scaling dataset tiers.',
      'Prepare comprehensive technical report and project documentation.',
    ],
    deliverables: ['Interactive dashboard interface', 'Scaling latency benchmark report'],
  },
];

export const RoadmapView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Slide 13: 8-Week Phased Development Roadmap</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Implementation Roadmap & Key Milestones
        </h2>
        <p className="text-xs text-slate-500">
          The four development phases tracking progress from initial architecture and polynomial
          hashing to full CRUD, web dashboard, and 1M contact scaling benchmarks.
        </p>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ROADMAP_PHASES.map((phase, idx) => {
          const isCompleted = phase.status === 'Completed';
          const isInProgress = phase.status === 'In Progress';

          return (
            <div
              key={phase.phase}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-white border-emerald-200 shadow-xs'
                  : isInProgress
                  ? 'bg-white border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-500">{phase.weeks}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isInProgress
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {phase.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2">{phase.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{phase.description}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <span className="text-[11px] font-semibold text-slate-700 block">Milestones:</span>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  {phase.milestones.map((m, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isCompleted ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span className="leading-tight">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliverable Milestones Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Phase Verification & Delivery Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Phase & Timeframe</th>
                <th className="py-3 px-4">Focus Area</th>
                <th className="py-3 px-4">Core Deliverables</th>
                <th className="py-3 px-4">Verification State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROADMAP_PHASES.map(p => (
                <tr key={p.phase} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    Phase {p.phase} ({p.weeks})
                  </td>
                  <td className="py-3 px-4 text-slate-700">{p.title.split(': ')[1]}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {p.deliverables.join(' • ')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                        p.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
