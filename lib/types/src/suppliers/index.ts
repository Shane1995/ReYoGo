import type { Timestamped } from '../base';

export interface Supplier extends Timestamped {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
}

export interface UpsertSupplierPayload {
  id: string;
  entityId: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export type ISupplier = Supplier;
export type IUpsertSupplierPayload = UpsertSupplierPayload;
