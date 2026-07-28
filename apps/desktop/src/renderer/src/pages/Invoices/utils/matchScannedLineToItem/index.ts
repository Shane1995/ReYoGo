import type { ItemOption } from '../../components/ItemAutocomplete';
import { ITEM_MATCH_CONFIDENCE_THRESHOLD } from './constants';

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function fullWordCoverageScore(a: string, wordsB: string[]): number | null {
  if (wordsB.length === 0) return null;
  return wordsB.every((w) => a.includes(w)) ? 1 : null;
}

function substringScore(a: string, b: string): number | null {
  return a.includes(b) && b.length > 2 ? 0.9 : null;
}

function partialOverlapScore(a: string, wordsB: string[]): number {
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const wordsBSet = new Set(wordsB.filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsBSet.size === 0) return 0;

  const hits = [...wordsBSet].filter((w) => wordsA.has(w)).length;
  return hits === 0 ? 0 : hits / Math.max(wordsA.size, wordsBSet.size);
}

function wordOverlapScore(description: string, itemName: string): number {
  const a = normalise(description);
  const b = normalise(itemName);
  const wordsB = b.split(/\s+/).filter((w) => w.length > 1);
  return fullWordCoverageScore(a, wordsB) ?? substringScore(a, b) ?? partialOverlapScore(a, wordsB);
}

type ScoredItem = { item: ItemOption; score: number };

function findBestMatch(description: string, items: ItemOption[]): ScoredItem | null {
  let best: ScoredItem | null = null;
  for (const item of items) {
    const score = wordOverlapScore(description, item.name);
    if (!best || score > best.score) best = { item, score };
  }
  return best;
}

export function matchScannedLineToItem(
  description: string,
  items: ItemOption[],
): { itemId: string; matched: boolean } {
  const best = findBestMatch(description, items);
  if (!best || best.score < ITEM_MATCH_CONFIDENCE_THRESHOLD) {
    return { itemId: '', matched: false };
  }
  return { itemId: best.item.id, matched: true };
}
