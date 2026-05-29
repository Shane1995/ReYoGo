interface GroupStepProps {
  groupName: string;
  onGroupNameChange: (v: string) => void;
  onNext: () => void;
}

export function GroupStep({ groupName, onGroupNameChange, onNext }: GroupStepProps) {
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
          Name your business group
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
          This is the umbrella name for all your venues — e.g. "The Crown Group". You can change it
          anytime.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          Business group name
        </label>
        <input
          className="rg-input"
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          placeholder="e.g. The Crown Group"
          onKeyDown={(e) => e.key === 'Enter' && onNext()}
          autoFocus
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="rg-btn-primary" onClick={onNext} disabled={!groupName.trim()}>
          Continue →
        </button>
      </div>
    </div>
  );
}
