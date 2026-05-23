import type { ITimestamped } from '../base';

export interface ISupplier extends ITimestamped {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
}

export interface IUpsertSupplierPayload {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
}
