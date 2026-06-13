export enum ReviewStatus {
  New = 'new',
  Exists = 'exists',
  Unresolved = 'unresolved',
}

export type UnitStatus = ReviewStatus.New | ReviewStatus.Exists;
export type CategoryStatus = ReviewStatus.New | ReviewStatus.Exists;
export type ItemStatus = ReviewStatus;
