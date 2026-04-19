import { useState, useCallback } from "react";
import { XIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Context/InventoryContext";
import type { ICapturedInvoiceWithLines } from "@shared/types/contract";
import { ItemAutocomplete } from "../../ItemAutocomplete";
import type { ProcessReceiptLine } from "../../types";
import { getProcessLineComputed, DEFAULT_VAT_RATE } from "../../types";
import { inputClass } from "../../utils/inputClass";
import { formatMoney } from "../../utils/formatMoney";
import { createEmptyLine } from "../../utils/createEmptyLine";
import { lineToEditLine } from "../../utils/lineToEditLine";
import { cn } from "@/lib/utils";

type Props = {
  invoice: ICapturedInvoiceWithLines;
  onSave: (lines: ProcessReceiptLine[], note: string) => Promise<void>;
  onCancel: () => void;
};

export function EditPanel({ invoice, onSave, onCancel }: Props) {
  const { items, categories } = useInventory();
  const [lines, setLines] = useState<ProcessReceiptLine[]>(() =>
    invoice.lines.length > 0 ? invoice.lines.map(lineToEditLine) : [createEmptyLine()]
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsWithCategory = items.map((item) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    return { ...item, categoryName: cat?.name ?? "", typeLabel: cat?.type ?? "" };
  });

  const updateLine = useCallback((id: string, updates: Partial<ProcessReceiptLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.length > 0 ? next : [createEmptyLine()];
    });
  }, []);

  const validLines = lines.filter(
    (l) => l.itemId && Number(l.quantity) >= 0 && (l.totalVatExclude ?? 0) >= 0
  );

  const handleSave = async () => {
    if (validLines.length === 0) {
      setError("Add at least one line with an item.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(validLines, note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    }
  };

  const summary = lines.reduce(
    (acc, l) => {
      const c = getProcessLineComputed(l);
      return { excl: acc.excl + c.netTotal, vat: acc.vat + c.vatAmount, total: acc.total + c.grossTotal };
    },
    { excl: 0, vat: 0, total: 0 }
  );

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <label className="shrink-0 text-sm font-medium text-muted-foreground">Edit note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional reason for this edit (recorded in audit trail)"
          className={cn(inputClass, "max-w-md")}
        />
      </div>

      <div className="px-4 pb-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--nav-border)]">
              <th className="pb-2 pr-3 text-left font-medium">Item</th>
              <th className="pb-2 pr-3 text-right font-medium w-20">Qty</th>
              <th className="pb-2 pr-3 text-left font-medium w-36">VAT</th>
              <th className="pb-2 pr-3 text-right font-medium w-24">VAT %</th>
              <th className="pb-2 pr-3 text-right font-medium w-28">Total (excl.)</th>
              <th className="pb-2 w-16" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-[var(--nav-border)]/40">
                <td className="py-1.5 pr-3">
                  <ItemAutocomplete
                    items={[...itemsWithCategory].sort((a, b) => a.name.localeCompare(b.name))}
                    value={line.itemId}
                    onChange={(itemId) => updateLine(line.id, { itemId })}
                    placeholder="Select item…"
                  />
                </td>
                <td className="py-1.5 pr-3">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={line.quantity || ""}
                    onChange={(e) =>
                      updateLine(line.id, { quantity: e.target.value === "" ? 0 : Number(e.target.value) })
                    }
                    className={cn(inputClass, "w-20")}
                    placeholder="0"
                  />
                </td>
                <td className="py-1.5 pr-3">
                  <select
                    value={line.vatMode}
                    onChange={(e) =>
                      updateLine(line.id, { vatMode: e.target.value as ProcessReceiptLine["vatMode"] })
                    }
                    className={cn(inputClass, "min-w-[8rem] cursor-pointer")}
                  >
                    <option value="exclusive">No (add VAT)</option>
                    <option value="inclusive">Yes (incl.)</option>
                    <option value="non-taxable">Non-taxable</option>
                  </select>
                </td>
                <td className="py-1.5 pr-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={line.vatMode !== "non-taxable" ? line.vatRate : ""}
                    onChange={(e) =>
                      updateLine(line.id, { vatRate: e.target.value === "" ? 0 : Number(e.target.value) })
                    }
                    disabled={line.vatMode === "non-taxable"}
                    className={cn(inputClass, "w-20", line.vatMode === "non-taxable" && "opacity-40")}
                    placeholder="15"
                  />
                </td>
                <td className="py-1.5 pr-3">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={line.totalVatExclude || ""}
                    onChange={(e) =>
                      updateLine(line.id, {
                        totalVatExclude: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    className={cn(inputClass, "w-28")}
                    placeholder="0.00"
                  />
                </td>
                <td className="py-1.5">
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    className="text-xs text-muted-foreground hover:text-destructive px-1"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, { id: crypto.randomUUID(), itemId: "", quantity: 0, vatMode: "exclusive", vatRate: DEFAULT_VAT_RATE, totalVatExclude: 0 }])}
          className="mt-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          + Add row
        </button>
      </div>

      {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--nav-border)] bg-muted/10 px-4 py-2">
        <div className="flex gap-5 text-sm text-muted-foreground">
          <span>Excl. <span className="font-mono font-medium text-foreground">{formatMoney(summary.excl)}</span></span>
          <span>VAT <span className="font-mono font-medium text-foreground">{formatMoney(summary.vat)}</span></span>
          <span>Total <span className="font-mono font-semibold text-foreground">{formatMoney(summary.total)}</span></span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            <XIcon className="size-3.5 mr-1" />
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={saving || validLines.length === 0}>
            <CheckIcon className="size-3.5 mr-1" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
