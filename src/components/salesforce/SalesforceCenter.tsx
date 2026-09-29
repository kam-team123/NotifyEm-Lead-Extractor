import React, { useState } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Database, 
  ExternalLink, 
  Key, 
  Settings, 
  Clock, 
  ArrowRight, 
  Lock, 
  Download,
  Share2,
  FileSpreadsheet
} from 'lucide-react';
import { SalesforceConfig, SalesforceSyncLog, RealEstateLead, PropertyListing } from '../../types';
import { LEAD_FIELD_MAPPINGS, PROPERTY_FIELD_MAPPINGS, testSalesforceConnection } from '../../services/salesforceService';

interface SalesforceCenterProps {
  config: SalesforceConfig;
  syncLogs: SalesforceSyncLog[];
  leads: RealEstateLead[];
  properties: PropertyListing[];
  onUpdateConfig: (newConfig: SalesforceConfig) => void;
  onTriggerLeadsSync: () => void;
  onTriggerListingsSync: () => void;
  isSyncing: boolean;
}

export const SalesforceCenter: React.FC<SalesforceCenterProps> = ({
  config,
  syncLogs,
  leads,
  properties,
  onUpdateConfig,
  onTriggerLeadsSync,
  onTriggerListingsSync,
  isSyncing
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mapping' | 'logs' | 'settings'>('overview');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);

  // Settings form state
  const [formConfig, setFormConfig] = useState<SalesforceConfig>(config);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const syncedLeadCount = leads.filter(l => l.salesforceSyncStatus === 'Synced').length;
  const pendingLeadCount = leads.filter(l => l.salesforceSyncStatus !== 'Synced').length;
  const syncedPropertyCount = properties.filter(p => p.syncedToSalesforce).length;

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    const res = await testSalesforceConnection(config);
    setIsTestingConnection(false);

    if (res.success) {
      setTestResult({
        success: true,
        latencyMs: res.latencyMs,
        message: `Successfully connected to Salesforce REST API (${res.latencyMs}ms). Org: ${res.orgName}. Access token valid.`
      });
    } else {
      setTestResult({
        success: false,
        latencyMs: res.latencyMs,
        message: res.error || 'Connection failed. Please check Instance URL or OAuth token.'
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formConfig);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const handleExportCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Operation', 'Status', 'Processed', 'Succeeded', 'Failed', 'Duration (ms)', 'Message'];
    const rows = syncLogs.map(l => [
      l.id,
      l.timestamp,
      l.operation,
      l.status,
      l.recordsProcessed,
      l.recordsSucceeded,
      l.recordsFailed,
      l.durationMs,
      `"${l.message.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `salesforce_sync_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-neutral-950 overflow-y-auto p-6 space-y-6">
      {/* Header and Live Connection Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Salesforce CRM Integration</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
              <span>Salesforce Not Connected</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Salesforce is not connected. Configure a real OAuth/API integration before syncing records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-200 rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Shield className={`w-3.5 h-3.5 text-emerald-400 ${isTestingConnection ? 'animate-spin' : ''}`} />
            <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <button
            onClick={onTriggerLeadsSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Push All Leads Now'}</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          testResult.success 
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-800 text-rose-200'
        }`}>
          {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-1 text-xs font-medium text-neutral-400">
        {[
          { id: 'overview', label: 'Sync Overview & Actions' },
          { id: 'mapping', label: 'Object & Field Mappings' },
          { id: 'logs', label: 'Audit Trail & Sync Logs' },
          { id: 'settings', label: 'Connected App Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-t cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'text-white font-semibold bg-neutral-900 border-t-2 border-sky-500'
                : 'hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="text-xs text-neutral-400 font-medium">Salesforce Leads Synced</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                {syncedLeadCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Standard Lead sObject</div>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="text-xs text-neutral-400 font-medium">Pending Lead Sync</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
                {pendingLeadCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Ready for upsert</div>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="text-xs text-neutral-400 font-medium">MLS Properties Synced</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-400 mt-1">
                {syncedPropertyCount} / {properties.length}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Custom Property_Listing__c</div>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="text-xs text-neutral-400 font-medium">Last Sync Timestamp</div>
              <div className="text-sm font-mono text-neutral-200 mt-2 truncate">
                {config.lastSyncTimestamp ? new Date(config.lastSyncTimestamp).toLocaleTimeString() : 'Never'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">No connection established</div>
            </div>
          </div>

          {/* Sync Trigger Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Push Qualified Leads to Salesforce</span>
                </h3>
                <span className="text-xs font-mono text-cyan-300">{pendingLeadCount} Unsynced</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Lead sync is unavailable until a live Salesforce OAuth/API integration is configured.
              </p>
              <button
                onClick={onTriggerLeadsSync}
                disabled={isSyncing}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Executing Bulk Sync...' : 'Sync Leads Now'}</span>
              </button>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <span>Sync Daily Property Listings</span>
                </h3>
                <span className="text-xs font-mono text-neutral-400">{properties.length - syncedPropertyCount} Unsynced</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Listing sync is unavailable until a live Salesforce OAuth/API integration and target object are configured.
              </p>
              <button
                onClick={onTriggerListingsSync}
                disabled={isSyncing}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Daily MLS to Salesforce</span>
              </button>
            </div>
          </div>

          {/* Connected App Details Box */}
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-lg space-y-2 text-xs">
            <div className="font-semibold text-neutral-200">Salesforce Connection Settings:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-neutral-400 text-[11px]">
              <div>Instance: <span className="text-sky-300">{config.instanceUrl}</span></div>
              <div>Org ID: <span className="text-neutral-300">{config.orgId}</span></div>
              <div>API Version: <span className="text-neutral-300">{config.apiVersion}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Field Mapping */}
      {activeTab === 'mapping' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Standard Lead Field Mappings</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Proposed field mappings. Confirm custom fields and picklist values in your Salesforce org before use.
            </p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-semibold">
                    <th className="p-3">Notifyem Field</th>
                    <th className="p-3">Salesforce Field API Name</th>
                    <th className="p-3">Salesforce Data Type</th>
                    <th className="p-3">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {LEAD_FIELD_MAPPINGS.map(m => (
                    <tr key={m.notifyemField} className="hover:bg-neutral-800/30">
                      <td className="p-3 font-medium text-white">{m.notifyemField}</td>
                      <td className="p-3 font-mono text-sky-400">{m.salesforceField}</td>
                      <td className="p-3 text-neutral-400">{m.salesforceType}</td>
                      <td className="p-3">{m.required ? <span className="text-cyan-400 font-bold">Yes</span> : <span className="text-neutral-500">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Property Listing Field Mappings</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Daily property updates map to custom object <code>Property_Listing__c</code> for inventory tracking.
            </p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-semibold">
                    <th className="p-3">Notifyem Property Field</th>
                    <th className="p-3">Salesforce Field API Name</th>
                    <th className="p-3">Salesforce Data Type</th>
                    <th className="p-3">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {PROPERTY_FIELD_MAPPINGS.map(m => (
                    <tr key={m.notifyemField} className="hover:bg-neutral-800/30">
                      <td className="p-3 font-medium text-white">{m.notifyemField}</td>
                      <td className="p-3 font-mono text-cyan-300">{m.salesforceField}</td>
                      <td className="p-3 text-neutral-400">{m.salesforceType}</td>
                      <td className="p-3">{m.required ? <span className="text-cyan-400 font-bold">Yes</span> : <span className="text-neutral-500">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Salesforce Sync Audit Trail</h3>
              <p className="text-xs text-neutral-400">Sync events recorded by this app appear here.</p>
            </div>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-semibold">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Operation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Processed</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Generated Salesforce IDs</th>
                  <th className="p-3">Log Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {syncLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-800/30">
                    <td className="p-3 text-neutral-300 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-semibold text-white">{log.operation}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        log.status === 'WARNING' ? 'bg-blue-950 text-cyan-300 border border-cyan-700/80 shadow-[0_0_6px_rgba(6,182,212,0.2)]' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono tabular-nums text-neutral-300">
                      {log.recordsSucceeded} / {log.recordsProcessed}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-neutral-400">
                      {log.durationMs}ms
                    </td>
                    <td className="p-3 font-mono text-[10px] text-sky-400 max-w-xs truncate">
                      {log.salesforceIds.join(', ') || 'N/A'}
                    </td>
                    <td className="p-3 text-neutral-300 max-w-sm truncate text-[11px]">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-sm font-semibold text-white">Salesforce Connected App Configuration</h3>
            {settingsSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Configuration Saved</span>
              </span>
            )}
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Salesforce Instance URL *</label>
            <input
              type="text"
              value={formConfig.instanceUrl}
              onChange={(e) => setFormConfig({ ...formConfig, instanceUrl: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white font-mono"
              placeholder="https://your-org.my.salesforce.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Connected App Client ID (Consumer Key)</label>
              <input
                type="text"
                value={formConfig.clientId}
                onChange={(e) => setFormConfig({ ...formConfig, clientId: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Salesforce Org ID</label>
              <input
                type="text"
                value={formConfig.orgId}
                onChange={(e) => setFormConfig({ ...formConfig, orgId: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">API Version</label>
              <select
                value={formConfig.apiVersion}
                onChange={(e) => setFormConfig({ ...formConfig, apiVersion: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
              >
                <option value="v60.0">v60.0 (Spring '26 / Current)</option>
                <option value="v59.0">v59.0 (Winter '26)</option>
                <option value="v58.0">v58.0 (Summer '25)</option>
              </select>
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Environment</label>
              <select
                value={formConfig.environment}
                onChange={(e) => setFormConfig({ ...formConfig, environment: e.target.value as any })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
              >
                <option value="Production">Production (login.salesforce.com)</option>
                <option value="Sandbox">Sandbox (test.salesforce.com)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formConfig.enforceSuppression}
                onChange={(e) => setFormConfig({ ...formConfig, enforceSuppression: e.target.checked })}
                className="rounded bg-neutral-950 border-neutral-700 text-sky-500"
              />
              <span className="text-neutral-200">
                Enforce Do Not Contact / Unsubscribe suppression before outbound Salesforce sync (SOP requirement)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formConfig.autoSyncDailyListings}
                onChange={(e) => setFormConfig({ ...formConfig, autoSyncDailyListings: e.target.checked })}
                className="rounded bg-neutral-950 border-neutral-700 text-sky-500"
              />
              <span className="text-neutral-200">
                Automatically push daily MLS property updates to Salesforce at 08:00 AM EST
              </span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded cursor-pointer transition-colors"
            >
              Save Salesforce Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
