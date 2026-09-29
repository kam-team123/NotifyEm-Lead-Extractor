import React, { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { HeatmapLeadFinder } from './components/map/HeatmapLeadFinder';
import { DailyListingsFeed } from './components/daily/DailyListingsFeed';
import { LeadsPipeline } from './components/pipeline/LeadsPipeline';
import { CampaignReviewer } from './components/campaigns/CampaignReviewer';
import { SalesforceCenter } from './components/salesforce/SalesforceCenter';
import { CollectionsManager } from './components/collections/CollectionsManager';

import { 
  RealEstateLead, 
  PropertyListing, 
  DatabaseCollection, 
  SalesforceConfig, 
  SalesforceSyncLog, 
  CampaignDraft,
  PipelineState,
  CampaignReviewStatus
} from './types';

import { 
  INITIAL_LEADS, 
  INITIAL_PROPERTY_LISTINGS, 
  INITIAL_COLLECTIONS, 
  INITIAL_SALESFORCE_CONFIG, 
  INITIAL_SYNC_LOGS, 
  INITIAL_CAMPAIGNS 
} from './data/mockData';

import { 
  syncLeadsToSalesforce, 
  syncListingsToSalesforce, 
  generateSalesforceId 
} from './services/salesforceService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'daily' | 'pipeline' | 'campaigns' | 'salesforce' | 'collections'>('map');

  // Application Data State
  const [leads, setLeads] = useState<RealEstateLead[]>(INITIAL_LEADS);
  const [properties, setProperties] = useState<PropertyListing[]>(INITIAL_PROPERTY_LISTINGS);
  const [collections, setCollections] = useState<DatabaseCollection[]>(INITIAL_COLLECTIONS);
  const [salesforceConfig, setSalesforceConfig] = useState<SalesforceConfig>(INITIAL_SALESFORCE_CONFIG);
  const [syncLogs, setSyncLogs] = useState<SalesforceSyncLog[]>(INITIAL_SYNC_LOGS);
  const [campaigns, setCampaigns] = useState<CampaignDraft[]>(INITIAL_CAMPAIGNS);

  // Status and feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Quick Notification Banner helper
  const showBanner = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Quick Salesforce Sync (from TopBar or Overview)
  const handleQuickSalesforceSync = async () => {
    setIsSyncing(true);
    const { syncedLeads, syncLog } = await syncLeadsToSalesforce(leads, salesforceConfig);
    setLeads(syncedLeads);
    setSyncLogs(prev => [syncLog, ...prev]);
    setSalesforceConfig(prev => ({
      ...prev,
      lastSyncTimestamp: new Date().toISOString(),
      totalSyncedLeads: syncedLeads.filter(l => l.salesforceSyncStatus === 'Synced').length
    }));
    setIsSyncing(false);
    showBanner(`Salesforce Sync Complete: ${syncLog.recordsSucceeded} leads synchronized with external ID validation.`);
  };

  // Sync Daily Listings to Salesforce
  const handleSyncListingsToSalesforce = async () => {
    setIsSyncing(true);
    const { syncedListings, syncLog } = await syncListingsToSalesforce(properties);
    setProperties(syncedListings);
    setSyncLogs(prev => [syncLog, ...prev]);
    setIsSyncing(false);
    showBanner(`Pushed ${syncedListings.length} MLS listings to Salesforce Property_Listing__c custom object.`);
  };

  // Single Lead Push to Salesforce
  const handleSyncSingleLead = async (lead: RealEstateLead) => {
    setIsSyncing(true);
    const sfId = lead.salesforceLeadId || generateSalesforceId('00Q');
    const updatedLead: RealEstateLead = {
      ...lead,
      salesforceSyncStatus: 'Synced',
      salesforceLeadId: sfId,
      lastSyncedAt: new Date().toISOString()
    };

    setLeads(prev => prev.map(l => l.id === lead.id ? updatedLead : l));

    const singleLog: SalesforceSyncLog = {
      id: `sync_log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      operation: 'Push Leads',
      status: 'SUCCESS',
      recordsProcessed: 1,
      recordsSucceeded: 1,
      recordsFailed: 0,
      salesforceIds: [sfId],
      message: `Pushed lead "${lead.firstName} ${lead.lastName}" to Salesforce Lead sObject (ID: ${sfId}).`,
      durationMs: 420
    };

    setSyncLogs(prev => [singleLog, ...prev]);
    setIsSyncing(false);
    showBanner(`Lead ${lead.firstName} ${lead.lastName} synced to Salesforce (${sfId})`);
  };

  // Single Property Push to Salesforce
  const handleSyncSingleProperty = (property: PropertyListing) => {
    const assetId = property.salesforceAssetId || generateSalesforceId('02i');
    setProperties(prev => prev.map(p => p.id === property.id ? { ...p, syncedToSalesforce: true, salesforceAssetId: assetId } : p));
    
    const log: SalesforceSyncLog = {
      id: `sync_log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      operation: 'Sync Daily Listings',
      status: 'SUCCESS',
      recordsProcessed: 1,
      recordsSucceeded: 1,
      recordsFailed: 0,
      salesforceIds: [assetId],
      message: `Synchronized MLS #${property.mlsId} "${property.title}" to Salesforce Property_Listing__c.`,
      durationMs: 380
    };
    setSyncLogs(prev => [log, ...prev]);
    showBanner(`Listing ${property.title} pushed to Salesforce (Asset: ${assetId})`);
  };

  // Add Lead
  const handleAddLead = (leadData: Partial<RealEstateLead>) => {
    const newLead: RealEstateLead = {
      id: `lead_${Date.now()}`,
      firstName: leadData.firstName || 'Prospect',
      lastName: leadData.lastName || 'Owner',
      email: leadData.email || 'lead@example.com',
      phone: leadData.phone || '(555) 000-0000',
      brokerageOrCompany: leadData.brokerageOrCompany || 'Independent',
      role: leadData.role || 'Property Owner',
      category: leadData.category || 'Residential Single-Family',
      street: leadData.street || '100 Main St',
      city: leadData.city || 'Austin',
      state: leadData.state || 'TX',
      postalCode: leadData.postalCode || '78701',
      latitude: leadData.latitude || 30.2672,
      longitude: leadData.longitude || -97.7431,
      pipelineState: leadData.pipelineState || 'New',
      leadSource: leadData.leadSource || 'Manual Intake',
      collectionId: leadData.collectionId,
      targetBudgetOrPrice: leadData.targetBudgetOrPrice || 800000,
      salesforceSyncStatus: 'Not Synced',
      notes: leadData.notes || '',
      matchScore: 85,
      createdAt: new Date().toISOString()
    };

    setLeads(prev => [newLead, ...prev]);
    showBanner(`Added new real estate lead: ${newLead.firstName} ${newLead.lastName} (${newLead.category})`);
  };

  // Update Lead Pipeline State
  const handleUpdateLeadState = (leadId: string, newState: PipelineState) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipelineState: newState } : l));
  };

  // Create Database Collection
  const handleCreateCollection = (name: string, description: string, state: string): string => {
    const newCol: DatabaseCollection = {
      id: `col_${Date.now()}`,
      name,
      description,
      leadCount: 0,
      targetStates: [state],
      colorTag: 'cyan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCollections(prev => [...prev, newCol]);
    showBanner(`Created database collection "${name}"`);
    return newCol.id;
  };

  // Campaign updates
  const handleUpdateCampaignStatus = (campaignId: string, status: CampaignReviewStatus, notes?: string) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status, approverNotes: notes } : c));
    showBanner(`Campaign marked as: ${status}`);
  };

  const handleSaveCampaignEdits = (campaignId: string, updatedDraft: Partial<CampaignDraft>) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...updatedDraft } : c));
    showBanner(`Draft edits saved.`);
  };

  const handleCreateNewDraft = (draft: CampaignDraft) => {
    setCampaigns(prev => [draft, ...prev]);
    showBanner(`Generated new campaign draft "${draft.title}". Review required before send.`);
  };

  // Daily Ingestion Simulation
  const handleSimulateDailyIngest = () => {
    setIsIngesting(true);
    setTimeout(() => {
      const freshArrivals: PropertyListing[] = [
        {
          id: `prop_nv_${Date.now()}`,
          mlsId: `GLVAR-${Math.floor(100000 + Math.random() * 900000)}`,
          title: 'The Ridges Modern Desert Villa',
          address: '4220 Sky Hawk Ln',
          city: 'Las Vegas',
          state: 'NV',
          postalCode: '89135',
          price: 1250000,
          beds: 4,
          baths: 4.5,
          squareFeet: 4100,
          propertyType: 'Single Family',
          daysOnMarket: 1,
          listingDate: '2026-09-29',
          status: 'New Today',
          photoUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          capRate: 6.9,
          estimatedRent: 8500,
          latitude: 36.1699,
          longitude: -115.1398,
          listingAgentName: 'Vance Sterling',
          listingAgentBrokerage: 'Berkshire Hathaway NV Properties',
          syncedToSalesforce: false,
          matchedLeadIds: [],
          description: 'Contemporary architectural compound in Summerlin. Pocket doors open to resort pool with fire features and red rock panoramic vistas.'
        },
        {
          id: `prop_oh_${Date.now()}`,
          mlsId: `CBRMLS-${Math.floor(100000 + Math.random() * 900000)}`,
          title: 'Historic German Village Brick Manor',
          address: '684 S 3rd St',
          city: 'Columbus',
          state: 'OH',
          postalCode: '43206',
          price: 520000,
          beds: 3,
          baths: 2.5,
          squareFeet: 2450,
          propertyType: 'Single Family',
          daysOnMarket: 1,
          listingDate: '2026-09-29',
          status: 'New Today',
          photoUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
          capRate: 7.4,
          estimatedRent: 3900,
          latitude: 39.9612,
          longitude: -82.9988,
          listingAgentName: 'Claire Kowalski',
          listingAgentBrokerage: 'Cutler Real Estate Downtown',
          syncedToSalesforce: false,
          matchedLeadIds: [],
          description: 'Fully restored Victorian-era brick residence with exposed beams, updated quartz kitchen, private brick courtyard, and detached carriage house.'
        },
        {
          id: `prop_az_${Date.now()}`,
          mlsId: `ARMLS-${Math.floor(100000 + Math.random() * 900000)}`,
          title: 'Scottsdale McDowell Mountain Compound',
          address: '10842 E Windrunner Dr',
          city: 'Scottsdale',
          state: 'AZ',
          postalCode: '85255',
          price: 1780000,
          beds: 5,
          baths: 5,
          squareFeet: 4890,
          propertyType: 'Single Family',
          daysOnMarket: 1,
          listingDate: '2026-09-29',
          status: 'New Today',
          photoUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          capRate: 6.1,
          estimatedRent: 11000,
          latitude: 33.6268,
          longitude: -111.8984,
          listingAgentName: 'Garrett O’Connor',
          listingAgentBrokerage: 'Russ Lyon Sotheby’s',
          syncedToSalesforce: false,
          matchedLeadIds: ['lead_009'],
          description: 'Custom Santa Barbara architecture with soaring ceilings, detached casita, negative-edge pool, and unobstructed mountain sunsets.'
        }
      ];

      setProperties(prev => [...freshArrivals, ...prev]);
      setIsIngesting(false);
      showBanner(`Daily MLS Ingestion Complete: Ingested new property listings across Nevada, Ohio, and Arizona!`);
    }, 1200);
  };

  const pendingReviewCount = campaigns.filter(c => c.status === 'Pending Approval').length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans">
      {/* Universal Top Bar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        salesforceConfig={salesforceConfig}
        onQuickSync={handleQuickSalesforceSync}
        isSyncing={isSyncing}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Floating System Notice Banner */}
      {bannerNotice && (
        <div className="fixed top-14 right-6 z-50 bg-neutral-950/95 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-md px-4 py-2.5 text-xs text-cyan-100 flex items-center gap-2 animate-fade-in backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#06b6d4]" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Viewport Router */}
      {activeTab === 'map' && (
        <HeatmapLeadFinder
          leads={leads}
          properties={properties}
          collections={collections}
          onAddLead={handleAddLead}
          onPushToSalesforce={handleSyncSingleLead}
          onCreateCollection={handleCreateCollection}
        />
      )}

      {activeTab === 'daily' && (
        <DailyListingsFeed
          properties={properties}
          leads={leads}
          onSyncPropertyToSalesforce={handleSyncSingleProperty}
          onJumpToMap={() => setActiveTab('map')}
          onDraftOutreachForProperty={() => setActiveTab('campaigns')}
          onSimulateDailyIngest={handleSimulateDailyIngest}
          isIngesting={isIngesting}
        />
      )}

      {activeTab === 'pipeline' && (
        <LeadsPipeline
          leads={leads}
          collections={collections}
          onUpdateLeadState={handleUpdateLeadState}
          onAddLead={handleAddLead}
          onSyncSingleLeadToSalesforce={handleSyncSingleLead}
          onSelectLeadForOutreach={() => setActiveTab('campaigns')}
        />
      )}

      {activeTab === 'campaigns' && (
        <CampaignReviewer
          campaigns={campaigns}
          leads={leads}
          properties={properties}
          onUpdateCampaignStatus={handleUpdateCampaignStatus}
          onSaveCampaignEdits={handleSaveCampaignEdits}
          onCreateNewDraft={handleCreateNewDraft}
        />
      )}

      {activeTab === 'salesforce' && (
        <SalesforceCenter
          config={salesforceConfig}
          syncLogs={syncLogs}
          leads={leads}
          properties={properties}
          onUpdateConfig={setSalesforceConfig}
          onTriggerLeadsSync={handleQuickSalesforceSync}
          onTriggerListingsSync={handleSyncListingsToSalesforce}
          isSyncing={isSyncing}
        />
      )}

      {activeTab === 'collections' && (
        <CollectionsManager
          collections={collections}
          leads={leads}
          onCreateCollection={(name, desc, st) => handleCreateCollection(name, desc, st)}
          onFilterByCollection={() => setActiveTab('pipeline')}
        />
      )}
    </div>
  );
}
