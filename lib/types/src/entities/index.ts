import type { VatMode } from '../invoices';

export interface IBusinessGroup {
  id: string;
  name: string;
}

export interface IEntity {
  id: string;
  groupId: string;
  name: string;
  defaultVatRate: number;
  defaultVatMode: VatMode;
  archivedAt: Date | null;
}

export interface ICompleteSetupPayload {
  groupName: string;
  entityNames: string[];
}
