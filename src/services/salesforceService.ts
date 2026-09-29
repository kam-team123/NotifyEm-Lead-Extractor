import { SalesforceConfig } from '../types';

export interface SalesforceFieldMapping {
  notifyemField: string;
  salesforceField: string;
  salesforceType: string;
  required: boolean;
}

export const LEAD_FIELD_MAPPINGS: SalesforceFieldMapping[] = [
  { notifyemField: 'firstName', salesforceField: 'FirstName', salesforceType: 'String(40)', required: true },
  { notifyemField: 'lastName', salesforceField: 'LastName', salesforceType: 'String(80)', required: true },
  { notifyemField: 'brokerageOrCompany', salesforceField: 'Company', salesforceType: 'String(255)', required: true },
  { notifyemField: 'email', salesforceField: 'Email', salesforceType: 'Email', required: true },
  { notifyemField: 'phone', salesforceField: 'Phone', salesforceType: 'Phone', required: false },
  { notifyemField: 'street', salesforceField: 'Street', salesforceType: 'Textarea', required: false },
  { notifyemField: 'city', salesforceField: 'City', salesforceType: 'String(40)', required: false },
  { notifyemField: 'state', salesforceField: 'State', salesforceType: 'String(80)', required: false },
  { notifyemField: 'postalCode', salesforceField: 'PostalCode', salesforceType: 'String(20)', required: false },
  { notifyemField: 'pipelineState', salesforceField: 'Status', salesforceType: 'Picklist', required: true },
  { notifyemField: 'category', salesforceField: 'Property_Category__c', salesforceType: 'Picklist (Custom)', required: false },
  { notifyemField: 'targetBudgetOrPrice', salesforceField: 'Budget_Target__c', salesforceType: 'Currency(18,0)', required: false },
  { notifyemField: 'leadSource', salesforceField: 'LeadSource', salesforceType: 'Picklist', required: false },
  { notifyemField: 'id', salesforceField: 'Notifyem_External_ID__c', salesforceType: 'String(50) (External ID / Unique)', required: true }
];

export const PROPERTY_FIELD_MAPPINGS: SalesforceFieldMapping[] = [
  { notifyemField: 'mlsId', salesforceField: 'MLS_Number__c', salesforceType: 'String(30) (Unique)', required: true },
  { notifyemField: 'title', salesforceField: 'Name', salesforceType: 'String(80)', required: true },
  { notifyemField: 'price', salesforceField: 'List_Price__c', salesforceType: 'Currency(18,2)', required: true },
  { notifyemField: 'address', salesforceField: 'Street_Address__c', salesforceType: 'String(255)', required: true },
  { notifyemField: 'city', salesforceField: 'City__c', salesforceType: 'String(50)', required: true },
  { notifyemField: 'state', salesforceField: 'State__c', salesforceType: 'String(10)', required: true },
  { notifyemField: 'beds', salesforceField: 'Bedrooms__c', salesforceType: 'Number(3,0)', required: false },
  { notifyemField: 'baths', salesforceField: 'Bathrooms__c', salesforceType: 'Number(3,1)', required: false },
  { notifyemField: 'squareFeet', salesforceField: 'Square_Footage__c', salesforceType: 'Number(6,0)', required: false },
  { notifyemField: 'status', salesforceField: 'Listing_Status__c', salesforceType: 'Picklist', required: true }
];

export async function testSalesforceConnection(config: SalesforceConfig): Promise<{
  success: boolean;
  latencyMs: number;
  orgName: string;
  instanceStatus: string;
  error?: string;
}> {
  return {
    success: false,
    latencyMs: 0,
    orgName: '',
    instanceStatus: 'NOT_CONFIGURED',
    error: 'A live Salesforce OAuth/API integration is not configured.'
  };
}
