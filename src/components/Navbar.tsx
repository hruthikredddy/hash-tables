import React, { useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Zap,
  Menu,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import type { NavTab } from './Sidebar';
import type { Contact } from '../types/contact';

interface NavbarProps {
  currentTab: NavTab;
  onOpenAddModal: () => void;
  onResetSampleData: () => void;
  onSearchQuery: (query: string) => void;
  searchResultNotice?: {
    text: string;
    durationUs: number;
    bucketIndex?: number;
    isHit: boolean;
  } | null;
  onToggleMobileSidebar: () => void;
  sampleCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenAddModal,
  onResetSampleData,
  onSearchQuery,
  searchResultNotice,
  onToggleMobileSidebar,
  sampleCount,
}) => {
  const [localQuery, setLocalQuery] = useState('');

  const getPageTitle = (tab: NavTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Project Overview & Dashboard',
          subtitle: 'Live hash table metrics, utilization, and instant search interface',
        };
      case 'contacts':
        return {
          title: 'Contact Directory & CRUD Engine',
          subtitle: 'Dual-indexed hash table records with instantaneous O(1) retrieval',
        };
      case 'explorer':
        return {
          title: 'Interactive Hash Table Explorer',
          subtitle: 'Visual bucket array, collision chains, and polynomial rolling hash inspector',
        };
      case 'benchmark':
        return {
          title: 'Algorithmic Performance Benchmarks',
          subtitle: 'High-resolution latency comparison: Linear Search vs BST vs Hash Table',
        };
      case 'architecture':
        return {
          title: 'System Architecture & Pipeline Flow',
          subtitle: '4-stage operational data pipeline from ingestion to O(1) search rendering',
        };
      case 'techstack':
        return {
          title: '100% Free & Open-Source Software Stack',
          subtitle: 'Python runtime, custom hash maps, Streamlit dashboards, and Pandas',
        };
      case 'roadmap':
        return {
          title: 'Implementation Roadmap & Key Milestones',
          subtitle: '8-week phased development plan from architecture to 1M contact scaling',
        };
      case 'risk':
        return {
          title: 'Risk Assessment & Mitigation Matrix',
          subtitle: 'Architectural risks, collision management, and proactive safeguards',
        };
      case 'deliverables':
        return {
          title: 'Project Deliverables & Verification Criteria',
          subtitle: 'Documented code base, live interactive UI, analytics module, and technical report',
        };
      case 'about':
        return {
          title: 'About the Project & Initiation Pitch',
          subtitle: 'Project objectives, team attribution, and presentation executive summary',
        };
    }
  };

  const { title, subtitle } = getPageTitle(currentTab);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    onSearchQuery(val);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="truncate">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight truncate">
              {title}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="w-3 h-3 mr-1 text-emerald-600" />
              O(1) Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate hidden lg:block">{subtitle}</p>
        </div>
      </div>

      {/* Right: Global Search & Contextual Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Global Search Bar with Live Hash Badge */}
        <div className="relative w-44 sm:w-64 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localQuery}
            onChange={handleSearchChange}
            placeholder="Search name or phone..."
            aria-label="Global search contact"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          {localQuery && (
            <button
              onClick={() => {
                setLocalQuery('');
                onSearchQuery('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

          {/* Quick timing notification tooltip under search bar if active */}
          {searchResultNotice && localQuery && (
            <div className="absolute top-full mt-1.5 right-0 bg-slate-900 text-white text-[11px] font-mono px-2.5 py-1 rounded shadow-lg z-30 whitespace-nowrap border border-slate-800 flex items-center space-x-2">
              <span className={searchResultNotice.isHit ? 'text-emerald-400' : 'text-slate-400'}>
                {searchResultNotice.text}
              </span>
              <span className="text-slate-400">({searchResultNotice.durationUs} µs)</span>
            </div>
          )}
        </div>

        {/* Reset / Sample Data Action */}
        <button
          onClick={onResetSampleData}
          title="Reload initial PPT sample contacts (Alice, Bob, Charlie, David, etc.)"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Samples</span>
        </button>

        {/* Primary Action: Add Contact */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Contact</span>
        </button>
      </div>
    </header>
  );
};
