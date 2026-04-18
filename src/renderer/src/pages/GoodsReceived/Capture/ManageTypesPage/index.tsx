import { useState, useCallback, useEffect } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0"
);

export default function ManageTypesPage() {
  const [types, setTypes] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (window.electronAPI.ipcRenderer.invoke('setup:get-good-types') as Promise<string[]>)
      .then(setTypes)
      .catch(console.error);
  }, []);

  const addType = useCallback(() => {
    const name = newName.trim().toLowerCase();
    if (!name) return;
    if (types.includes(name)) return;
    setTypes((prev) => [...prev, name]);
    setNewName("");
    setSaved(false);
  }, [newName, types]);

  const removeType = useCallback((type: string) => {
    setTypes((prev) => prev.filter((t) => t !== type));
    setSaved(false);
  }, []);

  const save = useCallback(async () => {
    if (types.length === 0) return;
    setSaving(true);
    try {
      await (window.electronAPI.ipcRenderer.invoke('setup:set-good-types', types) as Promise<void>);
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [types]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Good types</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure the primary types used to classify inventory categories (e.g. food, drink, non-perishable).
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-6 my-5 max-w-lg">
          <div className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden">
            {types.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                    <TableHead className="font-medium text-foreground">Type name</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type) => (
                    <TableRow key={type} className="border-[var(--nav-border)] hover:bg-muted/30">
                      <TableCell className="py-2 px-3 font-medium">{type}</TableCell>
                      <TableCell className="py-2 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeType(type)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          aria-label={`Remove ${type}`}
                        >
                          <Trash2Icon className="size-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No types configured. Add one below.
              </div>
            )}
            <div className="border-t border-[var(--nav-border)] px-3 py-2.5 bg-muted/10">
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setSaved(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") addType(); }}
                  placeholder="e.g. bakery, alcohol…"
                  className={cn(inputClass, "flex-1")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addType}
                  disabled={!newName.trim()}
                  className="gap-1.5 shrink-0"
                >
                  <PlusIcon className="size-3.5" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {saved && (
              <span className="text-sm text-emerald-600 font-medium">Saved</span>
            )}
            <div className="ml-auto">
              <Button onClick={save} disabled={saving || types.length === 0} size="sm">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
