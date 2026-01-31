import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
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

export type InventorySubmitPayload = {
  addedCategories: InventoryCategory[];
  addedItems: InventoryItem[];
  updatedCategories: InventoryCategory[];
  updatedItems: InventoryItem[];
  deletedCategoryIds: string[];
  deletedItemIds: string[];
};

type InventoryContextValue = {
  categories: InventoryCategory[];
  setCategories: React.Dispatch<React.SetStateAction<InventoryCategory[]>>;
  items: InventoryItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  addCategory: (category: Omit<InventoryCategory, "id">) => string;
  updateCategory: (id: string, updates: Partial<InventoryCategory>) => void;
  removeCategory: (id: string) => void;
  removeItem: (id: string) => void;
  deleteCategoryFromBackend: (id: string) => Promise<void>;
  deleteItemFromBackend: (id: string) => Promise<void>;
  addItem: (item: Omit<InventoryItem, "id">) => string;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  revertCategory: (id: string) => void | Promise<void>;
  revertItem: (id: string) => void | Promise<void>;
  resetAll: () => Promise<void>;
  submitInventory: () => Promise<InventorySubmitPayload>;
  submitCategory: (id: string) => void;
  submitItem: (id: string) => void;
  hasPendingChanges: boolean;
  pendingCategoryIds: Set<string>;
  pendingItemIds: Set<string>;
  submittingCategoryIds: Set<string>;
  submittingItemIds: Set<string>;
  recentlySavedCategoryIds: Set<string>;
  recentlySavedItemIds: Set<string>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

const RECENTLY_SAVED_DURATION_MS = 3000;

function emptySet(): Set<string> {
  return new Set();
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [addedCategoryIds, setAddedCategoryIds] = useState<Set<string>>(emptySet);
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(emptySet);
  const [updatedCategoryIds, setUpdatedCategoryIds] = useState<Set<string>>(emptySet);
  const [updatedItemIds, setUpdatedItemIds] = useState<Set<string>>(emptySet);
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<Set<string>>(emptySet);
  const [deletedItemIds, setDeletedItemIds] = useState<Set<string>>(emptySet);
  const [recentlySavedCategoryIds, setRecentlySavedCategoryIds] = useState<Set<string>>(emptySet);
  const [recentlySavedItemIds, setRecentlySavedItemIds] = useState<Set<string>>(emptySet);
  const [submittingCategoryIds, setSubmittingCategoryIds] = useState<Set<string>>(emptySet);
  const [submittingItemIds, setSubmittingItemIds] = useState<Set<string>>(emptySet);
  const savedTimeoutsRef = useRef<{ category: Map<string, ReturnType<typeof setTimeout>>; item: Map<string, ReturnType<typeof setTimeout>> }>({
    category: new Map(),
    item: new Map(),
  });

  useEffect(() => () => {
    savedTimeoutsRef.current.category.forEach((t) => clearTimeout(t));
    savedTimeoutsRef.current.item.forEach((t) => clearTimeout(t));
  }, []);

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

  const hasPendingChanges =
    addedCategoryIds.size > 0 ||
    addedItemIds.size > 0 ||
    updatedCategoryIds.size > 0 ||
    updatedItemIds.size > 0 ||
    deletedCategoryIds.size > 0 ||
    deletedItemIds.size > 0;

  const pendingCategoryIds = new Set([...addedCategoryIds, ...updatedCategoryIds]);
  const pendingItemIds = new Set([...addedItemIds, ...updatedItemIds]);

  const addCategory = useCallback((category: Omit<InventoryCategory, "id">) => {
    const id = crypto.randomUUID();
    setAddedCategoryIds((prev) => new Set(prev).add(id));
    setCategories((prev) =>
      [...prev, { ...category, id }].sort((a, b) => a.name.localeCompare(b.name))
    );
    return id;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<InventoryCategory>) => {
    setUpdatedCategoryIds((prev) =>
      addedCategoryIds.has(id) ? prev : new Set(prev).add(id)
    );
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, [addedCategoryIds]);

  const removeCategory = useCallback(
    (id: string) => {
      const wasAdded = addedCategoryIds.has(id);
      setAddedCategoryIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (!wasAdded) {
        setDeletedCategoryIds((prev) => new Set(prev).add(id));
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const removedItems = items.filter((i) => i.categoryId === id);
      if (removedItems.length > 0) {
        setAddedItemIds((prev) => {
          const next = new Set(prev);
          removedItems.forEach((i) => next.delete(i.id));
          return next;
        });
        setDeletedItemIds((prev) => {
          const next = new Set(prev);
          removedItems.filter((i) => !addedItemIds.has(i.id)).forEach((i) => next.add(i.id));
          return next;
        });
      }
      setItems((prev) => prev.filter((i) => i.categoryId !== id));
    },
    [addedCategoryIds, addedItemIds, items]
  );

  const addItem = useCallback((item: Omit<InventoryItem, "id">) => {
    const id = crypto.randomUUID();
    setAddedItemIds((prev) => new Set(prev).add(id));
    setItems((prev) => [...prev, { ...item, id }]);
    return id;
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<InventoryItem>) => {
      setUpdatedItemIds((prev) =>
        addedItemIds.has(id) ? prev : new Set(prev).add(id)
      );
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );
    },
    [addedItemIds]
  );

  const removeItem = useCallback((id: string) => {
    if (!addedItemIds.has(id)) {
      setDeletedItemIds((prev) => new Set(prev).add(id));
    } else {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, [addedItemIds]);

  const deleteCategoryFromBackend = useCallback(
    (id: string) => {
      const itemIdsInCategory = items.filter((i) => i.categoryId === id).map((i) => i.id);
      return invokeInventory(InventoryIPC.DELETE_CATEGORY, id)
        .then(() => {
          removeCategory(id);
          setDeletedCategoryIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setDeletedItemIds((prev) => {
            const next = new Set(prev);
            itemIdsInCategory.forEach((i) => next.delete(i));
            return next;
          });
        })
        .catch(console.error);
    },
    [items, removeCategory]
  );

  const deleteItemFromBackend = useCallback((id: string) => {
    return invokeInventory(InventoryIPC.DELETE_ITEM, id)
      .then(() => {
        removeItem(id);
        setDeletedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      })
      .catch(console.error);
  }, [removeItem]);

  const revertCategory = useCallback(
    (id: string) => {
      if (addedCategoryIds.has(id)) {
        removeCategory(id);
        return;
      }
      if (!updatedCategoryIds.has(id)) return;
      invokeInventory(InventoryIPC.GET_CATEGORIES)
        .then((data) => {
          const list = Array.isArray(data) ? (data as InventoryCategory[]) : [];
          const saved = list.find((c) => c.id === id);
          if (saved) {
            setCategories((prev) =>
              prev.map((c) => (c.id === id ? saved : c)).sort((a, b) => a.name.localeCompare(b.name))
            );
            setUpdatedCategoryIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }
        })
        .catch(console.error);
    },
    [addedCategoryIds, updatedCategoryIds, removeCategory]
  );

  const revertItem = useCallback(
    (id: string) => {
      if (addedItemIds.has(id)) {
        removeItem(id);
        return;
      }
      if (!updatedItemIds.has(id)) return;
      invokeInventory(InventoryIPC.GET_ITEMS)
        .then((data) => {
          const list = Array.isArray(data) ? (data as InventoryItem[]) : [];
          const saved = list.find((i) => i.id === id);
          if (saved) {
            setItems((prev) => prev.map((i) => (i.id === id ? saved : i)));
            setUpdatedItemIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }
        })
        .catch(console.error);
    },
    [addedItemIds, updatedItemIds, removeItem]
  );

  const resetAll = useCallback(() => {
    return Promise.all([
      invokeInventory(InventoryIPC.GET_CATEGORIES),
      invokeInventory(InventoryIPC.GET_ITEMS),
    ])
      .then(([catsData, itemsData]) => {
        const categoriesList = Array.isArray(catsData) ? (catsData as InventoryCategory[]) : [];
        const itemsList = Array.isArray(itemsData) ? (itemsData as InventoryItem[]) : [];
        setCategories(categoriesList.sort((a, b) => a.name.localeCompare(b.name)));
        setItems(itemsList);
        setAddedCategoryIds(emptySet);
        setAddedItemIds(emptySet);
        setUpdatedCategoryIds(emptySet);
        setUpdatedItemIds(emptySet);
        setDeletedCategoryIds(emptySet);
        setDeletedItemIds(emptySet);
      })
      .catch(console.error);
  }, []);

  const submitInventory = useCallback((): Promise<InventorySubmitPayload> => {
    const addedCategories = categories.filter((c) => addedCategoryIds.has(c.id));
    const addedItems = items.filter((i) => addedItemIds.has(i.id));
    const updatedCategories = categories.filter((c) => updatedCategoryIds.has(c.id));
    const updatedItems = items.filter((i) => updatedItemIds.has(i.id));
    const payload: InventorySubmitPayload = {
      addedCategories,
      addedItems,
      updatedCategories,
      updatedItems,
      deletedCategoryIds: [...deletedCategoryIds],
      deletedItemIds: [...deletedItemIds],
    };
    return invokeInventory(InventoryIPC.SUBMIT, payload)
      .then(() => {
        setAddedCategoryIds(emptySet);
        setAddedItemIds(emptySet);
        setUpdatedCategoryIds(emptySet);
        setUpdatedItemIds(emptySet);
        setDeletedCategoryIds(emptySet);
        setDeletedItemIds(emptySet);
        return payload;
      })
      .catch((err) => {
        console.error("Inventory submit failed:", err);
        throw err;
      });
  }, [
    categories,
    items,
    addedCategoryIds,
    addedItemIds,
    updatedCategoryIds,
    updatedItemIds,
    deletedCategoryIds,
    deletedItemIds,
  ]);

  const submitCategory = useCallback((id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    setSubmittingCategoryIds((prev) => new Set(prev).add(id));
    invokeInventory(InventoryIPC.UPSERT_CATEGORY, category)
      .then(() => {
        flushSync(() => {
          setAddedCategoryIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setUpdatedCategoryIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
        const prevTimeout = savedTimeoutsRef.current.category.get(id);
        if (prevTimeout) clearTimeout(prevTimeout);
        setRecentlySavedCategoryIds((prev) => new Set(prev).add(id));
        const t = setTimeout(() => {
          savedTimeoutsRef.current.category.delete(id);
          setRecentlySavedCategoryIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, RECENTLY_SAVED_DURATION_MS);
        savedTimeoutsRef.current.category.set(id, t);
      })
      .catch(console.error)
      .finally(() => {
        setSubmittingCategoryIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
  }, [categories]);

  const submitItem = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setSubmittingItemIds((prev) => new Set(prev).add(id));
    invokeInventory(InventoryIPC.UPSERT_ITEM, item)
      .then(() => {
        flushSync(() => {
          setAddedItemIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setUpdatedItemIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
        const prevTimeout = savedTimeoutsRef.current.item.get(id);
        if (prevTimeout) clearTimeout(prevTimeout);
        setRecentlySavedItemIds((prev) => new Set(prev).add(id));
        const t = setTimeout(() => {
          savedTimeoutsRef.current.item.delete(id);
          setRecentlySavedItemIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, RECENTLY_SAVED_DURATION_MS);
        savedTimeoutsRef.current.item.set(id, t);
      })
      .catch(console.error)
      .finally(() => {
        setSubmittingItemIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
  }, [items]);

  const value: InventoryContextValue = {
    categories,
    setCategories,
    items,
    setItems,
    addCategory,
    updateCategory,
    removeCategory,
    removeItem,
    deleteCategoryFromBackend,
    deleteItemFromBackend,
    addItem,
    updateItem,
    revertCategory,
    revertItem,
    resetAll,
    submitInventory,
    submitCategory,
    submitItem,
    hasPendingChanges,
    pendingCategoryIds,
    pendingItemIds,
    submittingCategoryIds,
    submittingItemIds,
    recentlySavedCategoryIds,
    recentlySavedItemIds,
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
