/**
 * Database Page
 * Admin view for database analytics
 */

import React, { useState, useEffect } from 'react';
import { 
  Database as DbIcon,
  Users,
  FileText,
  LogIn,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  Cloud,
  HardDrive
} from 'lucide-react';
import { 
  getStats, 
  getAllUsers, 
  getAllDocuments, 
  getLoginHistory,
  exportAllData,
  StatsResult
} from '../services/api';
import { User, Document, StoredLoginHistory } from '../types';

type TabType = 'overview' | 'users' | 'documents' | 'logins';

const Database: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loginHistory, setLoginHistory] = useState<StoredLoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, docsData, historyData] = await Promise.all([
        getStats(),
        getAllUsers(),
        getAllDocuments(),
        getLoginHistory()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setDocuments(docsData);
      setLoginHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Export data
  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventa-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DbIcon },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'logins', label: 'Login History', icon: LogIn }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 sm:pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <DbIcon className="w-8 h-8 text-[#86862d]" />
              Database
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {stats?.storageMode === 'supabase' ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <Cloud className="w-4 h-4" />
                  Supabase Cloud
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                  <HardDrive className="w-4 h-4" />
                  Local Storage
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#86862d] hover:bg-[#9a9a34] text-white rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#86862d] text-white'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#86862d] animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-neutral-400">Users</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#86862d]/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#86862d]" />
                    </div>
                    <span className="text-neutral-400">Documents</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalDocuments}</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-neutral-400">Successful</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.successfulLogins}</p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-neutral-400">Failed</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.failedLogins}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Username</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-800/50">
                          <td className="px-4 py-3 text-white">@{user.username}</td>
                          <td className="px-4 py-3 text-neutral-400">{user.email}</td>
                          <td className="px-4 py-3 text-neutral-500 text-sm">
                            {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Filename</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-neutral-800/50">
                          <td className="px-4 py-3 text-white">{doc.filename}</td>
                          <td className="px-4 py-3 text-neutral-400">{doc.metadata?.ownerName || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-[#86862d]/20 text-[#86862d] rounded text-xs capitalize">
                              {doc.metadata?.documentType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-500 text-sm">{formatDate(doc.timestamp)}</td>
                        </tr>
                      ))}
                      {documents.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                            No documents found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Login History Tab */}
            {activeTab === 'logins' && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {loginHistory.map((login) => (
                        <tr key={login.id} className="hover:bg-neutral-800/50">
                          <td className="px-4 py-3">
                            {login.status === 'success' ? (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                Success
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-400">
                                <XCircle className="w-4 h-4" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white">{login.userName || 'N/A'}</td>
                          <td className="px-4 py-3 text-neutral-400">{login.userEmail}</td>
                          <td className="px-4 py-3 text-neutral-500 text-sm">{formatDate(login.loginTime)}</td>
                          <td className="px-4 py-3 text-neutral-500 text-sm">{login.failReason || '-'}</td>
                        </tr>
                      ))}
                      {loginHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                            No login history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Database;
