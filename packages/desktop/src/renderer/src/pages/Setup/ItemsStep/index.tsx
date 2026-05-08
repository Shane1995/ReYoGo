import { useCallback } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "../components/DeleteButton";
import { StepNav } from "../components/StepNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { IUnitOfMeasure } from "@shared/types/contract/setup";
import { inputClass } from "../utils/inputClass";
import { createEmptyItem } from "../utils/createEmpty";
import type { PendingCategory, PendingItem } from "../utils/types";

export function ItemsStep({
  items,
  setItems,
  categories,
  units,
  onNext,
  onBack,
}: {
  items: PendingItem[];
  setItems: (i: PendingItem[]) => void;
  categories: PendingCategory[];
  units: IUnitOfMeasure[];
  onNext: () => void;
  onBack: () => void;
}) {
  const validCategories = categories.filter((c) => c.name.trim());

  const addRow = useCallback(() => {
    setItems([...items, createEmptyItem()]);
  }, [items, setItems]);

  const removeRow = useCallback(
    (id: string) => {
      setItems(items.filter((i) => i.id !== id));
    },
    [items, setItems]
  );

  const updateRow = useCallback(
    (id: string, updates: Partial<PendingItem>) => {
      setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    },
    [items, setItems]
  );

  const namedItems = items.filter((i) => i.name.trim());
  const hasValid = namedItems.some((i) => i.categoryId);
  const hasIncomplete = namedItems.some((i) => !i.categoryId);
  const canProceed = !hasIncomplete;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Inventory items</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Add the items you track in your inventory. You can add more at any time.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
              <TableHead className="font-medium text-foreground">Name</TableHead>
              <TableHead className="font-medium text-foreground">Category</TableHead>
              <TableHead className="font-medium text-foreground">Unit</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isIncomplete = !!item.name.trim() && !item.categoryId;
              return (
                <TableRow key={item.id} className="border-[var(--nav-border)] hover:bg-muted/30">
                  <TableCell className="py-2 px-3">
                    <input
                      value={item.name}
                      onChange={(e) => updateRow(item.id, { name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addRow();
                      }}
                      placeholder="Item name"
                      className={cn(inputClass, "min-w-[9rem]")}
                    />
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateRow(item.id, { categoryId: e.target.value })}
                      className={cn(
                        inputClass,
                        "min-w-[9rem] cursor-pointer",
                        isIncomplete && "border-destructive"
                      )}
                    >
                      <option value="">Select category</option>
                      {validCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.type} → {c.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <select
                      value={item.unitId}
                      onChange={(e) => updateRow(item.id, { unitId: e.target.value })}
                      className={cn(inputClass, "min-w-[7rem] cursor-pointer")}
                    >
                      <option value="">No unit</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="py-2 px-2 text-right">
                    <DeleteButton onClick={() => removeRow(item.id)} label="Remove row" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="border-t border-[var(--nav-border)] bg-muted/10 flex justify-end px-3 py-2">
          <Button type="button" variant="ghost" size="sm" onClick={addRow} className="gap-1.5">
            <PlusIcon className="size-4" aria-hidden />
            Add row
          </Button>
        </div>
      </div>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!hasValid || hasIncomplete}
        onSkip={onNext}
        skipDisabled={!canProceed && hasValid}
      />
    </div>
  );
}
