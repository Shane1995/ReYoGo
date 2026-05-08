import { useState } from 'react';
import { AlertTriangleIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';

export function ParseWarnings({ errors }: { errors: string[] }) {
  const [open, setOpen] = useState(false);

  const groups = errors.reduce<Map<string, number>>((acc, err) => {
    const core = err.replace(/^[^:]+:\s*/, '');
    acc.set(core, (acc.get(core) ?? 0) + 1);
    return acc;
  }, new Map());

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {groups.size} import warning{groups.size !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-amber-600">
            — values were adjusted to match expected format
          </span>
        </div>
        {open
          ? <ChevronDownIcon className="size-4 text-amber-500 shrink-0" />
          : <ChevronRightIcon className="size-4 text-amber-500 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-amber-200 divide-y divide-amber-100">
          {Array.from(groups.entries()).map(([msg, count]) => (
            <div key={msg} className="flex items-center justify-between px-4 py-2 gap-4">
              <span className="text-xs text-amber-800">{msg}</span>
              <span className="shrink-0 text-xs font-medium text-amber-600 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
                {count} row{count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
