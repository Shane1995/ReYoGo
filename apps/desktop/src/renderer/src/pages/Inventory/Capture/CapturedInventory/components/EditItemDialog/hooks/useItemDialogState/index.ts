import { useEffect, useRef, useState } from 'react';
import type { InventoryItem } from '../../../../types';
import { itemFieldDefaults } from '../../utils/itemFieldDefaults';

export function useItemDialogState(item: InventoryItem | null) {
  const defaults = itemFieldDefaults(item);
  const [name, setName] = useState(defaults.name);
  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  const [unitOfMeasureId, setUnitOfMeasureId] = useState(defaults.unitOfMeasureId);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return { name, setName, categoryId, setCategoryId, unitOfMeasureId, setUnitOfMeasureId, nameRef };
}
