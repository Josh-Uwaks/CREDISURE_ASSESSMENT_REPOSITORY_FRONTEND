// components/Sidebar.tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUpload, 
  FiClock,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

// ====== TYPES ======
interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  comingSoon?: boolean;
}

interface SidebarProps {
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ userName, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiUpload, label: 'Upload', path: '/upload' },
    { icon: FiClock, label: 'History', path: '/history' }, // ✅ History link
  ];

  const comingSoonItems: NavItem[] = [
    { icon: FiUser, label: 'Profile', comingSoon: true },
    { icon: FiSettings, label: 'Settings', comingSoon: true },
  ];

  const handleNavigation = (item: NavItem) => {
    if (item.comingSoon) {
      if (item.label === 'Profile') {
        toast('Profile management coming soon! 🚀', {
          icon: '👤',
          duration: 3000,
        });
      } else if (item.label === 'Settings') {
        toast('Settings coming soon! ⚙️', {
          icon: '⚙️',
          duration: 3000,
        });
      }
      setIsOpen(false);
      return;
    }

    if (item.path) {
      router.push(item.path);
    }
    setIsOpen(false);
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-[#E7E2D6] hover:bg-[#F7F5F0] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX className="w-5 h-5 text-[#0B3B2E]" /> : <FiMenu className="w-5 h-5 text-[#0B3B2E]" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 h-screen bg-white border-r border-[#E7E2D6]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#E7E2D6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#1EA537] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="text-lg font-bold text-[#0B3B2E] tracking-tight">CrediSure</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-[#1EA537]/10 text-[#1EA537]' 
                    : 'text-[#5C5848] hover:bg-[#F7F5F0] hover:text-[#0B3B2E]'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}

            <div className="my-4 border-t border-[#E7E2D6]" />

            <div className="px-4 py-2">
              <p className="text-[10px] font-semibold text-[#B5AF9C] uppercase tracking-wider">
                Coming Soon
              </p>
            </div>

            {comingSoonItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-[#B5AF9C] hover:bg-[#F7F5F0] hover:text-[#5C5848]"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] font-medium text-[#1EA537] bg-[#1EA537]/10 px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[#E7E2D6]">
            <div className="flex items-center gap-3 px-2">
              <FaUserCircle className="w-10 h-10 text-[#B5AF9C]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0B3B2E] truncate">{userName}</p>
                <p className="text-xs text-[#8A8470]">Account</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-[#F7F5F0] rounded-lg transition-colors text-[#8A8470] hover:text-[#B91C1C]"
                title="Logout"
                aria-label="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}