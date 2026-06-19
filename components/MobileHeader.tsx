'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiMenu, FiX, FiUpload, FiHome, FiClock, FiLogOut, FiUser } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';

interface MobileHeaderProps {
  onUploadClick?: () => void;
}

export function MobileHeader({ onUploadClick }: MobileHeaderProps) {
  const router = useRouter();
  const { logout, userInfo } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const handleUploadClick = () => {
    setIsMenuOpen(false);
    if (onUploadClick) {
      onUploadClick();
    } else {
      router.push('/upload');
    }
  };

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    router.push('/dashboard');
  };

  const handleHistoryClick = () => {
    setIsMenuOpen(false);
    router.push('/dashboard?tab=history');
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#1E2D45] bg-[#0D1E32] lg:hidden sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00D4AA] flex items-center justify-center">
            <FaShieldAlt className="w-4 h-4 text-[#0A1628]" />
          </div>
          <span className="text-sm font-semibold text-white">CrediSure</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleUploadClick}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30 font-medium hover:bg-[#00D4AA]/20 transition-all flex items-center gap-1.5"
          >
            <FiUpload className="w-3 h-3" />
            Upload
          </button>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-all text-[#8B9BB4] hover:text-white"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-15.25 z-40 bg-[#0D1E32] border-b border-[#1E2D45] shadow-xl animate-slideDown">
          <nav className="flex flex-col p-4 gap-1">
            <div className="px-3 py-3 mb-2 border-b border-[#1E2D45]">
              <p className="text-xs text-[#8B9BB4]">Signed in as</p>
              <div className="flex items-center gap-2 mt-1">
                <FiUser className="w-4 h-4 text-[#00D4AA]" />
                <p className="text-sm text-white font-medium truncate">{userInfo.email}</p>
              </div>
            </div>

            <button
              onClick={handleDashboardClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8B9BB4] hover:text-white hover:bg-white/5 transition-all w-full"
            >
              <FiHome className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={handleHistoryClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8B9BB4] hover:text-white hover:bg-white/5 transition-all w-full"
            >
              <FiClock className="w-4 h-4" />
              History
            </button>

            <button
              onClick={handleUploadClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8B9BB4] hover:text-white hover:bg-white/5 transition-all w-full"
            >
              <FiUpload className="w-4 h-4" />
              Upload Statement
            </button>

            <div className="my-2 border-t border-[#1E2D45]"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all w-full"
            >
              <FiLogOut className="w-4 h-4" />
              Sign out
            </button>
          </nav>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}