// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  const { get, set, invalidate, invalidateAll } = useCache();
  
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

  // ✅ Track if data has been loaded once
  const hasLoadedData = useRef(false);

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
  // LOAD DATA - ONCE
  // ============================================
  const loadAllData = useCallback(async (forceRefresh: boolean = false) => {
    // ✅ Skip if already loaded and not forcing refresh
    if (hasLoadedData.current && !forceRefresh) return;
    if (!isAuthenticated) return;

    try {
      // Load KYC Status
      const cachedKYC = get<KYCStatusResponse>(CACHE_KEYS.KYC_STATUS);
      if (cachedKYC && !forceRefresh) {
        setKycStatusInfo(cachedKYC);
        setKycStatus(cachedKYC.status);
      } else {
        const kycStatus = await kycAPI.getKYCStatus();
        set(CACHE_KEYS.KYC_STATUS, kycStatus);
        setKycStatusInfo(kycStatus);
        setKycStatus(kycStatus.status);
        if (kycStatus.exists && kycStatus.full_name) {
          setKycData(prev => ({ ...prev, full_name: kycStatus.full_name } as KYCResponse));
        }
      }

      // Load Assessment History
      const cachedHistory = get<AssessmentHistory[]>(CACHE_KEYS.ASSESSMENT_HISTORY);
      if (cachedHistory && cachedHistory.length > 0 && !forceRefresh) {
        setHistory(cachedHistory);
      } else {
        const historyData = await assessmentAPI.getHistory();
        set(CACHE_KEYS.ASSESSMENT_HISTORY, historyData);
        setHistory(historyData);
        localStorage.setItem('assessment_history', JSON.stringify(historyData));
      }

      // Load Loans
      const cachedLoans = get<LoanResponse[]>(CACHE_KEYS.LOANS);
      if (cachedLoans && cachedLoans.length > 0 && !forceRefresh) {
        setLoans(cachedLoans);
      } else {
        const loansData = await loanAPI.getLoans();
        set(CACHE_KEYS.LOANS, loansData);
        setLoans(loansData);
        localStorage.setItem('loans', JSON.stringify(loansData));
      }

      // Load Assessment from localStorage
      const savedAssessment = localStorage.getItem('credit_assessment');
      if (savedAssessment) {
        try {
          setAssessment(JSON.parse(savedAssessment));
        } catch {}
      }

      hasLoadedData.current = true;
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [isAuthenticated, get, set]);

  // ============================================
  // ACTIONS
  // ============================================
  
  // Refresh User - Force reload
  const refreshUser = useCallback(async (forceRefresh: boolean = true): Promise<void> => {
    await loadAllData(forceRefresh);
  }, [loadAllData]);

  // Fetch KYC Status (used by components)
  const fetchKYCStatus = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (!forceRefresh) {
      const cached = get<KYCStatusResponse>(CACHE_KEYS.KYC_STATUS);
      if (cached) {
        setKycStatusInfo(cached);
        setKycStatus(cached.status);
        return;
      }
    }
    await loadAllData(true);
  }, [get, loadAllData]);

  // Fetch History (used by components)
  const fetchHistory = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (!forceRefresh) {
      const cached = get<AssessmentHistory[]>(CACHE_KEYS.ASSESSMENT_HISTORY);
      if (cached && cached.length > 0) {
        setHistory(cached);
        return;
      }
    }
    await loadAllData(true);
  }, [get, loadAllData]);

  // Fetch Loans (used by components)
  const fetchLoans = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    if (!forceRefresh) {
      const cached = get<LoanResponse[]>(CACHE_KEYS.LOANS);
      if (cached && cached.length > 0) {
        setLoans(cached);
        return;
      }
    }
    await loadAllData(true);
  }, [get, loadAllData]);

  // Fetch Active Loan (placeholder)
  const fetchActiveLoan = useCallback(async (): Promise<void> => {
    return Promise.resolve();
  }, []);

  // 5. Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      setToken(response.access_token);
      localStorage.setItem('access_token', response.access_token);
      
      setCookie('access_token', response.access_token, 7);
      
      // Load all data after login
      await loadAllData();
      
      toast.success('Welcome back! 👋');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, loadAllData]);

  // 6. Register
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

  // 7. Logout
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
    
    hasLoadedData.current = false; // ✅ Reset load flag
    
    invalidateAll();
    
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
  }, [router, invalidateAll]);

  // 8. Submit KYC
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

  // 9. Submit Assessment
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
      await loadAllData(true); // ✅ Force refresh history
      
      toast.success('Assessment complete! 🎉');
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'Assessment failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [kycStatus, loadAllData, invalidate]);

  // 10. Create Loan
  const createLoan = useCallback(async (data: LoanApplicationData): Promise<LoanResponse> => {
    setIsLoading(true);
    try {
      const result = await loanAPI.createLoan(data);
      toast.success('Loan application submitted successfully! 🎉');
      
      invalidate(CACHE_KEYS.LOANS);
      await loadAllData(true); // ✅ Force refresh loans
      
      return result;
    } catch (error: unknown) {
      const err = error as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail || 'Loan application failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadAllData, invalidate]);

  // 11. Require KYC for actions
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

  // 12. Open KYC Modal
  const openKYCModal = useCallback(() => {
    setShowKYCModal(true);
  }, []);

  // 13. Hide KYC Modal
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

  // 14. Reset Assessment
  const resetAssessment = useCallback(() => {
    setAssessment(null);
    localStorage.removeItem('credit_assessment');
  }, []);

  // ============================================
  // INITIALIZATION - Load data once
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
        await loadAllData();
      }
      setIsLoading(false);
    };

    void init();
  }, [loadAllData]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    token,
    userInfo,
    isAuthenticated,
    isLoading,
    
    kycData,
    isKYCComplete,
    showKYCModal,
    isKYCLoading,
    kycStatus,
    kycStatusInfo,
    hasSubmittedKYC,
    
    assessment,
    history,
    activeTab,
    
    loans,
    activeLoan: null,
    
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
    refreshUser,
    fetchKYCStatus,
    createLoan,
    fetchLoans,
    fetchActiveLoan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}