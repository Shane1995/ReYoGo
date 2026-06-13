import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon } from 'lucide-react';
import { SPRING, LABEL_ANIM } from '../../constants';
import type { CollapseToggleProps } from './types';

export function CollapseToggle({ collapsed, onClick }: CollapseToggleProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.4)] transition-colors hover:bg-[rgba(255,255,255,0.09)] hover:text-[rgba(255,255,255,0.75)]"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={SPRING} className="flex">
        <ChevronRightIcon className="size-3.5" />
      </motion.span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span key="label" {...LABEL_ANIM} className="whitespace-nowrap">
            Collapse
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
