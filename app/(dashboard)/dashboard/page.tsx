// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCache } from '@/context/CacheContext';
import { KYCModal } from '@/components/KYCModal';
import { AssessmentModal } from '@/components/AssessmentModal';
import { LoanApplicationModal } from '@/components/LoanApplicationModal';
import { KYCFormData, AssessmentHistory, DocumentUpload } from '@/types';
import { z } from 'zod';
import { assessmentSchema } from '@/lib/validation';
import { uploadAPI } from '@/lib/api';
import {
  FiShield,
  FiUpload,
  FiClock,
  FiAlertTriangle,
  FiBarChart2,
  FiFile,
  FiTrendingUp,
  FiChevronRight,
  FiInfo,
  FiCheckCircle,
  FiPlus,
  FiLoader,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ====== TYPES ======
type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface UploadedFile {
  name: string;
  date: string;
  size: string;
}

interface LoanData {
  status:
    | 'no_application'
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'disbursed'
    | 'active'
    | 'completed'
    | 'defaulted'
    | null;
  amount?: number;
  due_date?: string;
  created_at?: string;
  approved_at?: string;
}

type JourneyStatus = 'completed' | 'active' | 'pending' | 'blocked';

// ====== SHARED HELPERS ======

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ====== JOURNEY STRIP ======

interface JourneyStep {
  id: string;
  label: string;
  status: JourneyStatus;
}

function JourneyStrip({ steps }: { steps: JourneyStep[] }) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm px-6 py-7">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-sm font-semibold tracking-wide text-[#0B3B2E] uppercase">
          Your Journey
        </h2>
        <span className="text-xs font-medium text-[#8A8470] font-mono">
          {completedCount} / {steps.length} complete
        </span>
      </div>

      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-4 right-4 h-px bg-[#E7E2D6]" />
        <div
          className="absolute top-4 left-4 h-px bg-[#1EA537] transition-all duration-500"
          style={{
            width:
              steps.length > 1
                ? `calc(${(completedCount / (steps.length - 1)) * 100}% - ${
                    completedCount / (steps.length - 1) > 0 ? '32px' : '0px'
                  })`
                : '0%',
          }}
        />

        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center w-full">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0border-2 bg-white
                ${step.status === 'completed' ? 'border-[#1EA537] bg-[#1EA537] text-white' : ''}
                ${step.status === 'active' ? 'border-[#1EA537] text-[#1EA537]' : ''}
                ${step.status === 'pending' ? 'border-[#E7E2D6] text-[#B5AF9C]' : ''}
                ${step.status === 'blocked' ? 'border-[#E7E2D6] text-[#C9C3B0]' : ''}
              `}
            >
              {step.status === 'completed' && <FiCheck className="w-4 h-4" />}
              {step.status === 'active' && <FiLoader className="w-4 h-4 animate-spin" />}
              {(step.status === 'pending' || step.status === 'blocked') && (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </div>
            <p
              className={`
                mt-2.5 text-xs font-medium text-center leading-tight max-w-22
                ${step.status === 'completed' ? 'text-[#0B3B2E]' : ''}
                ${step.status === 'active' ? 'text-[#1EA537]' : ''}
                ${step.status === 'pending' || step.status === 'blocked' ? 'text-[#B5AF9C]' : ''}
              `}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== STATUS NOTICE ======

interface StatusNoticeProps {
  kycStatus: string | null;
  isKYCComplete: boolean;
  onVerify: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function StatusNotice({ kycStatus, isKYCComplete, onVerify, onRefresh, isRefreshing }: StatusNoticeProps) {
  // ✅ Updated: Check for pending status
  if (kycStatus === 'pending') {
    return (
      <div className="mb-6 bg-white border-l-4 border-[#B45309] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-[#B45309]/10 rounded-lg shrink-0">
            <FiClock className="text-[#B45309] w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0B3B2E]">KYC under review</h3>
            <p className="text-[#5C5848] text-sm mt-0.5">
              You have full access to every feature while we confirm your identity.
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-[#B45309] bg-[#B45309]/10 px-3 py-1.5 rounded-full whitespace-nowrap">
          Pending review
        </span>
      </div>
    );
  }

  // ✅ Updated: Check for rejected status
  if (kycStatus === 'rejected') {
    return (
      <div className="mb-6 bg-white border-l-4 border-red-500 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-red-50 rounded-lg shrink-0">
            <FiX className="text-red-500 w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0B3B2E]">KYC verification failed</h3>
            <p className="text-[#5C5848] text-sm mt-0.5">
              Please review your information and try again.
            </p>
          </div>
        </div>
        <button
          onClick={onVerify}
          className="bg-[#1EA537] hover:bg-[#188A2D] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FiShield className="w-4 h-4" />
          Retry KYC
        </button>
      </div>
    );
  }

  // ✅ Updated: Check if not submitted
  if (!isKYCComplete && kycStatus === 'not_submitted') {
    return (
      <div className="mb-6 bg-white border-l-4 border-[#1EA537] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-[#1EA537]/10 rounded-lg shrink-0">
            <FiAlertTriangle className="text-[#1EA537] w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0B3B2E]">Verify your identity to continue</h3>
            <p className="text-[#5C5848] text-sm mt-0.5">
              Complete KYC to unlock document upload, credit assessment, and loan applications.
            </p>
          </div>
        </div>
        <button
          onClick={onVerify}
          className="bg-[#1EA537] hover:bg-[#188A2D] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FiShield className="w-4 h-4" />
          Verify identity
        </button>
      </div>
    );
  }

  // Verified - quiet confirmation
  return (
    <div className="mb-6 flex items-center justify-between text-xs text-[#8A8470] px-1">
      <span className="flex items-center gap-1.5">
        <FiCheckCircle className="w-3.5 h-3.5 text-[#1EA537]" />
        Identity verified
      </span>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 hover:text-[#0B3B2E] transition-colors"
      >
        <FiLoader className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}

// ====== CREDIT SCORE HERO ======

interface CreditHeroProps {
  creditScore: number | null;
  rating: string;
  riskLevel: string;
  lastAssessmentDate: string | null;
  fundingLabel: string;
  fundingColor: string;
  onNewAssessment: () => void;
  hasAssessment: boolean;
}

function CreditHero({
  creditScore,
  rating,
  riskLevel,
  lastAssessmentDate,
  fundingLabel,
  fundingColor,
  onNewAssessment,
  hasAssessment,
}: CreditHeroProps) {
  return (
    <div className="bg-[#0B3B2E] rounded-2xl shadow-sm p-7 md:p-8 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, #ffffff 28px)',
        }}
      />
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-wide uppercase text-[#9FCBA8]">
            Credit Score
          </p>
          {creditScore !== null ? (
            <>
              <div className="flex items-baseline gap-3 mt-1">
                <span
                  className={`text-6xl font-bold tracking-tight font-mono ${
                    creditScore >= 700
                      ? 'text-white'
                      : creditScore >= 600
                      ? 'text-[#F2C078]'
                      : 'text-[#F0A5A5]'
                  }`}
                >
                  {creditScore}
                </span>
                <span className="text-sm text-[#9FCBA8] font-medium pb-1">/ 850</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="font-medium text-white">{rating}</span>
                <span className="text-[#9FCBA8]">·</span>
                <span className="text-[#C9E5CE]">{riskLevel}</span>
                {lastAssessmentDate && (
                  <>
                    <span className="text-[#9FCBA8]">·</span>
                    <span className="text-[#9FCBA8]">{lastAssessmentDate}</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-2xl font-semibold text-white">No assessment yet</p>
              <p className="text-sm text-[#9FCBA8] mt-1">
                Run your first credit assessment to see your score.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-left md:text-right">
            <p className="text-xs font-medium tracking-wide uppercase text-[#9FCBA8]">
              Funding status
            </p>
            <p
              className={`text-base font-semibold mt-0.5 ${
                fundingColor === 'text-[#1EA537]'
                  ? 'text-[#7FDB91]'
                  : fundingColor === 'text-amber-600'
                  ? 'text-[#F2C078]'
                  : fundingColor === 'text-red-600'
                  ? 'text-[#F0A5A5]'
                  : 'text-white'
              }`}
            >
              {fundingLabel}
            </p>
          </div>
          <button
            onClick={onNewAssessment}
            className="bg-white hover:bg-[#F2F0E8] text-[#0B3B2E] px-5 py-3 rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-2 text-sm whitespace-nowrap"
          >
            {hasAssessment ? <FiTrendingUp className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
            {hasAssessment ? 'New assessment' : 'Run assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ====== LOAN SECTION ======

interface LoanSectionProps {
  loan: LoanData | null;
  onApply: () => void;
  creditScore: number | null;
  hasAssessment: boolean;
  hasUploadedDocument: boolean;
  isKYCComplete: boolean;
}

function LoanSection({ 
  loan, 
  onApply, 
  creditScore, 
  hasAssessment, 
  hasUploadedDocument,
  isKYCComplete 
}: LoanSectionProps) {
  const getLoanStatusDisplay = () => {
    if (!loan || loan.status === null || loan.status === 'no_application') {
      return { label: 'No application', color: 'text-[#8A8470]', bgColor: 'bg-[#F2F0E8]' };
    }
    switch (loan.status) {
      case 'draft':
        return { label: 'Draft', color: 'text-[#8A8470]', bgColor: 'bg-[#F2F0E8]' };
      case 'submitted':
        return { label: 'Submitted', color: 'text-[#1D4ED8]', bgColor: 'bg-blue-50' };
      case 'under_review':
        return { label: 'Under review', color: 'text-[#B45309]', bgColor: 'bg-[#B45309]/10' };
      case 'approved':
        return { label: 'Approved', color: 'text-[#1EA537]', bgColor: 'bg-[#1EA537]/10' };
      case 'rejected':
        return { label: 'Rejected', color: 'text-[#B91C1C]', bgColor: 'bg-[#B91C1C]/10' };
      case 'disbursed':
        return { label: 'Disbursed', color: 'text-[#1EA537]', bgColor: 'bg-[#1EA537]/10' };
      case 'active':
        return { label: 'Active', color: 'text-[#1D4ED8]', bgColor: 'bg-blue-50' };
      case 'completed':
        return { label: 'Completed', color: 'text-[#1EA537]', bgColor: 'bg-[#1EA537]/10' };
      case 'defaulted':
        return { label: 'Defaulted', color: 'text-[#B91C1C]', bgColor: 'bg-[#B91C1C]/10' };
      default:
        return { label: loan.status || 'Unknown', color: 'text-[#8A8470]', bgColor: 'bg-[#F2F0E8]' };
    }
  };

  const statusDisplay = getLoanStatusDisplay();
  const isLoanActive = loan && ['active', 'disbursed'].includes(loan.status || '');
  const isLoanUnderReview = loan && ['submitted', 'under_review'].includes(loan.status || '');
  const hasLoanApplication = loan && loan.status !== 'no_application' && loan.status !== null;
  
  // ✅ Updated: Check KYC status properly
  const isEligible = isKYCComplete && hasUploadedDocument && hasAssessment && creditScore !== null && creditScore >= 600;
  const canApply = !hasLoanApplication || loan?.status === 'rejected' || loan?.status === 'completed';

  const message = isLoanActive
    ? { text: 'Your loan is active. Keep repayments on schedule to protect your score.', tone: 'blue' }
    : isLoanUnderReview
    ? { text: "We're reviewing your application — you'll hear from us soon.", tone: 'amber' }
    : loan?.status === 'approved'
    ? { text: 'Approved. Funds will be disbursed shortly.', tone: 'green' }
    : loan?.status === 'completed'
    ? { text: 'Fully repaid. Thank you for banking with us.', tone: 'green' }
    : loan?.status === 'rejected'
    ? { text: 'Not approved this time. You can reapply after 30 days.', tone: 'red' }
    : null;

  const toneClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-[#1D4ED8] border-blue-100',
    amber: 'bg-[#B45309]/10 text-[#92400E] border-[#B45309]/20',
    green: 'bg-[#1EA537]/10 text-[#0B3B2E] border-[#1EA537]/20',
    red: 'bg-[#B91C1C]/10 text-[#991B1B] border-[#B91C1C]/20',
  };

  // Determine button state
  const showApplyButton = canApply && isEligible;
  const showIneligibleButton = !hasLoanApplication && !isEligible && creditScore !== null && creditScore < 600;
  const showNoAssessmentButton = !hasLoanApplication && !hasAssessment;
  const showNoKYCButton = !hasLoanApplication && !isKYCComplete;
  const showNoDocumentButton = !hasLoanApplication && isKYCComplete && !hasUploadedDocument;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold tracking-wide text-[#0B3B2E] uppercase">Loan</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
          {statusDisplay.label}
        </span>
      </div>

      {hasLoanApplication && (
        <div className="space-y-2.5 mb-4 text-sm">
          {loan.amount && (
            <div className="flex items-center justify-between">
              <span className="text-[#8A8470]">Amount</span>
              <span className="font-semibold text-[#0B3B2E] font-mono">
                ₦{loan.amount.toLocaleString()}
              </span>
            </div>
          )}
          {loan.due_date && (
            <div className="flex items-center justify-between">
              <span className="text-[#8A8470]">Due date</span>
              <span className="font-medium text-[#0B3B2E]">{formatDate(loan.due_date)}</span>
            </div>
          )}
          {loan.created_at && (
            <div className="flex items-center justify-between">
              <span className="text-[#8A8470]">Applied on</span>
              <span className="text-[#5C5848]">{formatDate(loan.created_at)}</span>
            </div>
          )}
        </div>
      )}

      {message && (
        <div className={`rounded-lg p-3 mb-4 text-sm border ${toneClasses[message.tone]}`}>
          {message.text}
        </div>
      )}

      {/* Eligibility Messages */}
      {!hasLoanApplication && (
        <>
          {!isKYCComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
              🔒 Complete KYC to apply for a loan
            </div>
          )}
          {isKYCComplete && !hasUploadedDocument && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
              📄 Upload your documents to apply for a loan
            </div>
          )}
          {isKYCComplete && hasUploadedDocument && !hasAssessment && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
              📊 Run a credit assessment to check your eligibility
            </div>
          )}
          {isKYCComplete && hasUploadedDocument && hasAssessment && creditScore !== null && creditScore < 600 && (
            <div className="bg-[#B91C1C]/10 border border-[#B91C1C]/20 rounded-lg p-3 mb-4 text-sm text-[#991B1B]">
              Your credit score ({creditScore}) is below the minimum requirement of 600.
            </div>
          )}
          {isEligible && (
            <div className="bg-[#1EA537]/10 border border-[#1EA537]/20 rounded-lg p-3 mb-4 text-sm text-[#0B3B2E]">
              ✅ You&apos;re eligible for a loan! Apply now to get started.
            </div>
          )}
        </>
      )}

      <div className="mt-auto">
        {showApplyButton && (
          <button
            onClick={onApply}
            className="w-full bg-[#1EA537] hover:bg-[#188A2D] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            {loan?.status === 'rejected' ? 'Reapply for loan' : 'Apply for loan'}
          </button>
        )}

        {showIneligibleButton && (
          <button
            disabled
            className="w-full bg-[#F2F0E8] text-[#B5AF9C] px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Ineligible (Score below 600)
          </button>
        )}

        {showNoAssessmentButton && (
          <button
            disabled
            className="w-full bg-[#F2F0E8] text-[#B5AF9C] px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiBarChart2 className="w-4 h-4" />
            Run assessment first
          </button>
        )}

        {showNoKYCButton && (
          <button
            disabled
            className="w-full bg-[#F2F0E8] text-[#B5AF9C] px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiShield className="w-4 h-4" />
            Complete KYC first
          </button>
        )}

        {showNoDocumentButton && (
          <button
            disabled
            className="w-full bg-[#F2F0E8] text-[#B5AF9C] px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Upload documents first
          </button>
        )}

        {loan?.status === 'under_review' && (
          <button
            disabled
            className="w-full bg-[#F2F0E8] text-[#B5AF9C] px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiLoader className="w-4 h-4 animate-spin" />
            Under review
          </button>
        )}

        {loan?.status === 'submitted' && (
          <button
            disabled
            className="w-full bg-[#F2F0E8] text-[#B5AF9C] px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiClock className="w-4 h-4" />
            Awaiting review
          </button>
        )}

        {loan?.status === 'draft' && (
          <button
            onClick={onApply}
            className="w-full bg-[#1EA537] hover:bg-[#188A2D] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Submit application
          </button>
        )}

        {loan?.status === 'approved' && (
          <div className="w-full bg-[#1EA537]/10 text-[#0B3B2E] px-4 py-2.5 rounded-lg text-sm font-medium text-center border border-[#1EA537]/20">
            ✅ Approved - Funds coming soon
          </div>
        )}

        {loan?.status === 'disbursed' && (
          <div className="w-full bg-[#1EA537]/10 text-[#0B3B2E] px-4 py-2.5 rounded-lg text-sm font-medium text-center border border-[#1EA537]/20">
            💰 Funds disbursed
          </div>
        )}

        {loan?.status === 'active' && (
          <div className="w-full bg-blue-50 text-[#1D4ED8] px-4 py-2.5 rounded-lg text-sm font-medium text-center border border-blue-200">
            🔄 Loan active
          </div>
        )}

        {loan?.status === 'completed' && (
          <div className="w-full bg-[#1EA537]/10 text-[#0B3B2E] px-4 py-2.5 rounded-lg text-sm font-medium text-center border border-[#1EA537]/20">
            ✅ Loan completed
          </div>
        )}
      </div>
    </div>
  );
}

// ====== UPLOADS SECTION ======

interface UploadsSectionProps {
  files: UploadedFile[];
  onUploadClick: () => void;
}

function UploadsSection({ files, onUploadClick }: UploadsSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold tracking-wide text-[#0B3B2E] uppercase">Documents</h3>
        <span className="text-xs font-medium text-[#8A8470] font-mono">{files.length}</span>
      </div>

      {files.length > 0 ? (
        <div className="space-y-2 flex-1">
          {files.slice(0, 3).map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7F5F0] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1EA537]/10 flex items-center justify-center shrink-0">
                <FiFile className="w-4 h-4 text-[#1EA537]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0B3B2E] truncate">{file.name}</p>
                <p className="text-xs text-[#8A8470]">{file.date}</p>
              </div>
              <span className="text-xs font-mono text-[#8A8470]">{file.size}</span>
            </div>
          ))}
          {files.length > 3 && (
            <button
              onClick={onUploadClick}
              className="text-sm text-[#1EA537] font-medium hover:text-[#188A2D] transition-colors flex items-center gap-1 pt-1"
            >
              View all {files.length}
              <FiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#F2F0E8] flex items-center justify-center mb-3">
            <FiUpload className="w-5 h-5 text-[#B5AF9C]" />
          </div>
          <p className="text-sm font-medium text-[#0B3B2E]">No documents yet</p>
          <p className="text-xs text-[#8A8470] mt-1 mb-4">Upload your bank statement to begin</p>
          <button
            onClick={onUploadClick}
            className="bg-[#1EA537] hover:bg-[#188A2D] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Upload now
          </button>
        </div>
      )}
    </div>
  );
}

// ====== HISTORY SECTION ======

interface HistorySectionProps {
  history: AssessmentHistory[];
  onHistoryClick: () => void;
}

function HistorySection({ history, onHistoryClick }: HistorySectionProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low risk':
        return 'text-[#1EA537] bg-[#1EA537]/10';
      case 'medium risk':
        return 'text-[#B45309] bg-[#B45309]/10';
      case 'high risk':
        return 'text-[#B91C1C] bg-[#B91C1C]/10';
      default:
        return 'text-[#8A8470] bg-[#F2F0E8]';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold tracking-wide text-[#0B3B2E] uppercase">
          Assessment History
        </h3>
        <span className="text-xs font-medium text-[#8A8470] font-mono">{history.length}</span>
      </div>

      {history.length > 0 ? (
        <div className="space-y-2 flex-1">
          {history.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7F5F0] transition-colors cursor-pointer"
              onClick={onHistoryClick}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0${getRiskColor(
                  item.risk_level
                )}`}
              >
                <FiBarChart2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0B3B2E]">Assessment #{item.id}</p>
                <p className="text-xs text-[#8A8470]">{formatDateTime(item.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#0B3B2E] font-mono">{item.credit_score}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(item.risk_level)}`}>
                  {item.risk_level}
                </span>
              </div>
            </div>
          ))}
          {history.length > 3 && (
            <button
              onClick={onHistoryClick}
              className="text-sm text-[#1EA537] font-medium hover:text-[#188A2D] transition-colors flex items-center gap-1 pt-1"
            >
              View all {history.length}
              <FiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#F2F0E8] flex items-center justify-center mb-3">
            <FiBarChart2 className="w-5 h-5 text-[#B5AF9C]" />
          </div>
          <p className="text-sm font-medium text-[#0B3B2E]">No assessments yet</p>
          <p className="text-xs text-[#8A8470] mt-1 mb-4">Run your first credit assessment</p>
          <button
            onClick={onHistoryClick}
            className="bg-[#1EA537] hover:bg-[#188A2D] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Start assessment
          </button>
        </div>
      )}
    </div>
  );
}

