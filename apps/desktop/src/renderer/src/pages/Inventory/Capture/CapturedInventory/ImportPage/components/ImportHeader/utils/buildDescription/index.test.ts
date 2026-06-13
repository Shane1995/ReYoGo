import { describe, it, expect } from 'vitest';
import { buildDescription } from '.';

describe('buildDescription', () => {
  it('describes the review phase with the entity name', () => {
    expect(buildDescription('review', 'Acme Cafe')).toBe(
      'Review what will be added to Acme Cafe, then click commit.',
    );
  });

  it('describes the review phase with a generic fallback when no entity is selected', () => {
    expect(buildDescription('review')).toBe(
      'Review what will be added to your business, then click commit.',
    );
  });

  it('describes the upload prompt with the entity name', () => {
    expect(buildDescription('idle', 'Acme Cafe')).toBe(
      'Upload an Excel or CSV file to bulk-add units, categories and items for Acme Cafe.',
    );
  });

  it('describes the upload prompt without a suffix when no entity is selected', () => {
    expect(buildDescription('idle')).toBe(
      'Upload an Excel or CSV file to bulk-add units, categories and items.',
    );
  });
});
