import { formatMoney } from '../../../../utils/formatMoney';
import type { ScanReviewNotesListProps } from './types';

export function ScanReviewNotesList({ totalMismatch, reviewNotes }: ScanReviewNotesListProps) {
  if (!totalMismatch && reviewNotes.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1 text-sm text-amber-700 dark:text-amber-400">
      {totalMismatch && (
        <li className="flex items-center gap-1.5">
          <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
          Lines sum to {formatMoney(totalMismatch.computedTotal)}, Claude read the total as{' '}
          {formatMoney(totalMismatch.invoiceTotal)} — worth a quick check
        </li>
      )}
      {reviewNotes.map((note) => (
        <li key={note} className="flex items-center gap-1.5">
          <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
          {note}
        </li>
      ))}
    </ul>
  );
}
