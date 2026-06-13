export function unresolvedItemsMessage(count: number): string {
  return `${count} item${count !== 1 ? 's have' : ' has'} a category that wasn't found.`;
}
