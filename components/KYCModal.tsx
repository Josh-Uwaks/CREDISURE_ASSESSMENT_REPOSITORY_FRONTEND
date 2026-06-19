// components/KYCModal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { kycSchema, KYCFormData } from '@/lib/validation';
import { Field } from './Field';
import { useEffect, useRef, useState } from 'react';
import { FiX, FiCheck, FiUser, FiMapPin, FiShield, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

interface KYCModalProps {
  isOpen: boolean;
  onSubmit: (data: KYCFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export function KYCModal({ isOpen, onSubmit, isLoading, onClose }: KYCModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      gender: '',
      country: 'Nigeria',
      state: '',
      city: '',
      id_type: '',
      first_name: '',
      last_name: '',
      dob: '',
      address: '',
      mobile_no: '',
      id_number: '',
      middle_name: '',
      postal_code: '',
    },
  });

  // Reset form when modal opens - FIXED with requestAnimationFrame
  useEffect(() => {
    if (isOpen) {
      reset();
      // Defer state update to prevent cascading renders
      requestAnimationFrame(() => {
        setStep(1);
      });
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

  // Validate current step before proceeding
  const nextStep = async () => {
    let fieldsToValidate: (keyof KYCFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['title', 'gender', 'first_name', 'last_name', 'dob'];
    } else if (step === 2) {
      fieldsToValidate = ['address', 'country', 'state', 'city', 'postal_code'];
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  if (!isOpen) return null;

  const stepTitles = ['Personal Information', 'Address Details', 'Identity Verification'];
  const stepDescriptions = [
    'Please provide your personal details to get started.',
    'Tell us where you\'re located.',
    'Verify your identity to unlock all features.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
      <div 
        ref={modalRef} 
        className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn relative"
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 z-10"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#1EA537]/10 flex items-center justify-center shrink-0">
            {step === 1 && <FiUser className="w-5 h-5 text-[#1EA537]" />}
            {step === 2 && <FiMapPin className="w-5 h-5 text-[#1EA537]" />}
            {step === 3 && <FiShield className="w-5 h-5 text-[#1EA537]" />}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Step {step} of 3
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {stepTitles[step - 1]}
            </h2>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#1EA537]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-6">
          {stepDescriptions[step - 1]}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title" error={errors.title?.message}>
                  <select
                    {...register('title')}
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Title</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </Field>

                <Field label="Gender" error={errors.gender?.message}>
                  <select
                    {...register('gender')}
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </Field>
              </div>

              <Field label="First Name" error={errors.first_name?.message}>
                <input
                  {...register('first_name')}
                  type="text"
                  placeholder="John"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <Field label="Middle Name" error={errors.middle_name?.message}>
                <input
                  {...register('middle_name')}
                  type="text"
                  placeholder="David (Optional)"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <Field label="Last Name" error={errors.last_name?.message}>
                <input
                  {...register('last_name')}
                  type="text"
                  placeholder="Doe"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <Field label="Date of Birth" error={errors.dob?.message}>
                <input
                  {...register('dob')}
                  type="date"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>
            </div>
          )}

          {/* STEP 2: Address Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <Field label="Address" error={errors.address?.message}>
                <input
                  {...register('address')}
                  type="text"
                  placeholder="123 Main Street"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Country" error={errors.country?.message}>
                  <input
                    {...register('country')}
                    type="text"
                    placeholder="Nigeria"
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </Field>

                <Field label="State" error={errors.state?.message}>
                  <input
                    {...register('state')}
                    type="text"
                    placeholder="Lagos"
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="City" error={errors.city?.message}>
                  <input
                    {...register('city')}
                    type="text"
                    placeholder="Ikeja"
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </Field>

                <Field label="Postal Code" error={errors.postal_code?.message}>
                  <input
                    {...register('postal_code')}
                    type="text"
                    placeholder="100001"
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 3: Identity Verification */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <Field label="Mobile Number" error={errors.mobile_no?.message}>
                <input
                  {...register('mobile_no')}
                  type="tel"
                  placeholder="+2348012345678"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="ID Type" error={errors.id_type?.message}>
                  <select
                    {...register('id_type')}
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select ID Type</option>
                    <option value="Passport">International Passport</option>
                    <option value="National ID">National ID</option>
                    <option value="Driver's License">Driver&apos;s License</option>
                    <option value="Voter's Card">Voter&apos;s Card</option>
                  </select>
                </Field>

                <Field label="ID Number" error={errors.id_number?.message}>
                  <input
                    {...register('id_number')}
                    type="text"
                    placeholder="A1234567"
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1EA537] focus:ring-2 focus:ring-[#1EA537]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl border border-gray-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
                className="flex-1 bg-[#1EA537] hover:bg-[#188A2D] text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1EA537]/20 flex items-center justify-center gap-2"
              >
                Continue
                <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#1EA537] hover:bg-[#188A2D] text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#1EA537]/20"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting KYC…
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Complete KYC
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center mt-2">
            By submitting, you agree to our terms and conditions. Your information is secure.
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