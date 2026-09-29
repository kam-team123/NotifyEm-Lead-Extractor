import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  Share2, 
  Filter,
  Check
} from 'lucide-react';
import { PropertyListing, RealEstateLead } from '../../types';
import { US_STATES } from '../../data/mockData';

interface DailyListingsFeedProps {
  properties: PropertyListing[];
  leads: RealEstateLead[];
  onSyncPropertyToSalesforce: (property: PropertyListing) => void;
  onJumpToMap: (lat: number, lng: number, address: string) => void;
  onDraftOutreachForProperty: (property: PropertyListing) => void;
  onSimulateDailyIngest: () => void;
  isIngesting: boolean;
}

export const DailyListingsFeed: React.FC<DailyListingsFeedProps> = ({
  properties,
  leads,
  onSyncPropertyToSalesforce,
  onJumpToMap,
  onDraftOutreachForProperty,
  onSimulateDailyIngest,
  isIngesting
}) => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [onlyMatched, setOnlyMatched] = useState<boolean>(false);
  const [notifiedPropertyId, setNotifiedPropertyId] = useState<string | null>(null);

  const states = Array.from(new Set(properties.map(p => p.state))).sort();
  const propertyTypes = Array.from(new Set(properties.map(p => p.propertyType)));

  const filteredProperties = properties.filter(prop => {
    if (selectedState !== 'ALL' && prop.state !== selectedState) return false;
    if (selectedType !== 'ALL' && prop.propertyType !== selectedType) return false;
    if (onlyMatched && prop.matchedLeadIds.length === 0) return false;
    return true;
  });

  const handleNotifyLead = (prop: PropertyListing, leadName: string) => {
    setNotifiedPropertyId(prop.id);
    setTimeout(() => setNotifiedPropertyId(null), 3000);
  };

  return (
    <div className="flex-1 bg-neutral-950 overflow-y-auto p-6 space-y-6">
      {/* Header and Ingestion Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Daily Property Listings</h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-blue-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
              ● Today's Drops Active
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time feed of new MLS additions across all 50 states, matched with your active buyer leads and ready for direct Salesforce push.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSimulateDailyIngest}
            disabled={isIngesting}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-100 rounded transition-colors cursor-pointer disabled:opacity-60 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isIngesting ? 'animate-spin' : ''}`} />
            <span>{isIngesting ? 'Ingesting Nationwide MLS...' : 'Trigger Daily MLS Ingest'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Segment Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>State:</span>
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-neutral-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All 50 US States ({properties.length} active in feed)</option>
            {US_STATES.map(st => {
              const count = properties.filter(p => p.state === st.code).length;
              return (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code}) {count > 0 ? `· ${count} in feed` : `· Statewide (${st.activeListingsCount})`}
                </option>
              );
            })}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 ml-2">
            <span>Property Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-neutral-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Property Types</option>
            {propertyTypes.map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs text-neutral-300 ml-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyMatched}
              onChange={(e) => setOnlyMatched(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
            />
            <span>Only Matched to Leads</span>
          </label>
        </div>

        <div className="text-xs text-neutral-400 font-mono tabular-nums">
          Showing <span className="text-cyan-300 font-semibold">{filteredProperties.length}</span> listings
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(property => {
          const matchedLead = leads.find(l => property.matchedLeadIds.includes(l.id));

          return (
            <article 
              key={property.id} 
              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col hover:border-cyan-500/40 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              {/* Media Container with Fallback Scrim */}
              <div className="relative aspect-[16/9] w-full bg-neutral-800 overflow-hidden">
                <img
                  src={property.photoUrl}
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Safe CSS fallback per Zero-Broken-Image Policy
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                {/* Status and Days on Market overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-950/85 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                    {property.status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-950/85 backdrop-blur-md text-neutral-300 border border-neutral-800">
                    MLS #{property.mlsId}
                  </span>
                </div>

                {property.capRate && (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-950/90 backdrop-blur-md text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                    {property.capRate}% Cap Rate
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-xl font-bold font-mono tabular-nums text-white">
                      ${property.price.toLocaleString()}
                    </div>
                    {property.previousPrice && (
                      <div className="text-xs font-mono tabular-nums text-neutral-500 line-through">
                        ${property.previousPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-neutral-100 mt-1 line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{property.address}, {property.city}, {property.state} {property.postalCode}</span>
                  </div>

                  {/* Property Specs */}
                  <div className="flex items-center gap-3.5 text-xs text-neutral-300 font-mono tabular-nums mt-3 pt-3 border-t border-neutral-800/80">
                    {property.beds > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-blue-400" />
                        <span>{property.beds} Beds</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-blue-400" />
                      <span>{property.baths} Baths</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{property.squareFeet.toLocaleString()} sqft</span>
                    </span>
                  </div>

                  {/* Matched Lead Notice if applicable */}
                  {matchedLead && (
                    <div className="mt-3 p-2 bg-blue-950/40 rounded border border-cyan-500/40 text-xs shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                      <div className="flex items-center justify-between text-cyan-300 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Matched Buyer: {matchedLead.firstName} {matchedLead.lastName}</span>
                        </span>
                        <span className="font-mono text-cyan-300">{matchedLead.matchScore}%</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                        Budget: ${(matchedLead.targetBudgetOrPrice || 0).toLocaleString()} · {matchedLead.brokerageOrCompany}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSyncPropertyToSalesforce(property)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        property.syncedToSalesforce
                          ? 'bg-neutral-950 border-neutral-800 text-neutral-400'
                          : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{property.syncedToSalesforce ? 'Synced to SF' : 'Push to Salesforce'}</span>
                    </button>

                    <button
                      onClick={() => onDraftOutreachForProperty(property)}
                      className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      title="Draft AI Email Campaign for this property"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft Pitch</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <button
                      onClick={() => onJumpToMap(property.latitude, property.longitude, `${property.city}, ${property.state}`)}
                      className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>View on Heatmap</span>
                    </button>

                    {matchedLead && (
                      <button
                        onClick={() => handleNotifyLead(property, matchedLead.firstName)}
                        className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                      >
                        {notifiedPropertyId === property.id ? (
                          <>
                            <Check className="w-3 h-3 text-cyan-400" />
                            <span className="text-cyan-400 font-bold">Notice Dispatched!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Notify {matchedLead.firstName}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
