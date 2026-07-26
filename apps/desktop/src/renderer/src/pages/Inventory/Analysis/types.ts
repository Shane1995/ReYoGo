export type ItemEntry = {
  invoiceId: string;
  date: Date;
  quantity: number;
  unitPrice: number;
  unitPriceInclVat: number;
  isVatable: boolean;
  uom?: string;
};

export type ItemGroup = {
  itemId: string;
  name: string;
  uom?: string;
  categoryType: string;
  categoryName?: string;
  entries: ItemEntry[];
};
