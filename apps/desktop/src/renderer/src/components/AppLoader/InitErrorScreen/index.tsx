type Props = { error: string };

const MIGRATION_ERROR_PATTERNS = [
  /cannot add a not null column/i,
  /NOT NULL constraint/i,
  /migration/i,
];

const CLOUD_ERROR_PATTERNS = [
  /onedrive|dropbox|icloud|google drive|synced/i,
  /readonly|read-only|EROFS|EPERM/i,
];

function matchesAny(error: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(error));
}

function hintFor(error: string): string {
  if (matchesAny(error, MIGRATION_ERROR_PATTERNS)) {
    return 'A database schema update failed. If you are upgrading from an older version, try deleting the app data folder and relaunching.';
  }
  if (matchesAny(error, CLOUD_ERROR_PATTERNS)) {
    return 'If this app is installed inside a OneDrive or cloud-synced folder, try moving it to a local folder (e.g. Desktop or C:\\Program Files).';
  }
  return 'Try relaunching the app. If the problem persists, reinstall or contact support.';
}

export function InitErrorScreen({ error }: Props) {
  const hint = hintFor(error);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background p-8">
      <img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        alt="ReYoGo"
        className="size-16 opacity-50"
        draggable={false}
      />
      <div className="flex flex-col items-center gap-2 text-center max-w-lg">
        <span className="text-base font-semibold text-foreground">Failed to start ReYoGo</span>
        <span className="text-sm text-muted-foreground">
          The database could not be initialized. {hint}
        </span>
        <code className="mt-2 rounded bg-muted px-3 py-2 text-xs text-muted-foreground break-all">
          {error}
        </code>
      </div>
    </div>
  );
}
