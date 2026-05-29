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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#F8F9FA',
            margin: '0 0 8px',
          }}
        >
          Add your venues
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
          Each venue is a separate legal trading entity. Invoices, stock, and costs are tracked per
          venue. You need at least one.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entityNames.map((name, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: i === 0 ? '#20C997' : 'rgba(255,255,255,0.25)',
              }}
            >
              {i === 0 ? 'Primary venue' : `Additional venue ${i}`}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="rg-input"
                value={name}
                onChange={(e) => onNameChange(i, e.target.value)}
                placeholder={i === 0 ? 'e.g. The Crown Pub' : `e.g. Venue ${i + 1}`}
                autoFocus={i === entityNames.length - 1}
              />
              {entityNames.length > 1 && (
                <button className="rg-remove" onClick={() => onRemove(i)} aria-label="Remove">
                  ×
                </button>
              )}
            </div>
          </div>
        ))}

        <button className="rg-add-venue" onClick={onAdd}>
          + Add another venue
        </button>
      </div>

      {submitError && <p style={{ fontSize: 13, color: '#E63946', margin: 0 }}>{submitError}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="rg-btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="rg-btn-primary" onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Setting up…' : 'Get started'}
        </button>
      </div>
    </div>
  );
}
