import { PageHeader } from '@reyogo/ui';
import { useAnalysisData } from './hooks/useAnalysisData';
import { AnalysisFilters } from './components/AnalysisFilters';
import { AnalysisTabs } from './components/AnalysisTabs';
import { AnalysisContent } from './components/AnalysisContent';

export default function InventoryAnalysis() {
  const {
    lines,
    loading,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    analysisTab,
    setAnalysisTab,
    availableTypes,
    availableCategories,
    groups,
    hasFilters,
    clearFilters,
  } = useAnalysisData();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Cost Analysis">
        <AnalysisFilters
          search={search}
          filterType={filterType}
          filterCategory={filterCategory}
          fromDate={fromDate}
          toDate={toDate}
          availableTypes={availableTypes}
          availableCategories={availableCategories}
          hasFilters={hasFilters}
          setSearch={setSearch}
          setFilterType={setFilterType}
          setFilterCategory={setFilterCategory}
          setFromDate={setFromDate}
          setToDate={setToDate}
          clearFilters={clearFilters}
        />
      </PageHeader>
      <AnalysisTabs analysisTab={analysisTab} setAnalysisTab={setAnalysisTab} />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <AnalysisContent
          loading={loading}
          lines={lines}
          analysisTab={analysisTab}
          groups={groups}
        />
      </div>
    </div>
  );
}
