import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGroupLogo,
  setGroupLogo,
  clearGroupLogo,
  getEntityLogo,
  setEntityLogo,
  clearEntityLogo,
} from './index';

describe('logoStorage', () => {
  beforeEach(() => localStorage.clear());

  it('stores and retrieves the group logo', () => {
    setGroupLogo('data:image/png;base64,abc');
    expect(getGroupLogo()).toBe('data:image/png;base64,abc');
  });

  it('clears the group logo', () => {
    setGroupLogo('data:image/png;base64,abc');
    clearGroupLogo();
    expect(getGroupLogo()).toBeNull();
  });

  it('stores and retrieves an entity logo', () => {
    setEntityLogo('e1', 'data:image/png;base64,xyz');
    expect(getEntityLogo('e1')).toBe('data:image/png;base64,xyz');
  });

  it('entity logos are scoped by id', () => {
    setEntityLogo('e1', 'data:image/png;base64,one');
    setEntityLogo('e2', 'data:image/png;base64,two');
    expect(getEntityLogo('e1')).toBe('data:image/png;base64,one');
    expect(getEntityLogo('e2')).toBe('data:image/png;base64,two');
  });

  it('clears an entity logo without affecting others', () => {
    setEntityLogo('e1', 'data:image/png;base64,one');
    setEntityLogo('e2', 'data:image/png;base64,two');
    clearEntityLogo('e1');
    expect(getEntityLogo('e1')).toBeNull();
    expect(getEntityLogo('e2')).toBe('data:image/png;base64,two');
  });
});
