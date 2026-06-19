export function Badge({ label, variant }: { label: string; variant: 'green' | 'blue' | 'amber' | 'red' }) {
  const styles = {
    green: 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30',
    blue: 'bg-blue-400/10 text-blue-400 border border-blue-400/30',
    amber: 'bg-amber-400/10 text-amber-400 border border-amber-400/30',
    red: 'bg-red-400/10 text-red-400 border border-red-400/30',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}