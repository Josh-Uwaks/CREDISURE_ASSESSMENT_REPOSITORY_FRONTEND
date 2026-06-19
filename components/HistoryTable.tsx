import { AssessmentHistory } from '@/types';
import { Badge } from './Badge';

interface HistoryTableProps {
  history: AssessmentHistory[];
}

const getScoreColor = (s: number) =>
  s >= 750 ? 'text-[#00D4AA]' : s >= 650 ? 'text-blue-400' : s >= 550 ? 'text-amber-400' : 'text-red-400';

const getRatingVariant = (r: string): 'green' | 'blue' | 'amber' | 'red' =>
  r === 'Very Good' ? 'green' : r === 'Good' ? 'blue' : r === 'Fair' ? 'amber' : 'red';

const getRiskVariant = (r: string): 'green' | 'blue' | 'amber' | 'red' =>
  r === 'Low Risk' ? 'green' : r === 'Medium Risk' ? 'amber' : r === 'High Risk' ? 'red' : 'red';

export function HistoryTable({ history }: HistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1E2D45]">
            {['Date', 'Score', 'Rating', 'Risk'].map((h) => (
              <th key={h} className="text-left pb-3 text-[10px] font-semibold text-[#8B9BB4] uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="border-b border-[#1E2D45]/50 hover:bg-white/2 transition-colors">
              <td className="py-3 text-[#8B9BB4] text-xs">
                {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
              <td className={`py-3 font-bold font-mono ${getScoreColor(item.credit_score)}`}>{item.credit_score}</td>
              <td className="py-3">
                <Badge label={item.rating} variant={getRatingVariant(item.rating)} />
              </td>
              <td className="py-3">
                <Badge label={item.risk_level} variant={getRiskVariant(item.risk_level)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}