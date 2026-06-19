// components/LoanApplicationModal.tsx
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Field } from './Field';
import { useEffect, useRef } from 'react';
import { FiX, FiDollarSign, FiCalendar, FiFileText, FiCheck, FiLoader } from 'react-icons/fi';

// Validation schema for loan application
const loanSchema = z.object({
  amount: z.number()
    .min(1000, 'Minimum loan amount is ₦1,000')
    .max(10000000, 'Maximum loan amount is ₦10,000,000'),
  purpose: z.string().min(10, 'Please provide a detailed purpose for the loan (minimum 10 characters)'),
  term_months: z.number()
    .min(1, 'Minimum term is 1 month')
    .max(24, 'Maximum term is 24 months'),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface LoanApplicationModalProps {
  isOpen: boolean;
  onSubmit: (data: LoanFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  maxAmount?: number;
  creditScore?: number | null;
}

export function LoanApplicationModal({ 
  isOpen, 
  onSubmit, 
  isLoading, 
  onClose,
  maxAmount = 10000000,
  creditScore
}: LoanApplicationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control, // ✅ Add 'control' for useWatch
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      amount: 0,
      purpose: '',
      term_months: 6,
    },
  });

  // ✅ Replace watch() with useWatch() for React Compiler compatibility
  const watchAmount = useWatch({
    control,
    name: 'amount',
    defaultValue: 0,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isLoading, onClose]);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Determine max amount based on credit score
  const effectiveMax = creditScore 
    ? Math.min(maxAmount, creditScore * 100)
    : maxAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3B2E]/60 backdrop-blur-sm animate-fadeIn p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl border border-[#E7E2D6] shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn relative"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#F7F5F0] transition-all text-[#8A8470] hover:text-[#0B3B2E] z-10 disabled:opacity-50"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#1EA537]/10 flex items-center justify-center shrink-0">
            <FiDollarSign className="w-6 h-6 text-[#1EA537]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#8A8470] uppercase tracking-widest">
              Loan Application
            </p>
            <h2 className="text-xl font-bold text-[#0B3B2E]">Apply for Funding</h2>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#F7F5F0] rounded-xl p-4 mb-6 border border-[#E7E2D6]">
          <div className="flex items-start gap-2">
            <FiFileText className="w-4 h-4 text-[#1EA537] shrink-0 mt-0.5" />
            <p className="text-xs text-[#5C5848]">
              Complete this application to request funding. Your application will be reviewed based on your credit assessment.
              {creditScore && (
                <span className="block mt-1 font-medium text-[#0B3B2E]">
                  Credit Score: {creditScore} · Max loan: ₦{effectiveMax.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Loan Amount */}
          <Field label="Loan Amount (₦)" error={errors.amount?.message}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8470] w-4 h-4" />
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                placeholder="100,000"
                disabled={isLoading}
                className="w-full bg-[#F7F5F0] border border-[#E7E2D6] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B3B2E] placeholder:text-[#B5AF9C] focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-[#8A8470]">Max: ₦{effectiveMax.toLocaleString()}</p>
              {watchAmount > 0 && (
                <p className="text-xs font-medium text-[#1EA537]">
                  ₦{watchAmount.toLocaleString()}
                </p>
              )}
            </div>
          </Field>

          {/* Loan Purpose */}
          <Field label="Purpose of Loan" error={errors.purpose?.message}>
            <textarea
              {...register('purpose')}
              placeholder="Describe what you need the loan for..."
              disabled={isLoading}
              rows={3}
              className="w-full bg-[#F7F5F0] border border-[#E7E2D6] rounded-xl px-4 py-3 text-sm text-[#0B3B2E] placeholder:text-[#B5AF9C] focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            <p className="text-xs text-[#8A8470] mt-1">
              Be specific about how you&apos;ll use the funds
            </p>
          </Field>

          {/* Loan Term */}
          <Field label="Repayment Term" error={errors.term_months?.message}>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8470] w-4 h-4" />
              <select
                {...register('term_months', { valueAsNumber: true })}
                disabled={isLoading}
                className="w-full bg-[#F7F5F0] border border-[#E7E2D6] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B3B2E] placeholder:text-[#B5AF9C] focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="9">9 months</option>
                <option value="12">12 months</option>
                <option value="18">18 months</option>
                <option value="24">24 months</option>
              </select>
            </div>
            <p className="text-xs text-[#8A8470] mt-1">
              Choose a term that fits your repayment capacity
            </p>
          </Field>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1EA537] hover:bg-[#188A2D] text-white font-semibold py-3.5 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                Submit Application
              </>
            )}
          </button>

          <p className="text-xs text-[#8A8470] text-center mt-1">
            By submitting, you agree to our terms and conditions.
          </p>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}