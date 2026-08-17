import type { CountSheetRow } from '../../../../types';

export type CountSheetRowInputProps = {
  row: CountSheetRow;
  readOnly: boolean;
  onQtyChange: (itemId: string, qty: number | null) => void;
};
