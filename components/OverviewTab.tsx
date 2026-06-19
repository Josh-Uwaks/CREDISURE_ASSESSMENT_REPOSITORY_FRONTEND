import { useRouter } from 'next/navigation';
import { AssessmentResponse, AssessmentHistory } from '@/types';
import { ScoreGauge } from './ScoreGauge';
import { Badge } from './Badge';
import { StatCard } from './StatCard';
import { HistoryTable } from './HistoryTable';
import { 
  FiUser, 
  FiTrendingUp, 
  FiShield, 
  FiDollarSign,
  FiActivity,
  FiBarChart2,
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiPlus,
  FiClock
} from 'react-icons/fi';
import { FaCreditCard } from 'react-icons/fa';

interface OverviewTabProps {
  assessment: AssessmentResponse | null;
  history: AssessmentHistory[];
  userInfo: { email: string; id: string | number | null; firstName: string; lastName?: string };
  onNewAssessment: () => void;
}

const getRatingVariant = (r: string): 'green' | 'blue' | 'amber' | 'red' => {
  if (r === 'Very Good') return 'green';
  if (r === 'Good') return 'blue';
  if (r === 'Fair') return 'amber';
  return 'red';
};

const getRiskVariant = (r: string): 'green' | 'blue' | 'amber' | 'red' => {
  if (r === 'Low Risk') return 'green';
  if (r === 'Medium Risk') return 'amber';
  return 'red';
};

const getFundingReadiness = (score: number = 0, risk: string = '') => {
  if (score === 0) {
    return { 
      label: 'Pending', 
      variant: 'amber' as const, 
      note: 'Run an assessment to check your funding eligibility.',
      icon: FiAlertCircle
    };
  }
  if (score >= 750 && risk === 'Low Risk')
    return { 
      label: 'Eligible', 
      variant: 'green' as const, 
      note: 'You qualify for funding.',
      icon: FiCheckCircle
    };
  if (score >= 650 && risk !== 'High Risk')
    return { 
      label: 'Under Review', 
      variant: 'amber' as const, 
      note: 'You may qualify with additional review.',
      icon: FiAlertCircle
    };
  return { 
    label: 'Not Eligible', 
    variant: 'red' as const, 
    note: 'Does not qualify at this time.',
    icon: FiXCircle
  };
};

const getScoreColor = (score: number) => {
  if (score === 0) return 'text-[#8B9BB4]';
  if (score >= 750) return 'text-[#00D4AA]';
  if (score >= 650) return 'text-blue-400';
  if (score >= 550) return 'text-amber-400';
  return 'text-red-400';
};

