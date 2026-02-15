/**
 * Verify Page
 * Document verification by file upload or hash
 */

import React, { useState, useCallback } from 'react';
import { 
  Search, 
  Upload, 
  Hash, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileText,
  User,
  Calendar,
  Shield,
  AlertCircle
} from 'lucide-react';
import { verifyDocument, VerifyResult } from '../services/api';
import { generateSHA256Hash } from '../services/crypto';

const Verify: React.FC = () => {
  const [method, setMethod] = useState<'file' | 'hash'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [computedHash, setComputedHash] = useState('');

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    
    try {
      const fileHash = await generateSHA256Hash(selectedFile);
      setComputedHash(fileHash);
    } catch (err) {
      console.error('Failed to compute hash:', err);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Verify document
  const handleVerify = async () => {
    setIsVerifying(true);
    setResult(null);

    try {
      let verifyResult: VerifyResult;
      
      if (method === 'file' && file) {
        verifyResult = await verifyDocument(file);
      } else if (method === 'hash' && hash) {
        verifyResult = await verifyDocument(hash);
      } else {
        setResult({ verified: false, message: 'Please provide a file or hash' });
        setIsVerifying(false);
        return;
      }

      setResult(verifyResult);
    } catch (err) {
      setResult({ verified: false, message: 'Verification failed. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setHash('');
    setResult(null);
    setComputedHash('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#86862d]/20 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#86862d]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Verify Document</h1>
          <p className="text-neutral-400 text-sm sm:text-base">Check if a document has been registered</p>
        </div>

        {/* Method Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => { setMethod('file'); handleReset(); }}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              method === 'file'
                ? 'bg-[#86862d] text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Upload</span> File
          </button>
          <button
            onClick={() => { setMethod('hash'); handleReset(); }}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              method === 'hash'
                ? 'bg-[#86862d] text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Enter</span> Hash
          </button>
        </div>

        {/* Input Section */}
        {!result && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            {method === 'file' ? (
              <div>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transition-all ${
                    file 
                      ? 'border-[#86862d] bg-[#86862d]/10' 
                      : 'border-neutral-700 hover:border-[#86862d]/50'
                  }`}
                >
                  {file ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-[#86862d]/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[#86862d]" />
                      </div>
                      <p className="text-white font-medium text-sm sm:text-base break-all line-clamp-2 px-2">{file.name}</p>
                      {computedHash && (
                        <div className="bg-neutral-800 rounded-lg p-2 sm:p-3 max-w-full overflow-hidden">
                          <p className="text-[10px] sm:text-xs text-neutral-500 mb-1">SHA-256 Hash:</p>
                          <p className="text-[9px] sm:text-xs text-[#86862d] font-mono break-all leading-relaxed">{computedHash}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-neutral-800 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">Drag & drop your file here</p>
                        <p className="text-neutral-500 text-xs sm:text-sm">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>

                {!file && (
                  <div className="mt-3 sm:mt-4">
                    <input
                      type="file"
                      id="verifyFileInput"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="verifyFileInput"
                      className="block w-full py-2.5 sm:py-3 text-center bg-neutral-800 hover:bg-neutral-700 text-white text-sm sm:text-base rounded-lg sm:rounded-xl cursor-pointer transition-all"
                    >
                      Browse Files
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                  Document Hash (SHA-256)
                </label>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Enter the SHA-256 hash..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent font-mono"
                />
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || (method === 'file' ? !file : !hash)}
              className="w-full mt-4 sm:mt-6 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#86862d] hover:bg-[#9a9a34] text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  Verify Document
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            {/* Status */}
            <div className={`text-center mb-4 sm:mb-6 p-4 sm:p-6 rounded-lg sm:rounded-xl ${
              result.verified 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4 ${
                result.verified ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {result.verified ? (
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                )}
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${result.verified ? 'text-green-400' : 'text-red-400'}`}>
                {result.verified ? 'Document Verified!' : 'Not Found'}
              </h3>
              <p className="text-neutral-400 text-sm sm:text-base mt-1 sm:mt-2">{result.message}</p>
            </div>

            {/* Document Hash */}
            {(result.hash || computedHash) && (
              <div className="bg-neutral-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
                <p className="text-[10px] sm:text-xs text-neutral-500 mb-1">Document Hash (SHA-256)</p>
                <p className="text-[9px] sm:text-xs text-[#86862d] font-mono break-all leading-relaxed">{result.hash || computedHash}</p>
              </div>
            )}

            {/* Owner & Document Details */}
            {result.verified && result.owner && result.document && (
              <div className="space-y-3 sm:space-y-4">
                {/* Owner Info */}
                <div className="bg-neutral-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#86862d]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#86862d]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">
                        {result.document.metadata?.ownerName || result.owner.username}
                      </p>
                      <p className="text-neutral-500 text-xs sm:text-sm">@{result.owner.username}</p>
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                <div className="bg-neutral-800 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-400 text-xs sm:text-sm flex-shrink-0">Filename:</span>
                    <span className="text-white text-xs sm:text-sm break-all">{result.document.filename}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 flex-shrink-0" />
                    <span className="text-neutral-400 text-xs sm:text-sm">Registered:</span>
                    <span className="text-white text-xs sm:text-sm">
                      {new Date(result.document.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {result.document.metadata?.documentType && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-400 text-xs sm:text-sm">Type:</span>
                      <span className="text-white text-xs sm:text-sm capitalize">
                        {result.document.metadata.documentType}
                      </span>
                    </div>
                  )}
                  {result.document.metadata?.workType && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-400 text-xs sm:text-sm">Work:</span>
                      <span className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 rounded ${
                        result.document.metadata.workType === 'human_made'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {result.document.metadata.workType === 'human_made' ? 'Human Made' : 'AI Generated'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {result.document.metadata?.description && (
                  <div className="bg-neutral-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-neutral-500 text-xs sm:text-sm mb-1">Description</p>
                    <p className="text-white text-xs sm:text-sm">{result.document.metadata.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Verify Another Button */}
            <button
              onClick={handleReset}
              className="w-full mt-4 sm:mt-6 py-2.5 sm:py-3 px-4 sm:px-6 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all"
            >
              Verify Another Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
