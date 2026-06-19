'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KYCData } from '@/types';
import { Field } from './Field';
import { KYCFormData, kycSchema } from '@/lib/validation';


interface KYCFormProps {
  onSubmit: (data: KYCData) => void;
  isLoading: boolean;
}

export function KYCForm({ onSubmit, isLoading }: KYCFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      title: '',
      gender: '',
      country: 'Nigeria',
      state: '',
      city: '',
      id_type: '',
    },
  });

  return (
    <div className="max-w-2xl w-full">
      <div className="rounded-2xl border border-[#1E2D45] bg-[#0D1E32] p-7">
        <p className="text-[10px] font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1">Identity Verification</p>
        <h2 className="text-lg font-semibold text-white mb-6">Complete Your KYC</h2>
        <p className="text-sm text-[#8B9BB4] mb-6">
          Please provide your personal information to verify your identity.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Title */}
          <Field label="Title" error={errors.title?.message}>
            <select
              {...register('title')}
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            >
              <option value="">Select Title</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
            </select>
          </Field>

          {/* First Name */}
          <Field label="First Name" error={errors.first_name?.message}>
            <input
              {...register('first_name')}
              type="text"
              placeholder="John"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Middle Name */}
          <Field label="Middle Name" error={errors.middle_name?.message}>
            <input
              {...register('middle_name')}
              type="text"
              placeholder="David"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Last Name */}
          <Field label="Last Name" error={errors.last_name?.message}>
            <input
              {...register('last_name')}
              type="text"
              placeholder="Doe"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Gender */}
          <Field label="Gender" error={errors.gender?.message}>
            <select
              {...register('gender')}
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>

          {/* Date of Birth */}
          <Field label="Date of Birth" error={errors.dob?.message}>
            <input
              {...register('dob')}
              type="date"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Address */}
          <Field label="Address" error={errors.address?.message}>
            <input
              {...register('address')}
              type="text"
              placeholder="123 Main Street, Lagos"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Mobile Number */}
          <Field label="Mobile Number" error={errors.mobile_no?.message}>
            <input
              {...register('mobile_no')}
              type="tel"
              placeholder="+2348012345678"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Country */}
          <Field label="Country" error={errors.country?.message}>
            <input
              {...register('country')}
              type="text"
              placeholder="Nigeria"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* State */}
          <Field label="State" error={errors.state?.message}>
            <input
              {...register('state')}
              type="text"
              placeholder="Lagos"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* City */}
          <Field label="City" error={errors.city?.message}>
            <input
              {...register('city')}
              type="text"
              placeholder="Ikeja"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Postal Code */}
          <Field label="Postal Code" error={errors.postal_code?.message}>
            <input
              {...register('postal_code')}
              type="text"
              placeholder="100001"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* ID Type */}
          <Field label="ID Type" error={errors.id_type?.message}>
            <select
              {...register('id_type')}
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            >
              <option value="">Select ID Type</option>
              <option value="Passport">International Passport</option>
              <option value="National ID">National ID</option>
              <option value="Driver's License">Driver&apos;s License</option>
              <option value="Voter's Card">Voter&apos;s Card</option>
            </select>
          </Field>

          {/* ID Number */}
          <Field label="ID Number" error={errors.id_number?.message}>
            <input
              {...register('id_number')}
              type="text"
              placeholder="A1234567"
              disabled={isLoading}
              className="w-full bg-[#0A1628] border border-[#1E2D45] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3D5170] focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-all"
            />
          </Field>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-[#00D4AA] hover:bg-[#00bfa0] text-[#0A1628] font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting KYC…
              </>
            ) : 'Submit KYC'}
          </button>
        </form>
      </div>
    </div>
  );
}