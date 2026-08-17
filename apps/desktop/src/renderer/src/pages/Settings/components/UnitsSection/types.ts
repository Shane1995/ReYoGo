import type { UnitOfMeasure } from '@reyogo/types';

export type UnitWithUsage = UnitOfMeasure & { usageCount: number };
