import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "./FilterBar";
import type { ColumnDef, FilterField, FilterValues } from "./types";

export type { ColumnDef, FilterField, FilterValues };

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  filters?: FilterField[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  emptyMessage?: string;
  rowKey: (row: T) => string;
};

const alignClass = (align?: "left" | "right" | "center") => {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
};

export function DataTable<T>({
  columns,
  data,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  emptyMessage = "No items found.",
  rowKey,
}: Props<T>) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {filters.length > 0 && onFilterChange && onClearFilters && (
        <FilterBar
          filters={filters}
          values={filterValues}
          onChange={onFilterChange}
          onClearAll={onClearFilters}
        />
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider text-foreground/80",
                  alignClass(col.align)
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={rowKey(row)} className={i % 2 === 1 ? "bg-white/[0.06]" : ""}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("py-3 px-4", alignClass(col.align))}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
