export interface ReviewRowProps {
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}
