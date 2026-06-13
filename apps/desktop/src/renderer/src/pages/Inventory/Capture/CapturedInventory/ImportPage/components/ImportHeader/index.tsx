import { UploadIcon, DownloadIcon, FileSpreadsheetIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import { buildDescription } from './utils/buildDescription';
import type { ImportHeaderProps } from './types';

export function ImportHeader({
  phase,
  entityName,
  onDownloadTemplate,
  onChooseDifferentFile,
}: ImportHeaderProps) {
  const description = buildDescription(phase, entityName);

  return (
    <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-5 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheetIcon className="size-5 text-[var(--nav-active-border)] shrink-0" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Import inventory</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={onDownloadTemplate}
          >
            <DownloadIcon className="size-3.5" />
            Template
          </Button>
          {phase === 'review' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onChooseDifferentFile}
            >
              <UploadIcon className="size-3.5" />
              Different file
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