export function OverviewTab({ assessment, history, userInfo, onNewAssessment }: OverviewTabProps) {
  const router = useRouter();

  // Get assessment data with defaults
  const creditScore = assessment?.assessment?.credit_score ?? 0;
  const rating = assessment?.assessment?.rating || 'None';
  const riskLevel = assessment?.assessment?.risk_level || 'Not Assessed';
  const hasAssessment = assessment !== null && creditScore > 0;

  // Get funding readiness
  const fundingReadiness = getFundingReadiness(creditScore, riskLevel);

  const colors = {
    green: { bg: 'bg-[#00D4AA]', text: 'text-[#0A1628]', icon: 'text-[#00D4AA]' },
    amber: { bg: 'bg-amber-400', text: 'text-[#0A1628]', icon: 'text-amber-400' },
    red: { bg: 'bg-red-500', text: 'text-white', icon: 'text-red-500' },
  }[fundingReadiness.variant];

  const FundingIcon = fundingReadiness.icon;

  return (
    <div className="flex flex-col gap-6">
      {/* Display: User Email, Credit Score, Risk Rating, Funding Readiness Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Email */}
        <StatCard title="User" icon={<FiUser className="w-4 h-4" />}>
          <p className="text-lg font-semibold text-white truncate">
            {userInfo.email}
          </p>
          <p className="text-xs text-[#8B9BB4] truncate">
            {userInfo.firstName !== 'User' ? `Hi, ${userInfo.firstName}` : ''}
          </p>
          {userInfo.lastName && (
            <p className="text-xs text-[#8B9BB4] truncate">
              {userInfo.lastName}
            </p>
          )}
        </StatCard>

        {/* Credit Score - Always shows 0 if no assessment */}
        <StatCard title="Credit Score" icon={<FaCreditCard className="w-4 h-4" />}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${getScoreColor(creditScore)}`}>
              {creditScore}
            </span>
            {hasAssessment ? (
              <Badge 
                label={rating} 
                variant={getRatingVariant(rating)} 
              />
            ) : (
              <Badge label="None" variant="amber" />
            )}
          </div>
          <div className="w-full bg-[#1E2D45] rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                creditScore === 0 ? 'bg-[#1E2D45] w-0' : 'bg-[#00D4AA]'
              }`}
              style={{ 
                width: creditScore === 0 ? '0%' : `${((creditScore - 300) / (850 - 300)) * 100}%` 
              }}
            />
          </div>
          <p className="text-xs text-[#8B9BB4]">Range: 300 - 850</p>
        </StatCard>

        {/* Risk Rating */}
        <StatCard title="Risk Rating" icon={<FiShield className="w-4 h-4" />}>
          {hasAssessment ? (
            <>
              <Badge 
                label={riskLevel} 
                variant={getRiskVariant(riskLevel)} 
              />
              <p className="text-sm text-[#8B9BB4] mt-1">
                {riskLevel === 'Low Risk' && 'Low credit risk profile'}
                {riskLevel === 'Medium Risk' && 'Moderate credit risk'}
                {riskLevel === 'High Risk' && 'High credit risk profile'}
              </p>
            </>
          ) : (
            <>
              <Badge label="None" variant="amber" />
              <p className="text-sm text-[#8B9BB4] mt-1">
                Run an assessment to determine your risk profile
              </p>
            </>
          )}
        </StatCard>

        {/* Funding Readiness Status */}
        <StatCard title="Funding Readiness" icon={<FiDollarSign className="w-4 h-4" />}>
          <div className="flex items-center gap-2">
            <FundingIcon className={`w-5 h-5 ${colors.icon}`} />
            <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold ${colors.bg} ${colors.text}`}>
              {fundingReadiness.label}
            </div>
          </div>
          <p className="text-sm text-[#8B9BB4] leading-relaxed">{fundingReadiness.note}</p>
          <button
            onClick={() => router.push('/upload')}
            className="mt-auto text-xs text-[#00D4AA] hover:underline text-left flex items-center gap-1"
          >
            <FiUpload className="w-3 h-3" />
            Upload bank statement →
          </button>
        </StatCard>
      </div>

      {/* Score Gauge - Full width below */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#1E2D45] bg-[#0D1E32] p-6 flex flex-col items-center">
          {hasAssessment ? (
            <ScoreGauge score={creditScore} />
          ) : (
            <div className="relative">
              <div className="opacity-30">
                <ScoreGauge score={0} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FiTrendingUp className="w-8 h-8 text-[#8B9BB4] mx-auto mb-2" />
                  <p className="text-sm text-[#8B9BB4]">No Assessment Yet</p>
                  <p className="text-xs text-[#8B9BB4]">Score: 0</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {hasAssessment ? (
              <>
                <Badge label={rating} variant={getRatingVariant(rating)} />
                <Badge label={riskLevel} variant={getRiskVariant(riskLevel)} />
              </>
            ) : (
              <>
                <Badge label="None" variant="amber" />
                <Badge label="None" variant="amber" />
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl border border-[#1E2D45] bg-[#0D1E32] p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="w-5 h-5 text-[#00D4AA]" />
            <h3 className="text-sm font-semibold text-white">Assessment Summary</h3>
            {!hasAssessment && (
              <span className="text-xs text-[#8B9BB4] ml-auto">Awaiting Data</span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#1E2D45] pb-2">
              <span className="text-sm text-[#8B9BB4] flex items-center gap-2">
                <FiUser className="w-3 h-3" />
                User
              </span>
              <span className="text-sm font-medium text-white truncate max-w-37.5">
                {userInfo.email}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#1E2D45] pb-2">
              <span className="text-sm text-[#8B9BB4] flex items-center gap-2">
                <FiTrendingUp className="w-3 h-3" />
                Credit Score
              </span>
              <span className={`text-sm font-bold ${getScoreColor(creditScore)}`}>
                {creditScore}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#1E2D45] pb-2">
              <span className="text-sm text-[#8B9BB4] flex items-center gap-2">
                <FiActivity className="w-3 h-3" />
                Rating
              </span>
              {hasAssessment ? (
                <Badge label={rating} variant={getRatingVariant(rating)} />
              ) : (
                <span className="text-xs text-[#8B9BB4]">None</span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-[#1E2D45] pb-2">
              <span className="text-sm text-[#8B9BB4] flex items-center gap-2">
                <FiShield className="w-3 h-3" />
                Risk Level
              </span>
              {hasAssessment ? (
                <Badge label={riskLevel} variant={getRiskVariant(riskLevel)} />
              ) : (
                <span className="text-xs text-[#8B9BB4]">None</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8B9BB4] flex items-center gap-2">
                <FiDollarSign className="w-3 h-3" />
                Funding Readiness
              </span>
              <span className={`text-sm font-bold ${colors.text}`}>
                {fundingReadiness.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="rounded-2xl border border-[#1E2D45] bg-[#0D1E32] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-[#00D4AA]" />
            <p className="text-[10px] font-semibold text-[#8B9BB4] uppercase tracking-widest">
              {history.length > 0 ? 'Recent History' : 'No History Yet'}
            </p>
          </div>
          {history.length === 0 && (
            <button
              onClick={onNewAssessment}
              className="text-xs text-[#00D4AA] hover:underline flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" />
              Run First Assessment
            </button>
          )}
        </div>
        {history.length > 0 ? (
          <HistoryTable history={history.slice(0, 3)} />
        ) : (
          <div className="text-center py-8">
            <FiBarChart2 className="w-8 h-8 text-[#8B9BB4] mx-auto mb-2 opacity-30" />
            <p className="text-sm text-[#8B9BB4]">No assessments run yet</p>
            <p className="text-xs text-[#8B9BB4] mt-1">Click `&quot;`Run Assessment`&quot;` to get started</p>
          </div>
        )}
      </div>

      {/* Call to Action if no assessment */}
      {!hasAssessment && (
        <div className="rounded-2xl border border-dashed border-[#00D4AA]/30 bg-[#00D4AA]/5 p-6 text-center">
          <p className="text-sm text-[#8B9BB4] mb-3">
            Ready to check your credit score and funding readiness?
          </p>
          <button
            onClick={onNewAssessment}
            className="px-6 py-2 rounded-xl bg-[#00D4AA] text-[#0A1628] font-semibold text-sm hover:bg-[#00bfa0] transition-all flex items-center gap-2 mx-auto"
          >
            <FiTrendingUp className="w-4 h-4" />
            Run Your First Assessment
          </button>
        </div>
      )}
    </div>
  );
}