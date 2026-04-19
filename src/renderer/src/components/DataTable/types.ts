export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "search" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export type FilterValues = Record<string, string>;
