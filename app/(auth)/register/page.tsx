'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, RegisterFormData } from '@/lib/validation';
import { useAuth } from '@/context/AuthContext';
import { FiEye, FiEyeOff, FiLoader, FiCheck } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = useWatch({
    control,
    name: 'password',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password);
      // The context handles success toast and redirect
    } catch (error) {
      // Error is handled by the context
      console.error('Registration error:', error);
    }
  };

  // Helper for password requirements
  const reqs = [
    { label: 'At least 8 characters', met: password?.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password || '') },
    { label: 'One lowercase letter', met: /[a-z]/.test(password || '') },
    { label: 'One number', met: /[0-9]/.test(password || '') },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#004051] p-4 font-sans">
      {/* Changed to max-w-md (448px) for a perfectly moderate, standard auth card size */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 w-full lg:w-md p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-5 group">
            <div className="w-12 h-12 bg-[#1EA537] rounded-xl flex items-center justify-center shadow-lg shadow-[#1EA537]/20 group-hover:scale-105 transition-transform duration-300">
              <FaShieldAlt className="w-6 h-6 text-[#004051]" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#004051] tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Join CrediSure for free today
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-[#004051] mb-1.5">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                       bg-gray-50 text-[#004051]
                       focus:bg-white focus:ring-2 focus:ring-[#1EA537]/50 focus:border-[#1EA537]
                       placeholder:text-gray-400
                       transition-all duration-200 outline-none text-sm font-medium"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm font-semibold text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-[#004051] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         bg-gray-50 text-[#004051]
                         focus:bg-white focus:ring-2 focus:ring-[#1EA537]/50 focus:border-[#1EA537]
                         placeholder:text-gray-400
                         transition-all duration-200 outline-none pr-12 text-sm font-medium"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004051] transition-colors"
              >
                {showPassword ? (
                  <FiEye className="w-5 h-5" />
                ) : (
                  <FiEyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm font-semibold text-red-500">
                {errors.password.message}
              </p>
            )}
            
            {/* Password requirements hint */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
              {reqs.map((req, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-1.5 transition-colors duration-200 ${
                    req.met ? 'text-[#1EA537]' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                    req.met ? 'bg-[#1EA537]/10' : 'bg-gray-100'
                  }`}>
                    <FiCheck className={`w-2.5 h-2.5 ${req.met ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                  </div>
                  {req.label}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-bold text-[#004051] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         bg-gray-50 text-[#004051]
                         focus:bg-white focus:ring-2 focus:ring-[#1EA537]/50 focus:border-[#1EA537]
                         placeholder:text-gray-400
                         transition-all duration-200 outline-none pr-12 text-sm font-medium"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004051] transition-colors"
              >
                {showConfirmPassword ? (
                  <FiEye className="w-5 h-5" />
                ) : (
                  <FiEyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm font-semibold text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1EA537] hover:bg-[#188A2D] active:bg-[#157a27] 
                     text-white font-bold py-3.5 px-4 rounded-xl mt-2 text-base
                     transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1EA537]/20
                     disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                     focus:outline-none focus:ring-2 focus:ring-[#1EA537] focus:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <FiLoader className="w-5 h-5 animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm font-medium text-gray-500">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-[#1EA537] hover:underline font-bold hover:text-[#188A2D] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}