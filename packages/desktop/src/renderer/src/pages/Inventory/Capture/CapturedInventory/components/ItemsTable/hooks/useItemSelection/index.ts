import { useState } from "react";

type Props = {
  filteredIds: string[];
  onDelete: (id: string) => void;
};

export function useItemSelection({ filteredIds, onDelete }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someSelected = filteredIds.some((id) => selectedIds.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...filteredIds]));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    for (const id of Array.from(selectedIds)) {
      await onDelete(id);
    }
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  }

  return {
    selectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    allSelected,
    someSelected,
    toggleAll,
    toggleOne,
    handleBulkDelete,
    clearSelection: () => setSelectedIds(new Set()),
  };
}
