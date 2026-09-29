import React from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ChevronRight
} from 'lucide-react';
import { SalesforceConfig } from '../../types';

interface TopBarProps {
  activeTab: 'map' | 'daily' | 'pipeline' | 'campaigns' | 'salesforce' | 'collections';
  onSelectTab: (tab: 'map' | 'daily' | 'pipeline' | 'campaigns' | 'salesforce' | 'collections') => void;
  salesforceConfig: SalesforceConfig;
  onQuickSync: () => void;
  isSyncing: boolean;
  pendingReviewCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  salesforceConfig,
  onQuickSync,
  isSyncing,
  pendingReviewCount
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-neutral-950 border-b border-neutral-800 shrink-0">
      {/* Zone 1: Single text element wordmark in display style */}
      <div className="flex items-center gap-3">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); onSelectTab('map'); }}
          className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Building2 className="w-4 h-4" />
          </span>
          <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">Notifyem</span>
        </a>
      </div>

      {/* Zone 2: 5-6 clean text navigation links with subtle hover underlines */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-400">
        <button
          onClick={() => onSelectTab('map')}
          className={`hover:text-white transition-colors relative py-1 cursor-pointer ${
            activeTab === 'map' ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500' : ''
          }`}
        >
          Lead Finder & Heatmap
        </button>
        <button
          onClick={() => onSelectTab('daily')}
          className={`hover:text-white transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'daily' ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500' : ''
          }`}
        >
          <span>Daily MLS Updates</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>
        <button
          onClick={() => onSelectTab('pipeline')}
          className={`hover:text-white transition-colors relative py-1 cursor-pointer ${
            activeTab === 'pipeline' ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500' : ''
          }`}
        >
          Leads & Pipeline
        </button>
        <button
          onClick={() => onSelectTab('campaigns')}
          className={`hover:text-white transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'campaigns' ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500' : ''
          }`}
        >
          <span>AI Campaigns</span>
          {pendingReviewCount > 0 && (
            <span className="text-[11px] font-mono tabular-nums text-cyan-400">({pendingReviewCount} review)</span>
          )}
        </button>
        <button
          onClick={() => onSelectTab('salesforce')}
          className={`hover:text-white transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'salesforce' ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500' : ''
          }`}
        >
          <span>Salesforce Sync</span>
          <span className="text-[11px] font-mono tabular-nums text-blue-400">● Live</span>
        </button>
        <button
          onClick={() => onSelectTab('collections')}
          className={`hover:text-white transition-colors relative py-1 cursor-pointer ${
            activeTab === 'collections' ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500' : ''
          }`}
        >
          Collections
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onQuickSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
          title="Direct two-way sync with Salesforce"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Salesforce...' : 'Sync Salesforce'}</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="w-7 h-7 rounded-full bg-blue-950 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            AM
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-neutral-200 leading-none">Alex Mercer</div>
            <div className="text-[11px] text-neutral-500 leading-tight mt-0.5">Austin Brokerage #849</div>
          </div>
        </div>
      </div>
    </header>
  );
};
