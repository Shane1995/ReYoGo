const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-[#F8F9FA] text-sm font-sans outline-none transition-[border-color,background] duration-150 placeholder:text-white/25 focus:border-[#20C997] focus:bg-[rgba(32,201,151,0.06)] disabled:opacity-50 disabled:cursor-not-allowed';

interface YourBusinessStepProps {
  businessName: string;
  onBusinessNameChange: (v: string) => void;
  onNext: () => void;
}

export function YourBusinessStep({
  businessName,
  onBusinessNameChange,
  onNext,
}: YourBusinessStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#F8F9FA] mb-2">
          Your business
        </h1>
        <p className="text-[13px] text-white/40 leading-relaxed m-0">
          What's your business called? You can add more later.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/35">
          Business name
        </label>
        <input
          className={inputCls}
          value={businessName}
          onChange={(e) => onBusinessNameChange(e.target.value)}
          placeholder="e.g. The Crown Pub"
          onKeyDown={(e) => e.key === 'Enter' && businessName.trim() && onNext()}
          autoFocus
        />
      </div>

      <div className="flex justify-end">
        <button
          className="bg-[#20C997] text-[#0D1117] rounded-[10px] px-6 py-[11px] text-sm font-semibold font-sans cursor-pointer transition-[background,transform] duration-150 whitespace-nowrap hover:bg-[#18a87a] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!businessName.trim()}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
