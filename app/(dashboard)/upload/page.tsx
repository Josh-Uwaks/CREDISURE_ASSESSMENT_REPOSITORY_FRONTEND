// app/(dashboard)/upload/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadAPI } from '@/lib/api';
import { AxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useCache } from '@/context/CacheContext';
import { DocumentUpload } from '@/types';
import { 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiXCircle,
  FiUpload,
  FiFile,
  FiArrowLeft,
  FiLoader,
  FiDatabase,
  FiInfo,
  FiShield
} from 'react-icons/fi';

export default function UploadPage() {
  const router = useRouter();
  const { isKYCComplete, openKYCModal, isAuthenticated } = useAuth();
  const { get, set, invalidate } = useCache();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, date: string, size: string}>>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load uploaded files from API with caching
  useEffect(() => {
    const loadFiles = async () => {
      if (!isAuthenticated) {
        setIsDataLoaded(true);
        return;
      }

      // Check cache first
      const cachedDocs = get<DocumentUpload[]>('uploaded_documents');
      if (cachedDocs) {
        const formatted = cachedDocs.map((doc: DocumentUpload) => ({
          name: doc.file_name,
          date: new Date(doc.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          size: '0.5 MB',
        }));
        setUploadedFiles(formatted);
        setIsDataLoaded(true);
        return;
      }

      try {
        const docs = await uploadAPI.getDocuments();
        set('uploaded_documents', docs);
        
        const formatted = docs.map((doc: DocumentUpload) => ({
          name: doc.file_name,
          date: new Date(doc.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          size: '0.5 MB',
        }));
        setUploadedFiles(formatted);
      } catch (error) {
        console.error('Error loading documents:', error);
        // Fallback to localStorage
        const files = localStorage.getItem('uploaded_files');
        if (files) {
          try {
            setUploadedFiles(JSON.parse(files));
          } catch {}
        }
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadFiles();
  }, [isAuthenticated, get, set]);

  // Check KYC on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isKYCComplete) {
      toast('Please complete KYC to upload documents', {
        icon: <FiAlertTriangle className="w-5 h-5 text-amber-400" />,
        duration: 3000,
      });
      openKYCModal();
    }
  }, [isKYCComplete, openKYCModal, isAuthenticated, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        toast.error('Please upload a PDF file', {
          icon: <FiXCircle className="w-5 h-5 text-red-400" />,
        });
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB', {
          icon: <FiXCircle className="w-5 h-5 text-red-400" />,
        });
        return;
      }

      setFile(selectedFile);
      setUploadStatus('idle');
      setUploadProgress(0);
      toast.success(`File "${selectedFile.name}" selected`, {
        icon: <FiCheckCircle className="w-5 h-5 text-emerald-500" />,
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first', {
        icon: <FiAlertTriangle className="w-5 h-5 text-amber-400" />,
      });
      return;
    }

    if (!isKYCComplete) {
      toast.error('Please complete KYC first', {
        icon: <FiAlertTriangle className="w-5 h-5 text-amber-400" />,
      });
      openKYCModal();
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // ✅ ACTUALLY UPLOAD THE FILE
      await uploadAPI.uploadDocument(file, 'bank_statement');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Invalidate cache so dashboard and other components refresh
      invalidate('uploaded_documents');
      
      // Refresh the document list
      try {
        const docs = await uploadAPI.getDocuments();
        set('uploaded_documents', docs);
        
        const formatted = docs.map((doc: DocumentUpload) => ({
          name: doc.file_name,
          date: new Date(doc.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          size: '0.5 MB',
        }));
        setUploadedFiles(formatted);
      } catch (error) {
        console.error('Error refreshing documents:', error);
      }
      
      toast.success('Bank statement uploaded successfully!', {
        icon: <FiCheckCircle className="w-5 h-5 text-emerald-500" />,
      });
      
      // Reset after success
      setTimeout(() => {
        setFile(null);
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000);
      
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      setUploadStatus('error');
      toast.error(err.response?.data?.detail || 'Upload failed. Please try again.', {
        icon: <FiXCircle className="w-5 h-5 text-red-400" />,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  if (!isAuthenticated || !isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F5F0]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#1EA537] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8A8470] font-medium text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="px-4 lg:px-8 py-8 max-w-4xl w-full mx-auto bg-[#F7F5F0]">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-[#8A8470] hover:text-[#0B3B2E] transition-all mb-6 text-sm font-medium"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-[#1EA537]/10">
            <FiUpload className="w-5 h-5 text-[#1EA537]" />
          </div>
          <p className="text-[#8A8470] text-xs font-semibold uppercase tracking-widest">Upload</p>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0B3B2E] tracking-tight">Upload Bank Statement</h1>
        <p className="text-[#8A8470] text-sm mt-1">
          Upload your bank statement in PDF format for analysis
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6 lg:p-8">
        {/* KYC Warning Banner */}
        {!isKYCComplete && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <FiAlertTriangle className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">KYC Verification Required</p>
              <p className="text-xs text-amber-600">Please complete your KYC to upload documents</p>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-[#1EA537] bg-[#1EA537]/10'
              : file 
                ? 'border-[#1EA537] bg-[#1EA537]/10'
                : 'border-[#E7E2D6] hover:border-[#1EA537]/50 hover:bg-[#F7F5F0]'
            }
            ${uploadStatus === 'success' ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {!file ? (
            <>
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                ${isDragActive ? 'bg-[#1EA537]/20' : 'bg-[#F2F0E8]'}
              `}>
                <FiUpload className={`
                  w-8 h-8
                  ${isDragActive ? 'text-[#1EA537]' : 'text-[#8A8470]'}
                `} />
              </div>
              <p className="text-[#0B3B2E] font-semibold mb-2">
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop your bank statement'}
              </p>
              <p className="text-sm text-[#8A8470]">
                or click to browse files
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#8A8470]">
                <span>PDF format</span>
                <span className="w-1 h-1 rounded-full bg-[#E7E2D6]" />
                <span>Max 10MB</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#1EA537]/10 flex items-center justify-center">
                  <FiFile className="w-6 h-6 text-[#1EA537]" />
                </div>
                <div>
                  <p className="text-[#0B3B2E] font-medium">{file.name}</p>
                  <p className="text-xs text-[#8A8470]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 transition-all text-[#8A8470] hover:text-red-600"
                >
                  <FiXCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploadStatus === 'uploading' && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#8A8470] font-medium">Uploading...</span>
              <span className="text-[#1EA537] font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#F2F0E8] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#1EA537] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-[#8A8470] mt-2 text-center">
              Please wait while your file is being uploaded
            </p>
          </div>
        )}

        {/* Success Status */}
        {uploadStatus === 'success' && (
          <div className="mt-6 p-4 rounded-xl bg-[#1EA537]/10 border border-[#1EA537]/30 flex items-center gap-3 animate-fadeIn">
            <FiCheckCircle className="w-5 h-5 text-[#1EA537]" />
            <div>
              <span className="text-sm font-medium text-[#0B3B2E]">Upload completed successfully!</span>
              <p className="text-xs text-[#1EA537] mt-0.5">Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Status */}
        {uploadStatus === 'error' && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-fadeIn">
            <FiXCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">Upload failed. Please try again.</span>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading || uploadStatus === 'success' || !isKYCComplete}
          className={`
            mt-6 w-full font-semibold py-3.5 rounded-xl transition-all text-sm
            flex items-center justify-center gap-2
            ${!isKYCComplete 
              ? 'bg-[#F2F0E8] text-[#B5AF9C] cursor-not-allowed'
              : file && uploadStatus !== 'success' && !isUploading
                ? 'bg-[#1EA537] hover:bg-[#188A2D] text-white shadow-lg shadow-[#1EA537]/20'
                : 'bg-[#F2F0E8] text-[#B5AF9C] cursor-not-allowed'
            }
          `}
        >
          {isUploading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Uploading... {uploadProgress}%
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <FiCheckCircle className="w-4 h-4" />
              Upload Complete ✓
            </>
          ) : !isKYCComplete ? (
            <>
              <FiAlertTriangle className="w-4 h-4" />
              Complete KYC First
            </>
          ) : (
            <>
              <FiUpload className="w-4 h-4" />
              Upload Bank Statement
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8A8470]">
          <FiShield className="w-3 h-3" />
          <span>Your file is encrypted and securely uploaded</span>
        </div>
      </div>

      {/* Recent Uploads */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-[#1EA537]/10">
              <FiDatabase className="w-4 h-4 text-[#1EA537]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B3B2E]">Recent Uploads</h3>
            <span className="ml-auto text-xs font-medium text-[#8A8470] bg-[#F2F0E8] px-2 py-1 rounded-full">
              {uploadedFiles.length} files
            </span>
          </div>
          <div className="space-y-3">
            {uploadedFiles.slice(0, 3).map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F5F0] hover:bg-[#F2F0E8] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#1EA537]/10 flex items-center justify-center">
                  <FiFile className="w-5 h-5 text-[#1EA537]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0B3B2E] truncate">{file.name}</p>
                  <p className="text-xs text-[#8A8470]">{file.date}</p>
                </div>
                <span className="text-xs font-medium text-[#1EA537] bg-[#1EA537]/10 px-2 py-1 rounded-full">
                  {file.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="mt-8 bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#0B3B2E] mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1EA537]/10">
            <FiFile className="w-4 h-4 text-[#1EA537]" />
          </div>
          Requirements
        </h3>
        <ul className="space-y-2.5 text-sm text-[#5C5848]">
          <li className="flex items-start gap-3">
            <FiCheckCircle className="w-4 h-4 text-[#1EA537] shrink-0 mt-0.5" />
            <span>PDF format only</span>
          </li>
          <li className="flex items-start gap-3">
            <FiCheckCircle className="w-4 h-4 text-[#1EA537] shrink-0 mt-0.5" />
            <span>Maximum file size: 10MB</span>
          </li>
          <li className="flex items-start gap-3">
            <FiCheckCircle className="w-4 h-4 text-[#1EA537] shrink-0 mt-0.5" />
            <span>Bank statement must be from the last 3 months</span>
          </li>
          <li className="flex items-start gap-3">
            <FiCheckCircle className="w-4 h-4 text-[#1EA537] shrink-0 mt-0.5" />
            <span>Clear and readable text</span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-[#E7E2D6]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#8A8470]">
            © {new Date().getFullYear()} CrediSure. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#8A8470]">
            <span className="flex items-center gap-1">
              <FiInfo className="w-3 h-3" />
              Secure & Encrypted
            </span>
            <span>v2.0.0</span>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}