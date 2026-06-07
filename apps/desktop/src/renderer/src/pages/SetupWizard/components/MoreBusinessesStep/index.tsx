const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-[#F8F9FA] text-sm font-sans outline-none transition-[border-color,background] duration-150 placeholder:text-white/25 focus:border-[#20C997] focus:bg-[rgba(32,201,151,0.06)] disabled:opacity-50 disabled:cursor-not-allowed';

interface MoreBusinessesStepProps {
  names: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onNameChange: (i: number, v: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

function BusinessNameList({
  names,
  isSubmitting,
  onNameChange,
  onRemove,
}: Pick<MoreBusinessesStepProps, 'names' | 'isSubmitting' | 'onNameChange' | 'onRemove'>) {
  if (names.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {names.map((name, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => onNameChange(i, e.target.value)}
            placeholder={`e.g. Business ${i + 2}`}
            autoFocus={i === names.length - 1}
            disabled={isSubmitting}
          />
          <button
            className="bg-transparent border-none text-white/20 text-lg leading-none cursor-pointer px-2 py-1 rounded-md transition-[color,background] duration-150 shrink-0 hover:text-[#E63946] hover:bg-[rgba(230,57,70,0.1)]"
            onClick={() => onRemove(i)}
            aria-label="Remove"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function StepFooter({
  hasAny,
  isSubmitting,
  onBack,
  onSkip,
  onSubmit,
}: Pick<MoreBusinessesStepProps, 'isSubmitting' | 'onBack' | 'onSkip' | 'onSubmit'> & {
  hasAny: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <button
        className="bg-transparent text-white/40 border border-white/10 rounded-[10px] px-5 py-[11px] text-sm font-sans cursor-pointer transition-[border-color,color] duration-150 hover:border-white/25 hover:text-white/70"
        onClick={onBack}
        disabled={isSubmitting}
      >
        ← Back
      </button>
      <div className="flex gap-2">
        {!hasAny && (
          <button
            className="bg-transparent text-white/40 border border-white/10 rounded-[10px] px-5 py-[11px] text-sm font-sans cursor-pointer transition-[border-color,color] duration-150 hover:border-white/25 hover:text-white/70"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Skip →
          </button>
        )}
        {hasAny && (
          <button
            className="bg-[#20C997] text-[#0D1117] rounded-[10px] px-6 py-[11px] text-sm font-semibold font-sans cursor-pointer transition-[background,transform] duration-150 whitespace-nowrap hover:bg-[#18a87a] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting up…' : 'Get started'}
          </button>
        )}
      </div>
    </div>
  );
}

export function MoreBusinessesStep({
  names,
  onAdd,
  onRemove,
  onNameChange,
  onBack,
  onSkip,
  onSubmit,
  isSubmitting,
  submitError,
}: MoreBusinessesStepProps) {
  const hasAny = names.some((n) => n.trim().length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#F8F9FA] mb-2">
          More businesses
        </h1>
        <p className="text-[13px] text-white/40 leading-relaxed m-0">
          Running more than one business? Add them here — or skip if it's just the one.
        </p>
      </div>
      <BusinessNameList
        names={names}
        isSubmitting={isSubmitting}
        onNameChange={onNameChange}
        onRemove={onRemove}
      />
      <button
        className="bg-transparent border border-dashed border-white/[0.12] rounded-[10px] px-4 py-[11px] text-white/30 text-[13px] font-sans cursor-pointer text-left transition-[border-color,color] duration-150 w-full hover:border-[rgba(32,201,151,0.4)] hover:text-[#20C997]"
        onClick={onAdd}
        disabled={isSubmitting}
      >
        + Add a business
      </button>
      {submitError && <p className="text-[13px] text-[#E63946] m-0">{submitError}</p>}
      <StepFooter
        hasAny={hasAny}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onSkip={onSkip}
        onSubmit={onSubmit}
      />
    </div>
  );
}
