/**
 * Inventa - Document Upload Page
 * Upload and register intellectual property with cryptographic protection
 */

import { useState, useCallback, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { uploadDocument } from '../services/api';
import { generateSHA256Hash } from '../services/crypto';
import type { Document } from '../types';
import {
  Upload as UploadIcon,
  FileText,
  Flame,
  Hash,
  Lock,
  Key,
  Clock,
  CheckCircle2,
  Loader2,
  X,
  ArrowRight
} from 'lucide-react';

type UploadStep = 'select' | 'processing' | 'complete' | 'error';

interface ProcessingStage {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete';
}

export function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<UploadStep>('select');
  const [error, setError] = useState('');
  const [stages, setStages] = useState<ProcessingStage[]>([]);
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
  const [previewHash, setPreviewHash] = useState<string>('');

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    // Generate preview hash
    try {
      const hash = await generateSHA256Hash(selectedFile);
      setPreviewHash(hash);
    } catch {
      setPreviewHash('');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setError('');

    try {
      const hash = await generateSHA256Hash(droppedFile);
      setPreviewHash(hash);
    } catch {
      setPreviewHash('');
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const updateStage = (stageId: string, status: 'processing' | 'complete') => {
    setStages(prev => prev.map(s => 
      s.id === stageId ? { ...s, status } : s
    ));
  };

  const handleUpload = async () => {
    if (!file) return;

    setStep('processing');
    setStages([
      { id: 'hash', label: 'Generating SHA-256 hash', status: 'pending' },
      { id: 'encrypt', label: 'Encrypting with AES-GCM', status: 'pending' },
      { id: 'sign', label: 'Signing with ECC key', status: 'pending' },
      { id: 'store', label: 'Storing encrypted document', status: 'pending' }
    ]);

    try {
      // Simulate processing stages for visual feedback
      updateStage('hash', 'processing');
      await new Promise(r => setTimeout(r, 500));
      updateStage('hash', 'complete');

      updateStage('encrypt', 'processing');
      await new Promise(r => setTimeout(r, 600));
      updateStage('encrypt', 'complete');

      updateStage('sign', 'processing');
      await new Promise(r => setTimeout(r, 400));
      updateStage('sign', 'complete');

      updateStage('store', 'processing');
      
      const result = await uploadDocument(file);
      
      await new Promise(r => setTimeout(r, 300));
      updateStage('store', 'complete');

      if (result.success && result.data) {
        setUploadedDoc(result.data.document);
        setStep('complete');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStep('error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const resetUpload = () => {
    setFile(null);
    setStep('select');
    setError('');
    setStages([]);
    setUploadedDoc(null);
    setPreviewHash('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl mb-4">
            <UploadIcon className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Register Document</h1>
          <p className="text-neutral-400">
            Upload your document to create cryptographic proof of ownership
          </p>
        </div>

        {/* File Selection Step */}
        {step === 'select' && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
            {/* Dropzone */}
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
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-xl">
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{file.name}</h3>
                    <p className="text-neutral-400 text-sm mt-1">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </p>
                  </div>
                  {previewHash && (
                    <div className="bg-neutral-950 rounded-lg p-3 max-w-md mx-auto">
                      <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                        <Hash className="w-4 h-4" />
                        SHA-256 Hash Preview
                      </div>
                      <code className="text-orange-500 text-xs font-mono break-all">
                        {previewHash}
                      </code>
                    </div>
                  )}
                  <button
                    onClick={resetUpload}
                    className="text-neutral-400 hover:text-white text-sm"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-800 rounded-xl mb-4">
                    <UploadIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-white font-medium text-lg mb-2">
                    Drag and drop your file here
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

            {/* Security features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Hash, label: 'SHA-256 Hash' },
                { icon: Lock, label: 'AES-256 Encrypt' },
                { icon: Key, label: 'ECC Signing' },
                { icon: Clock, label: 'Timestamp' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-neutral-400 text-sm">
                  <feature.icon className="w-4 h-4 text-orange-500" />
                  {feature.label}
                </div>
              ))}
            </div>

            {/* Upload button */}
            {file && (
              <button
                onClick={handleUpload}
                className="w-full mt-8 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all"
              >
                <Flame className="w-5 h-5" />
                Register & Protect Document
              </button>
            )}
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white">Processing Document</h2>
              <p className="text-neutral-400 mt-1">Securing your intellectual property...</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-4 p-4 bg-neutral-950 rounded-xl"
                >
                  {stage.status === 'pending' && (
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-700" />
                  )}
                  {stage.status === 'processing' && (
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  )}
                  {stage.status === 'complete' && (
                    <CheckCircle2 className="w-6 h-6 text-orange-500" />
                  )}
                  <span className={`${
                    stage.status === 'complete' ? 'text-white' : 'text-neutral-400'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && uploadedDoc && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                <CheckCircle2 className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Document Registered!</h2>
              <p className="text-neutral-400">
                Your intellectual property is now cryptographically protected
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-neutral-950 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                  <FileText className="w-4 h-4" />
                  Filename
                </div>
                <p className="text-white font-medium">{uploadedDoc.filename}</p>
              </div>

              <div className="bg-neutral-950 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                  <Hash className="w-4 h-4" />
                  Document Hash (SHA-256)
                </div>
                <code className="text-orange-500 text-sm font-mono break-all">
                  {uploadedDoc.originalHash}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-950 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </div>
                  <p className="text-white font-medium">
                    {new Date(uploadedDoc.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="bg-neutral-950 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                    <Lock className="w-4 h-4" />
                    Encryption
                  </div>
                  <p className="text-white font-medium">AES-256-GCM</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetUpload}
                className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors"
              >
                Upload Another
              </button>
              <Link
                to="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors no-underline"
              >
                View Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                <X className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Upload Failed</h2>
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={resetUpload}
                className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
