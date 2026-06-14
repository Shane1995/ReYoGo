import type { useNavigate } from 'react-router-dom';
import type { ItemGroup } from '../../types';

export type TableViewProps = {
  groups: ItemGroup[];
};

export type ToggleFn = (id: string) => void;
export type NavigateFn = ReturnType<typeof useNavigate>;
