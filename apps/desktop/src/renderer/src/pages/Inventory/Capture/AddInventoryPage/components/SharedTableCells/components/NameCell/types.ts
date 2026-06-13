export type NameCellProps = {
  id: string;
  value: string;
  isDupe: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onEnter: () => void;
};
