import { sortByName } from './utils/sortByName';
import { sortByLastCaptured } from './utils/sortByLastCaptured';
import { sortByLastUnitPrice } from './utils/sortByLastUnitPrice';
import { sortByOverallChange } from './utils/sortByOverallChange';

export const compareFns = {
  name: sortByName,
  lastCaptured: sortByLastCaptured,
  lastUnitPrice: sortByLastUnitPrice,
  overallChange: sortByOverallChange,
};
