export const DEFAULT_WIDTH = { expanded: 192, collapsed: 56 };

export const SPRING = { type: 'spring', stiffness: 340, damping: 30 } as const;

export const LABEL_ANIM = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.14, ease: 'easeOut' } },
  exit: { opacity: 0, x: -4, transition: { duration: 0.1, ease: 'easeIn' } },
} as const;
