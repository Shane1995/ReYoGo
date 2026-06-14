export type FieldKeyDownContext = {
  field: 'qty' | 'total';
  lineId: string;
  confirmingDelete: boolean;
  isOnlyRow: boolean;
  isRowEmpty: boolean;
  onRemove: () => void;
  onNavigateNext: (field: string) => void;
  onNavigatePrev: (field: string) => void;
  onNavigateToNextRowItem: () => void;
  onAddLine: (focusField?: string) => void;
  setConfirmingDelete: (v: boolean) => void;
};
