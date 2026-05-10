import { render } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders without error', () => {
    render(<Spinner />);
  });
});
