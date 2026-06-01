import { useSetupWizard } from './hooks/useSetupWizard';
import { ConnectCloudStep } from './components/ConnectCloudStep';
import { YourBusinessStep } from './components/YourBusinessStep';
import { MoreBusinessesStep } from './components/MoreBusinessesStep';

const STEP_LABELS = ['Connect', 'Your business', 'More businesses'];

export default function SetupWizard({ initialStep = 1 }: { initialStep?: 1 | 2 }) {
  const wizard = useSetupWizard({ initialStep });

  return (
    <div className="fixed inset-0 flex bg-[#0D1117] font-sans antialiased">
      <div className="w-[42%] min-w-[280px] relative flex flex-col justify-between p-12 border-r border-white/[0.06] overflow-hidden">
        <div
          className="absolute top-[30%] -left-[20%] w-[70%] pb-[70%] rounded-full animate-rg-glow-pulse pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(32,201,151,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[10%] -right-[10%] w-1/2 pb-[50%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(32,201,151,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #20C997 0%, #0EA5E9 100%)' }}
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
            <span className="text-[#F8F9FA] text-base font-semibold tracking-tight">ReYoGo</span>
          </div>
        </div>

        <div className="relative animate-rg-fade-up">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#20C997] mb-4">
            Getting started
          </div>
          <div className="text-[28px] font-bold tracking-[-0.03em] leading-[1.2] text-[#F8F9FA] mb-3">
            Your operations,
            <br />
            <span className="text-white/35">beautifully organised.</span>
          </div>
          <p className="text-[13px] text-white/40 leading-relaxed m-0">
            Takes about 60 seconds. You can change everything later from Settings.
          </p>
        </div>

        <div className="relative">
          <div className="flex flex-col gap-2">
            {STEP_LABELS.map((label, i) => {
              const stepNum = (i + 1) as 1 | 2 | 3;
              const isDone = wizard.step > stepNum;
              const isActive = wizard.step === stepNum;
              const isOptional = stepNum === 3;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 transition-opacity duration-300 ${isActive ? 'opacity-100' : isDone ? 'opacity-60' : 'opacity-25'}`}
                >
                  <div
                    className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-300 ${isDone ? 'bg-[#20C997] border-[#20C997]' : isActive ? 'bg-transparent border-[#20C997]' : 'bg-transparent border-white/20'}`}
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
                        className={`text-[10px] font-semibold ${isActive ? 'text-[#20C997]' : 'text-white/40'}`}
                      >
                        {stepNum}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-[13px] text-[#F8F9FA] ${isActive ? 'font-medium' : 'font-normal'}`}
                    >
                      {label}
                    </span>
                    {isOptional && (
                      <span className="text-[10px] text-white/25 font-normal">optional</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-12 overflow-y-auto">
        <div className="w-full max-w-[380px]">
          {wizard.step === 1 && (
            <div className="animate-rg-step-in" key="step-1">
              <ConnectCloudStep
                tursoUrl={wizard.tursoUrl}
                authToken={wizard.authToken}
                connecting={wizard.connecting}
                connectError={wizard.connectError}
                onTursoUrlChange={wizard.setTursoUrl}
                onAuthTokenChange={wizard.setAuthToken}
                onConnect={wizard.connect}
              />
            </div>
          )}
          {wizard.step === 2 && (
            <div className="animate-rg-step-in" key="step-2">
              <YourBusinessStep
                businessName={wizard.businessName}
                onBusinessNameChange={wizard.setBusinessName}
                onNext={wizard.next}
              />
            </div>
          )}
          {wizard.step === 3 && (
            <div className="animate-rg-step-in" key="step-3">
              <MoreBusinessesStep
                names={wizard.moreBusinesses}
                onAdd={wizard.addMore}
                onRemove={wizard.removeMore}
                onNameChange={wizard.setMoreName}
                onBack={wizard.back}
                onSkip={wizard.skip}
                onSubmit={wizard.submit}
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
