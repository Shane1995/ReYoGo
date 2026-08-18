import type { IStocktakeSession } from '@reyogo/types';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

export function sessionOptionLabelOf(session: IStocktakeSession): string {
  const name = session.label ?? 'Untitled stock take';
  const date = session.createdAt.toLocaleDateString('en-ZA', DATE_FORMAT);
  return `${name} · ${date}`;
}
