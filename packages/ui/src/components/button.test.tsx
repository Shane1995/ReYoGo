import { render } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders without error', () => {
    render(<Button>Click me</Button>);
  });
});
