import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { useTableSort } from '@/hooks/useTableSort';
import { toggleSetMember } from '../../utils/toggleSetMember';
import { SortHead } from './components/SortHead';
import { GroupRow } from './components/GroupRow';
import { compareFns } from './constants';
import type { TableViewProps } from './types';

export function TableView({ groups }: TableViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const {
    sortedData: sortedGroups,
    sortKey,
    sortDir,
    toggleSort,
  } = useTableSort(groups, compareFns);

  const toggle = (id: string) => setExpanded((prev) => toggleSetMember(prev, id));

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No data for the selected range or search.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
            <TableHead className="w-10 py-2.5" />
            <SortHead
              sortKey="name"
              activeKey={sortKey}
              dir={sortDir}
              label="Item"
              onToggle={toggleSort}
            />
            <SortHead
              sortKey="lastCaptured"
              activeKey={sortKey}
              dir={sortDir}
              label="Last captured"
              onToggle={toggleSort}
            />
            <SortHead
              sortKey="lastUnitPrice"
              activeKey={sortKey}
              dir={sortDir}
              label="Last unit price"
              className="text-right"
              onToggle={toggleSort}
            />
            <SortHead
              sortKey="overallChange"
              activeKey={sortKey}
              dir={sortDir}
              label="Overall change"
              className="text-right"
              onToggle={toggleSort}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedGroups.map((group, i) => (
            <GroupRow
              key={group.itemId}
              group={group}
              index={i}
              expanded={expanded}
              toggle={toggle}
              navigate={navigate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
