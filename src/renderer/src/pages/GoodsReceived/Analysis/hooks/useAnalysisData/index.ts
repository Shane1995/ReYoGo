import { useEffect, useMemo, useState } from "react";
import { useAnalysisLines } from "../useAnalysisLines";
import { buildItemGroups } from "../../utils/buildItemGroups";
import { TYPE_ORDER } from "../../types";

export function useAnalysisData(initialItemId: string | null) {
  const { lines, loading } = useAnalysisLines();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("all");
  const [view, setView] = useState<"table" | "chart" | "categories">("table");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(initialItemId);

  const allGroups = useMemo(
    () => buildItemGroups(lines, fromDate, toDate),
    [lines, fromDate, toDate]
  );

  const availableTypes = useMemo(() => {
    const seen = new Set(allGroups.map((g) => g.categoryType));
    return TYPE_ORDER.filter((t) => seen.has(t)).concat(
      Array.from(seen).filter((t) => !TYPE_ORDER.includes(t))
    );
  }, [allGroups]);

  useEffect(() => {
    if (activeType !== "all" && !availableTypes.includes(activeType)) {
      setActiveType("all");
    }
  }, [availableTypes, activeType]);

  const groups = useMemo(() => {
    let filtered = activeType === "all"
      ? allGroups
      : allGroups.filter((g) => g.categoryType === activeType);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [allGroups, activeType, search]);

  const searchGroups = useMemo(() => {
    if (!search.trim()) return allGroups;
    const q = search.trim().toLowerCase();
    return allGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [allGroups, search]);

  return {
    lines,
    loading,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    search,
    setSearch,
    activeType,
    setActiveType,
    view,
    setView,
    selectedItemId,
    setSelectedItemId,
    allGroups,
    availableTypes,
    groups,
    searchGroups,
  };
}
