import { useSetupWizard } from './hooks/useSetupWizard';
import { GroupStep } from './components/GroupStep';
import { EntitiesStep } from './components/EntitiesStep';

const stepLabels = ['Business group', 'Venues'];

export default function SetupWizard() {
  const wizard = useSetupWizard();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        background: '#0D1117',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        @keyframes rg-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rg-glow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.5;  transform: scale(1.06); }
        }
        @keyframes rg-step-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .rg-step { animation: rg-step-in 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .rg-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: #F8F9FA;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .rg-input::placeholder { color: rgba(255,255,255,0.25); }
        .rg-input:focus {
          border-color: #20C997;
          background: rgba(32,201,151,0.06);
        }
        .rg-btn-primary {
          background: #20C997;
          color: #0D1117;
          border: none;
          border-radius: 10px;
          padding: 11px 24px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .rg-btn-primary:hover:not(:disabled) { background: #18a87a; }
        .rg-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .rg-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .rg-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 20px;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .rg-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); }
        .rg-remove {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.2);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .rg-remove:hover { color: #E63946; background: rgba(230,57,70,0.1); }
        .rg-add-venue {
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 11px 16px;
          color: rgba(255,255,255,0.3);
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, color 0.15s;
          width: 100%;
        }
        .rg-add-venue:hover { border-color: rgba(32,201,151,0.4); color: #20C997; }
      `}</style>

      {/* Left brand pane */}
      <div
        style={{
          width: '42%',
          minWidth: 280,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Teal radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '-20%',
            width: '70%',
            paddingBottom: '70%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(32,201,151,0.18) 0%, transparent 70%)',
            animation: 'rg-glow-pulse 5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '-10%',
            width: '50%',
            paddingBottom: '50%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(32,201,151,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #20C997 0%, #0EA5E9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8.5L6.5 12L13 5"
                  stroke="#0D1117"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{ color: '#F8F9FA', fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}
            >
              ReYoGo
            </span>
          </div>
        </div>

        {/* Central copy */}
        <div
          style={{
            position: 'relative',
            animation: 'rg-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#20C997',
              marginBottom: 16,
            }}
          >
            Getting started
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: '#F8F9FA',
              marginBottom: 12,
            }}
          >
            Your operations,
            <br />
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>beautifully organised.</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
            Takes about 60 seconds. You can change everything later from Settings.
          </p>
        </div>

        {/* Step progress */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isDone = wizard.step > stepNum;
              const isActive = wizard.step === stepNum;
              return (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: isActive ? 1 : isDone ? 0.6 : 0.25,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: `1.5px solid ${isActive ? '#20C997' : isDone ? '#20C997' : 'rgba(255,255,255,0.2)'}`,
                      background: isDone ? '#20C997' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.3s',
                    }}
                  >
                    {isDone ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5L4.2 7.2L8 3"
                          stroke="#0D1117"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span
                        style={{
                          fontSize: 10,
                          color: isActive ? '#20C997' : 'rgba(255,255,255,0.4)',
                          fontWeight: 600,
                        }}
                      >
                        {stepNum}
                      </span>
                    )}
                  </div>
                  <span
                    style={{ fontSize: 13, color: '#F8F9FA', fontWeight: isActive ? 500 : 400 }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right form pane */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          {wizard.step === 1 && (
            <div className="rg-step" key="step-1">
              <GroupStep
                groupName={wizard.groupName}
                onGroupNameChange={wizard.setGroupName}
                onNext={wizard.next}
              />
            </div>
          )}
          {wizard.step === 2 && (
            <div className="rg-step" key="step-2">
              <EntitiesStep
                entityNames={wizard.entityNames}
                onAdd={wizard.addEntity}
                onRemove={wizard.removeEntity}
                onNameChange={wizard.setEntityName}
                onBack={wizard.back}
                onSubmit={wizard.submit}
                canSubmit={wizard.canSubmit}
                isSubmitting={wizard.isSubmitting}
                submitError={wizard.submitError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
