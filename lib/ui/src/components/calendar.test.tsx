import { render } from '@testing-library/react';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders without error', () => {
    render(<Calendar mode="single" />);
  });
});
