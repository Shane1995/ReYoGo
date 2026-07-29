import { describe, it, expect } from 'vitest';
import { fileToBase64 } from './index';

describe('fileToBase64', () => {
  it('resolves the base64 payload without the data URL prefix', async () => {
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });

    const base64 = await fileToBase64(file);

    expect(base64).toBe(Buffer.from('hello').toString('base64'));
  });
});
