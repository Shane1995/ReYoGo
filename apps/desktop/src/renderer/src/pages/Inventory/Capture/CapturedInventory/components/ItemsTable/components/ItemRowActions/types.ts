import type { InventoryItem } from '../../../../types';
import type { FlatItem } from '../../types';

export type ItemRowActionsProps = {
  row: FlatItem;
  originalItem: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onViewInsights: (id: string) => void;
  onDelete: (id: string) => void;
};
