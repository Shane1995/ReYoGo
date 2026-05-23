import { render } from '@testing-library/react';
import { DatePicker } from './date-picker';

describe('DatePicker', () => {
  it('renders without error', () => {
    render(<DatePicker value="" onChange={() => {}} />);
  });
});
