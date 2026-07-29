import { useRef, useState } from 'react';
import { UploadIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { ACCEPT_ATTR } from '../../../../hooks/useInvoiceScan/constants';
import type { ScanDropZoneProps } from './types';

export function ScanDropZone({ onFileSelected }: ScanDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelected(file);
      }}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full rounded-xl border-2 border-dashed p-10',
          'flex flex-col items-center gap-3 text-center transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-[var(--nav-border)] bg-muted hover:border-[var(--nav-active-border)] hover:bg-muted/80',
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--nav-bg)] border border-[var(--nav-border)]">
          <UploadIcon className="size-6 text-[var(--nav-active-border)]" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            Drop an invoice photo or PDF here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse — JPG, PNG, or PDF, up to 10MB
          </p>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
