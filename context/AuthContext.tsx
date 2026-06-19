// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI, kycAPI, assessmentAPI, loanAPI } from '@/lib/api';
import { 
  AssessmentResponse, 
  AssessmentHistory, 
  KYCResponse,
  KYCStatusResponse,
  UserInfo,
  AuthContextType,
  LoanApplicationData,
  LoanResponse,
  KYCStatus
} from '@/types';
import { KYCFormData, AssessmentFormData } from '@/lib/validation';
import { AxiosError } from 'axios';
import { useCache } from './CacheContext';

// ============================================
// COOKIE HELPERS
// ============================================

const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

// ============================================
// CACHE KEYS
// ============================================

const CACHE_KEYS = {
  KYC_STATUS: 'kyc_status',
  ASSESSMENT_HISTORY: 'assessment_history',
  LOANS: 'loans',
  ASSESSMENT: 'credit_assessment',
};

// ============================================
// CONTEXT
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { get, set, invalidate } = useCache();
  
  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<'assessment' | 'upload' | null>(null);
  
  // KYC State
  const [kycData, setKycData] = useState<KYCResponse | null>(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [isKYCLoading, setIsKYCLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_submitted');
  const [kycStatusInfo, setKycStatusInfo] = useState<KYCStatusResponse | null>(null);
  
  // Assessment State
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // Loan State
  const [loans, setLoans] = useState<LoanResponse[]>([]);

  // ============================================
  // DERIVED STATE
  // ============================================
  const userInfo = useMemo((): UserInfo => {
    if (!token) return { email: 'User', id: null, firstName: 'User' };
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const email = payload.email || payload.sub || 'User';
      const userId = payload.sub || payload.id || payload.user_id || null;
      let firstName = payload.first_name || payload.given_name || 'User';
      
      if (firstName === 'User' && email && email !== 'User') {
        firstName = email.split('@')[0];
      }
      
      const lastName = payload.last_name || payload.family_name || undefined;
      
      return { 
        email: email,
        id: userId || email,
        firstName: firstName,
        lastName: lastName,
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return { email: 'User', id: null, firstName: 'User' };
    }
  }, [token]);

  const isAuthenticated = !!token;
  const isKYCComplete = kycStatus === 'verified';
  const hasSubmittedKYC = kycStatus !== 'not_submitted';

  // ============================================
  // ACTIONS
  // ============================================
  
  // 1. Fetch KYC Status - With Caching
  const fetchKYCStatus = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    // Check cache first
    if (!forceRefresh) {
      const cached = get<KYCStatusResponse>(CACHE_KEYS.KYC_STATUS);
      if (cached) {
        setKycStatusInfo(cached);
        setKycStatus(cached.status);
        if (cached.exists && cached.full_name && kycData) {
          setKycData({
            ...kycData,
            full_name: cached.full_name,
          } as KYCResponse);
        }
        return;
      }
    }

    try {
      const status = await kycAPI.getKYCStatus();
      set(CACHE_KEYS.KYC_STATUS, status);
      setKycStatusInfo(status);
      
      setKycStatus(status.status);
      
      if (status.exists && status.status === 'verified') {
        setShowKYCModal(false);
        if (kycData) {
          setKycData({
            ...kycData,
            status: 'verified',
            full_name: status.full_name || kycData.full_name,
          } as KYCResponse);
        }
      } else if (status.exists && status.status === 'pending') {
        setShowKYCModal(false);
        if (kycData) {
          setKycData({
            ...kycData,
            status: 'pending',
            full_name: status.full_name || kycData.full_name,
          } as KYCResponse);
        }
      } else if (status.exists && status.status === 'rejected') {
        setShowKYCModal(true);
        if (kycData) {
          setKycData({
            ...kycData,
            status: 'rejected',
            full_name: status.full_name || kycData.full_name,
          } as KYCResponse);
        }
      } else {
        // status === 'not_submitted'
        setKycData(null);
        if (isAuthenticated) {
          setTimeout(() => setShowKYCModal(true), 500);
        }
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      setKycStatus('not_submitted');
    }
  }, [isAuthenticated, kycData, get, set]);

  // 2. Fetch History - With Caching
  const fetchHistory = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (!forceRefresh) {
      const cached = get<AssessmentHistory[]>(CACHE_KEYS.ASSESSMENT_HISTORY);
      if (cached && cached.length > 0) {
        setHistory(cached);
        return;
      }
    }

    try {
      const data = await assessmentAPI.getHistory();
      setHistory(data);
      set(CACHE_KEYS.ASSESSMENT_HISTORY, data);
      localStorage.setItem('assessment_history', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      const cached = localStorage.getItem('assessment_history');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setHistory(parsed);
          set(CACHE_KEYS.ASSESSMENT_HISTORY, parsed);
        } catch {}
      }
    }
  }, [get, set]);

  // 3. Fetch Loans - With Caching
  const fetchLoans = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (!forceRefresh) {
      const cached = get<LoanResponse[]>(CACHE_KEYS.LOANS);
      if (cached && cached.length > 0) {
        setLoans(cached);
        return;
      }
    }

    try {
      const data = await loanAPI.getLoans();
      setLoans(data);
      set(CACHE_KEYS.LOANS, data);
      localStorage.setItem('loans', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching loans:', error);
      const cached = localStorage.getItem('loans');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setLoans(parsed);
          set(CACHE_KEYS.LOANS, parsed);
        } catch {}
      }
    }
  }, [get, set]);

  // 4. Refresh User - With Force Refresh Option
  const refreshUser = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    try {
      await fetchKYCStatus(forceRefresh);
      await fetchHistory(forceRefresh);
      await fetchLoans(forceRefresh);
      
      const saved = localStorage.getItem('credit_assessment');
      if (saved) {
        try {
          setAssessment(JSON.parse(saved));
        } catch {}
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [fetchKYCStatus, fetchHistory, fetchLoans]);

  // 5. Load User Data
  const loadUserData = useCallback(async () => {
    try {
      await refreshUser(false);
      const saved = localStorage.getItem('credit_assessment');
      if (saved) {
        try {
          setAssessment(JSON.parse(saved));
        } catch {}
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [refreshUser]);

  // 6. Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      setToken(response.access_token);
      localStorage.setItem('access_token', response.access_token);
      
      setCookie('access_token', response.access_token, 7);
      
      await loadUserData();
      
      toast.success('Welcome back! 👋');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, loadUserData]);

  // 7. Register
  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authAPI.register({ email, password });
      toast.success('Account created! Please login.');
      router.push('/login');
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 8. Logout - Clear Cache
  const logout = useCallback(() => {
    setToken(null);
    setKycData(null);
    setKycStatus('not_submitted');
    setKycStatusInfo(null);
    setAssessment(null);
    setHistory([]);
    setLoans([]);
    setShowKYCModal(false);
    setPendingAction(null);
    
    // Clear cache
    invalidate(CACHE_KEYS.KYC_STATUS);
    invalidate(CACHE_KEYS.ASSESSMENT_HISTORY);
    invalidate(CACHE_KEYS.LOANS);
    invalidate(CACHE_KEYS.ASSESSMENT);
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('credit_assessment');
    localStorage.removeItem('kyc_submitted');
    localStorage.removeItem('uploaded_files');
    localStorage.removeItem('assessment_history');
    localStorage.removeItem('risk_level');
    localStorage.removeItem('loans');
    localStorage.removeItem('loan_data');
    
    removeCookie('access_token');
    
    toast.success('Logged out');
    router.push('/login');
  }, [router, invalidate]);

  // 9. Submit KYC - Invalidate Cache
  const submitKYC = useCallback(async (data: KYCFormData) => {
    setIsKYCLoading(true);
    try {
      const result = await kycAPI.submitKYC(data);
      setKycData(result);
      setKycStatus('pending');
      setShowKYCModal(false);
      localStorage.setItem('kyc_submitted', JSON.stringify(result));
      
      invalidate(CACHE_KEYS.KYC_STATUS);
      
      toast.success('KYC submitted successfully! 🎉');
      
      if (pendingAction === 'assessment') {
        setPendingAction(null);
        toast.success('You can now run your assessment!');
      } else if (pendingAction === 'upload') {
        setPendingAction(null);
        router.push('/upload');
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'KYC submission failed. Please try again.');
      throw error;
    } finally {
      setIsKYCLoading(false);
    }
  }, [pendingAction, router, invalidate]);

  // 10. Submit Assessment - Invalidate Cache
  const submitAssessment = useCallback(async (data: AssessmentFormData): Promise<void> => {
    if (kycStatus === 'not_submitted' || kycStatus === 'rejected') {
      setShowKYCModal(true);
      setPendingAction('assessment');
      toast('Please complete KYC to run an assessment', {
        icon: '⚠️',
        duration: 3000,
      });
      throw new Error('KYC required');
    }

    setIsLoading(true);
    try {
      const result = await assessmentAPI.createAssessment({
        monthly_income: Number(data.monthly_income),
        monthly_expense: Number(data.monthly_expense),
        existing_loans: Number(data.existing_loans || 0),
      });
      
      setAssessment(result);
      localStorage.setItem('credit_assessment', JSON.stringify(result));
      
      invalidate(CACHE_KEYS.ASSESSMENT_HISTORY);
      await fetchHistory(true);
      
      toast.success('Assessment complete! 🎉');
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'Assessment failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [kycStatus, fetchHistory, invalidate]);

  // 11. Create Loan - Invalidate Cache
  const createLoan = useCallback(async (data: LoanApplicationData): Promise<LoanResponse> => {
    setIsLoading(true);
    try {
      const result = await loanAPI.createLoan(data);
      toast.success('Loan application submitted successfully! 🎉');
      
      invalidate(CACHE_KEYS.LOANS);
      await fetchLoans(true);
      
      return result;
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'Loan application failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLoans, invalidate]);

  // 12. Require KYC for actions
  const requireKYC = useCallback((action: () => void) => {
    if (kycStatus === 'not_submitted' || kycStatus === 'rejected') {
      setShowKYCModal(true);
      setPendingAction('assessment');
      toast('Please complete KYC first', {
        icon: '⚠️',
        duration: 3000,
      });
    } else {
      action();
    }
  }, [kycStatus]);

  // 13. Open KYC Modal
  const openKYCModal = useCallback(() => {
    setShowKYCModal(true);
  }, []);

  // 14. Hide KYC Modal
  const hideKYCModal = useCallback(() => {
    if (kycStatus === 'not_submitted' || kycStatus === 'rejected') {
      setShowKYCModal(false);
      toast('You can complete KYC later from the banner', {
        icon: 'ℹ️',
        duration: 3000,
      });
    } else {
      setShowKYCModal(false);
    }
  }, [kycStatus]);

  // 15. Reset Assessment
  const resetAssessment = useCallback(() => {
    setAssessment(null);
    localStorage.removeItem('credit_assessment');
  }, []);

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        setToken(storedToken);
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('access_token='));
        if (!cookieToken) {
          setCookie('access_token', storedToken, 7);
        }
        await loadUserData();
      }
      setIsLoading(false);
    };

    void init();
  }, [loadUserData]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    // Auth State
    token,
    userInfo,
    isAuthenticated,
    isLoading,
    
    // KYC State
    kycData,
    isKYCComplete,
    showKYCModal,
    isKYCLoading,
    kycStatus,
    kycStatusInfo,
    hasSubmittedKYC,
    
    // Assessment State
    assessment,
    history,
    activeTab,
    
    // Loan State
    loans,
    activeLoan: null,
    
    // Actions
    login,
    register,
    logout,
    submitKYC,
    submitAssessment,
    fetchHistory,
    setActiveTab,
    openKYCModal,
    hideKYCModal,
    resetAssessment,
    requireKYC,
    refreshUser: () => refreshUser(true),
    fetchKYCStatus,
    createLoan,
    fetchLoans,
    fetchActiveLoan: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}