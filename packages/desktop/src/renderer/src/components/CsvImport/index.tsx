import { useRef, useState, useCallback } from 'react';
import { UploadIcon, DownloadIcon, FileSpreadsheetIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { parseFile, downloadTemplate } from './parser';
import type { ParseResult } from './parser';
import { enrichParseResult } from './review';
import type { ReviewResult } from './review';
import { ImportReview } from './ImportReview';
import { fetchExisting } from './utils/fetchExisting';
import { setupService } from '@/services/setup';

export { downloadTemplate };

interface CsvImportButtonProps {
  onImport: (result: ParseResult, review: ReviewResult) => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm';
  className?: string;
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'parsing' }
  | { kind: 'loading-db' }
  | { kind: 'review'; parsed: ParseResult; review: ReviewResult }
  | { kind: 'error'; message: string };

export function CsvImportButton({
  onImport,
  label = 'Import',
  variant = 'outline',
  size = 'sm',
  className,
}: CsvImportButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [open, setOpen] = useState(false);

  const openPicker = useCallback(() => fileRef.current?.click(), []);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setOpen(true);
    setPhase({ kind: 'parsing' });
    try {
      const parsed = await parseFile(file);
      setPhase({ kind: 'loading-db' });
      const existing = await fetchExisting();
      const review = enrichParseResult(parsed, existing);
      setPhase({ kind: 'review', parsed, review });
    } catch {
      setPhase({ kind: 'error', message: 'Could not read the file. Make sure it is a valid .xlsx or .csv file.' });
    }
  }, []);

  const handleCommit = useCallback(
    (finalReview: ReviewResult) => {
      if (phase.kind !== 'review') return;
      onImport(phase.parsed, finalReview);
      setOpen(false);
      setPhase({ kind: 'idle' });
    },
    [phase, onImport]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setPhase({ kind: 'idle' });
  }, []);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn('gap-1.5', className)}
        onClick={openPicker}
      >
        <UploadIcon className="size-3.5" aria-hidden />
        {label}
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={handleFile}
      />

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={phase.kind === 'review' ? undefined : handleClose}
        >
          <div
            className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-[var(--nav-border)] bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--nav-border)] px-5 py-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheetIcon className="size-5 text-[var(--nav-active-border)]" />
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {phase.kind === 'review' ? 'Review import' : 'Import from Excel / CSV'}
                  </h2>
                  {phase.kind === 'review' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Check what will be added, then click commit.
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
              {(phase.kind === 'idle' || phase.kind === 'error') && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-[var(--nav-border)] bg-muted/30 p-4 space-y-3 text-sm">
                    <p className="font-semibold text-foreground">Expected format</p>
                    <p className="text-muted-foreground">
                      Use the Excel template below. It has three sheets —{' '}
                      <span className="font-medium text-foreground">Units</span>,{' '}
                      <span className="font-medium text-foreground">Categories</span>, and{' '}
                      <span className="font-medium text-foreground">Items</span>. Fill in only the sheets you need.
                    </p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {[
                        { sheet: 'Units', cols: 'name' },
                        { sheet: 'Categories', cols: 'name, type (matches your configured good types)' },
                        { sheet: 'Items', cols: 'name, category_name, unit (optional)' },
                      ].map((r) => (
                        <div key={r.sheet} className="flex items-start gap-2">
                          <code className="bg-background border border-[var(--nav-border)] rounded px-1.5 py-0.5 shrink-0">{r.sheet}</code>
                          <span>{r.cols}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const types = await setupService.getGoodTypes() as string[];
                        downloadTemplate(types);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--nav-active-border)] hover:underline"
                    >
                      <DownloadIcon className="size-3.5" />
                      Download Excel template (.xlsx)
                    </button>
                  </div>

                  {phase.kind === 'error' && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {phase.message}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={openPicker}
                    className={cn(
                      'w-full rounded-lg border-2 border-dashed border-[var(--nav-border)] p-8',
                      'flex flex-col items-center gap-3 text-center',
                      'hover:border-[var(--nav-active-border)] hover:bg-muted/20 transition-colors'
                    )}
                  >
                    <UploadIcon className="size-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Choose a file</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Supports .xlsx and .csv</p>
                    </div>
                  </button>
                </div>
              )}

              {(phase.kind === 'parsing' || phase.kind === 'loading-db') && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-muted-foreground">
                  <Spinner className="size-5" />
                  {phase.kind === 'parsing' ? 'Reading file…' : 'Checking against database…'}
                </div>
              )}

              {phase.kind === 'review' && (
                <ImportReview
                  review={phase.review}
                  onCommit={handleCommit}
                  onCancel={handleClose}
                  commitLabel="Add to table"
                />
              )}
            </div>

            {(phase.kind === 'idle' || phase.kind === 'error') && (
              <div className="flex justify-end border-t border-[var(--nav-border)] px-5 py-3 shrink-0">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={openPicker}>
                    Choose file
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
