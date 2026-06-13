import type { ReviewResult } from '../review';
import { useImportReviewState } from '../hooks/useImportReviewState';
import { SummaryCards } from './components/SummaryCards';
import { WarningBanner } from './components/WarningBanner';
import { ParseWarnings } from './components/ParseWarnings';
import { UnitsSection } from './components/UnitsSection';
import { CategoriesSection } from './components/CategoriesSection';
import { ItemsSection } from './components/ItemsSection';
import { ImportFooter } from './components/ImportFooter';

export interface ImportReviewProps {
  review: ReviewResult;
  onCommit: (review: ReviewResult) => void;
  onCancel: () => void;
  commitLabel?: string;
}

function unresolvedItemsMessage(count: number): string {
  return `${count} item${count !== 1 ? 's have' : ' has'} a category that wasn't found.`;
}

function typeWarningMessage(count: number): string {
  return `${count} categor${count !== 1 ? 'ies have' : 'y has'} an unrecognised type.`;
}

export function ImportReview({
  review: initial,
  onCommit,
  onCancel,
  commitLabel = 'Commit to database',
}: ImportReviewProps) {
  const {
    units,
    categories,
    items,
    typeWarningCount,
    selectedNew,
    existsCount,
    unresolvedCount,
    fixCategoryType,
    toggleUnit,
    toggleCategory,
    toggleItem,
    assignCategory,
    buildResult,
  } = useImportReviewState(initial);

  return (
    <div className="flex flex-col gap-4">
      <SummaryCards
        selectedNew={selectedNew}
        existsCount={existsCount}
        unresolvedCount={unresolvedCount}
      />

      {unresolvedCount > 0 && (
        <WarningBanner
          message={unresolvedItemsMessage(unresolvedCount)}
          detail="Use the dropdown on each row to assign an existing category, or add the missing categories to your file and re-import."
        />
      )}

      {initial.parseErrors.length > 0 && <ParseWarnings errors={initial.parseErrors} />}

      <UnitsSection units={units} onToggle={toggleUnit} />

      {typeWarningCount > 0 && (
        <WarningBanner
          message={typeWarningMessage(typeWarningCount)}
          detail="Use the dropdown on each row to assign a valid type before committing."
        />
      )}

      <CategoriesSection
        categories={categories}
        onToggle={toggleCategory}
        onFixType={fixCategoryType}
      />

      <ItemsSection
        items={items}
        availableCategories={initial.availableCategories}
        onToggle={toggleItem}
        onAssignCategory={assignCategory}
      />

      <ImportFooter
        selectedNew={selectedNew}
        commitLabel={commitLabel}
        onCommit={() => onCommit(buildResult())}
        onCancel={onCancel}
      />
    </div>
  );
}
