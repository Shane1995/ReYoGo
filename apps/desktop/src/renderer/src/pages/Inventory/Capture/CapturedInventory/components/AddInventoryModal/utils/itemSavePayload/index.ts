import { orNull } from '../orNull';
import { isValidItemInput } from '../isValidItemInput';
import type { ItemSavePayload } from './types';

export function itemSavePayload(
  trimmed: string,
  categoryId: string,
  category: { type: string } | undefined,
  unitOfMeasureId: string,
  entityId: string | null,
): ItemSavePayload | null {
  if (!category || !entityId) return null;
  if (!isValidItemInput(trimmed, categoryId)) return null;
  return {
    name: trimmed,
    categoryId,
    type: category.type,
    unitOfMeasureId: orNull(unitOfMeasureId),
    entityId,
  };
}
