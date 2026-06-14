import type { SortDir } from '@/hooks/useTableSort';

export type SortHeadProps = {
  sortKey: string;
  activeKey: string | null;
  dir: SortDir;
  label: string;
  className?: string;
  onToggle: (key: string) => void;
};
