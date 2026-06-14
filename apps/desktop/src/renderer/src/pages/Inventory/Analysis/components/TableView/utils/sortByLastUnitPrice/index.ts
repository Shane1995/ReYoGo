import type { ItemGroup } from '../../../../types';
import { lastUnitPriceOf } from '../lastUnitPriceOf';

export function sortByLastUnitPrice(a: ItemGroup, b: ItemGroup): number {
  return lastUnitPriceOf(a) - lastUnitPriceOf(b);
}
