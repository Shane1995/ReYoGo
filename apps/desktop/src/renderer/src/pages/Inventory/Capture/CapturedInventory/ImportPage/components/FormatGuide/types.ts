export type FormatGuideColumn = {
  name: string;
  note?: string;
};

export type FormatGuideSheet = {
  sheet: string;
  cols: FormatGuideColumn[];
};
