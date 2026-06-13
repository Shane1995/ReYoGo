import { PlusIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AddFabProps } from './types';

export function AddFab({ visible, onClick }: AddFabProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          title="Add to inventory"
          onClick={onClick}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-[var(--primary-hover)] transition-colors"
        >
          <PlusIcon className="size-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
