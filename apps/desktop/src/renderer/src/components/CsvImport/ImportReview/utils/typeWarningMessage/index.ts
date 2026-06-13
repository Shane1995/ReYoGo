export function typeWarningMessage(count: number): string {
  return `${count} categor${count !== 1 ? 'ies have' : 'y has'} an unrecognised type.`;
}
