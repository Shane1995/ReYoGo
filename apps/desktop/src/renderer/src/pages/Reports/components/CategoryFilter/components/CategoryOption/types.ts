export type CategoryOptionProps = {
  category: string;
  selected: string[];
  onToggle: (category: string) => void;
};
