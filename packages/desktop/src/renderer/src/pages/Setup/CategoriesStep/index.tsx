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
import { inputClass } from "../utils/inputClass";
import { createEmptyCategory } from "../utils/createEmpty";
import type { PendingCategory } from "../utils/types";

export function CategoriesStep({
  categories,
  setCategories,
  goodTypes,
  onNext,
  onBack,
}: {
  categories: PendingCategory[];
  setCategories: (c: PendingCategory[]) => void;
  goodTypes: string[];
  onNext: () => void;
  onBack: () => void;
}) {
  const defaultType = goodTypes[0] ?? "";

  const addRow = useCallback(() => {
    setCategories([...categories, createEmptyCategory(defaultType)]);
  }, [categories, setCategories, defaultType]);

  const removeRow = useCallback(
    (id: string) => {
      setCategories(categories.filter((c) => c.id !== id));
    },
    [categories, setCategories]
  );

  const updateRow = useCallback(
    (id: string, updates: Partial<PendingCategory>) => {
      setCategories(categories.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    },
    [categories, setCategories]
  );

  const hasValid = categories.some((c) => c.name.trim());

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Inventory categories</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Group your items into categories. Each category has a type.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
              <TableHead className="font-medium text-foreground">Name</TableHead>
              <TableHead className="font-medium text-foreground">Type</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id} className="border-[var(--nav-border)] hover:bg-muted/30">
                <TableCell className="py-2 px-3">
                  <input
                    value={cat.name}
                    onChange={(e) => updateRow(cat.id, { name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addRow();
                    }}
                    placeholder="Category name"
                    className={cn(inputClass, "min-w-[10rem]")}
                  />
                </TableCell>
                <TableCell className="py-2 px-3">
                  <select
                    value={cat.type}
                    onChange={(e) => updateRow(cat.id, { type: e.target.value })}
                    className={cn(inputClass, "min-w-[9rem] cursor-pointer")}
                  >
                    {goodTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="py-2 px-2 text-right">
                  <DeleteButton onClick={() => removeRow(cat.id)} label="Remove row" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-[var(--nav-border)] bg-muted/10 flex justify-end px-3 py-2">
          <Button type="button" variant="ghost" size="sm" onClick={addRow} className="gap-1.5">
            <PlusIcon className="size-4" aria-hidden />
            Add row
          </Button>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!hasValid} onSkip={onNext} />
    </div>
  );
}
