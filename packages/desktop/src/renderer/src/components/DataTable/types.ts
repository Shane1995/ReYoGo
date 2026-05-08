import type { ReactNode } from "react";

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
}

export type FilterOption = { value: string; label: string };

export interface FilterField {
  key: string;
  label: string;
  type: "search" | "select";
  multi?: boolean;
  options?: FilterOption[] | ((values: FilterValues) => FilterOption[]);
  placeholder?: string;
}

export type FilterValues = Record<string, string | string[]>;
