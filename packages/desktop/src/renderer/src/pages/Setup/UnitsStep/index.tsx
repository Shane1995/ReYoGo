import { useState, useCallback, useRef } from "react";
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

export function UnitsStep({
  units,
  setUnits,
  onNext,
  onBack,
}: {
  units: IUnitOfMeasure[];
  setUnits: (u: IUnitOfMeasure[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addUnit = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    const duplicate = units.some((u) => u.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return;
    setUnits([...units, { id: crypto.randomUUID(), name }]);
    setNewName("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [newName, units, setUnits]);

  const removeUnit = useCallback(
    (id: string) => {
      setUnits(units.filter((u) => u.id !== id));
    },
    [units, setUnits]
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Units of measure</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Define the units you'll use to measure inventory items. You can always add more later.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
        {units.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                <TableHead className="font-medium text-foreground">Unit name</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id} className="border-[var(--nav-border)] hover:bg-muted/30">
                  <TableCell className="py-2 px-3 font-medium">{unit.name}</TableCell>
                  <TableCell className="py-2 px-2 text-right">
                    <DeleteButton onClick={() => removeUnit(unit.id)} label={`Remove ${unit.name}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No units added yet. Add one below.
          </div>
        )}
        <div className="border-t border-[var(--nav-border)] px-3 py-2.5 bg-muted/10">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addUnit();
              }}
              placeholder="e.g. pieces, boxes, bags…"
              className={cn(inputClass, "flex-1")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUnit}
              disabled={!newName.trim()}
              className="gap-1.5 shrink-0"
            >
              <PlusIcon className="size-3.5" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={units.length === 0} />
    </div>
  );
}
