interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-3.5 w-0.5 rounded-full bg-primary" />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </h2>
    </div>
  );
}
