import type { Supplier } from '@reyogo/types';

export type SupplierFieldProps = {
  value: string;
  onChange: (id: string) => void;
  suppliers: Supplier[];
  needsReview: boolean;
};
