const ERROR_PATTERNS: { keywords: string[]; message: string }[] = [
  {
    keywords: ['401', 'auth', 'forbidden', 'unauthorized'],
    message: 'Authentication failed — check your auth token.',
  },
  {
    keywords: ['404', 'not found'],
    message: 'Database not found — check your URL.',
  },
  {
    keywords: ['timed out', 'timeout', 'deadline'],
    message: 'Connection timed out — the database took too long to sync. Try again.',
  },
];

function matchesPattern(haystack: string, keywords: string[]): boolean {
  return keywords.some((keyword) => haystack.includes(keyword));
}

export function getErrorCode(err: unknown): string {
  if (err instanceof Error && 'code' in err) return String((err as { code: string }).code);
  return '';
}

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function classifyConnectError(err: unknown): Error {
  const raw = getErrorMessage(err);
  const code = getErrorCode(err);
  const haystack = `${raw} ${code}`.toLowerCase();

  const matched = ERROR_PATTERNS.find((pattern) => matchesPattern(haystack, pattern.keywords));
  if (matched) return new Error(matched.message);

  return new Error(`Could not connect to the database: ${raw}${code ? ` [${code}]` : ''}`);
}
