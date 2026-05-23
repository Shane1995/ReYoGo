export interface ISupplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpsertSupplierPayload {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
}
