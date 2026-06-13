import type { FormatGuideSheet } from './types';

export const FORMAT_GUIDE_SHEETS: FormatGuideSheet[] = [
  {
    sheet: 'Units',
    cols: [{ name: 'name', note: 'e.g. litres, kgs, pieces' }],
  },
  {
    sheet: 'Categories',
    cols: [{ name: 'name' }, { name: 'type', note: 'food · beverage · non-food' }],
  },
  {
    sheet: 'Items',
    cols: [
      { name: 'name' },
      { name: 'category_name', note: 'must match a category name' },
      { name: 'unit', note: 'optional' },
    ],
  },
];
