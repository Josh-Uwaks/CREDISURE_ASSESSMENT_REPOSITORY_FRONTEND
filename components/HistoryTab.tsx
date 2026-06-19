import { AssessmentHistory } from '@/types';
import { HistoryTable } from './HistoryTable';

interface HistoryTabProps {
  history: AssessmentHistory[];
}

export function HistoryTab({ history }: HistoryTabProps) {
  return (
    <div className="rounded-2xl border border-[#1E2D45] bg-[#0D1E32] p-5">
      <p className="text-[10px] font-semibold text-[#8B9BB4] uppercase tracking-widest mb-4">All Assessments</p>
      {history.length === 0 ? (
        <p className="text-sm text-[#8B9BB4] py-8 text-center">No assessments yet.</p>
      ) : (
        <HistoryTable history={history} />
      )}
    </div>
  );
}