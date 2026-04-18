import { Fragment, useState, useCallback, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, CopyIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { InvoicesIPC } from "@shared/types/ipc";
import { InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Context/InventoryContext";
import { AddCategoryModal } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/components/AddCategoryModal";
import { AddItemModal } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/components/AddItemModal";
import { ItemAutocomplete } from "./ItemAutocomplete";
import type { ProcessReceiptLine } from "./types";
import { getProcessLineComputed, DEFAULT_VAT_RATE } from "./types";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

function createEmptyLine(): ProcessReceiptLine {
  return {
    id: crypto.randomUUID(),
    itemId: "",
    quantity: 0,
    vatMode: "exclusive",
    vatRate: DEFAULT_VAT_RATE,
    totalVatExclude: 0,
  };
}

function formatMoney(n: number): string {
  return n.toFixed(2);
}

export default function InvoicePage() {
  const { items, categories, units, addCategory, addItem } = useInventory();
  const location = useLocation();
  const [lines, setLines] = useState<ProcessReceiptLine[]>(() => {
    const template = (location.state as { templateLines?: ProcessReceiptLine[] } | null)?.templateLines;
    return template && template.length > 0 ? template : [createEmptyLine()];
  });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [expandedResultLineIds, setExpandedResultLineIds] = useState<Set<string>>(new Set());
  const isReused = !!(location.state as { templateLines?: ProcessReceiptLine[] } | null)?.templateLines;
  const [reuseNoticeDismissed, setReuseNoticeDismissed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastAddedLineId, setLastAddedLineId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAddedLineId) return;
    const id = `invoice-item-${lastAddedLineId}`;
    const focus = () => {
      document.getElementById(id)?.focus();
      setLastAddedLineId(null);
    };
    const t = setTimeout(focus, 50);
    return () => clearTimeout(t);
  }, [lastAddedLineId]);

  const toggleResultRow = useCallback((lineId: string) => {
    setExpandedResultLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }, []);

  const addLine = useCallback(() => {
    const newLine = createEmptyLine();
    setLines((prev) => [...prev, newLine]);
    setLastAddedLineId(newLine.id);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.length > 0 ? next : [createEmptyLine()];
    });
  }, []);

  const updateLine = useCallback((id: string, updates: Partial<ProcessReceiptLine>) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, []);

  const itemsWithCategory = items.map((item) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    return {
      ...item,
      categoryName: cat?.name ?? "",
      typeLabel: cat?.type ?? "",
    };
  });

  const invoiceSummary = lines.reduce(
    (acc, line) => {
      const c = getProcessLineComputed(line);
      return {
        lineCount: acc.lineCount + (line.itemId ? 1 : 0),
        subtotal: acc.subtotal + c.netTotal,
        totalVat: acc.totalVat + c.vatAmount,
        grandTotal: acc.grandTotal + c.grossTotal,
      };
    },
    { lineCount: 0, subtotal: 0, totalVat: 0, grandTotal: 0 }
  );

  const validLines = lines.filter(
    (l) =>
      l.itemId &&
      Number(l.quantity) > 0 &&
      (l.totalVatExclude ?? 0) >= 0
  );

  const handleSave = useCallback(async () => {
    if (validLines.length === 0) {
      setSaveError("Add at least one line with an item, quantity, and total.");
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      const payload = {
        id: crypto.randomUUID(),
        lines: validLines.map((line) => {
          const item = items.find((i) => i.id === line.itemId);
          const computed = getProcessLineComputed(line);
          return {
            id: line.id,
            itemId: line.itemId,
            itemNameSnapshot: item?.name ?? "Unknown",
            unitOfMeasure: item?.unitOfMeasure ?? null,
            quantity: Number(line.quantity) || 0,
            vatMode: line.vatMode,
            vatRate: line.vatRate,
            totalVatExclude: computed.netTotal,
          };
        }),
      };
      await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.SAVE_INVOICE, payload);
      setLines([createEmptyLine()]);
      setExpandedResultLineIds(new Set());
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  }, [validLines, items]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Capture Invoice</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Select items, quantity, and total (VAT excl.). Results show net and gross per line.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={InvoiceRoutes.History}>View history</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setCategoryModalOpen(true)}>
              Add category
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setItemModalOpen(true)}>
              Add item
            </Button>
          </div>
        </div>
      </header>

      {isReused && !reuseNoticeDismissed && (
        <div className="shrink-0 flex items-center gap-2 border-b border-[var(--nav-border)] bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          <CopyIcon className="size-3.5 shrink-0" />
          <span>Items pre-filled from a previous invoice — add quantity and price to continue.</span>
          <button
            type="button"
            onClick={() => setReuseNoticeDismissed(true)}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-4 my-4">
          <div className="rounded-lg border border-[var(--nav-border)] bg-background">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                  <TableHead className="w-8 p-2" />
                  <TableHead className="font-medium text-foreground">Item</TableHead>
                  <TableHead className="font-medium text-foreground w-24">Quantity</TableHead>
                  <TableHead className="font-medium text-foreground w-28">VAT</TableHead>
                  <TableHead className="font-medium text-foreground w-24">VAT Rate %</TableHead>
                  <TableHead className="font-medium text-foreground w-32">Total</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => {
                  const computed = getProcessLineComputed(line);
                  const isResultExpanded = expandedResultLineIds.has(line.id);
                  return (
                    <Fragment key={line.id}>
                      <TableRow className="border-[var(--nav-border)] hover:bg-muted/30">
                        <TableCell className="w-8 p-2 align-middle">
                          <button
                            type="button"
                            onClick={() => toggleResultRow(line.id)}
                            className="text-muted-foreground hover:text-foreground p-0.5 -m-0.5 rounded"
                            aria-expanded={isResultExpanded}
                            aria-label={isResultExpanded ? "Collapse results" : "Expand results"}
                          >
                            {isResultExpanded ? (
                              <ChevronDownIcon className="size-4" aria-hidden />
                            ) : (
                              <ChevronRightIcon className="size-4" aria-hidden />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <ItemAutocomplete
                            inputId={`invoice-item-${line.id}`}
                            items={[...itemsWithCategory].sort((a, b) => a.name.localeCompare(b.name))}
                            value={line.itemId}
                            onChange={(itemId) => updateLine(line.id, { itemId })}
                            placeholder="Search or select item…"
                            onSelectComplete={() => document.getElementById(`invoice-qty-${line.id}`)?.focus()}
                          />
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <input
                            id={`invoice-qty-${line.id}`}
                            type="number"
                            min={0}
                            step={1}
                            value={line.quantity || ""}
                            onChange={(e) =>
                              updateLine(line.id, {
                                quantity: e.target.value === "" ? 0 : Number(e.target.value),
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Tab") {
                                e.preventDefault();
                                document.getElementById(`invoice-vat-${line.id}`)?.focus();
                              }
                            }}
                            className={cn(inputClass, "w-20")}
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <select
                            id={`invoice-vat-${line.id}`}
                            value={line.vatMode}
                            onChange={(e) =>
                              updateLine(line.id, {
                                vatMode: e.target.value as ProcessReceiptLine["vatMode"],
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.currentTarget.click();
                              } else if (e.key === "Tab") {
                                e.preventDefault();
                                document.getElementById(`invoice-vatrate-${line.id}`)?.focus();
                              }
                            }}
                            className={cn(inputClass, "min-w-[6rem] cursor-pointer")}
                          >
                            <option value="exclusive">No (add VAT)</option>
                            <option value="inclusive">Yes (VAT included)</option>
                            <option value="non-taxable">Non-taxable</option>
                          </select>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <input
                            id={`invoice-vatrate-${line.id}`}
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={line.vatMode !== "non-taxable" ? line.vatRate : ""}
                            onChange={(e) =>
                              updateLine(line.id, {
                                vatRate: e.target.value === "" ? 0 : Number(e.target.value),
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Tab") {
                                e.preventDefault();
                                document.getElementById(`invoice-total-${line.id}`)?.focus();
                              }
                            }}
                            disabled={line.vatMode === "non-taxable"}
                            className={cn(inputClass, "w-20", line.vatMode === "non-taxable" && "opacity-50")}
                            placeholder="15"
                          />
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <input
                            id={`invoice-total-${line.id}`}
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.totalVatExclude || ""}
                            onChange={(e) =>
                              updateLine(line.id, {
                                totalVatExclude: e.target.value === "" ? 0 : Number(e.target.value),
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Tab") {
                                e.preventDefault();
                                addLine();
                              }
                            }}
                            className={cn(inputClass, "w-28")}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeLine(line.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isResultExpanded && (
                        <TableRow className="border-[var(--nav-border)] bg-muted/20">
                          <TableCell colSpan={7} className="py-2 pl-10 pr-4 align-top">
                            <div className="flex flex-wrap gap-6 text-sm">
                              <span className="text-muted-foreground">
                                Net unit price <span className="font-mono text-foreground">{formatMoney(computed.netUnitPrice)}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Gross unit price <span className="font-mono text-foreground">{formatMoney(computed.grossUnitPrice)}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Net total <span className="font-mono text-foreground">{formatMoney(computed.netTotal)}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Gross total <span className="font-mono text-foreground">{formatMoney(computed.grossTotal)}</span>
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex justify-end border-t border-[var(--nav-border)] bg-muted/10 px-3 py-2">
              <Button type="button" variant="ghost" size="sm" onClick={addLine} className="gap-1.5">
                <PlusIcon className="size-4" aria-hidden />
                Add row
              </Button>
            </div>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="shrink-0 border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {saveError}
        </div>
      )}
      <footer
        className="shrink-0 sticky bottom-0 left-0 right-0 z-10 border-t border-[var(--nav-border)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]"
        aria-label="Invoice summary"
      >
        <div className="flex min-w-0 items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-4 text-sm overflow-hidden">
            <span className="shrink-0 text-muted-foreground">
              <span className="font-medium text-foreground">{invoiceSummary.lineCount}</span> line item{invoiceSummary.lineCount !== 1 ? "s" : ""} added
            </span>
            <span className="shrink-0 text-muted-foreground">
              Excl. <span className="font-mono font-medium text-foreground">{formatMoney(invoiceSummary.subtotal)}</span>
            </span>
            <span className="shrink-0 text-muted-foreground">
              VAT <span className="font-mono font-medium text-foreground">{formatMoney(invoiceSummary.totalVat)}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || validLines.length === 0}
            >
              {isSaving ? "Saving…" : "Save invoice"}
            </Button>
            <span className="text-muted-foreground">Total:</span>
            <span className="text-xl font-semibold font-mono text-foreground">{formatMoney(invoiceSummary.grandTotal)}</span>
          </div>
        </div>
      </footer>

      <AddCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={(category) => addCategory(category)}
      />
      <AddItemModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        categories={categories}
        units={units}
        onSave={(item) => addItem(item)}
      />
    </div>
  );
}
