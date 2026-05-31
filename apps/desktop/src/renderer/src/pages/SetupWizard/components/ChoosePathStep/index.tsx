import { SetupPath } from '../..';

interface ChoosePathStepProps {
  onChoose: (path: SetupPath) => void;
}

export function ChoosePathStep({ onChoose }: ChoosePathStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#F8F9FA] mb-2">
          How would you like to get started?
        </h1>
        <p className="text-[13px] text-white/40 leading-relaxed m-0">
          Choose your setup path. You can change this later in Settings.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onChoose(SetupPath.Cloud)}
          className="bg-white/[0.04] border border-white/10 rounded-xl p-5 cursor-pointer text-left font-sans transition-[border-color,background] duration-150 hover:border-[#20C997] hover:bg-[rgba(32,201,151,0.06)]"
        >
          <div className="mb-1.5">
            <span className="text-base text-[#F8F9FA] font-semibold">
              Connect to existing database
            </span>
          </div>
          <p className="text-[13px] text-white/40 mb-2 leading-snug m-0">
            You already have a Turso database set up.
          </p>
          <p className="text-[12px] text-amber-400/70 m-0 leading-snug">
            ⚠ Manual credentials will be replaced by account sign-in in a future update.
          </p>
        </button>

        <button
          onClick={() => onChoose(SetupPath.Local)}
          className="bg-white/[0.04] border border-white/10 rounded-xl p-5 cursor-pointer text-left font-sans transition-[border-color,background] duration-150 hover:border-white/25 hover:bg-white/[0.06]"
        >
          <div className="mb-1.5">
            <span className="text-base text-[#F8F9FA] font-semibold">Set up locally</span>
          </div>
          <p className="text-[13px] text-white/40 m-0 leading-snug">
            No database yet — create one on this machine. Local setup will be replaced by account
            creation in a future update.
          </p>
        </button>
      </div>
    </div>
  );
}
