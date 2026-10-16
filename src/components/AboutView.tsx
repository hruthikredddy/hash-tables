import React from 'react';
import {
  Info,
  Users,
  Target,
  AlertCircle,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Database,
  Clock,
  Layers,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Initiation Pitch Banner matching Slide 1 */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium mb-3">
          <span>Project Initiation Pitch</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Smart Contact Management Using Hash Tables
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-6">
          A 100% High-Performance, Scalable, and In-Memory Contact Management System Powered by
          Python, Hash Maps &amp; Streamlit.
        </p>

        {/* 4 Feature Badges from Slide 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-center">
            <span className="text-[11px] font-mono text-indigo-400 block font-semibold">Stack</span>
            <span className="text-xs font-medium text-white">Python Stack</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-center">
            <span className="text-[11px] font-mono text-indigo-400 block font-semibold">Engine</span>
            <span className="text-xs font-medium text-white">Custom Hash Table</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-center">
            <span className="text-[11px] font-mono text-emerald-400 block font-semibold">Retrieval</span>
            <span className="text-xs font-medium text-white">O(1) Search &amp; Retrieval</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-center">
            <span className="text-[11px] font-mono text-emerald-400 block font-semibold">Licensing</span>
            <span className="text-xs font-medium text-white">$0 Software Cost</span>
          </div>
        </div>
      </div>

      {/* Presentation Authors Card matching Slide 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
          Project Presentation Team
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
              IR
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">I. Hruthik Reddy</h4>
              <p className="text-xs text-slate-500 font-mono">Roll No: 25951A05AE</p>
            </div>
          </div>

          <div className="hidden sm:block text-slate-300 font-bold">•</div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
              DJ
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">D. Jagadeeshwar</h4>
              <p className="text-xs text-slate-500 font-mono">Roll No: 25951A05AH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Identification & Storage Context matching Slide 4 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Slide 4: Problem Identification &amp; Contact Storage Context
          </h3>
          <p className="text-xs text-slate-500">
            Why traditional directories fail and how in-memory hash tables solve the lookup bottleneck
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 text-xs space-y-2">
            <h4 className="font-semibold text-red-900 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 text-red-600 shrink-0" />
              Linear Search Inefficiency
            </h4>
            <p className="text-slate-700 leading-relaxed">
              Conventional contact storage tools rely on unindexed arrays that fail to scale,
              requiring O(N) linear time for search queries as directories expand.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 text-xs space-y-2">
            <h4 className="font-semibold text-red-900 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 text-red-600 shrink-0" />
              High Memory &amp; Query Latency
            </h4>
            <p className="text-slate-700 leading-relaxed">
              Enterprise CRM systems often rely on heavy external databases that introduce high query
              latency, network serialization overhead, and recurring server license fees.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 text-xs space-y-2">
            <h4 className="font-semibold text-red-900 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 text-red-600 shrink-0" />
              Contact Lookup Bottlenecks
            </h4>
            <p className="text-slate-700 leading-relaxed">
              Delayed contact retrieval severely degrades real-time messaging, caller ID lookup,
              and call routing performance under concurrent peak load.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-2">
            <h4 className="font-semibold text-emerald-950 flex items-center">
              <Zap className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
              Hash Table Opportunity
            </h4>
            <p className="text-slate-700 leading-relaxed">
              In-memory hash tables provide average O(1) constant time lookup, insertion, and
              deletion without database licensing fees, operating at hardware memory speeds.
            </p>
          </div>
        </div>
      </div>

      {/* Core Project Objectives matching Slide 5 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Slide 5: Core Project Objectives
          </h3>
          <p className="text-xs text-slate-500">
            The three engineering pillars defined in the initiation presentation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">O(1) Hash Lookup Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Develop a high-performance hash map engine achieving constant-time O(1) contact
              retrieval by key (Name/Phone) with dynamic resizing.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Collision Resolution System</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Implement separate chaining with linked lists and open addressing to handle hash
              collisions seamlessly under high load factors.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Interactive Open Dashboard</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deploy a 100% free web-based user interface using Streamlit for instant contact search,
              CRUD operations, and real-time hash metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
