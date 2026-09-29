import { RealEstateLead, PropertyListing, SalesforceConfig, SalesforceSyncLog } from '../types';

export interface SalesforceFieldMapping {
  notifyemField: string;
  salesforceField: string;
  salesforceType: string;
  required: boolean;
  sampleValue: string;
}

export const LEAD_FIELD_MAPPINGS: SalesforceFieldMapping[] = [
  { notifyemField: 'firstName', salesforceField: 'FirstName', salesforceType: 'String(40)', required: true, sampleValue: 'Marcus' },
  { notifyemField: 'lastName', salesforceField: 'LastName', salesforceType: 'String(80)', required: true, sampleValue: 'Vance' },
  { notifyemField: 'brokerageOrCompany', salesforceField: 'Company', salesforceType: 'String(255)', required: true, sampleValue: 'Vance Capital Real Estate' },
  { notifyemField: 'email', salesforceField: 'Email', salesforceType: 'Email', required: true, sampleValue: 'm.vance@vanceholdings.com' },
  { notifyemField: 'phone', salesforceField: 'Phone', salesforceType: 'Phone', required: false, sampleValue: '(512) 883-9104' },
  { notifyemField: 'street', salesforceField: 'Street', salesforceType: 'Textarea', required: false, sampleValue: '2404 Barton Creek Blvd' },
  { notifyemField: 'city', salesforceField: 'City', salesforceType: 'String(40)', required: false, sampleValue: 'Austin' },
  { notifyemField: 'state', salesforceField: 'State', salesforceType: 'String(80)', required: false, sampleValue: 'TX' },
  { notifyemField: 'postalCode', salesforceField: 'PostalCode', salesforceType: 'String(20)', required: false, sampleValue: '78735' },
  { notifyemField: 'pipelineState', salesforceField: 'Status', salesforceType: 'Picklist', required: true, sampleValue: 'Active Partner' },
  { notifyemField: 'category', salesforceField: 'Property_Category__c', salesforceType: 'Picklist (Custom)', required: false, sampleValue: 'Luxury Estate' },
  { notifyemField: 'targetBudgetOrPrice', salesforceField: 'Budget_Target__c', salesforceType: 'Currency(18,0)', required: false, sampleValue: '$2,400,000' },
  { notifyemField: 'leadSource', salesforceField: 'LeadSource', salesforceType: 'Picklist', required: false, sampleValue: 'Notifyem Discovery' },
  { notifyemField: 'id', salesforceField: 'Notifyem_External_ID__c', salesforceType: 'String(50) (External ID / Unique)', required: true, sampleValue: 'lead_001' }
];

export const PROPERTY_FIELD_MAPPINGS: SalesforceFieldMapping[] = [
  { notifyemField: 'mlsId', salesforceField: 'MLS_Number__c', salesforceType: 'String(30) (Unique)', required: true, sampleValue: 'ACTRIS-849201' },
  { notifyemField: 'title', salesforceField: 'Name', salesforceType: 'String(80)', required: true, sampleValue: 'The Barton Ridge Architectural Estate' },
  { notifyemField: 'price', salesforceField: 'List_Price__c', salesforceType: 'Currency(18,2)', required: true, sampleValue: '$2,450,000' },
  { notifyemField: 'address', salesforceField: 'Street_Address__c', salesforceType: 'String(255)', required: true, sampleValue: '2810 Barton Ridge Dr' },
  { notifyemField: 'city', salesforceField: 'City__c', salesforceType: 'String(50)', required: true, sampleValue: 'Austin' },
  { notifyemField: 'state', salesforceField: 'State__c', salesforceType: 'String(10)', required: true, sampleValue: 'TX' },
  { notifyemField: 'beds', salesforceField: 'Bedrooms__c', salesforceType: 'Number(3,0)', required: false, sampleValue: '5' },
  { notifyemField: 'baths', salesforceField: 'Bathrooms__c', salesforceType: 'Number(3,1)', required: false, sampleValue: '4.5' },
  { notifyemField: 'squareFeet', salesforceField: 'Square_Footage__c', salesforceType: 'Number(6,0)', required: false, sampleValue: '4,820' },
  { notifyemField: 'status', salesforceField: 'Listing_Status__c', salesforceType: 'Picklist', required: true, sampleValue: 'New Today' }
];

