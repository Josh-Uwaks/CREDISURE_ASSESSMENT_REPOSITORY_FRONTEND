// app/(dashboard)/history/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FiArrowLeft, 
  FiBarChart2, 
  FiClock, 
  FiTrendingUp, 
  FiTrendingDown,
  FiCalendar,
  FiChevronRight,
  FiInfo,
  FiDownload,
  FiFilter,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiFile,
  FiUpload,
} from 'react-icons/fi';
import { FaCreditCard } from 'react-icons/fa';
import { IconType } from 'react-icons';
import toast from 'react-hot-toast';

// ====== TYPES ======
type FilterType = 'all' | 'high' | 'medium' | 'low';
type SortOrderType = 'desc' | 'asc';
type TabType = 'assessments' | 'loans';
type LoanStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'completed' | 'defaulted';

interface LoanStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: IconType;
}

// ====== HELPERS ======

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getLoanStatusConfig = (status: LoanStatus): LoanStatusConfig => {
  const configs: Record<LoanStatus, LoanStatusConfig> = {
    draft: { label: 'Draft', color: 'text-[#8A8470]', bgColor: 'bg-[#F2F0E8]', icon: FiFile },
    submitted: { label: 'Submitted', color: 'text-[#1D4ED8]', bgColor: 'bg-blue-50', icon: FiUpload },
    under_review: { label: 'Under Review', color: 'text-[#B45309]', bgColor: 'bg-[#B45309]/10', icon: FiClock },
    approved: { label: 'Approved ✅', color: 'text-[#1EA537]', bgColor: 'bg-[#1EA537]/10', icon: FiCheckCircle },
    rejected: { label: 'Rejected', color: 'text-[#B91C1C]', bgColor: 'bg-[#B91C1C]/10', icon: FiXCircle },
    disbursed: { label: 'Disbursed', color: 'text-[#1EA537]', bgColor: 'bg-[#1EA537]/10', icon: FiDollarSign },
    active: { label: 'Active', color: 'text-[#1D4ED8]', bgColor: 'bg-blue-50', icon: FiTrendingUp },
    completed: { label: 'Completed ✅', color: 'text-[#1EA537]', bgColor: 'bg-[#1EA537]/10', icon: FiCheckCircle },
    defaulted: { label: 'Defaulted', color: 'text-[#B91C1C]', bgColor: 'bg-[#B91C1C]/10', icon: FiAlertTriangle },
  };
  return configs[status] || { label: status, color: 'text-[#8A8470]', bgColor: 'bg-[#F2F0E8]', icon: FiFile };
};

