// types/index.ts

// ============================================
// AUTH TYPES
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ============================================
// KYC TYPES
// ============================================

// ✅ Updated to match backend exactly
export type KYCStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export interface KYCData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  title?: string;
  gender: string;
  dob: string; // YYYY-MM-DD
  address: string;
  mobile_no: string;
  country: string;
  state: string;
  city: string;
  postal_code?: string;
  id_type: string;
  id_number: string;
}

export interface KYCResponse {
  id: number;
  user_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  title?: string;
  gender: string;
  dob: string;
  address: string;
  mobile_no: string;
  country: string;
  state: string;
  city: string;
  postal_code?: string;
  id_type: string;
  id_number: string;
  created_at: string;
  updated_at: string;
  status?: KYCStatus;
  full_name?: string;
}

export interface KYCStatusResponse {
  exists: boolean;
  status: KYCStatus;
  submitted_at: string | null;
  updated_at: string | null;
  full_name: string | null;
}

export interface KYCFormData {
  title: string;
  gender: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob: string;
  address: string;
  country: string;
  state: string;
  city: string;
  postal_code?: string;
  mobile_no: string;
  id_type: string;
  id_number: string;
}

// ============================================
// ASSESSMENT TYPES
// ============================================
export interface AssessmentRequest {
  monthly_income: number;
  monthly_expense: number;
  existing_loans: number;
}

export interface AssessmentResult {
  credit_score: number;
  rating: string;
  risk_level: string;
}

export interface AssessmentResponse {
  user_id: number;
  assessment: AssessmentResult;
}

export interface AssessmentHistory {
  id: number;
  credit_score: number;
  rating: string;
  risk_level: string;
  created_at: string;
}

export interface AssessmentFormData {
  monthly_income: number;
  monthly_expense: number;
  existing_loans: number;
}

// ============================================
// LOAN TYPES
// ============================================
export interface LoanApplicationData {
  amount: number;
  purpose: string;
  term_months: number;
  assessment_id: number;
}

export interface LoanResponse {
  id: number;
  user_id: number;
  assessment_id: number;
  amount: number;
  purpose: string;
  term_months: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'completed' | 'defaulted';
  created_at: string;
  updated_at: string;
  approved_at?: string;
  disbursed_at?: string;
  due_date?: string;
  interest_rate?: number;
  total_repayment?: number;
}

// ============================================
// USER TYPES
// ============================================
export interface User {
  id: number;
  email: string;
  created_at: string;
}

// ============================================
// DOCUMENT TYPES
// ============================================
export interface DocumentUpload {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

// ============================================
// UTILITY TYPES
// ============================================
export interface ApiError {
  detail: string;
  status_code?: number;
}

// ============================================
// CONTEXT TYPES
// ============================================
export interface UserInfo {
  email: string;
  id: string | number | null;
  firstName: string;
  lastName?: string;
}

export interface AuthContextType {
  // Auth State
  token: string | null;
  userInfo: UserInfo;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // KYC State
  kycData: KYCResponse | null;
  isKYCComplete: boolean;
  showKYCModal: boolean;
  isKYCLoading: boolean;
  kycStatus: KYCStatus;
  kycStatusInfo: KYCStatusResponse | null;
  hasSubmittedKYC: boolean;
  
  // Assessment State
  assessment: AssessmentResponse | null;
  history: AssessmentHistory[];
  activeTab: 'overview' | 'history';
  
  // Loan State
  loans: LoanResponse[];
  activeLoan: LoanResponse | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  submitKYC: (data: KYCFormData) => Promise<void>;
  submitAssessment: (data: AssessmentFormData) => Promise<void>;
  fetchHistory: () => Promise<void>;
  setActiveTab: (tab: 'overview' | 'history') => void;
  openKYCModal: () => void;
  hideKYCModal: () => void;
  resetAssessment: () => void;
  requireKYC: (action: () => void) => void;
  
  // Refresh methods
  refreshUser: () => Promise<void>;
  fetchKYCStatus: () => Promise<void>;
  
  // Loan Actions
  createLoan: (data: LoanApplicationData) => Promise<LoanResponse>;
  fetchLoans: () => Promise<void>;
  fetchActiveLoan: () => Promise<void>;
}

// ============================================
// DASHBOARD TYPES
// ============================================
export interface MetricCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface RecentUpload {
  id: number;
  name: string;
  date: string;
  size: string;
}

export interface AssessmentHistoryItem {
  id: string;
  date: string;
  score: number;
  status: 'completed' | 'pending' | 'failed';
}

// ============================================
// API RESPONSE WRAPPER
// ============================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}