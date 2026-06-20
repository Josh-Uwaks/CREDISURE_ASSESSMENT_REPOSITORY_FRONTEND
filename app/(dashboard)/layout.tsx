// app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, userInfo, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ✅ Use replace for faster navigation
    if (!isAuthenticated && !isLoading) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F5F0]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#1EA537] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8A8470] font-medium text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Get user name
  const getUserName = () => {
    if (!userInfo) return 'User';
    const firstName = userInfo.firstName || 'User';
    const lastName = userInfo.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName;
  };

  const userName = getUserName();

  const handleLogout = async () => {
    await logout();
    // ✅ No need to push here - logout already handles navigation
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F0]">
      <Sidebar userName={userName} onLogout={handleLogout} />
      <div className="flex-1 overflow-y-auto bg-[#F7F5F0]">
        {children}
      </div>
    </div>
  );
}