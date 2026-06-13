import { useState, useCallback } from 'react';
import { Button } from '@reyogo/ui';
import { ActiveTabForm } from './components/ActiveTabForm';
import { ModalTabBar } from './components/ModalTabBar';
import { Tab } from './constants';
import type { AddInventoryModalProps } from './types';

export function AddInventoryModal({ open, onClose }: AddInventoryModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Item);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDone = useCallback((label: string) => {
    setSuccessMsg(`${label} added`);
    setTimeout(() => setSuccessMsg(null), 2000);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--nav-border)] bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalTabBar activeTab={activeTab} onSelect={setActiveTab} />
        <div className="px-6 py-5">
          {successMsg && (
            <div className="mb-4 rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              {successMsg}
            </div>
          )}
          <ActiveTabForm activeTab={activeTab} onDone={handleDone} />
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
