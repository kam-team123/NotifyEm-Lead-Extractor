import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Share2
} from 'lucide-react';
import { RealEstateLead, PipelineState, LeadCategory, DatabaseCollection } from '../../types';
import { US_STATES } from '../../data/mockData';

interface LeadsPipelineProps {
  leads: RealEstateLead[];
  collections: DatabaseCollection[];
  onUpdateLeadState: (leadId: string, newState: PipelineState) => void;
  onAddLead: (lead: Partial<RealEstateLead>) => void;
  onSyncSingleLeadToSalesforce: (lead: RealEstateLead) => void;
  onSelectLeadForOutreach: (lead: RealEstateLead) => void;
}

const PIPELINE_COLUMNS: PipelineState[] = [
  'New',
  'Researched',
  'Contacted',
  'Engaged',
  'Referral Received',
  'Active Partner'
];

export const LeadsPipeline: React.FC<LeadsPipelineProps> = ({
  leads,
  collections,
  onUpdateLeadState,
  onAddLead,
  onSyncSingleLeadToSalesforce,
  onSelectLeadForOutreach
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add lead form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    brokerageOrCompany: '',
    role: 'Real Estate Investor' as const,
    category: 'Residential Single-Family' as LeadCategory,
    street: '',
    city: '',
    state: 'TX',
    postalCode: '',
    targetBudgetOrPrice: 850000,
    collectionId: collections[0]?.id || '',
    notes: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  const filteredLeads = leads.filter(lead => {
    if (selectedState !== 'ALL' && lead.state !== selectedState) return false;
    if (selectedCategory !== 'ALL' && lead.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(q);
      const matchCompany = lead.brokerageOrCompany.toLowerCase().includes(q);
      const matchCity = lead.city.toLowerCase().includes(q);
      const matchEmail = lead.email.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchCity && !matchEmail) return false;
    }
    return true;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.brokerageOrCompany.trim()) {
      setFormError('First Name, Last Name, Email, and Brokerage/Company are required.');
      return;
    }

    // Duplicate check per SOP page 8
    const duplicate = leads.find(l => l.email.toLowerCase() === formData.email.toLowerCase());
    if (duplicate) {
      setFormError(`Duplicate contact detected: Lead with email ${formData.email} already exists in ${duplicate.pipelineState} state.`);
      return;
    }

    onAddLead({
      ...formData,
      pipelineState: 'New',
      leadSource: 'Manual Intake',
      salesforceSyncStatus: 'Not Synced',
      latitude: 30.2672,
      longitude: -97.7431
    });

    setIsAddModalOpen(false);
    setFormError(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      brokerageOrCompany: '',
      role: 'Real Estate Investor',
      category: 'Residential Single-Family',
      street: '',
      city: '',
      state: 'TX',
      postalCode: '',
      targetBudgetOrPrice: 850000,
      collectionId: collections[0]?.id || '',
      notes: ''
    });
  };

  const getCollectionName = (id?: string) => {
    if (!id) return null;
    return collections.find(c => c.id === id)?.name || null;
  };

  return (
    <div className="flex-1 bg-neutral-950 overflow-y-auto p-6 flex flex-col space-y-5">
      {/* Header and Add Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Leads & Qualification Pipeline</h1>
          <p className="text-xs text-neutral-400 mt-1">
            5-Stage qualification progression from initial discovery to active partner, synced directly with Salesforce Leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                viewMode === 'kanban' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pipeline Stages
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Real Estate Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, email, brokerage..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-neutral-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All 50 US States</option>
            {US_STATES.map(st => (
              <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-neutral-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Residential Single-Family">Residential Single-Family</option>
            <option value="Multi-Family 2-4 Units">Multi-Family 2-4 Units</option>
            <option value="Luxury Estate">Luxury Estate</option>
            <option value="Commercial & Retail">Commercial & Retail</option>
            <option value="Distressed / Pre-Foreclosure">Distressed / Pre-Foreclosure</option>
            <option value="FSBO (For Sale By Owner)">FSBO (For Sale By Owner)</option>
          </select>
        </div>

        <div className="text-xs text-neutral-400 font-mono tabular-nums">
          Total Leads: <span className="text-cyan-300 font-semibold">{filteredLeads.length}</span>
        </div>
      </div>

      {/* Main Viewport: Kanban Columns */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.pipelineState === stage);

            return (
              <div 
                key={stage}
                className="w-72 shrink-0 bg-neutral-900/70 border border-neutral-800 rounded-lg flex flex-col max-h-[calc(100vh-270px)]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                  <div className="text-xs font-semibold text-neutral-200">
                    {stage}
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                  {stageLeads.map(lead => {
                    const colName = getCollectionName(lead.collectionId);

                    return (
                      <div
                        key={lead.id}
                        className="p-3 bg-neutral-950 border border-neutral-800 rounded-md hover:border-neutral-700 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {lead.brokerageOrCompany}
                            </div>
                          </div>
                          {lead.targetBudgetOrPrice && (
                            <div className="text-[11px] font-mono tabular-nums text-cyan-300 font-semibold shrink-0">
                              ${(lead.targetBudgetOrPrice / 1000).toFixed(0)}k
                            </div>
                          )}
                        </div>

                        {/* Location and Category */}
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{lead.city}, {lead.state}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-cyan-300 font-medium truncate">{lead.category}</span>
                        </div>

                        {/* Collection Tag if present */}
                        {colName && (
                          <div className="text-[10px] text-neutral-400 truncate">
                            Collection: <span className="text-cyan-200/90">{colName}</span>
                          </div>
                        )}

                        {/* Salesforce Sync & Id */}
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                          {lead.salesforceLeadId ? (
                            <span className="text-blue-400 font-mono text-[10px] flex items-center gap-1">
                              <span>SF: {lead.salesforceLeadId.slice(0, 8)}...</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => onSyncSingleLeadToSalesforce(lead)}
                              className="text-neutral-400 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Share2 className="w-3 h-3 text-blue-400" />
                              <span>Push to SF</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectLeadForOutreach(lead)}
                            className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>AI Pitch</span>
                          </button>
                        </div>

                        {/* Advance Pipeline Stage Action */}
                        <div className="pt-1.5 flex items-center justify-between text-[10px] text-neutral-500">
                          <span>Move stage:</span>
                          <select
                            value={lead.pipelineState}
                            onChange={(e) => onUpdateLeadState(lead.id, e.target.value as PipelineState)}
                            className="bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] text-neutral-300 cursor-pointer"
                          >
                            <option value="New">New</option>
                            <option value="Researched">Researched</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Engaged">Engaged</option>
                            <option value="Referral Received">Referral Received</option>
                            <option value="Active Partner">Active Partner</option>
                            <option value="Dormant">Dormant</option>
                            <option value="Do Not Contact">Do Not Contact (Suppressed)</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-6 text-neutral-600 text-xs">
                      No leads in {stage}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-semibold bg-neutral-950/60">
                <th className="p-3">Name / Contact</th>
                <th className="p-3">Brokerage / Company</th>
                <th className="p-3">Location</th>
                <th className="p-3">Category</th>
                <th className="p-3">Target Budget</th>
                <th className="p-3">Pipeline Stage</th>
                <th className="p-3">Salesforce Sync</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-white">{lead.firstName} {lead.lastName}</div>
                    <div className="text-neutral-400 text-[11px]">{lead.email} · {lead.phone}</div>
                  </td>
                  <td className="p-3 text-neutral-300">
                    <div>{lead.brokerageOrCompany}</div>
                    <div className="text-neutral-500 text-[11px]">{lead.role}</div>
                  </td>
                  <td className="p-3 text-neutral-300">
                    {lead.city}, {lead.state}
                  </td>
                  <td className="p-3 text-cyan-300 font-medium">
                    {lead.category}
                  </td>
                  <td className="p-3 font-mono tabular-nums text-cyan-300 font-semibold">
                    ${(lead.targetBudgetOrPrice || 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <select
                      value={lead.pipelineState}
                      onChange={(e) => onUpdateLeadState(lead.id, e.target.value as PipelineState)}
                      className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Researched">Researched</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Engaged">Engaged</option>
                      <option value="Referral Received">Referral Received</option>
                      <option value="Active Partner">Active Partner</option>
                      <option value="Dormant">Dormant</option>
                      <option value="Do Not Contact">Do Not Contact</option>
                    </select>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    {lead.salesforceLeadId ? (
                      <span className="text-cyan-400 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>{lead.salesforceLeadId}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-500">Not Synced</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => onSelectLeadForOutreach(lead)}
                      className="px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded text-xs transition-colors cursor-pointer"
                    >
                      AI Draft
                    </button>
                    {!lead.salesforceLeadId && (
                      <button
                        onClick={() => onSyncSingleLeadToSalesforce(lead)}
                        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 rounded text-xs transition-colors cursor-pointer"
                      >
                        Push SF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead Modal (SOP Page 6 Section B) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Add Referral or Partner Lead</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mx-4 mt-3 p-2.5 bg-rose-950/80 border border-rose-800 rounded text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                    placeholder="e.g. Rachel"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                    placeholder="e.g. Miller"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Work Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                    placeholder="r.miller@realty.com"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                    placeholder="(555) 234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Brokerage / Company *</label>
                  <input
                    type="text"
                    value={formData.brokerageOrCompany}
                    onChange={(e) => setFormData({ ...formData, brokerageOrCompany: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                    placeholder="e.g. Compass Premier"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Lead Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                  >
                    <option value="Residential Single-Family">Residential Single-Family</option>
                    <option value="Multi-Family 2-4 Units">Multi-Family 2-4 Units</option>
                    <option value="Luxury Estate">Luxury Estate</option>
                    <option value="Commercial & Retail">Commercial & Retail</option>
                    <option value="Distressed / Pre-Foreclosure">Distressed / Pre-Foreclosure</option>
                    <option value="FSBO (For Sale By Owner)">FSBO (For Sale By Owner)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-neutral-300 font-medium mb-1">Business Street</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                    placeholder="1200 Main St"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                  >
                    {US_STATES.map(st => (
                      <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Database Collection</label>
                <select
                  value={formData.collectionId}
                  onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                >
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Notes (Non-sensitive operational details only)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white placeholder:text-neutral-500"
                  placeholder="e.g. Met at regional broker luncheon. Specializes in luxury listings."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
