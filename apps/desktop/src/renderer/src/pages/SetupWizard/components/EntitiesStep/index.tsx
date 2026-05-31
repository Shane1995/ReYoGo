interface EntitiesStepProps {
  entityNames: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onNameChange: (i: number, v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError?: string | null;
}

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-[#F8F9FA] text-sm font-sans outline-none transition-[border-color,background] duration-150 placeholder:text-white/25 focus:border-[#20C997] focus:bg-[rgba(32,201,151,0.06)] disabled:opacity-50 disabled:cursor-not-allowed';

export function EntitiesStep({
  entityNames,
  onAdd,
  onRemove,
  onNameChange,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
  submitError,
}: EntitiesStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#F8F9FA] mb-2">
          Add your venues
        </h1>
        <p className="text-[13px] text-white/40 leading-relaxed m-0">
          Each venue is a separate legal trading entity. Invoices, stock, and costs are tracked per
          venue. You need at least one.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {entityNames.map((name, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-white/25">
              {`Venue ${i + 1}`}
            </span>
            <div className="flex gap-2 items-center">
              <input
                className={inputCls}
                value={name}
                onChange={(e) => onNameChange(i, e.target.value)}
                placeholder={`e.g. Venue ${i + 1}`}
                autoFocus={i === entityNames.length - 1}
              />
              {entityNames.length > 1 && (
                <button
                  className="bg-transparent border-none text-white/20 text-lg leading-none cursor-pointer px-2 py-1 rounded-md transition-[color,background] duration-150 shrink-0 hover:text-[#E63946] hover:bg-[rgba(230,57,70,0.1)]"
                  onClick={() => onRemove(i)}
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          className="bg-transparent border border-dashed border-white/[0.12] rounded-[10px] px-4 py-[11px] text-white/30 text-[13px] font-sans cursor-pointer text-left transition-[border-color,color] duration-150 w-full hover:border-[rgba(32,201,151,0.4)] hover:text-[#20C997]"
          onClick={onAdd}
        >
          + Add another venue
        </button>
      </div>

      {submitError && <p className="text-[13px] text-[#E63946] m-0">{submitError}</p>}

      <div className="flex justify-between items-center">
        <button
          className="bg-transparent text-white/40 border border-white/10 rounded-[10px] px-5 py-[11px] text-sm font-sans cursor-pointer transition-[border-color,color] duration-150 hover:border-white/25 hover:text-white/70"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="bg-[#20C997] text-[#0D1117] rounded-[10px] px-6 py-[11px] text-sm font-semibold font-sans cursor-pointer transition-[background,transform] duration-150 whitespace-nowrap hover:bg-[#18a87a] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? 'Setting up…' : 'Get started'}
        </button>
      </div>
    </div>
  );
}
