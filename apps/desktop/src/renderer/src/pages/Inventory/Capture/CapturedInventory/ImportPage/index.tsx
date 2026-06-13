import { useState, useCallback, useRef } from 'react';
import { useEntities } from '@/Context/EntityContext';
import { useNavigate } from 'react-router-dom';
import { parseFile, downloadTemplate } from '@/components/CsvImport/parser';
import { enrichParseResult } from '@/components/CsvImport/review';
import type { ReviewResult } from '@/components/CsvImport/review';
import { StockRoutes } from '@/components/AppRoutes/routePaths';
import { useInventory } from '../Context/InventoryContext';
import { ImportHeader } from './components/ImportHeader';
import { IdlePhase } from './components/IdlePhase';
import { LoadingPhase } from './components/LoadingPhase';
import { ErrorPhase } from './components/ErrorPhase';
import { ReviewPhase } from './components/ReviewPhase';
import { loadExistingInventory, commitReview } from './importActions';
import { LOADING_LABEL } from './types';
import type { PageState } from './types';

const FILE_READ_ERROR = 'Could not read the file. Make sure it is a valid .xlsx or .csv file.';
const SAVE_ERROR = 'Something went wrong while saving. Please try again.';

export default function ImportPage() {
  const { entities, selectedEntityId } = useEntities();
  const { categories: existingCats, items: existingItems, addCategory, addItem } = useInventory();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PageState>({ phase: 'idle' });

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) ?? entities[0];

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !selectedEntity) return;
      e.target.value = '';
      setState({ phase: 'loading', label: LOADING_LABEL.ReadingFile });
      try {
        const parsed = await parseFile(file, selectedEntity);
        setState({ phase: 'loading', label: LOADING_LABEL.CheckingDatabase });
        const existing = await loadExistingInventory(existingCats, existingItems);
        const review = enrichParseResult(parsed, existing);
        setState({ phase: 'review', review });
      } catch {
        setState({ phase: 'error', message: FILE_READ_ERROR });
      }
    },
    [existingCats, existingItems, selectedEntity],
  );

  const handleCommit = useCallback(
    async (review: ReviewResult) => {
      setState({ phase: 'loading', label: LOADING_LABEL.SavingToDatabase });
      try {
        await commitReview(review, existingCats, selectedEntityId, addCategory, addItem);
        navigate(StockRoutes.Base);
      } catch (err) {
        console.error('Import commit failed', err);
        setState({ phase: 'error', message: SAVE_ERROR });
      }
    },
    [existingCats, selectedEntityId, addCategory, addItem, navigate],
  );

  const reset = useCallback(() => setState({ phase: 'idle' }), []);
  const chooseFile = useCallback(() => fileRef.current?.click(), []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ImportHeader
        phase={state.phase}
        entityName={selectedEntity?.name}
        onDownloadTemplate={() => downloadTemplate()}
        onChooseDifferentFile={chooseFile}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-2xl px-5 py-5">
          <IdlePhase state={state} onChoose={chooseFile} />
          <LoadingPhase state={state} />
          <ErrorPhase state={state} onRetry={reset} />
          <ReviewPhase state={state} onCommit={handleCommit} onCancel={reset} />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
