interface StatCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function StatCard({ title, children, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#1E2D45] bg-[#0D1E32] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#00D4AA]">{icon}</span>}
        <p className="text-[10px] font-semibold text-[#8B9BB4] uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}