import { CogsTotalCard } from '../CogsTotalCard';
import { CogsCategoryTable } from '../CogsCategoryTable';
import type { CogsContentProps } from './types';

export function CogsContent({ cogs }: CogsContentProps) {
  return (
    <>
      <CogsTotalCard cogs={cogs} />
      {cogs && <CogsCategoryTable cogs={cogs} />}
    </>
  );
}
