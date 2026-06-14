import { useEffect, useState } from 'react';
import type { Supplier } from '@reyogo/types';
import { suppliersService } from '@/services/suppliers';

export function useSuppliers(entityId: string | null): Supplier[] {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  useEffect(() => {
    if (!entityId) return;
    suppliersService.getSuppliers(entityId).then((s) => setSuppliers(s ?? []));
  }, [entityId]);
  return suppliers;
}
