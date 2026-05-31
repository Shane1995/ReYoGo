export enum RowModeKind {
  View = 'view',
  Detail = 'detail',
  Edit = 'edit',
  MetadataEdit = 'metadata-edit',
  Audit = 'audit',
  CreditNote = 'credit-note',
}

export type RowMode =
  | { kind: RowModeKind.View }
  | { kind: RowModeKind.Detail }
  | { kind: RowModeKind.Edit }
  | { kind: RowModeKind.MetadataEdit }
  | { kind: RowModeKind.Audit }
  | { kind: RowModeKind.CreditNote };
