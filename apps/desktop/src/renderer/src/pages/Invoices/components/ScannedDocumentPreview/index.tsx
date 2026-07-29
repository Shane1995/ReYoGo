import { FileTextIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { formatFileSize } from '../../utils/formatFileSize';
import type { ScannedDocumentPreviewProps } from './types';

export function ScannedDocumentPreview({
  url,
  fileName,
  mimeType,
  fileSizeBytes,
  className,
}: ScannedDocumentPreviewProps) {
  if (mimeType.startsWith('image/')) {
    return (
      <img
        src={url}
        alt={fileName}
        className={cn(
          'max-h-72 w-full rounded-lg border border-[var(--nav-border)] object-contain bg-muted',
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-[var(--nav-border)] bg-muted p-4',
        className,
      )}
    >
      <FileTextIcon className="size-8 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
        <p className="text-xs text-muted-foreground">PDF · {formatFileSize(fileSizeBytes)}</p>
      </div>
    </div>
  );
}
