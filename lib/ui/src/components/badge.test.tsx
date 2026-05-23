import { render } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders without error', () => {
    render(<Badge>New</Badge>);
  });
});
