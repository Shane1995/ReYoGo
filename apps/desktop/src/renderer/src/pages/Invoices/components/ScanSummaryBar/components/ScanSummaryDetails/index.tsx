import { CoinsIcon, ZapIcon } from 'lucide-react';
import { Badge, StatCard } from '@reyogo/ui';
import { ScannedDocumentPreview } from '../../../ScannedDocumentPreview';
import { formatDate } from '../../../../utils/formatDate';
import { ScanReviewNotesList } from '../ScanReviewNotesList';
import { CONFIDENCE_BADGE_CLASS, CONFIDENCE_LABEL, COST_DECIMALS } from '../../constants';
import { resolveDisplayConfidence } from './utils/resolveDisplayConfidence';
import type { ScanSummaryDetailsProps } from './types';

export function ScanSummaryDetails({ summary }: ScanSummaryDetailsProps) {
  const {
    usage,
    reviewNotes,
    totalMismatch,
    confidence,
    scannedAt,
    previewUrl,
    fileName,
    mimeType,
    fileSizeBytes,
  } = summary;

  const displayConfidence = resolveDisplayConfidence(
    confidence,
    reviewNotes.length > 0 || totalMismatch !== null,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--nav-border)] pt-3">
      {previewUrl && (
        <ScannedDocumentPreview
          url={previewUrl}
          fileName={fileName}
          mimeType={mimeType}
          fileSizeBytes={fileSizeBytes}
          className="max-h-48"
        />
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Scanned {formatDate(scannedAt)}</span>
        <span>·</span>
        <Badge variant="outline" className={CONFIDENCE_BADGE_CLASS[displayConfidence]}>
          {CONFIDENCE_LABEL[displayConfidence]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
        <StatCard
          label="Tokens used"
          value={(usage.inputTokens + usage.outputTokens).toLocaleString()}
          icon={ZapIcon}
          className="min-w-32 p-3"
        />
        <StatCard
          label="Scan cost (USD)"
          value={`$${usage.estimatedCostUsd.toFixed(COST_DECIMALS)}`}
          icon={CoinsIcon}
          className="min-w-32 p-3"
        />
      </div>

      <ScanReviewNotesList totalMismatch={totalMismatch} reviewNotes={reviewNotes} />
    </div>
  );
}
