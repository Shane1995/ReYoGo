import { downloadTemplate } from '@/components/CsvImport/parser';
import { ImportHeader } from './components/ImportHeader';
import { IdlePhase } from './components/IdlePhase';
import { LoadingPhase } from './components/LoadingPhase';
import { ErrorPhase } from './components/ErrorPhase';
import { ReviewPhase } from './components/ReviewPhase';
import { useImportPage } from './hooks/useImportPage';

export default function ImportPage() {
  const { state, fileRef, selectedEntity, handleFile, handleCommit, reset, chooseFile } =
    useImportPage();

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
