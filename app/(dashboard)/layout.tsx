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
  const { isAuthenticated, userInfo, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F5F0]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#1EA537] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8A8470] font-medium text-sm">Redirecting to login…</p>
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
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F7F5F0]">
      <Sidebar userName={userName} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}