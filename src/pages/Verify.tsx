/**
 * Inventa - Document Verification Page
 * Verify document ownership by file upload or hash entry
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { verifyDocument } from '../services/api';
import { generateSHA256Hash } from '../services/crypto';
import type { VerificationResult } from '../types';
import {
  Search,
  Upload,
  Hash,
  FileText,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Key,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

type VerifyMethod = 'file' | 'hash';

export function Verify() {
  const [method, setMethod] = useState<VerifyMethod>('file');
  const [file, setFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [computedHash, setComputedHash] = useState('');

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError('');
    setResult(null);
    
    try {
      const hash = await generateSHA256Hash(selectedFile);
      setComputedHash(hash);
    } catch {
      setComputedHash('');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    setFile(droppedFile);
    setError('');
    setResult(null);
    
    try {
      const hash = await generateSHA256Hash(droppedFile);
      setComputedHash(hash);
    } catch {
      setComputedHash('');
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleVerify = async (e?: FormEvent) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setIsVerifying(true);

    try {
      let verifyResult;
      
      if (method === 'file' && file) {
        verifyResult = await verifyDocument({ file });
      } else if (method === 'hash' && hashInput) {
        verifyResult = await verifyDocument({ hash: hashInput });
      } else {
        throw new Error('Please provide a file or hash to verify');
      }

      if (verifyResult.success && verifyResult.data) {
        setResult(verifyResult.data);
      } else {
        throw new Error(verifyResult.error || 'Verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setFile(null);
    setHashInput('');
    setResult(null);
    setError('');
    setComputedHash('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl mb-4">
            <Search className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Ownership</h1>
          <p className="text-neutral-400">
            Check if a document has been registered and view its ownership details
          </p>
        </div>

        {/* Verification Method Selector */}
        {!result && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
            {/* Method Tabs */}
            <div className="flex gap-2 p-1 bg-neutral-950 rounded-xl mb-8">
              <button
                onClick={() => setMethod('file')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                  method === 'file'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-white bg-neutral-800 hover:bg-neutral-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setMethod('hash')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                  method === 'hash'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-white bg-neutral-800 hover:bg-neutral-700'
                }`}
              >
                <Hash className="w-4 h-4" />
                Enter Hash
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* File Upload Method */}
            {method === 'file' && (
              <>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    file
                      ? 'border-orange-500/50 bg-orange-500/5'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-xl">
                        <FileText className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{file.name}</h3>
                        <p className="text-neutral-400 text-sm mt-1">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {computedHash && (
                        <div className="bg-neutral-950 rounded-lg p-3 max-w-md mx-auto">
                          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                            <Hash className="w-3 h-3" />
                            Computed SHA-256 Hash
                          </div>
                          <code className="text-amber-500 text-xs font-mono break-all">
                            {computedHash}
                          </code>
                        </div>
                      )}
                      <button
                        onClick={resetVerification}
                        className="text-neutral-400 hover:text-white text-sm"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-800 rounded-xl mb-4">
                        <Upload className="w-6 h-6 text-neutral-400" />
                      </div>
                      <h3 className="text-white font-medium mb-2">
                        Drop file here to verify
                      </h3>
                      <p className="text-neutral-400 text-sm mb-4">or click to browse</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg cursor-pointer transition-colors">
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        Browse Files
                      </label>
                    </>
                  )}
                </div>

                {file && (
                  <button
                    onClick={() => handleVerify()}
                    disabled={isVerifying}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Verify Document
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Hash Entry Method */}
            {method === 'hash' && (
              <form onSubmit={handleVerify}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Document Hash (SHA-256)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      placeholder="Enter 64-character SHA-256 hash..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-neutral-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-neutral-500 text-xs mt-2">
                    Enter the SHA-256 hash of the document you want to verify
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !hashInput.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Verify Hash
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
            {/* Result Header */}
            <div className={`p-8 text-center ${
              result.verified
                ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20'
                : 'bg-gradient-to-br from-red-500/20 to-orange-500/20'
            }`}>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                result.verified ? 'bg-orange-500/30' : 'bg-red-500/30'
              }`}>
                {result.verified ? (
                  <CheckCircle2 className="w-12 h-12 text-orange-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {result.verified ? 'Ownership Verified!' : 'No Record Found'}
              </h2>
              <p className={result.verified ? 'text-orange-300' : 'text-red-300'}>
                {result.message}
              </p>
            </div>

            {/* Ownership Details */}
            {result.verified && result.document && result.owner && (
              <div className="p-6 space-y-4">
                <div className="bg-neutral-950 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                    <FileText className="w-4 h-4" />
                    Document
                  </div>
                  <p className="text-white font-medium">{result.document.filename}</p>
                </div>

                <div className="bg-neutral-950 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                    <Hash className="w-4 h-4" />
                    SHA-256 Hash
                  </div>
                  <code className="text-orange-500 text-sm font-mono break-all">
                    {result.document.originalHash}
                  </code>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-950 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                      <User className="w-4 h-4" />
                      Owner
                    </div>
                    <p className="text-white font-medium">{result.owner.username}</p>
                  </div>
                  <div className="bg-neutral-950 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                      <Clock className="w-4 h-4" />
                      Registered
                    </div>
                    <p className="text-white font-medium">
                      {new Date(result.document.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                    <Key className="w-4 h-4" />
                    Owner's Public Key (ECC P-256)
                  </div>
                  <code className="text-amber-500 text-xs font-mono break-all">
                    {result.owner.publicKey}
                  </code>
                </div>

                <div className="bg-neutral-950 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                    <Flame className="w-4 h-4" />
                    Owner's Signature (ECDSA)
                  </div>
                  <code className="text-red-400 text-xs font-mono break-all">
                    {result.document.ownerSignature}
                  </code>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 border-t border-neutral-800 flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetVerification}
                className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors"
              >
                Verify Another
              </button>
              {!result.verified && (
                <a
                  href="/register"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors no-underline"
                >
                  Register This Document
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && (
          <div className="mt-8 p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              How Verification Works
            </h3>
            <ul className="space-y-3 text-neutral-400 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>
                  When you upload a file, we compute its SHA-256 hash (cryptographic fingerprint)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>
                  We check if this hash matches any registered documents in our system
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>
                  If found, we display the ownership details and cryptographic proof
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>
                  Your file content is never stored - only the hash is compared
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
