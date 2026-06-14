import type { Section } from '../../types';

export type TypeSectionRowsProps = {
  section: Section;
  expandedCats: Set<string>;
  onToggleCat: (key: string) => void;
  onNavigate: (id: string) => void;
};
