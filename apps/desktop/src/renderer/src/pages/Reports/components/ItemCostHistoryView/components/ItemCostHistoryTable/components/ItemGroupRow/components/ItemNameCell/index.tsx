import type { ItemNameCellProps } from './types';

export function ItemNameCell({ name, uom }: ItemNameCellProps) {
  return (
    <>
      {name}
      {uom ? <span className="text-muted-foreground/60"> / {uom}</span> : null}
    </>
  );
}
