import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { ICON_TRANSITION, SPIN_TRANSITION } from '../../constants';
import type { SyncIconProps } from './types';

export function SyncIcon({ syncing, connected }: SyncIconProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {syncing ? (
        <motion.div
          key="syncing"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={SPIN_TRANSITION}
        >
          <Loader2 className="size-3.5 shrink-0 text-[#20C997]" aria-hidden />
        </motion.div>
      ) : connected ? (
        <motion.div
          key="connected"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={ICON_TRANSITION}
        >
          <Cloud className="size-3.5 shrink-0 text-[#20C997]" aria-hidden />
        </motion.div>
      ) : (
        <motion.div
          key="disconnected"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={ICON_TRANSITION}
        >
          <CloudOff className="size-3.5 shrink-0" aria-hidden />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