// ====== MAIN DASHBOARD COMPONENT ======

export default function DashboardPage() {
  const router = useRouter();
  const { get, set } = useCache();
  const {
    userInfo,
    isKYCComplete,
    openKYCModal,
    isAuthenticated,
    submitKYC,
    isKYCLoading,
    showKYCModal,
    hideKYCModal,
    submitAssessment,
    isLoading,
    refreshUser,
    fetchKYCStatus,
    kycStatus,
    kycStatusInfo,
    assessment,
    history,
    fetchHistory,
    createLoan,
    fetchLoans,
    fetchActiveLoan,
    loans,
  } = useAuth();

  // State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUploadedDocument, setHasUploadedDocument] = useState(false);
  
  // Loan Modal State
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isLoanLoading, setIsLoanLoading] = useState(false);

  // Get the latest assessment from history (most recent first)
  const latestHistoryItem = useMemo(() => {
    if (history.length === 0) return null;
    return history[0];
  }, [history]);

  // Get the latest loan from AuthContext loans array
  const latestLoan = useMemo(() => {
    if (!loans || loans.length === 0) return null;
    return loans[0];
  }, [loans]);

  // Derive display values from the latest history item
  const creditScore = useMemo(() => {
    if (latestHistoryItem) return latestHistoryItem.credit_score;
    if (assessment?.assessment?.credit_score) return assessment.assessment.credit_score;
    return null;
  }, [latestHistoryItem, assessment]);

  const riskLevel = useMemo(() => {
    if (latestHistoryItem) return latestHistoryItem.risk_level;
    if (assessment?.assessment?.risk_level) return assessment.assessment.risk_level;
    return '—';
  }, [latestHistoryItem, assessment]);

  const rating = useMemo(() => {
    if (latestHistoryItem) return latestHistoryItem.rating;
    if (assessment?.assessment?.rating) return assessment.assessment.rating;
    return '—';
  }, [latestHistoryItem, assessment]);

  const lastAssessmentDate = useMemo(() => {
    if (latestHistoryItem) {
      return formatDate(latestHistoryItem.created_at);
    }
    return null;
  }, [latestHistoryItem]);

  const hasAssessment = useMemo(() => {
    return history.length > 0 || !!assessment;
  }, [history, assessment]);

  // Load documents from API with caching
  useEffect(() => {
    const loadDocuments = async () => {
      if (!isAuthenticated) return;
      
      const cachedDocs = get<DocumentUpload[]>('uploaded_documents');
      if (cachedDocs) {
        const formatted = cachedDocs.map((doc: DocumentUpload) => ({
          name: doc.file_name,
          date: formatDate(doc.created_at),
          size: '0.5 MB',
        }));
        setUploadedFiles(formatted);
        setHasUploadedDocument(formatted.length > 0);
        return;
      }

      try {
        const docs = await uploadAPI.getDocuments();
        set('uploaded_documents', docs);
        
        const formatted = docs.map((doc: DocumentUpload) => ({
          name: doc.file_name,
          date: formatDate(doc.created_at),
          size: '0.5 MB',
        }));
        setUploadedFiles(formatted);
        setHasUploadedDocument(formatted.length > 0);
      } catch (error) {
        console.error('Error loading documents:', error);
        const files = localStorage.getItem('uploaded_files');
        if (files) {
          try {
            const parsed = JSON.parse(files);
            setUploadedFiles(parsed);
            setHasUploadedDocument(parsed.length > 0);
          } catch {}
        }
      }
    };

    loadDocuments();
  }, [isAuthenticated, get, set]);

  // ✅ Updated: Treat pending as not complete but still active
  const isKYCCompleteEffective = isKYCComplete || kycStatus === 'pending';

  // Fetch KYC status and history
  useEffect(() => {
    if (isAuthenticated) {
      fetchKYCStatus();
      fetchHistory();
      fetchLoans();
      fetchActiveLoan();
    }
  }, [isAuthenticated, fetchKYCStatus, fetchHistory, fetchLoans, fetchActiveLoan]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const getFundingStatus = () => {
    // ✅ Updated: Check KYC status properly
    if (isKYCComplete || kycStatus === 'pending') {
      if (creditScore && creditScore >= 700) {
        return { label: 'Eligible', color: 'text-[#1EA537]' };
      }
      if (creditScore && creditScore >= 600) {
        return { label: 'Reviewing', color: 'text-amber-600' };
      }
      if (creditScore) {
        return { label: 'Ineligible', color: 'text-red-600' };
      }
      return { label: 'Run assessment', color: 'text-slate-400' };
    }
    if (kycStatus === 'rejected') {
      return { label: 'KYC Rejected', color: 'text-red-600' };
    }
    return { label: 'KYC required', color: 'text-amber-600' };
  };

  const funding = getFundingStatus();

  // Get user name
  const getUserName = () => {
    if (kycStatusInfo?.full_name) return kycStatusInfo.full_name;
    if (!userInfo) return 'User';
    const firstName = userInfo.firstName || 'User';
    const lastName = userInfo.lastName || '';
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return firstName;
  };

  const userName = getUserName();

  // Calculate KYC step status
  const kycStepStatus: JourneyStatus = isKYCComplete 
    ? 'completed' 
    : (kycStatus === 'pending' ? 'active' : 
       kycStatus === 'rejected' ? 'blocked' : 'pending');

  // Journey steps with proper loan status checking
  const steps: JourneyStep[] = [
    {
      id: 'kyc',
      label: 'Verify identity',
      status: kycStepStatus,
    },
    {
      id: 'upload',
      label: 'Upload documents',
      status: hasUploadedDocument ? 'completed' : (isKYCCompleteEffective ? 'active' : 'blocked'),
    },
    {
      id: 'assessment',
      label: 'Credit assessment',
      status: hasAssessment ? 'completed' : (hasUploadedDocument ? 'active' : 'blocked'),
    },
    {
      id: 'loan',
      label: 'Apply for loan',
      status: !latestLoan ? 'pending' :
        latestLoan.status === 'completed' ? 'completed' :
        latestLoan.status === 'draft' || 
        latestLoan.status === 'submitted' || 
        latestLoan.status === 'under_review' ? 'active' :
        hasAssessment ? 'pending' : 'blocked',
    },
  ];

  // Handlers
  const handleNewAssessment = () => {
    // ✅ Updated: Check if KYC is not submitted or rejected
    if (kycStatus === 'not_submitted' || kycStatus === 'rejected') {
      toast.error('Please complete KYC first to run an assessment');
      openKYCModal();
      return;
    }
    if (!hasUploadedDocument) {
      toast.error('Please upload your bank statement first');
      router.push('/upload');
      return;
    }
    setIsAssessmentModalOpen(true);
  };

  const handleAssessmentSubmit = async (data: AssessmentFormData) => {
    setIsAssessmentLoading(true);
    try {
      await submitAssessment(data);
      setIsAssessmentModalOpen(false);
      toast.success('Assessment completed successfully! 🎉');
    } catch (error) {
      console.error('Assessment failed:', error);
      toast.error('Assessment failed. Please try again.');
    } finally {
      setIsAssessmentLoading(false);
    }
  };

  const handleApplyLoan = () => {
    // ✅ Updated: Check KYC status properly
    if (kycStatus === 'not_submitted' || kycStatus === 'rejected') {
      toast.error('Please complete KYC first to apply for a loan');
      openKYCModal();
      return;
    }
    if (!hasUploadedDocument) {
      toast.error('Please upload your bank statement first');
      router.push('/upload');
      return;
    }
    if (!hasAssessment) {
      toast.error('Please run a credit assessment first');
      setIsAssessmentModalOpen(true);
      return;
    }
    if (creditScore && creditScore < 600) {
      toast.error('Your credit score is below the minimum requirement (600)');
      return;
    }
    setIsLoanModalOpen(true);
  };

  const handleLoanSubmit = async (data: { amount: number; purpose: string; term_months: number }) => {
    setIsLoanLoading(true);
    try {
      const latestAssessment = history[0] || assessment;
      const assessmentId = latestAssessment?.id || 0;
      
      if (!assessmentId) {
        toast.error('No assessment found. Please run an assessment first.');
        return;
      }
      
      await createLoan({
        amount: data.amount,
        purpose: data.purpose,
        term_months: data.term_months,
        assessment_id: assessmentId,
      });
      
      setIsLoanModalOpen(false);
      toast.success('Loan application submitted successfully! 🎉');
      
    } catch (error) {
      console.error('Loan application failed:', error);
      toast.error('Loan application failed. Please try again.');
    } finally {
      setIsLoanLoading(false);
    }
  };

  const handleUploadClick = () => {
    // ✅ Updated: Check KYC status properly
    if (kycStatus === 'not_submitted' || kycStatus === 'rejected') {
      toast.error('Please complete KYC first to upload documents');
      openKYCModal();
      return;
    }
    router.push('/upload');
  };

  const handleHistoryClick = () => {
    router.push('/history');
  };

  const handleKYCSubmit = async (data: KYCFormData) => {
    await submitKYC(data);
    await fetchKYCStatus();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      
      const docs = await uploadAPI.getDocuments();
      set('uploaded_documents', docs);
      const formatted = docs.map((doc: DocumentUpload) => ({
        name: doc.file_name,
        date: formatDate(doc.created_at),
        size: '0.5 MB',
      }));
      setUploadedFiles(formatted);
      setHasUploadedDocument(formatted.length > 0);
      
      toast.success('Dashboard refreshed!');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading state using isLoading from AuthContext
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F5F0]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#1EA537] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8A8470] font-medium text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="px-4 lg:px-8 py-8 max-w-6xl w-full mx-auto bg-[#F7F5F0]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0B3B2E] tracking-tight">Dashboard</h1>
            <p className="text-[#8A8470] text-sm mt-0.5">Welcome back, {userName}</p>
          </div>
        </div>

        {/* Status notice */}
        <StatusNotice
          kycStatus={kycStatus}
          isKYCComplete={isKYCComplete}
          onVerify={openKYCModal}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Credit score hero */}
        <div className="mb-6">
          <CreditHero
            creditScore={creditScore}
            rating={rating}
            riskLevel={riskLevel}
            lastAssessmentDate={lastAssessmentDate}
            fundingLabel={funding.label}
            fundingColor={funding.color}
            onNewAssessment={handleNewAssessment}
            hasAssessment={hasAssessment}
          />
        </div>

        {/* Journey strip */}
        <div className="mb-6">
          <JourneyStrip steps={steps} />
        </div>

        {/* Supporting cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <UploadsSection files={uploadedFiles} onUploadClick={handleUploadClick} />
          <HistorySection history={history} onHistoryClick={handleHistoryClick} />
          <LoanSection 
            loan={latestLoan}
            onApply={handleApplyLoan}
            creditScore={creditScore}
            hasAssessment={hasAssessment}
            hasUploadedDocument={hasUploadedDocument}
            isKYCComplete={isKYCComplete}
          />
        </div>

        {/* Footer */}
        <div className="mt-10 pt-5 border-t border-[#E7E2D6]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#8A8470]">
              © {new Date().getFullYear()} CrediSure. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs text-[#8A8470]">
              <span className="flex items-center gap-1.5">
                <FiInfo className="w-3 h-3" />
                Secure & encrypted
              </span>
              <span>v2.0.0</span>
            </div>
          </div>
        </div>
      </main>

      {/* KYC Modal */}
      <KYCModal
        isOpen={showKYCModal}
        onSubmit={handleKYCSubmit}
        isLoading={isKYCLoading}
        onClose={hideKYCModal}
      />

      {/* Assessment Modal */}
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onSubmit={handleAssessmentSubmit}
        isLoading={isAssessmentLoading || isLoading}
        onClose={() => setIsAssessmentModalOpen(false)}
      />

      {/* Loan Application Modal */}
      <LoanApplicationModal
        isOpen={isLoanModalOpen}
        onSubmit={handleLoanSubmit}
        isLoading={isLoanLoading}
        onClose={() => setIsLoanModalOpen(false)}
        maxAmount={10000000}
        creditScore={creditScore}
      />
    </>
  );
}