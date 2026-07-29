import { Button } from '@reyogo/ui';
import { ScannedDocumentPreview } from '../../../ScannedDocumentPreview';
import { formatFileSize } from '../../../../utils/formatFileSize';
import type { ScanPreviewProps } from './types';

export function ScanPreview({ file, previewUrl, onConfirm, onChooseDifferent }: ScanPreviewProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="flex flex-col gap-3">
      <ScannedDocumentPreview
        url={previewUrl}
        fileName={file.name}
        mimeType={file.type}
        fileSizeBytes={file.size}
      />
      {isImage && (
        <p className="truncate text-xs text-muted-foreground">
          {file.name} · {formatFileSize(file.size)}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onChooseDifferent}>
          Choose different file
        </Button>
        <Button onClick={onConfirm}>Scan this invoice</Button>
      </div>
    </div>
  );
}
