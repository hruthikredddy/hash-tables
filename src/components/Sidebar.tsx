import React from 'react';
import {
  LayoutDashboard,
  Users,
  Grid,
  BarChart2,
  Workflow,
  Cpu,
  Calendar,
  ShieldAlert,
  FolderCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  Database,
  Hash,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'contacts'
  | 'explorer'
  | 'benchmark'
  | 'architecture'
  | 'techstack'
  | 'roadmap'
  | 'risk'
  | 'deliverables'
  | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  contactCount: number;
  loadFactor: number;
}

interface NavItem {
  id: NavTab;
  label: string;
  slideRef: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', slideRef: 'Slides 1-3', icon: LayoutDashboard },
  { id: 'contacts', label: 'Contacts Directory', slideRef: 'CRUD Engine', icon: Users },
  { id: 'explorer', label: 'Hash Table Explorer', slideRef: 'Slides 6-8', icon: Grid, badge: 'Interactive' },
  { id: 'benchmark', label: 'Performance Benchmarks', slideRef: 'Slides 9-10', icon: BarChart2, badge: 'Live' },
  { id: 'architecture', label: 'Architecture & Pipeline', slideRef: 'Slide 11', icon: Workflow },
  { id: 'techstack', label: 'Technology Stack', slideRef: 'Slide 12', icon: Cpu },
  { id: 'roadmap', label: 'Implementation Roadmap', slideRef: 'Slide 13', icon: Calendar },
  { id: 'risk', label: 'Risk Assessment', slideRef: 'Slide 15', icon: ShieldAlert },
  { id: 'deliverables', label: 'Project Deliverables', slideRef: 'Slide 16', icon: FolderCheck },
  { id: 'about', label: 'About the Project', slideRef: 'Pitch & Goals', icon: Info },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  contactCount,
  loadFactor,
}) => {
  return (
    <aside
      className={`bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-18' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Hash className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-semibold tracking-tight text-white truncate">
                Smart Contact Map
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">Polynomial Hash Table</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Hash className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" aria-label="Main Navigation">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center rounded-lg px-3 py-2.5 text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && (
                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded tracking-wide uppercase font-mono ${
                        isActive
                          ? 'bg-indigo-500/30 text-indigo-300'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono hidden xl:inline">
                    {item.slideRef}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live Engine Status Mini Card */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-300">Live Hash Engine</span>
            </span>
            <span className="font-mono text-emerald-400">O(1)</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Contacts:</span>
              <span className="font-mono text-white font-medium">{contactCount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Load Factor (α):</span>
              <span
                className={`font-mono font-medium ${
                  loadFactor >= 0.75 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {loadFactor.toFixed(2)} / 0.75
              </span>
            </div>
            {/* Load bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  loadFactor >= 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (loadFactor / 0.75) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-300">Polynomial Hash Table</p>
              <p className="text-[10px] text-slate-400">p = 31 • Separate Chaining</p>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Free & Open
            </span>
          </div>
        ) : (
          <div className="text-center font-mono text-[10px] text-emerald-400">O(1)</div>
        )}
      </div>
    </aside>
  );
};
