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
            disabled={connecting}
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
            disabled={connecting}
            onKeyDown={(e) => e.key === 'Enter' && canConnect && !connecting && onConnect()}
          />
        </div>

        {connectError && <p className="text-[13px] text-[#E63946] m-0">{connectError}</p>}
      </div>

      <div className="flex justify-end">
        <button
          className="bg-[#20C997] text-[#0D1117] rounded-[10px] px-6 py-[11px] text-sm font-semibold font-sans cursor-pointer transition-[background,transform] duration-150 whitespace-nowrap hover:bg-[#18a87a] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onConnect}
          disabled={!canConnect || connecting}
        >
          {connecting ? 'Connecting…' : 'Connect →'}
        </button>
      </div>
    </div>
  );
}
