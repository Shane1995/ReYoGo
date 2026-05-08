import type { FilterField, FilterValues } from "./types";

type Props = {
  filters: FilterField[];
  values: FilterValues;
  onChange: (key: string, value: string | string[]) => void;
  onClearAll: () => void;
};

export function FilterBar(_props: Props) {
  return null;
}
