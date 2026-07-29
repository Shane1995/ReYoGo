export type VatToggleCellProps = {
  lineId: string;
  isVatable: boolean;
  needsReview?: boolean;
  onToggle: () => void;
};
