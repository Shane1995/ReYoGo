import type { CheckboxIconProps } from './types';

export function CheckboxIcon({ checked, indeterminate }: CheckboxIconProps) {
  if (indeterminate) {
    return (
      <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
        <path d="M1 1H9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (!checked) return null;
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path
        d="M1 4L3.5 6.5L9 1"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
