import { getDb, schema } from '@main/db';

function serializeAccount(row: { id: string; name: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  };
}

export const getAccounts = async () => {
  const accounts = await getDb().select().from(schema.accounts);

  return accounts.map(serializeAccount);
};