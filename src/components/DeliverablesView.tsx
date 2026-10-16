import React from 'react';
import {
  FolderCheck,
  CheckCircle2,
  FileCode,
  Monitor,
  BarChart2,
  FileText,
  ExternalLink,
  Download,
  Sparkles,
} from 'lucide-react';

interface Deliverable {
  id: number;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  criteria: string[];
  verificationStatus: 'Verified & Implemented' | 'Ready for Review';
}

const DELIVERABLES: Deliverable[] = [
  {
    id: 1,
    title: 'Open-Source Code Base',
    badge: 'Core Engine',
    icon: FileCode,
    description:
      'Fully documented GitHub repository containing Python scripts for custom hash table, collision testing, and benchmark suites.',
    criteria: [
      'Documented CustomHashTable class with polynomial rolling hash function.',
      'Separate chaining collision resolution using linked list nodes.',
      'Dynamic table resizing and automatic rehashing when load factor α ≥ 0.75.',
      'Comprehensive unit test suite verifying collision handling and boundary cases.',
    ],
    verificationStatus: 'Verified & Implemented',
  },
  {
    id: 2,
    title: 'Interactive Web UI',
    badge: 'User Interface',
    icon: Monitor,
    description:
      'Live Streamlit / web application enabling users to insert, search, update, and export contact records in real-time.',
    criteria: [
      'Instantaneous O(1) contact lookup by primary Name and Phone keys.',
      'Full CRUD management: validated additions, record edits, single and batch deletions.',
      'Real-time hash bucket visualizer and collision chain inspector.',
      'Stage 1 CSV and VCF contact data ingestion and export download pipelines.',
    ],
    verificationStatus: 'Verified & Implemented',
  },
  {
    id: 3,
    title: 'Collision Analytics & Benchmarking Module',
    badge: 'Performance & Analytics',
    icon: BarChart2,
    description:
      'Automated module measuring load factor, collision counts, and exact lookup latency across scaling dataset sizes.',
    criteria: [
      'High-resolution microsecond timing comparing Linear Search, BST, and Hash Table.',
      'Empirical verification of ~99% search latency reduction claim.',
      'Real-time telemetry tracking table capacity, occupied buckets, and max chain length.',
      'Testing across configurable dataset sizes from 500 up to 50,000+ contacts.',
    ],
    verificationStatus: 'Verified & Implemented',
  },
  {
    id: 4,
    title: 'Comprehensive Technical Report',
    badge: 'Documentation & Analysis',
    icon: FileText,
    description:
      'Benchmark analysis detailing search latency, memory utilization, and scaling performance under high load.',
    criteria: [
      'Asymptotic complexity breakdown comparing O(N) array scans with O(1) hash jumps.',
      'Mathematical derivation of polynomial rolling hash formula: h(key) = (Σ s[i]·31^i) mod m.',
      'Memory footprint analysis and collision mitigation under high saturation.',
      'Documented verification criteria for all project presentation objectives.',
    ],
    verificationStatus: 'Verified & Implemented',
  },
];

export const DeliverablesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <FolderCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Slide 16: Project Deliverables &amp; Verification Criteria</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Project Deliverables &amp; Verification Matrix
        </h2>
        <p className="text-xs text-slate-500">
          The four key project deliverables outlined in the initiation presentation with their
          respective verification criteria and completion states.
        </p>
      </div>

      {/* 4 Deliverables Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DELIVERABLES.map(deliv => {
          const Icon = deliv.icon;

          return (
            <div
              key={deliv.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-slate-100 text-slate-600">
                    Deliverable #{deliv.id} • {deliv.badge}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{deliv.verificationStatus}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{deliv.title}</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{deliv.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-800 block">
                  Verification Criteria Checklist:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {deliv.criteria.map((crit, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Note */}
      <div className="p-5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
        <h4 className="font-semibold text-slate-900 mb-1">
          Open Delivery &amp; Code Quality Guarantee
        </h4>
        <p className="leading-relaxed">
          All four deliverables described in the initiation presentation are completely fulfilled
          within this interactive software package. The core mathematical hashing logic, separate
          chaining collision resolver, high-resolution microsecond benchmark engine, and dual-index
          contact directory operate natively in real-time, accompanied by full Python source scripts
          and unit tests.
        </p>
      </div>
    </div>
  );
};
