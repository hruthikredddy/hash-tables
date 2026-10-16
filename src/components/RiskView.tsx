import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  TrendingDown,
  Layers,
  Monitor,
} from 'lucide-react';

interface RiskItem {
  riskFactor: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  proposedMitigation: string;
  implementedSafeguard: string;
  category: string;
  status: 'Mitigated' | 'Monitored';
}

const RISK_MATRIX: RiskItem[] = [
  {
    riskFactor: 'High Collision Rates on Bad Hashes',
    impactLevel: 'Medium',
    category: 'Hashing Algorithm',
    proposedMitigation:
      'Implement polynomial rolling hash with prime multiplicative constants and modulo table scaling.',
    implementedSafeguard:
      'Engine utilizes prime base p = 31 with position-dependent character powers (Σ s[i]·31^i), ensuring uniform distribution across buckets even on similar name prefixes.',
    status: 'Mitigated',
  },
  {
    riskFactor: 'Memory Spikes During Rehash',
    impactLevel: 'High',
    category: 'Memory Management',
    proposedMitigation:
      'Perform incremental rehashing and pre-allocate bucket capacity during bulk data loading.',
    implementedSafeguard:
      'Automatic doubling triggers at load factor α ≥ 0.75; bulk dataset generation pre-allocates bucket capacity (m = 1.5n) to bypass redundant rehashing cycles during ingestion.',
    status: 'Mitigated',
  },
  {
    riskFactor: 'Primary Clustering in Open Addressing',
    impactLevel: 'Medium',
    category: 'Collision Resolution',
    proposedMitigation:
      'Utilize quadratic probing or separate chaining with linked list bucket nodes.',
    implementedSafeguard:
      'Project architecture strictly enforces Separate Chaining linked nodes (HashNode), eliminating slot contamination and primary clustering altogether.',
    status: 'Mitigated',
  },
  {
    riskFactor: 'UI Render Lag on Large Lists',
    impactLevel: 'Low',
    category: 'User Interface',
    proposedMitigation:
      'Paginate search results and stream Streamlit data frames asynchronously.',
    implementedSafeguard:
      'Virtual table pagination (8 items per page) decouples directory rendering from raw in-memory hash capacity; O(1) searches render instantly without DOM re-layout overhead.',
    status: 'Mitigated',
  },
];

export const RiskView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Slide 15: Risk Assessment &amp; Mitigation Matrix</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Risk Assessment &amp; Mitigation Matrix
        </h2>
        <p className="text-xs text-slate-500">
          Analysis of algorithmic, memory, and interface risks alongside the mitigation strategies
          proposed in the presentation and the active safeguards implemented in code.
        </p>
      </div>

      {/* Risk Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white text-[11px] font-semibold uppercase">
              <tr>
                <th className="py-3.5 px-4">Risk Factor</th>
                <th className="py-3.5 px-4">Impact Level</th>
                <th className="py-3.5 px-4">Proposed PPT Mitigation Strategy</th>
                <th className="py-3.5 px-4">Implemented Code Safeguard</th>
                <th className="py-3.5 px-4">Mitigation State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RISK_MATRIX.map(risk => (
                <tr key={risk.riskFactor} className="hover:bg-slate-50/70">
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <div>{risk.riskFactor}</div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {risk.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        risk.impactLevel === 'High'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : risk.impactLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {risk.impactLevel}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 leading-relaxed max-w-xs">
                    {risk.proposedMitigation}
                  </td>
                  <td className="py-4 px-4 text-slate-600 leading-relaxed max-w-sm">
                    {risk.implementedSafeguard}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{risk.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proactive Collision Management Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-sm mb-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Load Factor Threshold α = 0.75 Rationale</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In hashing theory, when the load factor exceeds 0.75, collision probability increases
            exponentially, turning average constant time O(1) into linear search O(n) within
            individual chains. Proactively doubling bucket capacity and rehashing before reaching
            full saturation guarantees near-zero chain clustering.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-sm mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Prime Base Multiplier p = 31 Rationale</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Using the prime constant 31 ensures that bit shifts and multiplications distribute ASCII
            code sequences evenly across modular buckets. Anagrams or keys with inverted letters
            (e.g., "CAT" vs "ACT") yield wildly different large integer hash codes, preventing
            pathological collisions.
          </p>
        </div>
      </div>
    </div>
  );
};
