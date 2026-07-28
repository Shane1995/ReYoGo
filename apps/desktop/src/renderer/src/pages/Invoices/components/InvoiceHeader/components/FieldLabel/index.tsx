import { cn } from '@reyogo/ui';
import { FieldReviewBadge } from '../FieldReviewBadge';
import { FIELD_LABEL_CLASS } from '../../constants';
import type { FieldLabelProps } from './types';

export function FieldLabel({ label, reviewMessage }: FieldLabelProps) {
  return (
    <label className={cn(FIELD_LABEL_CLASS, 'flex items-center gap-1')}>
      {label}
      {reviewMessage && <FieldReviewBadge message={reviewMessage} />}
    </label>
  );
}
