export type TipEntry = { fullDate: string; price: number; qty: number };

export type PriceTipProps = {
  active?: boolean;
  payload?: { payload: TipEntry }[];
  uom?: string;
};
