import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEntities } from '@/Context/EntityContext';
import { parseFile } from '@/components/CsvImport/parser';
import { enrichParseResult } from '@/components/CsvImport/review';
import type { ReviewResult } from '@/components/CsvImport/review';
import { StockRoutes } from '@/components/AppRoutes/routePaths';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import { useInventory } from '../../../Context/InventoryContext';
import { loadExistingInventory, commitReview } from '../../importActions';
import { getSelectedFile } from '../../utils/getSelectedFile';
import { importSummaryOf } from '../../utils/importSummaryOf';
import { FILE_READ_ERROR, SAVE_ERROR, LOADING_LABEL } from '../../constants';
import type { PageState } from '../../types';

export function useImportPage() {
  const { entities, selectedEntityId } = useEntities();
  const { categories: existingCats, items: existingItems, addCategory, addItem } = useInventory();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PageState>({ phase: 'idle' });

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) ?? entities[0];

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = getSelectedFile(e);
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
        toast.success(importSummaryOf(review));
        navigate(StockRoutes.Base);
      } catch (err) {
        toast.error(ipcErrorMessage(err, SAVE_ERROR));
        setState({ phase: 'error', message: SAVE_ERROR });
      }
    },
    [existingCats, selectedEntityId, addCategory, addItem, navigate],
  );

  const reset = useCallback(() => setState({ phase: 'idle' }), []);
  const chooseFile = useCallback(() => fileRef.current?.click(), []);

  return { state, fileRef, selectedEntity, handleFile, handleCommit, reset, chooseFile };
}
