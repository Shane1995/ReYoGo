import { render } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders without error', () => {
    render(<Input placeholder="Type here" />);
  });
});
