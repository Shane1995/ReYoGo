import { useState, useCallback, useRef } from "react";
import { CheckIcon, PlusIcon, Trash2Icon, PackageIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { IInventoryCategory, IInventoryItem } from "@shared/types/contract/inventory";
import { CsvImportButton, downloadTemplate } from "@/components/CsvImport";
import type { ReviewResult } from "@/components/CsvImport/review";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "welcome" | "good-types" | "units" | "categories" | "items" | "done";

const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  "good-types": "Types",
  units: "Units",
  categories: "Categories",
  items: "Items",
  done: "Done",
};

const DEFAULT_GOOD_TYPES = ["food", "drink", "non-perishable"];

const DEFAULT_UNITS: IUnitOfMeasure[] = [
  { id: crypto.randomUUID(), name: "litres" },
  { id: crypto.randomUUID(), name: "kgs" },
  { id: crypto.randomUUID(), name: "unit" },
];

// ─── Shared input style ───────────────────────────────────────────────────────

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50"
);

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const visible: Step[] = ["good-types", "units", "categories", "items"];
  return (
    <div className="flex items-center gap-2">
      {visible.map((step, i) => {
        const currentIdx = visible.indexOf(current as Step);
        const isDone = currentIdx > i;
        const isActive = current === step;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isDone && "bg-[var(--nav-active-border)] text-white",
                isActive && "bg-[var(--nav-active-border)] text-white",
                !isDone && !isActive && "border border-[var(--nav-border)] text-muted-foreground bg-background"
              )}
            >
              {isDone ? <CheckIcon className="size-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                isActive ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[step]}
            </span>
            {i < visible.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-px w-8",
                  isDone ? "bg-[var(--nav-active-border)]" : "bg-[var(--nav-border)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Welcome step ─────────────────────────────────────────────────────────────

function WelcomeStep({
  onNext,
  onImport,
}: {
  onNext: () => void;
  onImport: (parsed: unknown, review: ReviewResult) => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--nav-bg)] border border-[var(--nav-border)]">
        <PackageIcon className="size-8 text-[var(--nav-active-border)]" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome to ReYoGo</h1>
        <p className="text-muted-foreground max-w-sm">
          Set up your inventory system manually step by step, or import everything at once from an
          Excel or CSV file.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground w-full max-w-xs">
        {[
          { icon: "1", label: "Configure your good types" },
          { icon: "2", label: "Set up your units of measure" },
          { icon: "3", label: "Create inventory categories" },
          { icon: "4", label: "Add your inventory items" },
        ].map((item) => (
          <div key={item.icon} className="flex items-center gap-3 text-left">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--nav-bg)] border border-[var(--nav-border)] text-xs font-semibold text-[var(--nav-foreground)]">
              {item.icon}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <Button onClick={onNext} className="w-full">
          Set up manually
        </Button>
        <div className="flex items-center gap-3 w-full">
          <div className="h-px flex-1 bg-[var(--nav-border)]" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-[var(--nav-border)]" />
        </div>
        <CsvImportButton
          onImport={(parsed, review) => {
            onImport(parsed, review);
            onNext();
          }}
          label="Import from Excel / CSV"
          variant="outline"
          size="default"
          className="w-full justify-center"
        />
        <button
          type="button"
          onClick={async () => {
            const types = await window.electronAPI.ipcRenderer.invoke('setup:get-good-types') as string[];
            downloadTemplate(types);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <DownloadIcon className="size-3.5" />
          Download Excel template
        </button>
      </div>
    </div>
  );
}

// ─── Good Types step ──────────────────────────────────────────────────────────

function GoodTypesStep({
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
                    <button
                      type="button"
                      onClick={() => removeType(type)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label={`Remove ${type}`}
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
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
              onKeyDown={(e) => { if (e.key === "Enter") addType(); }}
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

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={goodTypes.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
}

// ─── Units of measure step ────────────────────────────────────────────────────

function UnitsStep({
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
                    <button
                      type="button"
                      onClick={() => removeUnit(unit.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label={`Remove ${unit.name}`}
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
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

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={units.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
}

// ─── Categories step ──────────────────────────────────────────────────────────

type PendingCategory = { id: string; name: string; type: string };

function createEmptyCategory(defaultType: string): PendingCategory {
  return { id: crypto.randomUUID(), name: "", type: defaultType };
}

function CategoriesStep({
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
                  <button
                    type="button"
                    onClick={() => removeRow(cat.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove row"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
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

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onNext}>
            Skip
          </Button>
          <Button onClick={onNext} disabled={!hasValid}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Items step ───────────────────────────────────────────────────────────────

type PendingItem = { id: string; name: string; categoryId: string; unitId: string };

function createEmptyItem(): PendingItem {
  return { id: crypto.randomUUID(), name: "", categoryId: "", unitId: "" };
}

function ItemsStep({
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

  // Only enable Next/Submit when all named rows also have a category
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
                    <button
                      type="button"
                      onClick={() => removeRow(item.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Remove row"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
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

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onNext} disabled={!canProceed && hasValid}>
            Skip
          </Button>
          <Button onClick={onNext} disabled={!hasValid || hasIncomplete}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Done step ────────────────────────────────────────────────────────────────

function DoneStep({
  goodTypes,
  units,
  categories,
  items,
  onFinish,
  saving,
}: {
  goodTypes: string[];
  units: IUnitOfMeasure[];
  categories: PendingCategory[];
  items: PendingItem[];
  onFinish: () => void;
  saving: boolean;
}) {
  const validCategories = categories.filter((c) => c.name.trim()).length;
  const validItems = items.filter((i) => i.name.trim() && i.categoryId).length;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--nav-bg)] border border-[var(--nav-border)]">
        <CheckIcon className="size-8 text-[var(--nav-active-border)]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">You're all set!</h2>
        <p className="text-muted-foreground max-w-sm">
          Your inventory system is ready to go. Here's a summary of what was configured.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-3 w-full">
        {[
          { count: goodTypes.length, label: "Types" },
          { count: units.length, label: "Units" },
          { count: validCategories, label: "Categories" },
          { count: validItems, label: "Items" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--nav-border)] bg-[var(--nav-bg)] px-4 py-3"
          >
            <div className="text-2xl font-bold text-[var(--nav-active-border)]">{s.count}</div>
            <div className="text-sm text-[var(--nav-foreground-muted)]">{s.label}</div>
          </div>
        ))}
      </div>
      <Button onClick={onFinish} disabled={saving} className="min-w-[10rem]">
        {saving ? "Saving…" : "Start using ReYoGo"}
      </Button>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [goodTypes, setGoodTypes] = useState<string[]>(DEFAULT_GOOD_TYPES);
  const [units, setUnits] = useState<IUnitOfMeasure[]>(DEFAULT_UNITS);
  const [categories, setCategories] = useState<PendingCategory[]>([createEmptyCategory(DEFAULT_GOOD_TYPES[0])]);
  const [items, setItems] = useState<PendingItem[]>([createEmptyItem()]);
  const [saving, setSaving] = useState(false);

  const { invoke } = window.electronAPI.ipcRenderer;

  const goTo = (s: Step) => setStep(s);

  const handleImport = useCallback((_parsed: unknown, review: ReviewResult) => {
    const selectedUnits = review.units.filter((u) => u.selected && u.status === 'new');
    const existingUnitNames = new Set(units.map((u) => u.name.toLowerCase()));
    const newUnitObjects = selectedUnits
      .filter((u) => !existingUnitNames.has(u.name.toLowerCase()))
      .map((u) => ({ id: crypto.randomUUID(), name: u.name }));

    const unitNameToId = new Map<string, string>([
      ...units.map((u) => [u.name.toLowerCase(), u.id] as [string, string]),
      ...newUnitObjects.map((u) => [u.name.toLowerCase(), u.id] as [string, string]),
    ]);

    if (newUnitObjects.length > 0) {
      setUnits((prev) => [...prev, ...newUnitObjects]);
    }

    const selectedCats = review.categories.filter((c) => c.selected && c.status !== 'exists');
    if (selectedCats.length > 0) {
      setCategories((prev) => {
        const existingNames = new Set(prev.map((c) => c.name.toLowerCase()).filter(Boolean));
        const newOnes = selectedCats
          .filter((c) => !existingNames.has(c.name.toLowerCase()))
          .map((c) => ({ id: crypto.randomUUID(), name: c.name, type: c.type }));
        const withContent = prev.filter((c) => c.name.trim());
        return [...withContent, ...newOnes, createEmptyCategory(goodTypes[0] ?? '')];
      });
    }

    const selectedItems = review.items.filter((i) => i.selected && i.status === 'new');
    if (selectedItems.length > 0) {
      setCategories((currentCats) => {
        const catMap = new Map(currentCats.map((c) => [c.name.toLowerCase(), c.id]));
        selectedCats.forEach((c) => {
          if (!catMap.has(c.name.toLowerCase())) catMap.set(c.name.toLowerCase(), c.id);
        });
        setItems((prev) => {
          const existingNames = new Set(prev.map((i) => i.name.toLowerCase()).filter(Boolean));
          const newOnes = selectedItems
            .filter((i) => !existingNames.has(i.name.toLowerCase()))
            .map((i) => ({
              id: crypto.randomUUID(),
              name: i.name,
              categoryId: catMap.get(i.categoryName.toLowerCase()) ?? "",
              unitId: i.unit ? (unitNameToId.get(i.unit.toLowerCase()) ?? "") : "",
            }));
          const withContent = prev.filter((i) => i.name.trim());
          return [...withContent, ...newOnes, createEmptyItem()];
        });
        return currentCats;
      });
    }
  }, [units, goodTypes]);

  const handleFinish = useCallback(async () => {
    setSaving(true);
    try {
      // Save good types
      await invoke("setup:set-good-types", goodTypes);

      // Save units
      for (const unit of units) {
        await invoke("setup:upsert-unit", unit);
      }

      // Save categories (valid only)
      const validCategories = categories.filter((c) => c.name.trim());
      const categoryMap = new Map<string, IInventoryCategory>();
      for (const cat of validCategories) {
        const category: IInventoryCategory = { id: cat.id, name: cat.name.trim(), type: cat.type };
        await invoke("inventory:upsert-category", category);
        categoryMap.set(cat.id, category);
      }

      // Save items (valid only)
      const validItems = items.filter((i) => i.name.trim() && i.categoryId);
      for (const item of validItems) {
        const cat = categoryMap.get(item.categoryId);
        if (!cat) continue;
        const unit = units.find((u) => u.id === item.unitId);
        const inventoryItem: IInventoryItem = {
          id: item.id,
          name: item.name.trim(),
          categoryId: item.categoryId,
          type: cat.type,
          unitOfMeasure: unit?.name,
        };
        await invoke("inventory:upsert-item", inventoryItem);
      }

      await invoke("setup:complete");
      onComplete();
    } catch (err) {
      console.error("Setup failed", err);
      setSaving(false);
    }
  }, [goodTypes, units, categories, items, invoke, onComplete]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--content-tint)] p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--nav-foreground)]">ReYoGo Setup</span>
          {step !== "welcome" && step !== "done" && <StepIndicator current={step} />}
        </div>

        <div className="rounded-2xl border border-[var(--nav-border)] bg-background shadow-sm p-8">
          {step === "welcome" && (
            <WelcomeStep
              onNext={() => goTo("good-types")}
              onImport={handleImport}
            />
          )}
          {step === "good-types" && (
            <GoodTypesStep
              goodTypes={goodTypes}
              setGoodTypes={setGoodTypes}
              onNext={() => goTo("units")}
              onBack={() => goTo("welcome")}
            />
          )}
          {step === "units" && (
            <UnitsStep
              units={units}
              setUnits={setUnits}
              onNext={() => goTo("categories")}
              onBack={() => goTo("good-types")}
            />
          )}
          {step === "categories" && (
            <CategoriesStep
              categories={categories}
              setCategories={setCategories}
              goodTypes={goodTypes}
              onNext={() => goTo("items")}
              onBack={() => goTo("units")}
            />
          )}
          {step === "items" && (
            <ItemsStep
              items={items}
              setItems={setItems}
              categories={categories}
              units={units}
              onNext={() => goTo("done")}
              onBack={() => goTo("categories")}
            />
          )}
          {step === "done" && (
            <DoneStep
              goodTypes={goodTypes}
              units={units}
              categories={categories}
              items={items}
              onFinish={handleFinish}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
