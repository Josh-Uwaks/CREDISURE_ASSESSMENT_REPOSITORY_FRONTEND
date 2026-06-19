
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, LoginFormData } from '@/lib/validation';
import { useAuth } from '@/context/AuthContext';
import { FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    // 'h-screen' and 'overflow-hidden' lock the viewport to prevent page scrolling
    <div className="h-screen w-full flex items-center justify-center bg-[#004051] p-4 font-sans overflow-hidden">
      
      {/* 'max-h-[90vh]' and 'overflow-y-auto' allow the card to scroll only if content overflows */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 w-full max-w-md p-8 border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-5 group">
            <div className="w-12 h-12 bg-[#1EA537] rounded-xl flex items-center justify-center shadow-lg shadow-[#1EA537]/20 group-hover:scale-105 transition-transform duration-300">
              <FaShieldAlt className="w-6 h-6 text-[#004051]" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#004051] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Sign in to continue to CrediSure
          </p>
        </div>

        {/* Login Form */}
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-[#004051]">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs font-semibold text-[#1EA537] hover:text-[#188A2D] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 
                         bg-gray-50 text-[#004051]
                         focus:bg-white focus:ring-2 focus:ring-[#1EA537]/50 focus:border-[#1EA537]
                         placeholder:text-gray-400
                         transition-all duration-200 outline-none pr-12 text-sm font-medium"
                disabled={isLoading}
                autoComplete="current-password"
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
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm font-medium text-gray-500">
          Don&apos;t have an account?{' '}
          <Link 
            href="/register" 
            className="text-[#1EA537] hover:underline font-bold hover:text-[#188A2D] transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
