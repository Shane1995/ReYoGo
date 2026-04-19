import { useState } from "react";
import { ItemGrid } from "../ItemGrid";
import { ItemDetail } from "../ItemDetail";
import type { ItemGroup } from "../types";

export function ChartView({ groups }: { groups: ItemGroup[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedGroup = groups.find((g) => g.itemId === selectedId) ?? null;

  if (selectedId && !selectedGroup) {
    setSelectedId(null);
  }

  if (selectedGroup) {
    return <ItemDetail group={selectedGroup} onBack={() => setSelectedId(null)} />;
  }
  return <ItemGrid groups={groups} onSelect={setSelectedId} />;
}
