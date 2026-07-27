import { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { toggleSetMember } from '@/pages/Inventory/Analysis/utils/toggleSetMember';
import { groupByCategory } from '../../../../utils/groupByCategory';
import { CategoryGroup } from '../../../CategoryGroup';
import { groupRowsByItem } from './utils/groupRowsByItem';
import { ItemGroupRow } from './components/ItemGroupRow';
import type { ItemCostHistoryTableProps } from './types';

export function ItemCostHistoryTable({ rows }: ItemCostHistoryTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No purchases for the selected range or category.
      </div>
    );
  }

  const toggleItem = (itemId: string) => setExpandedItems((prev) => toggleSetMember(prev, itemId));
  const toggleCategory = (category: string) =>
    setCollapsedCategories((prev) => toggleSetMember(prev, category));

  const buckets = groupByCategory(rows, (row) => row.categoryName);

  return (
    <div className="space-y-3">
      {buckets.map((bucket) => {
        const itemGroups = groupRowsByItem(bucket.rows);
        return (
          <CategoryGroup
            key={bucket.category}
            category={bucket.category}
            count={itemGroups.length}
            isExpanded={!collapsedCategories.has(bucket.category)}
            onToggle={toggleCategory}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
                  <TableHead className="w-10" />
                  <TableHead>Item</TableHead>
                  <TableHead>Last purchased</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Excl. VAT</TableHead>
                  <TableHead className="text-right">Incl. VAT</TableHead>
                  <TableHead className="text-center">Taxable</TableHead>
                  <TableHead className="text-right">% Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemGroups.map((group, index) => (
                  <ItemGroupRow
                    key={group.itemId}
                    group={group}
                    index={index}
                    isExpanded={expandedItems.has(group.itemId)}
                    onToggle={toggleItem}
                  />
                ))}
              </TableBody>
            </Table>
          </CategoryGroup>
        );
      })}
    </div>
  );
}
