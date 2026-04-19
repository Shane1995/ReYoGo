export function formatDate(d: Date): string {
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
