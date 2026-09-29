import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Folder, 
  Users, 
  MapPin, 
  Clock, 
  ArrowRight,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { DatabaseCollection, RealEstateLead } from '../../types';
import { US_STATES } from '../../data/mockData';

interface CollectionsManagerProps {
  collections: DatabaseCollection[];
  leads: RealEstateLead[];
  onCreateCollection: (name: string, description: string, state: string) => void;
  onFilterByCollection: (collectionId: string) => void;
}

export const CollectionsManager: React.FC<CollectionsManagerProps> = ({
  collections,
  leads,
  onCreateCollection,
  onFilterByCollection
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('TX');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateCollection(name.trim(), description.trim(), state);
    setName('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 bg-neutral-950 overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Database Collections</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Segmented CRM collections used to drive hyper-targeted lead searches, geographic farming, and investor outreach.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Collection</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg max-w-xl space-y-3 text-xs">
          <h3 className="font-semibold text-white">New Lead Database Collection</h3>
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Collection Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Phoenix Metro Value-Add Buyers"
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Primary State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white focus:outline-none focus:border-cyan-400"
            >
              {US_STATES.map(st => (
                <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Description & Acquisition Criteria</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Acquisition criteria, price band, target profile..."
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              Save Collection
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map(col => {
          const colLeads = leads.filter(l => l.collectionId === col.id);

          return (
            <div
              key={col.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-md bg-blue-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                      <Folder className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{col.name}</h3>
                      <div className="text-[11px] text-cyan-300 font-mono">
                        {col.targetStates.join(', ')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-cyan-300">
                    {colLeads.length} Leads
                  </span>
                </div>

                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-500 font-mono">
                  Updated {new Date(col.updatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onFilterByCollection(col.id)}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>View in Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
