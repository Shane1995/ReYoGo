import { ChevronDownIcon, UserIcon } from 'lucide-react';

export function AccountButton() {
  return (
    <div className="flex h-7 items-center gap-2 rounded-md px-2 text-xs text-white/50 hover:bg-white/8 hover:text-white/75 transition-colors cursor-default">
      <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-[#20C997]/30 to-[#0EA5E9]/20 ring-1 ring-white/10">
        <UserIcon className="size-3 text-white/60" />
      </span>
      <span className="font-medium">Account</span>
      <ChevronDownIcon className="size-3 text-white/25" />
    </div>
  );
}
