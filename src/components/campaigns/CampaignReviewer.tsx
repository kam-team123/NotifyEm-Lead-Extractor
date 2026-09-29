import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Edit3, 
  Eye, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Mail, 
  Building2, 
  Check, 
  X,
  Share2
} from 'lucide-react';
import { CampaignDraft, CampaignType, CampaignReviewStatus, RealEstateLead, PropertyListing } from '../../types';
import { generateAICampaignDraft } from '../../services/aiWriterService';

interface CampaignReviewerProps {
  campaigns: CampaignDraft[];
  leads: RealEstateLead[];
  properties: PropertyListing[];
  onUpdateCampaignStatus: (campaignId: string, status: CampaignReviewStatus, notes?: string) => void;
  onSaveCampaignEdits: (campaignId: string, updatedDraft: Partial<CampaignDraft>) => void;
  onCreateNewDraft: (draft: CampaignDraft) => void;
}

export const CampaignReviewer: React.FC<CampaignReviewerProps> = ({
  campaigns,
  leads,
  properties,
  onUpdateCampaignStatus,
  onSaveCampaignEdits,
  onCreateNewDraft
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeDraft, setActiveDraft] = useState<CampaignDraft | null>(campaigns[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [approverNotes, setApproverNotes] = useState('');
  
  // AI Writer Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genType, setGenType] = useState<CampaignType>('Monday Newsletter');
  const [genAudience, setGenAudience] = useState('Austin Metro Luxury Relocations');
  const [genContext, setGenContext] = useState('');
  const [genTone, setGenTone] = useState<'Professional & Authoritative' | 'Concise & High-Touch' | 'Investor-Focused' | 'Neighborly & Warm'>('Professional & Authoritative');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter(c => {
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    return true;
  });

  const handleSelectDraft = (draft: CampaignDraft) => {
    setActiveDraft(draft);
    setIsEditing(false);
    setEditedBody(draft.bodyContent);
    setEditedSubject(draft.subject);
    setApproverNotes(draft.approverNotes || '');
  };

  const handleStartEdit = () => {
    if (!activeDraft) return;
    setEditedBody(activeDraft.bodyContent);
    setEditedSubject(activeDraft.subject);
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    if (!activeDraft) return;
    onSaveCampaignEdits(activeDraft.id, {
      subject: editedSubject,
      bodyContent: editedBody
    });
    setActiveDraft({
      ...activeDraft,
      subject: editedSubject,
      bodyContent: editedBody
    });
    setIsEditing(false);
  };

  const handleApprove = () => {
    if (!activeDraft) return;
    onUpdateCampaignStatus(activeDraft.id, 'Approved', approverNotes || 'Approved by designated real estate broker.');
    setActiveDraft({ ...activeDraft, status: 'Approved', approverNotes: approverNotes || 'Approved' });
  };

  const handleRequestEdits = () => {
    if (!activeDraft) return;
    onUpdateCampaignStatus(activeDraft.id, 'Needs Edit', approverNotes || 'Edits requested before approval.');
    setActiveDraft({ ...activeDraft, status: 'Needs Edit', approverNotes: approverNotes || 'Edits requested' });
  };

  const handleReject = () => {
    if (!activeDraft) return;
    onUpdateCampaignStatus(activeDraft.id, 'Rejected', approverNotes || 'Campaign rejected.');
    setActiveDraft({ ...activeDraft, status: 'Rejected' });
  };

  const handleSendTest = () => {
    setTestSentMessage(`Test email dispatched to ${activeDraft?.testSendAddress || 'broker-internal@notifyem.com'}`);
    setTimeout(() => setTestSentMessage(null), 3500);
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const prop = properties.find(p => p.id === selectedPropertyId);

    const result = await generateAICampaignDraft({
      campaignType: genType,
      targetAudience: genAudience,
      focusContext: genContext,
      featuredPropertyTitle: prop?.title,
      featuredPropertyPrice: prop?.price,
      featuredCityState: prop ? `${prop.city}, ${prop.state}` : undefined,
      tone: genTone,
      includeComplianceFooter: true
    });

    setIsGenerating(false);

    const newCampaign: CampaignDraft = {
      id: `camp_${Date.now()}`,
      title: result.title,
      campaignType: genType,
      targetAudience: genAudience,
      subject: result.subject,
      bodyContent: result.bodyContent,
      status: 'Pending Approval', // Strictly Pending Approval per SOP page 7
      approverNotes: 'Freshly generated AI draft. Awaiting licensed agent verification.',
      testSendAddress: 'broker-internal@notifyem.com',
      recipientLeadIds: leads.slice(0, 3).map(l => l.id),
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
      createdAt: new Date().toISOString()
    };

    onCreateNewDraft(newCampaign);
    setActiveDraft(newCampaign);
    setEditedBody(newCampaign.bodyContent);
    setEditedSubject(newCampaign.subject);
    setIsGeneratorOpen(false);
  };

  // Variable preview replacement
  const getRenderedPreview = (text: string) => {
    return text
      .replace(/{{Lead\.FirstName}}/g, 'Marcus')
      .replace(/{{Lead\.City}}/g, 'Austin')
      .replace(/{{Agent\.Name}}/g, 'Alex Mercer');
  };

  return (
    <div className="flex-1 bg-neutral-950 flex flex-col xl:flex-row overflow-hidden">
      {/* Left Column: Campaigns Queue */}
      <aside className="w-full xl:w-[380px] border-r border-neutral-800 bg-neutral-900/80 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Campaign Review Queue</h1>
            <p className="text-xs text-neutral-400 mt-0.5">Human-in-the-loop review before sending</p>
          </div>
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Writer</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-3 border-b border-neutral-800 flex flex-wrap gap-1.5 text-xs">
          {['ALL', 'Pending Approval', 'Needs Edit', 'Approved'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-blue-950 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Queue List */}
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          {filteredCampaigns.map(camp => {
            const isSelected = activeDraft?.id === camp.id;

            return (
              <div
                key={camp.id}
                onClick={() => handleSelectDraft(camp)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-neutral-900 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-neutral-950/60 border-neutral-800/80 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-neutral-100 line-clamp-1">
                    {camp.title}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                    camp.status === 'Approved' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]' :
                    camp.status === 'Pending Approval' ? 'bg-blue-950 text-cyan-300 border border-cyan-500/40 shadow-[0_0_6px_rgba(6,182,212,0.25)]' :
                    camp.status === 'Needs Edit' ? 'bg-blue-950/50 text-blue-300 border border-blue-800' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                  Subj: {camp.subject}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-2">
                  <span>{camp.campaignType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{camp.targetAudience}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Review Viewport */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5">
        {activeDraft ? (
          <>
            {/* Header & Status Indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-white">{activeDraft.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    activeDraft.status === 'Approved' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]' :
                    activeDraft.status === 'Pending Approval' ? 'bg-blue-950 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]' :
                    'bg-neutral-800 text-neutral-300'
                  }`}>
                    {activeDraft.status}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-3">
                  <span>Audience: <strong className="text-neutral-200">{activeDraft.targetAudience}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Type: <strong className="text-neutral-200">{activeDraft.campaignType}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendTest}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Send Internal Test</span>
                </button>

                {isEditing ? (
                  <button
                    onClick={handleSaveEdits}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded transition-all flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Draft</span>
                  </button>
                )}
              </div>
            </div>

            {testSentMessage && (
              <div className="p-3 bg-blue-950/80 border border-cyan-500/50 text-cyan-300 text-xs rounded flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{testSentMessage}</span>
              </div>
            )}

            {/* Subject and Content Area */}
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Email Subject Line
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                ) : (
                  <div className="text-sm font-medium text-neutral-100 p-2.5 bg-neutral-950 rounded border border-neutral-800 font-mono">
                    {activeDraft.subject}
                  </div>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Outreach Body Copy & Merge Fields
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Tokens: <code className="text-cyan-400 font-mono">{'{{Lead.FirstName}}'}</code>, <code className="text-cyan-400 font-mono">{'{{Lead.City}}'}</code>
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={12}
                    className="w-full p-3 bg-neutral-950 border border-neutral-700 rounded text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-400"
                  />
                ) : (
                  <div className="p-4 bg-neutral-950 rounded border border-neutral-800 text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {getRenderedPreview(activeDraft.bodyContent)}
                  </div>
                )}
              </div>
            </div>

            {/* SOP Human Review Verification Gate (SOP Section 03 & 04) */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Broker Compliance & Approval Controls</span>
              </div>
              <p className="text-xs text-neutral-400">
                Per Operating SOP, an authorized human reviewer must verify factual accuracy, licensed credentials, and suppression before release.
              </p>

              <div>
                <label className="block text-[11px] text-neutral-300 font-medium mb-1">
                  Approver Operational Notes / Sign-Off Comments:
                </label>
                <input
                  type="text"
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                  placeholder="e.g. Verified MLS pricing and fair housing disclaimer. Approved."
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-neutral-500">
                  Target Recipient Count: <span className="text-neutral-300 font-mono font-bold">{activeDraft.recipientLeadIds.length} leads</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReject}
                    className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleRequestEdits}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Request Edits
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Campaign</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-neutral-500 text-sm">
            Select a draft from the queue or click AI Writer to generate a new real estate outreach campaign.
          </div>
        )}
      </main>

      {/* AI Writer Modal Generator */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">AI Real Estate Campaign Writer</h2>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Campaign Type (SOP Schedule)</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value as CampaignType)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                >
                  <option value="Monday Newsletter">Monday Newsletter (Market Trends & Mortgage Updates)</option>
                  <option value="Wednesday Market Education">Wednesday Education (1031 Exchange / Equity Strategy)</option>
                  <option value="Friday Property Highlights">Friday Property Highlights (Exclusive MLS Drops)</option>
                  <option value="Direct Agent Outreach">Direct Agent Outreach (Co-Broker / Referral Synergies)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Target Audience Segment</label>
                <input
                  type="text"
                  value={genAudience}
                  onChange={(e) => setGenAudience(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                  placeholder="e.g. Austin Luxury Buyers ($1.5M+)"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Featured Property from Daily Listings (Optional)</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (${p.price.toLocaleString()} in {p.city}, {p.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Tone & Voice</label>
                <select
                  value={genTone}
                  onChange={(e) => setGenTone(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white"
                >
                  <option value="Professional & Authoritative">Professional & Authoritative (Institutional Advisory)</option>
                  <option value="Concise & High-Touch">Concise & High-Touch (Executive Level)</option>
                  <option value="Investor-Focused">Investor-Focused (Cap Rates & Cashflow)</option>
                  <option value="Neighborly & Warm">Neighborly & Warm (Community Realtor)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Custom Context or Focus Points</label>
                <textarea
                  value={genContext}
                  onChange={(e) => setGenContext(e.target.value)}
                  rows={3}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-white placeholder:text-neutral-500"
                  placeholder="e.g. Highlight jumbo mortgage dip in Travis County, or emphasize 1031 replacement deadline."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Synthesizing Draft...' : 'Generate Draft (Leaves Pending Approval)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
