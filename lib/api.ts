// lib/api.ts
import axios from 'axios';
import { 
  AssessmentRequest, 
  AssessmentResponse, 
  AssessmentHistory,
  KYCData,
  KYCResponse,
  KYCStatusResponse,
  LoanApplicationData,
  LoanResponse,
  DocumentUpload
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ✅ Helper to clear auth cookie
const clearAuthCookie = () => {
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
};

// ✅ Helper to clear all auth data
const clearAuthData = () => {
  // Clear localStorage
  const keysToRemove = [
    'access_token',
    'credit_assessment',
    'kyc_submitted',
    'uploaded_files',
    'assessment_history',
    'risk_level',
    'loans',
    'loan_data'
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear cookie
  clearAuthCookie();
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor with proper 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Handle 401 Unauthorized - Token expired/invalid
    if (error.response?.status === 401) {
      // Clear ALL auth data - both localStorage AND cookie
      clearAuthData();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      // ✅ Set cookie too
      document.cookie = `access_token=${response.data.access_token}; path=/; max-age=604800; SameSite=Lax`;
    }
    return response.data;
  },
};

// KYC API
export const kycAPI = {
  submitKYC: async (data: KYCData): Promise<KYCResponse> => {
    const response = await api.post('/kyc', data);
    return response.data;
  },

  getKYCStatus: async (): Promise<KYCStatusResponse> => {
    try {
      const response = await api.get('/kyc/status');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return {
          exists: false,
          status: 'not_submitted',
          submitted_at: null,
          updated_at: null,
          full_name: null
        };
      }
      throw error;
    }
  },

  isKYCComplete: async (): Promise<boolean> => {
    try {
      const status = await kycAPI.getKYCStatus();
      return status.exists && status.status === 'verified';
    } catch {
      return false;
    }
  }
};

// Assessment API
export const assessmentAPI = {
  createAssessment: async (data: AssessmentRequest): Promise<AssessmentResponse> => {
    const response = await api.post('/assessment/', data);
    return response.data;
  },

  getHistory: async (): Promise<AssessmentHistory[]> => {
    const response = await api.get('/assessment/history');
    return response.data;
  },
};

// Loan API
export const loanAPI = {
  createLoan: async (data: LoanApplicationData): Promise<LoanResponse> => {
    const response = await api.post('/loans/', data);
    return response.data;
  },

  getLoans: async (): Promise<LoanResponse[]> => {
    const response = await api.get('/loans/');
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadDocument: async (file: File, documentType: string = 'bank_statement'): Promise<DocumentUpload> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  getDocuments: async (): Promise<DocumentUpload[]> => {
    const response = await api.get('/upload/');
    return response.data;
  },
};

// ✅ Export clearAuthData for use in AuthContext
export { clearAuthData, clearAuthCookie };