import { Tab } from '../../constants';
import { CategoryForm } from '../CategoryForm';
import { ItemForm } from '../ItemForm';
import type { ActiveTabFormProps } from './types';

export function ActiveTabForm({ activeTab, onDone }: ActiveTabFormProps) {
  if (activeTab === Tab.Item) return <ItemForm onDone={() => onDone(Tab.Item)} />;
  if (activeTab === Tab.Category) return <CategoryForm onDone={() => onDone(Tab.Category)} />;
  return null;
}
