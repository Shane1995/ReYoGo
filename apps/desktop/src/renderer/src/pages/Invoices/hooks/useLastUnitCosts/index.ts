import { useState, useEffect } from 'react';
import { invoiceService } from '@/services/invoice';

export function useLastUnitCosts(): Record<string, number> {
  const [lastUnitCosts, setLastUnitCosts] = useState<Record<string, number>>({});

  useEffect(() => {
    invoiceService
      .getLastUnitPrices()
      .then((prices) => {
        setLastUnitCosts(
          Object.fromEntries(Object.entries(prices).map(([id, p]) => [id, p.inclVat])),
        );
      })
      .catch((err: unknown) => {
        console.error('Failed to load last unit prices', err);
      });
  }, []);

  return lastUnitCosts;
}
