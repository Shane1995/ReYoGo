import type { IStockMovementWithLabel } from '@reyogo/types';
import type { ItemGroup } from '../../../types';

export enum HistoryView {
  PriceTrend = 'priceTrend',
  FullHistory = 'fullHistory',
}

export type HistoryTabsProps = {
  entries: ItemGroup['entries'];
  movements: IStockMovementWithLabel[];
};
