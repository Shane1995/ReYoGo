import { useMemo, useState } from "react";
import { useAnalysisLines } from "../useAnalysisLines";
import { buildItemGroups } from "../../utils/buildItemGroups";
import { TYPE_ORDER } from "../../types";

export type AnalysisTab = "all" | "by-type" | "by-category";

export function useAnalysisData() {
  const { lines, loading } = useAnalysisLines();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("all");

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

  const availableCategories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const g of allGroups) {
      if (g.categoryName && !seen.has(g.categoryName)) {
        seen.set(g.categoryName, g.categoryName);
      }
    }
    return Array.from(seen.keys()).sort();
  }, [allGroups]);

  const groups = useMemo(() => {
    let filtered = allGroups;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
    }
    if (filterType) {
      filtered = filtered.filter((g) => g.categoryType === filterType);
    }
    if (filterCategory) {
      filtered = filtered.filter((g) => g.categoryName === filterCategory);
    }
    return filtered;
  }, [allGroups, search, filterType, filterCategory]);

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setFilterType("");
    setFilterCategory("");
  };

  const hasFilters = !!(search || fromDate || toDate || filterType || filterCategory);

  return {
    lines,
    loading,
    fromDate, setFromDate,
    toDate, setToDate,
    search, setSearch,
    filterType, setFilterType,
    filterCategory, setFilterCategory,
    analysisTab, setAnalysisTab,
    allGroups,
    availableTypes,
    availableCategories,
    groups,
    hasFilters,
    clearFilters,
  };
}
