export enum RowModeKind {
  View = 'view',
  Detail = 'detail',
  Edit = 'edit',
  MetadataEdit = 'metadata-edit',
  Audit = 'audit',
}

export type RowMode =
  | { kind: RowModeKind.View }
  | { kind: RowModeKind.Detail }
  | { kind: RowModeKind.Edit }
  | { kind: RowModeKind.MetadataEdit }
  | { kind: RowModeKind.Audit };
