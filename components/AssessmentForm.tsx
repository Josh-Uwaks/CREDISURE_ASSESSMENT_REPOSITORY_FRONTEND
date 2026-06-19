'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assessmentSchema } from '@/lib/validation';
import { Field } from './Field';
import { z } from 'zod';
import { FiDollarSign, FiTrendingUp, FiLoader } from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  onSubmit: (data: AssessmentFormData) => void;
  isLoading: boolean;
}

export function AssessmentForm({ onSubmit, isLoading }: AssessmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      monthly_income: 0,
      monthly_expense: 0,
      existing_loans: 0,
    },
  });

  return (
    <div className="max-w-lg">
      <div className="rounded-2xl border border-[#1E2D45] bg-[#0D1E32] p-7">
        <div className="flex items-center gap-2 mb-1">
          <FaMoneyBillWave className="w-4 h-4 text-[#00D4AA]" />
          <p className="text-[10px] font-semibold text-[#8B9BB4] uppercase tracking-widest">
            Credit Assessment
          </p>
        </div>
        <h2 className="text-lg font-semibold text-white mb-6">
          Enter your financials
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Field label="Monthly Income (₦)" error={errors.monthly_income?.message}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9BB4] w-4 h-4" />
              <input
                {...register('monthly_income', { valueAsNumber: true })}
                type="number"
                placeholder="500,000"
                disabled={isLoading}
                className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all disabled:opacity-50"
              />
            </div>
          </Field>

          <Field label="Monthly Expenses (₦)" error={errors.monthly_expense?.message}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9BB4] w-4 h-4" />
              <input
                {...register('monthly_expense', { valueAsNumber: true })}
                type="number"
                placeholder="250,000"
                disabled={isLoading}
                className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all disabled:opacity-50"
              />
            </div>
          </Field>

          <Field label="Existing Loans (₦)" error={errors.existing_loans?.message}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9BB4] w-4 h-4" />
              <input
                {...register('existing_loans', { valueAsNumber: true })}
                type="number"
                placeholder="50,000"
                disabled={isLoading}
                className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all disabled:opacity-50"
              />
            </div>
          </Field>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full bg-[#00D4AA] hover:bg-[#00bfa0] text-[#0A1628] font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Calculating…
              </>
            ) : (
              <>
                <FiTrendingUp className="w-4 h-4" />
                Run Assessment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}