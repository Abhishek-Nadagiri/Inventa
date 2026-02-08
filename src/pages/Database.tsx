import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ShieldSearchIcon } from '../components/ShieldSearchIcon';
import { 
  Database, 
  Users, 
  FileText, 
  Key, 
  RefreshCw, 
  Trash2, 
  Download,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface StorageData {
  users: any[];
  documents: any[];
  sessions: any[];
}

export function DatabasePage() {
  const [data, setData] = useState<StorageData>({ users: [], documents: [], sessions: [] });
  const [activeTab, setActiveTab] = useState<'users' | 'documents' | 'sessions'>('users');
  const [showSensitive, setShowSensitive] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = () => {
    const users = JSON.parse(localStorage.getItem('inventa_users') || '[]');
    const documents = JSON.parse(localStorage.getItem('inventa_documents') || '[]');
    const sessions = JSON.parse(localStorage.getItem('inventa_sessions') || '[]');
    setData({ users, documents, sessions });
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearTable = (table: string) => {
    if (confirm(`Are you sure you want to clear all ${table}? This cannot be undone.`)) {
      localStorage.setItem(`inventa_${table}`, '[]');
      loadData();
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data? This will log you out and cannot be undone.')) {
      localStorage.removeItem('inventa_users');
      localStorage.removeItem('inventa_documents');
      localStorage.removeItem('inventa_sessions');
      loadData();
      window.location.href = '/';
    }
  };

  const exportData = () => {
    const exportObj = {
      exportDate: new Date().toISOString(),
      application: 'Inventa',
      data: data
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventa-database-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskSensitive = (value: string, show: boolean) => {
    if (show || !value) return value;
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, count: data.users.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: data.documents.length },
    { id: 'sessions', label: 'Sessions', icon: Key, count: data.sessions.length },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
                <Database className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Database Viewer</h1>
                <p className="text-neutral-400">Inspect Inventa localStorage database</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSensitive ? 'Hide' : 'Show'} Sensitive
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-6 rounded-xl border cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-orange-500' : 'text-neutral-400'}`} />
                    <span className={`font-medium ${activeTab === tab.id ? 'text-white' : 'text-neutral-300'}`}>
                      {tab.label}
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${activeTab === tab.id ? 'text-orange-500' : 'text-neutral-400'}`}>
                    {tab.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white capitalize">{activeTab} Table</h2>
              <button
                onClick={() => clearTable(activeTab)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear Table
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {activeTab === 'users' && (
                <table className="w-full">
                  <thead className="bg-neutral-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Password Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Public Key</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {data.users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                          No users registered yet
                        </td>
                      </tr>
                    ) : (
                      data.users.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-800/30">
                          <td className="px-4 py-3 text-sm text-neutral-300 font-mono">{user.id?.substring(0, 8)}...</td>
                          <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-neutral-300">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-neutral-400 font-mono">{maskSensitive(user.passwordHash, showSensitive)}</td>
                          <td className="px-4 py-3 text-sm text-neutral-400 font-mono">{maskSensitive(user.publicKey, showSensitive)}</td>
                          <td className="px-4 py-3 text-sm text-neutral-400">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'documents' && (
                <table className="w-full">
                  <thead className="bg-neutral-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Filename</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Owner ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {data.documents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                          No documents uploaded yet
                        </td>
                      </tr>
                    ) : (
                      data.documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-neutral-800/30">
                          <td className="px-4 py-3 text-sm text-neutral-300 font-mono">{doc.id?.substring(0, 8)}...</td>
                          <td className="px-4 py-3 text-sm text-white">{doc.filename}</td>
                          <td className="px-4 py-3 text-sm text-orange-400 font-mono">{doc.hash?.substring(0, 16)}...</td>
                          <td className="px-4 py-3 text-sm text-neutral-400 font-mono">{doc.ownerId?.substring(0, 8)}...</td>
                          <td className="px-4 py-3 text-sm text-neutral-400">{(doc.size / 1024).toFixed(2)} KB</td>
                          <td className="px-4 py-3 text-sm text-neutral-400">{formatDate(doc.timestamp)}</td>
                          <td className="px-4 py-3 text-sm text-green-400 font-mono">{maskSensitive(doc.signature, showSensitive)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'sessions' && (
                <table className="w-full">
                  <thead className="bg-neutral-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Token</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">User ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Expires</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {data.sessions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                          No active sessions
                        </td>
                      </tr>
                    ) : (
                      data.sessions.map((session) => {
                        const isExpired = new Date(session.expiresAt) < new Date();
                        return (
                          <tr key={session.token} className="hover:bg-neutral-800/30">
                            <td className="px-4 py-3 text-sm text-neutral-300 font-mono">{maskSensitive(session.token, showSensitive)}</td>
                            <td className="px-4 py-3 text-sm text-neutral-400 font-mono">{session.userId?.substring(0, 8)}...</td>
                            <td className="px-4 py-3 text-sm text-neutral-400">{formatDate(session.createdAt)}</td>
                            <td className="px-4 py-3 text-sm text-neutral-400">{formatDate(session.expiresAt)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                isExpired 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-green-500/20 text-green-400'
                              }`}>
                                {isExpired ? 'Expired' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Raw JSON View */}
          <div className="mt-8 bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Raw JSON Data</h2>
            </div>
            <pre className="p-4 text-sm text-neutral-300 overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(data[activeTab], null, 2)}
            </pre>
          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldSearchIcon size={24} variant="mono" />
              <div>
                <h3 className="text-white font-medium mb-1">About Inventa Database</h3>
                <p className="text-neutral-400 text-sm">
                  Inventa uses browser localStorage to simulate a TinyDB-style document database. 
                  Data persists across browser sessions but is stored locally on your device. 
                  In a production environment, this would be replaced with a proper backend database.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs rounded">inventa_users</span>
                  <span className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs rounded">inventa_documents</span>
                  <span className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs rounded">inventa_sessions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
