export function stockQuantityLabel(stock: number): string {
  if (stock % 1 === 0) return stock.toFixed(0);
  return stock.toFixed(2);
}
