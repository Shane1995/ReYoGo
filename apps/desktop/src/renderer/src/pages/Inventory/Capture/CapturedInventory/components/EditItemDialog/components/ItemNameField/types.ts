import type { RefObject } from 'react';

export type ItemNameFieldProps = {
  nameRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
};
