import { describe, it, expect } from 'vitest';
import { reconnectErrorMessage } from '.';

describe('reconnectErrorMessage', () => {
  it('returns the message for Error instances', () => {
    expect(reconnectErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns a fallback message for non-Error values', () => {
    expect(reconnectErrorMessage('boom')).toBe('Connection failed. Please try again.');
    expect(reconnectErrorMessage(undefined)).toBe('Connection failed. Please try again.');
  });
});
