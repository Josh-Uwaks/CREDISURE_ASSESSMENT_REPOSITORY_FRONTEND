// components/AssessmentModal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assessmentSchema } from '@/lib/validation';
import { Field } from './Field';
import { z } from 'zod';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiLoader, 
  FiX,
  FiInfo,
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentModalProps {
  isOpen: boolean;
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export function AssessmentModal({ isOpen, onSubmit, isLoading, onClose }: AssessmentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      monthly_income: 0,
      monthly_expense: 0,
      existing_loans: 0,
    },
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn relative"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 z-10 disabled:opacity-50"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <FaMoneyBillWave className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Credit Assessment
            </p>
            <h2 className="text-xl font-bold text-slate-900">Enter Your Financials</h2>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex items-start gap-2">
            <FiInfo className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              Provide your financial details to get your credit score and funding readiness assessment.
              All information is confidential and used only for this calculation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Monthly Income */}
          <Field label="Monthly Income (₦)" error={errors.monthly_income?.message}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...register('monthly_income', { valueAsNumber: true })}
                type="number"
                placeholder="500,000"
                disabled={isLoading}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </Field>

          {/* Monthly Expenses */}
          <Field label="Monthly Expenses (₦)" error={errors.monthly_expense?.message}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...register('monthly_expense', { valueAsNumber: true })}
                type="number"
                placeholder="250,000"
                disabled={isLoading}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </Field>

          {/* Existing Loans */}
          <Field label="Existing Loans (₦)" error={errors.existing_loans?.message}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                {...register('existing_loans', { valueAsNumber: true })}
                type="number"
                placeholder="50,000"
                disabled={isLoading}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </Field>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <FiTrendingUp className="w-4 h-4" />
                Run Assessment
              </>
            )}
          </button>

          {/* Security Note */}
          <p className="text-xs text-slate-400 text-center mt-2">
            Your financial data is encrypted and securely processed
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