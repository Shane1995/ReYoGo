type SupplierOption = { id: string; name: string };

function normalise(s: string): string {
  return s.toLowerCase().trim();
}

function matchesSupplierLoosely(target: string, supplierName: string): boolean {
  const n = normalise(supplierName);
  return n.includes(target) || target.includes(n);
}

function findExactMatch(target: string, suppliers: SupplierOption[]): SupplierOption | undefined {
  return suppliers.find((s) => normalise(s.name) === target);
}

function findLooseMatch(target: string, suppliers: SupplierOption[]): SupplierOption | undefined {
  return suppliers.find((s) => matchesSupplierLoosely(target, s.name));
}

function idOf(supplier: SupplierOption | undefined): string {
  return supplier?.id ?? '';
}

export function matchScannedSupplier(name: string | null, suppliers: SupplierOption[]): string {
  if (!name) return '';
  const target = normalise(name);

  const exact = findExactMatch(target, suppliers);
  if (exact) return idOf(exact);

  return idOf(findLooseMatch(target, suppliers));
}
