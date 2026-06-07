interface ConnectCloudStepProps {
  tursoUrl: string;
  authToken: string;
  connecting: boolean;
  connectError: string | null;
  onTursoUrlChange: (v: string) => void;
  onAuthTokenChange: (v: string) => void;
  onConnect: () => void;
}

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-[#F8F9FA] text-sm font-sans outline-none transition-[border-color,background] duration-150 placeholder:text-white/25 focus:border-[#20C997] focus:bg-[rgba(32,201,151,0.06)] disabled:opacity-50 disabled:cursor-not-allowed';

const labelCls = 'text-[11px] font-semibold tracking-[0.08em] uppercase text-white/35';

function ConnectingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 animate-rg-fade-up">
      <div className="relative flex items-center justify-center">
        <div className="size-14 rounded-full border-2 border-white/10" />
        <div className="absolute size-14 rounded-full border-2 border-transparent border-t-[#20C997] animate-spin" />
        <div className="absolute size-2 rounded-full bg-[#20C997]" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[15px] font-semibold text-[#F8F9FA] m-0">Establishing connection</p>
        <p className="text-[13px] text-white/40 m-0 leading-relaxed max-w-[260px]">
          Syncing your database — this may take a moment for larger databases.
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="size-1.5 rounded-full bg-[#20C997]/40 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ConnectCloudStep({
  tursoUrl,
  authToken,
  connecting,
  connectError,
  onTursoUrlChange,
  onAuthTokenChange,
  onConnect,
}: ConnectCloudStepProps) {
  const canConnect = tursoUrl.trim().startsWith('libsql://') && authToken.trim().length > 0;

  if (connecting) return <ConnectingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#F8F9FA] mb-2">
          Connect your database
        </h1>
        <p className="text-[13px] text-white/40 mb-2 leading-relaxed m-0">
          Enter your Turso credentials to get started.
        </p>
        <p className="text-[12px] text-amber-400/70 m-0 leading-snug">
          ⚠ Manual credentials will be replaced by account sign-in in a future update.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Database URL</label>
          <input
            className={inputCls}
            value={tursoUrl}
            onChange={(e) => onTursoUrlChange(e.target.value)}
            placeholder="libsql://your-db.turso.io"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Auth token</label>
          <input
            className={inputCls}
            type="password"
            value={authToken}
            onChange={(e) => onAuthTokenChange(e.target.value)}
            placeholder="eyJhbGci…"
            onKeyDown={(e) => e.key === 'Enter' && canConnect && onConnect()}
          />
        </div>
        {connectError && <p className="text-[13px] text-[#E63946] m-0">{connectError}</p>}
      </div>
      <div className="flex justify-end">
        <button
          className="bg-[#20C997] text-[#0D1117] rounded-[10px] px-6 py-[11px] text-sm font-semibold font-sans cursor-pointer transition-[background,transform] duration-150 whitespace-nowrap hover:bg-[#18a87a] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onConnect}
          disabled={!canConnect}
        >
          Connect →
        </button>
      </div>
    </div>
  );
}
