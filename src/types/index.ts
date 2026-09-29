export type LeadCategory = 
  | 'Residential Single-Family'
  | 'Multi-Family 2-4 Units'
  | 'Luxury Estate'
  | 'Commercial & Retail'
  | 'Distressed / Pre-Foreclosure'
  | 'FSBO (For Sale By Owner)'
  | 'Investor Buyer';

export type PipelineState = 
  | 'New'
  | 'Researched'
  | 'Contacted'
  | 'Engaged'
  | 'Referral Received'
  | 'Active Partner'
  | 'Dormant'
  | 'Do Not Contact';

export type SalesforceSyncStatus = 'Synced' | 'Pending' | 'Error' | 'Not Synced';

export interface RealEstateLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brokerageOrCompany: string;
  role: 'Property Owner' | 'Listing Agent' | 'Broker' | 'Real Estate Investor' | 'Referral Partner' | 'Homebuyer';
  category: LeadCategory;
  street: string;
  city: string;
  state: string; // e.g. 'TX', 'CA', 'FL', 'NY'
  postalCode: string;
  county?: string;
  latitude: number;
  longitude: number;
  pipelineState: PipelineState;
  leadSource: 'Lead Finder Discovery' | 'Address Geosearch' | 'Daily MLS Feed' | 'Manual Intake' | 'Salesforce Import';
  collectionId?: string;
  targetBudgetOrPrice?: number;
  salesforceSyncStatus: SalesforceSyncStatus;
  salesforceLeadId?: string; // e.g. 00Q5g00000aBc12EAA
  lastSyncedAt?: string;
  notes: string;
  matchScore?: number; // 0-100 match with today's listings
  createdAt: string;
}

export type PropertyListingStatus = 'New Today' | 'Active' | 'Price Reduced' | 'Pending';

export interface PropertyListing {
  id: string;
  mlsId: string;
  title: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  price: number;
  previousPrice?: number;
  beds: number;
  baths: number;
  squareFeet: number;
  lotSizeAcres?: number;
  propertyType: 'Single Family' | 'Condo / Penthouse' | 'Multi-Family' | 'Townhome' | 'Commercial';
  daysOnMarket: number;
  listingDate: string; // YYYY-MM-DD
  status: PropertyListingStatus;
  photoUrl: string;
  capRate?: number; // % estimated return for investors
  estimatedRent?: number;
  latitude: number;
  longitude: number;
  listingAgentName: string;
  listingAgentBrokerage: string;
  syncedToSalesforce: boolean;
  salesforceAssetId?: string;
  matchedLeadIds: string[]; // leads who match this listing
  description: string;
}

export interface DatabaseCollection {
  id: string;
  name: string;
  description: string;
  leadCount: number;
  targetStates: string[];
  colorTag: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesforceConfig {
  isConnected: boolean;
  instanceUrl: string;
  orgId: string;
  clientId: string;
  environment: 'Production' | 'Sandbox';
  apiVersion: string;
  syncMode: 'Realtime Webhook' | 'Daily Batch (08:00 AM EST)' | 'Manual';
  lastSyncTimestamp: string | null;
  totalSyncedLeads: number;
  autoSyncDailyListings: boolean;
  enforceSuppression: boolean;
}

export interface SalesforceSyncLog {
  id: string;
  timestamp: string;
  operation: 'Push Leads' | 'Sync Daily Listings' | 'Pull Inbound Contacts' | 'Nightly Batch';
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  salesforceIds: string[];
  message: string;
  durationMs: number;
}

export type CampaignType = 
  | 'Monday Newsletter'
  | 'Wednesday Market Education'
  | 'Friday Property Highlights'
  | 'Direct Agent Outreach';

export type CampaignReviewStatus = 'Pending Approval' | 'Needs Edit' | 'Approved' | 'Delivered' | 'Rejected';

export interface CampaignDraft {
  id: string;
  title: string;
  campaignType: CampaignType;
  targetAudience: string;
  subject: string;
  bodyContent: string;
  status: CampaignReviewStatus;
  approverNotes?: string;
  testSendAddress: string;
  recipientLeadIds: string[];
  scheduledDate: string;
  createdAt: string;
  sentAt?: string;
  salesforceCampaignId?: string;
}

export interface USStateSummary {
  code: string;
  name: string;
  activeListingsCount: number;
  leadCount: number;
  avgPrice: number;
  hotnessScore: number; // 0-100
  coordinates: [number, number];
}
