import { describe, it, expect } from 'vitest';
import { resolveIcon, resolvePath } from '.';
import { appConfig } from '@/config/app.config';

describe('resolveIcon', () => {
  it('returns a defined component for a known icon key', () => {
    expect(resolveIcon('Package')).toBeDefined();
  });

  it('returns different components for different keys', () => {
    expect(resolveIcon('Package')).not.toBe(resolveIcon('Receipt'));
  });

  it('throws for an unknown icon key', () => {
    expect(() => resolveIcon('NonExistentIcon')).toThrow('Unknown icon key');
  });
});

describe('resolvePath', () => {
  it('returns a string path for a known path key', () => {
    expect(resolvePath('home')).toBe('/');
  });

  it('resolves nested path keys', () => {
    expect(resolvePath('stock.addItems')).toBe('/stock/add-items');
  });

  it('throws for an unknown path key', () => {
    expect(() => resolvePath('nonexistent.path')).toThrow('Unknown path key');
  });

  it('resolves every key registered in the route config', () => {
    Object.keys(appConfig.routes).forEach((key) => {
      expect(() => resolvePath(key)).not.toThrow();
    });
  });
});