export default function HistoryPage() {
  const router = useRouter();
  const { 
    history, 
    fetchHistory, 
    isAuthenticated, 
    isLoading,
    loans,
    fetchLoans 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('assessments');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data on mount with caching
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      await fetchHistory();
      await fetchLoans();
    };
    
    loadData();
  }, [isAuthenticated, fetchHistory, fetchLoans]);

  // Filter and sort assessments
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    if (filter !== 'all') {
      filtered = filtered.filter(item => 
        item.risk_level.toLowerCase().includes(filter)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [history, filter, sortOrder]);

  // Sort loans (newest first)
  const sortedLoans = useMemo(() => {
    return [...loans].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [loans]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Assessment helper functions
  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-[#1EA537]';
    if (score >= 600) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 700) return 'bg-[#1EA537]/10';
    if (score >= 600) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch(riskLevel.toLowerCase()) {
      case 'low risk': return 'text-[#1EA537] bg-[#1EA537]/10';
      case 'medium risk': return 'text-amber-500 bg-amber-500/10';
      case 'high risk': return 'text-red-500 bg-red-500/10';
      default: return 'text-slate-400 bg-slate-100';
    }
  };

  const getRatingColor = (rating: string) => {
    switch(rating.toLowerCase()) {
      case 'excellent': return 'text-[#1EA537]';
      case 'very good': return 'text-[#1EA537]';
      case 'good': return 'text-amber-500';
      case 'fair': return 'text-amber-500';
      case 'poor': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getScoreTrend = (index: number) => {
    if (index >= filteredHistory.length - 1) return null;
    const current = filteredHistory[index].credit_score;
    const next = filteredHistory[index + 1].credit_score;
    if (current > next) return 'up';
    if (current < next) return 'down';
    return 'same';
  };

  const handleExport = () => {
    try {
      const data = activeTab === 'assessments' 
        ? filteredHistory.map(item => ({
            'Assessment ID': item.id,
            'Credit Score': item.credit_score,
            'Rating': item.rating,
            'Risk Level': item.risk_level,
            'Date': formatDate(item.created_at),
          }))
        : sortedLoans.map(item => ({
            'Loan ID': item.id,
            'Amount': formatCurrency(item.amount),
            'Status': getLoanStatusConfig(item.status as LoanStatus).label,
            'Term': `${item.term_months} months`,
            'Applied On': formatDate(item.created_at),
          }));
      
      const csv = [
        Object.keys(data[0] || {}).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_history.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('History exported successfully!');
    } catch (error) {
      toast.error('Failed to export history:' + error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchHistory();
      await fetchLoans();
      toast.success('History refreshed!');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F5F0]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#1EA537] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8A8470] font-medium text-sm">Loading history…</p>
        </div>
      </div>
    );
  }

  const hasAssessments = filteredHistory.length > 0;
  const hasLoans = sortedLoans.length > 0;

  return (
    <main className="px-4 lg:px-8 py-8 max-w-6xl w-full mx-auto bg-[#F7F5F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[#8A8470] hover:text-[#0B3B2E] transition-all mb-2 text-sm font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1EA537]/10">
              <FiBarChart2 className="w-5 h-5 text-[#1EA537]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0B3B2E] tracking-tight">History</h1>
              <p className="text-[#8A8470] text-sm">
                View your assessment and loan history
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E7E2D6] text-[#5C5848] hover:bg-[#F7F5F0] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiUpload className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={activeTab === 'assessments' ? !hasAssessments : !hasLoans}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E7E2D6] text-[#5C5848] hover:bg-[#F7F5F0] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-1 mb-6">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`
            flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'assessments' 
              ? 'bg-[#1EA537] text-white shadow-sm' 
              : 'text-[#5C5848] hover:bg-[#F7F5F0]'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <FiBarChart2 className="w-4 h-4" />
            Assessments
            {hasAssessments && (
              <span className={`text-xs ${activeTab === 'assessments' ? 'text-white/80' : 'text-[#8A8470]'}`}>
                ({filteredHistory.length})
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`
            flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'loans' 
              ? 'bg-[#1EA537] text-white shadow-sm' 
              : 'text-[#5C5848] hover:bg-[#F7F5F0]'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <FiDollarSign className="w-4 h-4" />
            Loans
            {hasLoans && (
              <span className={`text-xs ${activeTab === 'loans' ? 'text-white/80' : 'text-[#8A8470]'}`}>
                ({sortedLoans.length})
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Stats Cards - Assessments */}
      {activeTab === 'assessments' && hasAssessments && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Total Assessments</p>
            <p className="text-2xl font-extrabold text-[#0B3B2E]">{filteredHistory.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Average Score</p>
            <p className="text-2xl font-extrabold text-[#1EA537]">
              {Math.round(filteredHistory.reduce((acc, curr) => acc + curr.credit_score, 0) / filteredHistory.length)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Highest Score</p>
            <p className="text-2xl font-extrabold text-[#1EA537]">
              {Math.max(...filteredHistory.map(item => item.credit_score))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Latest Assessment</p>
            <p className="text-sm font-semibold text-[#0B3B2E] truncate">
              {filteredHistory.length > 0 ? formatDate(filteredHistory[0].created_at) : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards - Loans */}
      {activeTab === 'loans' && hasLoans && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Total Loans</p>
            <p className="text-2xl font-extrabold text-[#0B3B2E]">{sortedLoans.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Total Amount</p>
            <p className="text-2xl font-extrabold text-[#1EA537]">
              {formatCurrency(sortedLoans.reduce((acc, curr) => acc + curr.amount, 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Active Loans</p>
            <p className="text-2xl font-extrabold text-[#1D4ED8]">
              {sortedLoans.filter(l => l.status === 'active' || l.status === 'disbursed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4">
            <p className="text-xs text-[#8A8470] font-medium">Completed</p>
            <p className="text-2xl font-extrabold text-[#1EA537]">
              {sortedLoans.filter(l => l.status === 'completed').length}
            </p>
          </div>
        </div>
      )}

      {/* Filters - Only for Assessments */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-xl border border-[#E7E2D6] shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-[#8A8470]" />
              <span className="text-sm font-medium text-[#5C5848]">Filter by Risk Level:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'low', 'medium', 'high'] as FilterType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${filter === option 
                      ? 'bg-[#1EA537] text-white' 
                      : 'bg-[#F2F0E8] text-[#5C5848] hover:bg-[#E7E2D6]'
                    }
                  `}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#5C5848]">Sort:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F2F0E8] text-[#5C5848] hover:bg-[#E7E2D6] transition-colors text-xs font-medium"
              >
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History List - Assessments */}
      {activeTab === 'assessments' && (
        <>
          {!hasAssessments ? (
            <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#F2F0E8] flex items-center justify-center mx-auto mb-4">
                <FiBarChart2 className="w-10 h-10 text-[#B5AF9C]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0B3B2E] mb-2">No Assessments Yet</h3>
              <p className="text-[#8A8470] text-sm max-w-md mx-auto">
                You haven&apos;t run any credit assessments yet. Complete your first assessment to see your credit score and risk profile.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 bg-[#1EA537] hover:bg-[#188A2D] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Run Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => {
                const trend = getScoreTrend(index);
                const riskBadgeColor = getRiskBadgeColor(item.risk_level);
                const scoreColor = getScoreColor(item.credit_score);
                const ratingColor = getRatingColor(item.rating);

                return (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getScoreBackground(item.credit_score)}`}>
                          <FaCreditCard className={`w-6 h-6 ${scoreColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-[#0B3B2E]">
                              Assessment #{item.id}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${riskBadgeColor}`}>
                              {item.risk_level}
                            </span>
                            {trend && (
                              <span className={`text-xs flex items-center gap-0.5 ${trend === 'up' ? 'text-[#1EA537]' : 'text-red-500'}`}>
                                {trend === 'up' ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                                {trend === 'up' ? 'Improved' : 'Decreased'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="flex items-center gap-1 text-[#8A8470]">
                              <FiCalendar className="w-3 h-3" />
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-[#8A8470] font-medium">Score</p>
                          <p className={`text-2xl font-extrabold ${scoreColor}`}>
                            {item.credit_score}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#8A8470] font-medium">Rating</p>
                          <p className={`text-sm font-semibold ${ratingColor}`}>
                            {item.rating}
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/assessment/${item.id}`)}
                          className="p-2 rounded-lg hover:bg-[#F7F5F0] transition-colors text-[#8A8470] hover:text-[#0B3B2E]"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* History List - Loans */}
      {activeTab === 'loans' && (
        <>
          {!hasLoans ? (
            <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#F2F0E8] flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="w-10 h-10 text-[#B5AF9C]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0B3B2E] mb-2">No Loans Yet</h3>
              <p className="text-[#8A8470] text-sm max-w-md mx-auto">
                You haven&apos;t applied for any loans yet. Complete your KYC, upload documents, and run a credit assessment to get started.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 bg-[#1EA537] hover:bg-[#188A2D] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLoans.map((loan) => {
                const statusConfig = getLoanStatusConfig(loan.status as LoanStatus);
                const StatusIcon = statusConfig.icon;

                return (
                  <div 
                    key={loan.id}
                    className="bg-white rounded-2xl border border-[#E7E2D6] shadow-sm p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statusConfig.bgColor}`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-[#0B3B2E]">
                              Loan #{loan.id}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="flex items-center gap-1 text-[#8A8470]">
                              <FiCalendar className="w-3 h-3" />
                              {formatDate(loan.created_at)}
                            </span>
                            <span className="text-[#E7E2D6]">|</span>
                            <span className="text-[#8A8470]">
                              {loan.term_months} months
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-[#8A8470] font-medium">Amount</p>
                          <p className="text-xl font-extrabold text-[#0B3B2E]">
                            {formatCurrency(loan.amount)}
                          </p>
                        </div>
                        {loan.due_date && (
                          <div className="text-right">
                            <p className="text-xs text-[#8A8470] font-medium">Due Date</p>
                            <p className="text-sm font-semibold text-[#0B3B2E]">
                              {formatDate(loan.due_date)}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => router.push(`/loan/${loan.id}`)}
                          className="p-2 rounded-lg hover:bg-[#F7F5F0] transition-colors text-[#8A8470] hover:text-[#0B3B2E]"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="mt-10 pt-5 border-t border-[#E7E2D6]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#8A8470]">
            © {new Date().getFullYear()} CrediSure. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-[#8A8470]">
            <span className="flex items-center gap-1.5">
              <FiInfo className="w-3 h-3" />
              Secure & encrypted
            </span>
            <span>v2.0.0</span>
          </div>
        </div>
      </div>
    </main>
  );
}