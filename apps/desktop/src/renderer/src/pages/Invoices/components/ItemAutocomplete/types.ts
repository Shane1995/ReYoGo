export type ItemOption = {
  id: string;
  name: string;
  entityId?: string;
  categoryName?: string;
  typeLabel?: string;
  lastUnitCostInclVat?: number;
};

export type ItemAutocompleteProps = {
  items: ItemOption[];
  value: string;
  onChange: (itemId: string) => void;
  entityId: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  inputId?: string;
  onSelectComplete?: () => void;
  onNavigateRight?: () => void;
};
