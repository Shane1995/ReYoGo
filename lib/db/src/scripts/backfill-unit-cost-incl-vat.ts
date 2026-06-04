/**
 * One-time backfill: populate unit_cost_incl_vat on all existing invoice_line_items.
 *
 * Usage — local dev DB:
 *   pnpm --filter @reyogo/db run db:backfill
 *
 * Usage — Turso cloud:
 *   TURSO_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm --filter @reyogo/db run db:backfill
 *
 * Safe to re-run: only updates rows where unit_cost_incl_vat IS NULL.
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { and, eq, isNull } from 'drizzle-orm';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import * as schema from '../schema';

function getLocalDbPath(): string {
  const candidates = [
    join(homedir(), 'Library', 'Application Support', 'ReYoGo', 'data', 'app-dev.db'),
    join(homedir(), 'Library', 'Application Support', 'Electron', 'data', 'app-dev.db'),
    join(process.cwd(), '.data', 'app-dev.db'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    `Could not find local dev DB. Tried:\n${candidates.join('\n')}\n` +
      'Pass TURSO_URL + TURSO_AUTH_TOKEN env vars to target a cloud DB, ' +
      'or set LOCAL_DB_PATH env var to override.',
  );
}

async function main() {
  const tursoUrl = process.env.TURSO_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  const localPath = process.env.LOCAL_DB_PATH;

  let url: string;
  let authToken: string | undefined;

  if (tursoUrl) {
    url = tursoUrl;
    authToken = tursoToken;
    console.log(`Connecting to Turso: ${url}`);
  } else {
    const dbPath = localPath ?? getLocalDbPath();
    url = `file:${dbPath}`;
    console.log(`Connecting to local DB: ${dbPath}`);
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  const nullRows = await db
    .select({
      id: schema.invoiceLineItems.id,
      unitCost: schema.invoiceLineItems.unitCost,
      isVatable: schema.invoiceLineItems.isVatable,
      vatRate: schema.invoices.vatRate,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .where(isNull(schema.invoiceLineItems.unitCostInclVat));

  if (nullRows.length === 0) {
    console.log('Nothing to backfill — all rows already have unit_cost_incl_vat.');
    client.close();
    return;
  }

  console.log(`Backfilling ${nullRows.length} rows...`);

  const BATCH = 100;
  let updated = 0;

  for (let i = 0; i < nullRows.length; i += BATCH) {
    const batch = nullRows.slice(i, i + BATCH);
    for (const row of batch) {
      const vatRate = row.vatRate ?? 15;
      const isVatable = row.isVatable ?? true;
      const unitCostInclVat = isVatable ? row.unitCost * (1 + vatRate / 100) : row.unitCost;
      await db
        .update(schema.invoiceLineItems)
        .set({ unitCostInclVat })
        .where(
          and(
            eq(schema.invoiceLineItems.id, row.id),
            isNull(schema.invoiceLineItems.unitCostInclVat),
          ),
        );
    }
    updated += batch.length;
    process.stdout.write(`\r  ${updated}/${nullRows.length}`);
  }

  console.log(`\nDone. ${updated} rows updated.`);
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
