'use client';

import Link from 'next/link';
import { FaShieldAlt, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { FiTrendingUp, FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#004351] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#004351]/90 backdrop-blur-md border-b border-[#005C6E]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1EA537] flex items-center justify-center shadow-lg shadow-[#1EA537]/20">
              <FaShieldAlt className="w-4 h-4 text-[#004351]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CrediSure</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-sm px-5 py-2.5 rounded-lg bg-[#1EA537] text-white font-bold hover:bg-[#188A2D] transition-all shadow-md hover:shadow-lg hover:shadow-[#1EA537]/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Dark Theme) */}
      <section className="pt-40 pb-28 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1EA537]/10 border border-[#1EA537]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="text-xs text-[#1EA537] font-bold tracking-wide uppercase">🚀 AI-Powered Credit Assessment</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Your Credit Score,
            <br />
            <span className="text-[#1EA537]">Reimagined.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get your credit score, risk rating, and funding readiness in minutes. 
            Securely connect your financial data and unlock instant insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1EA537] text-white font-bold hover:bg-[#188A2D] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1EA537]/20 text-lg"
            >
              Get Started Free
              <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#005C6E] text-white hover:bg-[#005C6E]/50 transition-all font-semibold text-lg flex items-center justify-center"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section (Light Theme Transition) */}
      <section className="py-24 px-6 bg-white text-[#004351]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CrediSure?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We leverage advanced analytics to provide a clearer, more accurate picture of your financial health.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[#1EA537]/10 flex items-center justify-center mb-6">
                <FiTrendingUp className="w-6 h-6 text-[#1EA537]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Credit Score</h3>
              <p className="text-gray-600 leading-relaxed">
                Skip the wait. Get your comprehensive credit score instantly based on your real-time financial data.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[#1EA537]/10 flex items-center justify-center mb-6">
                <FaChartLine className="w-6 h-6 text-[#1EA537]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Risk Assessment</h3>
              <p className="text-gray-600 leading-relaxed">
                Understand your unique risk profile with deep, actionable insights into your financial habits and future.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[#1EA537]/10 flex items-center justify-center mb-6">
                <FaMoneyBillWave className="w-6 h-6 text-[#1EA537]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Funding Readiness</h3>
              <p className="text-gray-600 leading-relaxed">
                Know exactly where you stand. Discover if you qualify for funding and how much capital you can access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Dark Theme) */}
      <footer className="py-12 px-6 bg-[#004351] border-t border-[#005C6E]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="w-5 h-5 text-[#1EA537]" />
            <span className="text-lg font-bold text-white">CrediSure</span>
          </div>
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} CrediSure. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}