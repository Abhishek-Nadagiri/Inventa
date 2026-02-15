/**
 * Dashboard Page
 * User's document management dashboard
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Download, 
  Calendar,
  Hash,
  User,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserDocuments } from '../services/api';
import { Document } from '../types';
import { jsPDF } from 'jspdf';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      try {
        const docs = await getUserDocuments(user.id);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  // Download proof as PDF
  const downloadProof = async (doc: Document) => {
    setDownloadingId(doc.id);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;

      // Header
      pdf.setFillColor(134, 134, 45);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVENTA', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Where Ownership Begins', pageWidth / 2, 30, { align: 'center' });

      y = 55;

      // Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OWNERSHIP CERTIFICATE', pageWidth / 2, y, { align: 'center' });
      
      y += 15;

      // Certificate ID
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Certificate ID: ${doc.id}`, pageWidth / 2, y, { align: 'center' });
      
      y += 5;
      pdf.text(`Generated: ${new Date().toISOString()}`, pageWidth / 2, y, { align: 'center' });

      y += 15;

      // Owner Information Section
      pdf.setFillColor(240, 240, 220);
      pdf.rect(15, y, pageWidth - 30, 30, 'F');
      
      y += 10;
      pdf.setTextColor(134, 134, 45);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OWNER INFORMATION', 20, y);
      
      y += 10;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Legal Owner: ${doc.metadata?.ownerName || 'N/A'}`, 20, y);
      
      y += 7;
      pdf.text(`Username: @${user?.username || 'N/A'}`, 20, y);

      y += 20;

      // Document Information Section
      pdf.setFillColor(240, 240, 220);
      pdf.rect(15, y, pageWidth - 30, 45, 'F');
      
      y += 10;
      pdf.setTextColor(134, 134, 45);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DOCUMENT INFORMATION', 20, y);
      
      y += 10;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Document ID: ${doc.id}`, 20, y);
      
      y += 7;
      pdf.text(`Filename: ${doc.filename}`, 20, y);
      
      y += 7;
      pdf.text(`Type: ${doc.metadata?.documentType || 'N/A'}`, 20, y);
      
      y += 7;
      pdf.text(`Work Type: ${doc.metadata?.workType === 'human_made' ? 'Human Made' : 'AI Generated'}`, 20, y);
      
      y += 7;
      pdf.text(`Registered: ${new Date(doc.timestamp).toLocaleString()}`, 20, y);

      y += 20;

      // Description
      if (doc.metadata?.description) {
        pdf.setTextColor(134, 134, 45);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DESCRIPTION', 20, y);
        
        y += 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const descLines = pdf.splitTextToSize(doc.metadata.description, pageWidth - 40);
        pdf.text(descLines, 20, y);
        y += descLines.length * 5 + 10;
      }

      // Document Hash
      pdf.setTextColor(134, 134, 45);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DOCUMENT FINGERPRINT (SHA-256)', 20, y);
      
      y += 8;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('courier', 'normal');
      pdf.text(doc.hash || 'N/A', 20, y);

      y += 15;

      // Signature
      if (doc.signature) {
        pdf.setTextColor(134, 134, 45);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DIGITAL SIGNATURE (ECDSA)', 20, y);
        
        y += 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(6);
        pdf.setFont('courier', 'normal');
        const sigLines = pdf.splitTextToSize(doc.signature, pageWidth - 40);
        pdf.text(sigLines, 20, y);
        y += sigLines.length * 4 + 10;
      }

      // Footer
      const footerY = pdf.internal.pageSize.getHeight() - 20;
      pdf.setDrawColor(134, 134, 45);
      pdf.line(15, footerY - 10, pageWidth - 15, footerY - 10);
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This certificate verifies document ownership registered on the Inventa platform.', pageWidth / 2, footerY, { align: 'center' });

      // Save PDF
      pdf.save(`Inventa-Certificate-${doc.id}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Documents</h1>
            <p className="text-neutral-400 text-sm sm:text-base mt-0.5 sm:mt-1">
              {documents.length} document{documents.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#86862d] hover:bg-[#9a9a34] text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Register New
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#86862d] animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 sm:py-20 px-4 bg-neutral-900/50 border border-neutral-800 rounded-xl sm:rounded-2xl">
            <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">No Documents Yet</h3>
            <p className="text-neutral-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-sm mx-auto">Start protecting your work by registering your first document.</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#86862d] hover:bg-[#9a9a34] text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Register Document
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-neutral-900/50 border border-neutral-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:border-[#86862d]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Icon - Hidden on mobile to save space */}
                  <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-[#86862d]/20 rounded-lg sm:rounded-xl items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#86862d]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 sm:hidden mb-1">
                      <FileText className="w-4 h-4 text-[#86862d] flex-shrink-0" />
                      <h3 className="text-white font-semibold text-sm truncate">{doc.filename}</h3>
                    </div>
                    <h3 className="text-white font-semibold truncate hidden sm:block">{doc.filename}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-2 text-xs sm:text-sm text-neutral-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{doc.metadata?.ownerName || 'N/A'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        {formatDate(doc.timestamp)}
                      </span>
                      {doc.metadata?.documentType && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-[#86862d]/20 text-[#86862d] rounded text-[10px] sm:text-xs capitalize">
                          {doc.metadata.documentType}
                        </span>
                      )}
                      {doc.metadata?.workType && (
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs ${
                          doc.metadata.workType === 'human_made'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {doc.metadata.workType === 'human_made' ? 'Human' : 'AI'}
                        </span>
                      )}
                    </div>
                    {doc.hash && (
                      <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-neutral-500 overflow-hidden">
                        <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="font-mono truncate">{doc.hash}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => downloadProof(doc)}
                    disabled={downloadingId === doc.id}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm rounded-lg transition-all disabled:opacity-50 w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    {downloadingId === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                    <span>Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
