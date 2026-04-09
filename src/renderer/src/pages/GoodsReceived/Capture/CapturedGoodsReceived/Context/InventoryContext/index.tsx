import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { IPCChannel } from "@shared/types/ipc";
import { InventoryIPC } from "@shared/types/ipc";
import type { InventoryCategory, InventoryItem } from "../../types";

function invokeInventory(channel: IPCChannel, ...args: unknown[]): Promise<unknown> {
  if (typeof window === "undefined" || !window.electronAPI?.ipcRenderer?.invoke) {
    return Promise.resolve();
  }
  const invoke = window.electronAPI.ipcRenderer.invoke as (ch: string, ...a: unknown[]) => Promise<unknown>;
  return invoke(channel, ...args);
}

type InventoryContextValue = {
  categories: InventoryCategory[];
  items: InventoryItem[];
  addCategory: (category: Omit<InventoryCategory, "id">) => string;
  updateCategory: (id: string, updates: Partial<InventoryCategory>) => void;
  removeCategory: (id: string) => void;
  addItem: (item: Omit<InventoryItem, "id">) => string;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  deleteCategoryFromBackend: (id: string) => Promise<void>;
  deleteItemFromBackend: (id: string) => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    invokeInventory(InventoryIPC.GET_CATEGORIES)
      .then((data) => {
        const list = Array.isArray(data) ? (data as InventoryCategory[]) : [];
        setCategories(list.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(console.error);
    invokeInventory(InventoryIPC.GET_ITEMS)
      .then((data) => {
        setItems(Array.isArray(data) ? (data as InventoryItem[]) : []);
      })
      .catch(console.error);
  }, []);

  const addCategory = useCallback((category: Omit<InventoryCategory, "id">): string => {
    const id = crypto.randomUUID();
    const newCategory = { ...category, id };
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    if (category.name.trim()) {
      invokeInventory(InventoryIPC.UPSERT_CATEGORY, newCategory).catch(console.error);
    }
    return id;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<InventoryCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)).sort((a, b) => a.name.localeCompare(b.name))
    );
    setCategories((prev) => {
      const toSave = prev.find((c) => c.id === id);
      if (toSave) {
        invokeInventory(InventoryIPC.UPSERT_CATEGORY, toSave).catch(console.error);
      }
      return prev;
    });
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setItems((prev) => prev.filter((i) => i.categoryId !== id));
  }, []);

  const addItem = useCallback((item: Omit<InventoryItem, "id">): string => {
    const id = crypto.randomUUID();
    const newItem = { ...item, id };
    setItems((prev) => [...prev, newItem]);
    if (item.name.trim()) {
      invokeInventory(InventoryIPC.UPSERT_ITEM, newItem).catch(console.error);
    }
    return id;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    setItems((prev) => {
      const toSave = prev.find((i) => i.id === id);
      if (toSave) {
        invokeInventory(InventoryIPC.UPSERT_ITEM, toSave).catch(console.error);
      }
      return prev;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const deleteCategoryFromBackend = useCallback((id: string): Promise<void> => {
    return invokeInventory(InventoryIPC.DELETE_CATEGORY, id)
      .then(() => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setItems((prev) => prev.filter((i) => i.categoryId !== id));
      })
      .catch(console.error);
  }, []);

  const deleteItemFromBackend = useCallback((id: string): Promise<void> => {
    return invokeInventory(InventoryIPC.DELETE_ITEM, id)
      .then(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      })
      .catch(console.error);
  }, []);

  const value: InventoryContextValue = {
    categories,
    items,
    addCategory,
    updateCategory,
    removeCategory,
    addItem,
    updateItem,
    removeItem,
    deleteCategoryFromBackend,
    deleteItemFromBackend,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
