import { TableCell, cn } from '@reyogo/ui';

export function VatToggleCell({
  lineId,
  isVatable,
  onToggle,
}: {
  lineId: string;
  isVatable: boolean;
  onToggle: () => void;
}) {
  return (
    <TableCell className="py-2 px-3 text-center">
      <button
        id={`invoice-vat-${lineId}`}
        type="button"
        role="checkbox"
        aria-checked={isVatable}
        onClick={onToggle}
        title={isVatable ? 'Taxable — click to exempt' : 'Exempt — click to make taxable'}
        className={cn(
          'inline-flex items-center justify-center size-5 rounded border transition-all',
          isVatable
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-background border-input text-transparent hover:border-primary/50',
        )}
      >
        <svg viewBox="0 0 10 8" className="size-2.5 fill-current" aria-hidden>
          <path
            d="M1 4l3 3 5-6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </TableCell>
  );
}
