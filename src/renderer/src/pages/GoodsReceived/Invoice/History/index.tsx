import { Fragment, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InvoicesIPC } from "@shared/types/ipc";
import type {
  ICapturedInvoice,
  ICapturedInvoiceAuditEntry,
  ICapturedInvoiceWithLines,
} from "@shared/types/contract";
import { Button } from "@/components/ui/button";
import { InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import { ReceiptIcon, ChevronDownIcon, ChevronRightIcon, PencilIcon, ClockIcon, XIcon, CheckIcon, CopyIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ItemAutocomplete } from "../ItemAutocomplete";
import { useInventory } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Context/InventoryContext";
import type { ProcessReceiptLine } from "../types";
import { DEFAULT_VAT_RATE, getProcessLineComputed } from "../types";
import { cn } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(n: number): string {
  return n.toFixed(2);
}

function invoiceTotals(lines: ICapturedInvoiceWithLines["lines"]) {
  let excl = 0;
  let vat = 0;
  for (const l of lines) {
    excl += l.totalVatExclude;
    vat +=
      l.vatMode !== "non-taxable" ? l.totalVatExclude * (l.vatRate / 100) : 0;
  }
  return { excl, vat, total: excl + vat };
}

function lineToEditLine(l: ICapturedInvoiceWithLines["lines"][number]): ProcessReceiptLine {
  // DB always stores net in totalVatExclude. For inclusive mode the edit input
  // expects gross (VAT-included), so convert net back to gross here.
  const totalVatExclude =
    l.vatMode === "inclusive" && l.vatRate > 0
      ? l.totalVatExclude * (1 + l.vatRate / 100)
      : l.totalVatExclude;
  return {
    id: l.id,
    itemId: l.itemId,
    quantity: l.quantity,
    vatMode: l.vatMode,
    vatRate: l.vatRate,
    totalVatExclude,
  };
}

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

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

// ─── Edit panel ──────────────────────────────────────────────────────────────

type EditPanelProps = {
  invoice: ICapturedInvoiceWithLines;
  onSave: (lines: ProcessReceiptLine[], note: string) => Promise<void>;
  onCancel: () => void;
};

function EditPanel({ invoice, onSave, onCancel }: EditPanelProps) {
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
      return {
        excl: acc.excl + c.netTotal,
        vat: acc.vat + c.vatAmount,
        total: acc.total + c.grossTotal,
      };
    },
    { excl: 0, vat: 0, total: 0 }
  );

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      {/* Note */}
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

      {/* Lines table */}
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
          onClick={() => setLines((prev) => [...prev, createEmptyLine()])}
          className="mt-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          + Add row
        </button>
      </div>

      {error && (
        <p className="px-4 pb-2 text-sm text-destructive">{error}</p>
      )}

      {/* Footer */}
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

// ─── Audit panel ─────────────────────────────────────────────────────────────

type AuditPanelProps = {
  invoiceId: string;
  onClose: () => void;
};

