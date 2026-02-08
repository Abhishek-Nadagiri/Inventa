/**
 * Inventa - User Dashboard
 * Displays user's registered documents and quick actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserDocuments, deleteDocument, generateProof } from '../services/api';
import type { Document, OwnershipProof } from '../types';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Eye,
  Download,
  Flame,
  Clock,
  Hash,
  AlertCircle,
  Loader2,
  FileCheck,
  X
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProof, setSelectedProof] = useState<OwnershipProof | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const result = getUserDocuments();
    if (result.success && result.data) {
      setDocuments(result.data.documents);
    } else {
      setError(result.error || 'Failed to load documents');
    }
    setIsLoading(false);
  };

  const handleDelete = (documentId: string) => {
    const result = deleteDocument(documentId);
    if (result.success) {
      setDocuments(docs => docs.filter(d => d.id !== documentId));
      setDeleteConfirm(null);
    } else {
      setError(result.error || 'Failed to delete document');
    }
  };

  const handleGenerateProof = async (documentId: string) => {
    setIsGeneratingProof(documentId);
    try {
      const result = await generateProof(documentId);
      if (result.success && result.data) {
        setSelectedProof(result.data.proof);
      } else {
        setError(result.error || 'Failed to generate proof');
      }
    } catch {
      setError('Failed to generate proof');
    } finally {
      setIsGeneratingProof(null);
    }
  };

  const downloadProof = () => {
    if (!selectedProof) return;
    
    const proofText = `
╔══════════════════════════════════════════════════════════════════╗
║                    INVENTA - OWNERSHIP PROOF                      ║
║                     Where Ownership Begins                        ║
╚══════════════════════════════════════════════════════════════════╝

DOCUMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document ID:    ${selectedProof.documentId}
Document Hash:  ${selectedProof.documentHash}

OWNERSHIP DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Owner:          ${selectedProof.ownerUsername}
Registration:   ${new Date(selectedProof.timestamp).toLocaleString()}
Proof Generated: ${new Date(selectedProof.proofGenerated).toLocaleString()}

CRYPTOGRAPHIC VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Owner Public Key (ECC P-256):
${selectedProof.ownerPublicKey}

Digital Signature (ECDSA):
${selectedProof.signature}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This proof was cryptographically signed using the owner's private key.
Verify authenticity by checking the signature against the public key.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

    const blob = new Blob([proofText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ownership-proof-${selectedProof.documentId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-neutral-400">
              Welcome back, <span className="text-orange-500">{user?.username}</span>
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all no-underline"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </Link>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition-all no-underline border border-neutral-700"
            >
              <Search className="w-4 h-4" />
              Verify
            </Link>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Total Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Protected Files</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <FileCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Total Size</p>
                <p className="text-2xl font-bold text-white">
                  {formatFileSize(documents.reduce((sum, d) => sum + d.fileSize, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <h2 className="text-xl font-semibold text-white">Your Documents</h2>
            <p className="text-neutral-400 text-sm mt-1">
              All your registered intellectual property documents
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-800 rounded-full mb-4">
                <FileText className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
              <p className="text-neutral-400 mb-4">
                Upload your first document to start protecting your intellectual property.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors no-underline"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {documents.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-neutral-900/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* File info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-neutral-800 rounded-xl">
                        <FileText className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{doc.filename}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(doc.timestamp)}
                          </span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Hash className="w-4 h-4 text-neutral-500" />
                          <code className="text-xs text-neutral-500 font-mono truncate max-w-xs">
                            {doc.originalHash}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateProof(doc.id)}
                        disabled={isGeneratingProof === doc.id}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isGeneratingProof === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">View Proof</span>
                      </button>
                      {deleteConfirm === doc.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Ownership Proof</h2>
                  <p className="text-neutral-400 text-sm">Cryptographically signed verification</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-neutral-950 rounded-xl p-4">
                <label className="text-neutral-400 text-sm block mb-1">Document Hash (SHA-256)</label>
                <code className="text-orange-500 text-sm font-mono break-all">
                  {selectedProof.documentHash}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-950 rounded-xl p-4">
                  <label className="text-neutral-400 text-sm block mb-1">Owner</label>
                  <p className="text-white font-medium">{selectedProof.ownerUsername}</p>
                </div>
                <div className="bg-neutral-950 rounded-xl p-4">
                  <label className="text-neutral-400 text-sm block mb-1">Registered</label>
                  <p className="text-white font-medium">
                    {new Date(selectedProof.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950 rounded-xl p-4">
                <label className="text-neutral-400 text-sm block mb-1">Owner Public Key (ECC P-256)</label>
                <code className="text-amber-500 text-xs font-mono break-all">
                  {selectedProof.ownerPublicKey}
                </code>
              </div>

              <div className="bg-neutral-950 rounded-xl p-4">
                <label className="text-neutral-400 text-sm block mb-1">Digital Signature (ECDSA)</label>
                <code className="text-red-400 text-xs font-mono break-all">
                  {selectedProof.signature}
                </code>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={downloadProof}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
