import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useInventory } from "../../Context/InventoryContext";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

type Tab = "item" | "category" | "goodType";

type Props = {
  open: boolean;
  onClose: () => void;
};

function GoodTypeForm({ onDone }: { onDone: () => void }) {
  const { addGoodType } = useInventory();
  const [name, setName] = useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addGoodType(trimmed);
    setName("");
    onDone();
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className={inputClass}
          placeholder="e.g. dairy, bakery"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={handleSave} disabled={!name.trim()}>
          Add good type
        </Button>
      </div>
    </div>
  );
}

function CategoryForm({ onDone }: { onDone: () => void }) {
  const { goodTypes, addCategory } = useInventory();
  const [name, setName] = useState("");
  const [type, setType] = useState(goodTypes[0] ?? "");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || !type) return;
    addCategory({ name: trimmed, type });
    setName("");
    onDone();
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className={inputClass}
          placeholder="Category name"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Good type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={cn(inputClass, "cursor-pointer")}
        >
          {!type && <option value="">Select type</option>}
          {goodTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={handleSave} disabled={!name.trim() || !type}>
          Add category
        </Button>
      </div>
    </div>
  );
}

function ItemForm({ onDone }: { onDone: () => void }) {
  const { categories, units, addItem } = useInventory();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");

  const category = categories.find((c) => c.id === categoryId);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || !categoryId || !category) return;
    addItem({ name: trimmed, categoryId, type: category.type, unitOfMeasure: unitOfMeasure || undefined });
    setName("");
    setCategoryId("");
    setUnitOfMeasure("");
    onDone();
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className={inputClass}
          placeholder="Item name"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={cn(inputClass, "cursor-pointer")}
        >
          <option value="">Select category</option>
          {categories
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.type} → {c.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Unit of measure</label>
        <select
          value={unitOfMeasure}
          onChange={(e) => setUnitOfMeasure(e.target.value)}
          className={cn(inputClass, "cursor-pointer")}
        >
          <option value="">— none —</option>
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={handleSave} disabled={!name.trim() || !categoryId}>
          Add item
        </Button>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "item", label: "Item" },
  { id: "category", label: "Category" },
  { id: "goodType", label: "Good Type" },
];

export function AddInventoryModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("item");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDone = useCallback((label: string) => {
    setSuccessMsg(`${label} added`);
    setTimeout(() => setSuccessMsg(null), 2000);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--nav-border)] bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 pt-5 pb-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add to inventory</h2>
          </div>
          <div className="flex gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-t-md px-3.5 py-2 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {successMsg && (
            <div className="mb-4 rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              {successMsg}
            </div>
          )}

          {activeTab === "item" && <ItemForm onDone={() => handleDone("Item")} />}
          {activeTab === "category" && <CategoryForm onDone={() => handleDone("Category")} />}
          {activeTab === "goodType" && <GoodTypeForm onDone={() => handleDone("Good type")} />}
        </div>

        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
