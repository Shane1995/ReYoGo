import { Popover, PopoverTrigger, PopoverContent } from '@reyogo/ui';
import {
  MoreHorizontalIcon,
  CopyIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  ReceiptIcon,
} from 'lucide-react';

type Props = {
  isPosted: boolean;
  isPosting: boolean;
  isCreditNote: boolean;
  onReuse: () => void;
  onEdit: () => void;
  onPost: () => void;
  onAudit: () => void;
  onRaiseCreditNote: () => void;
};

const item =
  'flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40';

function InvoiceMenuItems({
  isPosted,
  isPosting,
  onReuse,
  onEdit,
  onPost,
  onAudit,
  onRaiseCreditNote,
}: Omit<Props, 'isCreditNote'>) {
  return (
    <>
      <button type="button" className={item} onClick={onReuse}>
        <CopyIcon className="size-3.5 shrink-0" />
        Reuse
      </button>
      <button
        type="button"
        className={item}
        title={isPosted ? 'Edit supplier, date and invoice number' : 'Edit lines'}
        onClick={onEdit}
      >
        <PencilIcon className="size-3.5 shrink-0" />
        Edit
      </button>
      {!isPosted && (
        <>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            className={`${item} text-emerald-600 hover:text-emerald-700 dark:text-emerald-400`}
            disabled={isPosting}
            onClick={onPost}
          >
            <CheckCircleIcon className="size-3.5 shrink-0" />
            {isPosting ? 'Posting…' : 'Post'}
          </button>
        </>
      )}
      <div className="my-1 h-px bg-border" />
      <button type="button" className={item} onClick={onAudit}>
        <ClockIcon className="size-3.5 shrink-0" />
        Audit log
      </button>
      {isPosted && (
        <>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            className={`${item} text-rose-600 hover:text-rose-700 dark:text-rose-400`}
            onClick={onRaiseCreditNote}
          >
            <ReceiptIcon className="size-3.5 shrink-0" />
            Raise credit note
          </button>
        </>
      )}
    </>
  );
}

export function RowActions({
  isPosted,
  isPosting,
  isCreditNote,
  onReuse,
  onEdit,
  onPost,
  onAudit,
  onRaiseCreditNote,
}: Props) {
  return (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded transition-colors text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreHorizontalIcon className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1">
          {isCreditNote ? (
            <button type="button" className={item} onClick={onAudit}>
              <ClockIcon className="size-3.5 shrink-0" />
              Audit log
            </button>
          ) : (
            <InvoiceMenuItems
              isPosted={isPosted}
              isPosting={isPosting}
              onReuse={onReuse}
              onEdit={onEdit}
              onPost={onPost}
              onAudit={onAudit}
              onRaiseCreditNote={onRaiseCreditNote}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
