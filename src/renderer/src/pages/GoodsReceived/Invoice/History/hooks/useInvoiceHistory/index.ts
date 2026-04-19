import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { InvoicesIPC } from "@shared/types/ipc";
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from "@shared/types/contract";
import { InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import { useInventory } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Context/InventoryContext";
import type { ProcessReceiptLine } from "../../../types";
import { getProcessLineComputed } from "../../../types";

export type RowMode = { kind: "view" } | { kind: "detail" } | { kind: "edit" } | { kind: "audit" };

export function useInvoiceHistory() {
  const [invoices, setInvoices] = useState<ICapturedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCache, setDetailCache] = useState<Record<string, ICapturedInvoiceWithLines>>({});
  const [rowMode, setRowModeState] = useState<Record<string, RowMode>>({});
  const [search, setSearch] = useState("");

  const { items } = useInventory();
  const navigate = useNavigate();

  const loadInvoices = useCallback(async () => {
    const list: ICapturedInvoiceWithLines[] = await window.electronAPI.ipcRenderer.invoke(
      InvoicesIPC.GET_INVOICES_WITH_LINES
    );
    setInvoices(list);
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
    setRowModeState((prev) => ({ ...prev, [id]: mode }));
  }, []);

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
            itemNameSnapshot:
              item?.name ??
              detailCache[invoice.id]?.lines.find((l) => l.itemId === line.itemId)?.itemNameSnapshot ??
              "Unknown",
            unitOfMeasure: item?.unitOfMeasure ?? null,
            quantity: Number(line.quantity) || 0,
            vatMode: line.vatMode,
            vatRate: line.vatRate,
            totalVatExclude: computed.netTotal,
          };
        }),
      };
      await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.UPDATE_INVOICE, payload);
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

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const detail = detailCache[inv.id];
      return detail?.lines.some((l) => l.itemNameSnapshot.toLowerCase().includes(q));
    });
  }, [invoices, detailCache, search]);

  return {
    invoices: filteredInvoices,
    loading,
    detailCache,
    rowMode,
    setMode,
    search,
    setSearch,
    handleReuse,
    handleExpandDetail,
    handleEditClick,
    handleAuditClick,
    handleSaveEdit,
  };
}