function AuditPanel({ invoiceId, onClose }: AuditPanelProps) {
  const [entries, setEntries] = useState<ICapturedInvoiceAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.electronAPI.ipcRenderer.invoke(
          InvoicesIPC.GET_INVOICE_AUDIT,
          invoiceId
        );
        if (!cancelled) setEntries(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceId]);

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--nav-border)]/60">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <ClockIcon className="size-3.5 text-muted-foreground" />
          Edit history
        </span>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No edits recorded for this invoice.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const snap = entry.snapshot;
              const totals = invoiceTotals(snap.lines);
              const isOpen = expanded === entry.id;
              return (
                <div key={entry.id} className="rounded-md border border-[var(--nav-border)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
                  >
                    {isOpen ? (
                      <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium">{formatDate(entry.editedAt)}</span>
                    {entry.note && (
                      <span className="text-muted-foreground truncate">— {entry.note}</span>
                    )}
                    <span className="ml-auto shrink-0 font-mono text-muted-foreground">
                      {snap.lines.length} line{snap.lines.length !== 1 ? "s" : ""} · {formatMoney(totals.total)}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-[var(--nav-border)]/60 bg-muted/10 px-3 py-2">
                      <p className="mb-1.5 text-xs text-muted-foreground">Snapshot before this edit:</p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[var(--nav-border)]/50">
                            <th className="pb-1 pr-3 text-left font-medium">Item</th>
                            <th className="pb-1 pr-3 text-right font-medium">Qty</th>
                            <th className="pb-1 pr-3 text-right font-medium">Total excl.</th>
                            <th className="pb-1 text-right font-medium">VAT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {snap.lines.map((l) => (
                            <tr key={l.id} className="border-b border-[var(--nav-border)]/30">
                              <td className="py-1 pr-3">{l.itemNameSnapshot}</td>
                              <td className="py-1 pr-3 text-right">{l.quantity}</td>
                              <td className="py-1 pr-3 text-right font-mono">{formatMoney(l.totalVatExclude)}</td>
                              <td className="py-1 text-right">
                                {l.vatMode === "non-taxable" ? "—" : `${l.vatRate}%`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>Excl. <span className="font-mono text-foreground">{formatMoney(totals.excl)}</span></span>
                        <span>VAT <span className="font-mono text-foreground">{formatMoney(totals.vat)}</span></span>
                        <span>Total <span className="font-mono font-semibold text-foreground">{formatMoney(totals.total)}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type RowMode = { kind: "view" } | { kind: "detail" } | { kind: "edit" } | { kind: "audit" };

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<ICapturedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCache, setDetailCache] = useState<Record<string, ICapturedInvoiceWithLines>>({});
  const [rowMode, setRowMode] = useState<Record<string, RowMode>>({});

  const { items } = useInventory();
  const navigate = useNavigate();

  const handleReuse = useCallback(
    async (id: string) => {
      let detail = detailCache[id];
      if (!detail) {
        const inv = await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.GET_INVOICE, id);
        if (inv) {
          setDetailCache((prev) => ({ ...prev, [id]: inv }));
          detail = inv;
        }
      }
      if (!detail) return;
      const templateLines = detail.lines.map((l) => ({
        id: crypto.randomUUID(),
        itemId: l.itemId,
        quantity: 0,
        vatMode: l.vatMode,
        vatRate: l.vatRate,
        totalVatExclude: 0,
      }));
      navigate(InvoiceRoutes.Base, { state: { templateLines } });
    },
    [detailCache, navigate]
  );

  const loadInvoices = useCallback(async () => {
    const list: ICapturedInvoiceWithLines[] = await window.electronAPI.ipcRenderer.invoke(
      InvoicesIPC.GET_INVOICES_WITH_LINES
    );
    setInvoices(list);
    // Pre-populate detail cache so totals show immediately
    setDetailCache((prev) => {
      const next = { ...prev };
      for (const inv of list) next[inv.id] = inv;
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadInvoices();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadInvoices]);

  const getDetail = useCallback(
    async (id: string): Promise<ICapturedInvoiceWithLines | null> => {
      if (detailCache[id]) return detailCache[id];
      const inv = await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.GET_INVOICE, id);
      if (inv) setDetailCache((prev) => ({ ...prev, [id]: inv }));
      return inv ?? null;
    },
    [detailCache]
  );

  const setMode = useCallback((id: string, mode: RowMode) => {
    setRowMode((prev) => ({ ...prev, [id]: mode }));
  }, []);

  const handleExpandDetail = useCallback(
    async (id: string) => {
      const current = rowMode[id];
      if (current?.kind === "detail") {
        setMode(id, { kind: "view" });
        return;
      }
      await getDetail(id);
      setMode(id, { kind: "detail" });
    },
    [rowMode, getDetail, setMode]
  );

  const handleEditClick = useCallback(
    async (id: string) => {
      await getDetail(id);
      setMode(id, { kind: "edit" });
    },
    [getDetail, setMode]
  );

  const handleAuditClick = useCallback((id: string) => {
    setMode(id, { kind: "audit" });
  }, [setMode]);

  const handleSaveEdit = useCallback(
    async (invoice: ICapturedInvoice, editLines: ProcessReceiptLine[], note: string) => {
      const payload = {
        id: invoice.id,
        note: note || undefined,
        lines: editLines.map((line) => {
          const item = items.find((i) => i.id === line.itemId);
          const computed = getProcessLineComputed(line);
          return {
            id: line.id,
            itemId: line.itemId,
            itemNameSnapshot: item?.name ?? detailCache[invoice.id]?.lines.find((l) => l.itemId === line.itemId)?.itemNameSnapshot ?? "Unknown",
            unitOfMeasure: item?.unitOfMeasure ?? null,
            quantity: Number(line.quantity) || 0,
            vatMode: line.vatMode,
            vatRate: line.vatRate,
            totalVatExclude: computed.netTotal,
          };
        }),
      };
      await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.UPDATE_INVOICE, payload);
      // Invalidate cache and reload
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[invoice.id];
        return next;
      });
      await loadInvoices();
      setMode(invoice.id, { kind: "view" });
    },
    [items, detailCache, loadInvoices, setMode]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Invoice history</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Past captured invoices (goods received). Click a row to expand details, or edit with full audit trail.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to={InvoiceRoutes.Base} className="inline-flex items-center gap-2">
              <ReceiptIcon className="size-4" aria-hidden />
              Capture new invoice
            </Link>
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : invoices.length === 0 ? (
          <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-8 text-center text-muted-foreground">
            <p>No captured invoices yet.</p>
            <Button asChild variant="link" className="mt-2">
              <Link to={InvoiceRoutes.Base}>Capture your first invoice</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                  <TableHead className="w-8 p-2" />
                  <TableHead className="font-medium text-foreground">Date captured</TableHead>
                  <TableHead className="font-medium text-foreground w-16 text-right">Lines</TableHead>
                  <TableHead className="font-medium text-foreground w-28 text-right">Excl.</TableHead>
                  <TableHead className="font-medium text-foreground w-24 text-right">VAT</TableHead>
                  <TableHead className="font-medium text-foreground w-28 text-right">Total</TableHead>
                  <TableHead className="font-medium text-foreground w-36">Last edited</TableHead>
                  <TableHead className="w-36" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const mode = rowMode[inv.id]?.kind ?? "view";
                  const detail = detailCache[inv.id];
                  const totals = detail ? invoiceTotals(detail.lines) : null;

                  return (
                    <Fragment key={inv.id}>
                      <TableRow
                        className={cn(
                          "border-[var(--nav-border)] hover:bg-muted/30 cursor-pointer",
                          (mode === "detail" || mode === "edit" || mode === "audit") && "bg-muted/20"
                        )}
                        onClick={() => handleExpandDetail(inv.id)}
                      >
                        {/* Expand chevron */}
                        <TableCell className="w-8 p-2 align-middle">
                          {mode === "detail" || mode === "edit" || mode === "audit" ? (
                            <ChevronDownIcon className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="size-4 text-muted-foreground" />
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="font-medium">
                          {formatDate(inv.createdAt)}
                        </TableCell>

                        {/* Line count */}
                        <TableCell className="text-right text-muted-foreground">
                          {detail ? detail.lines.length : "—"}
                        </TableCell>

                        {/* Excl */}
                        <TableCell className="text-right font-mono text-sm">
                          {totals ? formatMoney(totals.excl) : "—"}
                        </TableCell>

                        {/* VAT */}
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">
                          {totals ? formatMoney(totals.vat) : "—"}
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right font-mono font-semibold">
                          {totals ? formatMoney(totals.total) : "—"}
                        </TableCell>

                        {/* Last edited */}
                        <TableCell className="text-sm text-muted-foreground">
                          {inv.updatedAt ? formatDate(inv.updatedAt) : <span className="italic opacity-50">Never</span>}
                        </TableCell>

                        {/* Actions */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                              title="Pre-fill capture form with these items (no qty or price)"
                              onClick={() => handleReuse(inv.id)}
                            >
                              <CopyIcon className="size-3" />
                              Reuse
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => handleEditClick(inv.id)}
                            >
                              <PencilIcon className="size-3" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                              onClick={() => handleAuditClick(inv.id)}
                            >
                              <ClockIcon className="size-3" />
                              Audit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Detail expand row */}
                      {mode === "detail" && detail && (
                        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <div className="border-t border-[var(--nav-border)] bg-muted/10 px-4 py-3">
                              {detail.lines.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No line items.</p>
                              ) : (
                                <>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-[var(--nav-border)]">
                                        <th className="pb-2 pr-4 text-left font-medium">Item</th>
                                        <th className="pb-2 pr-4 text-right font-medium">Qty</th>
                                        <th className="pb-2 pr-4 text-right font-medium">UoM</th>
                                        <th className="pb-2 pr-4 text-right font-medium">Unit price</th>
                                        <th className="pb-2 pr-4 text-right font-medium">VAT</th>
                                        <th className="pb-2 text-right font-medium">Line total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.lines.map((line) => {
                                        const qty = line.quantity || 0;
                                        const unitPrice = qty > 0 ? line.totalVatExclude / qty : 0;
                                        return (
                                          <tr key={line.id} className="border-b border-[var(--nav-border)]/50">
                                            <td className="py-1.5 pr-4">{line.itemNameSnapshot}</td>
                                            <td className="py-1.5 pr-4 text-right">{line.quantity}</td>
                                            <td className="py-1.5 pr-4 text-right text-muted-foreground">
                                              {line.unitOfMeasure ?? "—"}
                                            </td>
                                            <td className="py-1.5 pr-4 text-right font-mono">
                                              {formatMoney(unitPrice)}
                                            </td>
                                            <td className="py-1.5 pr-4 text-right">
                                              {line.vatMode === "non-taxable" ? "—" : `${line.vatRate}%`}
                                            </td>
                                            <td className="py-1.5 text-right font-mono">
                                              {formatMoney(line.totalVatExclude)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  {(() => {
                                    const t = invoiceTotals(detail.lines);
                                    return (
                                      <div className="mt-3 flex gap-6 text-sm border-t border-[var(--nav-border)] pt-3">
                                        <span className="text-muted-foreground">Exclusive <span className="font-mono font-medium text-foreground">{formatMoney(t.excl)}</span></span>
                                        <span className="text-muted-foreground">VAT <span className="font-mono font-medium text-foreground">{formatMoney(t.vat)}</span></span>
                                        <span className="text-muted-foreground">Total <span className="font-mono font-semibold text-foreground">{formatMoney(t.total)}</span></span>
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Edit row */}
                      {mode === "edit" && detail && (
                        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <EditPanel
                              invoice={detail}
                              onSave={(lines, note) => handleSaveEdit(inv, lines, note)}
                              onCancel={() => setMode(inv.id, { kind: "view" })}
                            />
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Audit row */}
                      {mode === "audit" && (
                        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <AuditPanel
                              invoiceId={inv.id}
                              onClose={() => setMode(inv.id, { kind: "view" })}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
