import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createEntitiesRepo } from '.';

let db: DbClient;
let repo: ReturnType<typeof createEntitiesRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createEntitiesRepo(db);
});

describe('createEntitiesRepo', () => {
  describe('getGroup', () => {
    it('returns the default business group', async () => {
      const group = await repo.getGroup('default');
      expect(group).not.toBeNull();
      expect(group!.name).toBe('Test Group');
    });

    it('returns null when account has no group', async () => {
      const group = await repo.getGroup('nonexistent');
      expect(group).toBeNull();
    });
  });

  describe('getEntities', () => {
    it('returns all active entities for the account', async () => {
      const result = await repo.getEntities('default');
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Test Entity');
      expect(result[0]!.archivedAt).toBeNull();
    });
  });

  describe('updateGroupName', () => {
    it('updates the group name', async () => {
      await repo.updateGroupName('default-group', 'New Name');
      const group = await repo.getGroup('default');
      expect(group!.name).toBe('New Name');
    });
  });

  describe('createEntity', () => {
    it('creates a new entity in the group', async () => {
      await repo.createEntity({ id: 'entity-2', groupId: 'default-group', name: 'Bar' });
      const result = await repo.getEntities('default');
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.name)).toContain('Bar');
    });
  });

  describe('renameEntity', () => {
    it('renames an existing entity', async () => {
      await repo.renameEntity('default', 'Renamed');
      const result = await repo.getEntities('default');
      expect(result[0]!.name).toBe('Renamed');
    });
  });

  describe('completeSetup', () => {
    it('sets setupComplete=true and renames group and entities', async () => {
      await repo.completeSetup('default', 'The Crown Group', ['The Crown Pub', 'Gin on Tap']);
      const group = await repo.getGroup('default');
      expect(group!.name).toBe('The Crown Group');
      const ents = await repo.getEntities('default');
      expect(ents.map((e) => e.name)).toContain('The Crown Pub');
      expect(ents.map((e) => e.name)).toContain('Gin on Tap');
    });
  });

  describe('getSetupState', () => {
    it('returns setupComplete=false initially', async () => {
      const state = await repo.getSetupState('default');
      expect(state.setupComplete).toBe(false);
    });
  });
});
