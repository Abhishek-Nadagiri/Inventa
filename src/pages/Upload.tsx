/**
 * Upload Page
 * Document registration with metadata
 * Mobile-optimized with responsive design
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  User,
  FileType,
  Sparkles,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadDocument } from '../services/api';
import { generateSHA256Hash } from '../services/crypto';

const DOCUMENT_TYPES = [
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'article', label: 'Article', icon: '📝' },
  { value: 'other', label: 'Other', icon: '📁' }
];

const WORK_TYPES = [
  { value: 'human_made', label: 'Human Made', description: 'Original work', icon: User },
  { value: 'ai_generated', label: 'AI Generated', description: 'AI assisted', icon: Sparkles }
];

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  // Step management
  const [step, setStep] = useState(1);
  
  // Form data
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [workType, setWorkType] = useState('');
  const [proofOfWork, setProofOfWork] = useState<File | null>(null);
  
  // State
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState<{ id: string; hash: string } | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    
    try {
      const hash = await generateSHA256Hash(selectedFile);
      setFileHash(hash);
    } catch (err) {
      setError('Failed to process file');
    }
  }, []);

  // Handle drag and drop
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to upload documents. Please refresh and try again.');
      navigate('/login');
      return;
    }
    
    if (!ownerName || !description || !documentType || !workType) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const result = await uploadDocument(user.id, {
        file,
        ownerName,
        description,
        documentType,
        workType,
        proofOfWork: proofOfWork || undefined
      });

      if (result.success && result.document) {
        setUploadedDoc({
          id: result.document.id,
          hash: result.document.hash || fileHash
        });
        setStep(3);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps - Compact on mobile */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                step >= s 
                  ? 'bg-[#86862d] text-white' 
                  : 'bg-neutral-800 text-neutral-500'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-8 sm:w-16 h-1 rounded ${
                  step > s ? 'bg-[#86862d]' : 'bg-neutral-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select File */}
        {step === 1 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Select Document</h2>
            <p className="text-neutral-400 text-sm sm:text-base mb-4 sm:mb-6">Choose the file you want to register</p>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-red-400">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm break-words">{error}</span>
              </div>
            )}

            {/* Drop Zone */}
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
                  <div className="max-w-full overflow-hidden">
                    <p className="text-white font-medium text-sm sm:text-base break-all line-clamp-2 px-2">{file.name}</p>
                    <p className="text-neutral-400 text-xs sm:text-sm mt-1">{formatFileSize(file.size)}</p>
                  </div>
                  {fileHash && (
                    <div className="bg-neutral-800 rounded-lg p-2 sm:p-3 mx-auto max-w-full overflow-hidden">
                      <p className="text-[10px] sm:text-xs text-neutral-500 mb-1">SHA-256 Hash:</p>
                      <p className="text-[9px] sm:text-xs text-[#86862d] font-mono break-all leading-relaxed">{fileHash}</p>
                    </div>
                  )}
                  <button
                    onClick={() => { setFile(null); setFileHash(''); }}
                    className="text-red-400 hover:text-red-300 text-xs sm:text-sm flex items-center gap-1 mx-auto py-1"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-neutral-800 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <UploadIcon className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Drag & drop your file here</p>
                    <p className="text-neutral-500 text-xs sm:text-sm">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Input for file selection */}
            {!file && (
              <div className="mt-3 sm:mt-4">
                <input
                  type="file"
                  id="fileInput"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="fileInput"
                  className="block w-full py-2.5 sm:py-3 text-center bg-neutral-800 hover:bg-neutral-700 text-white text-sm sm:text-base rounded-lg sm:rounded-xl cursor-pointer transition-all"
                >
                  Browse Files
                </label>
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={() => setStep(2)}
              disabled={!file}
              className="w-full mt-4 sm:mt-6 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#86862d] hover:bg-[#9a9a34] text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Add Details */}
        {step === 2 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Document Details</h2>
            <p className="text-neutral-400 text-sm sm:text-base mb-4 sm:mb-6">Provide information about your document</p>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-red-400">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm break-words">{error}</span>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              {/* Owner Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Legal name of the owner"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your document..."
                  rows={3}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent resize-none"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                  <FileType className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                  Document Type *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#86862d] focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                  Type of Work *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {WORK_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        onClick={() => setWorkType(type.value)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setWorkType(type.value)}
                        className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all ${
                          workType === type.value
                            ? 'border-[#86862d] bg-[#86862d]/20'
                            : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left">
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                            workType === type.value ? 'text-[#86862d]' : 'text-neutral-400'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-white font-medium text-xs sm:text-base truncate">{type.label}</p>
                            <p className="text-neutral-500 text-[10px] sm:text-xs hidden sm:block">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proof of Work */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                  Proof of Work (Optional)
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="file"
                    id="proofInput"
                    onChange={(e) => e.target.files?.[0] && setProofOfWork(e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="proofInput"
                    className="flex-1 py-2.5 sm:py-3 text-center bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-base rounded-lg sm:rounded-xl cursor-pointer transition-all truncate px-2"
                  >
                    {proofOfWork ? (
                      <span className="block truncate">{proofOfWork.name}</span>
                    ) : (
                      'Upload proof file'
                    )}
                  </label>
                  {proofOfWork && (
                    <button
                      onClick={() => setProofOfWork(null)}
                      className="p-2 sm:p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg sm:rounded-xl flex-shrink-0"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-6 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading || !ownerName || !description || !documentType || !workType}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-6 bg-[#86862d] hover:bg-[#9a9a34] text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Registering...</span>
                    <span className="sm:hidden">Wait...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Register
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && uploadedDoc && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <CheckCircle2 className="w-7 h-7 sm:w-10 sm:h-10 text-green-400" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Document Registered!</h2>
            <p className="text-neutral-400 text-sm sm:text-base mb-4 sm:mb-6">Your document has been successfully registered and protected.</p>

            <div className="bg-neutral-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left overflow-hidden">
              <div className="space-y-2 sm:space-y-3">
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-xs text-neutral-500">Document ID</p>
                  <p className="text-xs sm:text-sm text-white font-mono truncate">{uploadedDoc.id}</p>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-xs text-neutral-500">SHA-256 Hash</p>
                  <p className="text-[9px] sm:text-xs text-[#86862d] font-mono break-all leading-relaxed">{uploadedDoc.hash}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#86862d] hover:bg-[#9a9a34] text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all"
              >
                View Dashboard
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setFile(null);
                  setFileHash('');
                  setOwnerName('');
                  setDescription('');
                  setDocumentType('');
                  setWorkType('');
                  setProofOfWork(null);
                  setUploadedDoc(null);
                }}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
