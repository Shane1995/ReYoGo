const MIN_COLUMN_WIDTH = 8;
const COLUMN_WIDTH_PADDING = 2;

function cellLength(cell: string | number): number {
  return String(cell).length;
}

export function columnWidthsOf(rows: (string | number)[][]): Array<{ wch: number }> {
  const columnCount = rows[0]?.length ?? 0;
  return Array.from({ length: columnCount }, (_, columnIndex) => {
    const maxLength = rows.reduce(
      (max, row) => Math.max(max, cellLength(row[columnIndex] ?? '')),
      MIN_COLUMN_WIDTH,
    );
    return { wch: maxLength + COLUMN_WIDTH_PADDING };
  });
}
