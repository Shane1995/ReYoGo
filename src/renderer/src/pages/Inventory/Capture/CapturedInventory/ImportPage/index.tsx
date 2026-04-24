import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadIcon, DownloadIcon, FileSpreadsheetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { parseFile, downloadTemplate } from "@/components/CsvImport/parser";
import { enrichParseResult } from "@/components/CsvImport/review";
import type { ReviewResult, ExistingInventory } from "@/components/CsvImport/review";
import { ImportReview } from "@/components/CsvImport/ImportReview";
import { InventoryCaptureRoutes } from "@/components/AppRoutes/routePaths";
import { useInventory } from "../Context/InventoryContext";
import { FormatGuide } from "./FormatGuide";
import { DropZone } from "./DropZone";

type PageState =
  | { phase: "idle" }
  | { phase: "parsing" }
  | { phase: "loading-db" }
  | { phase: "review"; review: ReviewResult }
  | { phase: "saving" }
  | { phase: "error"; message: string };

export default function ImportPage() {
  const { categories: existingCats, items: existingItems, addCategory, addItem } = useInventory();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PageState>({ phase: "idle" });

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setState({ phase: "parsing" });
    try {
      const parsed = await parseFile(file);
      setState({ phase: "loading-db" });
      const units = await window.electronAPI.ipcRenderer.invoke("setup:get-units");
      const existing: ExistingInventory = {
        categoryNames: new Set(existingCats.map((c) => c.name.toLowerCase())),
        itemNames: new Set(existingItems.map((i) => i.name.toLowerCase())),
        unitNames: new Set((units as { name: string }[]).map((u) => u.name.toLowerCase())),
        categoryList: existingCats.map((c) => ({ name: c.name, type: c.type })),
      };
      const review = enrichParseResult(parsed, existing);
      setState({ phase: "review", review });
    } catch {
      setState({ phase: "error", message: "Could not read the file. Make sure it is a valid .xlsx or .csv file." });
    }
  }, [existingCats, existingItems]);

  const handleCommit = useCallback(async (review: ReviewResult) => {
    setState({ phase: "saving" });
    try {
      for (const u of review.units.filter((u) => u.selected && u.status === "new")) {
        await window.electronAPI.ipcRenderer.invoke("setup:upsert-unit", {
          id: crypto.randomUUID(),
          name: u.name,
        });
      }

      const catNameToId = new Map<string, string>(existingCats.map((c) => [c.name.toLowerCase(), c.id]));
      for (const c of review.categories.filter((c) => c.selected && c.status !== "exists")) {
        const id = addCategory({ name: c.name, type: c.type });
        catNameToId.set(c.name.toLowerCase(), id);
      }

      for (const item of review.items.filter((i) => i.selected && i.status === "new")) {
        const catId = catNameToId.get(item.categoryName.toLowerCase());
        if (!catId) continue;
        const cat = [...existingCats, ...review.categories].find(
          (c) => c.name.toLowerCase() === item.categoryName.toLowerCase()
        );
        addItem({
          name: item.name,
          categoryId: catId,
          type: (cat?.type as "food" | "drink" | "non-perishable") ?? "food",
          unitOfMeasure: item.unit as "litres" | "kgs" | "unit" | undefined,
        });
      }

      navigate(InventoryCaptureRoutes.CapturedInventory);
    } catch (err) {
      console.error("Import commit failed", err);
      setState({ phase: "error", message: "Something went wrong while saving. Please try again." });
    }
  }, [existingCats, addCategory, addItem, navigate]);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-5 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheetIcon className="size-5 text-[var(--nav-active-border)] shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Import inventory</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {state.phase === "review"
                  ? "Review what will be added, then click commit."
                  : "Upload an Excel or CSV file to bulk-add units, categories and items."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={async () => {
                const types = await window.electronAPI.ipcRenderer.invoke("setup:get-good-types") as string[];
                downloadTemplate(types);
              }}
            >
              <DownloadIcon className="size-3.5" />
              Template
            </Button>
            {state.phase === "review" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileRef.current?.click()}
              >
                <UploadIcon className="size-3.5" />
                Different file
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-2xl px-5 py-5">
          {state.phase === "idle" && (
            <div className="space-y-4">
              <FormatGuide />
              <DropZone onClick={() => fileRef.current?.click()} />
            </div>
          )}

          {(state.phase === "parsing" || state.phase === "loading-db" || state.phase === "saving") && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-sm text-muted-foreground">
              <Spinner className="size-6" />
              {{
                parsing: "Reading file…",
                "loading-db": "Checking against database…",
                saving: "Saving to database…",
              }[state.phase]}
            </div>
          )}

          {state.phase === "error" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.message}
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                Try again
              </Button>
            </div>
          )}

          {state.phase === "review" && (
            <div>
              <ImportReview
                review={state.review}
                onCommit={handleCommit}
                onCancel={reset}
                commitLabel="Commit to database"
              />
            </div>
          )}
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
