import type { CSSProperties } from 'react';
import type { EntityColor } from './types';

export const ENTITY_COLORS: EntityColor[] = [
  { bg: 'bg-[#20C997]/20', text: 'text-[#20C997]', ring: 'ring-[#20C997]/30' },
  { bg: 'bg-[#0EA5E9]/20', text: 'text-[#0EA5E9]', ring: 'ring-[#0EA5E9]/30' },
  { bg: 'bg-[#FD7E14]/20', text: 'text-[#FD7E14]', ring: 'ring-[#FD7E14]/30' },
  { bg: 'bg-[#E63946]/20', text: 'text-[#E63946]', ring: 'ring-[#E63946]/30' },
  { bg: 'bg-violet-500/20', text: 'text-violet-400', ring: 'ring-violet-500/30' },
];

export const BAR_STYLE: CSSProperties = {
  background: 'rgba(13,17,23,0.92)',
  backdropFilter: 'blur(28px) saturate(200%)',
  boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
};
