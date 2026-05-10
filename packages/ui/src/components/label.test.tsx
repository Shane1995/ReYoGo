import { render } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders without error', () => {
    render(<Label>Name</Label>);
  });
});
