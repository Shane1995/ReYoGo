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
import { inputClass } from "../utils/inputClass";

export function GoodTypesStep({
  goodTypes,
  setGoodTypes,
  onNext,
  onBack,
}: {
  goodTypes: string[];
  setGoodTypes: (t: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addType = useCallback(() => {
    const name = newName.trim().toLowerCase();
    if (!name) return;
    if (goodTypes.includes(name)) return;
    setGoodTypes([...goodTypes, name]);
    setNewName("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [newName, goodTypes, setGoodTypes]);

  const removeType = useCallback(
    (type: string) => {
      setGoodTypes(goodTypes.filter((t) => t !== type));
    },
    [goodTypes, setGoodTypes]
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Good types</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Define the primary types used to classify your inventory categories (e.g. food, drink, non-perishable).
        </p>
      </div>

      <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
        {goodTypes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                <TableHead className="font-medium text-foreground">Type name</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {goodTypes.map((type) => (
                <TableRow key={type} className="border-[var(--nav-border)] hover:bg-muted/30">
                  <TableCell className="py-2 px-3 font-medium">{type}</TableCell>
                  <TableCell className="py-2 px-2 text-right">
                    <DeleteButton onClick={() => removeType(type)} label={`Remove ${type}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No types added yet. Add one below.
          </div>
        )}
        <div className="border-t border-[var(--nav-border)] px-3 py-2.5 bg-muted/10">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addType();
              }}
              placeholder="e.g. bakery, alcohol…"
              className={cn(inputClass, "flex-1")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addType}
              disabled={!newName.trim()}
              className="gap-1.5 shrink-0"
            >
              <PlusIcon className="size-3.5" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={goodTypes.length === 0} />
    </div>
  );
}