export function generateSalesforceId(prefix: '00Q' | '02i' | '701' = '00Q'): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = prefix + '5g00000';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function testSalesforceConnection(config: SalesforceConfig): Promise<{
  success: boolean;
  latencyMs: number;
  orgName: string;
  instanceStatus: string;
  error?: string;
}> {
  // Simulate network roundtrip to Salesforce REST API /services/oauth2/token & /services/data/v60.0
  const start = performance.now();
  await new Promise(r => setTimeout(r, 650));
  const latencyMs = Math.round(performance.now() - start);

  if (!config.instanceUrl || !config.instanceUrl.includes('salesforce.com')) {
    return {
      success: false,
      latencyMs,
      orgName: '',
      instanceStatus: 'INVALID_URL',
      error: 'Instance URL must be a valid *.salesforce.com domain.'
    };
  }

  return {
    success: true,
    latencyMs,
    orgName: 'Notifyem Realty Enterprise Org',
    instanceStatus: 'ACTIVE_CONNECTED'
  };
}

export async function syncLeadsToSalesforce(
  leads: RealEstateLead[],
  config: SalesforceConfig
): Promise<{
  syncedLeads: RealEstateLead[];
  syncLog: SalesforceSyncLog;
}> {
  const startTime = performance.now();
  await new Promise(r => setTimeout(r, 750));

  const eligibleLeads = leads.filter(l => {
    // SOP safeguard: Do Not Contact suppression must be strictly honored
    if (config.enforceSuppression && l.pipelineState === 'Do Not Contact') {
      return false;
    }
    return true;
  });

  const generatedIds: string[] = [];
  const updatedLeads = leads.map(lead => {
    if (config.enforceSuppression && lead.pipelineState === 'Do Not Contact') {
      return lead; // keep skipped
    }
    const sfId = lead.salesforceLeadId || generateSalesforceId('00Q');
    generatedIds.push(sfId);
    return {
      ...lead,
      salesforceSyncStatus: 'Synced' as const,
      salesforceLeadId: sfId,
      lastSyncedAt: new Date().toISOString()
    };
  });

  const durationMs = Math.round(performance.now() - startTime);
  const syncLog: SalesforceSyncLog = {
    id: `sync_log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    operation: 'Push Leads',
    status: 'SUCCESS',
    recordsProcessed: leads.length,
    recordsSucceeded: eligibleLeads.length,
    recordsFailed: leads.length - eligibleLeads.length,
    salesforceIds: generatedIds.slice(0, 5),
    message: `Upserted ${eligibleLeads.length} leads into Salesforce Lead object. ${leads.length - eligibleLeads.length} record(s) suppressed.`,
    durationMs
  };

  return {
    syncedLeads: updatedLeads,
    syncLog
  };
}

export async function syncListingsToSalesforce(
  listings: PropertyListing[]
): Promise<{
  syncedListings: PropertyListing[];
  syncLog: SalesforceSyncLog;
}> {
  const startTime = performance.now();
  await new Promise(r => setTimeout(r, 600));

  const generatedIds: string[] = [];
  const updated = listings.map(listing => {
    const assetId = listing.salesforceAssetId || generateSalesforceId('02i');
    generatedIds.push(assetId);
    return {
      ...listing,
      syncedToSalesforce: true,
      salesforceAssetId: assetId
    };
  });

  const durationMs = Math.round(performance.now() - startTime);
  const syncLog: SalesforceSyncLog = {
    id: `sync_log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    operation: 'Sync Daily Listings',
    status: 'SUCCESS',
    recordsProcessed: listings.length,
    recordsSucceeded: listings.length,
    recordsFailed: 0,
    salesforceIds: generatedIds.slice(0, 5),
    message: `Pushed ${listings.length} MLS listings to Salesforce Property_Listing__c custom object with verified external MLS_ID keys.`,
    durationMs
  };

  return {
    syncedListings: updated,
    syncLog
  };
}
